// asg2.js

// Global WebGL variables and shader uniform/attribute locations.
var gl;
var a_Position, u_ModelMatrix, u_GlobalRotation;

// Global transformation and joint angle variables.
var gAnimalGlobalRotation = 0;
var g_upperLegAngle = 0;   // For leg joints (shared among legs for simplicity)
var g_lowerLegAngle = 0;   // For lower leg joints
var g_time = 0;
var animationOn = false;
var pokeAnimation = false; // Flag indicating a poke animation is active
var pokeStartTime = 0;     // When the poke animation began (in seconds)
var pokeDuration = 1.0;    // Poke animation lasts 1 second
var lastTime = 0;          // Updated by requestAnimationFrame

// For FPS averaging.
var fpsSamples = [];

// Variables for mouse control (extra rotation)
var extraRotationX = 0; // Rotation about x-axis from mouse drag
var extraRotationY = 0; // Rotation about y-axis from mouse drag
var dragging = false;
var lastMouseX = 0;
var lastMouseY = 0;

// Updated shaders for per-vertex colors.
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotation;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_GlobalRotation * u_ModelMatrix * a_Position;
    v_Color = a_Color;
  }
`;

var FSHADER_SOURCE = `
  precision mediump float;
  varying vec4 v_Color;
  void main() {
    gl_FragColor = v_Color;
  }
