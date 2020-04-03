function getEventTarget(evt, selector){
	return evt.target.matches(selector) ? evt.target : evt.target.closest(selector);
}

function capitalizeFirstLetters(text, splitChar="", newSeperatorChar=""){
	let words = text.split(splitChar);
	let newText = "";
	words.forEach(function(w, i){
		if(i > 0) { newText += newSeperatorChar; }
		newText += w.slice(0, 1).toUpperCase() + w.slice(1).toLowerCase();
	});
	return newText;
}

function clamp(num, min, max){
	return Math.min(Math.max(num, min), max);
}

function numberToText(num){
	switch(num) {
		case 0: return "zero";
		case 1: return "one";
		case 2: return "two";
		case 3: return "three";
		case 4: return "four";
		case 5: return "five";
		case 6: return "six";
		case 7: return "seven";
		case 8: return "eight";
		case 9: return "nine";
		default: return "zero";
	}
}
