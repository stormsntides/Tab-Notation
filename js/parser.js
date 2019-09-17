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
				let x1 = SETTINGS.charSize + builder.tabs.lastMarker() + (tkn.value[0].length < tkn.value[1].length ? (diff * SETTINGS.charSize) : 0);
				let x2 = SETTINGS.charSize + builder.tabs.lastMarker() + (tkn.value[1].length < tkn.value[0].length ? (diff * SETTINGS.charSize) : 0);

				// get the midpoint between the top and bottom strings
				let half = (((builder.strings.tuning.length + 1) * SETTINGS.lineSpacing) / 2);
				// size text so that it's larger than normal tab font
				builder.tabs.text.push("<g data-type='" + (tkn.type.replace(" ", "").toLowerCase()) + "' class='draggable restrict-y' font-size='2em'>");
				// place the numbers according to the x position at just above/below the half mark; double scaling size
				builder.tabs.text.push("<text x='" + x1 + "' y='" + (half - SETTINGS.lineSpacing) + "'>" + tkn.value[0] + "</text>");
				builder.tabs.text.push("<text x='" + x2 + "' y='" + (half + SETTINGS.lineSpacing) + "'>" + tkn.value[1] + "</text>");
				// create divider line between the numbers; close out number grouping
				builder.tabs.text.push("<path fill='transparent' stroke='black' stroke-width='1' d='m " + ((x1 < x2 ? x1 : x2) - SETTINGS.charSize) + " " + half + " h " + ((largeNum * SETTINGS.charSize * 2) + (SETTINGS.charSize * 2)) + "'/>");
				builder.tabs.text.push("</g>");

				// add enough space to account for each digit's width so that spacing is uniform between time signature and tabs
				builder.tabs.addMarker(3 + (largeNum * 2));
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
				if(options.palmMute){ addModifier("palmmute"); }
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
        let prevTkn = tokens.prevToken(z);
				let nextTkn = tokens.nextToken(z);
        if(prevTkn && (prevTkn.type === "Tab" || prevTkn.type === "Tab Chord" || prevTkn.type === "Percussion") && nextTkn && nextTkn.type === "Tab"){
          // repeat how many times specified in the multiply token
          for(let r = 0; r < nextTkn.value[0]; r++){
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

		// loop through all notes that are being written to
		for(let t = 0; t < builder.strings.toWrite.length; t++){
			// maxT denotes the max value t can be when get token values
			let maxT = t >= tabs.length ? tabs.length - 1 : t;
			// xMod centers single chars in their tab position
			let xMod = tabs[maxT].length === 1 ? SETTINGS.charSize / 2 : 0;
			builder.tabs.addTab("text", {
				type: "tab",
				classes: "draggable",
				fill: "black",
				translate: {
					x: builder.tabs.lastMarker() + xMod,
					y: builder.strings.toWrite[t] * SETTINGS.lineSpacing
				}
			}, tabs[maxT]);
		}

		builder.tabs.addMarker();
	}

	function addModifier(type){
		let largestIndex = 0;
		let smallestIndex = builder.strings.tuning.length + 1;
		builder.strings.toWrite.forEach(function(i){
			largestIndex = largestIndex < i ? i : largestIndex;
			smallestIndex = smallestIndex > i ? i : smallestIndex;
		});

		switch(type){
			case "palmmute":
				builder.tabs.addTab("text", {
					type: type,
					classes: "draggable",
					fill: "green",
					translate: {
						x: builder.tabs.lastMarker() + SETTINGS.charSize / 2,
						y: largestIndex * SETTINGS.lineSpacing + SETTINGS.lineSpacing / 2
					}
				}, "m");
				break;
			case "barline":
				builder.tabs.addTab("path", {
					type: type,
					classes: "draggable restrict-y",
					fill: "transparent",
					stroke: {
						color: "gray",
						width: 0.5,
						path: "m 0 0 v " + ((builder.strings.tuning.length + 1) * SETTINGS.lineSpacing)
					},
					translate: {
						x: builder.tabs.lastMarker() + SETTINGS.charSize,
						y: 0
					}
				}, null);
				builder.tabs.addMarker();
				break;
			case "slideup":
				builder.tabs.addTab("path",{
					type: type,
					classes: "draggable",
					fill: "transparent",
					stroke: {
						color: "red",
						width: 1,
						path: "m 0 0 l " + (SETTINGS.charSize * 2) + " " + ((smallestIndex - largestIndex) * SETTINGS.lineSpacing - SETTINGS.lineSpacing / 2)
					},
					translate: {
						x: builder.tabs.lastMarker() - SETTINGS.charSize,
						y: largestIndex * SETTINGS.lineSpacing + SETTINGS.lineSpacing / 4
					}
				}, null);
				builder.tabs.addMarker(1);
				break;
			case "slidedown":
				builder.tabs.addTab("path", {
					type: type,
					classes: "draggable",
					fill: "transparent",
					stroke: {
						color: "red",
						width: 1,
						path: "m 0 0 l " + (SETTINGS.charSize * 2) + " " + ((largestIndex - smallestIndex) * SETTINGS.lineSpacing + SETTINGS.lineSpacing / 2)
					},
					translate: {
						x: builder.tabs.lastMarker() - SETTINGS.charSize,
						y: smallestIndex * SETTINGS.lineSpacing - SETTINGS.lineSpacing / 4
					}
				}, null);
				builder.tabs.addMarker(1);
				break;
			case "bendup":
				builder.tabs.addTab("path", {
					type: type,
					classes: "draggable",
					fill: "transparent",
					stroke: {
						color: "red",
						width: 1,
						path: "m 0 0 q " + SETTINGS.charSize + " 0 " + SETTINGS.charSize + " " + (-1 * (SETTINGS.lineSpacing / 2)) + " l 2 1.5"
					},
					translate: {
						x: builder.tabs.lastMarker() - SETTINGS.charSize / 2,
						y: largestIndex * SETTINGS.lineSpacing + SETTINGS.lineSpacing / 4
					}
				}, null);
				builder.tabs.addMarker(1);
				break;
			case "benddown":
				builder.tabs.addTab("path", {
					type: type,
					classes: "draggable",
					fill: "transparent",
					stroke: {
						color: "red",
						width: 1,
						path: "m 0 0 q " + SETTINGS.charSize + " 0 " + SETTINGS.charSize + " " + (SETTINGS.lineSpacing / 2) + " l 2 -1.5"
					},
					translate: {
						x: builder.tabs.lastMarker() - SETTINGS.charSize / 2,
						y: largestIndex * SETTINGS.lineSpacing - SETTINGS.lineSpacing / 4
					}
				}, null);
				builder.tabs.addMarker(1);
				break;
			case "hammeron":
				builder.tabs.addTab("text", {
					type: type,
					classes: "draggable",
					fill: "blue",
					translate: {
						x: builder.tabs.lastMarker() - SETTINGS.charSize / 2,
						y: largestIndex * SETTINGS.lineSpacing
					}
				}, "h");
				builder.tabs.addMarker(1);
				break;
			case "pulloff":
				builder.tabs.addTab("text", {
					type: type,
					classes: "draggable",
					fill: "blue",
					translate: {
						x: builder.tabs.lastMarker() - SETTINGS.charSize / 2,
						y: largestIndex * SETTINGS.lineSpacing
					}
				}, "p");
				builder.tabs.addMarker(1);
				break;
			case "fingertap":
				builder.tabs.addTab("text", {
					type: type,
					classes: "draggable",
					fill: "blue",
					translate: {
						x: builder.tabs.lastMarker() - SETTINGS.charSize / 2,
						y: largestIndex * SETTINGS.lineSpacing
					}
				}, "t");
				builder.tabs.addMarker(1);
				break;
			default:
				break;
		}
	}
}
