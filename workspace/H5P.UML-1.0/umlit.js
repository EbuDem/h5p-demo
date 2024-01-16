
var H5P = H5P || {};

let canvas = null;
let entities = [];
let snapZones = [];
let connections = [];
let paddingX = 5;
let paddingY = 15;
let attrLineHeight = 25;
let loading = 0;
let draggedEntity = null;
let dragDeltaX = 0;
let dragDeltaY = 0;
let showAnswers = false;
let correctColor;
let wrongColor;

H5P.UML = (function ($) {
  /**
   * Constructor function.
   */
  function Umlit(options, id) {
    // Extend defaults with provided options
    this.options = $.extend(true, {}, {
    }, options);
    // Keep provided id.
    this.id = id;
    console.log(this.id);
    let exercise = JSON.parse(htmlDecode(this.options.exercise));

    entities = exercise.entities;
    snapZones = exercise.snapZones;
    connections = exercise.connections;
    loading = 1;
    H5P.EventDispatcher.call(this);
  };

  /**
   * Attach function called by H5P framework to insert H5P content into
   * page
   *
   * @param {jQuery} $container
   */
  Umlit.prototype.attach = function ($container) {
    var self = this;

    $container.attr('id', "h5p-uml-draganddrop");

    self.mainWrapper = $('<div>', {
      'id' : "umlit-main"
    }).appendTo($container);


    // Add prompt
    self.promptText = $('<div>', {
      'class': 'prompt-text',
      'text': this.options.prompt
    }).appendTo(self.mainWrapper);

    // Add canvas parent
    self.canvasWrapper = $('<div>', {
      'id': 'canvas-wrapper'
    }).appendTo(self.mainWrapper);

    // Attach button to continue to next prompt
    self.attachButton(self.mainWrapper);
  };

  Umlit.prototype.attachButton = function(parent)
  {
    self.responseInput = $('<button>', {
      'class': "nav-forward",
      'type': 'button'
    }).appendTo(parent);

    $(self.responseInput).html("Next");

    // Listen to Enter key to submit answer
    self.responseInput.on('click', function (e) {
      console.log("showAnswers",showAnswers);
      showAnswers = true;
      noLoop(); //adasdaasddsas
    });
  }

  return Umlit;
})(H5P.jQuery);


// main.js
function setup() {
  canvas = createCanvas(1000, 1000); // Create a canvas using p5.js
  correctColor = color(125,255,125);
  wrongColor = color(255,125,125);
}

function mouseDragged()
{
  let entity = getEntityOnCoords(mouseX, mouseY);
  let entityIndex = entities.indexOf(entity);

  let belongingZone = snapZones.find(zone => zone.entity == entityIndex)
  if(belongingZone !== undefined)
  {
    belongingZone.entity = null;
  }
}

function draw() { 
  background(255);

  if (loading == 1)
    setPositionsForEntities();

  drawSnapZones();
  moveEntity();
  stroke(255);
  noFill();
  drawEntities();

  drawConnections();
}

function drawEntities() 
{
  for (let i = 0; i < entities.length; i++) {
    let entity = entities[i];
    let belongingZone = snapZones.find(zone => zone.entity == i)
    let color;
    if(belongingZone  !== undefined)
    {
      let correct = belongingZone.correctEntity == i;
   
      if(showAnswers)
      {
        if(correct)
          color = correctColor;
        else 
          color = wrongColor;
      }
    
    }
    text(i+"",entity.x,entity.y);
    drawEntity(entity,color)
  }

}

function htmlDecode(input){
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes[0].nodeValue;
}

function mousePressed() {
  if(showAnswers)
    return;

  if (!draggedEntity) {
    draggedEntity = getEntityOnCoords(mouseX, mouseY);
    if(draggedEntity)
    {
      dragDeltaX = draggedEntity.x - mouseX;
      dragDeltaY = draggedEntity.y - mouseY;
    }
  }
}

function mouseReleased() {
  if(showAnswers)
    return;

  draggedEntity = null;
  checkSnap();
}

function checkSnap() {
  let radius = 150;

  for (let j = 0; j < snapZones.length; j++) {
    let zone = snapZones[j];

    // If zone had an entity before 
    if (zone.entity !== null) {
      let prevEntity = entities[zone.entity];
      let prevMagSqrd = calcDistanceSqrFromCenter(prevEntity, zone);

      // check if its still inside if so skip zone else reset entity 
      if (prevMagSqrd >= radius * radius)
        snapZones[j].entity = null;
      else
        continue;
    }

    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      let magSqrd = calcDistanceSqrFromCenter(entity, zone);
  
      if (magSqrd < radius * radius) {
        var center = getCenter(zone);
        entity.x = center.x - entity.width / 2;
        entity.y = center.y - entity.height / 2;
        snapZones[j].entity = i;
      }
    }
  }
}

function getCenter(obj) {
  return {
    x: obj.x + obj.width / 2,
    y: obj.y + obj.height / 2
  }
}

