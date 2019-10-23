var textHistory;

function triggerSVGdraw(isTriggered){
  if(isTriggered){
    // unparse HTML into tab text
    let unpText = unparseTabs(isTriggered).trim();
    // get the ancestor container holding tabs
    let tn = isTriggered.closest(".tn-container");
    // insert new tabs into raw tabs element
    let raw = tn.querySelector(".raw-tab").value = unpText;
    tn.printTabs();
  }
}

function printTabs(){
  let text = this.querySelector(".raw-tab").value.trim();
  // if text exists in raw tab, parse text
  if(text.length > 0){
    // remove all children within this element
    this.clear(".tn-content");
    // insert tabs at beginning of content
    this.querySelector(".tn-content").insertAdjacentHTML("afterbegin", parseTabs(text));
  }
}

function initTabContainer(tc){
  // remove all children within this element, if any
  tc.clear();

  // add necessary elements
  tc.insertAdjacentHTML("afterbegin", "<div id='context-floater-" + tc.dataset["tabId"] + "' class='floater'></div>");
  tc.insertAdjacentHTML("afterbegin", "<div id='floater-" + tc.dataset["tabId"] + "' class='floater'></div>");
  tc.insertAdjacentHTML("afterbegin", "<img class='floater-trigger mg-bottom click-icon' data-target='floater-" + tc.dataset["tabId"] + "' src='./resources/pencil.svg'/>");
  tc.querySelector("#floater-" + tc.dataset["tabId"]).insertAdjacentHTML("afterbegin", "<textarea class='raw-tab'></textarea>");
  tc.querySelector("#floater-" + tc.dataset["tabId"]).insertAdjacentHTML("beforeend", "<button class='close-floater generate'>Generate Tabs</button>");
  tc.insertAdjacentHTML("beforeend", "<div class='tn-content context-floater-trigger' data-target='context-floater-" + tc.dataset["tabId"] + "'></div>");

  // add extra event listeners to floater commands
  tc.querySelector(".floater-trigger").addEventListener("click", function(e){
    // textHistory = tc.querySelector(".raw-tab").value;
  });
  tc.querySelector("#floater-" + tc.dataset["tabId"]).addEventListener("click", function(e){
    // tc.querySelector(".raw-tab").value = textHistory;
  });
  tc.querySelector(".generate").addEventListener("click", function(e){
    tc.printTabs();
  });
  tc.querySelector(".raw-tab").addEventListener("keypress", function(e){
    if(e.key.toLowerCase() === "enter"){
      e.preventDefault();
      tc.printTabs();
      e.target.closest(".floater").style.display = "none";
    }
  });
}

function displayContextMenu(evt, trigger){
  // custom trigger for context menu floaters
  let origTarget = evt.target.dataset["type"] ? evt.target : evt.target.parentNode;
  let fl = document.getElementById(trigger.dataset["target"]);

  // display floater and set position
  fl.style.display = "inline";
  fl.style.left = evt.pageX + "px";
  fl.style.top = evt.pageY + "px";

  // remove previous content
  while(fl.firstChild){ fl.removeChild(fl.firstChild); }

  let type = origTarget.dataset["type"];
  let floatText = "<div>";
  switch(type){
    case "note":
      floatText += "<h2>Note \"" + origTarget.textContent + "\"</h2>";
      break;
    case "tab":
      let pType = origTarget.parentNode.dataset["type"];
      if(pType === "tab-chord"){
        let tabText = "";
        origTarget = origTarget.parentNode;
        for(let c = 0; c < origTarget.children.length; c++){
          if(c > 0){ tabText += "-"; }
          tabText += origTarget.children[c].textContent;
        }
        floatText += "<h3>Tab Chord \"" + tabText + "\"</h3>";
      } else {
        floatText += "<h3>Tab \"" + origTarget.textContent + "\"</h3>";
        floatText += "<select>";
        for(let i = 0; i <= 30; i++){ floatText += "<option value='" + i + "'>" + i + "</option>"; }
        floatText += "</select>";
      }
      break;
    case "palm-mute":
    case "hammer-on":
    case "pull-off":
    case "finger-tap":
    case "bend-up":
    case "bend-down":
    case "slide-up":
    case "slide-down":
    case "bar-line":
    case "time-signature":
      floatText += "<h3>" + capitalizeFirstLetters(type, "-", " ") + "</h3>";
      break;
    default:
      floatText += "<h3>Add</h3>";
  }
  floatText += "<button>Update</button><button id='delete-button' class='close-floater'>Delete</button></div>";
  fl.insertAdjacentHTML("afterbegin", floatText);

  document.getElementById("delete-button").addEventListener("click", function(e){
    console.log("Deleting element...");
    let pNode = origTarget.parentNode;
    pNode.removeChild(origTarget);
    triggerSVGdraw(pNode);
  });
}

