// initiate the map

var map = new maplibregl.Map({
  container: 'map',
  style: 'https://api.maptiler.com/maps/d29b0278-3b07-44ae-bb17-0a7b138f7313/style.json?key=LVXocV2Y6nX6vEqq67iz',
  center: [8.547603,47.047786],
  zoom: 16,
  attributionControl: false
});

// scroll controls
map.scrollZoom.enable();
map.dragPan.enable();
map.doubleClickZoom.enable();

// sets current layer as being vector map, for satellite toggle layer function
currentLayer = 1

// add a geocoder
var geocoder_api = {
  forwardGeocode: async (config) => {
    const features = [];
    try {
      let request =
        'https://nominatim.openstreetmap.org/search?q=' +
        config.query +
        '&format=geojson&polygon_geojson=1&addressdetails=1';
      const response = await fetch(request);
      const geojson = await response.json();
      for (let feature of geojson.features) {
        let center = [
          feature.bbox[0] +
          (feature.bbox[2] - feature.bbox[0]) / 2,
          feature.bbox[1] +
          (feature.bbox[3] - feature.bbox[1]) / 2
        ];
        let point = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: center
          },
          place_name: feature.properties.display_name,
          properties: feature.properties,
          text: feature.properties.display_name,
          place_type: ['place'],
          center: center
        };
        features.push(point);
      }
    } catch (e) {
      console.error(`Failed to forwardGeocode with error: ${e}`);
    }

    return {
      features: features
    };
  }
};

map.addControl(
  new MaplibreGeocoder(geocoder_api, {
    maplibregl: maplibregl
  })
);

// add geolocator to zoom to user location
map.addControl(new maplibregl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true
}),'bottom-right');

// define satellite image layer
var satelliteStyle = {
    version: 8,
    sources: {
        'raster-tiles': {
            type: 'raster',
            tiles: [
                'https://ecn.t0.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z',
                'https://ecn.t1.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z',
                'https://ecn.t2.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z',
                'https://ecn.t3.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z',
            ],
        },
    },
    layers: [
        {
            id: 'simple-tiles',
            type: 'raster',
            source: 'raster-tiles',
            minzoom: 0,
            maxzoom: 22,
        },
    ],
}

// circle that will represent the currently clicked image 

var largerCircleMarker = {
  id: 'larger-circle-marker',
  type: 'circle',
  paint: {
    'circle-color': '#FFFF33',
    'circle-opacity': 0.8,
    'circle-radius': 12
  }
};

function fetchImages() {
      // get the current map bounds
      var bounds = map.getBounds();
  
      // make your API request with the new bounds
      var url = 'https://ojtbr3cb0k.execute-api.us-east-1.amazonaws.com/images/images?bbox=' + bounds.toArray().join(',');
      
      // example fetch call 
      fetch(url)
      .then(response => response.json())
      .then(data => {
        if(map.getLayer('images')) {
          map.removeLayer('images');
        }
        if(map.getSource('image-data')) {
          map.removeSource('image-data');
        }
        map.addSource('image-data', {
          type: 'geojson',
          data: data
        });
        map.addLayer({
          id: 'images',
          type: 'circle',
          source: 'image-data',
          paint: {
            'circle-color': '#EDA3B5',
            'circle-radius': 6,
            'circle-stroke-color': '#FDD262',
            'circle-stroke-width': 2,
            'circle-opacity': 0.8
          }
        });
      });
}

// view cone generator

const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;
var activeMarkers = []

