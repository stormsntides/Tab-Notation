const ACTIVE_IDS = [];

function parseTabs(text, charSize=5.5, lineSpacing=12){
  // tokenize text and create array to generate string tabs into
	let tokens = tokenize(text);

	// build initial svg to attach parsed tabs to
	let svg = "<svg width='200em' height='20em' viewbox='0 0 1000 100' version='1.1' xmlns='http://www.w3.org/2000/svg'>";
	svg += "<rect fill='white' x='0' y='0' width='1000' height='100'/>";

	// set up path for adding path data to later
	let pathID = generateRandomId();
	let pathString = "<path id='tab-path-" + pathID + "' fill='transparent' d='m " + (charSize * 4) + " " + lineSpacing + " ";
	let tabString = "<text><textPath xmlns:xlink='http://www.w3.org/1999/xlink' xlink:href='#tab-path-" + pathID + "'>";

  // currentIndex will hold the indexes of which strings are being written to
  let currentIndex = [];
	// prevAnchorIndex determines how to move up and down the strings based on last position
	let prevAnchorIndex = 1;
	// holds the total size of all chars in the current writing positions string
	let pathLengthBuff = 0;
	
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
					let yPos = (stringCount + 1) * lineSpacing;

					lines += " h 2000 m -2000 " + lineSpacing;
					notes += "<tspan x='0' y='" + yPos + "'>" + buff[0] + "</tspan>";

					stringCount++;
				}
				lines += "'/>";

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
					currentIndex.push(tkn.value[n]);
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

	tabString += "</textPath></text>";
	pathString += "h " + pathLengthBuff + "'/>";

	svg += "<g>" + pathString + tabString + "</g></svg>";

	return svg;

	function addColumn(char){
		tabString += char;
		pathLengthBuff += (char === "&nbsp;" ? charSize : charSize * char.length);
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
			tabString += "&nbsp;".repeat(numDigits - tabs[maxT].length) + tabs[maxT];

			// get the x and y positions to adjust the path depending on chords; increase length based on char amount and size
			let xPos = ((t <= 1 ? t : 1) * -(charSize)) * numDigits;
			let yPos = (currentIndex[t] * lineSpacing) - (prevAnchorIndex * lineSpacing);
			let length = numDigits * charSize;

			// if no change in x or y, buffer length
			if(xPos === 0 && yPos === 0){
				pathLengthBuff += length;
			} else {
				// if change in x or y, check length buffer and add if greater than 0, then change writing position; reset buffer to new length
				if(pathLengthBuff > 0){
					pathString += "h " + pathLengthBuff + " ";
				}
				pathString += "m " + xPos + " " + yPos + " ";
				pathLengthBuff = length;
			}

			// set previous anchor index to determine which y direction to move on next tab if string change occurs
			prevAnchorIndex = currentIndex[t];
		}
	}

	function generateRandomId(){
		let vals = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];
		let hash = "";
		let unique = false;

		while(!unique){
			for(let i = 0; i < 4; i++){
				let ri = Math.floor(Math.random() * vals.length);
				hash += vals[ri];
			}
			unique = !ACTIVE_IDS.includes(hash);
		}

		ACTIVE_IDS.push(hash);
		return hash;
	}
}
