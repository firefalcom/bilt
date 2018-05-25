'use strict';

const Position = {
  TOP : 0,
  RIGHT : 1,
  BOTTOM : 2,
  LEFT : 3
};

const positionTexts = [ "top", "right", "bottom", "left" ];

let controlFrame = null;

let context = {target : null, borderImageSlice : []};

document.addEventListener('click', function(e) {
  let target = e.target || e.srcElement;
  var cs = window.getComputedStyle(target, null);
  if (cs.getPropertyValue("border-image-slice") != "100%") {
    setup(cs, target);
  }
}, false);

document.onkeydown = function(e) {
  if (context.target == null) {
    return;
  }

  switch (e.keyCode) {
  case 37:
    alert('left');
    break;
  case 38:
    alert('up');
    break;
  case 39:
    alert('right');
    break;
  case 40:
    alert('down');
    break;
  }
};
let x_elem = 0, y_elem = 0, moving = false;
controlFrame = document.createElement("div");
controlFrame.onmousedown = function(e) {
  if (e.srcElement.className == "biltMovable") {
    x_elem = controlFrame.offsetLeft - e.pageX;
    y_elem = controlFrame.offsetTop - e.pageY;
    moving = true;
    return false;
  }
  return true;
};
window.onmousemove = function(e) {
  if (moving) {
    controlFrame.style.left = ((e.pageX + x_elem)) + 'px';
    controlFrame.style.top = ((e.pageY + y_elem)) + 'px';
    return false;
  }
  return true;
};
controlFrame.onmouseup = function(e) {
  moving = false;
  return false;
};
controlFrame.style = `
    width:400px;
    height:400px;
    background:#888;
    position:absolute;
`;
controlFrame.setAttribute("class", "biltMovable");

controlFrame.innerHTML = `
 <span id="biltName" class="biltMovable">?</span>
 <input type="range" min="1" max="100" value="50" id="biltSlice0">
 <input type="range" min="1" max="100" value="50" id="biltSlice1">
 <input type="range" min="1" max="100" value="50" id="biltSlice2">
 <input type="range" min="1" max="100" value="50" id="biltSlice3">
`;

function setup(cs, target) {
  document.body.appendChild(controlFrame);
  let elem = document.getElementById("biltName");
  elem.innerHTML = target.tagName + " " + target.className + " " + target.id;
  setupSliders(cs, target, "border-image-slice", "borderImageSlice");
}

function setupSliders(cs, target, propertyName, propertyNameCamelCase) {
  for (let i = 0; i < 4; ++i) {
    setupSlider(cs, target, propertyName, propertyNameCamelCase, i);
  }
}

function setupSlider(cs, target, propertyName, propertyNameCamelCase,
                     position) {
  let elem = document.getElementById("biltSlice" + position);
  elem.style.position = "absolute";
  elem.style.top = "150px";
  elem.style.left = "0";
  elem.style.transform = "rotate(" + (90 + (90 * position)) +"deg)";
  elem.style.transformOrigin = "100% 50%";
  let value = getPropertyValue(cs, propertyName, position);
  context[propertyNameCamelCase][position] = value;
  elem.value = value;
  elem.oninput = function(e) {
    let v = context[propertyNameCamelCase];
    v[position] = elem.value;
    target.style[propertyNameCamelCase] = v.join(' ');
  };
}

function getPropertyValue(cs, propertyName, position) {
  let value = cs.getPropertyValue(propertyName);
  let values = value.split(" ");

  if (values.length == 4) {
    return values[position];
  }

  return value;
}
