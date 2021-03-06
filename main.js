// Estructuras globales e inicializaciones
var boxDrawer; // clase para contener el comportamiento de la caja
var mapDrawer; // clase para contener el comportamiento de la malla
var waterDrawer;
var canvas, gl; // canvas y contexto WebGL
var perspectiveMatrix; // matriz de perspectiva
var intervalWater;
var waterGen;
var mapGen;

var rotX = 0,
  rotY = 0,
  transZ = 3,
  autorot = 0;

// Funcion de inicialización, se llama al cargar la página
function InitWebGL() {
  // Inicializamos el canvas WebGL
  canvas = document.getElementById("canvas");
  canvas.oncontextmenu = function () {
    return false;
  };
  gl = canvas.getContext("webgl", { antialias: false, depth: true });
  if (!gl) {
    alert("Imposible inicializar WebGL. Tu navegador quizás no lo soporte.");
    return;
  }

  // Inicializar color clear
  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.DEPTH_TEST); // habilitar test de profundidad
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Inicializar los shaders y buffers para renderizar
  boxDrawer = new BoxDrawer();
  mapDrawer = new MapDrawer();
  waterDrawer = new WaterDrawer();

  // Setear el tamaño del viewport
  UpdateCanvasSize();
}

// Funcion para actualizar el tamaño de la ventana cada vez que se hace resize
function UpdateCanvasSize() {
  // 1. Calculamos el nuevo tamaño del viewport
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = pixelRatio * canvas.clientWidth;
  canvas.height = pixelRatio * canvas.clientHeight;

  const width = canvas.width / pixelRatio;
  const height = canvas.height / pixelRatio;

  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  // 2. Lo seteamos en el contexto WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);

  // 3. Cambian las matrices de proyección, hay que actualizarlas
  UpdateProjectionMatrix();
}

// Calcula la matriz de perspectiva (column-major)
function ProjectionMatrix(c, z, fov_angle = 60) {
  var r = c.width / c.height;
  var n = z - 1.74;
  const min_n = 0.001;
  if (n < min_n) n = min_n;
  var f = z + 1.74;
  var fov = (3.145 * fov_angle) / 180;
  var s = 1 / Math.tan(fov / 2);
  return [
    s / r,
    0,
    0,
    0,
    0,
    s,
    0,
    0,
    0,
    0,
    (n + f) / (f - n),
    1,
    0,
    0,
    (-2 * n * f) / (f - n),
    0,
  ];
}

// Devuelve la matriz de perspectiva (column-major)
function UpdateProjectionMatrix() {
  perspectiveMatrix = ProjectionMatrix(canvas, transZ);
}

// Funcion que reenderiza la escena.
function DrawScene() {
  // 1. Obtenemos las matrices de transformación
  var mv = GetModelViewMatrix(0, 0, transZ, rotX, autorot + rotY);
  var mvp = MatrixMult(perspectiveMatrix, mv);

  // 2. Limpiamos la escena
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 3. Le pedimos a cada objeto que se dibuje a si mismo
  var nrmTrans = [
    mv[0],
    mv[1],
    mv[2],
    mv[4],
    mv[5],
    mv[6],
    mv[8],
    mv[9],
    mv[10],
  ];
  const drawAll = (recreateWater) => {
    if (valid(waterGen) && recreateWater && showWater.checked) {
      waterGen.updateText();
      waterGen.getVertexBuffers();
      waterDrawer.setMesh(
        waterGen.vertPos,
        waterGen.normals,
        waterGen.trianglesNumber
      );
    }
    mapDrawer.draw(mvp, mv, nrmTrans);
    if (showWater.checked) {
      waterDrawer.draw(mvp, nrmTrans);
    }
    if (showBox.checked) {
      boxDrawer.draw(mvp);
    }
  };
  drawAll(false);
  clearInterval(intervalWater);
  intervalWater = setInterval(() => {
    drawAll(true);
  }, 500);
}

