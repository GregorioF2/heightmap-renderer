
// <============================================ EJERCICIOS ============================================>
// a) Implementar la función:
//
//      GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
//
//    Si la implementación es correcta, podrán hacer rotar la caja correctamente (como en el video). Notar 
//    que esta función no es exactamente la misma que implementaron en el TP4, ya que no recibe por parámetro
//    la matriz de proyección. Es decir, deberá retornar solo la transformación antes de la proyección model-view (MV)
//    Es necesario completar esta implementación para que funcione el control de la luz en la interfaz. 
//    IMPORTANTE: No es recomendable avanzar con los ejercicios b) y c) si este no funciona correctamente. 
//
// b) Implementar los métodos:
//
//      setMesh( vertPos, texCoords, normals )
//      swapYZ( swap )
//      draw( matrixMVP, matrixMV, matrixNormal )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado, asi como también intercambiar 
//    sus coordenadas yz. Notar que es necesario pasar las normales como atributo al VertexShader. 
//    La función draw recibe ahora 3 matrices en column-major: 
//
//       * model-view-projection (MVP de 4x4)
//       * model-view (MV de 4x4)
//       * normal transformation (MV_3x3)
//
//    Estas últimas dos matrices adicionales deben ser utilizadas para transformar las posiciones y las normales del 
//    espacio objeto al esapcio cámara. 
//
// c) Implementar los métodos:
//
//      setTexture( img )
//      showTexture( show )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado y su textura.
//    Notar que los shaders deberán ser modificados entre el ejercicio b) y el c) para incorporar las texturas.
//  
// d) Implementar los métodos:
//
//      setLightDir(x,y,z)
//      setShininess(alpha)
//    
//    Estas funciones se llaman cada vez que se modifican los parámetros del modelo de iluminación en la 
//    interface. No es necesario transformar la dirección de la luz (x,y,z), ya viene en espacio cámara.
//
// Otras aclaraciones: 
//
//      * Utilizaremos una sola fuente de luz direccional en toda la escena
//      * La intensidad I para el modelo de iluminación debe ser seteada como blanca (1.0,1.0,1.0,1.0) en RGB
//      * Es opcional incorporar la componente ambiental (Ka) del modelo de iluminación
//      * Los coeficientes Kd y Ks correspondientes a las componentes difusa y especular del modelo 
//        deben ser seteados con el color blanco. En caso de que se active el uso de texturas, la 
//        componente difusa (Kd) será reemplazada por el valor de textura. 
//        
// <=====================================================================================================>

// Esta función recibe la matriz de proyección (ya calculada), una 
// traslación y dos ángulos de rotación (en radianes). Cada una de 
// las rotaciones se aplican sobre el eje x e y, respectivamente. 
// La función debe retornar la combinación de las transformaciones 
// 3D (rotación, traslación y proyección) en una matriz de 4x4, 
// representada por un arreglo en formato column-major. 

function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	const cosX = Math.cos(rotationX)
	const sinX = Math.sin(rotationX)
	const cosY = Math.cos(rotationY)
	const sinY = Math.sin(rotationY)
	
	const rotX = [
		1, 0,     0,    0,
		0, cosX,  sinX, 0,
		0, -sinX, cosX, 0,
		0, 0,     0,    1
	]

	const rotY = [
		cosY, 0, -sinY, 0,
		0,    1,  0,    0,
		sinY, 0,  cosY, 0,
		0,    0,  0,    1
	]
	const rotation = MatrixMult(rotX, rotY)
	
	// [COMPLETAR] Modificar el código para formar la matriz de transformación.

	// Matriz de traslación
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var mv = MatrixMult(trans, rotation);

	return mv;
}

