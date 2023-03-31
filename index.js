const grid = document.getElementById("grid");
const startButton = document.getElementById("button");
const setWallButton = document.getElementById("setWall");
const setInitialButton = document.getElementById("setInitial");
const setTargetButton = document.getElementById("setTarget");
const setMoreTime = document.getElementById("setMoreTime");
const deleteButton = document.getElementById("deleteButton");
const fileInput = document.getElementById("file");
const restart = document.getElementById("restart");
const generateMazeButton = document.getElementById("generateMaze");
const removePathButton = document.getElementById("removePath");
let gridWidth = Math.floor(grid.offsetWidth / 30);
let gridHeight = Math.floor(grid.offsetHeight / 30);
let graph = new Graph(gridWidth, gridHeight);

class Modes {
  static setInitial = 0;
  static setTarget = 1;
  static setWall = 2;
  static setMoreTime = 3;
  static delete = 4;

  static classNames = ["initial", "target", "wall", "moreTime", ""];
}

let mode = Modes.setInitial;
let drag = false;
let initalNode;
let finalNode;

let executionQueue = [];

startButton.onclick = () => {
  executionQueue.unshift(start);
};

setInitialButton.onclick = () => {
  selectMode(Modes.setInitial, setInitialButton);
};

setTargetButton.onclick = () => {
  selectMode(Modes.setTarget, setTargetButton);
};

setWallButton.onclick = () => {
  selectMode(Modes.setWall, setWallButton);
};

setMoreTime.onclick = () => {
  selectMode(Modes.setMoreTime, setMoreTime);
};

deleteButton.onclick = () => {
  selectMode(Modes.delete, deleteButton);
};

generateMazeButton.onclick = () => {
  restartMatrix();
  removeInitial();
  executionQueue.unshift(generateMaze);
};

restart.onclick = async () => {
  executionQueue.unshift(restartMaze);
};

removePathButton.onclick = async () => {
  executionQueue.unshift(removePath);
};

async function restartMaze() {
  restartMatrix();
  removeInitial();
  await removePath();
  await removeMapElements();
}

async function loop() {
  if (executionQueue.length != 0) {
    const nextExecution = executionQueue.pop();
    await nextExecution();
  }

  requestAnimationFrame(loop);
}

async function start() {
  await removePath();

  if (initalNode == null || finalNode == null) return;

  console.log("Calculating...");
  const result = aStar(graph, initalNode, finalNode);
  console.log("Getting shortest path...");
  const shortestPath = getShortestPath(result?.pop());
  console.log("Done!");

  for (let node of result) {
    if (executionQueue.length > 0) return;
    if (node.id == initalNode.id) continue;
    const cell = document.getElementById(node.id);
    cell.classList.add("visited");
    await delay(10);
  }

  for (let node of shortestPath) {
    if (executionQueue.length > 0) return;
    if (node.id == initalNode.id || node.id == finalNode.id) continue;
    const cell = document.getElementById(node.id);
    cell.classList.add("shortest");
    await delay(10);
  }
}

function renderGrid() {
  grid.innerHTML = "";
  let nodeId = 0;
  for (let i = 0; i < gridHeight; i++) {
    //Se crean las columnas de la matriz en HTML
    const col = document.createElement("div");
    col.className = "grid-col";

    for (let j = 0; j < gridWidth; j++) {
      //Se crea el elemento html y se configura
      const cell = document.createElement("div");
      cell.className = "grid-row";
      cell.id = nodeId;
      cell.x = j;
      cell.y = i;

      cell.addEventListener("mousemove", (e) => {
        e.preventDefault();
        if (drag) onCellClick(cell, j, i);
      });

      cell.addEventListener("mousedown", (e) => {
        e.preventDefault();
        drag = true;
      });

      cell.addEventListener("click", (e) => {
        e.preventDefault();
        onCellClick(cell, j, i);
      });

      col.appendChild(cell);

      graph.addNode(new Node(nodeId++, j, i));
    }
    grid.appendChild(col);
  }
}

