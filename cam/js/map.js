var map = new maplibregl.Map({
     container: 'map',
     style: 'https://api.maptiler.com/maps/streets/style.json?key=LVXocV2Y6nX6vEqq67iz',
     center: [0, 0],
     zoom: 22
});

if (navigator.geolocation) { //check if geolocation is available
    navigator.geolocation.getCurrentPosition(function(position){
      console.log(position.coords);
      console.log(position.coords.latitude);
      map.flyTo({
        center: [position.coords.longitude,position.coords.latitude],
        zoom: 22
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
        var marker1 = new maplibregl.Marker({ color: 'blue'})
        .setLngLat([position.coords.longitude,position.coords.latitude])
        .addTo(map);
        map.flyTo({
          center: [position.coords.longitude,position.coords.latitude]
        });
      });
  }
}

function addLink(coords){
  try {
    marker2.remove()
  } catch (err){
    // do nothing
  }
  var marker2 = new maplibregl.Marker({ color: 'red'})
  .setLngLat(coords)
  .addTo(map);
}

map.on('load', function () {
  map.on('click', function (e) {
    coords =e.lngLat;
    addLink(coords);
    });
})
