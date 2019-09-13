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

function testTrigger(isTriggered){
	if(isTriggered){
		console.log("Test Trigger function was triggered!");
	}
}

function createBuilder(charSize, lineSpacing){
	let leftPad = charSize * 4;

	return {
		svg: [],
		addNewSVG: function(){
			let height = (this.strings.tuning.length + 1) * lineSpacing;
			// this.svg.push("<svg width='200em' height='" + ((height * 2) / 10) + "em' viewbox='0 0 1000 " + height + "' version='1.1' xmlns='http://www.w3.org/2000/svg'><rect fill='white' x='0' y='0' width='1000' height='" + height + "'/>");
			this.svg.push("<svg width='200em' height='" + ((height * 2) / 10) + "em' viewbox='0 0 1000 " + height + "' version='1.1' xmlns='http://www.w3.org/2000/svg' onload='makeDraggable(evt)'><rect fill='white' x='0' y='0' width='1000' height='" + height + "'/>");
		},
		closeAndGetSVG: function(){
			this.closeSVG();
			return this.svg.join("");
		},
		text: {
			id: generateRandomId(),
			path: [],
			markers: [leftPad],
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
			addMarker: function(numChars=3){
				let last = this.markers.length - 1;
				this.markers.push(this.markers[last] + (charSize * numChars));
			},
			getText: function(){
				// let d = this.path.reduce(function(acc, p){
				// 	return acc + " " + p.type + " " + p.x + (p.y ? " " + p.y : "");
				// }, "");
				// let p = "<path id='tab-path-" + this.id + "' fill='transparent' d='m " + leftPad + " " + lineSpacing + d + "'/>";
				// let t = "<text><textPath xmlns:xlink='http://www.w3.org/1999/xlink' xlink:href='#tab-path-" + this.id + "'>" + this.tabs + "</textPath></text>";
				// return "<g>" + p + t + "</g><g>" + this.mods + "</g>";
				return "<g>" + this.tabs + "</g><g>" + this.mods + "</g>";
			},
			tabLength: function(padded=false){
				return (padded ? leftPad : 0) + this.path.reduce(function(acc, l){
					return acc + l.x;
				}, 0);
			},
			tabCursor: function(){
				return this.markers[this.markers.length - 1];
			}
		},
		strings: {
			tuning: [],
			toWrite: [],
			prevAnchor: 1,
			getText: function(){
				// set up the string lines and notes to be displayed
				let lines = "<path fill='transparent' stroke='gray' stroke-width='0.5' d='m 0 " + lineSpacing;
				let notes = "";

				this.tuning.forEach(function(t, i){
					// get appropriate positioning based on line spacing size
					let yPos = (i + 1) * lineSpacing;

					lines += " h 2000 m -2000 " + lineSpacing;
					// notes += "<tspan x='0' y='" + yPos + "'>" + t + "</tspan>";
					notes += "<text class='draggable' transform='translate(0, " + yPos + ")'>" + t + "</text>";
				});
				lines += "'/>";

				let height = (this.tuning.length + 1) * lineSpacing;

				// notes = "<g><rect fill='white' x='0' y='0' width='15' height='" + height + "'/><text>" + notes + "</text><line stroke='black' stroke-width='1' x1='15' y1='0' x2='15' y2='" + height + "'/></g>";
				notes = "<rect fill='white' x='0' y='0' width='15' height='" + height + "'/>" + notes + "<line stroke='black' stroke-width='1' x1='15' y1='0' x2='15' y2='" + height + "'/>";

				return lines + notes;
			}
		},
		closeSVG: function(){
			if(this.svg.length > 0){
				let last = this.svg.length - 1;
				this.svg[last] += this.strings.getText() + this.text.getText() + "</svg>";
				this.clear();
			}
		},
		clear: function(){
			this.text.id = generateRandomId();
			this.text.path = [];
			this.text.tabs = "";
			this.text.mods = "";
			this.strings.tuning = [];
			this.strings.toWrite = [];
			this.strings.prevAnchor = 1;
		}
	};
}

