const N = 257;
class MapGenerator {
  colorScale = {
    high: { r: 255, g: 255, b: 255 },
    midHigh: { r: 84, g: 71, b: 61 },
    mid: { r: 86, g: 125, b: 70 },
    midLow: { r: 236, g: 226, b: 198 },
    low: { r: 30, g: 30, b: 30 },
  };

  getColor(height) {
    const inRange = (val, range) => {
      return val >= range[0] && val <= range[1];
    };
    const high = { min: 0.7, max: 1 }; //white
    const midHigh = { min: 0.35, max: 0.55 }; //brow
    const mid = { min: 0.17, max: 0.22 }; // green
    const midLow = { min: 0.0, max: 0.07 }; //yellow
    const low = { min: -1, max: -0.4 };

    if (height > high.min) {
      return this.colorScale.high;
    } else if (inRange(height, [midHigh.max, high.min])) {
      return blenderColors(
        this.colorScale.high,
        this.colorScale.midHigh,
        (height - midHigh.max) / (high.min - midHigh.max)
      );
    } else if (inRange(height, [mid.max, midHigh.min])) {
      return blenderColors(
        this.colorScale.midHigh,
        this.colorScale.mid,
        (height - mid.max) / (midHigh.min - mid.max)
      );
    } else if (inRange(height, [midLow.max, mid.min])) {
      return blenderColors(
        this.colorScale.mid,
        this.colorScale.midLow,
        (height - midLow.max) / (mid.min - midLow.max)
      );
    } else if (inRange(height, [low.max, midLow.min])) {
      return blenderColors(
        this.colorScale.midLow,
        this.colorScale.low,
        (height - low.max) / (midLow.min - low.max)
      );
    } else if (inRange(height, [midHigh.min, midHigh.max])) {
      return this.colorScale.midHigh;
    } else if (inRange(height, [mid.min, mid.max])) {
      return this.colorScale.mid;
    } else if (inRange(height, [midLow.min, midLow.max])) {
      return this.colorScale.midLow;
    } else if (inRange(height, [low.min, low.max])) {
      return this.colorScale.low;
    } else {
      return this.colorScale.low;
    }
  }

  constructor() {
    this.vertPos = [];
    this.normals = [];
    this.tex = [];
    this.trianglesNumber = 0;

    this.coords = getTrivialMatrix(N);
    // seteo las primeras 4 esquinas
    const max = N - 1;
    this.minIndex = 0;
    this.maxIndex = max;
    this.coords[0][0] = getRandomArbitrary(0.5, 1);
    this.coords[0][max] = getRandomArbitrary(-0.5, 0.5);
    this.coords[max][0] = getRandomArbitrary(-0.5, 0.5);
    this.coords[max][max] = getRandomArbitrary(-1, -0.5);
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

  addWallTriangle(x, y, xAxis, right, invert, invertNormals) {
    const shift = right ? 1 : -1;
    let p1 = point(x, y, this.coords, N);
    let p2 = point(x, y, this.coords, N);
    let p3 = xAxis
      ? point(x + shift, y, this.coords, N)
      : point(x, y + shift, this.coords, N);
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
    console.log(`this.vertpos.length: `, this.vertPos.length);
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
          let random =
            getRandomArbitrary(-1 + maxVal, 1 - maxVal) / randomImpact;
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

  getVertexBuffers() {
    this.vertPos = [];
    this.normals = [];
    this.trianglesNumber = 0;
    for (var i = 0; i < N; ++i) {
      for (var j = 0; j < N; ++j) {
        this.trianglesNumber += addAdjacentTriangles(
          i,
          j,
          this.minIndex,
          this.maxIndex,
          this.coords,
          this.vertPos,
          this.tex,
          this.normals,
          N
        );
      }
    }
    this.generateWalls();
    console.log(`this.vertPos: `, this.vertPos.length);
  }

  generateTexture() {
    console.log(`generateTexture`);
    let arr = new Uint8ClampedArray(this.maxIndex * 4 * this.maxIndex);
    let rowSize = this.maxIndex * 4;
    for (let x = 0; x <= this.maxIndex; x += 1) {
      for (let y = 0; y <= this.maxIndex; y += 1) {
        let index = rowSize * x + y * 4;
        const color = this.getColor(this.coords[x][y]);
        arr[index] = color.r;
        arr[index + 1] = color.g;
        arr[index + 2] = color.b;
        arr[index + 3] = 255;
      }
    }
    var canvas = document.getElementById("c");
    var ctx = canvas.getContext("2d");
    ctx.scale(0.5, 0.5);
    this.imageTexture = new ImageData(arr, this.maxIndex, this.maxIndex);
    ctx.putImageData(this.imageTexture, 0, 0);
  }
}
