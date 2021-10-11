// Clase que dibuja la caja alrededor de la escena
class WaterDrawer {
  constructor() {
    this.prog = InitShaderProgram(boxVS, boxFS);
    this.mvp = gl.getUniformLocation(this.prog, "mvp");
    this.vertPos = gl.getAttribLocation(this.prog, "pos");
    this.vertbuffer = gl.createBuffer();
    this.pos = [
      -1, 0, -1,

      -1, 0, 1,

      1, 0, 1,

      -1, 0, -1,

      1, 0, -1,

      1, 0, 1,
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.pos), gl.STATIC_DRAW);
  }

  draw(trans) {
    gl.useProgram(this.prog);
    gl.uniformMatrix4fv(this.mvp, false, trans);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
    gl.vertexAttribPointer(this.vertPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vertPos);

    gl.drawArrays(gl.TRIANGLES, 0, this.pos.length / 3);
  }
}

// Vertex shader
var boxVS = `
	attribute vec3 pos;
	uniform mat4 mvp;
	void main()
	{
		gl_Position = mvp * vec4(pos,1);
	}
`;

// Fragment shader
var boxFS = `
	precision mediump float;
	void main()
	{
		gl_FragColor = vec4(1,1,1,1);
	}
`;
