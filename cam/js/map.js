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

var marker1 = new maplibregl.Marker({ color: 'blue', draggable: false })
var marker2 = new maplibregl.Marker({ color: 'red', draggable: true })
var map = new maplibregl.Map({
     container: 'map',
     style: style,
     center: [0, 0],
     zoom: 22
});

if (navigator.geolocation) { //check if geolocation is available
    navigator.geolocation.getCurrentPosition(function(position){
      console.log(position.coords);
      console.log(position.coords.latitude);
      map.jumpTo({
        center: [position.coords.longitude,position.coords.latitude],
        zoom: 21
      });
    });
}


function addMarker(){
  if (navigator.geolocation) { //check if geolocation is available
      navigator.geolocation.getCurrentPosition(function(position){
        try {
          marker1.remove()
        } catch (err){
          // do nothing
        }
        marker1 = new maplibregl.Marker({ color: 'blue', draggable: false })
        .setLngLat([position.coords.longitude,position.coords.latitude])
        .addTo(map);
        map.jumpTo({
          center: [position.coords.longitude,position.coords.latitude], zoom: 21
        });
      });
  }
}

function addLink(coords){
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

map.on('load', function () {
  map.on('click', function (e) {
    coords =e.lngLat;
    addLink(coords);
  });
})
