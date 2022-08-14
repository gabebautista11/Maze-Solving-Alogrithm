let canvas = document.getElementById("mazeCanvas");
let context = canvas.getContext("2d");
let startNodeButton = document.getElementById("startNodeButton");
let endNodeButton = document.getElementById("endNodeButton");
let wallButton = document.getElementById("wallButton");
let solveButton = document.getElementById("solveButton");
let solved = document.querySelector(".solved");
let algoSelection = document.getElementById("algo-drop-down");

//EVENT LISTENERS
canvas.addEventListener("mousedown", canvasClicked);
startNodeButton.addEventListener("click", startNodeButtonClicked);
endNodeButton.addEventListener("click", endNodeButtonClicked);
wallButton.addEventListener("click", wallButtonClicked);
solveButton.addEventListener("click", scanGrid);

//global vars
let currentSelected = 0; //0 is a wall, 1 is a start node, 2 is an end node

/**
 * start node toggle
 * @param {*} e
 */
function startNodeButtonClicked(e) {
  currentSelected = 1;
}
/**
 * end node toggle
 * @param {*} e
 */
function endNodeButtonClicked(e) {
  currentSelected = 2;
}
/**
 * wall button toggle
 * @param {} e
 */
function wallButtonClicked(e) {
  currentSelected = 0;
}
/**
 * draws grid
 */
function drawGrid() {
  drawVerticalLines();
  drawHorizontalLines();
}
/**
 * draws vertical lines on grid
 */
let drawVerticalLines = () => {
  for (let x = 0; x < 550; x += 50) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, 500);
    context.closePath();
    context.stroke();
  }
};

/**
 * draws horizontal lines on grid
 */
let drawHorizontalLines = () => {
  for (let y = 0; y < 550; y += 50) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(500, y);
    context.closePath();
    context.stroke();
  }
};

