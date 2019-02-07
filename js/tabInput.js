var tabText = document.querySelectorAll("textarea");

tabText.forEach(function(text_area){
  text_area.addEventListener("keyup", inputToTab);
});

function textToTab(container, text){
  let tabs = parseTabs(text);

  container.innerHTML = "";
  container.innerHTML += tabs.getTabs();
}

function inputToTab(e){
  let area = e.target;
  let containers = document.querySelectorAll(".tn-container[name='" + area.getAttribute("for") + "']");

  for(let i = 0; i < containers.length; i++){
    textToTab(containers[i], area.value.trim());
  }
}

document.querySelectorAll(".tn-container").forEach(function(container){
  if(container.innerHTML.length > 0){
    textToTab(container, container.innerHTML.trim());
  }
});
