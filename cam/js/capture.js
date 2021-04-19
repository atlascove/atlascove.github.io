var currentTag;

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
  var target = marker2.getLngLat();
  var timestamp = new Date();
  var epoch = timestamp.getTime() / 1000
  var tag = currentTag;
  var obj = {
    "observer": [observer.lng,observer.lat],
    "target": [target.lng,target.lat],
    "timestamp": timestamp,
    "epoch" : epoch,
    "tag" : tag
  }
  console.log(obj);
}

function getOSMData(){
  $('#linktable').empty();
  var coords = marker2.getLngLat();
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