`;

function main() {
  var canvas = document.getElementById('webgl');
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get WebGL context');
    return;
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders');
    return;
  }
  
  // Get shader attribute and uniform locations.
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_GlobalRotation = gl.getUniformLocation(gl.program, 'u_GlobalRotation');
  
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  
  setupUI(canvas);
  
  canvas.addEventListener('mousedown', handleMouseDown, false);
  canvas.addEventListener('mousemove', handleMouseMove, false);
  canvas.addEventListener('mouseup', handleMouseUp, false);
  canvas.addEventListener('mouseout', handleMouseUp, false);
  canvas.addEventListener('click', handleClick, false);
  
  lastTime = performance.now();
  requestAnimationFrame(tick);
}

function setupUI(canvas) {
  document.getElementById('rotationSlider').oninput = function(event) {
    gAnimalGlobalRotation = parseFloat(event.target.value);
    document.getElementById('rotationVal').textContent = event.target.value + "°";
    renderScene();
  };
  document.getElementById('upperLegSlider').oninput = function(event) {
    g_upperLegAngle = parseFloat(event.target.value);
    document.getElementById('upperLegVal').textContent = event.target.value + "°";
    renderScene();
  };
  document.getElementById('lowerLegSlider').oninput = function(event) {
    g_lowerLegAngle = parseFloat(event.target.value);
    document.getElementById('lowerLegVal').textContent = event.target.value + "°";
    renderScene();
  };
  document.getElementById('animateButton').onclick = function() {
    animationOn = !animationOn;
  };
  document.getElementById('pokeButton').onclick = function() {
    pokeAnimation = true;
    pokeStartTime = g_time;
  };
}

function handleMouseDown(event) {
  dragging = true;
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
}

function handleMouseMove(event) {
  if (!dragging) return;
  var deltaX = event.clientX - lastMouseX;
  var deltaY = event.clientY - lastMouseY;
  extraRotationY += deltaX * 0.5;
  extraRotationX += deltaY * 0.5;
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
  renderScene();
}

function handleMouseUp(event) {
  dragging = false;
}

function handleClick(event) {
  if (event.shiftKey) {
    pokeAnimation = true;
    pokeStartTime = g_time;
  }
}

function tick(timestamp) {
  var elapsed = timestamp - lastTime;
  lastTime = timestamp;
  
  if (animationOn) {
    g_time += elapsed * 0.001;
    // Running animation: for a more natural pig stride, we now rotate legs about the z-axis.
    // For front and back right legs, use positive angle; for left legs, use negative.
    var angle = 45 * Math.sin(g_time * 5);
    g_upperLegAngle = angle;         // amplitude: 45°
    g_lowerLegAngle = 22.5 * Math.sin(g_time * 5 + Math.PI/2);
  }
  
  renderScene();
  updateFPS(elapsed);
  
  requestAnimationFrame(tick);
}

function updateFPS(elapsed) {
  var fps = 1000 / elapsed;
  fpsSamples.push(fps);
  if (fpsSamples.length > 10) {
    fpsSamples.shift();
  }
  var avg = fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length;
  document.getElementById('fps').textContent = avg.toFixed(1);
}

function resetScene() {
  gAnimalGlobalRotation = 0;
  g_upperLegAngle = 0;
  g_lowerLegAngle = 0;
  g_tailAngle = 0;
  extraRotationX = 0;
  extraRotationY = 0;
  pokeAnimation = false;
  g_time = 0;
  
  document.getElementById('rotationSlider').value = 0;
  document.getElementById('rotationVal').textContent = "0°";
  document.getElementById('upperLegSlider').value = 0;
  document.getElementById('upperLegVal').textContent = "0°";
  document.getElementById('lowerLegSlider').value = 0;
  document.getElementById('lowerLegVal').textContent = "0°";
  
  renderScene();
}

function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  var globalRotationMatrix = new Matrix4();
  globalRotationMatrix.setRotate(gAnimalGlobalRotation + extraRotationY, 0, 1, 0);
  var extraRotXMat = new Matrix4().setRotate(extraRotationX, 1, 0, 0);
  globalRotationMatrix = extraRotXMat.multiply(globalRotationMatrix);
  gl.uniformMatrix4fv(u_GlobalRotation, false, globalRotationMatrix.elements);
  
  drawPig();
}

// --- Draw Pig Function ---
function drawPig() {
  // Global pig transform at 50% scale.
  var pig = new Matrix4();
  pig.setTranslate(0, 0, 0);
  pig.scale(0.5, 0.5, 0.5);
  
  // --- Body ---
  var body = new Matrix4(pig);
  body.translate(0, 0, 0);
  body.scale(1.6, 0.8, 1.2);
  drawCube(body);
  
  // --- Head ---
  var head = new Matrix4(pig);
  head.translate(1.1, 0.2, 0);
  head.scale(0.8, 0.8, 0.8);
  if (pokeAnimation) {
    var elapsedPoke = g_time - pokeStartTime;
    if (elapsedPoke < pokeDuration) {
      var pokeAngle = 90 * (elapsedPoke / pokeDuration);
      head.translate(-0.25, 0.25, 0);
      head.rotate(pokeAngle, 0, 0, 1);
    } else {
      pokeAnimation = false;
    }
  }
  drawCube(head);
  
  // --- Snout ---
  var snout = new Matrix4(head);
  snout.translate(0.5, -0.1, 0);
  snout.scale(0.5, 0.4, 0.6);
  drawCube(snout);
  
  // --- Tail Bump ---
  var tailBump = new Matrix4(pig);
  tailBump.translate(-0.8, 0.0, 0);  
  tailBump.scale(0.08, 0.3, 0.3);
  drawCube(tailBump);

  
  // --- Legs ---

  
  // Front Right Leg.
  var frontRightLeg = new Matrix4(pig);
  frontRightLeg.translate(0.7, -0.6, -0.4);
  frontRightLeg.translate(0, 0.3, 0);
  frontRightLeg.rotate(g_upperLegAngle, 0, 0, 1);
  frontRightLeg.translate(0, -0.3, 0);
  frontRightLeg.scale(0.3, 0.6, 0.3);
  drawCube(frontRightLeg);
  
  // Front Left Leg.
  var frontLeftLeg = new Matrix4(pig);
  frontLeftLeg.translate(0.7, -0.6, 0.4);
  frontLeftLeg.translate(0, 0.3, 0);
  frontLeftLeg.rotate(-g_upperLegAngle, 0, 0, 1);
  frontLeftLeg.translate(0, -0.3, 0);
  frontLeftLeg.scale(0.3, 0.6, 0.3);
  drawCube(frontLeftLeg);
  
  // Back Right Leg.
  var backRightLeg = new Matrix4(pig);
  backRightLeg.translate(-0.7, -0.6, -0.4);
  backRightLeg.translate(0, 0.3, 0);
  backRightLeg.rotate(g_upperLegAngle, 0, 0, 1);
  backRightLeg.translate(0, -0.3, 0);
  backRightLeg.scale(0.3, 0.6, 0.3);
  drawCube(backRightLeg);
  
  // Back Left Leg.
  var backLeftLeg = new Matrix4(pig);
  backLeftLeg.translate(-0.7, -0.6, 0.4);
  backLeftLeg.translate(0, 0.3, 0);
  backLeftLeg.rotate(-g_upperLegAngle, 0, 0, 1);
  backLeftLeg.translate(0, -0.3, 0);
  backLeftLeg.scale(0.3, 0.6, 0.3);
  drawCube(backLeftLeg);
}


