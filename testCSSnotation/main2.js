// handler when the DOM is fully loaded
function main(){
  // SETTINGS.load();
  document.querySelectorAll(".tab-container").forEach((container, i) => {
    initTabContainer(container);
    container.draw();
  });
};

// check when DOM is fully loaded
if(document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)){
	main();
} else {
	document.addEventListener("DOMContentLoaded", main);
}
