var gl;
var shapes = [];           // Array to hold world objects (ground, skybox, blocks, walls, etc.)
var camera;
var pointLightPosAngle = 0;
var autoLightSpeed = 20;   // degrees per second
var sliderActive = false;

var lightingOn = true;
var normalVisOn = false;
var spotLightOn = true;
var lightColor = [1.0, 1.0, 1.0];

var blockTexture = null;
var groundTexture = null;

var lastTime = 0;


function main() {
  var canvas = document.getElementById("webgl");
  gl = canvas.getContext("webgl");
  if (!gl) {
    console.log("Failed to get WebGL context.");
    return;
  }
  
  // Initialize shaders
  var shaderProgram = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(shaderProgram);
  
  // Get attribute locations (including texture coordinates)
  shaderProgram.a_Position = gl.getAttribLocation(shaderProgram, "a_Position");
  shaderProgram.a_Normal = gl.getAttribLocation(shaderProgram, "a_Normal");
  shaderProgram.a_TexCoord = gl.getAttribLocation(shaderProgram, "a_TexCoord");
  
  // Get uniform locations
  shaderProgram.u_ModelMatrix = gl.getUniformLocation(shaderProgram, "u_ModelMatrix");
  shaderProgram.u_ViewMatrix = gl.getUniformLocation(shaderProgram, "u_ViewMatrix");
  shaderProgram.u_ProjMatrix = gl.getUniformLocation(shaderProgram, "u_ProjMatrix");
  shaderProgram.u_NormalMatrix = gl.getUniformLocation(shaderProgram, "u_NormalMatrix");
  shaderProgram.u_ViewPosition = gl.getUniformLocation(shaderProgram, "u_ViewPosition");
  
  // Light uniforms
  shaderProgram.u_PointLightOn = gl.getUniformLocation(shaderProgram, "u_PointLightOn");
  shaderProgram.u_PointLightPosition = gl.getUniformLocation(shaderProgram, "u_PointLightPosition");
  shaderProgram.u_PointLightColor = gl.getUniformLocation(shaderProgram, "u_PointLightColor");
  shaderProgram.u_SpotLightOn = gl.getUniformLocation(shaderProgram, "u_SpotLightOn");
  shaderProgram.u_SpotLightPosition = gl.getUniformLocation(shaderProgram, "u_SpotLightPosition");
  shaderProgram.u_SpotLightDirection = gl.getUniformLocation(shaderProgram, "u_SpotLightDirection");
  shaderProgram.u_SpotLightColor = gl.getUniformLocation(shaderProgram, "u_SpotLightColor");
  shaderProgram.u_SpotCutoff = gl.getUniformLocation(shaderProgram, "u_SpotCutoff");
  
  // Material & lighting
  shaderProgram.u_UseLighting = gl.getUniformLocation(shaderProgram, "u_UseLighting");
  shaderProgram.u_UseNormalVisualization = gl.getUniformLocation(shaderProgram, "u_UseNormalVisualization");
  shaderProgram.u_MaterialAmbient = gl.getUniformLocation(shaderProgram, "u_MaterialAmbient");
  shaderProgram.u_MaterialDiffuse = gl.getUniformLocation(shaderProgram, "u_MaterialDiffuse");
  shaderProgram.u_MaterialSpecular = gl.getUniformLocation(shaderProgram, "u_MaterialSpecular");
  shaderProgram.u_MaterialShininess = gl.getUniformLocation(shaderProgram, "u_MaterialShininess");
  
  // Texture uniforms
  shaderProgram.u_UseTexture = gl.getUniformLocation(shaderProgram, "u_UseTexture");
  shaderProgram.u_Sampler = gl.getUniformLocation(shaderProgram, "u_Sampler");
  
  // Store shader program for use in drawing calls
  gl.shaderProgram = shaderProgram;
  
  // Initialize camera
  camera = new Camera(canvas.width / canvas.height, 0.1, 1000);
  camera.updateView();
  
  // Initialize textures
  initBlockTexture();
  initGroundTexture();
  
  // Build the world (ground, skybox, voxel blocks, walls)
  createWorld();
  
  // Setup UI controls
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
  
  var lightSlider = document.getElementById("lightPosSlider");
  lightSlider.addEventListener("mousedown", function() { sliderActive = true; });
  lightSlider.addEventListener("mouseup", function() { sliderActive = false; });
  lightSlider.addEventListener("input", function(e) {
    pointLightPosAngle = parseFloat(e.target.value);
  });
  
  gl.enable(gl.DEPTH_TEST);
  
  requestAnimationFrame(animate);
}

