class Node {
  id;
  x;
  y;
  f;
  g = 0;
  h;
  previous;
  extraTime = 0;
  isWall = false;
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
  }
}

class Graph {
  list = [];
  width;
  heigth;

  constructor(width, heigth) {
    this.width = width;
    this.heigth = heigth;
    //Se genera una matriz nueva
    for (let i = 0; i < heigth; i++) {
      const col = [];
      for (let j = 0; j < width; j++) {
        col.push(null);
      }
      this.list.push(col);
    }
  }

  //Se añade un nodo nuevo
  addNode(node) {
    this.list[node.y][node.x] = node;
  }

  //Obtener vecinos del nodo
  getNodeNeighbors(node) {
    const neighbors = [];

    if (node.x > 0) {
      neighbors.push(this.list[node.y][node.x - 1]);
    }

    if (node.y > 0) {
      neighbors.push(this.list[node.y - 1][node.x]);
    }

    if (node.y < this.heigth - 1) {
      neighbors.push(this.list[node.y + 1][node.x]);
    }
    if (node.x < this.width - 1) {
      neighbors.push(this.list[node.y][node.x + 1]);
    }

    return neighbors;
  }

  //Se obtiene un nodo en base a sus coordenadas
  getNode(x, y) {
    return this.list[y][x];
  }
}

//Genera una copia del grafo para no afectar al original
function copyGraph(graph) {
  const newGraph = Object.assign(
    new Graph(),
    JSON.parse(JSON.stringify(graph))
  );

  newGraph.getAllNodes().forEach((e) => (e.distance = Infinity));
  return newGraph;
}

//Odenar cola en base al valor de f
function sortQueue(queue) {
  return queue.sort((a, b) => a.f - b.f);
}
