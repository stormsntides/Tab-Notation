const ACTIVE_IDS = [];

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

function createBuilder(charSize, lineSpacing){
	return {
		text: {
			id: generateRandomId(),
			path: [],
			tabs: "",
			mods: "",
			addToPath: function(cmd, vals){
				switch(cmd){
					case "m": this.path.push({ type: "m", x: vals[0], y: vals[1] }); break;
					case "h":
						let last = this.path.length - 1;
						if(last >= 0 && this.path[last].type === "h"){
							this.path[last].x += vals[0];
						} else {
							this.path.push({ type: "h", x: vals[0] });
						}
					default: break;
				}
			},
			getPath: function(){
				console.log(this.path);
				// if(this.path.length > 0){
					return this.path.reduce(function(acc, p){
						return acc + " " + p.type + " " + p.x + (p.y ? " " + p.y : "");
					}, "");
				// }
				// return "";
			},
			getTextAndPath: function(){
				let p = "<path id='tab-path-" + this.id + "' fill='transparent' d='m " + (charSize * 4) + " " + lineSpacing + this.getPath() + "'/>";
				let t = "<text><textPath xmlns:xlink='http://www.w3.org/1999/xlink' xlink:href='#tab-path-" + this.id + "'>" + this.tabs + "</textPath></text>";
				return "<g>" + p + t + "</g>";
			},
			tabLength: function(){
				return this.tabs.replace(/&nbsp;/gm, " ").length;
			}
		},
		tuning: [],
		strings: {
			toWrite: [],
			prevAnchor: 1
		},
		clear: function(){
			this.text.id = generateRandomId();
			this.text.path = [];
			this.text.tabs = "";
			this.text.mods = "";
			this.tuning = [];
			this.strings.toWrite = [];
			this.strings.prevAnchor = 1;
		}
	};
}