function initContextMenu(){
  // custom trigger for context menu floaters
  document.addEventListener("contextmenu", function(e){
    let svgTarg = getEventTarget(e, ".context-floater-trigger > svg");
    if(svgTarg){
      e.preventDefault();
      let trig = svgTarg.parentNode;
      displayContextMenu(e, trig);
    }
  });
}

// handler when the DOM is fully loaded
function main(){
  SETTINGS.load();
  document.querySelectorAll(".tn-container").forEach(function(container, i){
    // add helper functions
    container.printTabs = printTabs;
    container.clear = function(s){
      let el = s ? this.querySelector(s) : this;
      while(el.firstChild){ el.removeChild(el.firstChild); }
    };

    // do work
    container.dataset["tabId"] = i;
    initTabContainer(container);
    container.printTabs();
    initSVGevents(container);
  });

  initContextMenu();
};


// check when DOM is fully loaded
if(document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)){
	main();
} else {
	document.addEventListener("DOMContentLoaded", main);
}

// SVG drag functions (which I guess counts as tab inputs)

function createSVGlistener(parent, evType, runFunc){
  parent.addEventListener(evType, function(e){
    let evTarg = e.target.matches("svg") ? e.target : e.target.closest("svg");
    if(evTarg){
      // keep drag functions from activating when using right click
      let isClick = evType === "mousedown" || evType === "mouseup";
      if(isClick && e.button === 0){
        runFunc(e, evTarg);
      } else if(!isClick) {
        runFunc(e, evTarg);
      }
    }
  });
}

function initSVGevents(tabContainer){
  // add event listeners for all possible input types
  createSVGlistener(tabContainer, "mousedown", startDrag);
  createSVGlistener(tabContainer, "mousemove", drag);
  createSVGlistener(tabContainer, "mouseup", endDrag);
  createSVGlistener(tabContainer, "mouseleave", endDrag);
  createSVGlistener(tabContainer, "touchstart", startDrag);
  createSVGlistener(tabContainer, "touchmove", drag);
  createSVGlistener(tabContainer, "touchend", endDrag);
  createSVGlistener(tabContainer, "touchleave", endDrag);
  createSVGlistener(tabContainer, "touchcancel", endDrag);
}

function rearrangeNodes(movedEle){
	if(movedEle && movedEle.classList.contains("moved")){
		let meTrf = movedEle.transform.baseVal.getItem(0);
		// get the parent note group and loop through each child
		let eleGroup = movedEle.parentNode;
		let groupName = eleGroup.getAttribute("name");
		// move element to the end of the parent node so that it isn't compared against itself until the end
		eleGroup.append(movedEle);
		// begin checking y if x overlaps; if child x becomes greater than group x, stop checking y and insert moved node
		let checkY = false;
		let groupX = 0;
		for(let ci = 0; ci < eleGroup.children.length; ci++){
			let child = eleGroup.children[ci];
			// get the translation values for each element
			let chTrf = child.transform.baseVal.getItem(0);
			let isXless = meTrf.matrix.e < chTrf.matrix.e;
			let isYless = meTrf.matrix.f < chTrf.matrix.f;
			// check which group moved ele is currently in; if notes, check if y is less; if tabs, check if x is less
			if((groupName === "notes" && isYless) || (groupName === "tabs" && isXless)){
				eleGroup.insertBefore(movedEle, child);
				break;
			}
		}
		// adjust string position so that it is aligned with the nearest string
		meTrf.setTranslate(meTrf.matrix.e, SETTINGS.nearestString(movedEle) * SETTINGS.lineSpacing);
		movedEle.classList.remove("moved");
	}
}

