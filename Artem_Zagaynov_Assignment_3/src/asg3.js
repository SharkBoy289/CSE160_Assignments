// asg3.js

// Global WebGL variables and shader uniform/attribute locations.
var gl;
var shapes = [];     // Array to hold ground, skybox, and wall cubes.
var camera;
var worldMap = [];   // Using a 16x16 grid for testing.
const COLLISION_MARGIN = 0.3; // Extra distance to avoid camera penetrating a wall.

// Mouse control globals.
var dragging = false;
var lastMouseX = 0;
var lastMouseY = 0;

// Vertex shader.
var VSHADER_SOURCE = `
  attribute vec3 a_Position;
  attribute vec3 a_Color;
  attribute vec2 a_UV;
  varying vec3 v_Color;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_viewMatrix;
  uniform mat4 u_projectionMatrix;
  void main() {
    v_Color = a_Color;
    v_UV = a_UV;
    gl_Position = u_projectionMatrix * u_viewMatrix * u_ModelMatrix * vec4(a_Position, 1.0);
  }
`;

// Fragment shader.
// This shader mixes the vertex color with the texture based on u_texColorWeight.
var FSHADER_SOURCE = `
precision mediump float;
varying vec3 v_Color;
varying vec2 v_UV;
uniform sampler2D u_Sampler;
uniform float u_texColorWeight;
uniform vec4 u_SolidColor;  // For solid color drawing.
void main() {
  vec4 texColor = texture2D(u_Sampler, v_UV);
  // If u_texColorWeight is 0, use u_SolidColor; otherwise, mix with vertex color.
  vec4 baseColor = (u_texColorWeight < 0.5) ? u_SolidColor : vec4(v_Color, 1.0);
  gl_FragColor = mix(baseColor, texColor, u_texColorWeight);
}
`;

// --- Background Quad (for later use) ---
var bgVertexBuffer;
function initBackground() {
  // Each vertex: 3 position, 4 color, 2 UV (UVs not used here but included for matching strides).
  var bgVertices = new Float32Array([
    //    x,    y,  z,       r,    g,    b,   a,     u, v
    -1.0, -1.0, 0.0,   0.59, 0.29, 0.0, 1.0,    0, 0,  // bottom-left: ground color (brown)
     1.0, -1.0, 0.0,   0.59, 0.29, 0.0, 1.0,    1, 0,  // bottom-right
    -1.0,  1.0, 0.0,   0.53, 0.81, 0.92,1.0,    0, 1,  // top-left: sky color (sky blue)

    -1.0,  1.0, 0.0,   0.53, 0.81, 0.92,1.0,    0, 1,
     1.0, -1.0, 0.0,   0.59, 0.29, 0.0, 1.0,    1, 0,
     1.0,  1.0, 0.0,   0.53, 0.81, 0.92,1.0,    1, 1
  ]);
  bgVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bgVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, bgVertices, gl.STATIC_DRAW);
}
function drawBackground() {
  // Disable depth testing so the background always shows behind scene geometry.
  gl.disable(gl.DEPTH_TEST);
  var identity = new Matrix4();
  identity.setIdentity();
  gl.uniformMatrix4fv(gl.u_ModelMatrixLoc, false, identity.elements);
  gl.uniformMatrix4fv(gl.u_viewMatrixLoc, false, identity.elements);
  gl.uniformMatrix4fv(gl.u_projectionMatrixLoc, false, identity.elements);
  gl.uniform1f(gl.u_texColorWeightLoc, 0.0); // Use solid color.
  gl.bindBuffer(gl.ARRAY_BUFFER, bgVertexBuffer);
  let FSIZE = Float32Array.BYTES_PER_ELEMENT;
  gl.vertexAttribPointer(gl.a_Position, 3, gl.FLOAT, false, 8 * FSIZE, 0);
  gl.enableVertexAttribArray(gl.a_Position);
  gl.vertexAttribPointer(gl.a_Color, 4, gl.FLOAT, false, 8 * FSIZE, 3 * FSIZE);
  gl.enableVertexAttribArray(gl.a_Color);
  gl.vertexAttribPointer(gl.a_UV, 2, gl.FLOAT, false, 8 * FSIZE, 7 * FSIZE);
  gl.enableVertexAttribArray(gl.a_UV);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.enable(gl.DEPTH_TEST);
}

// --- Texture Loading ---
function loadWorldTexture(src) {
  var texture = gl.createTexture();
  var img = new Image();
  img.src = src;
  img.onload = function() {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.u_SamplerLoc = gl.getUniformLocation(gl.program, "u_Sampler");
    gl.uniform1i(gl.u_SamplerLoc, 0);
    animate();
  };
}

