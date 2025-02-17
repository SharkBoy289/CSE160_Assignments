// asg3.js

// Global variables for WebGL
var gl;
var shapes = [];           // Holds ground, skybox, blocks, etc.
var camera;
var lastFrameTime = 0;
var frames = 0;
var fpsLabel;
var prevTime = performance.now();

// Global textures
var blockTexture = null;   // For wall/voxel blocks (e.g. dirt)
var groundTexture = null;  // For the ground (grass)

// Global key state
var keysPressed = {};

// --- Shader Sources ---
var VSHADER_SOURCE = `
  attribute vec3 a_Position;
  attribute vec4 a_Color;
  attribute vec2 a_UV;
  
  varying vec4 v_Color;
  varying vec2 v_UV;
  varying float v_Y;
  
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_viewMatrix;
  uniform mat4 u_projectionMatrix;
  
  void main() {
    v_Color = a_Color;
    v_UV = a_UV;
    v_Y = a_Position.y;
    gl_Position = u_projectionMatrix * u_viewMatrix * u_ModelMatrix * vec4(a_Position, 1.0);
  }
`;

var FSHADER_SOURCE = `
precision mediump float;

varying vec4 v_Color;
varying vec2 v_UV;
varying float v_Y;

uniform sampler2D u_Sampler;
uniform float u_texColorWeight; // if negative, use gradient (for skybox)
uniform vec4 u_SolidColor;

void main() {
  if(u_texColorWeight < 0.0) {
    float t = clamp((v_Y + 0.5), 0.0, 1.0);
    vec4 darkBlue = vec4(0.0, 0.0, 0.3, 1.0);
    vec4 lightBlue = vec4(0.5, 0.7, 1.0, 1.0);
    gl_FragColor = mix(darkBlue, lightBlue, t);
  } else {
    vec4 texColor = texture2D(u_Sampler, v_UV);
    vec4 baseColor = v_Color * u_SolidColor;
    gl_FragColor = mix(baseColor, texColor, u_texColorWeight);
  }
}
`;

// --- Texture Initialization ---
function initBlockTexture() {
  // Load the block texture (e.g. dirt)
  blockTexture = gl.createTexture();
  var image = new Image();
  image.onload = function() {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.bindTexture(gl.TEXTURE_2D, blockTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
  };
  image.src = "../textures/block.jpg";
}

function initGroundTexture() {
  // Load the ground texture (grass)
  groundTexture = gl.createTexture();
  var image = new Image();
  image.onload = function() {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.bindTexture(gl.TEXTURE_2D, groundTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
  };
  image.src = "../textures/grass.jpg";
}

// --- Helper: Compute Ground Level at (x,z) ---
// Returns the highest top (block.center.y + 0.5) for blocks in the grid cell containing (x,z).
// If none, returns 1.0.
function computeGroundLevel(x, z) {
  let level = 0.0; // default ground top (from ground quad)
  let gridX = Math.round(x - 0.5) + 0.5;
  let gridZ = Math.round(z - 0.5) + 0.5;
  for (let s of shapes) {
    if (s.texWeight === 1.0 && s.position) {
      if (Math.abs(s.position.elements[0] - gridX) < 0.1 &&
          Math.abs(s.position.elements[2] - gridZ) < 0.1) {
        let top = s.position.elements[1] + 0.5;
        if (top > level) {
          level = top;
        }
      }
    }
  }
  return level;
}

// --- Create Ground ---
// Draw one large quad textured with the grass texture.
function createGround(size) {
  let ground = new Quad(); // from quad.js
  ground.scale(size*2, 1.0, size*2);
  // The quad's vertices are at y=0. For visual appearance, we translate it upward so that its top is at 1.0.
  ground.translate(0, 0, 0);
  ground.texWeight = 1.0;
  ground.draw = function() {
    if (groundTexture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, groundTexture);
      gl.uniform1i(gl.u_Sampler, 0);
    }
    this.drawColored([1,1,1,1]);
  };
  shapes.push(ground);
}

// --- Create Skybox with Gradient ---
function createSkybox() {
  let skybox = new Cube();
  skybox.draw = function() {
    gl.depthMask(false);
    let skyMatrix = new Matrix4();
    skyMatrix.setIdentity();
    skyMatrix.translate(camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);
    skyMatrix.scale(500, 500, 500);
    gl.uniformMatrix4fv(gl.u_ModelMatrixLoc, false, skyMatrix.elements);
    gl.uniform1f(gl.u_texColorWeightLoc, -1.0);
    gl.uniform4fv(gl.u_SolidColorLoc, new Float32Array([1,1,1,1]));
    drawCubeBuffers();
    gl.depthMask(true);
  };
  shapes.push(skybox);
}

// --- Create Voxel World from a Map ---
// Build a 32x32 world where each cell has a height between 0 and 4.
// For simplicity we generate random heights here.
function createVoxelWorld() {
  let map = [];
  let size = 32;
  // Generate a 32x32 array of heights (0 to 4).
  for (let i = 0; i < size; i++) {
    map[i] = [];
    for (let j = 0; j < size; j++) {
      map[i][j] = Math.floor(Math.random() * 5); // 0 to 4
    }
  }
  // Build the world: for each grid cell, stack cubes according to the height.
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let h = map[i][j];
      for (let k = 0; k < h; k++) {
        let block = new Cube();
        block.texWeight = 1.0;
        // Place center at (i+0.5, k+0.5, j+0.5).
        let x = i + 0.5;
        let y = k + 0.5;
        let z = j + 0.5;
        block.translate(x, y, z);
        block.position = new Vector3([x, y, z]);
        shapes.push(block);
      }
    }
  }
}

