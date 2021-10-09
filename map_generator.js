function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
const valid = (val) => val !== null && typeof val !== "undefined";

function getTrivialMatrix(n) {
  const res = [];
  for (let i = 0; i < n; i += 1) {
    res.push([]);
    for (let j = 0; j < n; j += 1) {
      res[i].push(null);
    }
  }
  return res;
}

const avg = (...args) => {
  let ac = 0;
  let denominator = 0;
  for (let n of args) {
    if (valid(n)) {
      ac += n;
      denominator += 1;
    }
  }
  return ac / denominator;
};

const printNiceMatrix = (m) => {
  console.log(`\n\n`);
  let res = "";
  for (let row of m) {
    row = row.map((val) => {
      if (valid(val)) {
        return val.toFixed(2);
      }
      return val;
    });
    res += `[${row.join(", ")}]\n`;
  }
  console.log(res);
};

const N = 513;
class MapGenerator {
  constructor() {
    this.trianglesNumber = 0;
    this.coords = getTrivialMatrix(N);
    // seteo las primeras 4 esquinas
    const max = N - 1;
    this.minIndex = 0;
    this.maxIndex = max;
    this.coords[0][0] = getRandomArbitrary(-1, 1);
    this.coords[0][max] = getRandomArbitrary(-1, 1);
    this.coords[max][0] = getRandomArbitrary(-1, 1);
    this.coords[max][max] = getRandomArbitrary(-1, 1);
    this.coords[max / 2][max / 2] = avg(
      this.coords[0][0],
      this.coords[0][max],
      this.coords[max][0],
      this.coords[max][max]
    );
    let chunk = max / 2;
    let randomImpact = 1;
    while (chunk >= 1) {
      this.diamondStep(chunk, max, randomImpact);
      if (chunk == 1) {
        break;
      }
      this.squareStep(chunk, max, randomImpact);
      chunk = chunk / 2;
      randomImpact = randomImpact + 2;
    }
    printNiceMatrix(this.coords);
  }
  get(x, y) {
    if (x < this.minIndex || x > this.maxIndex) {
      return null;
    }
    if (y < this.minIndex || y > this.maxIndex) {
      return null;
    }
    return this.coords[x][y];
  }

  squareStep(size, max, randomImpact) {
    for (let x = 0; x <= max; x += size) {
      for (let y = 0; y <= max; y += size) {
        if (
          valid(this.get(x - size, y - size)) &&
          valid(this.get(x - size, y)) &&
          valid(this.get(x, y - size))
        ) {
          const points = [
            this.get(x - size, y - size),
            this.get(x, y - size),
            this.get(x - size, y),
            this.get(x, y),
          ];
          const minVal = Math.min(...points);
          const maxVal = Math.max(...points);
          const random = getRandomArbitrary(0, maxVal - minVal) / randomImpact;
          this.coords[x - size / 2][y - size / 2] = avg(...points) + random;
        }
      }
    }
  }

  diamondStep(size, max, randomImpact) {
    for (let x = 0; x <= max; x += size) {
      for (let y = 0; y <= max; y += size) {
        // console.log(`diamond step curr. x: ${x}, y: ${y}`);
        if (!valid(this.get(x, y))) {
          const points = [
            this.get(x - size, y),
            this.get(x, y + size),
            this.get(x + size, y),
            this.get(x, y - size),
          ];

          const minVal = Math.min(...points);
          const maxVal = Math.max(...points);
          const random = getRandomArbitrary(0, maxVal - minVal) / randomImpact;
          this.coords[x][y] = avg(...points) + random;
        }
      }
    }
  }

  addPoint(x, y, res) {
    res.push((x / N) * 2 - 1);
    res.push(this.coords[x][y]);
    res.push((y / N) * 2 - 1);
  }

  addAdjacentTriangles(x, y, res) {
    const inBounds = (i, j) =>
      i >= this.minIndex &&
      j >= this.minIndex &&
      i <= this.maxIndex &&
      j <= this.maxIndex;

    let trianglesAdded = 0;
    if (inBounds(x + 1, y) && inBounds(x + 1, y + 1)) {
      this.addPoint(x + 1, y, res);
      this.addPoint(x, y, res);
      this.addPoint(x + 1, y + 1, res);
      trianglesAdded += 1;
    }

    if (inBounds(x, y + 1) && inBounds(x + 1, y + 1)) {
      this.addPoint(x, y + 1, res);
      this.addPoint(x, y, res);
      this.addPoint(x + 1, y + 1, res);
      trianglesAdded += 1;
    }
    return trianglesAdded;
  }

  getVertexBuffers() {
    const res = [];
    this.trianglesNumber = 0;
    for (var i = 0; i < N; ++i) {
      for (var j = 0; j < N; ++j) {
        this.trianglesNumber += this.addAdjacentTriangles(i, j, res);
      }
    }
    return res;
  }
}
