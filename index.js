if(typeof(webkitAudioContext)!=="undefined")
	var audioctx = new webkitAudioContext();
else if(typeof(AudioContext)!=="undefined")
	var audioctx = new AudioContext();

var buffer = null;

//LoadSample(audioctx, "./wav/10000hz.wav"); 

var mode = 0;
var fileMode = 0;
var fftSizeMode = 1;
var src = null;
var analyser = audioctx.createAnalyser();
analyser.fftSize = 1024;
document.getElementById("min").value = analyser.minDecibels;
document.getElementById("max").value = analyser.maxDecibels;

var ctx = document.getElementById("graph").getContext("2d");
var gradbase = ctx.createLinearGradient(0, 0, 0, 256);
gradbase.addColorStop(0, "rgb(20,22,20)");
gradbase.addColorStop(1, "rgb(20,20,200)");
var gradline = [];
for(var i = 0; i < 256; ++i) {
	gradline[i] = ctx.createLinearGradient(0, 256 - i, 0, 256);
	var n = (i & 64) * 2;
	gradline[i].addColorStop(0, "rgb(255,0,0)");
	gradline[i].addColorStop(1, "rgb(255," + i + ",0)");
}

function Stop() {
	if(src) src.stop(0);
	src = null;
}

function Play() {
	if(src === null) {
		src = audioctx.createBufferSource();
		src.buffer = buffer;
		src.loop = true;
		src.connect(audioctx.destination);
		src.connect(analyser);
		src.start(0);
	}
}

function LoadSample(ctx, url) {
	var req = new XMLHttpRequest();
	req.open("GET", url, true);
	req.responseType = "arraybuffer";
	req.onload = function () {
		if(req.response) {
//			buffer = ctx.createBuffer(req.response, false);
			ctx.decodeAudioData(req.response,function(b){buffer=b;},function(){});
		}
		else
			buffer = ctx.createBuffer(VBArray(req.responseBody).toArray(), false);
	}
	req.send();
}

function Setup() {
	console.log("setup");
	mode = document.getElementById("mode").selectedIndex;
	fileMode = document.getElementById("fileMode").selectedIndex;
	fftSizeMode = document.getElementById("fftSizeMode").selectedIndex;
	if(fileMode == 0){
		LoadSample(audioctx, "./0921/only1000hz.wav");
		console.log("load 1000hz");
	}else if(fileMode == 1) {
		LoadSample(audioctx, "./0921/3Ktime.wav");
		console.log("load 2000hz");
	}else if(fileMode == 2) {
		LoadSample(audioctx, "./0921/n24Ktime.wav");
		console.log("load 5000hz");
	}else if(fileMode == 3) {
		LoadSample(audioctx, "./0921/n23Ktime.wav");
		console.log("load 10000hz");
	}else if(fileMode == 4) {
		LoadSample(audioctx, "./0921/n13Ktime.wav");
		console.log("load 10000hz");
	}else if(fileMode == 5) {
		LoadSample(audioctx, "./0921/24Ktime.wav");
		console.log("load 10000hz");
	}
	
	if(fftSizeMode == 0){
		analyser.fftSize = 512;
	}else if(fftSizeMode == 1){
		analyser.fftSize = 1024;
	}else analyser.fftSize = 4096;
	analyser.minDecibels = parseFloat(document.getElementById("min").value);
	analyser.maxDecibels = parseFloat(document.getElementById("max").value);
	analyser.smoothingTimeConstant = parseFloat(document.getElementById("smoothing").value);
}

function DrawGraph() {
	ctx.fillStyle = gradbase;
	ctx.fillRect(0, 0, 256, 256);
	var data = new Uint8Array(256);
	if(mode == 0) analyser.getByteFrequencyData(data); //Spectrum Data
	else analyser.getByteTimeDomainData(data); //Waveform Data
	for(var i = 0; i < 256; ++i) {
		ctx.fillStyle = gradline[data[i]];
		if(data[i] != 0){
			console.log(i + " " + data[i]);
		}
		
		ctx.fillRect(i, 300 - data[i], 1, data[i]);
	}
}
function FileChange(){
	Setup();
	Stop();
	Play();
}
Setup();
setInterval(DrawGraph, 100);