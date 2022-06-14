let canvas = document.getElementById("mazeCanvas");
let context = canvas.getContext("2d");
let startNodeButton = document.getElementById("startNodeButton");
let endNodeButton = document.getElementById("endNodeButton");
let wallButton = document.getElementById("wallButton");

//EVENT LISTENERS
canvas.addEventListener("mousedown", canvasClicked);
startNodeButton.addEventListener("click", startNodeButtonClicked);
endNodeButton.addEventListener("click", endNodeButtonClicked);
wallButton.addEventListener("click", wallButtonClicked);

let currentSelected = 0; //0 is a wall, 1 is a start node, 2 is an end node

function startNodeButtonClicked(e) {
  currentSelected = 1;
  console.log(e);
}
function endNodeButtonClicked(e) {
  currentSelected = 2;
  console.log(e);
}
function wallButtonClicked(e) {
  currentSelected = 0;
  console.log(e);
}

function drawGrid() {
  drawVerticalLines();
  drawHorizontalLines();
}

let drawVerticalLines = () => {
  for (let x = 0; x < 550; x += 50) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, 500);
    context.closePath();
    context.stroke();
  }
};

let drawHorizontalLines = () => {
  for (let y = 0; y < 550; y += 50) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(500, y);
    context.closePath();
    context.stroke();
  }
};

let drawSquare = (x, y, buttonPressed) => {
  if (buttonPressed == 0) {
    if (currentSelected == 0) {
      //rect black
      context.fillStyle = "black";
      context.fillRect(x, y, 50, 50);
    } else if (currentSelected == 1) {
      context.fillStyle = "green";
      context.fillRect(x, y, 50, 50);
    } else if (currentSelected == 2) {
      context.fillStyle = "red";
      context.fillRect(x, y, 50, 50);
    }
  } else {
    //rect white
    context.fillStyle = "white";
    context.fillRect(x, y, 50, 50);
  }
  drawGrid();
};

drawGrid();

function canvasClicked(e) {
  if (e.button == 0) {
    //left click
    fillInSquare(e.offsetX, e.offsetY, 0);
    console.log("left click");
  } else if (e.button == 2) {
    //right click
    fillInSquare(e.offsetX, e.offsetY, 1);
    console.log("right click");
  }
}

function fillInSquare(x, y, buttonPressed) {
  let xCoord = x;
  let yCoord = y;
  let extraX = xCoord % 100;
  let extraY = yCoord % 100;
  yCoord = yCoord - extraY;
  xCoord = xCoord - extraX;
  if (extraX >= 50) {
    xCoord += 50;
  }
  if (extraY >= 50) {
    yCoord += 50;
  }
  drawSquare(xCoord, yCoord, buttonPressed);
}