function animate(timestamp) {
  if(!lastTime) lastTime = timestamp;
  var dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  
  // If the slider isn’t active, animate the light’s position automatically.
  if (!sliderActive) {
    pointLightPosAngle += autoLightSpeed * dt;
    if(pointLightPosAngle > 360) pointLightPosAngle -= 360;
    document.getElementById("lightPosSlider").value = pointLightPosAngle;
  }
  
  drawScene();
  requestAnimationFrame(animate);
}

function drawScene() {
  var shaderProgram = gl.shaderProgram;
  
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // Set projection and view matrices
  gl.uniformMatrix4fv(shaderProgram.u_ProjMatrix, false, camera.projectionMatrix.elements);
  gl.uniformMatrix4fv(shaderProgram.u_ViewMatrix, false, camera.viewMatrix.elements);
  gl.uniform3f(shaderProgram.u_ViewPosition,
    camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);
  
  // Set light uniforms
  var lightRadius = 10.0;
  var rad = pointLightPosAngle * Math.PI / 180;
  var pointLightPos = [lightRadius * Math.cos(rad), 5.0, lightRadius * Math.sin(rad)];
  gl.uniform1i(shaderProgram.u_PointLightOn, lightingOn ? 1 : 0);
  gl.uniform3f(shaderProgram.u_PointLightPosition, pointLightPos[0], pointLightPos[1], pointLightPos[2]);
  gl.uniform3f(shaderProgram.u_PointLightColor, lightColor[0], lightColor[1], lightColor[2]);
  
  // Spotlight (fixed position and direction)
  var spotLightPos = [0, 15, 0];
  var spotLightDir = [0, -1, 0];
  gl.uniform1i(shaderProgram.u_SpotLightOn, spotLightOn ? 1 : 0);
  gl.uniform3f(shaderProgram.u_SpotLightPosition, spotLightPos[0], spotLightPos[1], spotLightPos[2]);
  gl.uniform3f(shaderProgram.u_SpotLightDirection, spotLightDir[0], spotLightDir[1], spotLightDir[2]);
  gl.uniform3f(shaderProgram.u_SpotLightColor, lightColor[0], lightColor[1], lightColor[2]);
  gl.uniform1f(shaderProgram.u_SpotCutoff, Math.cos(20 * Math.PI / 180));
  
  // Set material properties
  gl.uniform3f(shaderProgram.u_MaterialAmbient, 0.2, 0.2, 0.2);
  gl.uniform3f(shaderProgram.u_MaterialDiffuse, 0.8, 0.8, 0.8);
  gl.uniform3f(shaderProgram.u_MaterialSpecular, 1.0, 1.0, 1.0);
  gl.uniform1f(shaderProgram.u_MaterialShininess, 32.0);
  
  // Set toggle uniforms
  gl.uniform1i(shaderProgram.u_UseLighting, lightingOn ? 1 : 0);
  gl.uniform1i(shaderProgram.u_UseNormalVisualization, normalVisOn ? 1 : 0);
  
  // Draw each shape in the world
  for (var i = 0; i < shapes.length; i++) {
    var obj = shapes[i];
    // Set the object's model matrix
    gl.uniformMatrix4fv(shaderProgram.u_ModelMatrix, false, obj.modelMatrix.elements);
    var normalMatrix = new Matrix4();
    normalMatrix.setInverseOf(obj.modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(shaderProgram.u_NormalMatrix, false, normalMatrix.elements);
    
    // Bind texture if the object uses one
    if(obj.useTexture) {
      if(obj.textureType === "block" && blockTexture) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, blockTexture);
        gl.uniform1i(shaderProgram.u_Sampler, 0);
        gl.uniform1i(shaderProgram.u_UseTexture, 1);
      } else if(obj.textureType === "ground" && groundTexture) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, groundTexture);
        gl.uniform1i(shaderProgram.u_Sampler, 0);
        gl.uniform1i(shaderProgram.u_UseTexture, 1);
      } else {
        gl.uniform1i(shaderProgram.u_UseTexture, 0);
      }
    } else {
      gl.uniform1i(shaderProgram.u_UseTexture, 0);
    }
    
    obj.draw(gl, shaderProgram);
  }
}

