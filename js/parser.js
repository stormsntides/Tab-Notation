function toTabString(){
	// return '<div class="string"><div class="tab"><span class="note-name">' + this.stringName + (this.stringName.length < 2 ? " " : "") + '</span>' + this.tabs.join("") + '</div></div>';
	let currentTuning = "";
	let finalStr = '<div class="tab-container">';
	this.forEach(function(measure){
		let measureTuning = measure.reduce(function(acc, val){ return acc + val.stringName; });
		if(currentTuning !== measureTuning){
			currentTuning = measureTuning;
			finalStr += measure.getTuningString();
		}
		finalStr += measure.getTabString();
	});
	finalStr += '</div>';
	return finalStr;
}

function getTuningString(){
	let str = '<div class="tuning">';
	this.forEach(function(tabString){
		str += '<div class="note-name">' + tabString.stringName + '</div>';
	});
	str += '</div>';
	return str;
}

function getTabString(){
	let str = '<div class="measure">';
	this.forEach(function(tabString){
		str += '<div class="tab">' + tab.tabs.join("") + '</div>';
	});
	str += '</div>';
	return str;
}

function toTabNotation(text){
	let tabs = parseTabs(text);

}

function parseTabs(text){
  // tokenize text and create array to generate string tabs into
	let tokens = tokenize(text);

	// tablature will hold completed measures, measures will hold in progress tabs
	let tablature = [];
	tablature.toTabString = toTabString;
	let currentMeasure = [];
	currentMeasure.getTuningString = getTuningString;
	currentMeasure.getTabString = getTabString;

  // currentIndex will hold the indexes of which strings are being written to
  let currentIndex = [];
	let options = {
		showBeats: false,
		palmMute: false
	};
  for(let z = 0; z < tokens.length; z++){
    let tkn = tokens[z];
    switch(tkn.type){
			case "Tuning":
				// denote the tuning to be used when selecting notes to be written to
				let re = /[A-G][#b]*/g;
				let buff = [];
				while ((buff = re.exec(tkn.value)) !== null) {
					currentMeasure.push({stringName: buff[0], tabs: []});
				}
				break;
			case "Time Signature": break;
			case "Playing Technique":
				if(z + 1 < tokens.length && (tokens[z + 1].type === "Tab" || tokens[z + 1].type === "Tab Chord" || prevTkn.type === "Percussion")){
					tokens[z + 1].modifier = tkn.value;
				}
        break;
      case "Note":
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
          for(let i = 0; i < currentMeasure.length; i++){
            if(currentMeasure[i].stringName === sub){
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
			case "Percussion":
			case "Tab":
      case "Tab Chord":
				addTabs(tkn);
				addColumn(" ");
        break;
      case "Open Palm Mute":
        options.palmMute = true;
        break;
      case "Close Palm Mute":
        options.palmMute = false;
        break;
      case "Tab Info":
				let info = tkn.value.replace(/\[|\]/g, "").split(" ");
				for(let ti = 0; ti < info.length; ti++){
					if(/beats=on/.test(info[ti])){
						options.showBeats = true;
					}
				}
				break;
			case "Whitespace": break;
			case "Bar Line":
				// addColumn(tkn.value + " ");
				// addColumn('<div class="bar"></div>' + ' ');
				tablature.push(currentMeasure);
				currentMeasure.forEach(function(strt){
					strt.tabs = [];
				});
				break;
      case "Multiply":
        let prevTkn = z - 1 >= 0 ? tokens[z - 1] : undefined;
        if(prevTkn && (prevTkn.type === "Tab" || prevTkn.type === "Tab Chord" || prevTkn.type === "Percussion")){
          let numVal = tkn.value.substring(tkn.value.lastIndexOf("*") + 1);
          let repeat = numVal.length > 0 ? parseInt(numVal) - 1 : 0;

          // repeat how many times specified in the multiply token
          for(let r = 0; r < repeat; r++){
						addTabs(prevTkn);
						addColumn(" ");
          }
        }
        break;
      default: break;
    }
  }

  // return currentMeasure;
	return tablature;

	function addColumn(char){
		currentMeasure.forEach(function(st){
			st.tabs.push(char);
		});
	}

	function addTabs(tabToken){
		let tabs = tabToken.value;
		let span = {
			start: '<span class="modifier"' + (options.palmMute ? ' data-display-bottom="pm"' : '') + (tabToken.modifier ? ' data-display-left="' + tabToken.modifier + '"' : '') + '>',
			end: '</span>',
			isModified: tabToken.modifier || options.palmMute
		};

		let numDigits = 0;
		// loop through all notes that are being written to
		for(let t = 0; t < currentIndex.length; t++){
			// maxT denotes the max value t can be when get token values
			let maxT = t >= tabs.length ? tabs.length - 1 : t;
			// maxT signals to write the last tab to be written on the remaining notes queued
			let value = span.isModified ? span.start + tabs[maxT] + span.end : tabs[maxT];
			currentMeasure[currentIndex[t]].tabs.push(value);
			// check if largest number of digits in token value so far
			numDigits = numDigits < tabs[maxT].length ? tabs[maxT].length : numDigits;
		}
		// fill remaining strings with correct spacing
		for(let st = 0; st < currentMeasure.length; st++){
			if(!currentIndex.includes(st)){
				currentMeasure[st].tabs.push(" ".repeat(numDigits));
			}
		}
	}
}