'use strict';

const supportedProperties = [
  {name : "borderImageSlice", cssName : "border-image-slice", unit : ""},
  {name : "borderImageWidth", cssName : "border-image-width", unit : "px"},
  {name : "borderImageOutset", cssName : "border-image-outset", unit : "px"}, {
    name : "borderImageRepeat",
    cssName : "border-image-repeat",
    values : [ "stretch", "repeat", "round" ],
    valuesCount : 2
  }
];
let controlFrame = null;
let context = {properties : {}};

document.addEventListener('click', function(e) {
  let target = e.target || e.srcElement;
  var cs = window.getComputedStyle(target, null);
  if (cs.getPropertyValue("border-image-slice") != "100%") {
    setup(cs, target);
  }
}, false);

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
  width:430px;
  height:400px;
  background:#BBB;
  position:absolute;
  border:solid 2px black;
  font-size:14px;
  z-index:1000;
`;
controlFrame.setAttribute("class", "biltMovable");

controlFrame.innerHTML = `
  <b><span class="biltMovable">BorderImageLiveTweaker</span></b>
  <hr/>
  <span class="biltMovable">Selected: </span>
  <span id="biltName" class="biltMovable">?</span>
  <hr/>
  <div id="biltContent">
  </div>
  <hr/>
  <textarea id="biltOutput" style="width:95%; height:100px; resize:none; font-size:10px;">
  </textarea>
`;

let firstTime = true;

function setup(cs, target) {
  context.target = target;
  document.body.appendChild(controlFrame);
  let elem = document.getElementById("biltName");
  elem.innerHTML = target.tagName + " " + target.className + " " + target.id;
  document.getElementById("biltContent").innerHTML = "";

  for (let prop of supportedProperties) {
    if (prop.values == null) {
      setupSliders(cs, target, prop.cssName, prop.name);
    }
  }
  for (let prop of supportedProperties) {
    if (prop.values != null) {
      setupSelectValues(cs, target, prop);
    }
  }

  updateOutput();

  if (firstTime) {
    let textArea = document.getElementById("biltOutput");
    textArea.addEventListener("input", function(e) {
      target.style = textArea.value;
      var cs = window.getComputedStyle(target, null);
      setup(cs, target);
      textArea.focus();
    });
    firstTime = false;
  }
}

function setupSliders(cs, target, propertyName, propertyNameCamelCase) {
  let parent = document.createElement("div");
  let group = document.createElement("div");

  context.properties[propertyNameCamelCase] = [];

  parent.style = `
    display:inline-block;
    margin: 0 3px 20px 3px;
  `;

  group.style = `
    position:relative;
    display:block;
    width: 128px;
    height: 128px;
  `;

  for (let i = 0; i < 4; ++i) {
    let elem = setupSlider(cs, target, propertyName, propertyNameCamelCase, i);
    group.appendChild(elem);
  }

  parent.append(propertyName);
  parent.appendChild(group);

  document.getElementById("biltContent").appendChild(parent);
}

function setupSlider(cs, target, propertyName, propertyNameCamelCase,
                     position) {
  let elem = document.createElement("input");
  elem.setAttribute("type", "range");
  elem.setAttribute("min", "0");
  elem.setAttribute("max", "100");
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
  value = parseInt(value, 10);
  context.properties[propertyNameCamelCase][position] = value;
  elem.value = value;
  elem.oninput = function(e) {
    let v = context.properties[propertyNameCamelCase];
    v[position] = elem.value;
    target.style[propertyNameCamelCase] = v.join(' ');
    updateOutput();
  };
  return elem;
}

function getPropertyValue(cs, propertyName, position) {
  let value = cs.getPropertyValue(propertyName);
  let values = value.split(" ");

  if (values.length > 1) {
    return values[position];
  }

  return value;
}

function updateOutput() {
  let elem = document.getElementById("biltOutput");
  let content = "";
  for (let prop of supportedProperties) {
    if (prop.values == null) {
      content += getOutput(prop.cssName, prop.name, prop.unit) + "\n";
    } else {
      content += getSelectOutput(prop) + "\n";
    }
  }
  elem.innerHTML = content;
}

function getOutput(propertyName, propertyNameCamelCase, unit) {
  let v = context.properties[propertyNameCamelCase];
  return propertyName + ": " + v.join(unit + ' ') + unit + ";";
}

function getSelectOutput(prop) {
  let v = context.properties[prop.name];
  return prop.cssName + ": " + v.join(' ') + ";";
}

function setupSelectValues(cs, target, prop) {

  let parent = document.createElement("div");

  context.properties[prop.name] = [];

  parent.style = `
    display:inline-block;
    margin: 0 3px 3px 3px;
  `;

  parent.append(prop.name);

  for (let i = 0; i < prop.valuesCount; ++i) {
    let select = document.createElement("select");
    let currentValue = getPropertyValue(cs, prop.cssName, i);
    for (let value of prop.values) {
      let option = document.createElement("option");
      option.setAttribute("value", value);
      option.innerHTML = value;
      select.appendChild(option);
    }
    parent.appendChild(select);
    select.value = currentValue;
    let v = context.properties[prop.name];
    v[i] = currentValue;
    select.addEventListener("change", function() {
      v[i] = select.value;
      target.style[prop.name] = v.join(' ');
      updateOutput();
    });
  }

  document.getElementById("biltContent").appendChild(parent);
}
