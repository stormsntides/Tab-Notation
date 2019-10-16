function ContextMenu(){
  // custom trigger for context menu floaters
  document.addEventListener("contextmenu", function(e){
    let svgTarg = e.target.matches(".context-floater-trigger > svg") ? e.target : e.target.closest(".context-floater-trigger > svg");
    if(svgTarg){
      e.preventDefault();
      let trig = svgTarg.parentNode;
      createContextMenu(e, trig);
    }
  });
}

ContextMenu.prototype = {
  // TODO: make context menu work again now that it's going to be it's own object
};

function createContextMenu(evt, trigger){
  let origTarget = evt.target;
  let fl = document.getElementById(trigger.dataset["target"]);

  // display floater and set position
  fl.style.display = "inline";
  fl.style.left = evt.pageX + "px";
  fl.style.top = evt.pageY + "px";

  // remove previous content
  while(fl.firstChild){ fl.removeChild(fl.firstChild); }

  let type = origTarget.dataset["type"] ? origTarget.dataset["type"] : origTarget.parentNode.dataset["type"];
  let floatText = "<div>";
  switch(type){
    case "note":
      floatText += "<h2>Note \"" + origTarget.textContent + "\"</h2>";
      break;
    case "tab":
      let pType = origTarget.parentNode.dataset["type"];
      if(pType === "tabchord"){
        let tabText = "";
        for(let c = 0; c < origTarget.parentNode.children.length; c++){
          if(c > 0){ tabText += "-"; }
          tabText += origTarget.parentNode.children[c].textContent;
        }
        floatText += "<h3>Tab Chord \"" + tabText + "\"</h3>";
      } else {
        floatText += "<h3>Tab \"" + origTarget.textContent + "\"</h3>";
      }
      break;
    case "palmmute":
      floatText += "<h3>Palm Mute</h3>";
      break;
    case "hammeron":
      floatText += "<h3>Hammer On</h3>";
      break;
    case "pulloff":
      floatText += "<h3>Pull Off</h3>";
      break;
    case "fingertap":
      floatText += "<h3>Finger Tap</h3>";
      break;
    case "bendup":
      floatText += "<h3>Bend Up</h3>";
      break;
    case "benddown":
      floatText += "<h3>Bend Down</h3>";
      break;
    case "slideup":
      floatText += "<h3>Slide Up</h3>";
      break;
    case "slidedown":
      floatText += "<h3>Slide Down</h3>";
      break;
    case "barline":
      floatText += "<h3>Bar Line</h3>";
      break;
    case "timesignature":
      floatText += "<h3>Time Signature</h3>";
      break;
    default:
      floatText += "<h3>Add</h3>";
  }
  floatText += "<button>Update</button><button>Delete</button></div>";
  fl.insertAdjacentHTML("afterbegin", floatText);
}

function initContextMenu(){
  // custom trigger for context menu floaters
  document.addEventListener("contextmenu", function(e){
    let svgTarg = e.target.matches(".context-floater-trigger > svg") ? e.target : e.target.closest(".context-floater-trigger > svg");
    if(svgTarg){
      e.preventDefault();
      let trig = svgTarg.parentNode;
      createContextMenu(e, trig);
    }
  });
}

// check when DOM is fully loaded
if(document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)){
	initContextMenu();
} else {
	document.addEventListener("DOMContentLoaded", initContextMenu);
}
