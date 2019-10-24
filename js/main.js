// handler when the DOM is fully loaded
function main(){
  SETTINGS.load();
  document.querySelectorAll(".tn-container").forEach(function(container, i){
    // add helper functions
    container.draw = draw;
    container.update = update;
    container.clear = function(s){
      let el = s ? this.querySelector(s) : this;
      while(el.firstChild){ el.removeChild(el.firstChild); }
    };

    // do work
    container.dataset["tabId"] = i;
    initTabContainer(container);
    container.draw();
    initSVGevents(container);
  });
  // initialize floater menus
  initFloaters();
  // initialize context menus
  initContextMenu();
};

// check when DOM is fully loaded
if(document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)){
	main();
} else {
	document.addEventListener("DOMContentLoaded", main);
}
