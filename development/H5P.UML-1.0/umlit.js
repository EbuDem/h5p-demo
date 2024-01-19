"use strict";
var DEBUG = true;
let canvas = null;
let entities = [];
let snapZones = [];
let connections = [];
let loading = 0;
let draggedEntity = null;
let dragDeltaX = 0;
let dragDeltaY = 0;
let showAnswers = false;
let correctColor;
let wrongColor;
let grid = new Grid(50,50,900,900,5,5);

var H5P = H5P || {};

H5P.UML = (function ($) {
  class Umlit {
   
    constructor(options, id) {
      this.options = $.extend(true, {}, {});
      this.exercises = [];
      this.id = id;

      this.fetchExercises();
      loading = 1;
      H5P.EventDispatcher.call(this);
    }

    async fetchExercises() {
      try {
        const response = await fetch(H5P.getPath("content/umlit-manifest.json", this.id));
        const arrayJson = await response.json();

        const totalCount = arrayJson.exercises.length;
        let fetchedCount = 0;

        for (let exercise of arrayJson.exercises) {
          const exerciseResponse = await fetch(H5P.getPath(`content/${exercise}`, this.id));
          const exerciseJson = await exerciseResponse.json();

          this.exercises.push(exerciseJson);
          fetchedCount++;

          if (fetchedCount === totalCount && this.onLoadedExercises) {
            this.onLoadedExercises(this.exercises);
          }
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    }

    onLoadedExercises(exercises) {
      console.log("onLoadedExercises", exercises);
      if (exercises.length === 0) {
        console.error("Error: No exercises loaded");
      }
      this.setExercise(exercises[0]);
      listOptions();
    }

    setExercise(exercise) {
      entities = exercise.entities.map(entity => new UMLClass(entity.name, entity.attributes, [], entity.startPos.x, entity.startPos.y));
      // snapZones = exercise.snapZones;
      // connections = exercise.connections;
      this.promptText.html(exercise.prompt)
    }

    attach($container) {
      $container.attr('id', "h5p-uml-draganddrop");

      this.mainWrapper = $('<div>', { 'id': "umlit-main" }).appendTo($container);

      this.promptText = $('<div>', { 'class': 'prompt-text' }).appendTo(this.mainWrapper);

      this.canvasWrapper = $('<div>', { 'id': 'canvas-wrapper' }).appendTo(this.mainWrapper);

      this.attachButton(this.mainWrapper);
    }

    attachButton(parent) {
      this.responseInput = $('<button>', { 'class': "nav-forward", 'type': 'button' }).appendTo(parent);

      $(this.responseInput).html("Next");

      this.responseInput.on('click', (e) => {
        console.log("showAnswers", showAnswers);
        showAnswers = true;
        noLoop();
      });
    }
  }


  return Umlit;
})(H5P.jQuery);

function setup() {
  canvas = createCanvas(1000, 1000); // Create a canvas using p5.js
  correctColor = color(125, 255, 125);
  wrongColor = color(255, 125, 125);

  canvas.parent(document.querySelector("#canvas-wrapper"))
}

function keyPressed(e)
{
  if(key == "1")
    DEBUG = !DEBUG;
}
function listOptions() {
  console.log("listOptions()")
  let startX = 150;
  let startY = 150;
  let marginY  = 150;
  for (let i = 0; i < entities.length; i++) {
    let entity = entities[i];

    grid.placeInGrid(entity,i,0);
  }
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

  drawSnapZones();
  grid.debugDraw();
  moveEntity();
  stroke(255);
  noFill();
  drawEntities();
  drawConnections();
}

function drawEntities() {
  for (let i = 0; i < entities.length; i++) {
    let entity = entities[i];
    let belongingZone = snapZones.find(zone => zone.entity == i)
    let color;
    if (belongingZone !== undefined) {
      let correct = belongingZone.correctEntity == i;

      if (showAnswers) {
        if (correct)
          color = correctColor;
        else
          color = wrongColor;
      }

    }
    if (DEBUG) text(i + "", entity.x, entity.y);
    entity.draw()
  }
}

function mousePressed() {
  if(showAnswers)
    return;

  if (!draggedEntity) {
    var targetEntity = getEntityOnCoords(mouseX, mouseY);
    if(targetEntity && targetEntity.draggable)
    {
      draggedEntity = targetEntity;
      dragDeltaX = draggedEntity.x - mouseX;
      dragDeltaY = draggedEntity.y - mouseY;
    }
  }
}

function mouseReleased() {
  if (showAnswers)
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


    if (DEBUG) text(i, zone.x, zone.y);

    drawingContext.setLineDash([10, 10]);
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

    if (connection.end.tip == "arrow")
      drawArrow(startPos, endPos);
    if (connection.start.tip == "arrow")
      drawArrow(endPos, startPos);

    labelLine(startPos, endPos, 20, "1", 0.15)
    labelLine(startPos, endPos, 20, "n", 0.85)
    stroke(0);
    line(startPos.x, startPos.y, endPos.x, endPos.y);
  }
}

function labelLine(startPos, endPos, relativeY, labelText, percentage) {
  let angle = atan2(endPos.y - startPos.y, endPos.x - startPos.x);
  let deltaX = endPos.x - startPos.x;
  let deltaY = endPos.y - startPos.y;

  let labelX = startPos.x + deltaX * percentage + cos(angle + HALF_PI) * relativeY;
  let labelY = startPos.y + deltaY * percentage + sin(angle + HALF_PI) * relativeY;

  noStroke();
  textStyle(NORMAL);
  text(labelText, labelX, labelY);
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