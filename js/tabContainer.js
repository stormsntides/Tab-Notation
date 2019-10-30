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
        <button class="reveal-btn" data-target="note-options-${id}">Note</button><button class="reveal-btn" data-target="tab-options-${id}">Tab</button><button class="reveal-btn" data-target="modifier-options-${id}">Modifier</button><button class="reveal-btn" data-target="time-sig-options-${id}">Time Signature</button>
      </div>
      <ul class="options-group">
        <li id="note-options-${id}" style="display: none;">
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
        </li>
        <li id="tab-options-${id}" style="display: none;">
          <label>Input Tab
            <input type="text" value="0">
          </label>
        </li>
        <li id="modifier-options-${id}" style="display: none;">
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
        </li>
        <li id="time-sig-options-${id}" style="display: none;">
          <label>Beats Per Measure
            <input type="number" min="1" max="99" size="10" value="4">
          </label>
          <label>Dominant Beat
            <input type="number" min="1" max="99" size="10" value="4">
          </label>
        </li>
      </ul>
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
    let evtTarg = getEventTarget(e, ".context-floater-trigger");
    if(evtTarg){
      // display menu
      e.preventDefault();
      let menu = tc.querySelector("#" + evtTarg.dataset["target"]);
      menu.style.display = "inline";
      menu.style.left = e.pageX + "px";
      menu.style.top = e.pageY + "px";
      // get clicked data
      let origTarg = e.target.dataset["type"] ? e.target : e.target.closest("[data-type]");
      if(origTarg){
        switch(origTarg.dataset["type"]){
          case "note":
            let sels = tc.querySelectorAll("#note-options-" + id + " select");
            sels[0].value = origTarg.textContent[0];
            if(origTarg.textContent.length > 1){ sels[1].value = origTarg.textContent[1]; }
            else { sels[1].value = "natural"; }
          case "tab":
          case "tab-chord":
          case "time-signature":
          default:
        }
      }
    }
  });
  tc.querySelectorAll(".reveal-btn").forEach(function(btn){
    btn.addEventListener("click", function(e){
      let targ = tc.querySelector("#" + e.target.dataset["target"]);
      let parent = targ.parentNode;
      for(let i = 0; i < parent.children.length; i++){
        parent.children[i].style.display = "none";
      }
      targ.style.display = "inline";
    });
  });
}