// Función que compila los shaders que se le pasan por parámetro (vertex & fragment shaders)
// Recibe los strings de cada shader y retorna un programa
function InitShaderProgram(vsSource, fsSource, wgl = gl) {
  // Función que compila cada shader individualmente
  const vs = CompileShader(wgl.VERTEX_SHADER, vsSource, wgl);
  const fs = CompileShader(wgl.FRAGMENT_SHADER, fsSource, wgl);

  // Crea y linkea el programa
  const prog = wgl.createProgram();
  wgl.attachShader(prog, vs);
  wgl.attachShader(prog, fs);
  wgl.linkProgram(prog);

  if (!wgl.getProgramParameter(prog, wgl.LINK_STATUS)) {
    alert("No se pudo inicializar el programa: " + wgl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}

// Función para compilar shaders, recibe el tipo (gl.VERTEX_SHADER o gl.FRAGMENT_SHADER)
// y el código en forma de string. Es llamada por InitShaderProgram()
function CompileShader(type, source, wgl = gl) {
  // Creamos el shader
  const shader = wgl.createShader(type);

  // Lo compilamos
  wgl.shaderSource(shader, source);
  wgl.compileShader(shader);

  // Verificamos si la compilación fue exitosa
  if (!wgl.getShaderParameter(shader, wgl.COMPILE_STATUS)) {
    alert(
      "Ocurrió un error durante la compilación del shader:" +
        wgl.getShaderInfoLog(shader)
    );
    wgl.deleteShader(shader);
    return null;
  }

  return shader;
}

// Multiplica 2 matrices y devuelve A*B.
// Los argumentos y el resultado son arreglos que representan matrices en orden column-major
function MatrixMult(A, B) {
  var C = [];
  for (var i = 0; i < 4; ++i) {
    for (var j = 0; j < 4; ++j) {
      var v = 0;
      for (var k = 0; k < 4; ++k) {
        v += A[j + 4 * k] * B[k + 4 * i];
      }

      C.push(v);
    }
  }
  return C;
}

function ResetConf(){
  colorScale = {
    high: { r: 255, g: 255, b: 255 },
    midHigh: { r: 84, g: 71, b: 61 },
    mid: { r: 86, g: 125, b: 70 },
    midLow: { r: 236, g: 226, b: 198 },
    low: { r: 30, g: 30, b: 30 },
  };
  N= 257
  $('#pixel-selector').dropdown('set selected', 256);
  for (let el of $('.color-picker input')) {
    let [height, color] = el.name.split('-');
    el.value = colorScale[height][color]
  }
  for (let height of Object.keys(colorScale)) {
    let {r, g, b} = colorScale[height]
    $(`#${height}-terrain-color`).css('background-color', `rgb(${r},${g},${b})`);
  }

  $('#pixel-selector').dropdown('set selected', 256);
  mapGen.generateTexture();
  mapDrawer.setTexture(mapGen.imageTexture);
  mapDrawer.setMesh(mapGen.vertPos, mapGen.normals, mapGen.tex, mapGen.trianglesNumber);
}

// ======== Funciones para el control de la interfaz ========

var showBox; // boleano para determinar si se debe o no mostrar la caja

// Al cargar la página
window.onload = function () {
  showBox = document.getElementById("show-box");
  showWater = document.getElementById("show-water");
  InitWebGL();
  $('#pixel-selector').dropdown('set selected', 256);
  for (let el of $('.color-picker input')) {
    let [height, color] = el.name.split('-');
    el.value = colorScale[height][color]
  }
  for (let height of Object.keys(colorScale)) {
    let {r, g, b} = colorScale[height]
    $(`#${height}-terrain-color`).css('background-color', `rgb(${r},${g},${b})`);
  }

  // Componente para la luz
  lightView = new LightView();

  // Evento de zoom (ruedita)
  canvas.zoom = function (s) {
    transZ *= s / canvas.height + 1;
    UpdateProjectionMatrix();
    DrawScene();
  };
  canvas.onwheel = function () {
    canvas.zoom(0.3 * event.deltaY);
  };

  // Evento de click
  canvas.onmousedown = function () {
    var cx = event.clientX;
    var cy = event.clientY;
    if (event.ctrlKey) {
      canvas.onmousemove = function () {
        canvas.zoom(5 * (event.clientY - cy));
        cy = event.clientY;
      };
    } else {
      // Si se mueve el mouse, actualizo las matrices de rotación
      canvas.onmousemove = function () {
        rotY += ((cx - event.clientX) / canvas.width) * 5;
        rotX += ((cy - event.clientY) / canvas.height) * 5;
        cx = event.clientX;
        cy = event.clientY;
        UpdateProjectionMatrix();
        DrawScene();
      };
    }
  };

  // Evento soltar el mouse
  canvas.onmouseup = canvas.onmouseleave = function () {
    canvas.onmousemove = null;
  };

  SetShininess(50);

  // Dibujo la escena
  DrawScene();
};

// Evento resize
function WindowResize() {
  UpdateCanvasSize();
  DrawScene();
}

function changeNumberOf226Pixels(params) {
  N = parseInt(params.value) + 1;
}
function changeColor(params) {
  let value = params.value;
  let [height, color] = params.name.split('-');
  colorScale[height][color] = Math.max(0, Math.min(value, 255));
  let {r, g, b} = colorScale[height]
  $(`#${height}-terrain-color`).css('background-color', `rgb(${r},${g},${b})`);
  mapGen.generateTexture();
  mapDrawer.setTexture(mapGen.imageTexture);
  mapDrawer.setMesh(mapGen.vertPos, mapGen.normals, mapGen.tex, mapGen.trianglesNumber);
  //DrawScene();
}
// Control de la calesita de rotación
var timer;
function AutoRotate(param) {
  // Si hay que girar...
  if (param.checked) {
    // Vamos rotando una cantiad constante cada 30 ms
    timer = setInterval(function () {
      var v = document.getElementById("rotation-speed").value;
      autorot += 0.0005 * v;
      if (autorot > 2 * Math.PI) autorot -= 2 * Math.PI;

      // Reenderizamos
      DrawScene();
    }, 30);
    document.getElementById("rotation-speed").disabled = false;
  } else {
    clearInterval(timer);
    document.getElementById("rotation-speed").disabled = true;
  }
}


// Control de intercambiar y-z
function SwapYZ(param) {
  mapDrawer.swapYZ(param.checked);
  DrawScene();
}

// Cargar archivo obj
function RenderMap(param) {
  mapGen = new MapGenerator();
  waterGen = new WaterGenerator();

  waterGen.updateText();
  waterGen.getVertexBuffers();
  waterDrawer.setMesh(
    waterGen.vertPos,
    waterGen.normals,
    waterGen.trianglesNumber
  );
  mapGen.getVertexBuffers();
  mapDrawer.setMesh(mapGen.vertPos, mapGen.normals, mapGen.tex, mapGen.trianglesNumber);

  mapGen.generateTexture();
  mapDrawer.setTexture(mapGen.imageTexture);
  DrawScene();
}

// Cargar textura
function LoadTexture(param) {
  if (param.files && param.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = document.getElementById("texture-img");
      img.onload = function () {
        mapDrawer.setTexture(img);
        DrawScene();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(param.files[0]);
  }
}

// Setear Intensidad
function SetShininess(value) {
  var exp = value;
  var s = Math.pow(10, exp / 25);
  mapDrawer.setShininess(s);
  // waterDrawer.setShininess(s);
  DrawScene();
}
