function parseTabs(text){
	// reference to tab container should "this" not work in functions
	const parent = this;
	let currentStaff;
	let numOfStrings = 0;

  // tokenize text and create array to generate string tabs into
	const tokens = tokenize(text);
  const writeToStrings = [];
  const markerList = {
    list: [0],
    last() { return this.list[this.list.length - 1]; },
    add() { this.list.push(this.last() + 2); }
  };

	const createStaff = (tuning="EBGDAE") => {
		// create new staff node to place tuning nodes into
		currentStaff = document.createElement("div");
		currentStaff.classList.add("tab-staff");
		currentStaff.classList.add(numberToText(tuning.length) + "-string-instrument");

		// convert tuning string to array
		let re = /[A-G][#b]*/g;
		let tArr = tuning.match(re);

		// append tuning notes to staff
		for (let t = 0; t < tArr.length; t++) {
			let tuningNode = document.createElement("span");
			tuningNode.classList.add("tuning-node");
			tuningNode.classList.add(`string-${ t + 1 }`);
			tuningNode.style.left = markerList.last();

			tuningNode.appendChild(document.createTextNode(tArr[t]));
			currentStaff.appendChild(tuningNode);
		}

		numOfStrings = tArr.length;
		parent.appendChild(currentStaff);

		markerList.add();
	};

	const addTabs = (token) => {
		if(!currentStaff) { createStaff(); }

		let tabs = token.value;
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

		// append tabs to staff
		for(let v = 0; v < vals.length; v++){
			let tabNode = document.createElement("span");
			tabNode.classList.add("tab-node");
			tabNode.classList.add("string-" + vals[v].str);

			tabNode.appendChild(document.createTextNode(vals[v].tab));
			tabNode.style.left = markerList.last() + "em";

			currentStaff.appendChild(tabNode);
		}

		markerList.add();
	};

  for(let z = 0; z < tokens.length; z++){
    let tkn = tokens[z];
    switch(tkn.type){
			case "Tuning":
				createStaff(tkn.value);
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
      case "String":
      case "String Chord":
				// erase data in writeToStrings and replace with new write values
        writeToStrings.splice(0, writeToStrings.length);
        for(let n = 0; n < tkn.value.length; n++){
          writeToStrings.push(parseInt(tkn.value[n]));
        }
        break;
			case "String Chord Range":
				// erase data in writeToStrings and replace with new write values
				writeToStrings.splice(0, writeToStrings.length);
				// get the difference between the values and build the range (decreasing or increasing)
				let df = parseInt(tkn.value[0]) - parseInt(tkn.value[1]);
				for(let m = 0; m <= Math.abs(df); m++){
					writeToStrings.push(tkn.value[0] - (m * Math.sign(df)));
				}
				break;
			case "Percussion":
			case "Tab":
      case "Tab Chord":
				addTabs(tkn);
        break;
			case "Whitespace": break;
      case "Multiply":
        let prevTkn = tokens.prevToken(z);
				let nextTkn = tokens.nextToken(z);
        if(prevTkn && (prevTkn.type === "Tab" || prevTkn.type === "Tab Chord" || prevTkn.type === "Percussion") && nextTkn && nextTkn.type === "Tab"){
          // repeat how many times specified in the multiply token
          for(let r = 0; r < nextTkn.value[0] - 1; r++){
						addTabs(prevTkn);
          }
        }
				z += 1;
        break;
      default: break;
    }
  }

	function addModifier(type){
		if(!currentStaff) { createStaff(); }
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
				let barLine = document.createElement("span");
				barLine.classList.add(`${ type }-${ numOfStrings }`);
				barLine.style.left = markerList.last() + "em";

				currentStaff.appendChild(barLine);
				// markerList.add();
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