/**
 * draws square on grid
 * @param {} x
 * @param {*} y
 * @param {*} buttonPressed
 */
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
  } else if (buttonPressed == "search") {
    context.fillStyle = "blue";
    context.fillRect(x, y, 50, 50);
  } else if (buttonPressed == "solution") {
    context.fillStyle = "green";
    context.fillRect(x, y, 50, 50);
  } else {
    //rect white
    context.fillStyle = "rgba(255,255,255, 1)";
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

/**
 * scans grid and puts it in a 2d array
 */
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

      //pixel is transparent or white
      if (
        (pixelData[0] == 0 &&
          pixelData[1] == 0 &&
          pixelData[2] == 0 &&
          pixelData[3] == 0) ||
        (pixelData[0] == 255 &&
          pixelData[1] == 255 &&
          pixelData[2] == 255 &&
          pixelData[3] == 255)
      ) {
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
}
/**
 * creates graph from given grid
 * @param {} grid
 */
function createGraph(grid) {
  let graph = new Graph(grid);

  graph.createNodes();
  graph.createEdges();
  let algo = algoSelection.value;
  console.log(algo);
  let solution = "";
  if (algo == "dfs") {
    solution = graph.dfs();
  } else if (algo == "bfs") {
    //solution = graph.bfs()
  } else if (algo == "a*") {
    //solution = graph.bfs
  }

  drawSolution(solution); //drwas solution green
}

/**
 * display if the maze has been solved or not
 * @param {*} solution
 */
function drawSolution(solution) {
  solved.innerHTML = "SOLVED";
}

/**
 * Graph DS
 */
class Graph {
  constructor(matrix) {
    this.matrix = matrix;
    this.adjacencyList = [];
    this.startingNodeCol = 0;
    this.startingNodeRow = 0;
    this.endingNodeCol = 0;
    this.endingNodeRow = 0;
    //holds list of nodes
    //each node in the list has a list of all nodes that are connected to it
  }

  /**
   * adds node to graph
   * @param {*} node
   */
  addNode(node) {
    if (!this.adjacencyList[node]) {
      this.adjacencyList.push(node);
    }
  }

  /**
   * get index of node in the adj list
   * @param {*} row
   * @param {*} col
   * @returns index of node in graph adj list
   */
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

  /**
   * adds edge between node1 and node2
   * @param {*} node1Index
   * @param {*} node2Index
   */
  addEdge(node1Index, node2Index) {
    let node1 = this.adjacencyList[node1Index];
    let node2 = this.adjacencyList[node2Index];
    if (node1.isNodeNotInList(node2) && node2.isNodeNotInList(node1)) {
      //this if statment checks before adding duplicates
      node1.addNodeToAdjacencyList(node2);
      node2.addNodeToAdjacencyList(node1);
    }

    console.log("added edge");
  }

  /**
   * adds all node to graph from the matrix
   */
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
          this.startingNodeCol = col;
          this.startingNodeRow = row;
        } else if (this.matrix[row][col] == 3) {
          //end node
          this.addNode(new Node(col, row, 3));
          this.endingNodeCol = col;
          this.endingNodeRow = row;
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
            if (
              (r == row + 1 && c == col) ||
              (r == row - 1 && c == col) ||
              (r == row && c == col - 1) ||
              (r == row && c == col + 1)
            ) {
              //this makes sure it does not check the middle
              try {
                let neighborNodeIndex = this.getNodeIndex(r, c); //neighbor node
                console.log(neighborNodeIndex, r, c);
                if (neighborNodeIndex != -1) {
                  //if it could find the neighbor node
                  this.addEdge(node, neighborNodeIndex);
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

  /**
   * depth First Search
   */
  dfs() {
    //start node
    let startNode =
      this.adjacencyList[
        this.getNodeIndex(this.startingNodeRow, this.startingNodeCol)
      ];
    let endNode =
      this.adjacencyList[
        this.getNodeIndex(this.endingNodeRow, this.endingNodeCol)
      ];

    return this.dfsLoop(this, startNode, endNode);
  }

  /**
   * dfs using loop algo
   * @param {} graph
   * @param {*} node
   * @param {*} endNode
   * @returns
   */
  dfsLoop(graph, node, endNode) {
    let i = 0;
    let stack = []; //stack ds
    stack.push(node);
    while (stack.length > 0) {
      node = stack.pop();
      if (node.isVisited() == false) {
        node.setVisited(); //sets node to visisted
        if (node.xCoord == endNode.xCoord && node.yCoord == endNode.yCoord) {
          return stack;
        }
        i++;
        setTimeout(this.colorForSearch, 200 * i, node);
        node.getAdjList().forEach((element) => {
          stack.push(element);
        });
      }
    }
  }

  /**
   * breadth first search
   */
  bfs(graph, node, endNode) {
    // BFS (G, s)                   //Where G is the graph and s is the source node
    //   let Q be queue.
    //   Q.enqueue( s ) //Inserting s in queue until all its neighbour vertices are marked.
    //   mark s as visited.
    //   while ( Q is not empty)
    //        //Removing that vertex from queue,whose neighbour will be visited now
    //        v  =  Q.dequeue( )
    //       //processing all the neighbours of v
    //       for all neighbours w of v in Graph G
    //            if w is not visited
    //                     Q.enqueue( w )             //Stores w in Q to further visit its neighbour
    //                     mark w as visited.

    let queue = [];
    queue.push(node);
    node.setVisited();
    while (queue.length > 0) {
      vertex = queue.shift();
      vetex.getAdjList().forEach((element) => {
        queue.push(element);
        element.setVisited();
      });
    }
  }

  /**
   * colors in given node the search color (blue)
   * @param {} node
   */
  colorForSearch(node) {
    console.log("drawing blue square");
    drawSquare(node.xCoord * 50, node.yCoord * 50, "search");
  }

  /**
   * recursive version of dfs
   * @param {} graph
   * @param {*} node
   */
  dfsRecursive(graph, node) {
    node.setVisited();
    node.getAdjList().forEach((element) => {
      if (element.isVisited() == false) {
        drawSquare(element.xCoord, element.yCoord, "search");
        this.dfs(graph, element);
      }
    });
  }
}

/**
 * node DS
 */
class Node {
  constructor(xCoord, yCoord, value) {
    this.xCoord = xCoord; //col
    this.yCoord = yCoord; //row
    this.value = value; //1, 2, or 3
    this.adjacencyList = new Set();
    this.visited = false;
  }

  addNodeToAdjacencyList(node) {
    this.adjacencyList.add(node);
  }

  /**
   * Checks if parameter node is in Adjacency List
   */
  isNodeNotInList(node) {
    let x = node.xCoord;
    let y = node.yCoord;
    this.adjacencyList.forEach((element) => {
      console.log(element);
      if (element.xCoord == x && element.yCoord == y) {
        //node already in list
        return false;
      }
    });
    return true;
  }

  /**
   * sets the node visited to true
   */
  setVisited() {
    this.visited = true;
  }

  /**
   * gets the current node object adj list
   * @returns noeds adj list
   */
  getAdjList() {
    return this.adjacencyList;
  }

  /**
   * gets the visited attr of the node
   * @returns true or false if the node has been visited
   */
  isVisited() {
    if (this.visited == false) {
      return false;
    }
    return true;
  }
}
