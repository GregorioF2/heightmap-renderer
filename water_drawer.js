// Clase que dibuja la caja alrededor de la escena
class WaterDrawer {
  constructor() {
    this.prog = InitShaderProgram(waterVS, waterFS);
    this.mvp = gl.getUniformLocation(this.prog, "mvp");
    this.mn = gl.getUniformLocation(this.prog, "mn");
    this.vertPos = gl.getAttribLocation(this.prog, "pos");
    this.lightVec = gl.getUniformLocation(this.prog, "light_v");
    this.brightness = gl.getUniformLocation(this.prog, "brightness");
    this.normal = gl.getAttribLocation(this.prog, "normal_v");
    this.vertbuffer = gl.createBuffer();
    this.normalsBuffer = gl.createBuffer();
  }

  setMesh(vertPos, normals, trianglesNumber) {
    this.numOfPoints = trianglesNumber * 3;

    // current pixel poss
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

  
    // // normals
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  }

  draw(trans, matrixNormal) {
    gl.useProgram(this.prog);
    gl.uniformMatrix4fv(this.mvp, false, trans);
    gl.uniformMatrix3fv(this.mn, false, matrixNormal);


    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
    gl.vertexAttribPointer(this.vertPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vertPos);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
    gl.vertexAttribPointer(this.normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.normal);

    gl.drawArrays(gl.TRIANGLES, 0, this.numOfPoints);
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

// Vertex shader
var waterVS = `
	attribute vec3 pos;
  attribute vec3 normal_v;
	
  uniform mat4 mvp;
  uniform mat3 mn;
  uniform vec3 light_v;
	
  varying vec3 normal_vector;
  varying vec3 light;
  void main()
	{
    normal_vector = normalize(mn * normal_v);
    light = normalize(light_v);
		gl_Position = mvp * vec4(pos,1);
	}
`;

// Fragment shader
var waterFS = `
	precision mediump float;
  
  varying vec3 light;
  varying vec3 normal_vector;
	
  void main()
	{
    float Ia = 0.2;
    vec4 kd = vec4(38.0/255.0, 102.0/255.0, 145.0/255.0, 0.5);
		vec4 ks = vec4(1,1,1,1);
		vec4 I = vec4(1,1,1,1);
    float cos_t = max(dot(light, normal_vector), 0.0);
    vec4 res = I * (kd * cos_t) + Ia * kd;
    gl_FragColor = vec4(res[0], res[1], res[2], 0.7);
	}
`;
