/*
What are my options for tokenizing the input?

- All note names must be capitalized: E B G D A E
- Brackets ([]) should begin the tab notation by describing the tuning and the time signature: [EBGDAE 4/4]
- Tabs can be written as any number literal: 1 2 7 15 24
- Strings can be written as "S" followed by a number literal: S1, S5, S8
- Pound sign (#) refers to sharp notes: A#
- Lowercase b (b) refers to flat notes: Ab
- Forward slash (\) is a slide down: 4\1
- Back slash (/) is a slide up: 4/7
- Dash (-) is a string range: S5-2 3,5
- Comma (,) is a chord: S5,4,3 3,5,7
- Caret (^) is a bend to note: 7^8 3^5^3
- Lowercase h (h) is a hammer-on: 7h8 3h5h7
- Lowercase p (p) is a pull-off: 7p5 5p3p0
- Lowercase t (t) is a finger-tap: t15 t17
- Parentheses (()) are palm mutes: (0) (0) (0 1 3 1 0)


Character Tokens
-  A-G = Note
-    S = String
-  0-9 = Tab
-  #|b = Note Modifier
-    / = Slide Up
-    \ = Slide Down
-    ^ = Bend Up
-    v = Bend Down (release)
-    h = Hammer On
-    p = Pull Off
-    t = Finger Tap
-    - = Chord Combiner
-    : = Time Sig Combiner
-    [ = Open Tab Info
-    ] = Close Tab Info
-    ( = Open Palm Mute
-    ) = Close Palm Mute


[D#A#F#C#G#D#G# 4:4] F# 10^11 C# 0 (0) 3 4^5 0 (0) 0 3 4^5 0 0 (0) F# 8 C# 4 (0 0)

[EBGDAEA 4:4] A' 0 1 E' 5 A' 0 0 (0 0) 0 1 E' 5 A' 0 0 (0 0) 0 1 E' 4 A' 1 0 A 1 E' 3 A' 1

[EBGDAEA 4:4] S7 0 1 S6 5 S7 0 0 (0 0) 0 1 S6 5 S7 0 0 (0 0) 0 1 S6 4 S7 1 0 S5 1 S6 3 S7 1
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

function isString(ch) {
  return /S/.test(ch);
}

function isTab(ch) {
  return /\d/.test(ch);
}

function isPercussion(ch) {
  return /x/.test(ch);
}

function isNoteModifier(ch) {
  return /#|b/.test(ch);
}

function isTabMultiplier(ch) {
  return /\*/.test(ch);
}

function isSlideUp(ch){
  return /\//.test(ch);
}

function isSlideDown(ch){
  return /\\/.test(ch);
}

function isBendUp(ch){
  return /\^/.test(ch);
}

function isBendDown(ch){
  return /v/.test(ch);
}

function isHammerOn(ch){
  return /h/.test(ch);
}

function isPullOff(ch){
  return /p/.test(ch);
}

function isFingerTap(ch){
  return /t/.test(ch);
}

function isChordCombiner(ch) {
  return /,|-/.test(ch);
}

function isTimeSigCombiner(ch) {
  return /:/.test(ch);
}

