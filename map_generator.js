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
    this.vertPos = [];
    this.normals = [];
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
      randomImpact = randomImpact * 2;
    }
    // printNiceMatrix(this.coords);
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

          
          const maxVal = Math.max(...points);
          let random = getRandomArbitrary(-1 + maxVal, 1 - maxVal) / randomImpact;
          if (
            x === this.minIndex ||
            x === this.maxIndex ||
            y === this.minIndex ||
            y == this.maxIndex
          ) {
            random = 0;
          }
          this.coords[x][y] = avg(...points) + random;
        }
      }
    }
  }

  point(x, y) {
    return { x: (x / N) * 2 - 1, y: this.coords[x][y], z: (y / N) * 2 - 1 };
  }

  substractV(p1, p2) {
    return { x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z };
  }

  normal(v1, v2) {
    return {
      x: v1.y * v2.z - v1.z * v2.y,
      y: v1.z * v2.x - v1.x * v2.z,
      z: v1.x * v2.y - v1.y * v2.x,
    };
  }

  addPoint(point) {
    this.vertPos.push(point.x);
    this.vertPos.push(point.y);
    this.vertPos.push(point.z);
  }

  addNormal(vector) {
    this.normals.push(vector.x);
    this.normals.push(vector.y);
    this.normals.push(vector.z);
  }

  addAdjacentTriangles(x, y) {
    const inBounds = (i, j) =>
      i >= this.minIndex &&
      j >= this.minIndex &&
      i <= this.maxIndex &&
      j <= this.maxIndex;

    if (inBounds(x + 1, y) && inBounds(x + 1, y + 1)) {
      let p1 = this.point(x + 1, y);
      let p2 = this.point(x, y);
      let p3 = this.point(x + 1, y + 1);

      this.addPoint(p1);
      this.addPoint(p2);
      this.addPoint(p3);
      this.trianglesNumber += 1;

      let A = this.substractV(p2, p1);
      let B = this.substractV(p3, p1);
      let normal = this.normal(A, B);
      this.addNormal(normal);
      this.addNormal(normal);
      this.addNormal(normal);
    }

    if (inBounds(x, y + 1) && inBounds(x + 1, y + 1)) {
      let p1 = this.point(x, y + 1);
      let p2 = this.point(x, y);
      let p3 = this.point(x + 1, y + 1);

      this.addPoint(p1);
      this.addPoint(p2);
      this.addPoint(p3);
      this.trianglesNumber += 1;

      let A = this.substractV(p1, p2);
      let B = this.substractV(p3, p2);
      let normal = this.normal(A, B);
      this.addNormal(normal);
      this.addNormal(normal);
      this.addNormal(normal);
    }
  }

  getVertexBuffers() {
    this.vertPos = [];
    this.normals = [];
    this.trianglesNumber = 0;
    for (var i = 0; i < N; ++i) {
      for (var j = 0; j < N; ++j) {
        this.addAdjacentTriangles(i, j);
      }
    }
    console.log(`this.vertPos: `, this.vertPos.length);
  }
}
