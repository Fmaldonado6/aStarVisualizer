const directions = {
  N: 0,
  S: 1,
  E: 2,
  O: 3,
};

const opposite = {
  [directions.N]: directions.S,
  [directions.S]: directions.N,
  [directions.E]: directions.O,
  [directions.O]: directions.E,
};

const DX = {
  [directions.N]: 0,
  [directions.S]: 0,
  [directions.E]: 1,
  [directions.O]: -1,
};

const DY = {
  [directions.N]: -1,
  [directions.S]: 1,
  [directions.E]: 0,
  [directions.O]: 0,
};

function generateGrid(width, height) {
  const grid = [];
  for (let i = 0; i < height; i++) {
    const col = [];
    for (let j = 0; j < width; j++) {
      col.push(null);
    }
    grid.push(col);
  }

  return grid;
}

function backtracking(cx, cy, grid, steps) {
  const list = [directions.N, directions.S, directions.E, directions.O];

  for (let i = 0; i < 4; i++) {
    const index = Math.floor(Math.random() * list.length);
    const direction = list[index];
    list.splice(index, 1);

    const nx = cx + DX[direction];
    const ny = cy + DY[direction];
    if (nx < 0 || nx >= grid[0].length || ny < 0 || ny >= grid.length) continue;
    if (grid[ny][nx] != null) continue;

    grid[cy][cx] = direction;
    grid[ny][nx] = opposite[direction];
    steps.push({ x: cx, y: cy, val: direction });
    steps.push({ x: nx, y: ny, val: opposite[direction] });

    backtracking(nx, ny, grid, steps);
  }
}