// [COMPLETAR] Completar la implementación de esta clase.
class MeshDrawer
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias. 
	constructor() {
		this.prog   = InitShaderProgram( meshVS, meshFS );
		// uniforms
		this.mvp = gl.getUniformLocation( this.prog, 'mvp' );
		this.mv = gl.getUniformLocation( this.prog, 'mv' );
		this.mn = gl.getUniformLocation( this.prog, 'mn' );
		
		this.lightVec = gl.getUniformLocation( this.prog, 'light_v' );
		this.brightness = gl.getUniformLocation(this.prog, 'brightness');
		
		this.swap = gl.getUniformLocation( this.prog, 'swap' );
		this.sampler = gl.getUniformLocation( this.prog, 'textGPU' );

		// attributes
		this.pos = gl.getAttribLocation( this.prog, 'pos' );
		this.textCoord = gl.getAttribLocation(this.prog, 'textCoord');
		this.normal = gl.getAttribLocation( this.prog, 'normal_v' );

		this.vertexBuffer = gl.createBuffer();
		this.textCoordsBuffer = gl.createBuffer();
		this.normalsBuffer = gl.createBuffer();

		this.texture = gl.createTexture();

	}
	
	// Esta función se llama cada vez que el usuario carga un nuevo
	// archivo OBJ. En los argumentos de esta función llegan un areglo
	// con las posiciones 3D de los vértices, un arreglo 2D con las
	// coordenadas de textura y las normales correspondientes a cada 
	// vértice. Todos los items en estos arreglos son del tipo float. 
	// Los vértices y normales se componen de a tres elementos 
	// consecutivos en el arreglo vertPos [x0,y0,z0,x1,y1,z1,..] y 
	// normals [n0,n0,n0,n1,n1,n1,...]. De manera similar, las 
	// cooredenadas de textura se componen de a 2 elementos 
	// consecutivos y se  asocian a cada vértice en orden. 
	setMesh( vertPos, texCoords, normals )
	{
		// [COMPLETAR] Actualizar el contenido del buffer de vértices y otros atributos..
		this.numTriangles = vertPos.length / 3 / 3;

		// current pixel poss
		gl.bindBuffer(
			gl.ARRAY_BUFFER, 
			this.vertexBuffer
		);

		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(vertPos),
			gl.STATIC_DRAW
		);

		// texture coords
		gl.bindBuffer(
			gl.ARRAY_BUFFER,
			this.textCoordsBuffer
		);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(texCoords),
			gl.STATIC_DRAW
		);

		// normals
		gl.bindBuffer(
			gl.ARRAY_BUFFER,
			this.normalsBuffer
		)
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(normals),
			gl.STATIC_DRAW
		);
	}
	
	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Intercambiar Y-Z'
	// El argumento es un boleano que indica si el checkbox está tildado
	swapYZ( swap )
	{
		gl.useProgram( this.prog );
		gl.uniform1i(this.swap, swap ? 1 : 0);	
	}
	
	// Esta función se llama para dibujar la malla de triángulos
	// El argumento es la matriz model-view-projection (matrixMVP),
	// la matriz model-view (matrixMV) que es retornada por 
	// GetModelViewProjection y la matriz de transformación de las 
	// normales (matrixNormal) que es la inversa transpuesta de matrixMV
	draw( matrixMVP, matrixMV, matrixNormal ) {

		gl.useProgram( this.prog );

		gl.uniformMatrix4fv( this.mvp, false, matrixMVP );
		gl.uniformMatrix4fv( this.mv, false, matrixMV );
		gl.uniformMatrix3fv( this.mn, false, matrixNormal );
		
		gl.uniform1i(this.sampler, 0);

		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
		gl.vertexAttribPointer( this.pos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.pos );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.textCoordsBuffer );
		gl.vertexAttribPointer( this.textCoord, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.textCoord );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.normalsBuffer );
		gl.vertexAttribPointer( this.normal, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.normal );

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles * 3 );
	}
	
	// Esta función se llama para setear una textura sobre la malla
	// El argumento es un componente <img> de html que contiene la textura. 
	setTexture( img )
	{
		gl.bindTexture(gl.TEXTURE_2D, this.texture)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
		gl.generateMipmap( gl.TEXTURE_2D );


		// [COMPLETAR] Ahora que la textura ya está seteada, debemos setear 
		// parámetros uniformes en el fragment shader para que pueda usarla. 
	}
		
        // Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Mostrar textura'
	// El argumento es un boleano que indica si el checkbox está tildado
	showTexture( show )
	{
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture)
		// [COMPLETAR] Setear variables uniformes en el fragment shader para indicar si debe o no usar la textura
	}
	
	// Este método se llama al actualizar la dirección de la luz desde la interfaz
	setLightDir( x, y, z )
	{		
		gl.useProgram( this.prog );
		gl.uniform3fv ( this.lightVec, [x,y,z]);
	}
		
	// Este método se llama al actualizar el brillo del material 
	setShininess( brightness )
	{		
		gl.useProgram( this.prog );
		gl.uniform1f( this.brightness, brightness);
		// [COMPLETAR] Setear variables uniformes en el fragment shader para especificar el brillo.
	}
}



// [COMPLETAR] Calcular iluminación utilizando Blinn-Phong.

// Vertex Shader
var meshVS = `
	attribute vec2 textCoord;
	attribute vec3 pos;
	attribute vec3 normal_v;


	uniform int swap;
	uniform vec3 light_v;
	uniform mat4 mvp;
	uniform mat4 mv;
	uniform mat3 mn;

	varying float x;
	varying float y;
	varying float z;

	varying vec2 texCoord;
	varying vec3 normal_vector;
	varying vec3 camera_vector;
	varying vec3 light;
	
	varying float sigma;

	void main()
	{ 
		texCoord = textCoord;
		normal_vector = normalize(mn * normal_v);
		camera_vector = normalize(vec3(-mv * vec4(pos, 1)));
		light = normalize(light_v);
		
		x = pos.x;
		if (swap == 1) {
			y = pos.z;
			z = pos.y;
		} else {
			y = pos.y;
			z = pos.z;
		}
		gl_Position = mvp * vec4(x, y, z, 1);
	}
`;
		
var meshFS = `
	precision mediump float;

	uniform sampler2D textGPU;
	uniform float brightness;
	
	varying vec2 texCoord;
	varying vec3 normal_vector;
	varying vec3 camera_vector;
	varying vec3 light;

	void main()
	{		
		vec3 light_mirror;
		float sigma;
		vec4 kd;
		vec4 ks;
		vec4 I;
		float Ia = 0.2;
		float cos_t;
		float cos_s;
		
		kd = texture2D(textGPU, texCoord);
		ks = vec4(1,1,1,1);
		I = vec4(1,1,1,1);

		cos_t = max(dot(light, normal_vector), 0.0);

		light_mirror = normalize(-1.0 * light + 2.0 * normal_vector * dot(light, normal_vector));
		cos_s = max(dot(light_mirror, camera_vector), 0.0);


		gl_FragColor = I * (kd * cos_t + ks * pow(cos_s, brightness)) + Ia * kd;
	}
`;
