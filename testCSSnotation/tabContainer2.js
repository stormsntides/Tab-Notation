function parseTabs(){
	const rawTab = document.querySelector(`.raw-tab[for="${ this.id }"]`);
	// if there's nothing to parse, don't run rest of function
	if(!rawTab){
		return;
	}

	let currentStaff;
	let numOfStrings = 0;

  // tokenize text and create array to generate string tabs into
	let text = rawTab.tagName === "TEXTAREA" ? rawTab.value.trim() : rawTab.textContent.trim();
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
		this.appendChild(currentStaff);

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
				break;
			case "bar-line":
				let barLine = document.createElement("span");
				barLine.classList.add(`${ type }-${ numOfStrings }`);
				barLine.style.left = markerList.last() + "em";

				currentStaff.appendChild(barLine);
				break;
			case "slide-up":
				break;
			case "slide-down":
				break;
			case "bend-up":
				break;
			case "bend-down":
				break;
			case "hammer-on":
				break;
			case "pull-off":
				break;
			case "finger-tap":
				break;
			default:
				break;
		}
	}
}

function draw(){
  // remove all children within this element
  this.clear();
  // insert tabs inside "this"
  this.parseTabs();
}

function clear(s){
	// if a selector "s" is provided, clear that element inside of "this"
	// else clear "this"
	let el = s ? this.querySelector(s) : this;
	while(el.firstChild){ el.removeChild(el.firstChild); }
}

function initTabContainer(){
	document.querySelectorAll(".tab-container").forEach((tc, i) => {
	  // add helper functions
		tc.clear = clear.bind(tc);
	  tc.parseTabs = parseTabs.bind(tc);
		tc.draw = draw.bind(tc);

	  // remove all children if any
	  tc.clear();
		tc.parseTabs();

	  const generate = document.querySelector(`.generate[for="${ tc.id }"]`);
	  const rawTab = document.querySelector(`.raw-tab[for="${ tc.id }"]`);

	  if(generate){
	    // generate html code when button is clicked
	    generate.addEventListener("click", e => {
	      tc.draw();
	    });
	  }

	  if(rawTab && rawTab.tagName === "TEXTAREA"){
			// generate html code when enter key is pressed
			rawTab.addEventListener("keypress", e => {
				if(e.key.toLowerCase() === "enter"){
					e.preventDefault();
					tc.draw();
				}
			});
	  }
	});
}

// check when DOM is fully loaded
if(document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)){
	initTabContainer();
} else {
	document.addEventListener("DOMContentLoaded", initTabContainer);
}
