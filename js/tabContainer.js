// var textHistory;

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
    tc.draw();
  });
  tc.querySelector(".raw-tab").addEventListener("keypress", function(e){
    if(e.key.toLowerCase() === "enter"){
      e.preventDefault();
      tc.draw();
      e.target.closest(".floater").style.display = "none";
    }
  });
}
