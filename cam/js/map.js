var style = {
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

marker1 = new maplibregl.Marker({ color: 'blue', draggable: true })
var marker2 = new maplibregl.Marker({ color: 'red', draggable: true }) // ignore this one, not used
var map = new maplibregl.Map({
     container: 'map',
     style: style,
     center: [0, 0],
     zoom: 19
});

function locate(){
  if (navigator.geolocation) { //check if geolocation is available
    console.log('getting user location...');
    navigator.geolocation.getCurrentPosition(function(position){
      // do nothing
    });
  } else {
    alert('USER LOCATION NOT AVAILABLE');
  }
}

function addMarker(){
  if (navigator.geolocation) { //check if geolocation is available
      navigator.geolocation.getCurrentPosition(function(position){
        try {
          marker1.remove()
        } catch (err){
          // do nothing
        }
        marker1 = new maplibregl.Marker({ color: 'blue', draggable: true })
        .setLngLat([position.coords.longitude,position.coords.latitude])
        .addTo(map);
        originalCoords = [position.coords.longitude,position.coords.latitude];
        map.jumpTo({
          center: [position.coords.longitude,position.coords.latitude], zoom: 19
        });
      });
  }
}

function addLinkOLD(coords){
  try {
    marker2.remove()
    console.log('removing second marker');
  } catch (err){
    // do nothing
  }
  marker2 = new maplibregl.Marker({ color: 'red', draggable: true })
  .setLngLat(coords)
  .addTo(map);
  console.log(coords);
}

function addLink(){
    var coords = map.getCenter();
    currentCenter = coords;
    console.log(coords);
    mapactive = 0;
}

map.on('load', function () {
  setInterval(locate, 2000);
  map.on('click', function (e) {
    coords =e.lngLat;
  });
  // every few seconds relocate users

})
