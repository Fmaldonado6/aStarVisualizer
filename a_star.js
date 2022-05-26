//Se reconstruye el camino más corto
function getShortestPath(finishNode) {
  const nodesInShortestPath = [];
  let currentNode = finishNode;
  while (currentNode != null) {
    nodesInShortestPath.unshift(currentNode);
    currentNode = currentNode.previous;
  }

  return nodesInShortestPath.map((e) => {
    e.previous = null;

    return e;
  });
}

function aStar(graph, start, target) {
  //Creamos colas de nodos abiertos y cerrados
  let openList = [];
  let closedList = [];

  //Agregamos el nodo inicio a los nodos abiertos
  //para analizarlo
  openList.push(start);

  //Recorremos cada uno de los nodos abiertos
  while (openList.length > 0) {
    //Ordenamos la cola en base a su variable F
    openList = sortQueue(openList);

    //Obtenemos el primero nodo de la cola, por ende
    //el más óptima pues su valor en f es menor
    const current = openList.shift();

    //Agregamos el nodo actual a los nodos
    //cerrados para que ya no sea analizado
    //en otras iteraciones
    closedList.push(current);

    //Comparamos si el nodo es igual al objetivo
    //en caso de ser verdadero regresamos los nodos cerrados
    if (current.id == target.id) {
      return closedList;
    }

    //Obtenemos los nodos vecinos
    const neighbors = graph.getNodeNeighbors(current);

    //Recorremos los nodos vecinos
    for (let neighbor of neighbors) {
      //Verificamos que el nodo no se encuentre en los nodos cerrados
      //y que además no sea una pared
      if (closedList.find((e) => e.id == neighbor.id) || neighbor.isWall)
        continue;

      //Almacenamos el valor actual de g + 1
      //Recordemos que 1 es el coste o distancia entre cada nodo
      const gScore = current.g + 1;
      //Bandera para identificar si el valor de g es el mejor
      //hasta ahora
      let isBest = false;

      //Si el vecino no se encuentra en los nodos abiertos
      //significa que es la primera vez que lo analizamos
      if (!openList.find((e) => e.id == neighbor.id)) {
        //Cambiamos el valor de la bandera y calculamos
        //el valor de la heurística
        isBest = true;
        neighbor.h = heuristic(neighbor, target);
        //Agregamos el vecino a los nodos abiertos
        openList.push(neighbor);
      } else if (gScore < neighbor.g) {
        //En caso de que el vecino se encuentre en los nodos abiertos
        //comparamos que gScore sea menor al valor de g del nodo vecino
        //si es verdadero cambiamos el valor de la bandera
        isBest = true;
      }

      if (isBest) {
        //Actualizamos el nodo previo para reconstruir el camino final
        neighbor.previous = current;
        //Si la bandera es verdadera actualizamos el valor de g a gScore
        neighbor.g = gScore;
        //calculamos f sumando g, h y el tiempo o costo extra del nodo vecinp
        neighbor.f = neighbor.g + neighbor.h + neighbor.extraTime;
      }
    }
  }
  //Si el ciclo termina regresamos null
  return null;
}

//Distancia de Manhattan
function heuristic(node1, node2) {
  const deltaX = Math.abs(node1.x - node2.x);
  const deltaY = Math.abs(node1.y - node2.y);
  return deltaX + deltaY;
}
