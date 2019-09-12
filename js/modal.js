function initModals(){
	// trigger modals
	document.querySelectorAll(".modal-trigger").forEach(function(ele){
		ele.addEventListener("click", function(e){
			let tg = e.target.dataset["target"];
			document.getElementById(tg).style.display = "flex";
		});
	});
	// close the current modal by clicking close button
	document.querySelectorAll(".close-modal").forEach(function(ele){
		ele.addEventListener("click", function(e){
			e.target.closest(".modal-container").style.display = "none";
		});
	});
	// close the current modal by clicking outside of it
	document.querySelectorAll(".modal").forEach(function(ele){
		ele.addEventListener("click", function(e){
			e.target.style.display = "none";
		});
	});
	// make sure the modal itself doesn't trigger close function
	document.querySelectorAll(".modal-content").forEach(function(ele){
		ele.addEventListener("click", function(e){
			e.stopPropagation();
		});
	});
}

// check when DOM is fully loaded
if(document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)){
	initModals();
} else {
	document.addEventListener("DOMContentLoaded", initModals);
}
