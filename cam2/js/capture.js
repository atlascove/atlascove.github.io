var currentTag;
var currentCenter;
var currentNote;
var mapactive = 1;
var somethingSelected = 0;
var currentImage;
var currentJSON;
var originalCoords;
var currentOSMID;
var currentLayer = 1;
var currentData = {};

function openMap(){
 $('#map').css('height', '40vh');
 $('#gui_controls').css('height','0%');
 $('#attribution').css('display', 'block');
}

function showImage(){
 $('#vid_container').css('height','60%');
}

function closeControls(){
  $('#takePhotoButton').hide();
}

function closeVideo(){
  $('#video_overlay').hide();
  $('#video').hide();
}

function createMetaData(){
  var observer = marker1.getLngLat();
  var target = currentCenter;
  var timestamp = new Date();
  var epoch = timestamp.getTime() / 1000
  var tag = currentTag;
  var hash = timestamp.toString(16);
  var output_data = {
    "type": "Feature",
      "properties": {
        "id": hash,
        "relation": "views",
        "object" : currentOSMID.toString(),
        "username" : "default_user",
        "tags_primary" : tag,
        "tags_secondary": tag,
        "timestamp": timestamp,
        "camera_params": {
          "make": "Google",
          "model": "Pixel 5a",
          "focal_length": 25,
          "horizonal_angle" : 72,
          "compass_angle": currentHeading
        },
        "target_coords": [
          target.lng,
          target.lat
        ]
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          observer.lng,observer.lat
        ]
      }
    }
  var obj = {
    "observer": [observer.lng,observer.lat],
    "target": [target.lng,target.lat],
    "timestamp": timestamp,
    "epoch" : epoch,
    "tag" : tag
  }
  currentJSON = output_data;
}

function getOSMGeom(osmid,type){
  var url = 'https://overpass-api.de/api/interpreter?data=[out:json];' + type + '(' + osmid + ');convert item ::=::,::geom=geom(),_osm_type=type();out geom;';
  $.getJSON(url, function (data) {
    console.log(data);
    try {
      map.removeLayer('selected');
      map.removeSource('selected');
    } catch(err) {
      // do nothing
    }
    map.addSource('selected', {
      'type': 'geojson',
      'data': {
        'type': 'Feature',
        'geometry': data['elements'][0]['geometry']
      }
    });
    if(type == 'way'){
      map.addLayer({
        'id': 'selected',
        'type': 'line',
        'source': 'selected',
        'paint': {
          'line-color': 'red',
          'line-width': 3
        }
      });
    }
    if(type == 'node'){
      map.addLayer({
        'id': 'selected',
        'type': 'circle',
        'source': 'selected',
        'paint': {
          'circle-color': 'red'
        }
      });
    }
  })
}



function getOSMData(){
  $('#linktable').empty();
  currentData = {};
  var coords = currentCenter;
  var bbox = turf.bbox(turf.buffer(turf.point([coords.lng,coords.lat]),15, {units: 'meters'}))
  var url = 'https://api.openstreetmap.org/api/0.6/map.json?bbox=' + bbox.toString();
  console.log(url);
  $.getJSON(url, function (data) {
    console.log(data);
    for(e=0; e < data['elements'].length; e++){
      var el = data['elements'][e]
      if(el.hasOwnProperty('tags') && el['type'] !== 'relation'){
        currentData[el['id']] = el;
        console.log(el);
        var row = '<tr><td class="tag" id="'+ el['id'] + '">' + JSON.stringify(el['tags']) + '</td></tr>';
        $('#linktable').append(row);
      }
    }
    if (data['elements'].length == 0){
        var row = '<tr><td>Tap blue to add note: no OSM tags found</td>';
        $('#linktable').append(row);
    }
  });
}

function updateWorld(obj){
  var dbx = new Dropbox.Dropbox({ accessToken: 'vmLipsZvDEMAAAAAAAAAAdxF-uncM-lEPVDrE-hJzGcVg-ljIlFLPGl-QUNCpqXJ' });
  dbx.sharingGetSharedLinkFile({url: 'https://www.dropbox.com/s/35s2yx3qnmcy8ks/world.geojson?dl=0'})
    .then(function(data) {
      var downloadUrl = URL.createObjectURL(data.fileBlob);
      $.ajax({
          type: 'GET',
          url: downloadUrl
      }).done(function(data) {
        jdata = JSON.parse(data);
        jdata['features'].push(obj)
        dbx.filesUpload({ path: '/atlascove/world.geojson', contents: JSON.stringify(jdata), mode:'overwrite' })
        .then(function(response) {
          console.log(response);
        })
        .catch(function(error) {
          console.error(error);
        });
    })
    .catch(function(error) {
      console.error(error);
    });
    return false;
  })
}

function upload2(img,json){
  var hash = JSON.parse(json)['properties']['id'];
  var current = new Date();
  var cDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();
  var url = 'https://atlascove.blob.core.windows.net/images/image_' + hash + '_' + cDate + '.png?sp=racwdl&st=2021-04-24T19:54:54Z&se=2022-04-25T03:54:54Z&spr=https&sv=2020-02-10&sr=c&sig=nwILb9g1i%2BOB415atZOAfjTOY8KCmfzOLPg46Ut7aXQ%3D';
  $.ajax({
      type: 'PUT',
      url: url,
      data: img,
      processData: false,
      contentType: false,
      headers: {"Content-Type": "image/png", "x-ms-blob-type": "BlockBlob" }
  }).done(function(data, xhr) {
         console.log(data);
         var status = xhr.status;
         console.log(status);
  });
  var url2 = 'https://atlascove.blob.core.windows.net/images/data_' + hash + '_' + cDate + '.json??sp=racwdl&st=2021-04-24T19:54:54Z&se=2022-04-25T03:54:54Z&spr=https&sv=2020-02-10&sr=c&sig=nwILb9g1i%2BOB415atZOAfjTOY8KCmfzOLPg46Ut7aXQ%3D'
  $.ajax({
      type: 'PUT',
      url: url2,
      data: JSON.stringify(json),
      processData: false,
      contentType: false,
      headers: {"Content-Type": "application/json; charset=UTF-8", "x-ms-blob-type": "BlockBlob" }
  }).done(function(data, xhr) {
         console.log(data);
         var status = xhr.status;
         console.log(status);
  });
}

function upload(img,json){
  console.log(JSON.stringify(json))
  console.log(json)
  var hash = json['properties']['id'];
  var current = new Date();
  var cDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();
  var dbx = new Dropbox.Dropbox({ accessToken: 'vmLipsZvDEMAAAAAAAAAAdxF-uncM-lEPVDrE-hJzGcVg-ljIlFLPGl-QUNCpqXJ' });
  var f = json;
  //updateWorld(f);
  $('.modal-content').empty().append('<h2>Uploading...</h2>');
  $('#submit_button').hide();
  dbx.filesUpload({path: '/atlascove/image_'  + hash + '_' + cDate + '.png', contents: img})
  .then(function(response) {
    alert('Done!');
    setTimeout("location.reload(true);", 200);
    centering = 1;
    map.dragPan.disable();
    $("#view").show();
    $("#local").show();
    editing = 0;
    map.setPitch(70);
    $('#submit_button').hide();
    console.log(response);
    $('map').css('opacity','0.8');
  })
  .catch(function(error) {
    console.error(error);
  });
  dbx.filesUpload({path: '/atlascove/data_'  + hash + '_' + cDate +  '.json', contents: JSON.stringify(json)})
  .then(function(response) {
    console.log(response);
  })
  .catch(function(error) {
    console.error(error);
  });
}
