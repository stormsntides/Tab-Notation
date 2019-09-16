function testTrigger(isTriggered){
	if(isTriggered){
		console.log("Test Trigger function was triggered!");
		// convertToText(isTriggered);
	}
}

// function convertToText(ele){
// 	let tn;
// 	if(ele.classList.contains("tn-container")){
// 		tn = ele;
// 	} else {
// 		tn = ele.closest(".tn-container");
// 	}
//
// 	let text = "";
// 	let trfre = /((?:\d+\.){0,1}\d+)/g;
// 	tn.querySelectorAll("svg").forEach(function(svg){
// 		// get notes and sort them using y position
// 		let notes = Array.from(svg.querySelectorAll("g[name='notes'] > [data-type='note']"));
// 		notes.sort(function(a, b){
// 			return parseFloat(a.getAttribute("transform").match(trfre)[1]) - parseFloat(b.getAttribute("transform").match(trfre)[1]);
// 		});
// 		notes.forEach(function(n){ text += n.textContent; });
// 		text += " ";
//
// 		// get tabs and sort them using x position
// 		let tabs = Array.from(svg.querySelectorAll("g[name='tabs'] > *"));
// 		tabs.sort(function(a, b){
// 			return parseFloat(a.getAttribute("transform").match(trfre)[0]) - parseFloat(b.getAttribute("transform").match(trfre)[0]);
// 		});
//
// 		let prevLine = "";
// 		let isChord = false;
// 		let temp = "";
// 		for(let i = 0; i < tabs.length; i++){
// 			let trf = tabs[i].getAttribute("transform").match(trfre);
// 			trf[0] = Math.round(trf[0] / SETTINGS.charSize) * SETTINGS.charSize;
// 			trf[1] = Math.round(trf[1] / SETTINGS.lineSpacing) * SETTINGS.lineSpacing;
//
// 			if(tabs[i].dataset["type"] === "tab"){
// 				temp += tabs[i].textContent;
//
// 				let strLine = trf[1] / SETTINGS.lineSpacing;
// 				if(prevLine !==)
//
// 				if(i + 1 < tabs.length){
//
// 					let nexttrf = tabs[i].getAttribute("transform").match(trfre);
// 					nexttrf[0] = Math.round(nexttrf[0] / SETTINGS.charSize) * SETTINGS.charSize;
// 					nexttrf[1] = Math.round(nexttrf[1] / SETTINGS.lineSpacing) * SETTINGS.lineSpacing;
//
// 					if(trf[0] === nexttrf[0]){
// 						text += tabs[i].textContent + ",";
// 					}
// 					else { text += tabs[i].textContent + " "; }
// 				}
// 				if(prevLine !== trf[1]){
// 					prevLine = trf[1];
// 					text += "S" + (trf[1] / SETTINGS.lineSpacing) + " ";
// 				}
// 			}
// 		}
// 	});
// 	console.log("New Text: " + text);
// 	tn.querySelector(".raw-tab").textContent = text;
// 	printTabs(tn);
// }

