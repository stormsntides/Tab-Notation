var tabText = document.querySelectorAll("textarea");

tabText.forEach(function(text_area){
  text_area.addEventListener("keyup", inputToTab);
});

function textToTab(staff, text){
  let tabs = parseTabs(text);

  staff.innerHTML = "";
  staff.innerHTML += tabs.toTabString();
  // for(let t = 0; t < tabs.length; t++){
  //   staff.innerHTML += tabs[t].toTabString();
  // }
}

function inputToTab(e){
  let area = e.target;
  let staves = document.querySelectorAll(".staff[name='" + area.getAttribute("for") + "']");

  for(let i = 0; i < staves.length; i++){
    textToTab(staves[i], area.value.trim());
  }
}

document.querySelectorAll(".staff").forEach(function(staff){
  if(staff.innerHTML.length > 0){
    textToTab(staff, staff.innerHTML.trim());
  }
});
