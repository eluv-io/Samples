var rangeStartTime = 0;
var rangeEndTime = 0;
var isPlaySeeked = false;
// Video
var video = document.getElementById("video");
var url = getParameterByName('source');
var bitrates = [];
var player = {};
var isDash = getParameterByName('type') === "dash";
var currentTime = 0;
var duration = 0;
var initialized = false;

var parser = document.createElement('a');
parser.href = url;

let client = new ElvClient(
  {
    hostname: parser.hostname,
    port: parser.port,
    useHTTPS: location.protocol == "https:",
    ethHostname: parser.hostname,
    ethPort: 8545,
    ethUseHTTPS: false
  }
);

if(isDash){
    player = dashjs.MediaPlayer().create();
    player.initialize(document.getElementById("video"), url, true);
    player.setFastSwitchEnabled(true);
    player.setAutoSwitchQualityFor('video', false);
    player.on(dashjs.MediaPlayer.events['CAN_PLAY'],onReady);
    player.on(dashjs.MediaPlayer.events['ERROR'],onError);
    player.on(dashjs.MediaPlayer.events['PLAYBACK_ERROR'],onError);
    player.on(dashjs.MediaPlayer.events['PLAYBACK_ENDED'],onEnded);
    player.on(dashjs.MediaPlayer.events['PLAYBACK_PAUSED'],onPaused);
    player.on(dashjs.MediaPlayer.events['PLAYBACK_STARTED'],onStarted);
    player.on(dashjs.MediaPlayer.events['PLAYBACK_RATE_CHANGED'],onRateChanged);
    player.on(dashjs.MediaPlayer.events['PLAYBACK_PLAYING'],onPlaying);
    player.on(dashjs.MediaPlayer.events['PLAYBACK_PROGRESS'],onProgress);
    player.on(dashjs.MediaPlayer.events['PLAYBACK_SEEKED'],onSeeked);
}else{
    video.setAttribute("src",url);
    video.addEventListener("ended", onEnded,true);
    video.addEventListener("pause", onPaused,true);
    video.addEventListener("play", onStarted,true);
    video.addEventListener("canplay", onReady,true);
    video.addEventListener("seeked", onSeeked, true);
    video.addEventListener("error", onError, true);
    video.addEventListener("ratechange", onRateChanged, true);
    video.addEventListener("playing", onPlaying, true);
    video.addEventListener("progress", onProgress ,true);
}

// Buttons
var certifiedButton = document.getElementById("certified");
var playButton = document.getElementById("play-pause");
var muteButton = document.getElementById("mute");
var fullScreenButton = document.getElementById("full-screen");
var videoBackButton = document.getElementById("video-back");
var videoNextButton = document.getElementById("video-next");
var downloadButton = document.getElementById("download");

// Sliders
var seekBar = document.getElementById("seek-bar");
var volumeBar = document.getElementById("volume-bar");

var timelabel = document.getElementById("timestats");

window.onload = function() {

    console.log("window.onload");

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
            muteButton.innerHTML = '<i class="fas fa-volume-off"></i>';
        } else {
            // Unmute the video
            video.muted = false;

            // Update the button text
            muteButton.innerHTML = '<i class="fas fa-volume-up">';
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

        logEvent({}, "FULLSCREEN");
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
        var time = video.duration * (seekBar.value / 100.0);
        time = time.toFixed(1);
        console.log("VIDEO SEEK " + time);
        //pause();
        // Update the video time
        video.currentTime = time;
        if(isDash){
            player.seek(time);
        }
    });


    // Update the seek bar as the video plays
    video.addEventListener("timeupdate", function(e) {
        console.log("Timeupdate current: " + video.currentTime + " start: " + rangeStartTime + " end: " + rangeEndTime);
        currentTime = video.currentTime;
        timelabel.innerHTML = timeFormat(currentTime.toFixed(0)) +"/"+timeFormat(duration.toFixed(0));

        if(video.currentTime > rangeEndTime){
            console.log("Time passed end, stopping." + rangeEndTime);
            pause();
            return;
        }

        // Calculate the slider value
        var value = (100 / video.duration) * video.currentTime;

        // Update the slider value
        seekBar.value = value;
    });

    // Pause the video when the seek handle is being dragged
    seekBar.addEventListener("mousedown", function() {

    });

    // Play the video when the seek handle is dropped
    seekBar.addEventListener("mouseup", function() {

    });

    // Event listener for the volume bar
    volumeBar.addEventListener("change", function() {
        // Update the video volume
        video.volume = volumeBar.value;
    });

   downloadButton.addEventListener("click", function() {
        console.log("video download");
        logEvent({"start":rangeStartTime, "end":rangeEndTime},"DOWNLOAD");
    });

}

