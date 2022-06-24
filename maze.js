let canvas = document.getElementById("mazeCanvas");
let context = canvas.getContext("2d");
let startNodeButton = document.getElementById("startNodeButton");
let endNodeButton = document.getElementById("endNodeButton");
let wallButton = document.getElementById("wallButton");
let solveButton = document.getElementById("solveButton");

//EVENT LISTENERS
canvas.addEventListener("mousedown", canvasClicked);
startNodeButton.addEventListener("click", startNodeButtonClicked);
endNodeButton.addEventListener("click", endNodeButtonClicked);
wallButton.addEventListener("click", wallButtonClicked);
solveButton.addEventListener("click", scanGrid);

//global vars
let currentSelected = 0; //0 is a wall, 1 is a start node, 2 is an end node

function startNodeButtonClicked(e) {
  currentSelected = 1;
}
function endNodeButtonClicked(e) {
  currentSelected = 2;
}
function wallButtonClicked(e) {
  currentSelected = 0;
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
  } else if (e.button == 2) {
    //right click
    fillInSquare(e.offsetX, e.offsetY, 1);
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

function scanGrid() {
  ///////////////////////////////////
  // INIT 2D ARRAY
  let grid = [];
  for (let i = 0; i < 10; i++) {
    grid[i] = [];
  }
  //////////////////////////////////

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      let pixelData = context.getImageData(
        row * 50 + 1,
        col * 50 + 1,
        1,
        1
      ).data;

      if (
        pixelData[0] == 0 &&
        pixelData[1] == 0 &&
        pixelData[2] == 0 &&
        pixelData[3] == 0
      ) {
        //pixel is transparent
        grid[col][row] = 0;
      } else if (
        pixelData[0] == 0 &&
        pixelData[1] == 0 &&
        pixelData[2] == 0 &&
        pixelData[3] == 255
      ) {
        //pixel is black
        grid[col][row] = 1;
      } else if (
        pixelData[0] == 0 &&
        pixelData[1] == 128 &&
        pixelData[2] == 0 &&
        pixelData[3] == 255
      ) {
        //pixel is green
        grid[col][row] = 2;
      } else if (
        pixelData[0] == 255 &&
        pixelData[1] == 0 &&
        pixelData[2] == 0 &&
        pixelData[3] == 255
      ) {
        //pixel is red
        grid[col][row] = 3;
      }
    }
  }
  //scan grid making a 2D array

  let graph = new Graph(grid);

  graph.createNodes();
  graph.createEdges();
}

//TODO CREATE A GRAPH FROM THE GRID 2D Array

// create a graph class

class Graph {
  constructor(matrix) {
    this.matrix = matrix;
    console.log(this.matrix);
    this.adjacencyList = {};
    //holds list of nodes
    //each node in the list has a list of all nodes that are connected to it
  }

  addNode(node) {
    if (!this.adjacencyList[node]) {
      this.adjacencyList[node] = [];
      console.log("added node");
    }
  }

  addEdge(node1, node2) {
    this.adjacencyList[node1].push(node2);
    this.adjacencyList[node2].push(node2);
  }

  removeEdge(node1, node2) {
    this.adjacencyList[node1] = this.adjacencyList[node1].filter(
      (v) => v !== node2
    );
    this.adjacencyList[node2] = this.adjacencyList[node2].filter(
      (v) => v !== node1
    );
  }

  removeNode(node) {
    let edges = this.adjacencyList[node];
    for (let edge of edges) {
      this.removeEdge(vertex, edge);
    }
    delete this.adjacencyList[vertex];
  }

  //create nodes
  createNodes() {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        //console.log(this.matrix[row][col]); //reads left to right top to bottom
        if (this.matrix[row][col] == 0) {
          //this is a white box
          this.addNode(new Node(row, col, 0));
        } else if (this.matrix[row][col] == 2) {
          //start node
          this.addNode(new Node(row, col, 2));
        } else if (this.matrix[row][col] == 3) {
          //end node
          this.addNode(new Node(row, col, 3));
        }
      }
    }
    console.log(this.adjacencyList);
  }

  createEdges() {
    for (let index = 0; index < this.adjacencyList; index++) {
      console.log(this.adjacencyList[index]);
    }
  }
}

class Node {
  constructor(xCoord, yCoord, value) {
    this.xCoord = xCoord;
    this.yCoord = yCoord;
    this.value = value; //1, 2, or 3
  }

  get node() {
    return this.node;
  }
}
