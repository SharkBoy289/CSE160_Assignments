/* asg4.js */
var gl;
var canvas;
var shaderProgram;

var camera;
var cube;
var sphere;

var angle = 0; // Global angle for animation

// UI control globals
var lightingOn = true;
var normalVisOn = false;
var spotLightOn = true;
var lightColor = [1.0, 1.0, 1.0]; // white
var pointLightPosAngle = 0;

function main() {
  canvas = document.getElementById("webgl");
  gl = canvas.getContext("webgl");
  if (!gl) {
    console.log("Failed to get WebGL context.");
    return;
  }
  
  // Initialize shaders and get attribute/uniform locations.
  shaderProgram = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(shaderProgram);
  
  // Initialize camera.
  camera = new Camera();
  
  // Create models.
  cube = new Cube(gl);
  sphere = new Sphere(gl, 1.0, 20, 20);
  
  // Set up UI controls.
  document.getElementById("toggleLighting").onclick = function() {
    lightingOn = !lightingOn;
  };
  
  document.getElementById("toggleNormals").onclick = function() {
    normalVisOn = !normalVisOn;
  };
  
  document.getElementById("toggleSpotlight").onclick = function() {
    spotLightOn = !spotLightOn;
  };
  
  document.getElementById("lightColor").onchange = function(e) {
    lightColor = hexToRgbNormalized(e.target.value);
  };
  
  document.getElementById("lightPosSlider").oninput = function(e) {
    pointLightPosAngle = parseFloat(e.target.value);
  };
  
  window.addEventListener("keydown", function(e) {
    camera.handleKeyDown(e);
  });
  
  gl.enable(gl.DEPTH_TEST);
  
  tick();
}

function tick() {
  animate();
  drawScene();
  requestAnimationFrame(tick);
}

function animate() {
  angle += 0.5;
  if (angle > 360) angle -= 360;
}

function drawScene() {
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // Set up the projection matrix.
  var projMatrix = new Matrix4();
  projMatrix.setPerspective(45, canvas.width/canvas.height, 1, 100);
  
  // Get view matrix from camera.
  var viewMatrix = camera.getViewMatrix();
  
  // Set common uniforms.
  gl.uniformMatrix4fv(shaderProgram.u_ProjMatrix, false, projMatrix.elements);
  gl.uniformMatrix4fv(shaderProgram.u_ViewMatrix, false, viewMatrix.elements);
  gl.uniform3f(shaderProgram.u_ViewPosition, camera.eye[0], camera.eye[1], camera.eye[2]);
  
  // Animate the point light: move it in a circle around the Y axis.
  var lightRadius = 5.0;
  var rad = pointLightPosAngle * Math.PI / 180.0;
  var pointLightPos = [lightRadius * Math.cos(rad), 3.0, lightRadius * Math.sin(rad)];
  
  // Set point light uniforms.
  gl.uniform1i(shaderProgram.u_PointLightOn, lightingOn ? 1 : 0);
  gl.uniform3f(shaderProgram.u_PointLightPosition, pointLightPos[0], pointLightPos[1], pointLightPos[2]);
  gl.uniform3f(shaderProgram.u_PointLightColor, lightColor[0], lightColor[1], lightColor[2]);
  
  // Spotlight: fixed position above the scene, pointing downward.
  var spotLightPos = [0, 8, 0];
  var spotLightDir = [0, -1, 0];
  gl.uniform1i(shaderProgram.u_SpotLightOn, spotLightOn ? 1 : 0);
  gl.uniform3f(shaderProgram.u_SpotLightPosition, spotLightPos[0], spotLightPos[1], spotLightPos[2]);
  gl.uniform3f(shaderProgram.u_SpotLightDirection, spotLightDir[0], spotLightDir[1], spotLightDir[2]);
  gl.uniform3f(shaderProgram.u_SpotLightColor, lightColor[0], lightColor[1], lightColor[2]);
  gl.uniform1f(shaderProgram.u_SpotCutoff, Math.cos(20 * Math.PI / 180)); // 20° cutoff
  
  // Set lighting and normal visualization toggles.
  gl.uniform1i(shaderProgram.u_UseLighting, lightingOn ? 1 : 0);
  gl.uniform1i(shaderProgram.u_UseNormalVisualization, normalVisOn ? 1 : 0);
  
  // Set material properties (same for all objects).
  gl.uniform3f(shaderProgram.u_MaterialAmbient, 0.2, 0.2, 0.2);
  gl.uniform3f(shaderProgram.u_MaterialDiffuse, 0.8, 0.8, 0.8);
  gl.uniform3f(shaderProgram.u_MaterialSpecular, 1.0, 1.0, 1.0);
  gl.uniform1f(shaderProgram.u_MaterialShininess, 32.0);
  
  // --- Draw Cube ---
  var modelMatrix = new Matrix4();
  modelMatrix.setTranslate(-2.0, 0, 0);
  var normalMatrix = new Matrix4();
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  
  gl.uniformMatrix4fv(shaderProgram.u_ModelMatrix, false, modelMatrix.elements);
  gl.uniformMatrix4fv(shaderProgram.u_NormalMatrix, false, normalMatrix.elements);
  cube.draw(gl, shaderProgram);
  
  // --- Draw Sphere ---
  modelMatrix.setIdentity();
  modelMatrix.translate(2.0, 1.0, 0);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  
  gl.uniformMatrix4fv(shaderProgram.u_ModelMatrix, false, modelMatrix.elements);
  gl.uniformMatrix4fv(shaderProgram.u_NormalMatrix, false, normalMatrix.elements);
  sphere.draw(gl, shaderProgram);
  
  // --- Draw Light Indicator ---
  modelMatrix.setIdentity();
  modelMatrix.translate(pointLightPos[0], pointLightPos[1], pointLightPos[2]);
  modelMatrix.scale(0.2, 0.2, 0.2);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  
  gl.uniformMatrix4fv(shaderProgram.u_ModelMatrix, false, modelMatrix.elements);
  gl.uniformMatrix4fv(shaderProgram.u_NormalMatrix, false, normalMatrix.elements);
  cube.draw(gl, shaderProgram);
}

