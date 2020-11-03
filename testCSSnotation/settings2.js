const SETTINGS = {
  clamp: function(n, min, max){
    return Math.min(Math.max(n, min), max);
  },
  nearestString: function(check){
    let noteGroup = check.closest("svg").querySelector("[name='notes']");
  	let y = check.transform.baseVal.getItem(0).matrix.f;
  	return this.clamp(Math.round(y / this.lineSpacing), 1, noteGroup.children.length);
  }
};

// class HTMLbuilder {
//   constructor() {
//     this.HTML = [];
//     this.marker = 0;
//     addNewTabStaff() {
//       let tabStaff = document.createElement("div");
//       tabStaff.classList.add("tab-staff");
//       tabStaff.classList.add("six-string-instrument");
//       this.HTML.push(tabStaff);
//     }
//     getLastStaff() {
//       return this.HTML[this.HTML.length - 1];
//     }
//     addTab(options) {
//       let tabNode = document.createElement("span");
//       tabNode.classList.add("tab-node");
//       let last = this.getLastStaff();
//       tabNode.style.left = (last.children.length * 2) + "em";
//     }
//   }
// }

function SVGbuilder(){
	const svg = [];
	this.addNewSVG = function(){
		let height = (this.strings.tuning.length + 1) * SETTINGS.lineSpacing;
		svg.push("<svg width='200em' height='" + ((height * 2) / 10) + "em' viewbox='0 0 1000 " + height + "' version='1.1' xmlns='http://www.w3.org/2000/svg'><rect fill='white' x='0' y='0' width='1000' height='" + height + "'/>");
	};
	this.closeAndGetSVG = function(){
		this.closeSVG();
		return svg.join("");
	};
	this.tabs = new function() {
    var text = [];
    this.markers = new function(){
      var markerList = [SETTINGS.charRef.width * 4];
      this.add = function(numChars=3){
        let last = markerList.length - 1;
        markerList.push(markerList[last] + (SETTINGS.charRef.width * numChars));
      };
      this.last = function(){
        return markerList[markerList.length - 1];
      };
      this.clear = function(){
        markerList = [SETTINGS.charRef.width * 4];
      }
    };
    this.add = function(options){
      if(options.tag === "text"){
        text.push("<text data-type='" + options.type + "' class='" + options.classes + "' fill='" + options.fill + "' transform='translate(" + options.translate.x + ", " + options.translate.y + ")'>" + options.text + "</text>");
      } else if(options.tag === "path"){
        text.push("<path data-type='" + options.type + "' class='" + options.classes + "' fill='" + options.fill + "' stroke='" + options.stroke.color + "' stroke-width='" + options.stroke.width + "' d='" + options.stroke.path + "' transform='translate(" + options.translate.x + ", " + options.translate.y + ")'/>");
      } else if(!options.tag){
        text.push(options.text);
      }
    };
    this.getHTML = function(){
      return "<g name='tabs'>" + text.join("") + "</g>";
    };
    this.clear = function(){
      text = [];
      this.markers.clear();
    };
	};
	this.strings = {
		tuning: [],
		toWrite: [],
		getHTML: function(){
			// set up the string lines
      let lines = "<path fill='transparent' stroke='gray' stroke-width='0.5' d='m " + (SETTINGS.charRef.width * 3) + " " + SETTINGS.lineSpacing + ((" h 2000 m -2000 " + SETTINGS.lineSpacing).repeat(this.tuning.length)) + "'/>";
      // set up note grouping and iterate through each note
			let notes = "<g name='notes'>";
			this.tuning.forEach(function(t, i){
        // set note position and attributes
				notes += "<text data-type='note' class='draggable restrict-x' transform='translate(0, " + ((i + 1) * SETTINGS.lineSpacing) + ")'>" + t + "</text>";
			});
			notes += "</g>";
      // separate notes and string lines by a barline
			return notes + "<path fill='transparent' stroke='black' stroke-width='1' d='m " + (SETTINGS.charRef.width * 3) + " 0 v " + ((this.tuning.length + 1) * SETTINGS.lineSpacing) + "'/>" + lines;
		}
	};
	this.closeSVG = function(){
		if(svg.length > 0){
			let last = svg.length - 1;
			svg[last] += this.strings.getHTML() + this.tabs.getHTML() + "</svg>";
			this.clear();
		}
	};
	this.clear = function(){
		this.tabs.clear();
		this.strings.tuning = [];
		this.strings.toWrite = [];
	};
}
