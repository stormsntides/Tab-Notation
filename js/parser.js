function parseTabs(text, charSize=5.5, lineSpacing=12){
  // tokenize text and create array to generate string tabs into
	let tokens = tokenize(text);

	// build initial svg to attach parsed tabs to
	let svg = "<svg width='200em' height='20em' viewbox='0 0 1000 100' version='1.1' xmlns='http://www.w3.org/2000/svg'>";
	svg += "<rect fill='white' x='0' y='0' width='1000' height='100'/>";

	// let tablature = [];
	let tabString = "<text x='20'>";

	// TODO convert all text to text path
	let prevStringWrite = 0;

  // currentIndex will hold the indexes of which strings are being written to
  let currentIndex = [];
	let options = {
		showBeats: false,
		palmMute: false,
		beatLength: 1
	};
  for(let z = 0; z < tokens.length; z++){
    let tkn = tokens[z];
    switch(tkn.type){
			case "Tuning":
				// set up the string lines and notes to be displayed
				let lines = "<path fill='transparent' stroke='gray' stroke-width='0.5' d='m 0 " + lineSpacing;
				let notes = "";
				// denote the tuning to be used when selecting notes to be written to
				let re = /[A-G][#b]*/g;
				let buff = [];
				let stringCount = 0;
				while ((buff = re.exec(tkn.value)) !== null) {
					// get appropriate positioning based on line spacing size
					// let yPos = (tablature.length + 1) * lineSpacing;
					let yPos = (stringCount + 1) * lineSpacing;

					lines += " h 2000 m -2000 " + lineSpacing;
					notes += "<tspan x='0' y='" + yPos + "'>" + buff[0] + "</tspan>";
					// tablature.push("<tspan x='20' y='" + yPos + "'>");
					stringCount++;
				}
				lines += "'/>";

				// size the notes display according to how many notes there are and the line spacing
				// notes = "<g><rect fill='white' x='0' y='0' width='15' height='" + ((tablature.length + 1) * lineSpacing) + "'/><text>" + notes + "</text><line stroke='black' stroke-width='1' x1='15' y1='0' x2='15' y2='" + ((tablature.length + 1) * lineSpacing) + "'/></g>";
				notes = "<g><rect fill='white' x='0' y='0' width='15' height='" + ((stringCount + 1) * lineSpacing) + "'/><text>" + notes + "</text><line stroke='black' stroke-width='1' x1='15' y1='0' x2='15' y2='" + ((stringCount + 1) * lineSpacing) + "'/></g>";

				// lines need to go before the notes for proper displaying
				svg += lines + notes;
				break;
			case "Time Signature": break;
			case "Playing Technique":
				// check to see if there is a tab directly after the playing technique
				if(z + 1 < tokens.length && (tokens[z + 1].type === "Tab" || tokens[z + 1].type === "Tab Chord" || prevTkn.type === "Percussion")){
					// apply technique to tab
					tokens[z + 1].modifier = tkn.value;
				}
        break;
      case "String":
      case "String Chord":
				currentIndex = [];
        for(let n = 0; n < tkn.value.length; n++){
					currentIndex.push(tkn.value[n] - 1);
        }
        break;
			case "Percussion":
			case "Tab":
      case "Tab Chord":
				addTabs(tkn);
				addColumn("&nbsp;".repeat(options.beatLength));
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
			case "Beat Length":
				options.beatLength = tkn.value.replace(/\{|\}/g, "");
				break;
			case "Whitespace": break;
			case "Bar Line":
				addColumn(tkn.value);
				break;
      case "Multiply":
        let prevTkn = z - 1 >= 0 ? tokens[z - 1] : undefined;
        if(prevTkn && (prevTkn.type === "Tab" || prevTkn.type === "Tab Chord" || prevTkn.type === "Percussion")){
          let numVal = tkn.value.substring(tkn.value.lastIndexOf("*") + 1);
          let repeat = numVal.length > 0 ? parseInt(numVal) - 1 : 0;

          // repeat how many times specified in the multiply token
          for(let r = 0; r < repeat; r++){
						addTabs(prevTkn);
						addColumn("&nbsp;".repeat(options.beatLength));
          }
        }
        break;
      default: break;
    }
  }

	// svg += "<g><text>";
	// for(let i = 0; i < tablature.length; i++){
	// 	svg += tablature[i] + "</tspan>";
	// }
	// svg += "</text></g></svg>";

	// alt text here:
	svg += "<g>" + tabString + "</g></svg>";

	return svg;

	function addColumn(char){
		// for(let st = 0; st < tablature.length; st++){
		// 	tablature[st] += char;
		// }
		tabString += char;
	}

	function addTabs(tabToken){
		let tabs = tabToken.value;
		let span = {
			start: '<tspan' + (options.palmMute ? ' data-display-bottom="pm"' : '') + (tabToken.modifier ? ' data-display-left="' + tabToken.modifier + '"' : '') + '>',
			end: '</tspan>',
			isModified: tabToken.modifier || options.palmMute
		};

		let numDigits = 0;
		tabs.forEach(function(v){ numDigits = numDigits < v.length ? v.length : numDigits; });
		// loop through all notes that are being written to
		for(let t = 0; t < currentIndex.length; t++){
			// maxT denotes the max value t can be when get token values
			let maxT = t >= tabs.length ? tabs.length - 1 : t;
			// maxT signals to write the last tab to be written on the remaining notes queued
			// tablature[currentIndex[t]] += "&nbsp;".repeat(numDigits - tabs[maxT].length) + tabs[maxT];

			let xPos = ((t <= 1 ? t : 1) * -(charSize)) * numDigits;
			let yPos = (currentIndex[t] + 1) * lineSpacing;
			tabString += "<tspan dx='" + xPos + "' y='" + yPos + "'>" + "&nbsp;".repeat(numDigits - tabs[maxT].length) + tabs[maxT] + "</tspan>";
		}
		// fill remaining strings with correct spacing
		// for(let st = 0; st < tablature.length; st++){
		// 	if(!currentIndex.includes(st)){
		// 		tablature[st] += "&nbsp;".repeat(numDigits);
		// 	}
		// }
	}
}
