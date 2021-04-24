var currentTag;
var currentCenter;
var mapactive = 1;
var somethingSelected = 0;
var currentImage;
var currentJSON;

function openMap(){
 $('#map').css('height', '40%');
 $('#gui_controls').css('height','0%');
 $('#submit_button').show();
}

function showImage(){
 $('#vid_container').css('height','60%');
}

function closeControls(){
  $('#takePhotoButton').hide();
  $('gui_controls').hide();
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
  var output_data = { "type": "FeatureCollection", "features": [ { "type": "Feature", "properties": {
    "target": [target.lng,target.lat],
    "timestamp": timestamp,
    "epoch" : epoch,
    "tag" : tag
    },
    "geometry": { "type": "Point", "coordinates": [observer.lng,observer.lat] } } ]
  }
  var obj = {
    "observer": [observer.lng,observer.lat],
    "target": [target.lng,target.lat],
    "timestamp": timestamp,
    "epoch" : epoch,
    "tag" : tag
  }
  currentJSON = output_data;
  console.log(obj);
}

function getOSMData(){
  $('#linktable').empty();
  var coords = currentCenter;
  var bbox = turf.bbox(turf.buffer(turf.point([coords.lng,coords.lat]),10, {units: 'meters'}))
  var url = 'https://api.openstreetmap.org/api/0.6/map.json?bbox=' + bbox.toString();
  console.log(url);
  $.getJSON(url, function (data) {
    console.log(data);
    for(e=0; e < data['elements'].length; e++){
      var el = data['elements'][e]
      if(el.hasOwnProperty('tags')){
        console.log(el['tags']);
        var row = '<tr><td class="tag">' + JSON.stringify(el['tags']) + '</td></tr>';
        $('#linktable').append(row);
      }
    }
  });
}

function upload2(img,json){
  var hash = Math.random().toString(36).substring(2);
  var url = 'https://atlascove.blob.core.windows.net/images/' + hash + '.png?sp=racwdl&st=2021-04-24T19:54:54Z&se=2022-04-25T03:54:54Z&spr=https&sv=2020-02-10&sr=c&sig=nwILb9g1i%2BOB415atZOAfjTOY8KCmfzOLPg46Ut7aXQ%3D'
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
  var url2 = 'https://atlascove.blob.core.windows.net/images/' + hash + '.geojson??sp=racwdl&st=2021-04-24T19:54:54Z&se=2022-04-25T03:54:54Z&spr=https&sv=2020-02-10&sr=c&sig=nwILb9g1i%2BOB415atZOAfjTOY8KCmfzOLPg46Ut7aXQ%3D'
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
  var dbx = new Dropbox({ accessToken: 'sl.Avm4dFPH30V5b3_NWlJlSThYW7AXcc7VxYZMUGZj6xwuWFncEClx7SoVZhDCRenh2cNgrsq2eRq_e3jFeqtNN6PgNhn-N83-r33kaTpykL0C7ucGH2TgAn0djPjt6BVCptPxOYk' });
  var hash = Math.random().toString(36).substring(2);
  dbx.filesUpload({path: '/' + hash + '.png', contents: img})
  .then(function(response) {
    console.log(response);
  })
  .catch(function(error) {
    console.error(error);
  });
  dbx.filesUpload({path: '/' + hash + '.geojson', contents: json})
  .then(function(response) {
    console.log(response);
  })
  .catch(function(error) {
    console.error(error);
  });
}
