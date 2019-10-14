function unparseTabs(ele){
	// get the tab notation container
	let tn = ele.closest(".tn-container");

	// loop through each SVG container and build text separately
	let text = "";
	tn.querySelectorAll("svg").forEach(function(svg){
		// notes are easy to get; just record each note in order they appear
		let notes = svg.querySelector("g[name='notes']");
		for(let ni = 0; ni < notes.children.length; ni++){
			text += notes.children[ni].textContent;
		}

		text += " ";

		// init variables that will buffer tabs and palm mutes
		let prevStr = "";
		let tabBuff = "";
		let palmBuff = "";
		// loop through all tabs and break down each part; append and clear buffers on tabs and tabchords
		let tabs = svg.querySelector("g[name='tabs']");
		for(let ti = 0; ti < tabs.children.length; ti++){
			let child = tabs.children[ti];
			switch(child.dataset["type"]){
				case "timesignature":
					let textNodes = child.querySelectorAll("text");
					text += textNodes[0].textContent + ":" + textNodes[1].textContent + " ";
					break;
				case "palmmute":
					palmBuff = "m ";
					break;
				case "slideup":
					tabBuff += "/ ";
					break;
				case "slidedown":
					tabBuff += "\\ ";
					break;
				case "bendup":
					tabBuff += "^ ";
					break;
				case "benddown":
					tabBuff += "v ";
					break;
				case "hammeron":
				case "pulloff":
				case "fingertap":;
					tabBuff += child.textContent + " ";
					break;
				case "barline":
					text += "| ";
					break;
				case "tab":
					let tstr = "s" + SETTINGS.nearestString(child) + " ";
					if(tstr !== prevStr){
						text += tstr;
						prevStr = tstr;
					}
					text += tabBuff + palmBuff + child.textContent + " ";
					tabBuff = "";
					palmBuff = "";
					break;
				case "tabchord":
					let tcstr = [];
					let tctxt = [];
					let parentY = child.transform.baseVal.getItem(0).matrix.f;
					for(let ci = 0; ci < child.children.length; ci++){
						let childY = child.children[ci].transform.baseVal.getItem(0).matrix.f;
						tcstr.push(SETTINGS.clamp(Math.round((parentY + childY) / SETTINGS.lineSpacing), 1, notes.children.length));
						tctxt.push(child.children[ci].textContent);
					}

					let joinedStr = "s" + tcstr.join(",");
					if(joinedStr !== prevStr){
						text += joinedStr + " ";
						prevStr = joinedStr;
					}
					text += tabBuff + palmBuff + tctxt.join(",") + " ";
					tabBuff = "";
					palmBuff = "";
					break;
				default: break;
			}
		}
	});
	return text;
}

