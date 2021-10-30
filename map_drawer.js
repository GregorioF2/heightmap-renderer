function GetModelViewMatrix(
  translationX,
  translationY,
  translationZ,
  rotationX,
  rotationY
) {
  const cosX = Math.cos(rotationX);
  const sinX = Math.sin(rotationX);
  const cosY = Math.cos(rotationY);
  const sinY = Math.sin(rotationY);

  const rotX = [1, 0, 0, 0, 0, cosX, sinX, 0, 0, -sinX, cosX, 0, 0, 0, 0, 1];

  const rotY = [cosY, 0, -sinY, 0, 0, 1, 0, 0, sinY, 0, cosY, 0, 0, 0, 0, 1];
  const rotation = MatrixMult(rotX, rotY);

  // Matriz de traslación
  var trans = [
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    translationX,
    translationY,
    translationZ,
    1,
  ];
  var mv = MatrixMult(trans, rotation);

  return mv;
}

class MapDrawer {
  constructor() {
    this.prog = InitShaderProgram(meshVS, meshFS);
    // uniforms
    this.mvp = gl.getUniformLocation(this.prog, "mvp");
    this.mv = gl.getUniformLocation(this.prog, "mv");
    this.mn = gl.getUniformLocation(this.prog, "mn");

    this.lightVec = gl.getUniformLocation(this.prog, "light_v");
    this.brightness = gl.getUniformLocation(this.prog, "brightness");

    this.swap = gl.getUniformLocation(this.prog, "swap");
    this.sampler = gl.getUniformLocation(this.prog, "textGPU");

    // attributes
    this.pos = gl.getAttribLocation(this.prog, "pos");
    this.textCoord = gl.getAttribLocation(this.prog, "textCoord");
    this.normal = gl.getAttribLocation(this.prog, "normal_v");

    this.vertexBuffer = gl.createBuffer();
    this.textCoordsBuffer = gl.createBuffer();
    this.normalsBuffer = gl.createBuffer();

    this.texture = gl.createTexture();
  }

  setMesh(vertPos, normals, texCoords, trianglesNumber) {
    this.numOfPoints = trianglesNumber * 3;
    console.log(`verPos.length: `, vertPos.length);
    console.log(`normals.length: `, normals.length);
    console.log(`trianglesNumber: `, trianglesNumber);

    // current pixel poss
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

    // texture coords
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
    //
    // // normals
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  }

  swapYZ(swap) {
    gl.useProgram(this.prog);
    gl.uniform1i(this.swap, swap ? 1 : 0);
  }

  draw(matrixMVP, matrixMV, matrixNormal) {
    gl.useProgram(this.prog);

    gl.uniformMatrix4fv(this.mvp, false, matrixMVP);
    gl.uniformMatrix4fv(this.mv, false, matrixMV);
    gl.uniformMatrix3fv(this.mn, false, matrixNormal);

    gl.uniform1i(this.sampler, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.pos);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.textCoordsBuffer);
    gl.vertexAttribPointer(this.textCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.textCoord);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
    gl.vertexAttribPointer(this.normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.normal);

    gl.drawArrays(gl.TRIANGLES, 0, this.numOfPoints);
  }

  setTexture(img) {
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  showTexture(show) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
  }

  setLightDir(x, y, z) {
    gl.useProgram(this.prog);
    gl.uniform3fv(this.lightVec, [x, y, z]);
  }

  setShininess(brightness) {
    gl.useProgram(this.prog);
    gl.uniform1f(this.brightness, brightness);
  }
}

// Vertex Shader
var meshVS = `
	attribute vec3 pos;
  attribute vec3 normal_v;
  attribute vec2 textCoord;

	uniform int swap;
	uniform vec3 light_v;
	uniform mat4 mvp;
	uniform mat4 mv;
	uniform mat3 mn;

  varying vec3 normal_vector;
  varying vec3 light;
  varying vec2 texCoord;
	void main()
	{ 
    normal_vector = normalize(mn * normal_v);
    light = normalize(light_v);
    texCoord = textCoord;
		gl_Position = mvp * vec4(pos, 1);
	}
`;

var meshFS = `
	precision mediump float;
  uniform sampler2D textGPU;

  varying vec3 normal_vector;
  varying vec3 light;
  varying vec2 texCoord;
	void main()
	{
    float Ia = 0.2;
    vec4 kd = texture2D(textGPU, texCoord);
		vec4 ks = vec4(1,1,1,1);
		vec4 I = vec4(1,1,1,1);
    float cos_t = max(dot(light, normal_vector), 0.0);
    vec4 res = I * (kd * cos_t) + Ia * kd;
    gl_FragColor = vec4(res[0], res[1], res[2], 1);
	}
`;
