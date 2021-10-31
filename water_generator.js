const M = 100;
const realRange = 2.3;
class WaterGenerator {
  constructor() {
    this.vertPos = [];
    this.normals = [];
    this.tex = [];
    this.trianglesNumber = 0;

    this.coords = getTrivialMatrix(M);
    // seteo las primeras 4 esquinas
    const max = M - 1;
    this.minIndex = 0;
    this.maxIndex = max;
    this.updateText();
  }
  updateText() {
    for (let x = 0; x < this.maxIndex; x += 1) {
      for (let y = 0; y < this.maxIndex; y += 1) {
        this.coords[x][y] = getRandomArbitrary(-0.005, 0.005);
      }
    }
  }

  addWallTriangle(x, y, xAxis, right, invert, invertNormals) {
    const shift = right ? 1 : -1;
    let p1 = point(x, y, this.coords, M, realRange);
    let p2 = point(x, y, this.coords, M, realRange);
    let p3 = xAxis
      ? point(x + shift, y, this.coords, M, realRange)
      : point(x, y + shift, this.coords, M, realRange);
    if (!invert) {
      p1.y = -1;
      p3.y = -1;
    } else {
      p2.y = -1;
    }
    addPoint(p1, this.vertPos, this.tex);
    addPoint(p2, this.vertPos, this.tex);
    addPoint(p3, this.vertPos, this.tex);
    this.trianglesNumber += 1;

    if (!invert && right) {
      addNormal(p1, p2, p3, this.normals, invertNormals);
    } else if (!invert && !right) {
      addNormal(p1, p2, p3, this.normals, true && !invertNormals);
    } else if (invert && !right) {
      addNormal(p1, p2, p3, this.normals, invertNormals);
    } else {
      addNormal(p1, p2, p3, this.normals, true && !invertNormals);
    }
  }

  generateWalls() {
    for (let y of [0, this.maxIndex]) {
      for (let x = 0; x < this.maxIndex; x += 1) {
        let invertNormals = y === this.maxIndex;
        if (x === 0) {
          this.addWallTriangle(x, y, true, true, false, invertNormals);
          continue;
        }
        if (x === this.maxIndex) {
          this.addWallTriangle(x, y, true, false, false, invertNormals);
          continue;
        }
        if (x % 2 === 0) {
          this.addWallTriangle(x, y, true, false, false, invertNormals);
          this.addWallTriangle(x, y, true, true, false, invertNormals);
        } else {
          this.addWallTriangle(x, y, true, false, true, invertNormals);
          this.addWallTriangle(x, y, true, true, true, invertNormals);
        }
      }
    }

    for (let x of [0, this.maxIndex]) {
      for (let y = 0; y < this.maxIndex; y += 1) {
        let invertNormals = x !== this.maxIndex;
        if (y === 0) {
          this.addWallTriangle(x, y, false, true, false, invertNormals);
          continue;
        }
        if (y === this.maxIndex) {
          this.addWallTriangle(x, y, false, false, false, invertNormals);
          continue;
        }
        if (y % 2 === 0) {
          this.addWallTriangle(x, y, false, false, false, invertNormals);
          this.addWallTriangle(x, y, false, true, false, invertNormals);
        } else {
          this.addWallTriangle(x, y, false, false, true, invertNormals);
          this.addWallTriangle(x, y, false, true, true, invertNormals);
        }
      }
    }
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

  getVertexBuffers() {
    this.vertPos = [];
    this.normals = [];
    this.trianglesNumber = 0;
    for (var i = 0; i < M; ++i) {
      for (var j = 0; j < M; ++j) {
        this.trianglesNumber += addAdjacentTriangles(
          i,
          j,
          this.minIndex,
          this.maxIndex,
          this.coords,
          this.vertPos,
          this.tex,
          this.normals,
          M,
          realRange
        );
      }
    }
    this.generateWalls();
  }
}
