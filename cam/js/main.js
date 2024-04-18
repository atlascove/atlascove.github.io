/*

>> kasperkamperman.com - 2018-04-18
>> kasperkamperman.com - 2020-05-17
>> https://www.kasperkamperman.com/blog/camera-template/

*/

var takeSnapshotUI = createClickFeedbackUI();

var video;
var takePhotoButton;
var toggleFullScreenButton;
var switchCameraButton;
var amountOfCameras = 0;
var currentHeading = 0;
var currentFacingMode = 'environment';

// this function counts the amount of video inputs
// it replaces DetectRTC that was previously implemented.
function deviceCount() {
  return new Promise(function (resolve) {
    var videoInCount = 0;

    navigator.mediaDevices
      .enumerateDevices()
      .then(function (devices) {
        devices.forEach(function (device) {
          if (device.kind === 'video') {
            device.kind = 'videoinput';
          }

          if (device.kind === 'videoinput') {
            videoInCount++;
            console.log('videocam: ' + device.label);
          }
        });

        resolve(videoInCount);
      })
      .catch(function (err) {
        console.log(err.name + ': ' + err.message);
        resolve(0);
      });
  });
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


function checkHeading(){
  navigator.geolocation.getCurrentPosition(
    function(position){
      console.log(position)
      heading = position.coords.heading;
      console.log("CURRENT HEADING")
      console.log(heading)
      console.log(position)
      currentHeading = heading;
      //map.setBearing(heading);
      }
  );
}

document.addEventListener('DOMContentLoaded', function (event) {


  // check if mediaDevices is supported
  if (
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    navigator.mediaDevices.enumerateDevices
  ) {
    // first we call getUserMedia to trigger permissions
    // we need this before deviceCount, otherwise Safari doesn't return all the cameras
    // we need to have the number in order to display the switch front/back button
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: true,
      })
      .then(function (stream) {
        stream.getTracks().forEach(function (track) {
          track.stop();
        });

        deviceCount().then(function (deviceCount) {
          amountOfCameras = deviceCount;

          // init the UI and the camera stream
          initCameraUI();
          initCameraStream();
        });
      })
      .catch(function (error) {
        //https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        if (error === 'PermissionDeniedError') {
          alert('Permission denied. Please refresh and give permission.');
        }

        console.error('getUserMedia() error: ', error);
      });
  } else {
    alert(
      'Mobile camera is not supported by browser, or there is no camera detected/connected',
    );
  }
});
var modal = document.getElementById("dataSelector");
var tagModal = document.getElementById("tagSelector");
var span = document.getElementsByClassName("close")[0];
var span2 = document.getElementsByClassName("close2")[0];
var submit_button= document.getElementById("submit_button");

submit_button.onclick = function() {
  if (mapactive == 1){
    modal.style.display = "block";
    addLink();
    getOSMData();
  }
  if (mapactive == 0 && somethingSelected == 1){
    var text = createMetaData();
    upload(currentImage,currentJSON);
    mapactive = 1;
    somethingSelected = 0;
  }
  if (mapactive == 0 && somethingSelected == 0){
    alert('Select matching data or add new note!');
  }
}

$('#layer_toggle').on('click', function(){
  console.log('test');
  if (currentLayer == 1){
    map.setStyle(satelliteStyle);
    $('#attribution').empty().html('<a style="color:white;background-color:black" href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> Bing © 2021 Microsoft Corporation');
    currentLayer = 0;
    console.log('switch layer');
  }
  else if (currentLayer == 0){
    map.setStyle('https://api.maptiler.com/maps/streets/style.json?key=LVXocV2Y6nX6vEqq67iz');
    $('#attribution').empty().html('<a style="color:white;background-color:black" href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a style="color:white;background-color:black" href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>');
    currentLayer = 1;
    console.log('Switch to other layer');
  }
})

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
  $("#linktable").empty();
  somethingSelected = 0;
  mapactive = 1;
}

span2.onclick = function() {
  tagModal.style.display = "none";
}

$('#add').click(function(){
  tagModal.style.display = "block";
})

$('#save').click(function(){
  txt = $('#tagname').val();
  currentTag = 'null';
  currentNote = txt;
  tagModal.style.display = "none";
  somethingSelected = 1;
  currentOSMID = '-1';
  $('td').css('background-color','white');
  $('td').css('color','black');
  var row = '<tr><td class="tag" id="-1" style="background-color:#a2e8c4;color:white;">' + txt + '</td></tr>';
  $('#linktable').prepend(row);
})

$("#linktable").on("click", "td", function() {
    currentOSMID = $( this ).attr('id');
    if (currentOSMID != '-1'){
      currentTag = $( this ).text();
      var id = $( this ).attr('id');
      console.log('selecting...');
      console.log(currentData[id]);
      getOSMGeom(id,currentData[id]['type']);
      currentNote = 'none';
    } else {
      currentTag = 'none';
      currentNote = $( this ).text();
    }
    somethingSelected = 1;
    $('td').css('background-color','white');
    $( this ).css('background-color','#a2e8c4');
    $('td').css('color','black');
    $( this ).css('color','white');
});

