var fontWidthChar;

function textToTab(container, text){
  let tabs = parseTabs(text, fontWidthChar.getBoundingClientRect().width, 12);

  // remove all child nodes
	while(container.firstChild){
		container.removeChild(container.firstChild);
	}
	// container.insertAdjacentHTML("afterbegin", tabs.getTabs());
	container.insertAdjacentHTML("afterbegin", tabs);
}

function inputToTab(e){
  let area = e.target;
  let containers = document.querySelectorAll(".tn-container[name='" + area.getAttribute("for") + "']");

  for(let i = 0; i < containers.length; i++){
    textToTab(containers[i], area.value.trim());
  }
}

// handler when the DOM is fully loaded
var callback = function(){
  fontWidthChar = document.getElementById("check-width");

  document.querySelectorAll("textarea").forEach(function(text_area){
    text_area.addEventListener("keyup", inputToTab);
  });

  document.querySelectorAll(".tn-container").forEach(function(container){
    if(container.textContent.length > 0){
      textToTab(container, container.textContent.trim());
    }
  });
};

// check when DOM is fully loaded
if(document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)){
	callback();
} else {
	document.addEventListener("DOMContentLoaded", callback);
}