// get the position of the mouse in SVG coordinates
function getMousePosition(evt, svg) {
  var CTM = svg.getScreenCTM();
  if (evt.touches) { evt = evt.touches[0]; }
  return {
    x: (evt.clientX - CTM.e) / CTM.a,
    y: (evt.clientY - CTM.f) / CTM.d
  };
}

// keep track of the element being dragged, the offset position of the mouse, and the current transform
// get min and max boundaries to confine svg elements
var selectedElement, offset, transform, min, max;

function initDrag(evt, svg){
  offset = getMousePosition(evt, svg);
  min = { x: 0, y: 0 };
  max = { x: 0, y: 0 };

  // set boundaries so that elements can't "escape" svg
  var brect = svg.getBoundingClientRect();
  var bbox = selectedElement.getBBox();
  min.x = 0;
  max.x = brect.width - bbox.x - bbox.width;
  min.y = SETTINGS.lineSpacing - (bbox.y + SETTINGS.charRef.height / 2);
  max.y = (selectedElement.closest("svg").querySelector("[name='notes']").children.length * SETTINGS.lineSpacing) - (bbox.y + bbox.height - SETTINGS.charRef.height / 2);

  // make sure the first transform on the element is a translate transform
  var transforms = selectedElement.transform.baseVal;

  if (transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
    // create a transform that translates by (0, 0)
    var translate = svg.createSVGTransform();
    translate.setTranslate(0, 0);
    selectedElement.transform.baseVal.insertItemBefore(translate, 0);
  }

  // get initial translation
  transform = transforms.getItem(0);
  offset.x -= transform.matrix.e;
  offset.y -= transform.matrix.f;
}

// TODO: flesh this out to add tabs and what not
function addElement(evt, svg){
  console.log("Adding new element...");
  let mp = getMousePosition(evt);
  svg.querySelector("[name='tabs']").insertAdjacentHTML("beforeend", "<rect fill='red' x='0' y='0' width='" + SETTINGS.charRef.width + "' height='12' transform='translate(" + mp.x + " " + mp.y + ")'/>");
}

function startDrag(evt, svg) {
  // make sure element is draggable before attempting to move
  if (evt.target.classList.contains('draggable')) {
    selectedElement = evt.target;
    initDrag(evt, svg);
  } else if (evt.target.parentNode.classList.contains('draggable')){
    selectedElement = evt.target.parentNode;
    initDrag(evt, svg);
  } else {
    // addElement(evt, svg);
  }
}

function drag(evt, svg) {
  if (selectedElement) {
    evt.preventDefault();
    var coord = getMousePosition(evt, svg);

    var dx = selectedElement.classList.contains('restrict-x') ? transform.matrix.e : coord.x - offset.x;
    var dy = selectedElement.classList.contains('restrict-y') ? transform.matrix.f : coord.y - offset.y;

    if(dx < min.x) { dx = min.x; }
    else if(dx > max.x) { dx = max.x; }
    if(dy < min.y) { dy = min.y; }
    else if(dy > max.y) { dy = max.y; }

    transform.setTranslate(dx, dy);
  }
}

function endDrag(evt, svg) {
  if(selectedElement){
    selectedElement.classList.add('moved');
    rearrangeNodes(selectedElement);
    triggerSVGdraw(selectedElement);
    selectedElement = false;
  }
}