function initCameraUI() {
  video = document.getElementById('video');

  takePhotoButton = document.getElementById('takePhotoButton');
  submit_button = document.getElementById('submit_button');
  layer_toggle = document.getElementById('layer_toggle');

  // https://developer.mozilla.org/nl/docs/Web/HTML/Element/button
  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_button_role

  takePhotoButton.addEventListener('click', function () {
    checkHeading();
    takeSnapshotUI();
    takeSnapshot();
    openMap();
    locate();
    closeControls();
    closeVideo();
    showImage();
    addMarker();
  });


  // -- fullscreen part

  // Listen for orientation changes to make sure buttons stay at the side of the
  // physical (and virtual) buttons (opposite of camera) most of the layout change is done by CSS media queries
  // https://www.sitepoint.com/introducing-screen-orientation-api/
  // https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation
  window.addEventListener(
    'orientationchange',
    function () {
      // iOS doesn't have screen.orientation, so fallback to window.orientation.
      // screen.orientation will
      if (screen.orientation) angle = screen.orientation.angle;
      else angle = window.orientation;

      var guiControls = document.getElementById('gui_controls').classList;
      var vidContainer = document.getElementById('vid_container').classList;

      if (angle == 270 || angle == -90) {
        guiControls.add('left');
        vidContainer.add('left');
      } else {
        if (guiControls.contains('left')) guiControls.remove('left');
        if (vidContainer.contains('left')) vidContainer.remove('left');
      }

      //0   portrait-primary
      //180 portrait-secondary device is down under
      //90  landscape-primary  buttons at the right
      //270 landscape-secondary buttons at the left
    },
    false,
  );
}

// https://github.com/webrtc/samples/blob/gh-pages/src/content/devices/input-output/js/main.js
function initCameraStream() {
  // stop any active streams in the window
  if (window.stream) {
    window.stream.getTracks().forEach(function (track) {
      console.log(track);
      track.stop();
    });
  }

  // we ask for a square resolution, it will cropped on top (landscape)
  // or cropped at the sides (landscape)
  var size = 1280;

  var constraints = {
    audio: false,
    video: {
      width: { ideal: size },
      height: { ideal: size },
      //width: { min: 1024, ideal: window.innerWidth, max: 1920 },
      //height: { min: 776, ideal: window.innerHeight, max: 1080 },
      facingMode: currentFacingMode,
    },
  };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(handleSuccess)
    .catch(handleError);

  function handleSuccess(stream) {
    window.stream = stream; // make stream available to browser console
    video.srcObject = stream;

    const track = window.stream.getVideoTracks()[0];
    const settings = track.getSettings();
    str = JSON.stringify(settings, null, 4);
    console.log('settings ' + str);
  }

  function handleError(error) {
    console.error('getUserMedia() error: ', error);
  }
}

function takeSnapshot() {
  // if you'd like to show the canvas add it to the DOM
  var canvas = document.createElement('canvas');

  var width = video.videoWidth;
  var height = video.videoHeight;

  canvas.width = width;
  canvas.height = height;

  context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, width, height);

  // polyfil if needed https://github.com/blueimp/JavaScript-Canvas-to-Blob

  // https://developers.google.com/web/fundamentals/primers/promises
  // https://stackoverflow.com/questions/42458849/access-blob-value-outside-of-canvas-toblob-async-function
  function getCanvasBlob(canvas) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        resolve(blob);
      }, 'image/png');
    });
  }

  // some API's (like Azure Custom Vision) need a blob with image data
  getCanvasBlob(canvas).then(function (blob) {
    var image = new Image();
    image.src = URL.createObjectURL(blob);
    console.log(blob);
    image.style = "height: 100%; width:auto; display: block;"
    $('#vid_container').prepend(image);

    currentImage = blob;
  });
}

// https://hackernoon.com/how-to-use-javascript-closures-with-confidence-85cd1f841a6b
// closure; store this in a variable and call the variable as function
// eg. var takeSnapshotUI = createClickFeedbackUI();
// takeSnapshotUI();

function createClickFeedbackUI() {
  // in order to give feedback that we actually pressed a button.
  // we trigger a almost black overlay
  var overlay = document.getElementById('video_overlay'); //.style.display;

  // sound feedback
  var sndClick = new Howl({ src: ['snd/click.mp3'] });

  var overlayVisibility = false;
  var timeOut = 80;

  function setFalseAgain() {
    overlayVisibility = false;
    overlay.style.display = 'none';
  }

  return function () {
    if (overlayVisibility == false) {
      sndClick.play();
      overlayVisibility = true;
      overlay.style.display = 'block';
      setTimeout(setFalseAgain, timeOut);
    }
  };
}