// --- Preview Block ---
// The preview block indicates where a new block will be placed.
// It is drawn with a very low alpha (0.2).
var previewBlock = new Cube();
previewBlock.texWeight = 1.0;
previewBlock.draw = function() {
  gl.uniform1f(gl.u_texColorWeightLoc, 0.0);
  gl.uniform4fv(gl.u_SolidColorLoc, new Float32Array([1,1,1,0.2]));
  gl.uniformMatrix4fv(gl.u_ModelMatrixLoc, false, this.modelMatrix.elements);
  drawCubeBuffers();
};

// --- Update Preview Block ---
// Here we use the horizontal (x/z) component of the camera's view direction to place the preview block.
// This makes it follow the center of the screen (i.e. the center of the view).
function updatePreviewBlock() {
  let forward = new Vector3(camera.at.elements);
  forward.sub(camera.eye);
  forward.elements[1] = 0;
  forward.normalize();
  let previewDistance = 3.0;
  let posX = camera.eye.elements[0] + forward.elements[0] * previewDistance;
  let posZ = camera.eye.elements[2] + forward.elements[2] * previewDistance;
  posX = Math.round(posX - 0.5) + 0.5;
  posZ = Math.round(posZ - 0.5) + 0.5;
  let base = computeGroundLevel(posX, posZ);
  let posY = base + 0.5;
  previewBlock.position = new Vector3([posX, posY, posZ]);
  previewBlock.modelMatrix = new Matrix4();
  previewBlock.modelMatrix.setIdentity();
  previewBlock.modelMatrix.translate(posX, posY, posZ);
}

// --- Block Placement/Removal ---
function addBlockAtPreview() {
  let pos = previewBlock.position;
  // Check if a block is already exactly at the preview location.
  for (let s of shapes) {
    if (s.position &&
        Math.abs(s.position.elements[0] - pos.elements[0]) < 0.1 &&
        Math.abs(s.position.elements[2] - pos.elements[2]) < 0.1 &&
        Math.abs(s.position.elements[1] - pos.elements[1]) < 0.1) {
      // A block is already at that level – do not add a duplicate.
      return;
    }
  }
  let newBlock = new Cube();
  newBlock.texWeight = 1.0;
  newBlock.batch = true;
  // Use the preview block's computed position (which should be higher if blocks are already present)
  newBlock.translate(pos.elements[0], pos.elements[1], pos.elements[2]);
  newBlock.position = new Vector3([pos.elements[0], pos.elements[1], pos.elements[2]]);
  shapes.push(newBlock);
}


function removeBlockAtPreview() {
  let pos = previewBlock.position;
  for (let i = 0; i < shapes.length; i++) {
    let s = shapes[i];
    if (s.position &&
        Math.abs(s.position.elements[0] - pos.elements[0]) < 0.1 &&
        Math.abs(s.position.elements[2] - pos.elements[2]) < 0.1) {
      shapes.splice(i, 1);
      return;
    }
  }
}

