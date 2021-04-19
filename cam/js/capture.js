function openMap(){
 $('#map').css('height', '50%');
 $('gui_controls').css('height','0%');
}

function  showImage(){
 $('#vid_container').css('height','50%');
}

function closeControls(){
  $('#takePhotoButton').hide();
  $('gui_controls').hide();
}

function closeVideo(){
  $('#video_overlay').hide();
  $('#video').hide();
}
