var tabText = document.querySelectorAll("textarea");

tabText.forEach(function(text_area){
  text_area.addEventListener("keyup", inputToTab);
});

function inputToTab(e){
  let area = e.target;
  let staves = document.querySelectorAll(".staff[name='" + area.getAttribute("for") + "']");

  for(let i = 0; i < staves.length; i++){
    let staff = staves[i];
    let tabs = parseTabs(area.value.trim());

    staff.innerHTML = "";
    for(let t = 0; t < tabs.length; t++){
      staff.innerHTML += tabs[t].toTabString();
    }
  }
}

document.querySelectorAll(".staff").forEach(function(staff){
  if(staff.innerHTML.length > 0){
    let tabs = parseTabs(staff.innerHTML.trim());

    staff.innerHTML = "";
    for(let t = 0; t < tabs.length; t++){
      staff.innerHTML += tabs[t].toTabString();
    }
  }
});
