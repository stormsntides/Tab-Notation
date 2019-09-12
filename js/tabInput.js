var fontWidthChar;

function textToTab(container, text){
  let tabs = parseTabs(text, fontWidthChar.getBoundingClientRect().width, 12);

  // remove all child nodes
	while(container.firstChild){
		container.removeChild(container.firstChild);
	}
  // add tabs
	container.insertAdjacentHTML("afterbegin", tabs);
}

function inputToTab(e){
  let area = e.target;
  let containers = document.querySelectorAll(".tn-container[name='" + area.getAttribute("for") + "']");

  for(let i = 0; i < containers.length; i++){
    textToTab(containers[i], area.value.trim());
  }
}

function printTabs(container){
  let raw = container.querySelector(".raw-tab");

  if(raw){
    let text = raw.textContent.trim();

    if(text.length > 0){
      let tabs = parseTabs(text, fontWidthChar.getBoundingClientRect().width, 12);

      while(container.firstChild){
        container.removeChild(container.firstChild);
      }

      container.append(raw);
      container.insertAdjacentHTML("beforeend", tabs);
    }
  } else {
    container.insertAdjacentHTML("afterbegin", "<div class='raw-tab'></div>");
  }
}

function editTabs(container){
  let rtt = container.querySelector(".raw-tab").textContent.trim();
  let ta = "<textarea>";
}

// handler when the DOM is fully loaded
var callback = function(){
  if(!document.getElementById("tn-check-width")){
    document.body.insertAdjacentHTML("afterBegin", "<span id='tn-check-width'>0</span>");
  }
  fontWidthChar = document.getElementById("tn-check-width");

  // document.querySelectorAll("textarea").forEach(function(text_area){
  //   text_area.addEventListener("keyup", inputToTab);
  // });

  document.querySelectorAll("textarea").forEach(function(text_area){
    text_area.addEventListener("keyup", function(e){
      let area = e.target;
      let containers = document.querySelectorAll(".tn-container[name='" + area.getAttribute("for") + "']");

      containers.forEach(function(con){
        let raw = con.querySelector(".raw-tab");
        if(raw){
          raw.textContent = area.value.trim();
        } else {
          con.insertAdjacentHTML("afterbegin", "<div class='raw-tab'>" + area.value.trim() + "</div>");
        }
        printTabs(con);
      });

      // for(let i = 0; i < containers.length; i++){
      //   textToTab(containers[i], area.value.trim());
      // }
    });
  });

  document.querySelectorAll(".tn-container").forEach(function(container){
    // if(container.textContent.length > 0){
    //   textToTab(container, container.textContent.trim());
    // }
    printTabs(container);
  });

  // document.querySelectorAll(".tn-container").forEach(function(tnc){
  //   tnc.addEventListener("click", function(e){ editTabs(e.target); });
  // });
};

// check when DOM is fully loaded
if(document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)){
	callback();
} else {
	document.addEventListener("DOMContentLoaded", callback);
}
