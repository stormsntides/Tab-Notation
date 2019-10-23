// all events are delegated so dynamically added elements will receive events
function initFloaters(){
	// trigger floaters
	document.addEventListener("click", function(e){
		if(e.button === 0){
			let evTarg = getEventTarget(e, ".floater-trigger");
			if(evTarg){
				let fl = document.getElementById(evTarg.dataset["target"]);
				fl.style.display = "inline";
				fl.style.left = e.pageX + "px";
				fl.style.top = e.pageY + "px";
			}
		}
	});
	// close the current floater by clicking close button
	document.addEventListener("click", function(e){
		let evTarg = getEventTarget(e, ".close-floater");
		if(evTarg){
			evTarg.closest(".floater").style.display = "none";
		}
	});
	// close the current floater by clicking outside of it
	document.addEventListener("click", function(e){
		document.querySelectorAll(".floater").forEach(function(fl){
			if(fl.style.display !== "none"){
				let bcr = fl.getBoundingClientRect();
				let outsideX = e.pageX < (bcr.left + window.scrollX) || e.pageX > (bcr.right + window.scrollX);
				let outsideY = e.pageY < (bcr.top + window.scrollY) || e.pageY > (bcr.bottom + window.scrollY);
				if(outsideX || outsideY){
					fl.style.display = "none";
				}
			}
		});
	});
}

// check when DOM is fully loaded
if(document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)){
	initFloaters();
} else {
	document.addEventListener("DOMContentLoaded", initFloaters);
}
