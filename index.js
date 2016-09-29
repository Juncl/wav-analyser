navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);


var audioctx = new (window.AudioContext || window.webkitAudioContext)();

var buffer = null;
var startTime;
var time = [];
for(var i = 0; i < 3; i++){
	time[i] = [];
}

//LoadSample(audioctx, "./wav/10000hz.wav"); 

var mode = 0;
var fileMode = 0;

var fftSizeMode = 1;
var src = null;
var source;
var analyser = audioctx.createAnalyser();
analyser.minDecibels = -50;
analyser.maxDecibels = -10;
analyser.fftSize = 1024;

var pos = [];
pos[0] = document.getElementById("pos1Value");
pos[1] = document.getElementById("pos2Value");
pos[2] = document.getElementById("pos3Value");
var timeValue = [];
timeValue[0] = document.getElementById("time1"); 
timeValue[1] = document.getElementById("time2"); 
timeValue[2] = document.getElementById("time3"); 

document.getElementById("min").value = analyser.minDecibels;
document.getElementById("max").value = analyser.maxDecibels;

var ctx = document.getElementById("graph").getContext("2d");
var peakValue = document.getElementById("peakValue");
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
		src.loop = false;
		src.connect(audioctx.destination);
		src.connect(analyser);
		src.start(0);
		startTime = new Date();
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
		LoadSample(audioctx, "./0925/4K0s_10s_10K.wav");
	}else if(fileMode == 1) {
		LoadSample(audioctx, "./0925/1K0s_10s_10K.wav");
	}
	else if(fileMode == 2) {
		LoadSample(audioctx, "./0925/1K0s_3K8s_10s_7K.wav");
	}else if(fileMode == 3) {
		LoadSample(audioctx, "./0925/1K0s_3K8s_10s_8K.wav");
	}else if(fileMode == 4) {
		LoadSample(audioctx, "./0925/1K0s_2K5s_4K8s_10s_10K.wav");
	}
	else if(fileMode == 5) {
		LoadSample(audioctx, "./0925/1K0s_2K5s_4K8s_10s_12K.wav");
	}
	//  else if(fileMode == 5) {
	// 	LoadSample(audioctx, "./0921/24Ktime.wav");
	// }
	
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

	var f = [];  // 频率数组；
	 // 时间数组
	var peakPos = getPeakPos(data);
	if(peakPos.length == 0){

		pos[0].innerHTML = "信号"+1+" "+"("+0+" ,"+0+")";
		pos[1].innerHTML = "信号"+2+" "+"("+0+" ,"+0+")";
		pos[2].innerHTML = "信号"+3+" "+"("+0+" ,"+0+")";
		// pos[1].style.visibility = "hidden";
		// pos[2].style.visibility = "hidden";
	}
	else if(peakPos.length > 0){
		for(var i = 0; i < peakPos.length; i++){
			f[i] = getFrequencyValue(fftSizeMode, peakPos[i]);
			pos[i].innerHTML = "信号"+(i+1)+" "+"("+peakPos[i]+" ,"+data[peakPos[i]]+")"
								 +" "+f[i]+" "+(new Date()- startTime);
				 	
			if(data[peakPos[i]]>=100){
				
				time[i].push(new Date()- startTime);
			}


			
		}
		// if(peakPos.length == 1){
		// 	pos[1].style.visibility = "hidden";
		// 	pos[2].style.visibility = "hidden";
		// }else if(peakPos.length == 2){
		// 	pos[2].style.visibility = "hidden";
		// 	pos[1].style.visibility = "visible";
		// }else if(peakPos.length == 3){
		// 	pos[2].style.visibility = "visible";
		// 	pos[1].style.visibility = "visible";
		// }
	}
	// console.log(time.length);
	for(var i = 0; i < time.length; i++){
		console.log("信号"+(i+1)+": "+time[i][0]+" "+time[i].length);
		if(time[i][0] != undefined && f[i] != undefined){
			timeValue[i].innerHTML = "信号"+(i+1)+": "+time[i][0]+"ms"
			+"  "+f[i]+"KHz";
		}
	}
	

	for(var i = 0; i < 256; ++i) {
		if(i<6){
			data[i] = 0;
		}
		ctx.fillStyle = gradline[data[i]];
		ctx.fillRect(i, 300 - data[i], 1, data[i]);
	}
}


function FileChange(){
	Setup();
	Stop();
	Play();
}


// 找出峰值的具体位置
function getPeakPos(arr){
	var pos = [];
	var n = [];

	for(var i = 1; i < arr.length; i++){
		if(arr[i] >= arr[i-1] && arr[i] >= arr[i+1] && arr[i] != 0
			&& arr[i] >= arr[i-2] && arr[i] >= arr[i+2] ){			
			pos.push(i); 
		}
	}

	for(var i = 0; i < pos.length; i++){
		var count = 0;

		while((pos[i]+1) == pos[i+1]){
			i++;
			count++;
		}
		if(count != 0){
			n.push(Math.floor((2*pos[i]-count)/2));
		}
		else n.push(pos[i]);
	}
	if(n.length > 0 && n[0] == 2){
		n.shift();
	}
	return n;
}

//添加li标签
function addElementLi(id,number,posValue,fValue){
	var li = document.createElement("li");
	var ul = document.getElementById("ul");
	li.setAttribute("id", id);
	li.innerHTML = "信号" + number + " " + posValue + " " + fValue;
	ul.appendChild();
}

function getFrequencyValue(size, value){
	var frequency = 0;
	switch(size){
		case 0: 
			frequency = Math.floor(value/10);
			break;
		case 1:
			frequency = Math.floor(value/20);
			break;
		case 2:
			frequency = Math.floor(value/80);
			break;
	}

	return frequency;
}


Setup();
setInterval(DrawGraph, 100);