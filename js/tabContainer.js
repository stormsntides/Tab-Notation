function update(redraw){
  // unparse HTML into tab text and insert new tabs into raw tabs element
  this.querySelector(".raw-tab").value = unparseTabs(this).trim();
  if(redraw){ this.draw(); }
}

function draw(){
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
  // remove all children if any
  tc.clear();

  // add necessary elements
  let id = tc.dataset["tabId"];
  let buildText = `
    <img class="floater-trigger mg-bottom click-icon" data-target="floater-${id}" src="./resources/pencil.svg"/>
    <div id="floater-${id}" class="floater">
      <textarea class="raw-tab"></textarea>
      <button class="close-floater generate">Generate Tabs</button>
    </div>
    <div id="context-floater-${id}" class="floater">
      <h2>Modify</h2>
      <div class="button-group">
        <button class="reveal-btn" data-target="note-options-${id}">Note</button>
        <button class="reveal-btn" data-target="tab-options-${id}">Tab</button>
        <button class="reveal-btn" data-target="modifier-options-${id}">Modifier</button>
        <button class="reveal-btn" data-target="tim-sig-options-${id}">Time Signature</button>
      </div>
      <div id="note-options-${id}">
        <label>Select Note
          <select>
            <option selected value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="E">E</option><option value="F">F</option><option value="G">G</option>
          </select>
        </label>
        <label>Select Modifier
          <select>
            <option selected value="natural">Natural</option><option value="b">Flat</option><option value="#">Sharp</option>
          </select>
        </label>
      </div>
      <div id="tab-options-${id}">
        <label>Input Tab
          <input type="text">
        </label>
      </div>
      <div id="modifier-options-${id}">
        <label>Select Modifier
          <select>
            <option selected value="bar-line">Bar Line</option>
            <option value="bend-down">Bend Down</option>
            <option value="bend-up">Bend Up</option>
            <option value="finger-tap">Finger Tap</option>
            <option value="hammer-on">Hammer On</option>
            <option value="palm-mute">Palm Mute</option>
            <option value="pull-off">Pull Off</option>
            <option value="slide-down">Slide Down</option>
            <option value="slide-up">Slide Up</option>
          </select>
        </label>
      </div>
      <div id="time-sig-options-${id}">
        <label>Beats Per Measure
          <input type="number" min="1">
        </label>
        <label>Dominant Beat
          <input type="number" min="1">
        </label>
      </div>
      <div class="button-group">
        <button>Add</button><button>Update</button><button>Delete</button>
      </div>
    </div>
    <div class="tn-content context-floater-trigger" data-target="context-floater-${id}"></div>
  `;
  tc.insertAdjacentHTML("afterbegin", buildText);
  // generate svg to draw
  tc.querySelector(".generate").addEventListener("click", function(e){
    tc.draw();
  });
  // generate svg to draw when enter key is pressed
  tc.querySelector(".raw-tab").addEventListener("keypress", function(e){
    if(e.key.toLowerCase() === "enter"){
      e.preventDefault();
      tc.draw();
      e.target.closest(".floater").style.display = "none";
    }
  });
  tc.querySelector(".context-floater-trigger").addEventListener("contextmenu", function(e){
    console.log(e.target);
    let evtTarg = getEventTarget(e, ".context-floater-trigger");
    if(evtTarg){
      e.preventDefault();
      let menu = tc.querySelector("#" + evtTarg.dataset["target"]);
      menu.style.display = "inline";
      menu.style.left = e.pageX + "px";
      menu.style.top = e.pageY + "px";
    }
    // let svgTarg = getEventTarget(e, ".context-floater-trigger > svg");
    // if(svgTarg){
    //   e.preventDefault();
    //   let trig = svgTarg.parentNode;
    //   displayContextMenu(e, trig);
    // }
  });
}
