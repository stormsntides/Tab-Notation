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
      floatText += "<input name='update-field' type='text' maxlength='2' value='" + origTarget.textContent + "'/>";
      floatText += "<button name='update-button' class='close-floater'>Update</button>";
      break;
    case "tab":
      let pType = origTarget.parentNode.dataset["type"];
      if(pType === "tab-chord"){
        let tabText = "";
        let inpText = "<div name='update-fields'>";
        origTarget = origTarget.parentNode;
        for(let c = 0; c < origTarget.children.length; c++){
          if(c > 0){ tabText += "-"; }
          tabText += origTarget.children[c].textContent;
          inpText += "<input name='update-field-" + c + "' type='text' maxlength='2' value='" + origTarget.children[c].textContent + "'/>";
        }
        inpText += "</div>";
        floatText += "<h3>Tab Chord \"" + tabText + "\"</h3>";
        floatText += inpText;
        floatText += "<button name='update-button' class='close-floater'>Update All</button>";
      } else {
        floatText += "<h3>Tab \"" + origTarget.textContent + "\"</h3>";
        floatText += "<input name='update-field' type='text' maxlength='2' value='" + origTarget.textContent + "'/>";
        floatText += "<button name='update-button' class='close-floater'>Update</button>";
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
  floatText += "<button name='delete-button' class='close-floater'>Delete</button></div>";
  fl.insertAdjacentHTML("afterbegin", floatText);

  // get the ancestor tab container that holds the context menu buttons
  let tc = origTarget.closest(".tn-container");

  // if delete button is clicked, remove the node and redraw tabs
  tc.querySelector("[name='delete-button']").addEventListener("click", function(e){
    let pNode = origTarget.parentNode;
    pNode.removeChild(origTarget);
    // update(pNode);
    tc.update(true);
  });
  // if update button is clicked, set new value based on inputs and redraw tabs
  tc.querySelector("[name='update-button']").addEventListener("click", function(e){
    if(tc.querySelector("[name='update-fields']")){
      // tab chord is being updated
      for(let i = 0; i < tc.querySelector("[name='update-fields']").children.length; i++){
        let val = parseInt(tc.querySelector("[name='update-fields']").children[i].value.replace(/\D*/gm, ""), 10);
        origTarget.children[i].textContent = clamp((val ? val : 0), 0, 30);
      }
    } else {
      // individual tab is being updated
      let val = tc.querySelector("[name='update-field']").value.replace(/\D*/gm, "");
      origTarget.textContent = clamp((val ? val : 0), 0, 30);
    }
    // update(origTarget);
    tc.update(true);
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

// check when DOM is fully loaded
// if(document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)){
// 	initContextMenu();
// } else {
// 	document.addEventListener("DOMContentLoaded", initContextMenu);
// }