// --- Mouse Controls ---
var isDragging = false;
var lastMouseX = 0;
var lastMouseY = 0;
function initMouseControls(canvas) {
  canvas.addEventListener('mousedown', function(ev) {
    isDragging = true;
    lastMouseX = ev.clientX;
    lastMouseY = ev.clientY;
  });
  canvas.addEventListener('mouseup', function(ev) {
    isDragging = false;
  });
  canvas.addEventListener('mousemove', function(ev) {
    if (isDragging) {
      let deltaX = ev.clientX - lastMouseX;
      let deltaY = ev.clientY - lastMouseY;
      lastMouseX = ev.clientX;
      lastMouseY = ev.clientY;
      camera.pan(deltaX * 0.2);
      camera.tilt(-deltaY * 0.2);
    }
  });
}

// --- Key Controls ---
function initKeyControls() {
  document.addEventListener('keydown', function(ev) {
    let key = ev.key.toLowerCase();
    keysPressed[key] = true;
    if (ev.key === ' ') {
      camera.jump();
    }
    if (key === 'f') {
      addBlockAtPreview();
    }
    if (key === 'g') {
      removeBlockAtPreview();
    }
    if (key === 'q') { // pan left
      camera.pan(5);
    }
    if (key === 'e') { // pan right
      camera.pan(-5);
    }
  });
  document.addEventListener('keyup', function(ev) {
    keysPressed[ev.key.toLowerCase()] = false;
  });
  
  let rotationSlider = document.getElementById("rotationSlider");
  let rotationVal = document.getElementById("rotationVal");
  rotationSlider.oninput = function() {
    let angle = parseInt(rotationSlider.value);
    rotationVal.innerText = angle + "°";
  };
}

// --- Build a 32x32x4 Voxel World ---
// Instead of random blocks, create a world from a 2D array.
// For demonstration, we generate a random 32x32 array of heights (0-4).
function createVoxelWorld() {
  let size = 32;
  let map = [];
  // Generate a 32x32 array with a 70% chance of 0 and 30% chance of height 1-4.
  for (let i = 0; i < size; i++) {
    map[i] = [];
    for (let j = 0; j < size; j++) {
      let r = Math.random();
      let h = (r < 0.95) ? 0 : Math.floor(Math.random() * 4) + 1;
      map[i][j] = h;
    }
  }
  // For each grid cell, stack cubes according to the height.
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let h = map[i][j];
      for (let k = 0; k < h; k++) {
        let block = new Cube();
        block.texWeight = 1.0;
        // Mark block as batchable if you are using batching.
        block.batch = true;
        // Place the block so that its center is at (i+0.5, k+0.5, j+0.5).
        let x = i + 0.5;
        let y = k + 0.5;
        let z = j + 0.5;
        block.translate(x, y, z);
        block.position = new Vector3([x, y, z]);
        shapes.push(block);
      }
    }
  }
}

function createWalls() {
  // A simple 2D array representing a wall layout.
  // Each number represents the height (in cubes) at that cell.
  let wallMap = [
    [1, 0, 0, 1],
    [1, 1, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1]
  ];
  let rows = wallMap.length;
  let cols = wallMap[0].length;
  
  // Choose an offset to position the wall in your world.
  // (For example, placing the wall starting at (10,?,10).)
  let offsetX = 10;
  let offsetZ = 10;
  
  // For each cell in the wallMap:
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let height = wallMap[i][j];
      if (height > 0) {
        // For each cube in this column, create a wall block.
        for (let k = 0; k < height; k++) {
          let wallCube = new Cube();
          wallCube.texWeight = 1.0;
          wallCube.batch = true; // Mark as batchable if using batching.
          // Compute the center position:
          // x and z are snapped to grid: (cell index + offset + 0.5)
          // y is k + 0.5 (since each cube is 1 unit tall).
          let x = i + offsetX + 0.5;
          let y = k + 0.5;
          let z = j + offsetZ + 0.5;
          wallCube.translate(x, y, z);
          wallCube.position = new Vector3([x, y, z]);
          shapes.push(wallCube);
        }
      }
    }
  }
}