// Utility: convert a hex color string to normalized RGB array.
function hexToRgbNormalized(hex) {
  var bigint = parseInt(hex.slice(1), 16);
  var r = ((bigint >> 16) & 255) / 255;
  var g = ((bigint >> 8) & 255) / 255;
  var b = (bigint & 255) / 255;
  return [r, g, b];
}

function initShaders(gl, vshaderId, fshaderId) {
  var vertShader = getShader(gl, vshaderId);
  var fragShader = getShader(gl, fshaderId);
  var program = gl.createProgram();
  if (!program) return;
  
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log("Could not link shaders");
    return null;
  }
  
  gl.useProgram(program);
  
  // Get attribute locations.
  program.a_Position = gl.getAttribLocation(program, "a_Position");
  program.a_Normal = gl.getAttribLocation(program, "a_Normal");
  
  // Get uniform locations.
  program.u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");
  program.u_ViewMatrix = gl.getUniformLocation(program, "u_ViewMatrix");
  program.u_ProjMatrix = gl.getUniformLocation(program, "u_ProjMatrix");
  program.u_NormalMatrix = gl.getUniformLocation(program, "u_NormalMatrix");
  
  program.u_ViewPosition = gl.getUniformLocation(program, "u_ViewPosition");
  
  // Point light uniforms.
  program.u_PointLightOn = gl.getUniformLocation(program, "u_PointLightOn");
  program.u_PointLightPosition = gl.getUniformLocation(program, "u_PointLightPosition");
  program.u_PointLightColor = gl.getUniformLocation(program, "u_PointLightColor");
  
  // Spotlight uniforms.
  program.u_SpotLightOn = gl.getUniformLocation(program, "u_SpotLightOn");
  program.u_SpotLightPosition = gl.getUniformLocation(program, "u_SpotLightPosition");
  program.u_SpotLightDirection = gl.getUniformLocation(program, "u_SpotLightDirection");
  program.u_SpotLightColor = gl.getUniformLocation(program, "u_SpotLightColor");
  program.u_SpotCutoff = gl.getUniformLocation(program, "u_SpotCutoff");
  
  // Lighting and material uniforms.
  program.u_UseLighting = gl.getUniformLocation(program, "u_UseLighting");
  program.u_UseNormalVisualization = gl.getUniformLocation(program, "u_UseNormalVisualization");
  program.u_MaterialAmbient = gl.getUniformLocation(program, "u_MaterialAmbient");
  program.u_MaterialDiffuse = gl.getUniformLocation(program, "u_MaterialDiffuse");
  program.u_MaterialSpecular = gl.getUniformLocation(program, "u_MaterialSpecular");
  program.u_MaterialShininess = gl.getUniformLocation(program, "u_MaterialShininess");
  
  return program;
}

function getShader(gl, id) {
  var script = document.getElementById(id);
  if (!script) return null;
  var shaderSource = script.text;
  var shader;
  if (script.type === "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else if (script.type === "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else {
    return null;
  }
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log("Error compiling shader " + id + ": " + gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

window.onload = main;
