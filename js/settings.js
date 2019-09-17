const SETTINGS = {
  charSize: 6,
  lineSpacing: 12
};

function loadSettings(){
  if(!document.getElementById("tn-check-width")){
    document.body.insertAdjacentHTML("afterBegin", "<span id='tn-check-width'>0</span>");
  }
  fontWidthChar = document.getElementById("tn-check-width");
  SETTINGS.charSize = fontWidthChar.getBoundingClientRect().width;
};

loadSettings();

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
		tabs: {
      text: [],
			markers: [leftPad],
			addMarker: function(numChars=3){
				let last = this.markers.length - 1;
				this.markers.push(this.markers[last] + (SETTINGS.charSize * numChars));
			},
			lastMarker: function(){
				return this.markers[this.markers.length - 1];
			},
      addTab: function(tag, attrs, text){
        if(tag === "text"){
          this.text.push("<text data-type='" + attrs.type + "' class='" + attrs.classes + "' fill='" + attrs.fill + "' transform='translate(" + attrs.translate.x + ", " + attrs.translate.y + ")'>" + text + "</text>");
        } else if(tag === "path"){
          this.text.push("<path data-type='" + attrs.type + "' class='" + attrs.classes + "' fill='" + attrs.fill + "' stroke='" + attrs.stroke.color + "' stroke-width='" + attrs.stroke.width + "' d='" + attrs.stroke.path + "' transform='translate(" + attrs.translate.x + ", " + attrs.translate.y + ")'/>");
        }
      },
      getHTML: function(){
        return "<g name='tabs'>" + this.text.join("") + "</g>";
      }
		},
		strings: {
			tuning: [],
			toWrite: [],
			getHTML: function(){
				// set up the string lines
        let lines = "<path fill='transparent' stroke='gray' stroke-width='0.5' d='m " + (SETTINGS.charSize * 3) + " " + SETTINGS.lineSpacing + ((" h 2000 m -2000 " + SETTINGS.lineSpacing).repeat(this.tuning.length)) + "'/>";
        // set up note grouping and iterate through each note
				let notes = "<g name='notes'>";
				this.tuning.forEach(function(t, i){
          // set note position and attributes
					notes += "<text data-type='note' class='draggable restrict-x' transform='translate(0, " + ((i + 1) * SETTINGS.lineSpacing) + ")'>" + t + "</text>";
				});
				notes += "</g>";
        // separate notes and string lines by a barline
				return notes + "<path fill='transparent' stroke='black' stroke-width='1' d='m " + (SETTINGS.charSize * 3) + " 0 v " + ((this.tuning.length + 1) * SETTINGS.lineSpacing) + "'/>" + lines;
			}
		},
		closeSVG: function(){
			if(this.svg.length > 0){
				let last = this.svg.length - 1;
				this.svg[last] += this.strings.getHTML() + this.tabs.getHTML() + "</svg>";
				this.clear();
			}
		},
		clear: function(){
			this.tabs.text = [];
			this.strings.tuning = [];
			this.strings.toWrite = [];
		}
	};
}
