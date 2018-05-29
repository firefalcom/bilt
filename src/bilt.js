'use strict';

let controlFrame = null;

let context = {target : null, properties : {borderImageSlice : []}};

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
  width:256px;
  height:400px;
  background:#BBB;
  position:absolute;
  border:solid 2px black;
  font-size:13px;
`;
controlFrame.setAttribute("class", "biltMovable");

controlFrame.innerHTML = `
  <b><span class="biltMovable">BorderImageLiveTweaker</span></b>
  <hr/>
  <span class="biltMovable">Selected: </span>
  <span id="biltName" class="biltMovable">?</span>
  <hr/>
  <span class="biltMovable">border-image-slice</span>
  <div style="position:relative; width:128px; height:128px">
    <input type="range" min="1" max="100" value="50" id="biltSlice0">
    <input type="range" min="1" max="100" value="50" id="biltSlice1">
    <input type="range" min="1" max="100" value="50" id="biltSlice2">
    <input type="range" min="1" max="100" value="50" id="biltSlice3">
  </div>
  <hr/>
  <textarea id="biltOutput" style="width:95%; height:100px; resize:none; font-size:10px;" readonly>
  </textarea>
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
  elem.style = `
    width:64px;
    height:16px;
  `;
  elem.style.position = "absolute";
  elem.style.top = "64px";
  elem.style.left = "0";
  elem.style.transform = "rotate(" + (90 + (90 * position)) + "deg)";
  elem.style.transformOrigin = "100% 50%";
  let value = getPropertyValue(cs, propertyName, position);
  context.properties[propertyNameCamelCase][position] = value;
  elem.value = value;
  elem.oninput = function(e) {
    let v = context.properties[propertyNameCamelCase];
    v[position] = elem.value;
    target.style[propertyNameCamelCase] = v.join(' ');
    updateOutput();
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

function updateOutput() {
  let elem = document.getElementById("biltOutput");
  let content = "";
  content += getOutput("border-image-slice", "borderImageSlice");
  elem.innerHTML = content;
}

function getOutput(propertyName, propertyNameCamelCase) {
  let v = context.properties[propertyNameCamelCase];
  return propertyName + ": " + v.join(' ') + ";";
}