// --- Texture Initialization ---
function initBlockTexture() {
  blockTexture = gl.createTexture();
  var image = new Image();
  image.onload = function() {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.bindTexture(gl.TEXTURE_2D, blockTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                  gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
  };
  image.src = "textures/block.jpg";
}

function initGroundTexture() {
  groundTexture = gl.createTexture();
  var image = new Image();
  image.onload = function() {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.bindTexture(gl.TEXTURE_2D, groundTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                  gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
  };
  image.src = "textures/grass.jpg";
}

// Utility: Convert hex color to normalized RGB array.
function hexToRgbNormalized(hex) {
  var bigint = parseInt(hex.slice(1), 16);
  var r = ((bigint >> 16) & 255) / 255;
  var g = ((bigint >> 8) & 255) / 255;
  var b = (bigint & 255) / 255;
  return [r, g, b];
}

// --- World Creation Functions ---

// Create a flat ground (a large scaled cube) textured with the grass texture.
function createGround(size) {
  var ground = new Cube(gl);
  ground.modelMatrix = new Matrix4();
  ground.modelMatrix.setIdentity();
  ground.modelMatrix.scale(size * 2, 0.1, size * 2);
  ground.modelMatrix.translate(0, -0.05, 0);
  ground.useTexture = true;
  ground.textureType = "ground";
  shapes.push(ground);
}

// Create a skybox (a large cube that could be used to simulate the sky).
function createSkybox() {
  var skybox = new Cube(gl);
  skybox.modelMatrix = new Matrix4();
  skybox.modelMatrix.setIdentity();
  skybox.modelMatrix.scale(500, 500, 500);
  // (For a proper skybox you might adjust its position to follow the camera.)
  skybox.useTexture = false;
  shapes.push(skybox);
}

// Create a voxel world: for each grid cell, stack a random number (0–4) of blocks.
function createVoxelWorld() {
  var size = 32;
  for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
      var h = Math.floor(Math.random() * 5);
      for (var k = 0; k < h; k++) {
        var block = new Cube(gl);
        block.modelMatrix = new Matrix4();
        block.modelMatrix.setIdentity();
        // Position block center at (i+0.5, k+0.5, j+0.5)
        block.modelMatrix.translate(i + 0.5, k + 0.5, j + 0.5);
        block.useTexture = true;
        block.textureType = "block";
        shapes.push(block);
      }
    }
  }
}

// Create walls using a small 2D map.
function createWalls() {
  var wallMap = [
    [1, 0, 0, 1],
    [1, 1, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1]
  ];
  var rows = wallMap.length;
  var cols = wallMap[0].length;
  var offsetX = 10;
  var offsetZ = 10;
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      var height = wallMap[i][j];
      if (height > 0) {
        for (var k = 0; k < height; k++) {
          var wallCube = new Cube(gl);
          wallCube.modelMatrix = new Matrix4();
          wallCube.modelMatrix.setIdentity();
          var x = i + offsetX + 0.5;
          var y = k + 0.5;
          var z = j + offsetZ + 0.5;
          wallCube.modelMatrix.translate(x, y, z);
          wallCube.useTexture = true;
          wallCube.textureType = "block";
          shapes.push(wallCube);
        }
      }
    }
  }
}

// Build the world by creating ground, skybox, voxel world, and walls.
function createWorld() {
  shapes = [];
  createGround(32);
  createSkybox();
  createVoxelWorld();
  createWalls();
}

window.onload = main;