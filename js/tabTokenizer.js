/*
What are my options for tokenizing the input?

- All note names must be capitalized: E B G D A E
- When referring to a note that has doubles, the apostrophe (') key can be used to signify where it comes in the tuning (i.e. is it the second appearance for that note? Third?): E refers to the first E that appears, E' refers to the second E that appears
- Brackets ([]) should begin the tab notation by describing the tuning and the time signature: [EBGDAE 4/4]
- Tabs can be written as any number literal: 1 2 7 15 24
- Pound sign (#) refers to sharp notes: A#
- Lowercase b (b) refers to flat notes: Ab
- Forward slash (\) is a slide down: 4\1
- Back slash (/) is a slide up: 4/7
- Dash (-) is a chord: A-D 3-5
- Caret (^) is a bend to note: 7^8 3^5^3
- Lowercase h (h) is a hammer-on: 7h8 3h5h7
- Lowercase p (p) is a pull-off: 7p5 5p3p0
- Lowercase t (t) is a finger-tap: t15 t17
- Parentheses (()) are palm mutes: (0) (0) (0 1 3 1 0)


Character Tokens
-  A-G = Note
-  0-9 = Tab
-  #|b = Note Modifier
-    ' = Note Position
-  /|\|^|h|p|t = Playing Technique
-    - = Chord Combiner
-    : = Time Sig Combiner
-    [ = Open Tab Info
-    ] = Close Tab Info
-    ( = Open Palm Mute
-    ) = Close Palm Mute


[D#A#F#C#G#D#G# 4:4] F# 10^11 C# 0 (0) 3 4^5 0 (0) 0 3 4^5 0 0 (0) F# 8 C# 4 (0 0)

[EBGDAEA 4:4] A' 0 1 E' 5 A' 0 0 (0 0) 0 1 E' 5 A' 0 0 (0 0) 0 1 E' 4 A' 1 0 A 1 E' 3 A' 1
*/

function Token(type, value) {
  this.type = type;
  this.value = value;
}

function isWhitespace(ch) {
  return /\s/.test(ch);
}

function isNote(ch) {
  return /[A-G]/.test(ch);
}

function isTab(ch) {
  return /\d/.test(ch);
}

function isNoteModifier(ch) {
  return /#|b/.test(ch);
}

function isNotePosition(ch) {
  return /'/.test(ch);
}

function isPlayingTechnique(ch) {
  return /h|p|t|\^|\\|\//.test(ch);
}

function isChordCombiner(ch) {
  return /-/.test(ch);
}

function isOpenTabInfo(ch) {
  return /\[/.test(ch);
}
function isCloseTabInfo(ch) {
  return /\]/.test(ch);
}

function isOpenPalmMute(ch) {
  return /\(/.test(ch);
}

function isClosePalmMute(ch) {
  return /\)/.test(ch);
}

