//Se reconstruye el camino más corto
function getShortestPath(finishNode) {
  const nodesInShortestPath = [];
  let currentNode = finishNode;
  while (currentNode != null) {
    console.log(currentNode)
    nodesInShortestPath.unshift(currentNode);
    currentNode = currentNode.previous;
  }

  return nodesInShortestPath.map((e) => {
    e.previous = null;

    return e;
  });
}

function aStar(graph, start, target) {
  let openList = [];
  let closedList = [];

  openList.push(start);

  while (openList.length > 0) {
    openList = sortQueue(openList);

    const current = openList.shift();

    closedList.push(current);

    if (current.id == target.id) {
      return closedList;
    }

    const neighbors = graph.getNodeNeighbors(current);

    for (let neighbor of neighbors) {
      if (closedList.find((e) => e.id == neighbor.id) || neighbor.isWall)
        continue;

      const gScore = current.g + 1;
      let isBest = false;

      if (!openList.find((e) => e.id == neighbor.id)) {
        isBest = true;
        neighbor.h = heuristic(neighbor, target);
        openList.push(neighbor);
      } else if (gScore < neighbor.g) {
        isBest = true;
      }

      if (isBest) {
        neighbor.previous = current;
        neighbor.g = gScore;
        neighbor.f = neighbor.g + neighbor.h + neighbor.extraTime;
      }
    }
  }
  return closedList;
}

function heuristic(node1, node2) {
  const deltaX = Math.abs(node1.x - node2.x);
  const deltaY = Math.abs(node1.y - node2.y);
  return deltaX + deltaY;
}