function onCellClick(row, x, y) {
  const className = Modes.classNames[mode];
  const currentNode = graph.getNode(x, y);
  resetNode(currentNode);

  switch (mode) {
    case Modes.setInitial:
      document.querySelector(`.${className}`)?.classList.remove(className);
      initalNode = currentNode;
      break;
    case Modes.setTarget:
      document.querySelector(`.${className}`)?.classList.remove(className);
      finalNode = currentNode;
      break;
    case Modes.setWall:
      currentNode.isWall = true;
      break;
    case Modes.setMoreTime:
      currentNode.extraTime = 10;
      break;
    case Modes.delete:
      deleteMapElement(currentNode);
      break;
  }

  row.className = "grid-row " + className;
}

function resetNode(node) {
  //Reiniciar nodo a su estado predeterminado
  node.extraTime = 0;
  node.isWall = false;
}

function deleteMapElement(node) {
  //Eliminar elemento del mapa
  if (node == initalNode) initalNode = null;
  if (node == finalNode) finalNode = null;
}

function calculateGridSize() {
  gridWidth = Math.floor(grid.offsetWidth / 30);
  gridHeight = Math.floor(grid.offsetHeight / 30);
}

function restartMatrix() {
  let nodeId = 0;
  for (let i = 0; i < gridHeight; i++) {
    for (let j = 0; j < gridWidth; j++) {
      graph.addNode(new Node(nodeId++, j, i));
    }
  }
}

async function generateMaze() {
  const height = Math.ceil((gridHeight - 2) / 2);
  const width = Math.ceil((gridWidth - 2) / 2);

  const maze = generateGrid(width, height);
  const steps = [];
  backtracking(0, 0, maze, steps);

  for (let i = 0; i < gridWidth; i++) {
    if (executionQueue.length > 0) return;
    for (let j = 0; j < gridHeight; j++) {
      const node = graph.getNode(i, j);
      node.isWall = true;
      const gridCell = document.getElementById(node.id);
      gridCell.className = "grid-row wall";
    }
    await delay(5);
  }

  for (let step of steps) {
    if (executionQueue.length > 0) return;
    const cell = step.val ? step.val : maze[step.y][step.x];

    const realX = step.x * 2 + 1;
    const realY = step.y * 2 + 1;

    const node = graph.getNode(realX, realY);
    node.isWall = false;
    const nodeCell = document.getElementById(node.id);
    nodeCell.className = "grid-row";

    const dx = realX + DX[cell];
    const dy = realY + DY[cell];

    if (dx <= 0 || dx >= gridWidth || dy <= 0 || dy >= gridHeight) continue;

    const pathNode = graph.getNode(dx, dy);
    pathNode.isWall = false;
    const pathCell = document.getElementById(pathNode.id);
    pathCell.className = "grid-row";
    await delay(5);
  }
}

function removeInitial() {
  initalNode = null
  finalNode = null
  document.querySelector(`.initial`)?.classList.remove("initial");
  document.querySelector(`.target`)?.classList.remove("target");
}

async function removePath() {
  const elements = [
    ...document.querySelectorAll(".visited"),
    ...document.querySelectorAll(".shortest"),
  ];

  for (let element of elements) {
    element.classList.remove("visited");
    element.classList.remove("shortest");
    await delay(0.025);
  }
}

async function removeMapElements() {
  const elements = [
    ...document.querySelectorAll(".wall"),
    ...document.querySelectorAll(".moreTime"),
  ];

  for (let element of elements) {
    element.className = "grid-row";
    await delay(0.025);
  }
}

function selectMode(newMode, button) {
  document
    .querySelector(`.lighten-3`)
    ?.classList.replace("lighten-3", "lighten-1");
  mode = newMode;
  button.classList.remove("lighten-1");
  button.classList.add("lighten-3");
}

document.addEventListener("mouseup", () => {
  drag = false;
});

grid.addEventListener("touchstart", (e) => {
  e.preventDefault();
  drag = true;
  const { clientX, clientY } = e.changedTouches[0];
  const cell = document.elementFromPoint(clientX, clientY);
  if (cell.x != undefined && cell.y != undefined && drag)
    onCellClick(cell, cell.x, cell.y);
});

document.addEventListener("touchend", (e) => {
  drag = false;
});

document.addEventListener("touchmove", (e) => {
  const { clientX, clientY } = e.changedTouches[0];
  const cell = document.elementFromPoint(clientX, clientY);
  if (cell.x != undefined && cell.y != undefined && drag)
    onCellClick(cell, cell.x, cell.y);
});

function delay(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

renderGrid();
loop();