function parseTabs(text){
  // tokenize text and create array to generate string tabs into
	let tokens = tokenize(text);

	// create builder that contains helper functions to add text to SVG
	let builder = new SVGbuilder();

	let options = {
		showBeats: false,
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
				let x1 = tkn.value[0].length < tkn.value[1].length ? (diff * SETTINGS.charRef.width) : 0;
				let x2 = tkn.value[1].length < tkn.value[0].length ? (diff * SETTINGS.charRef.width) : 0;

				// get the midpoint between the top and bottom strings
				let half = (((builder.strings.tuning.length + 1) * SETTINGS.lineSpacing) / 2);
				// size text so that it's larger than normal tab font
				builder.tabs.add({ text: "<g data-type='" + (tkn.type.replace(" ", "").toLowerCase()) + "' class='draggable restrict-y' font-size='2em' transform='translate(" + (SETTINGS.charRef.width + builder.tabs.markers.last()) + ", 0)'>" });
				// place the numbers according to the x position at just above/below the half mark; double scaling size
				builder.tabs.add({ text: "<text dx='" + x1 + "' dy='" + (half - SETTINGS.lineSpacing) + "'>" + tkn.value[0] + "</text>" });
				builder.tabs.add({ text: "<text dx='" + x2 + "' dy='" + (half + SETTINGS.lineSpacing) + "'>" + tkn.value[1] + "</text>" });
				// create divider line between the numbers; close out number grouping
				builder.tabs.add({ text: "<path fill='transparent' stroke='black' stroke-width='1' d='m " + ((x1 < x2 ? x1 : x2) - SETTINGS.charRef.width) + " " + half + " h " + ((largeNum * SETTINGS.charRef.width * 2) + (SETTINGS.charRef.width * 2)) + "'/>" });
				builder.tabs.add({ text: "</g>" });

				// add enough space to account for each digit's width so that spacing is uniform between time signature and tabs
				builder.tabs.markers.add(3 + (largeNum * 2));
				break;
			case "Slide Up":
			case "Slide Down":
			case "Bend Up":
			case "Bend Down":
			case "Hammer On":
			case "Pull Off":
			case "Finger Tap":
			case "Palm Mute":
				addModifier(tkn.type.replace(" ", "").toLowerCase());
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
				let df = parseInt(tkn.value[0]) - parseInt(tkn.value[1]);
				for(let m = 0; m <= Math.abs(df); m++){
					builder.strings.toWrite.push(tkn.value[0] - (m * Math.sign(df)));
				}
				break;
			case "Percussion":
			case "Tab":
      case "Tab Chord":
				addTabs(tkn);
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
		let strings = builder.strings.toWrite;

		// get largest number of digits a tab contains
		let numDigits = 0;
		tabs.forEach(function(v){ numDigits = numDigits < v.length ? v.length : numDigits; });

		// create array of objects to combine tabs and strings
		let vals = [];
		for(let s = 0; s < strings.length; s++){
			// max denotes the max value s can be when getting token values
			let max = s >= tabs.length ? tabs.length - 1 : s;
			vals.push({ str: strings[s], tab: tabs[max] });
		}
		// sort tabs by string
		vals.sort(function(a, b){ return a.str - b.str; });

		if(vals.length > 1){
			builder.tabs.add({ text: "<g data-type='tabchord' class='draggable' transform='translate(" + builder.tabs.markers.last() + ", " + (vals[0].str * SETTINGS.lineSpacing) + ")'>" });
			// loop through all notes that are being written to
			for(let v = 0; v < vals.length; v++){
				// xMod centers single chars in their tab position
				let xMod = vals[v].tab.length === 1 ? SETTINGS.charRef.width / 2 : 0;
				builder.tabs.add({
					tag: "text",
					type: "tab",
					classes: "",
					fill: "black",
					translate: {
						x: xMod,
						y: (vals[v].str - vals[0].str) * SETTINGS.lineSpacing
					},
					text: vals[v].tab
				});
			}
			builder.tabs.add({ text: "</g>" });
		} else {
			// loop through all notes that are being written to
			for(let v = 0; v < vals.length; v++){
				// xMod centers single chars in their tab position
				let xMod = vals[v].tab.length === 1 ? SETTINGS.charRef.width / 2 : 0;
				builder.tabs.add({
					tag: "text",
					type: "tab",
					classes: "draggable",
					fill: "black",
					translate: {
						x: builder.tabs.markers.last() + xMod,
						y: vals[v].str * SETTINGS.lineSpacing
					},
					text: vals[v].tab
				});
			}
		}
		builder.tabs.markers.add(3 * options.beatLength);
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
				builder.tabs.add({
					tag: "text",
					type: type,
					classes: "draggable",
					fill: "green",
					translate: {
						x: builder.tabs.markers.last(),
						y: largestIndex * SETTINGS.lineSpacing + SETTINGS.lineSpacing / 2
					},
					text: "pm"
				});
				break;
			case "barline":
				builder.tabs.add({
					tag: "path",
					type: type,
					classes: "draggable restrict-y",
					fill: "gray",
					stroke: {
						color: "transparent",
						width: 10,
						path: "m -0.5 0 v " + ((builder.strings.tuning.length + 1) * SETTINGS.lineSpacing) + " h 1 v -" + ((builder.strings.tuning.length + 1) * SETTINGS.lineSpacing) + " z"
					},
					translate: {
						x: builder.tabs.markers.last() + SETTINGS.charRef.width,
						y: 0
					}
				});
				builder.tabs.markers.add();
				break;
			case "slideup":
				builder.tabs.add({
					tag: "path",
					type: type,
					classes: "draggable",
					fill: "transparent",
					stroke: {
						color: "red",
						width: 1,
						path: "m 0 0 l " + (SETTINGS.charRef.width * 2) + " " + ((smallestIndex - largestIndex) * SETTINGS.lineSpacing - SETTINGS.lineSpacing / 2)
					},
					translate: {
						x: builder.tabs.markers.last() - SETTINGS.charRef.width,
						y: largestIndex * SETTINGS.lineSpacing + SETTINGS.lineSpacing / 4
					}
				});
				builder.tabs.markers.add(options.beatLength);
				break;
			case "slidedown":
				builder.tabs.add({
					tag: "path",
					type: type,
					classes: "draggable",
					fill: "transparent",
					stroke: {
						color: "red",
						width: 1,
						path: "m 0 0 l " + (SETTINGS.charRef.width * 2) + " " + ((largestIndex - smallestIndex) * SETTINGS.lineSpacing + SETTINGS.lineSpacing / 2)
					},
					translate: {
						x: builder.tabs.markers.last() - SETTINGS.charRef.width,
						y: smallestIndex * SETTINGS.lineSpacing - SETTINGS.lineSpacing / 4
					}
				});
				builder.tabs.markers.add(options.beatLength);
				break;
			case "bendup":
				builder.tabs.add({
					tag: "path",
					type: type,
					classes: "draggable",
					fill: "transparent",
					stroke: {
						color: "red",
						width: 1,
						path: "m 0 0 q " + SETTINGS.charRef.width + " 0 " + SETTINGS.charRef.width + " " + (-1 * (SETTINGS.lineSpacing / 2)) + " l 2 1.5"
					},
					translate: {
						x: builder.tabs.markers.last() - SETTINGS.charRef.width / 2,
						y: (largestIndex - (largestIndex - smallestIndex) / 2) * SETTINGS.lineSpacing + SETTINGS.lineSpacing / 4
					}
				});
				builder.tabs.markers.add(options.beatLength);
				break;
			case "benddown":
				builder.tabs.add({
					tag: "path",
					type: type,
					classes: "draggable",
					fill: "transparent",
					stroke: {
						color: "red",
						width: 1,
						path: "m 0 0 q " + SETTINGS.charRef.width + " 0 " + SETTINGS.charRef.width + " " + (SETTINGS.lineSpacing / 2) + " l 2 -1.5"
					},
					translate: {
						x: builder.tabs.markers.last() - SETTINGS.charRef.width / 2,
						y: (largestIndex - (largestIndex - smallestIndex) / 2) * SETTINGS.lineSpacing - SETTINGS.lineSpacing / 4
					}
				});
				builder.tabs.markers.add(options.beatLength);
				break;
			case "hammeron":
				builder.tabs.add({
					tag: "text",
					type: type,
					classes: "draggable",
					fill: "blue",
					translate: {
						x: builder.tabs.markers.last() - SETTINGS.charRef.width / 2,
						y: (largestIndex - (largestIndex - smallestIndex) / 2) * SETTINGS.lineSpacing
					},
					text: "h"
				});
				builder.tabs.markers.add(options.beatLength);
				break;
			case "pulloff":
				builder.tabs.add({
					tag: "text",
					type: type,
					classes: "draggable",
					fill: "blue",
					translate: {
						x: builder.tabs.markers.last() - SETTINGS.charRef.width / 2,
						y: (largestIndex - (largestIndex - smallestIndex) / 2) * SETTINGS.lineSpacing
					},
					text: "p"
				});
				builder.tabs.markers.add(options.beatLength);
				break;
			case "fingertap":
				builder.tabs.add({
					tag: "text",
					type: type,
					classes: "draggable",
					fill: "blue",
					translate: {
						x: builder.tabs.markers.last() - SETTINGS.charRef.width / 2,
						y: (largestIndex - (largestIndex - smallestIndex) / 2) * SETTINGS.lineSpacing
					},
					text: "t"
				});
				builder.tabs.markers.add(options.beatLength);
				break;
			default:
				break;
		}
	}
}