function makeArc(fov) {
  const radius = 45;
  const centerX = 50;
  const centerY = 50;

  const fovRad = DEG2RAD * fov;

  const arcStart = -Math.PI / 2 - fovRad / 2;
  const arcEnd = arcStart + fovRad;

  const startX = centerX + radius * Math.cos(arcStart);
  const startY = centerY + radius * Math.sin(arcStart);

  const endX = centerX + radius * Math.cos(arcEnd);
  const endY = centerY + radius * Math.sin(arcEnd);

  const center = `M ${centerX} ${centerY}`;
  const line = `L ${startX} ${startY}`;
  const arc = `A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;

  return `${center} ${line} ${arc} Z`;
}

function makeCamera(bearing, fov) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  path.setAttribute('d', makeArc(fov));
  path.setAttribute('fill', '#FDD262');
  path.setAttribute('fill-opacity', '0.5');
  path.setAttribute('stroke', '#FDD262');
  path.setAttribute('stroke-width', '1');
  path.setAttribute('stroke-linejoin', 'round');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.appendChild(path);

  svg.style.height = '100%';
  svg.style.width = '100%';
  svg.style.transform = rotateArc(bearing);

  const container = document.createElement('div');
  container.style.height = '100px';
  container.style.width = '100px';
  container.appendChild(svg);

  return container;
}

function rotateArc(bearing) {
  return `rotateZ(${bearing}deg)`;
}

function setCamera(image) {
  try {
    activeMarkers[0].remove();
    activeMarkers = [];
  }
  catch(err) {
    console.log('no markers on map')
  }
  const camera = makeCamera(image['properties']['compass_angle'], 70);
  const cameraMarker = new maplibregl.Marker({
    color: '#FDD262',
    element: camera,
    rotationAlignment: 'map',
  });
  const pos = [image['geometry']['coordinates'][0], image['geometry']['coordinates'][1]];
  cameraMarker.setLngLat(pos);
  activeMarkers.push(cameraMarker);
  activeMarkers[0].addTo(map);
}

// Clear the div where the image and table will go
function clearDetails() {
  var detailsDiv = document.getElementById('details');
  detailsDiv.innerHTML = '';
}

// Display details for a clicked feature
function displayDetails(feature) {
  // Get the image URL from the properties of the feature
  var imageUrl = feature.properties.image_url;

  // Create an image element and set its source to the image URL,
  // set its width to 90% of the div width, and append it to the div
  var detailsDiv = document.getElementById('details');
  var img = document.createElement('img');
  img.setAttribute('id', 'fotoshi-image');
  img.src = imageUrl;
  img.style.width = '90%';
  detailsDiv.appendChild(img);

  // Create a table element and a tbody element to hold the rows
  var table = document.createElement('table');
  table.setAttribute('id', 'image-attributes');
  var tbody = document.createElement('tbody');

  // Loop through the properties of the feature and create a row for each one
  for (var key in feature.properties) {
    if (key !== 'image_url') {
      var tr = document.createElement('tr');
      var th = document.createElement('th');
      var td = document.createElement('td');
      th.textContent = key;
      td.textContent = feature.properties[key];
      tr.appendChild(th);
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
  }

  // Append the tbody to the table and the table to the div
  table.appendChild(tbody);
  detailsDiv.appendChild(table);
}


// inside this on load function, we have active listening functions, which happen when some condition is met
// anything outside this function is static, so cannot actively listen for an event
map.on('load', function () {

  //get initial view of all images in the view port
  fetchImages();

  // get map coordinates on click anywhere
  map.on('click', function (e) {
    coords = e.lngLat;
    console.log(coords)
  });

  // query the images layer on click
  map.on('click', 'images', (e) => {
    // Get the properties of the clicked circle
    var image = e.features[0];
    // Load the feature's properties into the side div
    clearDetails();
    displayDetails(image);
    setCamera(image);
  });
  

  // switch satellite and map layer on click
  $('#layer-toggle').on('click', function(){
    console.log('test');
    if (currentLayer == 1){
      map.setStyle(satelliteStyle);
      $('#attribution').empty().html('<a style="color:white;background-color:black" href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> Bing © 2021 Microsoft Corporation');
      currentLayer = 0;
      console.log('switch layer');
    }
    else if (currentLayer == 0){
      map.setStyle('https://api.maptiler.com/maps/d29b0278-3b07-44ae-bb17-0a7b138f7313/style.json?key=LVXocV2Y6nX6vEqq67iz');
      $('#attribution').empty().html('<a style="color:white;background-color:black" href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a style="color:white;background-color:black" href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>');
      currentLayer = 1;
      console.log('Switch to other layer');
    }
  })

  // sense when the map moves and request data

  map.on('moveend', fetchImages);

})