const M = 100;
class WaterGenerator {
  constructor() {
    this.vertPos = [];
    this.normals = [];
    this.tex = [];
    this.trianglesNumber = 0;

    this.coords = getTrivialMatrix(N);
    // seteo las primeras 4 esquinas
    const max = M - 1;
    this.minIndex = 0;
    this.maxIndex = max;
    for (let x = 0; x < max; x +=1) {
        for(let y = 0; y < max; y +=1) {
            this.coords[x][y] = getRandomArbitrary(-0.005, 0.005);
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
          M
        );
      }
    }
    // this.generateWalls();
  }
}
