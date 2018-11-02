var rangeStartTime = 0;
var rangeEndTime = 0;
var isPlaySeeked = false;
// Video
var video = document.getElementById("video");
var url = getParameterByName('source');
video.setAttribute("src",url);

// Buttons
var playButton = document.getElementById("play-pause");
var muteButton = document.getElementById("mute");
var fullScreenButton = document.getElementById("full-screen");
var videoBackButton = document.getElementById("video-back");
var videoNextButton = document.getElementById("video-next");

// Sliders
var seekBar = document.getElementById("seek-bar");
var volumeBar = document.getElementById("volume-bar");


window.onload = function() {

	console.log("window.onload");

	$("#range-bar").ionRangeSlider({
			hide_min_max: true,
			keyboard: true,
			min: 0,
			max: video.duration,
			from: 0,
			to: video.duration,
			type: 'int',
			step: 1,
			postfix: "s",
			grid: true,
			onStart: function (data) {
				console.log("onStart");
			},
			onChange: function (data) {
				rangeStartTime = data.from;
				rangeEndTime = data.to;
				console.log("onChange start: " + rangeStartTime + " end:" + rangeEndTime);
			},
			onFinish: function (data) {
				console.log("onFinish");
			},
			onUpdate: function (data) {
				console.log("onUpdate");
			}
	});

	var rangeBar = $("#range-bar").data("ionRangeSlider");

	rangeStartTime = 0;
	rangeEndTime = video.duration;

	console.log(video.duration);

	// Event listener for the play/pause button
	playButton.addEventListener("click", function() {
		if (video.paused == true) {
			// Play the video
			play();
		} else {
			// Pause the video
			video.pause();
			setPlayIcon(false);
		}
	});

	// Event listener for the mute button
	muteButton.addEventListener("click", function() {
		if (video.muted == false) {
			// Mute the video
			video.muted = true;
			// Update the button text
			muteButton.innerHTML = '<i class="fas fa-volume-up"></i>';
		} else {
			// Unmute the video
			video.muted = false;

			// Update the button text
			muteButton.innerHTML = '<i class="fas fa-volume-off">';
		}
	});


	// Event listener for the full-screen button
	fullScreenButton.addEventListener("click", function() {
		if (video.requestFullscreen) {
			video.requestFullscreen();
		} else if (video.mozRequestFullScreen) {
			video.mozRequestFullScreen(); // Firefox
		} else if (video.webkitRequestFullscreen) {
			video.webkitRequestFullscreen(); // Chrome and Safari
		}
	});

	// Event listener for the video back button
	videoBackButton.addEventListener("click", function() {
		console.log("video back: " + rangeStartTime);
		video.currentTime = rangeStartTime;
	});

	// Event listener for the video next button
	videoNextButton.addEventListener("click", function() {
		console.log("video next: " + rangeEndTime);
		video.currentTime = rangeEndTime;
	});


	// Event listener for the seek bar
	seekBar.addEventListener("change", function() {
		// Calculate the new time
		var time = video.duration * (seekBar.value / 100);

		// Update the video time
		video.currentTime = time;
	});


	// Update the seek bar as the video plays
    video.addEventListener("timeupdate", function(e) {
		console.log("timeupdate" + video.currentTime);

		if(video.currentTime > rangeEndTime){
			pause();
			return;
		}

		// Calculate the slider value
		var value = (100 / video.duration) * video.currentTime;

		// Update the slider value
		seekBar.value = value;
	});

    video.addEventListener("ended", function(e){
		setPlayIcon(true);
        logEvent(e, "ENDED");
    },true);

    video.addEventListener("pause", function(e){
		setPlayIcon(true);
        logEvent(e, "PAUSED");
    },true);

    video.addEventListener("play", function(e){
		setPlayIcon(false);
        logEvent(e, "STARTED");
    },true);

    video.addEventListener("canplay", function(e){
        logEvent(e, "READY");
    },true);

    video.addEventListener("seeked", function(e){
		if(isPlaySeeked) {
			setPlayIcon(false);
			video.play();
		}else{
			video.pause();
		}
        logEvent(e, "SEEKED");
    },true);

    video.addEventListener("error", function(e){
        logEvent(e, "ERROR");
    },true);

    video.addEventListener("ratechange", function(e){
        logEvent(e, "RATE_CHANGED");
    },true);

    video.addEventListener("ratechange", function(e){
        logEvent(e, "RATE_CHANGED");
    },true);

    video.addEventListener("playing", function(e){
        logEvent(e, "PLAYING");
    },true);

    video.addEventListener("progress", function(e){
        logEvent(e, "PROGRESS");
    },true);

	// Pause the video when the seek handle is being dragged
	seekBar.addEventListener("mousedown", function() {
		video.pause();
	});

	// Play the video when the seek handle is dropped
	seekBar.addEventListener("mouseup", function() {
		video.play();
	});

	// Event listener for the volume bar
	volumeBar.addEventListener("change", function() {
		// Update the video volume
		video.volume = volumeBar.value;
    });

    play();
}

function play(){
    var time = video.currentTime;
    if(time < rangeStartTime){
        video.fastSeek(rangeStartTime);
        isPlaySeeked = true;
        return;
    }
    console.log("play - time: " + time);
    setPlayIcon(true);
    video.play();
}

function pause(){
    setPlayIcon(true);
    video.pause();
}

function setPlayIcon(isPaused){
    if(isPaused){
        playButton.innerHTML = '<i class="far fa-play-circle">';
    }else{
        playButton.innerHTML = '<i class="far fa-pause-circle">';
    }
}

function logEvent(e,label){
  var item = label ? label : "";
  console.log("EVENT " +item + ": "+ e.type);
}

function log(msg) {
    msg = msg.length > 90 ? msg.substring(0, 90) + "..." : msg; // to avoid wrapping with large objects
    console.log(msg);
}

// Player functions
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function toggleControls() {
  var video = document.getElementById('videoPlayer');
  if (video.hasAttribute("controls")) {
     video.removeAttribute("controls")
  } else {
     video.setAttribute("controls","controls")
  }
}

function setControls(enable) {
  var video = document.getElementById('videoPlayer');
  if(!enable && video.hasAttribute("controls")){
    video.removeAttribute("controls");
  }else{
    video.setAttribute("controls","controls");
  }
}
