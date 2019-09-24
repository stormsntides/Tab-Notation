function rearrangeNodes(movedEle){
	if(movedEle && movedEle.classList.contains("moved")){
		let meTrf = movedEle.transform.baseVal.getItem(0);
		// get the parent note group and loop through each child
		let eleGroup = movedEle.parentNode;
		let groupName = eleGroup.getAttribute("name");
		// move element to the end of the parent node so that it isn't compared against itself until the end
		eleGroup.append(movedEle);
		// begin checking y if x overlaps; if child x becomes greater than group x, stop checking y and insert moved node
		let checkY = false;
		let groupX = 0;
		for(let ci = 0; ci < eleGroup.children.length; ci++){
			let child = eleGroup.children[ci];
			// get the translation values for each element
			let chTrf = child.transform.baseVal.getItem(0);
			let isXless = meTrf.matrix.e < chTrf.matrix.e;
			let isYless = meTrf.matrix.f < chTrf.matrix.f;
			// check which group moved ele is currently in; if notes, check if y is less; if tabs, check if x is less
			if((groupName === "notes" && isYless) || (groupName === "tabs" && isXless)){
				eleGroup.insertBefore(movedEle, child);
				break;
			}
		}
		// adjust string position so that it is aligned with the nearest string
		meTrf.setTranslate(meTrf.matrix.e, SETTINGS.nearestString(movedEle) * SETTINGS.lineSpacing);
		movedEle.classList.remove("moved");
	}
}

function makeDraggable(evt) {
  var svg = evt.target;

  // add event listeners for all possible input types
  svg.addEventListener('mousedown', startDrag);
  svg.addEventListener('mousemove', drag);
  svg.addEventListener('mouseup', endDrag);
  svg.addEventListener('mouseleave', endDrag);
  svg.addEventListener('touchstart', startDrag);
  svg.addEventListener('touchmove', drag);
  svg.addEventListener('touchend', endDrag);
  svg.addEventListener('touchleave', endDrag);
  svg.addEventListener('touchcancel', endDrag);

  // get the position of the mouse in SVG coordinates
  function getMousePosition(evt) {
    var CTM = svg.getScreenCTM();
    if (evt.touches) { evt = evt.touches[0]; }
    return {
      x: (evt.clientX - CTM.e) / CTM.a,
      y: (evt.clientY - CTM.f) / CTM.d
    };
  }

  // keep track of the element being dragged, the offset position of the mouse, and the current transform
  // get min and max boundaries to confine svg elements
  var selectedElement, offset, transform, min, max;

  function initDrag(evt){
    offset = getMousePosition(evt);
    min = { x: 0, y: 0 };
    max = { x: 0, y: 0 };

    // set boundaries so that elements can't "escape" svg
    var brect = svg.getBoundingClientRect();
    var bbox = selectedElement.getBBox();
    min.x = 0;
    max.x = brect.width - bbox.x - bbox.width;
    min.y = SETTINGS.lineSpacing - (bbox.y + SETTINGS.charRef.height / 2);
    max.y = (selectedElement.closest("svg").querySelector("[name='notes']").children.length * SETTINGS.lineSpacing) - (bbox.y + bbox.height - SETTINGS.charRef.height / 2);

    // make sure the first transform on the element is a translate transform
    var transforms = selectedElement.transform.baseVal;

    if (transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
      // create a transform that translates by (0, 0)
      var translate = svg.createSVGTransform();
      translate.setTranslate(0, 0);
      selectedElement.transform.baseVal.insertItemBefore(translate, 0);
    }

    // get initial translation
    transform = transforms.getItem(0);
    offset.x -= transform.matrix.e;
    offset.y -= transform.matrix.f;
  }

  function startDrag(evt) {
    // make sure element is draggable before attempting to move
    if (evt.target.classList.contains('draggable')) {
      selectedElement = evt.target;
      initDrag(evt);
    } else if (evt.target.parentNode.classList.contains('draggable')){
      selectedElement = evt.target.parentNode;
      initDrag(evt);
    }
  }

  function drag(evt) {
    if (selectedElement) {
      evt.preventDefault();
      var coord = getMousePosition(evt);

      var dx = selectedElement.classList.contains('restrict-x') ? transform.matrix.e : coord.x - offset.x;
      var dy = selectedElement.classList.contains('restrict-y') ? transform.matrix.f : coord.y - offset.y;

      if(dx < min.x) { dx = min.x; }
      else if(dx > max.x) { dx = max.x; }
      if(dy < min.y) { dy = min.y; }
      else if(dy > max.y) { dy = max.y; }

      transform.setTranslate(dx, dy);
    }
  }

  function endDrag(evt) {
    if(selectedElement){
      selectedElement.classList.add('moved');
      rearrangeNodes(selectedElement);
      testTrigger(selectedElement);
      selectedElement = false;
    }
  }
}