function createBuilder(){
	let leftPad = SETTINGS.charSize * 4;

	return {
		svg: [],
		addNewSVG: function(){
			let height = (this.strings.tuning.length + 1) * SETTINGS.lineSpacing;
			this.svg.push("<svg width='200em' height='" + ((height * 2) / 10) + "em' viewbox='0 0 1000 " + height + "' version='1.1' xmlns='http://www.w3.org/2000/svg' onload='makeDraggable(evt)'><rect fill='white' x='0' y='0' width='1000' height='" + height + "'/>");
		},
		closeAndGetSVG: function(){
			this.closeSVG();
			return this.svg.join("");
		},
		text: {
			markers: [leftPad],
			tabs: "",
			addMarker: function(numChars=3){
				let last = this.markers.length - 1;
				this.markers.push(this.markers[last] + (SETTINGS.charSize * numChars));
			},
			getText: function(){
				return "<g name='tabs'>" + this.tabs + "</g>";
			},
			tabCursor: function(){
				return this.markers[this.markers.length - 1];
			}
		},
		strings: {
			tuning: [],
			toWrite: [],
			getText: function(){
				// set up the string lines and notes to be displayed
				let lines = "<path fill='transparent' stroke='gray' stroke-width='0.5' d='m 0 " + SETTINGS.lineSpacing;
				let notes = "";

				this.tuning.forEach(function(t, i){
					// get appropriate positioning based on line spacing size
					let yPos = (i + 1) * SETTINGS.lineSpacing;

					lines += " h 2000 m -2000 " + SETTINGS.lineSpacing;
					notes += "<text data-type='note' class='draggable restrict-x' transform='translate(0, " + yPos + ")'>" + t + "</text>";
				});
				lines += "'/>";

				let height = (this.tuning.length + 1) * SETTINGS.lineSpacing;

				notes = "<rect fill='white' x='0' y='0' width='15' height='" + height + "'/><g name='notes'>" + notes + "</g><line stroke='black' stroke-width='1' x1='15' y1='0' x2='15' y2='" + height + "'/>";

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
			this.text.tabs = "";
			this.strings.tuning = [];
			this.strings.toWrite = [];
		}
	};
}

function parseTabs(text){
  // tokenize text and create array to generate string tabs into
	let tokens = tokenize(text);
	console.log(tokens);

	// create builder that contains helper functions to add text to SVG
	let builder = createBuilder();

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
				let x1 = SETTINGS.charSize + builder.text.tabCursor() + (tkn.value[0].length < tkn.value[1].length ? (diff * SETTINGS.charSize) : 0);
				let x2 = SETTINGS.charSize + builder.text.tabCursor() + (tkn.value[1].length < tkn.value[0].length ? (diff * SETTINGS.charSize) : 0);

				// get the midpoint between the top and bottom strings
				let half = (((builder.strings.tuning.length + 1) * SETTINGS.lineSpacing) / 2);
				// size text so that it's larger than normal tab font
				builder.text.tabs += "<g data-type='" + (tkn.type.replace(" ", "").toLowerCase()) + "' class='draggable restrict-y' font-size='2em'>";
				// place the numbers according to the x position at just above/below the half mark; double scaling size
				builder.text.tabs += "<text x='" + x1 + "' y='" + (half - SETTINGS.lineSpacing) + "'>" + tkn.value[0] + "</text>";
				builder.text.tabs += "<text x='" + x2 + "' y='" + (half + SETTINGS.lineSpacing) + "'>" + tkn.value[1] + "</text>";
				// create divider line between the numbers; close out number grouping
				builder.text.tabs += "<path fill='transparent' stroke='black' stroke-width='1' d='m " + ((x1 < x2 ? x1 : x2) - SETTINGS.charSize) + " " + half + " h " + ((largeNum * SETTINGS.charSize * 2) + (SETTINGS.charSize * 2)) + "'/>";
				builder.text.tabs += "</g>";

				// add enough space to account for each digit's width so that spacing is uniform between time signature and tabs
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

	function addTabs(tabToken){
		let tabs = tabToken.value;

		let numDigits = 0;
		tabs.forEach(function(v){ numDigits = numDigits < v.length ? v.length : numDigits; });

		if(options.palmMute){
			let li = 0;
			builder.strings.toWrite.forEach(function(i){
				li = li < i ? i : li;
			});
			let xp = builder.text.tabCursor() + (SETTINGS.charSize / 2);
			builder.text.tabs += "<text data-type='palmmute' class='draggable' fill='green' transform='translate(" + xp + ", " + (li * SETTINGS.lineSpacing + (SETTINGS.lineSpacing / 2)) + ")'>m</text>";
		}

		// loop through all notes that are being written to
		for(let t = 0; t < builder.strings.toWrite.length; t++){
			// maxT denotes the max value t can be when get token values
			let maxT = t >= tabs.length ? tabs.length - 1 : t;
			// xMod centers single chars in their tab position
			let xMod = tabs[maxT].length === 1 ? SETTINGS.charSize / 2 : 0;
			builder.text.tabs += "<text data-type='tab' class='draggable' transform='translate(" + (builder.text.tabCursor() + xMod) + ", " + (builder.strings.toWrite[t] * SETTINGS.lineSpacing) + ")'>" + tabs[maxT] + "</text>";
		}

		builder.text.addMarker();
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
				builder.text.tabs += "<path data-type='" + type + "' class='draggable restrict-y' fill='transparent' stroke='gray' stroke-width='0.5' d='m 0 0 v " + ((builder.strings.tuning.length + 1) * SETTINGS.lineSpacing) + "' transform='translate(" + (builder.text.tabCursor() + SETTINGS.charSize) + ", 0)'/>";
				builder.text.addMarker();
				break;
			case "slideup":
				builder.text.tabs += "<path data-type='" + type + "' class='draggable' fill='transparent' stroke='red' stroke-width='1' d='m 0 0 l " + (SETTINGS.charSize * 2) + " " + ((smallestIndex - largestIndex) * SETTINGS.lineSpacing - (SETTINGS.lineSpacing / 2)) + "' transform='translate(" + (builder.text.tabCursor() - SETTINGS.charSize) + ", " + (largestIndex * SETTINGS.lineSpacing + (SETTINGS.lineSpacing / 4)) + ")'/>";
				builder.text.addMarker(1);
				break;
			case "slidedown":
				builder.text.tabs += "<path data-type='" + type + "' class='draggable' fill='transparent' stroke='red' stroke-width='1' d='m 0 0 l " + (SETTINGS.charSize * 2) + " " + ((largestIndex - smallestIndex) * SETTINGS.lineSpacing + SETTINGS.lineSpacing / 2) + "' transform='translate(" + (builder.text.tabCursor() - SETTINGS.charSize) + ", " + (smallestIndex * SETTINGS.lineSpacing - (SETTINGS.lineSpacing / 4)) + ")'/>";
				builder.text.addMarker(1);
				break;
			case "bendup":
				builder.text.tabs += "<path data-type='" + type + "' class='draggable' fill='transparent' stroke='red' stroke-width='1' d='m 0 0 q " + SETTINGS.charSize + " 0 "  + SETTINGS.charSize + " " + (-1 * (SETTINGS.lineSpacing / 2)) + " l 2 1.5' transform='translate(" + (builder.text.tabCursor() - SETTINGS.charSize / 2) + ", " + (largestIndex * SETTINGS.lineSpacing + (SETTINGS.lineSpacing / 4)) + ")'/>";
				builder.text.addMarker(1);
				break;
			case "benddown":
				builder.text.tabs += "<path data-type='" + type + "' class='draggable' fill='transparent' stroke='red' stroke-width='1' d='m 0 0 q " + SETTINGS.charSize + " 0 "  + SETTINGS.charSize + " " + (SETTINGS.lineSpacing / 2) + " l 2 -1.5' transform='translate(" + (builder.text.tabCursor() - SETTINGS.charSize / 2) + ", " + (largestIndex * SETTINGS.lineSpacing - (SETTINGS.lineSpacing / 4)) + ")'/>";
				builder.text.addMarker(1);
				break;
			case "hammeron":
				builder.text.tabs += "<text data-type='" + type + "' class='draggable' fill='blue' transform='translate(" + (builder.text.tabCursor() - (SETTINGS.charSize / 2)) + ", " + (largestIndex * SETTINGS.lineSpacing) + ")'>h</text>";
				builder.text.addMarker(1);
				break;
			case "pulloff":
				builder.text.tabs += "<text data-type='" + type + "' class='draggable' fill='blue' transform='translate(" + (builder.text.tabCursor() - (SETTINGS.charSize / 2)) + ", " + (largestIndex * SETTINGS.lineSpacing) + ")'>p</text>";
				builder.text.addMarker(1);
				break;
			case "fingertap":
				builder.text.tabs += "<text data-type='" + type + "' class='draggable' fill='blue' transform='translate(" + (builder.text.tabCursor() - (SETTINGS.charSize / 2)) + ", " + (largestIndex * SETTINGS.lineSpacing) + ")'>t</text>";
				builder.text.addMarker(1);
				break;
			default:
				break;
		}
	}
}
