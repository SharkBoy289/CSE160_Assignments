// cube.js

// Global buffers for a unit cube
var cubeVertexBuffer = null;
var cubeColorBuffer  = null;
var cubeUVBuffer     = null;

/** Initialize buffers for a unit cube (centered at origin, side=1). */
function initCubeBuffer() {
  if (cubeVertexBuffer && cubeColorBuffer && cubeUVBuffer) return;

  // 36 vertices => 6 faces, 2 triangles each, 3 verts each
  let vertices = new Float32Array([
    // Front face
    -0.5, -0.5,  0.5,
     0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5,
    // Back face
    -0.5, -0.5, -0.5,
    -0.5,  0.5, -0.5,
     0.5,  0.5, -0.5,
    -0.5, -0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5, -0.5, -0.5,
    // Top face
    -0.5,  0.5, -0.5,
    -0.5,  0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5,
     0.5,  0.5,  0.5,
     0.5,  0.5, -0.5,
    // Bottom face
    -0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5, -0.5,  0.5,
    -0.5, -0.5, -0.5,
     0.5, -0.5,  0.5,
    -0.5, -0.5,  0.5,
    // Right face
     0.5, -0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5,  0.5,  0.5,
     0.5, -0.5, -0.5,
     0.5,  0.5,  0.5,
     0.5, -0.5,  0.5,
    // Left face
    -0.5, -0.5, -0.5,
    -0.5, -0.5,  0.5,
    -0.5,  0.5,  0.5,
    -0.5, -0.5, -0.5,
    -0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5
  ]);

  // Simple color array (all faces the same color or vary as you like)
  let colors = [];
  for(let i=0; i<36; i++){
    colors.push(1.0, 1.0, 1.0, 1.0); // white
  }
  colors = new Float32Array(colors);

  // UV coordinates (can repeat each face as 0->1 if you want)
  let uvCoords = [];
  for(let f=0; f<6; f++){
    uvCoords.push(
      0,0, 1,0, 1,1,
      0,0, 1,1, 0,1
    );
  }
  uvCoords = new Float32Array(uvCoords);

  // Create & fill buffers
  cubeVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  cubeColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

  cubeUVBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeUVBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, uvCoords, gl.STATIC_DRAW);
}

/** Bind the cube buffers & issue a drawArrays(36). */
function drawCubeBuffers() {
  initCubeBuffer();

  // Positions
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.vertexAttribPointer(gl.a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(gl.a_Position);

  // Colors
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
  gl.vertexAttribPointer(gl.a_Color, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(gl.a_Color);

  // UV
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeUVBuffer);
  gl.vertexAttribPointer(gl.a_UV, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(gl.a_UV);

  // Draw 36 vertices
  gl.drawArrays(gl.TRIANGLES, 0, 36);
}

/** Simple Cube class if you want transforms per-instance. */
class Cube {
  constructor() {
    this.modelMatrix = new Matrix4();
    this.modelMatrix.setIdentity();
    this.texWeight = 1.0; // 0=solid color, 1=full texture
  }

  translate(x, y, z) { this.modelMatrix.translate(x, y, z); }
  scale(x, y, z)     { this.modelMatrix.scale(x, y, z); }
  rotate(angle, rx, ry, rz) { this.modelMatrix.rotate(angle, rx, ry, rz); }

  draw() {
    initCubeBuffer();
    gl.uniformMatrix4fv(gl.u_ModelMatrixLoc, false, this.modelMatrix.elements);
    gl.uniform1f(gl.u_texColorWeightLoc, this.texWeight);
    gl.uniform4fv(gl.u_SolidColorLoc, [1,1,1,1]);

    // Actually draw the cube
    drawCubeBuffers();
  }
}


