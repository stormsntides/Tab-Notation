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

function isPercussion(ch) {
  return /x/.test(ch);
}

function isNoteModifier(ch) {
  return /#|b/.test(ch);
}

function isNotePosition(ch) {
  return /'/.test(ch);
}

function isTabMultiplier(ch) {
  return /\*/.test(ch);
}

function isPlayingTechnique(ch) {
  return /h|p|t|v|\^|\\|\//.test(ch);
}

function isChordCombiner(ch) {
  return /-/.test(ch);
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

  for(let i = 0; i < str.length; i++) {
    let char = str[i];

    if(!ignore && isWhitespace(char)) {
      checkBuffer();
      result.push(new Token("Whitespace", char));
    } else if (!ignore && isNote(char)) {
      buffer.push(char);
    } else if(!ignore && isTab(char)) {
      buffer.push(char);
    } else if (!ignore && isPercussion(char)) {
      checkBuffer();
      result.push(new Token("Percussion", char));
    } else if (!ignore && isNoteModifier(char)) {
      buffer.push(char);
    } else if (!ignore && isNotePosition(char)) {
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
    } else if (!ignore && isPlayingTechnique(char)) {
      checkBuffer();
      result.push(new Token("Playing Technique", char));
    } else if (!ignore && isChordCombiner(char)) {
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
    } else if (!ignore && isCloseBeatLength(char)) {
      buffer.push(char);
      checkBuffer();
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
    } else if(!ignore && tabInfo){
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
        } else if(/(?:[A-G][#b]*'*-)+[A-G][#b]*'*/.test(bufferString)) {
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
          result.push(new Token("Note", [bufferString]));
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