// --- World Creation ---
// We use a 16x16 grid. Nonzero entries denote wall heights.
function createWorld() {
  shapes = []; // Reset shapes array.
  var worldSize = 16;
  // Initialize worldMap if empty.
  if (worldMap.length === 0) {
    for (let i = 0; i < worldSize; i++) {
      worldMap[i] = [];
      for (let j = 0; j < worldSize; j++) {
        // Create a solid boundary wall.
        if (i === 0 || j === 0 || i === worldSize - 1 || j === worldSize - 1)
          worldMap[i][j] = 4;
        else
          worldMap[i][j] = 0;
      }
    }
    // Add a couple of interior walls.
    worldMap[5][5] = 3;
    worldMap[5][6] = 3;
    worldMap[6][5] = 3;
  }
  
  // --- Ground ---
  let ground = new Cube();
  ground.modelMatrix = new Matrix4();
  ground.modelMatrix.setIdentity();
  // Scale: make the cube very flat in the y-dimension.
  ground.scale(worldSize, 0.1, worldSize);
  // Translate so that the top face is at y = 0.
  ground.translate(worldSize / 2, -0.05, worldSize / 2);
  ground.texWeight = 0.0; // Ensure we use solid color.
  ground.draw = function() {
    // Set the shader to use solid color.
    gl.uniform1f(gl.u_texColorWeightLoc, 0.0);
    gl.uniform4fv(gl.u_SolidColor, new Float32Array([0.59, 0.29, 0.0, 1.0]));
    gl.uniformMatrix4fv(gl.u_ModelMatrixLoc, false, this.modelMatrix.elements);
    // Draw the cube (using 36 vertices from your shared cube buffer).
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  };
  shapes.push(ground);

  // --- Skybox ---
  let sky = new Cube();
  sky.modelMatrix = new Matrix4(); // (We'll compute its transform dynamically.)
  sky.texWeight = 0.0; // Use solid color.
  sky.draw = function() {
    // Disable depth writes so the sky always appears behind everything.
    gl.depthMask(false);
    let skyMatrix = new Matrix4();
    skyMatrix.setIdentity();
    // Center the skybox on the camera's current position.
    skyMatrix.translate(camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);
    // Scale it large enough to cover the entire view.
    skyMatrix.scale(500, 500, 500);
    gl.uniform1f(gl.u_texColorWeightLoc, 0.0);
    gl.uniform4fv(gl.u_SolidColor, new Float32Array([0.53, 0.81, 0.92, 1.0]));
    gl.uniformMatrix4fv(gl.u_ModelMatrixLoc, false, skyMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
    gl.depthMask(true);
  };
  shapes.push(sky);
  
  // --- Walls ---
  for (let i = 0; i < worldSize; i++) {
    for (let j = 0; j < worldSize; j++) {
      let height = worldMap[i][j];
      if (height > 0) {
        for (let k = 0; k < height; k++) {
          let wallCube = new Cube();
          wallCube.modelMatrix = new Matrix4();
          wallCube.modelMatrix.setIdentity();
          // Center each cube at (i, k+0.5, j) so the top of the wall stacks properly.
          wallCube.translate(i, k + 0.5, j);
          wallCube.texWeight = 1.0; // Fully textured.
          wallCube.isWall = true;   // Flag for collision checking.
          shapes.push(wallCube);
        }
      }
    }
  }
}

// --- Collision Detection ---
// Save and restore camera state so we can revert movement if a collision occurs.
function saveCameraState() {
  return {
    eye: new Vector3(camera.eye.elements.slice()),
    at: new Vector3(camera.at.elements.slice())
  };
}
function restoreCameraState(state) {
  camera.eye = state.eye;
  camera.at = state.at;
  camera.updateView();
}
// Checks if the camera is colliding with any wall cube.
function checkCollision() {
  for (let s of shapes) {
    if (s.isWall) {
      // Extract wall center from its model matrix (assuming translation is stored in elements 12, 13, 14).
      let tx = s.modelMatrix.elements[12];
      let tz = s.modelMatrix.elements[14];
      let dx = Math.abs(camera.eye.elements[0] - tx);
      let dz = Math.abs(camera.eye.elements[2] - tz);
      // Each wall cube is 1x1. If the camera is within 0.5 (half-size) plus a margin, it's a collision.
      if (dx < (0.5 + COLLISION_MARGIN) && dz < (0.5 + COLLISION_MARGIN)) {
        return true;
      }
    }
  }
  return false;
}

// --- Animation Loop ---
var lastFrameTime = performance.now();
function animate() {
  let now = performance.now();
  let elapsed = now - lastFrameTime;
  lastFrameTime = now;
  
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // Optionally, draw a background quad (if desired).
  // drawBackground();
  
  // Set view and projection uniforms.
  gl.uniformMatrix4fv(gl.u_viewMatrixLoc, false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(gl.u_projectionMatrixLoc, false, camera.projectionMatrix.elements);
  
  // Update and draw each shape.
  for (let s of shapes) {
    if (typeof s.update === "function") s.update();
    if (typeof s.draw === "function") {
      s.draw();
    } else {
      gl.uniformMatrix4fv(gl.u_ModelMatrixLoc, false, s.modelMatrix.elements);
      gl.uniform1f(gl.u_texColorWeightLoc, (s.texWeight !== undefined) ? s.texWeight : 1.0);
      gl.drawArrays(gl.TRIANGLES, 0, s.vertices.length / 8);
    }
  }
  
  requestAnimationFrame(animate);
}

// --- Keyboard Controls ---
// Wrap movement so that if a collision occurs after a move, the camera reverts.
function keydown(ev) {
  let prevState = saveCameraState();
  switch (ev.keyCode) {
    case 87: camera.moveForward(); break;   // W
    case 83: camera.moveBackwards(); break;   // S
    case 65: camera.moveLeft(); break;        // A
    case 68: camera.moveRight(); break;       // D
    case 81: camera.panLeft(); break;         // Q
    case 69: camera.panRight(); break;        // E
    default: return;
  }
  // If the camera now collides with any wall, revert the movement.
  if (checkCollision()) {
    restoreCameraState(prevState);
  }
}

// --- Mouse Controls ---
function setupMouse(canvas) {
  canvas.addEventListener("mousedown", function(ev) {
    dragging = true;
    lastMouseX = ev.clientX;
    lastMouseY = ev.clientY;
  });
  canvas.addEventListener("mousemove", function(ev) {
    if (dragging) {
      let deltaX = ev.clientX - lastMouseX;
      let sensitivity = 0.5;
      camera.pan(deltaX * sensitivity);
      lastMouseX = ev.clientX;
      lastMouseY = ev.clientY;
    }
  });
  canvas.addEventListener("mouseup", function(ev) {
    dragging = false;
  });
  canvas.addEventListener("mouseout", function(ev) {
    dragging = false;
  });
}

// --- Main ---
function main() {
  let canvas = document.getElementById("webgl");
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("Failed to get WebGL context.");
    return;
  }
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to compile and load shaders.");
    return;
  }
  
  // Cache uniform locations.
  gl.u_ModelMatrixLoc = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  gl.u_viewMatrixLoc = gl.getUniformLocation(gl.program, "u_viewMatrix");
  gl.u_projectionMatrixLoc = gl.getUniformLocation(gl.program, "u_projectionMatrix");
  gl.u_texColorWeightLoc = gl.getUniformLocation(gl.program, "u_texColorWeight");
  
  // Cache attribute locations.
  gl.a_Position = gl.getAttribLocation(gl.program, "a_Position");
  gl.a_Color = gl.getAttribLocation(gl.program, "a_Color");
  gl.a_UV = gl.getAttribLocation(gl.program, "a_UV");
  
  // Create a buffer for vertex data (used by Cube and drawColoredCube).
  let vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create buffer");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  let FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;
  gl.vertexAttribPointer(gl.a_Position, 3, gl.FLOAT, false, 8 * FLOAT_SIZE, 0);
  gl.enableVertexAttribArray(gl.a_Position);
  gl.vertexAttribPointer(gl.a_Color, 3, gl.FLOAT, false, 8 * FLOAT_SIZE, 3 * FLOAT_SIZE);
  gl.enableVertexAttribArray(gl.a_Color);
  gl.vertexAttribPointer(gl.a_UV, 2, gl.FLOAT, false, 8 * FLOAT_SIZE, 6 * FLOAT_SIZE);
  gl.enableVertexAttribArray(gl.a_UV);
  
  // Initialize the camera.
  camera = new Camera(canvas.width / canvas.height, 0.1, 1000);
  
  // Create the world (ground, sky, and walls).
  createWorld();
  
  // Install keyboard handler.
  document.onkeydown = keydown;
  
  // Setup mouse event handlers.
  setupMouse(canvas);
  
  // (Optional) Initialize background quad if desired.
  initBackground();
  
  // Load the texture (ensure your texture path is correct).
  loadWorldTexture("../textures/block.jpg");
}

window.onload = main;