function tokenize(text) {
  let str = text.split("");

  let result = [];
  let buffer = [];

  str.forEach(function (char, i) {
    if(isWhitespace(char)) {
      checkBuffer();
      result.push(new Token("Whitespace", char));
    } else if (isNote(char)) {
      buffer.push(char);
    } else if(isTab(char)) {
      buffer.push(char);
    } else if (isNoteModifier(char)) {
      buffer.push(char);
    } else if (isNotePosition(char)) {
      buffer.push(char);
    } else if (isPlayingTechnique(char)) {
      checkBuffer();
      result.push(new Token("Playing Technique", char));
    } else if (isChordCombiner(char)) {
      buffer.push(char);
    } else if (isOpenPalmMute(char)) {
      checkBuffer();
      result.push(new Token("Open Palm Mute", char));
    } else if (isClosePalmMute(char)) {
      checkBuffer();
      result.push(new Token("Close Palm Mute", char));
    } else if (isOpenTabInfo(char)) {
      checkBuffer();
      result.push(new Token("Open Tab Info", char));
    } else if (isCloseTabInfo(char)) {
      checkBuffer();
      result.push(new Token("Close Tab Info", char));
    }
  });

  checkBuffer();
  return result;

  function checkBuffer() {
    if(buffer.length){
      let bufferString = buffer.join("");
      if(/(?:[A-G][#b]*'*-)+[A-G][#b]*'*/.test(bufferString)) {
        result.push(new Token("Note Chord", bufferString.split("-")));
        buffer = [];
      } else if(/(?:\d+-)+\d+/.test(bufferString)) {
        result.push(new Token("Tab Chord", bufferString.split("-")));
        buffer = [];
      } else if(/\d+:\d+/.test(bufferString)) {
        result.push(new Token("Time Signature", bufferString));
        buffer = [];
      } else if(/(?:[A-G][#b]*){2,}/.test(bufferString)){
        result.push(new Token("Tuning", bufferString));
        buffer = [];
      } else if(/[A-G][#b]*'*/.test(bufferString)){
        result.push(new Token("Note", bufferString));
        buffer = [];
      } else if(/\d+/.test(bufferString)){
        result.push(new Token("Tab", bufferString));
        buffer = [];
      }
    }
  }
}


// parser code

function toTabString(){
	return this.stringName + (this.stringName.length < 2 ? " |" : "|") + this.tabs;
}

function parseTabs(text){
  // tokenize text and create array to generate string tabs into
	let tokens = tokenize(text);
	let stringTabs = [];

  // currentIndex will hold the indexes of which strings are being written to
  let currentIndex = [];
  // isMuted refers to palm mutes
  let isMuted = false;
  tokens.forEach(function(tkn, tkInd){
    switch(tkn.type){
      case "Whitespace":
        // write to each string index currently being written to
        currentIndex.forEach(function(ind){
          stringTabs[ind].tabs += " ";
        });
        break;
      case "Note":
        // get the index of the apostrophe symbol to figure out which string is being refered to
        let mod = tkn.value.indexOf("'");
        // 0 pos refers to first mention of note name, 1 is second, 2 is third, etc...
        let pos = mod > 0 ? tkn.value.substring(mod).length : 0;
        // the actual note (e.g. A#)
        let sub = mod > 0 ? tkn.value.substring(0, mod) : tkn.value;

        // loop through and get the index of the note that is going to be written to
        for(let i = 0; i < stringTabs.length; i++){
          if(stringTabs[i].stringName === sub){
            if(pos <= 0){
              currentIndex = [i];
              break;
            } else {
              pos--;
            }
          }
        }
        break;
      case "Tab":
        // if value is muted, notate as such
        let value = isMuted ? "(" + tkn.value + ")" : tkn.value;
        // place the value on each string that is being written to
        currentIndex.forEach(function(ind){
          stringTabs[ind].tabs += value;
        });
        break;
      case "Note Chord":
        currentIndex = [];
        for(let n = 0; n < tkn.value.length; n++){
          // get the index of the apostrophe symbol to figure out which string is being refered to
          let mod = tkn.value[n].indexOf("'");
          // 0 pos refers to first mention of note name, 1 is second, 2 is third, etc...
          let pos = mod > 0 ? tkn.value[n].substring(mod).length : 0;
          // the actual note (e.g. A#)
          let sub = mod > 0 ? tkn.value[n].substring(0, mod) : tkn.value[n];

          // loop through and get the index of each note that is going to be written to
          for(let i = 0; i < stringTabs.length; i++){
            if(stringTabs[i].stringName === sub){
              if(pos <= 0){
                currentIndex.push(i);
                break;
              } else {
                pos--;
              }
            }
          }
        }
        break;
      case "Tab Chord":
        // loop through all notes that are being written to
        for(let t = 0; t < currentIndex.length; t++){
          // maxT denotes the max value t can be when get token values
          let maxT = t >= tkn.value.length ? tkn.value.length - 1 : t;
          // maxT signals to write the last tab to be written on the remaining notes queued
          let value = isMuted ? "(" + tkn.value[maxT] + ")" : tkn.value[maxT];
          stringTabs[currentIndex[t]].tabs += value;
        }
        break;
      case "Playing Technique":
        // write the playing technique to be used on each note being written to (e.g. h, p, ^, /, etc...)
        currentIndex.forEach(function(ind){
          stringTabs[ind].tabs += tkn.value;
        });
        break;
      case "Time Signature": break;
      case "Tuning":
        // denote the tuning to be used when selecting notes to be written to
				let re = /[A-G][#b]*/g;
				let buff = [];
				while ((buff = re.exec(tkn.value)) !== null) {
					stringTabs.push({stringName: buff[0], tabs: "", toTabString: toTabString});
				}
        break;
      case "Open Palm Mute":
        isMuted = true;
        break;
      case "Close Palm Mute":
        isMuted = false;
        break;
      case "Open Tab Info": break;
      case "Close Tab Info": break;
      default: break;
    }
    checkLengths();
  });

  return stringTabs;

  function checkLengths() {
    let numTabs = stringTabs.length;
    let longestLength = -1;

    // check each string once for length, and then again to add spaces
    for(let l = 0; l < numTabs * 2; l++){
      if(l < numTabs){
        // keep track of which string has the the most characters
        longestLength = longestLength < stringTabs[l].tabs.length ? stringTabs[l].tabs.length : longestLength;
      } else {
        // if the current string has less characters than the longest, add space until length matches
        if(longestLength > stringTabs[l % numTabs].tabs.length){
          let diff = longestLength - stringTabs[l % numTabs].tabs.length;
          stringTabs[l % numTabs].tabs += " ".repeat(diff);
        }
      }
    }
  }
}



// input code

var tabText = document.querySelectorAll("textarea");

tabText.forEach(function(text_area){
  text_area.addEventListener("keyup", inputToTab);
});

function inputToTab(e){
  let area = e.target;
  let staves = document.querySelectorAll(".staff[name='" + area.getAttribute("name") + "']");

  for(let i = 0; i < staves.length; i++){
    let staff = staves[i];
    let tabs = parseTabs(area.value.trim());

    staff.innerHTML = "";
    for(let t = 0; t < tabs.length; t++){
      staff.innerHTML += '<div class="tab">' + tabs[t].toTabString() + '</div><div class="string"></div>';
    }
  }
}

document.querySelectorAll(".staff").forEach(function(staff){
  if(staff.innerHTML.length > 0){
    let tabs = parseTabs(staff.innerHTML.trim());

    staff.innerHTML = "";
    for(let t = 0; t < tabs.length; t++){
      staff.innerHTML += '<div class="tab">' + tabs[t].toTabString() + '</div><div class="string"></div>';
    }
  }
});