function onVideoInit(){
    if(initialized)
        return;
    initialized = true;
    console.log("Video Initialized. Duration: " + duration);
    rangeStartTime = 0;
    rangeEndTime = duration;
    $("#range-bar").ionRangeSlider({
       hide_min_max: true,
       keyboard: true,
       min: 0,
       max: duration.toFixed(1),
       from: 0,
       to: duration.toFixed(1),
       type: 'int',
       step: 0.1,
       grid: true,
       prettify: timeFormat,
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
    play();
}

function onReady(e){
    duration = video.duration;
    if(isDash){
        bitrates = player.getBitrateInfoListFor("video");
        // bitrates are sorted from lowest to the best values
        // so the last one has the best quality
        maxQuality = bitrates[bitrates.length-1].qualityIndex;
        // set max quality
        player.setQualityFor("video", maxQuality);
    }

    logEvent(e, "READY");
    onVideoInit();
    play();
}

function onStarted(e){
    setPlayIcon(false);
    logEvent(e, "STARTED");
}
function onEnded(e){
    setPlayIcon(true);
    logEvent(e, "ENDED");
}
function onPaused(e){
    setPlayIcon(true);
    logEvent(e, "PAUSED");
}
function onError(e){
    logEvent(e, "ERROR");
}
function onRateChanged(e){
    logEvent(e, "RATE_CHANGED");
}
function onProgress(e){
    logEvent(e, "PROGRESS");
}
function onPlaying(e){
    logEvent(e, "PLAYING");
}
function onSeeked(e){
    if(isPlaySeeked) {
        setPlayIcon(false);
        if(isDash){
            player.play();
        }else{
            video.play();
        }
    }else{
        pause();
    }
    logEvent(e, "SEEKED");
}

function logVerification(qhash, libid){
  console.log("Verifying hash: " + qhash);
  client.VerifyContentObject(
    {
      partHash: qhash,
      libraryId: libid
    }
  ).then(result => {
    console.log("Finished verification.");
    logEvent(result,"VERIFY");
  });
}

function play(){
    var time = video.currentTime;
    if(time < rangeStartTime){
        pause();
        if(isDash){
            player.seek(rangeStartTime);
        }
        video.currentTime = rangeStartTime;
        isPlaySeeked = true;
        return;
    }
    console.log("play - time: " + time);
    setPlayIcon(false);
    if(isDash){
        player.play();
    }else{
        video.play();
    }
}

function pause(){
    setPlayIcon(true);
    if(isDash){
        player.pause();
    }else{
        video.pause();
    }
}

function setPlayIcon(isPaused){
    if(isPaused){
        playButton.innerHTML = '<i class="far fa-play-circle">';
    }else{
        playButton.innerHTML = '<i class="far fa-pause-circle">';
    }
}

function toggleControls() {
    /*
    var video = document.getElementById('videoPlayer');
    if (video.hasAttribute("controls")) {
        video.removeAttribute("controls")
    } else {
        video.setAttribute("controls","controls")
    }
    */
}

function setControls(enable) {
    /*
    var video = document.getElementById('videoPlayer');
    if(!enable && video.hasAttribute("controls")){
        video.removeAttribute("controls");
    }else{
        video.setAttribute("controls","controls");
    }
    */
}

// Dash functions
function setQuality(s) {
    player.setQualityFor('video', s.value)
}

function populateBitrates(e)
{
    var bitrates = player.getBitrateInfoListFor("video");
    // bitrates are sorted from lowest to the best values
    // so the last one has the best quality
    maxQuality = bitrates[bitrates.length-1].qualityIndex;
    // set max quality
    player.setQualityFor("video", maxQuality);
    var bitrateSelect = document.getElementById('bitrates');
    var i;
    for (i = 0; i < bitrates.length; i++) {
        var option = document.createElement("option");
        option.text = bitrates[i].bitrate + ' kbps';
        option.value = bitrates[i].qualityIndex;
        bitrateSelect.add(option);
    }
    bitrateSelect.value = maxQuality;
    console.log(bitrates);
}

function onDashReady(){
    if(!isDash)
        return;
    bitrates = player.getBitrateInfoListFor("video");
    // bitrates are sorted from lowest to the best values
    // so the last one has the best quality
    maxQuality = bitrates[bitrates.length-1].qualityIndex;
    // set max quality
    player.setQualityFor("video", maxQuality);
}
