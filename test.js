
function getPeakPos(arr){
	var pos = [];
	var n = [];

	for(var i = 2; i < arr.length; i++){
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
	return n;
}

var a = [0, 0, 100, 100, 100,89, 0, 1, 2, 2,0];
console.log(getPeakPos(a));


if(peakPos.length == 0){
			pos[i].innerHTML = "信号"+i+" "+0+" "+0;
	}else{
		for(var i = 0; i < peakPos.length;i ++){
			pos[i].innerHTML = "信号"+i+" "+peakPos[i]+" "+data[peakPos[i];
		}
	}