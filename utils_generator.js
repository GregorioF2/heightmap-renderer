const getRandomArbitrary = (min, max) => {
  return Math.random() * (max - min) + min;
}
const valid = (val) => val !== null && typeof val !== "undefined";

const getTrivialMatrix = (n) => {
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

const blenderColors = (c1, c2, factor) => {
  return {
    r: c2.r + (c1.r - c2.r) * factor,
    g: c2.g + (c1.g - c2.g) * factor,
    b: c2.b + (c1.b - c2.b) * factor,
  };
};

const point = (x, y, coords, size, range=2) => {
  return {
    x: (x / size) * range - (range/2),
    y: coords[x][y],
    z: (y / size) * range - (range/2),
    tex: {
      x: y / size,
      y: x / size,
    },
  };
};

const substractV = (p1, p2) => {
  return { x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z };
};

const normal = (v1, v2) => {
  return {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x,
  };
};

const addPoint = (point, vertexArr, textArr) => {
  if (valid(vertexArr)) {
    vertexArr.push(point.x);
    vertexArr.push(point.y);
    vertexArr.push(point.z);
  }
  if (valid(textArr)) {
    textArr.push(point.tex.x);
    textArr.push(point.tex.y);
  }
};

const pushNormal = (vector, normalsArr) => {
    normalsArr.push(vector.x);
    normalsArr.push(vector.y);
    normalsArr.push(vector.z);
}

const addNormal = (p1, p2, p3, normalsArr, invert = false) => {
  let A = substractV(p2, p1);
  let B = substractV(p3, p1);
  let normalObj = normal(A, B);
  if (invert) {
    normalObj.x = normalObj.x * -1;
    normalObj.y = normalObj.y * -1;
    normalObj.z = normalObj.z * -1;
  }

  pushNormal(normalObj, normalsArr);
  pushNormal(normalObj, normalsArr);
  pushNormal(normalObj, normalsArr);
}

const addAdjacentTriangles = (x, y, minIndex, maxIndex, coords, vertArr, textArr, normalsArr, size, range = 2) => {
  let trianglesAdded = 0;
  const inBounds = (i, j) =>
    i >= minIndex &&
    j >= minIndex &&
    i <= maxIndex &&
    j <= maxIndex;

  if (inBounds(x + 1, y) && inBounds(x + 1, y + 1)) {
    let p1 = point(x + 1, y, coords, size, range);
    let p2 = point(x, y, coords, size, range);
    let p3 = point(x + 1, y + 1, coords, size, range);

    addPoint(p1, vertArr, textArr);
    addPoint(p2, vertArr, textArr);
    addPoint(p3, vertArr, textArr);
    trianglesAdded += 1;

    addNormal(p1, p2, p3, normalsArr);
  }

  if (inBounds(x, y + 1) && inBounds(x + 1, y + 1)) {
    let p1 = point(x, y + 1, coords, size, range);
    let p2 = point(x, y, coords, size, range);
    let p3 = point(x + 1, y + 1, coords, size, range);

    addPoint(p1, vertArr, textArr);
    addPoint(p2, vertArr, textArr);
    addPoint(p3, vertArr, textArr);
    trianglesAdded += 1;
    addNormal(p2, p1, p3, normalsArr);
  }
  return trianglesAdded;
}
