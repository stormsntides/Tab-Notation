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
  var selectedElement, offset, transform, minX, minY, maxX, maxY;

  function startDrag(evt) {
    // make sure element is draggable before attempting to move
    if (evt.target.classList.contains('draggable')) {
      selectedElement = evt.target;
      offset = getMousePosition(evt);

      // set boundaries so that elements can't "escape" svg
      var brect = svg.getBoundingClientRect();
      var bbox = selectedElement.getBBox();
      minX = 0 - bbox.x;
      maxX = brect.width - bbox.x - bbox.width;
      minY = 0 - bbox.y;
      maxY = brect.height - bbox.y - bbox.height;

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
  }

  function drag(evt) {
    if (selectedElement) {
      evt.preventDefault();
      var coord = getMousePosition(evt);

      var dx = coord.x - offset.x;
      var dy = coord.y - offset.y;

      if(dx < minX) { dx = minX; }
      else if(dx > maxX) { dx = maxX; }
      if(dy < minY) { dy = minY; }
      else if(dy > maxY) { dy = maxY; }

      transform.setTranslate(dx, dy);
    }
  }

  function endDrag(evt) {
    testTrigger(selectedElement);
    selectedElement = false;
  }
}