function isOpenBeatLength(ch) {
  return /\{/.test(ch);
}

function isCloseBeatLength(ch) {
  return /\}/.test(ch);
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

function isBarLine(ch) {
  return /\|/.test(ch);
}

function isComment(ch) {
  return /"/.test(ch);
}

function tokenize(text) {
  let str = text.split("");

  let result = [];
  let buffer = [];

  let ignore = false;
  let tabInfo = false;
  let beatLength = false;

  for(let i = 0; i < str.length; i++) {
    let char = str[i];

    if(!ignore && isWhitespace(char)) {
      checkBuffer();
      result.push(new Token("Whitespace", char));
    } else if (!ignore && isNote(char)) {
      buffer.push(char);
    } else if(!ignore && isString(char)) {
      checkBuffer();
      buffer.push(char);
    } else if(!ignore && isTab(char)) {
      buffer.push(char);
    } else if (!ignore && isPercussion(char)) {
      checkBuffer();
      result.push(new Token("Percussion", char));
    } else if (!ignore && isNoteModifier(char)) {
      buffer.push(char);
    } else if (!ignore && isTabMultiplier(char)) {
      checkBuffer();
      buffer.push(char);

      let next = 0;
      for(let n = 1; n <= 2; n++){
        if(isTab(str[i + n])) {
          buffer.push(str[i + n]);
          next = n;
        }
      }
      result.push(new Token("Multiply", buffer.join("")));
      buffer = [];
      i += next;
    } else if (!ignore && isSlideUp(char)) {
      checkBuffer();
      result.push(new Token("Slide Up", char));
    } else if (!ignore && isSlideDown(char)) {
      checkBuffer();
      result.push(new Token("Slide Down", char));
    } else if (!ignore && isBendUp(char)) {
      checkBuffer();
      result.push(new Token("Bend Up", char));
    } else if (!ignore && isBendDown(char)) {
      checkBuffer();
      result.push(new Token("Bend Down", char));
    } else if (!ignore && isHammerOn(char)) {
      checkBuffer();
      result.push(new Token("Hammer On", char));
    } else if (!ignore && isPullOff(char)) {
      checkBuffer();
      result.push(new Token("Pull Off", char));
    } else if (!ignore && isFingerTap(char)) {
      checkBuffer();
      result.push(new Token("Finger Tap", char));
    } else if (!ignore && isChordCombiner(char)) {
      buffer.push(char);
    } else if (!ignore && isTimeSigCombiner(char)) {
      buffer.push(char);
    } else if (!ignore && isOpenPalmMute(char)) {
      checkBuffer();
      result.push(new Token("Open Palm Mute", char));
    } else if (!ignore && isClosePalmMute(char)) {
      checkBuffer();
      result.push(new Token("Close Palm Mute", char));
    } else if (!ignore && isOpenBeatLength(char)) {
      checkBuffer();
      buffer.push(char);
      beatLength = true;
    } else if (!ignore && isCloseBeatLength(char)) {
      buffer.push(char);
      checkBuffer();
      beatLength = false;
    } else if (!ignore && isOpenTabInfo(char)) {
      checkBuffer();
      buffer.push(char);
      tabInfo = true;
      // result.push(new Token("Open Tab Info", char));
    } else if (!ignore && isCloseTabInfo(char)) {
      buffer.push(char);
      checkBuffer();
      tabInfo = false;
      // result.push(new Token("Close Tab Info", char));
    } else if (!ignore && isBarLine(char)) {
      checkBuffer();
      result.push(new Token("Bar Line", char));
    } else if (isComment(char)) {
      checkBuffer(ignore);
      ignore = !ignore;
    } else if(!ignore && (tabInfo || beatLength)){
      buffer.push(char);
    }
  }

  checkBuffer(ignore);
  return result;

  function checkBuffer(asComments=false) {
    if(buffer.length){
      let bufferString = buffer.join("");
      if(!asComments){
        if(/\[.*\]/.test(bufferString)) {
          result.push(new Token("Tab Info", bufferString));
          buffer = [];
        } else if(/\{\d+(?:\.\d+)*?\}/.test(bufferString)) {
          result.push(new Token("Beat Length", bufferString));
          buffer = [];
        } else if(/S(?:\d+,)+\d+/.test(bufferString)) {
          result.push(new Token("String Chord", bufferString.substring(1).split(",")));
          buffer = [];
        } else if(/S(?:\d+-)+\d+/.test(bufferString)) {
          result.push(new Token("String Chord Range", bufferString.substring(1).split("-")));
          buffer = [];
        } else if(/(?:\d+,)+\d+/.test(bufferString)) {
          result.push(new Token("Tab Chord", bufferString.split(",")));
          buffer = [];
        } else if(/\d+:\d+/.test(bufferString)) {
          result.push(new Token("Time Signature", bufferString.split(":")));
          buffer = [];
        } else if(/(?:[A-G][#b]*){2,}/.test(bufferString)){
          result.push(new Token("Tuning", bufferString));
          buffer = [];
        } else if(/S\d+/.test(bufferString)){
          result.push(new Token("String", [bufferString.substring(1)]));
          buffer = [];
        } else if(/\d+/.test(bufferString)){
          result.push(new Token("Tab", [bufferString]));
          buffer = [];
        }
      } else {
        result.push(new Token("Comment", bufferString));
        buffer = [];
      }
    }
  }
}
