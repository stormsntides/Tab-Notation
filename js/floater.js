// all events are delegated so dynamically added elements will receive events
function initFloaters(){
	document.addEventListener("click", function(e){
		let evTarg = getEventTarget(e, ".close-floater");
		if(evTarg){
			// close current floater by clicking close button
			evTarg.closest(".floater").style.display = "none";
		} else if(!e.target.closest(".floater")){
			// close all floaters by clicking outside of any floater
			document.querySelectorAll(".floater").forEach(function(fl){
				fl.style.display = "none";
			});
		}
		// trigger floaters
		evTarg = getEventTarget(e, ".floater-trigger");
		if(evTarg){
			let fl = document.getElementById(evTarg.dataset["target"]);
			fl.style.display = "inline";
			fl.style.left = e.pageX + "px";
			fl.style.top = e.pageY + "px";
		}
	});
}
