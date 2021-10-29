// Clase que dibuja la caja alrededor de la escena
class WaterDrawer {
  constructor() {
    this.prog = InitShaderProgram(waterVS, waterFS);
    this.mvp = gl.getUniformLocation(this.prog, "mvp");
    this.vertPos = gl.getAttribLocation(this.prog, "pos");
    this.vertbuffer = gl.createBuffer();
    this.pos = [
      -1.1, -0.25, -1.1,
      -1.1, -0.25, 1.1,
      1.1, -0.25, 1.1,
      1.1, -0.25, -1.1,

      -1.1, -1.1, -1.1,
      -1.1, -1.1, 1.1,
      1.1, -1.1, 1.1,
      1.1, -1.1, -1.1,
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.pos), gl.STATIC_DRAW);

    this.linebuffer = gl.createBuffer();
    this.lines = [
      0,1,2, 2,3,0,

      4,0,3, 3,4,7,

      4,1,5, 4,1,0,

      5,2,6, 5,1,2,

      3,2,6, 3,7,6,

      4,5,6, 4,6,7
    ];
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.linebuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint8Array(this.lines),
      gl.STATIC_DRAW
    );
  }

  draw(trans) {
    gl.useProgram(this.prog);
    gl.uniformMatrix4fv(this.mvp, false, trans);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
    gl.vertexAttribPointer(this.vertPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vertPos);

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.linebuffer );

		// 5. Dibujamos
		gl.drawElements( gl.TRIANGLES, this.lines.length, gl.UNSIGNED_BYTE, 0 );
   //  gl.drawArrays(gl.TRIANGLES, 0, this.pos.length / 3);
  }
}

// Vertex shader
var waterVS = `
	attribute vec3 pos;
	uniform mat4 mvp;
	void main()
	{
		gl_Position = mvp * vec4(pos,1);
	}
`;

// Fragment shader
var waterFS = `
	precision mediump float;
	void main()
	{
		gl_FragColor = vec4(38.0/255.0, 102.0/255.0, 145.0/255.0, 0.5);
	}
`;
