function getSelectOptions(selected){
  let sel = "<select name='update-field'>";
  let ops = [
    {val: "bar-line", text: "Bar Line"},
    {val: "bend-down", text: "Bend Down"},
    {val: "bend-up", text: "Bend Up"},
    {val: "finger-tap", text: "Finger Tap"},
    {val: "hammer-on", text: "Hammer On"},
    {val: "palm-mute", text: "Palm Mute"},
    {val: "pull-off", text: "Pull Off"},
    {val: "slide-down", text: "Slide Down"},
    {val: "slide-up", text: "Slide Up"}
  ];
  ops.forEach(function(o){
    sel += "<option value='" + o.val + "'" + (o.val === selected ? " selected" : "") + ">" + o.text + "</option>";
  });
  return sel + "</select>";
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
  let btnOps = {};
  let floatText = "<div>";
  switch(type){
    case "note":
      floatText += "<h2>Note \"" + origTarget.textContent + "\"</h2>";
      floatText += "<input name='update-field' type='text' maxlength='2' value='" + origTarget.textContent + "'/>";
      floatText += "<button name='update-button' class='close-floater'>Update</button>";
      btnOps.updateOne = true; btnOps.delete = true;
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
          inpText += "<input name='update-field-" + c + "' type='number' min='0' max='30' value='" + origTarget.children[c].textContent + "'/>";
        }
        inpText += "</div>";
        floatText += "<h3>Tab Chord \"" + tabText + "\"</h3>";
        floatText += inpText;
        floatText += "<button name='update-button' class='close-floater'>Update All</button>";
        btnOps.updateAll = true; btnOps.delete = true;
      } else {
        floatText += "<h3>Tab \"" + origTarget.textContent + "\"</h3>";
        floatText += "<input name='update-field' type='number' min='0' max='30' value='" + origTarget.textContent + "'/>";
        floatText += "<button name='update-button' class='close-floater'>Update</button>";
        btnOps.updateOne = true; btnOps.delete = true;
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
      floatText += "<h3>" + capitalizeFirstLetters(type, "-", " ") + "</h3>";
      floatText += getSelectOptions(type);
      floatText += "<button name='update-button' class='close-floater'>Update</button>";
      btnOps.updateOne = true; btnOps.delete = true;
      break;
    case "time-signature":
      floatText += "<h3>" + capitalizeFirstLetters(type, "-", " ") + "</h3>";
      btnOps.updateOne = true; btnOps.delete = true;
      break;
    default:
      floatText += "<h3>Add</h3>";
      btnOps.add = true;
  }
  floatText += "<button name='delete-button' class='close-floater'>Delete</button></div>";
  fl.insertAdjacentHTML("afterbegin", floatText);

  // get the ancestor tab container that holds the context menu buttons
  let tc = origTarget.closest(".tn-container");

  if(btnOps.delete){
    // if delete button is clicked, remove the node and redraw tabs
    tc.querySelector("[name='delete-button']").addEventListener("click", function(e){
      let pNode = origTarget.parentNode;
      pNode.removeChild(origTarget);
      tc.update(true);
    });
  }
  if(btnOps.updateAll){
    tc.querySelector("[name='update-button']").addEventListener("click", function(e){
      // multi-option tab is being updated
      let upFields = tc.querySelector("[name='update-fields']");
      for(let i = 0; i < upFields.children.length; i++){
        let val;
        if(upFields.children[i].type === "number"){
          val = upFields.children[i].value;
        }
        origTarget.children[i].textContent = val;
      }
      tc.update(true);
    });
  }
  if(btnOps.updateOne){
    tc.querySelector("[name='update-button']").addEventListener("click", function(e){
      // individual option tab is being updated
      let upField = tc.querySelector("[name='update-field']");
      let val;
      if(upField.type === "number"){
        val = upField.value;
        origTarget.textContent = val;
      } else if(upField.selectedIndex) {
        val = upField.options[upField.selectedIndex].value;
        console.log("Selected value is " + val);
        origTarget.dataset["type"] = val;
      }
      tc.update(true);
    });
  }
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