function calcDistanceSqrFromCenter(first, second) {
  let center = getCenter(first);
  let secondCenter = getCenter(second);
  return (secondCenter.x - center.x) * (secondCenter.x - center.x) + (secondCenter.y - center.y) * (secondCenter.y - center.y);
}

function moveEntity() {
  if (!draggedEntity)
    return;

  let entity = draggedEntity;

  entity.x = mouseX + dragDeltaX;
  entity.y = mouseY + dragDeltaY;
}

function drawSnapZones() {
  for (let i = 0; i < snapZones.length; i++) {
    let zone = snapZones[i];
    if (zone.entity !== null)
      continue;

    text(i,zone.x,zone.y);
    drawingContext.setLineDash([10,10]);
    stroke(120)
    noFill();
    rect(zone.x, zone.y, zone.width, zone.height);
    drawingContext.setLineDash([]);
  }
}

// Returns the entity at the given cords
function getEntityOnCoords(x, y) {
  for (let i = 0; i < entities.length; i++) {
    var entity = entities[i];
    if (entity.x < x && x < entity.x + entity.width) {
      if (entity.y < y && y < entity.y + entity.height)
        return entity;
    }
  }
}

function drawEntity(entity,color) {
  let nameLineHeight = 20;

  stroke(0);
  if(color)
    stroke(color)
  fill(255);

  rect(entity.x, entity.y, entity.width, entity.height);
  line(entity.x, entity.y + nameLineHeight, entity.x + entity.width, entity.y + nameLineHeight);

  fill(0);
  noStroke();
  textStyle(BOLD);
  text(entity.name, entity.x + paddingX, entity.y + paddingY);

  let attrStartY = entity.y + nameLineHeight + paddingY;

  // List Attributes
  textStyle(NORMAL);
  for (let i = 0; i < entity.attributes.length; i++) {
    let attribute = entity.attributes[i];
    text(attribute, entity.x + paddingX, attrStartY + attrLineHeight * i);
  }
}

function setPositionsForEntities() {
  for (let i = 0; i < entities.length; i++) {
    entities[i].x = entities[i].startPos.x;
    entities[i].y = entities[i].startPos.y;
    if (!entities[i].height)
      entities[i].height = paddingY + attrLineHeight * entities[i].attributes.length;
  }

  canvas.parent(document.getElementById("canvas-wrapper"));
  loading = 2;
}

function drawConnections() {

  for (let i = 0; i < connections.length; i++) {
    let connection = connections[i];

    let startObj = snapZones[connection.start.zone];
    if (startObj.entity !== null)
      startObj = entities[startObj.entity];

    let endObj = snapZones[connection.end.zone];
    if (endObj.entity !== null)
      endObj = entities[endObj.entity];

    let startPos = getSide(startObj, connection.start.side, connection.start.perc);
    let endPos = getSide(endObj, connection.end.side, connection.end.perc);

    if(connection.end.tip == "arrow")
      drawArrow(startPos,endPos);
    if(connection.start.tip == "arrow")
      drawArrow(endPos,startPos);

    labelLine(startPos,endPos,20,"1",0.15)    
    labelLine(startPos,endPos,20,"n",0.85)    
    stroke(0);
    line(startPos.x, startPos.y, endPos.x, endPos.y);
  }
}

function labelLine(startPos,endPos, relativeY,labelText, percentage)
{
  let angle = atan2(endPos.y - startPos.y, endPos.x - startPos.x);
  let deltaX = endPos.x - startPos.x;
  let deltaY = endPos.y - startPos.y;

  let labelX = startPos.x + deltaX * percentage +  cos(angle + HALF_PI) * relativeY;
  let labelY = startPos.y + deltaY * percentage + sin(angle + HALF_PI) * relativeY;

  noStroke();
  textStyle(NORMAL);
  text(labelText,labelX,labelY);
}

function drawArrow(startPos, endPos) {
  let angle = atan2(endPos.y - startPos.y, endPos.x - startPos.x);

  let arrowX = endPos.x;
  let arrowY = endPos.y;

  // Draw the arrowhead
  triangle(
    arrowX, arrowY,
    arrowX - cos(angle + QUARTER_PI) * 10, arrowY - sin(angle + QUARTER_PI) * 10,
    arrowX - cos(angle - QUARTER_PI) * 10, arrowY - sin(angle - QUARTER_PI) * 10

  );
}

function getSide(obj, side, percentage = 0.5) {
  let line = { x: null, y: null };

  switch (side) {
    case "top":
      line.x = obj.x + obj.width * percentage;
      line.y = obj.y;
      break;
    case "left":
      line.x = obj.x;
      line.y = obj.y + obj.height * percentage;
      break;
    case "right":
      line.x = obj.x + obh.width;
      line.y = obj.y + obj.height * percentage;
      break;
    case "bottom":
      line.x = obj.x + obj.width * percentage;
      line.y = obj.y + obj.height;
      break;
  }
  return line;
}