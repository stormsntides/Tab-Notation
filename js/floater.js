// all events are delegated so dynamically added elements will receive events
function initFloaters(){
	// trigger floaters
	document.body.addEventListener("click", function(e){
		if(e.target.matches(".floater-trigger")){
			let fl = document.getElementById(e.target.dataset["target"]);
			fl.style.display = "block";
			fl.querySelector(".floater-content").style.left = e.pageX + "px";
			fl.querySelector(".floater-content").style.top = e.pageY + "px";
		}
	});
	// trigger context menu floaters
	document.body.addEventListener("contextmenu", function(e){
		if(e.target.matches(".context-floater-trigger")){
			e.preventDefault();
			console.log("Context menu triggered!");
		}
	});
	// close the current floater by clicking close button
	document.body.addEventListener("click", function(e){
		if(e.target.matches(".close-floater")){
			e.target.closest(".floater").style.display = "none";
		}
	});
	// close the current floater by clicking outside of it
	document.body.addEventListener("click", function(e){
		if(e.target.matches(".floater")){
			e.target.style.display = "none";
		}
	});
	// make sure the floater itself doesn't trigger close function
	document.body.addEventListener("click", function(e){
		if(e.target.matches(".floater-content")){
			e.stopPropagation();
		}
	});
}

// check when DOM is fully loaded
if(document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)){
	initFloaters();
} else {
	document.addEventListener("DOMContentLoaded", initFloaters);
}
