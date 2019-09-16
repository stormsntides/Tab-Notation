const SETTINGS = {
  charSize: 6,
  lineSpacing: 12
};

function loadSettings(){
  if(!document.getElementById("tn-check-width")){
    document.body.insertAdjacentHTML("afterBegin", "<span id='tn-check-width'>0</span>");
  }
  fontWidthChar = document.getElementById("tn-check-width");
  SETTINGS.charSize = fontWidthChar.getBoundingClientRect().width;
};

loadSettings();
