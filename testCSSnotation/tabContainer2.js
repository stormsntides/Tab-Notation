function parseTabs(text){
  // tokenize text and create array to generate string tabs into
	let tokens = tokenize(text);

  const writeToStrings = [];
  const markerList = {
    list: [0],
    last() { return list[list.length - 1]; },
    add() { list.push(this.last() + 2); }
  };

  for(let z = 0; z < tokens.length; z++){
    let tkn = tokens[z];
    switch(tkn.type){
			case "Tuning":
        let newStaff = document.createElement("div");
        newStaff.classList.add("tab-staff");

				// denote the tuning to be used when selecting notes to be written to
				let re = /[A-G][#b]*/g;
				let buff = [];
        let stringCount = 0;
				while ((buff = re.exec(tkn.value)) !== null) {
          stringCount += 1;

					let tuningNode = document.createElement("span");
          tuningNode.classList.add("tuning-node");
          tuningNode.classList.add("string-" + stringCount);
          tuningNode.style.left = markerList[markerList.length - 1];

          tuningNode.appendChild(document.createTextNode(buff[0]));
          newStaff.appendChild(tuningNode);
				}

        newStaff.classList.add(numberToText(stringCount) + "-string-instrument");
        this.appendChild(newStaff);

        markerList.add();
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
				builder.tabs.add({ text: "<g data-type='" + (tkn.type.replace(" ", "-").toLowerCase()) + "' class='draggable restrict-y' font-size='2em' transform='translate(" + (SETTINGS.charRef.width + builder.tabs.markers.last()) + ", 0)'>" });
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
			case "Bar Line":
				addModifier(tkn.type.replace(" ", "-").toLowerCase());
				break;
      case "String Chord Range":
        let min = Math.min(parseInt(tkn.value[0]), parseInt(tkn.value[1]));
        let max = Math.max(parseInt(tkn.value[0]), parseInt(tkn.value[1]));
        let numArr = [];
        for(let m = min; m <= max; m++){
          numArr.push(m);
        }
        tkn.type = "String Chord";
        tkn.value = numArr;
      case "String":
      case "String Chord":
				// builder.strings.toWrite = [];
        writeToStrings.splice(0, writeToStrings.length);
        for(let n = 0; n < tkn.value.length; n++){
					// builder.strings.toWrite.push(parseInt(tkn.value[n]));
          writeToStrings.push(parseInt(tkn.value[n]));
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
		let strings = writeToStrings;

		// create array of objects to combine tabs and strings
		let vals = [];
		for(let s = 0; s < strings.length; s++){
			// max denotes the max value s can be when getting token values
			let max = s >= tabs.length ? tabs.length - 1 : s;
			vals.push({ str: strings[s], tab: tabs[max] });
		}
		// sort tabs by string
		vals.sort(function(a, b){ return a.str - b.str; });

    for(let v = 0; v < vals.length; v++){
      let tabNode = document.createElement("span");
      // finish creating node
    }

		if(vals.length > 1){
			builder.tabs.add({ text: "<g data-type='tab-chord' class='draggable' transform='translate(" + builder.tabs.markers.last() + ", " + (vals[0].str * SETTINGS.lineSpacing) + ")'>" });
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
			case "palm-mute":
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
			case "bar-line":
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
			case "slide-up":
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
			case "slide-down":
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
			case "bend-up":
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
			case "bend-down":
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
			case "hammer-on":
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
			case "pull-off":
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
			case "finger-tap":
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

function update(redraw){
  // unparse HTML into tab text and insert new tabs into raw tabs element
  this.querySelector(".raw-tab").value = unparseTabs(this).trim();
  if(redraw){ this.draw(); }
}

function draw(){
  const rawTab = document.querySelector(`.raw-tab[for="${ this.id }"]`);
  let text = rawTab ? rawTab.value.trim() : "";
  // if text exists in raw tab, parse text
  if(text.length > 0){
    // remove all children within this element
    this.clear();
    // insert tabs at beginning of content
    // this.insertAdjacentHTML("afterbegin", parseTabs(text));
    this.parseTabs(text);
  }
}

function initTabContainer(tc){
  // add helper functions
  tc.draw = draw;
  tc.update = update;
  tc.parseTabs = parseTabs;
  tc.clear = (s) => {
    let el = s ? this.querySelector(s) : tc;
    while(el.firstChild){ el.removeChild(el.firstChild); }
  };

  // remove all children if any
  tc.clear();

  const generate = document.querySelector(`.generate[for="${ tc.id }"]`);
  const rawTab = document.querySelector(`.raw-tab[for="${ tc.id }"]`);

  if(generate){
    // generate html code when button is clicked
    generate.addEventListener("click", e => {
      tc.draw();
    });
  }

  if(rawTab){
    // generate html code when enter key is pressed
    rawTab.addEventListener("keypress", e => {
      if(e.key.toLowerCase() === "enter"){
        e.preventDefault();
        tc.draw();
      }
    });
  }
}