function parseTabs(text, charSize=5.5, lineSpacing=12){
  // tokenize text and create array to generate string tabs into
	let tokens = tokenize(text);

	// build initial svg to attach parsed tabs to
	// let svg = "<svg width='200em' height='20em' viewbox='0 0 1000 100' version='1.1' xmlns='http://www.w3.org/2000/svg'>";
	let svg = "";
	// svg += "<rect fill='white' x='0' y='0' width='1000' height='100'/>";

	let builder = createBuilder(charSize, lineSpacing);

	// set up path for adding path data to later
	// let pathID = generateRandomId();
	// let pathString = "<path id='tab-path-" + pathID + "' fill='transparent' d='m " + (charSize * 4) + " " + lineSpacing + " ";
	// let textString = "<text><textPath xmlns:xlink='http://www.w3.org/1999/xlink' xlink:href='#tab-path-" + pathID + "'>";
	/*let pathString = "";
	let textString = "";
	let tabString = "";
	let modString = "";

	// keeps track of tab string length (in characters) for easier tab modifier positioning
	let tabLength = 0;
  // currentIndex will hold the indexes of which strings are being written to
  let currentIndex = [];
	// prevAnchorIndex determines how to move up and down the strings based on last position
	let prevAnchorIndex = 1;
	// holds the total size of all chars in the current writing positions string
	let pathLengthBuff = 0;
	// keeps the count of all strings for adding bar lines and other staff spanning objects
	let stringCount = 0;*/

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
				// stringCount = 0;
				while ((buff = re.exec(tkn.value)) !== null) {
					builder.tuning.push(buff[0]);
					// get appropriate positioning based on line spacing size
					// let yPos = (stringCount + 1) * lineSpacing;
					let yPos = builder.tuning.length * lineSpacing;

					lines += " h 2000 m -2000 " + lineSpacing;
					notes += "<tspan x='0' y='" + yPos + "'>" + buff[0] + "</tspan>";

					// stringCount++;
				}
				lines += "'/>";

				// let height = (stringCount + 1) * lineSpacing;
				let height = (builder.tuning.length + 1) * lineSpacing;

				notes = "<g><rect fill='white' x='0' y='0' width='15' height='" + height + "'/><text>" + notes + "</text><line stroke='black' stroke-width='1' x1='15' y1='0' x2='15' y2='" + height + "'/></g>";

				// check to see if there's content in SVG; close up tags and clear variables
				// if(svg.length > 0){
				// 	closeSVGtags();
				// 	resetVariables();
				// }

				// add to SVG since it's possible there is already content in this variable
				svg += "<svg width='200em' height='" + ((height * 2) / 10) + "em' viewbox='0 0 1000 " + height + "' version='1.1' xmlns='http://www.w3.org/2000/svg'>";
				svg += "<rect fill='white' x='0' y='0' width='1000' height='" + height + "'/>";

				// let pathID = generateRandomId();
				// pathString = "<path id='tab-path-" + pathID + "' fill='transparent' d='m " + (charSize * 4) + " " + lineSpacing + " ";
				// textString = "<text><textPath xmlns:xlink='http://www.w3.org/1999/xlink' xlink:href='#tab-path-" + pathID + "'>";

				// lines need to go before the notes for proper displaying
				svg += lines + notes;
				break;
			case "Time Signature":
				// make this "center" single digits to double digits; e.g 12 over 8, 8 should be centered in relation to 12
				// let x = ((charSize * 4) + tabLength * charSize);
				let x = ((charSize * 4) + builder.text.tabLength * charSize);
				// let half = (((stringCount + 1) * lineSpacing) / 2);
				let half = (((builder.tuning.length + 1) * lineSpacing) / 2);

				modString += "<text font-size='2em' x='" + x + "' y='" + (half - lineSpacing) + "'>" + tkn.value[0] + "</text><text font-size='2em' x='" + x + "' y='" + (half + lineSpacing) + "'>" + tkn.value[1] + "</text>";
				modString += "<path fill='transparent' stroke='black' stroke-width='1' d='m " + (x - charSize) + " " + half + " h " + (charSize * 4) + "'/>";
				addChar("&nbsp;".repeat(4));
				break;
			case "Slide Up":
				addModifier("slideup");
				break;
			case "Slide Down":
				addModifier("slidedown");
				break;
			case "Bend Up":
				addModifier("bendup");
				break;
			case "Bend Down":
				addModifier("benddown");
				break;
			case "Hammer On":
				addModifier("hammeron");
				break;
			case "Pull Off":
				addModifier("pulloff");
				break;
			case "Finger Tap":
				addModifier("fingertap");
				break;
      case "String":
      case "String Chord":
				// currentIndex = [];
				builder.strings.toWrite = [];
        for(let n = 0; n < tkn.value.length; n++){
					// currentIndex.push(parseInt(tkn.value[n]));
					builder.strings.toWrite.push(parseInt(tkn.value[n]));
        }
        break;
			case "Percussion":
			case "Tab":
      case "Tab Chord":
				addTabs(tkn);
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
				addModifier("barline");
				break;
      case "Multiply":
        let prevTkn = z - 1 >= 0 ? tokens[z - 1] : undefined;
        if(prevTkn && (prevTkn.type === "Tab" || prevTkn.type === "Tab Chord" || prevTkn.type === "Percussion")){
          let numVal = tkn.value.substring(tkn.value.lastIndexOf("*") + 1);
          let repeat = numVal.length > 0 ? parseInt(numVal) - 1 : 0;

          // repeat how many times specified in the multiply token
          for(let r = 0; r < repeat; r++){
						addTabs(prevTkn);
          }
        }
        break;
      default: break;
    }
  }

	closeSVGtags();
	return svg;

	function closeSVGtags(){
		// textString += tabString + "</textPath></text>";
		// pathString += "h " + pathLengthBuff + "'/>";
		//
		// let modifiers = "<g>" + modString + "</g>";
		//
		// svg += "<g>" + pathString + textString + "</g>" + modifiers + "</svg>";

		svg += builder.text.getTextAndPath() + "<g>" + builder.text.mods + "</g></svg>";
	}

	// function resetVariables(){
	// 	pathString = "";
	// 	textString = "";
	// 	tabString = "";
	// 	modString = "";
	// 	tabLength = 0;
	//   currentIndex = [];
	// 	prevAnchorIndex = 1;
	// 	pathLengthBuff = 0;
	// }

	function addChar(char){
		// tabString += char;
		builder.text.tabs += char;

		let c = char.replace(/&nbsp;/g, " ");
		// pathLengthBuff += (char === "&nbsp;" ? charSize : charSize * char.length);
		// tabLength += (char === "&nbsp;" ? 1 : char.length);
		// pathLengthBuff += charSize * c.length;
		// tabLength += c.length;
		builder.text.addToPath("h", [charSize * c.length]);
	}

	function addTabs(tabToken){
		let tabs = tabToken.value;

		if(options.palmMute){ addModifier("palmmute"); }

		let numDigits = 0;
		tabs.forEach(function(v){ numDigits = numDigits < v.length ? v.length : numDigits; });

		// loop through all notes that are being written to
		// for(let t = 0; t < currentIndex.length; t++){
		for(let t = 0; t < builder.strings.toWrite.length; t++){
			// maxT denotes the max value t can be when get token values
			let maxT = t >= tabs.length ? tabs.length - 1 : t;
			// tabString += "&nbsp;".repeat(numDigits - tabs[maxT].length) + tabs[maxT];
			builder.text.tabs += "&nbsp;".repeat(numDigits - tabs[maxT].length) + tabs[maxT];

			// get the x and y positions to adjust the path depending on chords; increase length based on char amount and size
			let xPos = ((t <= 1 ? t : 1) * -(charSize)) * numDigits;
			// let yPos = (currentIndex[t] * lineSpacing) - (prevAnchorIndex * lineSpacing);
			let yPos = (builder.strings.toWrite[t] * lineSpacing) - (builder.strings.prevAnchor * lineSpacing);
			let length = numDigits * charSize;

			// if no change in x or y, buffer length
			/*if(xPos === 0 && yPos === 0){
				pathLengthBuff += length;
			} else {
				// if change in x or y, check length buffer and add if greater than 0, then change writing position; reset buffer to new length
				if(pathLengthBuff > 0){
					pathString += "h " + pathLengthBuff + " ";
				}
				pathString += "m " + xPos + " " + yPos + " ";
				pathLengthBuff = length;
			}*/
			if(xPos !== 0 || yPos !== 0){
				builder.text.addToPath("m", [xPos, yPos]);
			}
			builder.text.addToPath("h", [length]);

			// set previous anchor index to determine which y direction to move on next tab if string change occurs
			// prevAnchorIndex = currentIndex[t];
			builder.strings.prevAnchor = builder.strings.toWrite[t];
		}

		// tabLength += numDigits;

		addChar("&nbsp;".repeat(options.beatLength));
	}

	function addModifier(type){
		// let tl = (charSize * 4) + tabLength * charSize;
		let tl = (charSize * 4) + builder.text.tabLength() * charSize;
		let largestIndex = 0;
		// let smallestIndex = stringCount + 1;
		let smallestIndex = builder.tuning.length + 1;
		// currentIndex.forEach(function(i){
		builder.strings.toWrite.forEach(function(i){
			largestIndex = largestIndex < i ? i : largestIndex;
			smallestIndex = smallestIndex > i ? i : smallestIndex;
		});

		switch(type){
			case "barline":
				// modString += "<path fill='transparent' stroke='black' stroke-width='0.5' d='m " + tl + " 0 v " + ((stringCount + 1) * lineSpacing) + "'/>";
				// modString += "<path fill='transparent' stroke='black' stroke-width='0.5' d='m " + tl + " 0 v " + ((builder.tuning.length + 1) * lineSpacing) + "'/>";
				builder.text.mods += "<path fill='transparent' stroke='black' stroke-width='0.5' d='m " + tl + " 0 v " + ((builder.tuning.length + 1) * lineSpacing) + "'/>";
				addChar("&nbsp;".repeat(options.beatLength));
				break;
			case "palmmute":
				// modString += "<text x='" + tl + "' y='" + (largestIndex * lineSpacing + (lineSpacing / 2)) + "'>m</text>";
				builder.text.mods += "<text x='" + tl + "' y='" + (largestIndex * lineSpacing + (lineSpacing / 2)) + "'>m</text>";
				break;
			case "slideup":
				// modString += "<path fill='transparent' stroke='black' stroke-width='1' d='m " + (tl - charSize) + " " + (largestIndex * lineSpacing + (lineSpacing / 4)) + " l " + (charSize * 2) + " " + (-1 * (lineSpacing / 2)) + "'/>";
				// modString += "<path fill='transparent' stroke='black' stroke-width='1' d='m " + (tl - charSize) + " " + (largestIndex * lineSpacing + (lineSpacing / 4)) + " l " + (charSize * 2) + " " + ((smallestIndex - largestIndex) * lineSpacing - (lineSpacing / 2)) + "'/>";
				builder.text.mods += "<path fill='transparent' stroke='black' stroke-width='1' d='m " + (tl - charSize) + " " + (largestIndex * lineSpacing + (lineSpacing / 4)) + " l " + (charSize * 2) + " " + ((smallestIndex - largestIndex) * lineSpacing - (lineSpacing / 2)) + "'/>";
				addChar("&nbsp;".repeat(options.beatLength));
				break;
			case "slidedown":
				// modString += "<path fill='transparent' stroke='black' stroke-width='1' d='m " + (tl - charSize) + " " + (largestIndex * lineSpacing - (lineSpacing / 4)) + " l " + (charSize * 2) + " " + (lineSpacing / 2) + "'/>";
				// modString += "<path fill='transparent' stroke='black' stroke-width='1' d='m " + (tl - charSize) + " " + (smallestIndex * lineSpacing - (lineSpacing / 4)) + " l " + (charSize * 2) + " " + ((largestIndex - smallestIndex) * lineSpacing + lineSpacing / 2) + "'/>";
				builder.text.mods += "<path fill='transparent' stroke='black' stroke-width='1' d='m " + (tl - charSize) + " " + (smallestIndex * lineSpacing - (lineSpacing / 4)) + " l " + (charSize * 2) + " " + ((largestIndex - smallestIndex) * lineSpacing + lineSpacing / 2) + "'/>";
				addChar("&nbsp;".repeat(options.beatLength));
				break;
			case "bendup":
				// modString += "<path fill='transparent' stroke='black' stroke-width='1' d='m " + (tl - charSize / 2) + " " + (largestIndex * lineSpacing + (lineSpacing / 4)) + " q " + charSize + " 0 "  + charSize + " " + (-1 * (lineSpacing / 2)) + " l 2 1.5'/>";
				builder.text.mods += "<path fill='transparent' stroke='black' stroke-width='1' d='m " + (tl - charSize / 2) + " " + (largestIndex * lineSpacing + (lineSpacing / 4)) + " q " + charSize + " 0 "  + charSize + " " + (-1 * (lineSpacing / 2)) + " l 2 1.5'/>";
				addChar("&nbsp;".repeat(options.beatLength));
				break;
			case "benddown":
				// modString += "<path fill='transparent' stroke='black' stroke-width='1' d='m " + (tl - charSize / 2) + " " + (largestIndex * lineSpacing - (lineSpacing / 4)) + " q " + charSize + " 0 "  + charSize + " " + (lineSpacing / 2) + " l 2 -1.5'/>";
				builder.text.mods += "<path fill='transparent' stroke='black' stroke-width='1' d='m " + (tl - charSize / 2) + " " + (largestIndex * lineSpacing - (lineSpacing / 4)) + " q " + charSize + " 0 "  + charSize + " " + (lineSpacing / 2) + " l 2 -1.5'/>";
				addChar("&nbsp;".repeat(options.beatLength));
				break;
			case "hammeron":
				// modString += "<text x='" + (tl - (charSize / 2)) + "' y='" + (largestIndex * lineSpacing) + "'>h</text>";
				builder.text.mods += "<text x='" + (tl - (charSize / 2)) + "' y='" + (largestIndex * lineSpacing) + "'>h</text>";
				addChar("&nbsp;".repeat(options.beatLength));
				break;
			case "pulloff":
				// modString += "<text x='" + (tl - (charSize / 2)) + "' y='" + (largestIndex * lineSpacing) + "'>p</text>";
				builder.text.mods += "<text x='" + (tl - (charSize / 2)) + "' y='" + (largestIndex * lineSpacing) + "'>p</text>";
				addChar("&nbsp;".repeat(options.beatLength));
				break;
			case "fingertap":
				// modString += "<text x='" + (tl - (charSize / 2)) + "' y='" + (largestIndex * lineSpacing) + "'>t</text>";
				builder.text.mods += "<text x='" + (tl - (charSize / 2)) + "' y='" + (largestIndex * lineSpacing) + "'>t</text>";
				addChar("&nbsp;".repeat(options.beatLength));
				break;
			default:
				break;
		}
	}
}
