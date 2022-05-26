const grid = document.getElementById("grid");
const startButton = document.getElementById("button");
const setWallButton = document.getElementById("setWall");
const setInitialButton = document.getElementById("setInitial");
const setTargetButton = document.getElementById("setTarget");
const setMoreTime = document.getElementById("setMoreTime");
const deleteButton = document.getElementById("deleteButton");
const fileInput = document.getElementById("file");
const restart = document.getElementById("restart");
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

//Configuración de los botones en la interfaz----------------------------

startButton.onclick = () => {
  start();
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

restart.onclick = () => {
  restartMatrix();
  removeInitial();
  removePath();
  removeMapElements();
};

//------------------------------------------------------------------------------

//Punto de inicio del programa

async function start() {
  removePath();
  //Se obtiene el resultado del algoritmo
  const result = aStar(graph, initalNode, finalNode);
  //Se reconstruye el camino más corto
  const shortestPath = getShortestPath(result?.pop());

  //Se recorre el resultado para cambiar el color de la celda
  //a azul
  for (let node of result) {
    if (node.id == initalNode.id) continue;
    const cell = document.getElementById(node.id);
    cell.classList.add("visited");
    await delay(10);
  }

  //Se recorre el camino más corto para cambiar el color de la celda
  //a naranja
  for (let node of shortestPath) {
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
      //---------------------------------------

      //Detectar clics y movimientos de mouse en la celda
      //para poder dibujar y cambiar el grafo
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

      //-------------------------------------------------------

      //Se añade a la pantalla
      col.appendChild(cell);

      //Se añade a la representación del grafo
      graph.addNode(new Node(nodeId++, j, i));
    }
    //Se añade la columna a la pantalla
    grid.appendChild(col);
  }
}

function onCellClick(row, x, y) {
  //Al hacer clic en una celda configurarla dependiendo del modo seleccionado
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
  //Calcular el tamaño de la matriz en base al tamaño de la pantalla
  gridWidth = Math.floor(grid.offsetWidth / 30);
  gridHeight = Math.floor(grid.offsetHeight / 30);
}

function restartMatrix() {
  //Reiniciar matriz
  let nodeId = 0;
  for (let i = 0; i < gridHeight; i++) {
    for (let j = 0; j < gridWidth; j++) {
      graph.addNode(new Node(nodeId++, j, i));
    }
  }
}

//Configuración de elementos visuales
function removeInitial() {
  document.querySelector(`.initial`)?.classList.remove("initial");
  document.querySelector(`.target`)?.classList.remove("target");
}

function removePath() {
  document
    .querySelectorAll(".visited")
    ?.forEach((e) => e.classList.remove("visited"));
  document
    .querySelectorAll(".shortest")
    ?.forEach((e) => e.classList.remove("shortest"));
}

function removeMapElements() {
  document
    .querySelectorAll(".wall")
    ?.forEach((e) => e.classList.remove("wall"));
  document
    .querySelectorAll(".moreTime")
    ?.forEach((e) => e.classList.remove("moreTime"));
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

//------------------------------------------------------------

function delay(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

renderGrid();