// --- Rebuild the World ---
function createWorld() {
  shapes = [];
  // Create ground and skybox.
  createGround(32);
  createSkybox();
  // Build the voxel world from a 32x32 map.
  createVoxelWorld();
  createWalls();
  // (If you want to keep some random blocks as well, you can call createRandomBlocks(n).)
}

// --- Animation Loop ---
function animate(timestamp) {
  let dt = (timestamp - prevTime) / 1000;
  prevTime = timestamp;
  
  frames++;
  if (timestamp - lastFrameTime >= 1000) {
    let fps = Math.round((frames * 1000) / (timestamp - lastFrameTime));
    fpsLabel.innerText = fps;
    lastFrameTime = timestamp;
    frames = 0;
  }
  
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // --- Update Horizontal Movement & Collision ---
  let blocks = shapes.filter(s => s.texWeight === 1.0 && s.position);
  camera.updateMovement(dt, blocks);
  
  // --- Always Apply Gravity ---
  let groundLevel = computeGroundLevel(camera.eye.elements[0], camera.eye.elements[2]);
  let desiredHead = groundLevel + 1.0;
  camera.verticalVelocity += camera.gravity;
  camera.eye.elements[1] += camera.verticalVelocity;
  camera.at.elements[1] += camera.verticalVelocity;
  if (camera.eye.elements[1] < desiredHead) {
    let diff = desiredHead - camera.eye.elements[1];
    camera.eye.elements[1] = desiredHead;
    camera.at.elements[1] += diff;
    camera.verticalVelocity = 0;
    camera.isOnGround = true;
  } else {
    camera.isOnGround = false;
  }
  camera.updateView();
  
  // --- Update Preview Block ---
  updatePreviewBlock();
  
  gl.uniformMatrix4fv(gl.u_viewMatrixLoc, false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(gl.u_projectionMatrixLoc, false, camera.projectionMatrix.elements);
  
  for (let s of shapes) {
    if (typeof s.draw === "function") {
      // Use block texture for cubes.
      if (s.texWeight === 1.0 && blockTexture) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, blockTexture);
        gl.uniform1i(gl.u_Sampler, 0);
      }
      s.draw();
    }
  }
  
  // Draw preview block.
  if (previewBlock) {
    if (blockTexture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, blockTexture);
      gl.uniform1i(gl.u_Sampler, 0);
    }
    previewBlock.draw();
  }
  
  requestAnimationFrame(animate);
}

// --- Main Function ---
function main() {
  let canvas = document.getElementById("webgl");
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("Failed to get WebGL context.");
    return;
  }
  
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to compile/link shaders.");
    return;
  }
  
  gl.u_ModelMatrixLoc      = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  gl.u_viewMatrixLoc       = gl.getUniformLocation(gl.program, "u_viewMatrix");
  gl.u_projectionMatrixLoc = gl.getUniformLocation(gl.program, "u_projectionMatrix");
  gl.u_texColorWeightLoc   = gl.getUniformLocation(gl.program, "u_texColorWeight");
  gl.u_SolidColorLoc       = gl.getUniformLocation(gl.program, "u_SolidColor");
  
  gl.a_Position = gl.getAttribLocation(gl.program, "a_Position");
  gl.a_Color    = gl.getAttribLocation(gl.program, "a_Color");
  gl.a_UV       = gl.getAttribLocation(gl.program, "a_UV");
  
  if (!gl.u_ModelMatrixLoc || !gl.u_viewMatrixLoc || !gl.u_projectionMatrixLoc ||
      !gl.u_texColorWeightLoc || !gl.u_SolidColorLoc) {
    console.error("Error: Some uniform locations are missing!");
  }
  
  fpsLabel = document.getElementById("fps");
  
  // Initialize camera.
  camera = new Camera(canvas.width / canvas.height, 0.1, 1000);
  camera.eye = new Vector3([8, 2.0, 25]);
  camera.at = new Vector3([8, 2.0, 8]);
  camera.updateView();
  
  initKeyControls();
  initMouseControls(canvas);
  
  initBlockTexture();
  initGroundTexture();
  createWorld();
  
  requestAnimationFrame(animate);
}

window.onload = main;
