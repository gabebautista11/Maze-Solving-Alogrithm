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
  createGraph(grid);

  function createGraph(grid) {
    let graph = new Graph(grid);

    graph.createNodes();
    console.log(graph.adjacencyList);
    graph.createEdges();
    console.log(graph.adjacencyList);
  }
}

//TODO CREATE A GRAPH FROM THE GRID 2D Array

// create a graph class

class Graph {
  constructor(matrix) {
    this.matrix = matrix;
    this.adjacencyList = [];
    //holds list of nodes
    //each node in the list has a list of all nodes that are connected to it
  }

  addNode(node) {
    if (!this.adjacencyList[node]) {
      this.adjacencyList.push(node);
    }
  }

  getNodeIndex(row, col) {
    for (let index = 0; index < this.adjacencyList.length; index++) {
      if (
        this.adjacencyList[index].xCoord == col &&
        this.adjacencyList[index].yCoord == row
      ) {
        return index;
      }
    }
    return -1;
  }

  addEdge(node1, node2) {
    if (node1.isNodeNotInList(node2)) { //this if statment checks before adding duplicates
      node1.addNodeToAdjacencyList(node2);
    }
    if (node2.isNodeNotInList(node1)) {
      node2.addNodeToAdjacencyList(node1);
    }
  }

  //create nodes from the matrix and uses addNode to add it to the graph
  createNodes() {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        //console.log(this.matrix[row][col]); //reads left to right top to bottom
        if (this.matrix[row][col] == 0) {
          //this is a white box
          this.addNode(new Node(col, row, 0)); //add node to graph
        } else if (this.matrix[row][col] == 2) {
          //start node
          this.addNode(new Node(col, row, 2));
        } else if (this.matrix[row][col] == 3) {
          //end node
          this.addNode(new Node(col, row, 3));
        }
      }
    }
  }
  /**
   * Loops through the matrix and adds edges from the 2D array
   */
  createEdges() {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        if (this.getNodeIndex(row, col) != -1) {
          console.log(this.getNodeIndex(row, col));
          this.checkNeighbors(row, col, this.getNodeIndex(row, col));
        }
      }
    }
  }

  /**
   * checks neighbor nodes for edge connection
   * @param {*} row
   * @param {*} col
   * @param {*} node
   */
  checkNeighbors(row, col, node) {
    //if its on any edge check only what is around it
    if (this.getNodeIndex(row, col) != -1) {
      // if the given node is a real node in the graph
      for (let r = row - 1; r < row + 2; r++) {
        //loop through rows
        for (let c = col - 1; c < col + 2; c++) {
          //loop through cols
          if (r != row || c != col) {
            //this makes sure it does not check the middle
            try {
              let neighborNodeIndex = this.getNodeIndex(r, c); //neighbor node
              console.log(neighborNodeIndex, r, c);
              if (neighborNodeIndex != -1) {
                //if it could find the neighbor node
                this.addEdge(
                  this.adjacencyList[node],
                  this.adjacencyList[neighborNodeIndex]
                );
                console.log("added edge");
              }
            } catch (error) {
              console.log(error);
            }
          }
        }
      }
    }
  }
}

class Node {
  constructor(xCoord, yCoord, value) {
    this.xCoord = xCoord; //col
    this.yCoord = yCoord; //row
    this.value = value; //1, 2, or 3
    this.adjacencyList = [];
  }

  get node() {
    return this.node;
  }

  addNodeToAdjacencyList(node) {
    this.adjacencyList.push(node);
  }

  /**
   * Checks if parameter node is in Adjacency List
   */
  isNodeNotInList(node) {
    let x = node.xCoord;
    let y = node.yCoord;
    this.adjacencyList.forEach((element) => {
      if (element.xCoord == x && element.yCoord == y) {
        //node already in list
        return false;
      }
    });
    return true;
  }
}