function parseTabs(text, charSize=5.5, lineSpacing=12){
  // tokenize text and create array to generate string tabs into
	let tokens = tokenize(text);

	// create builder that contains helper functions to add text to SVG
	let builder = createBuilder(charSize, lineSpacing);

	let options = {
		showBeats: false,
		palmMute: false,
		beatLength: 1
	};
  for(let z = 0; z < tokens.length; z++){
    let tkn = tokens[z];
    switch(tkn.type){
			case "Tuning":
				// close out any current SVG texts being built
				builder.closeSVG();

				// denote the tuning to be used when selecting notes to be written to
				let re = /[A-G][#b]*/g;
				let buff = [];
				while ((buff = re.exec(tkn.value)) !== null) {
					builder.strings.tuning.push(buff[0]);
				}
				builder.addNewSVG();
				break;
			case "Time Signature":
				// this is the difference between the two numbers' lengths
				let diff = Math.abs(tkn.value[0].length - tkn.value[1].length);
				// get the length of the largest number; i.e. number with the most digits
				let largeNum = tkn.value[0].length < tkn.value[1].length ? tkn.value[1].length : tkn.value[0].length;

				// x1 is the x position of the top number, x2 is the x position of the bottom number
				// let x1 = charSize + builder.text.tabLength(true) + (tkn.value[0].length < tkn.value[1].length ? (diff * charSize) : 0);
				// let x2 = charSize + builder.text.tabLength(true) + (tkn.value[1].length < tkn.value[0].length ? (diff * charSize) : 0);
				let x1 = charSize + builder.text.tabCursor() + (tkn.value[0].length < tkn.value[1].length ? (diff * charSize) : 0);
				let x2 = charSize + builder.text.tabCursor() + (tkn.value[1].length < tkn.value[0].length ? (diff * charSize) : 0);

				// get the midpoint between the top and bottom strings
				let half = (((builder.strings.tuning.length + 1) * lineSpacing) / 2);
				// size text so that it's larger than normal tab font
				builder.text.mods += "<g font-size='2em'>";
				// place the numbers according to the x position at just above/below the half mark; double scaling size
				builder.text.mods += "<text x='" + x1 + "' y='" + (half - lineSpacing) + "'>" + tkn.value[0] + "</text>";
				builder.text.mods += "<text x='" + x2 + "' y='" + (half + lineSpacing) + "'>" + tkn.value[1] + "</text>";
				// create divider line between the numbers; close out number grouping
				builder.text.mods += "<path fill='transparent' stroke='black' stroke-width='1' d='m " + ((x1 < x2 ? x1 : x2) - charSize) + " " + half + " h " + ((largeNum * charSize * 2) + (charSize * 2)) + "'/>";
				builder.text.mods += "</g>";

				// add enough space to account for each digit's width so that spacing is uniform between time signature and tabs
				// addChar("&nbsp;".repeat(3 + (largeNum * 2)));
				builder.text.addMarker(3 + (largeNum * 2));
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
				builder.strings.toWrite = [];
        for(let n = 0; n < tkn.value.length; n++){
					builder.strings.toWrite.push(parseInt(tkn.value[n]));
        }
        break;
			case "String Chord Range":
				builder.strings.toWrite = [];
				let df = tkn.value[0] - tkn.value[1];
				for(let m = 0; m <= Math.abs(df); m++){
					builder.strings.toWrite.push(tkn.value[0] - (m * Math.sign(df)));
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

	return builder.closeAndGetSVG();

	function addChar(char){
		builder.text.tabs += char;

		let c = char.replace(/&nbsp;/g, " ");
		builder.text.addToPath("h", [charSize * c.length]);
	}

	function addTabs(tabToken){
		let tabs = tabToken.value;

		let numDigits = 0;
		tabs.forEach(function(v){ numDigits = numDigits < v.length ? v.length : numDigits; });

		if(options.palmMute){
			let li = 0;
			builder.strings.toWrite.forEach(function(i){
				li = li < i ? i : li;
			});
			// let xp = builder.text.tabLength(true) + ((charSize * (numDigits - 1)) / 2);
			let xp = builder.text.tabCursor() + (charSize / 2);
			builder.text.mods += "<text fill='green' x='" + xp + "' y='" + (li * lineSpacing + (lineSpacing / 2)) + "'>m</text>";
		}

		// loop through all notes that are being written to
		for(let t = 0; t < builder.strings.toWrite.length; t++){
			// maxT denotes the max value t can be when get token values
			let maxT = t >= tabs.length ? tabs.length - 1 : t;
			// builder.text.tabs += "&nbsp;".repeat(numDigits - tabs[maxT].length) + tabs[maxT];

			// get the x and y positions to adjust the path depending on chords; increase length based on char amount and size
			let xPos = ((t <= 1 ? t : 1) * -(charSize)) * numDigits;
			let yPos = (builder.strings.toWrite[t] * lineSpacing) - (builder.strings.prevAnchor * lineSpacing);
			let length = numDigits * charSize;

			let xMod = tabs[maxT].length === 1 ? charSize / 2 : 0;
			builder.text.tabs += "<text class='draggable' transform='translate(" + (builder.text.tabCursor() + xMod) + ", " + (builder.strings.toWrite[t] * lineSpacing) + ")'>" + tabs[maxT] + "</text>";

			// make sure to move the string position if there's a change in either x or y
			if(xPos !== 0 || yPos !== 0){
				builder.text.addToPath("m", [xPos, yPos]);
			}
			builder.text.addToPath("h", [length]);

			// set previous anchor index to determine which y direction to move on next tab if string change occurs
			builder.strings.prevAnchor = builder.strings.toWrite[t];
		}

		builder.text.addMarker();

		// addChar("&nbsp;".repeat(options.beatLength));
	}

	function addModifier(type){
		let largestIndex = 0;
		let smallestIndex = builder.strings.tuning.length + 1;
		builder.strings.toWrite.forEach(function(i){
			largestIndex = largestIndex < i ? i : largestIndex;
			smallestIndex = smallestIndex > i ? i : smallestIndex;
		});

		switch(type){
			case "barline":
				// builder.text.mods += "<path fill='transparent' stroke='gray' stroke-width='0.5' d='m " + builder.text.tabLength(true) + " 0 v " + ((builder.strings.tuning.length + 1) * lineSpacing) + "'/>";
				builder.text.mods += "<path fill='transparent' stroke='gray' stroke-width='0.5' d='m " + (builder.text.tabCursor() + charSize) + " 0 v " + ((builder.strings.tuning.length + 1) * lineSpacing) + "'/>";
				// addChar("&nbsp;".repeat(options.beatLength));
				builder.text.addMarker();
				break;
			case "slideup":
				// builder.text.mods += "<path fill='transparent' stroke='red' stroke-width='1' d='m " + (builder.text.tabLength(true) - charSize) + " " + (largestIndex * lineSpacing + (lineSpacing / 4)) + " l " + (charSize * 2) + " " + ((smallestIndex - largestIndex) * lineSpacing - (lineSpacing / 2)) + "'/>";
				builder.text.mods += "<path fill='transparent' stroke='red' stroke-width='1' d='m " + (builder.text.tabCursor() - charSize) + " " + (largestIndex * lineSpacing + (lineSpacing / 4)) + " l " + (charSize * 2) + " " + ((smallestIndex - largestIndex) * lineSpacing - (lineSpacing / 2)) + "'/>";
				// addChar("&nbsp;".repeat(options.beatLength));
				builder.text.addMarker(1);
				break;
			case "slidedown":
				// builder.text.mods += "<path fill='transparent' stroke='red' stroke-width='1' d='m " + (builder.text.tabLength(true) - charSize) + " " + (smallestIndex * lineSpacing - (lineSpacing / 4)) + " l " + (charSize * 2) + " " + ((largestIndex - smallestIndex) * lineSpacing + lineSpacing / 2) + "'/>";
				builder.text.mods += "<path fill='transparent' stroke='red' stroke-width='1' d='m " + (builder.text.tabCursor() - charSize) + " " + (smallestIndex * lineSpacing - (lineSpacing / 4)) + " l " + (charSize * 2) + " " + ((largestIndex - smallestIndex) * lineSpacing + lineSpacing / 2) + "'/>";
				// addChar("&nbsp;".repeat(options.beatLength));
				builder.text.addMarker(1);
				break;
			case "bendup":
				// builder.text.mods += "<path fill='transparent' stroke='red' stroke-width='1' d='m " + (builder.text.tabLength(true) - charSize / 2) + " " + (largestIndex * lineSpacing + (lineSpacing / 4)) + " q " + charSize + " 0 "  + charSize + " " + (-1 * (lineSpacing / 2)) + " l 2 1.5'/>";
				builder.text.mods += "<path fill='transparent' stroke='red' stroke-width='1' d='m " + (builder.text.tabCursor() - charSize / 2) + " " + (largestIndex * lineSpacing + (lineSpacing / 4)) + " q " + charSize + " 0 "  + charSize + " " + (-1 * (lineSpacing / 2)) + " l 2 1.5'/>";
				// addChar("&nbsp;".repeat(options.beatLength));
				builder.text.addMarker(1);
				break;
			case "benddown":
				// builder.text.mods += "<path fill='transparent' stroke='red' stroke-width='1' d='m " + (builder.text.tabLength(true) - charSize / 2) + " " + (largestIndex * lineSpacing - (lineSpacing / 4)) + " q " + charSize + " 0 "  + charSize + " " + (lineSpacing / 2) + " l 2 -1.5'/>";
				builder.text.mods += "<path fill='transparent' stroke='red' stroke-width='1' d='m " + (builder.text.tabCursor() - charSize / 2) + " " + (largestIndex * lineSpacing - (lineSpacing / 4)) + " q " + charSize + " 0 "  + charSize + " " + (lineSpacing / 2) + " l 2 -1.5'/>";
				// addChar("&nbsp;".repeat(options.beatLength));
				builder.text.addMarker(1);
				break;
			case "hammeron":
				// builder.text.mods += "<text fill='blue' x='" + (builder.text.tabLength(true) - (charSize / 2)) + "' y='" + (largestIndex * lineSpacing) + "'>h</text>";
				builder.text.mods += "<text fill='blue' x='" + (builder.text.tabCursor() - (charSize / 2)) + "' y='" + (largestIndex * lineSpacing) + "'>h</text>";
				// addChar("&nbsp;".repeat(options.beatLength));
				builder.text.addMarker(1);
				break;
			case "pulloff":
				// builder.text.mods += "<text fill='blue' x='" + (builder.text.tabLength(true) - (charSize / 2)) + "' y='" + (largestIndex * lineSpacing) + "'>p</text>";
				builder.text.mods += "<text fill='blue' x='" + (builder.text.tabCursor() - (charSize / 2)) + "' y='" + (largestIndex * lineSpacing) + "'>p</text>";
				// addChar("&nbsp;".repeat(options.beatLength));
				builder.text.addMarker(1);
				break;
			case "fingertap":
				// builder.text.mods += "<text fill='blue' x='" + (builder.text.tabLength(true) - (charSize / 2)) + "' y='" + (largestIndex * lineSpacing) + "'>t</text>";
				builder.text.mods += "<text fill='blue' x='" + (builder.text.tabCursor() - (charSize / 2)) + "' y='" + (largestIndex * lineSpacing) + "'>t</text>";
				// addChar("&nbsp;".repeat(options.beatLength));
				builder.text.addMarker(1);
				break;
			default:
				break;
		}
	}
}
