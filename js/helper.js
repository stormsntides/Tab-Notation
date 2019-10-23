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
