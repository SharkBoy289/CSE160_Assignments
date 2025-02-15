// cube.js

var cubeVertexBuffer = null;
var cubeColorBuffer = null;
var cubeUVBuffer = null;

function initCubeBuffer() {
  if (cubeVertexBuffer && cubeColorBuffer && cubeUVBuffer) return;
  
  // Cube vertices: 6 faces; 2 triangles per face (36 vertices total).
  const vertices = new Float32Array([
    // Front face
    -0.5, -0.5,  0.5,   0.5, -0.5,  0.5,   0.5,  0.5,  0.5,
    -0.5, -0.5,  0.5,   0.5,  0.5,  0.5,  -0.5,  0.5,  0.5,
    // Back face
    -0.5, -0.5, -0.5,  -0.5,  0.5, -0.5,   0.5,  0.5, -0.5,
    -0.5, -0.5, -0.5,   0.5,  0.5, -0.5,   0.5, -0.5, -0.5,
    // Top face
    -0.5,  0.5, -0.5,  -0.5,  0.5,  0.5,   0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5,   0.5,  0.5,  0.5,   0.5,  0.5, -0.5,
    // Bottom face
    -0.5, -0.5, -0.5,   0.5, -0.5, -0.5,   0.5, -0.5,  0.5,
    -0.5, -0.5, -0.5,   0.5, -0.5,  0.5,  -0.5, -0.5,  0.5,
    // Right face
     0.5, -0.5, -0.5,   0.5,  0.5, -0.5,   0.5,  0.5,  0.5,
     0.5, -0.5, -0.5,   0.5,  0.5,  0.5,   0.5, -0.5,  0.5,
    // Left face
    -0.5, -0.5, -0.5,  -0.5, -0.5,  0.5,  -0.5,  0.5,  0.5,
    -0.5, -0.5, -0.5,  -0.5,  0.5,  0.5,  -0.5,  0.5, -0.5
  ]);
  
  // Colors: all white (so texture isn’t tinted)
  let colors = new Float32Array(36 * 4);
  for (let i = 0; i < 36; i++) {
    colors.set([1.0, 1.0, 1.0, 1.0], i * 4);
  }
  
  // UV coordinates: same mapping on each face.
  const faceUV = [0, 0, 1, 0, 1, 1,  0, 0, 1, 1, 0, 1];
  let uvData = new Float32Array(faceUV.concat(faceUV, faceUV, faceUV, faceUV, faceUV));
  
  // Create and bind buffers.
  cubeVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
  cubeColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
  
  cubeUVBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeUVBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, uvData, gl.STATIC_DRAW);
}

function drawCube(modelMatrix) {
  initCubeBuffer();
  
  // Bind vertex positions.
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.vertexAttribPointer(gl.a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(gl.a_Position);
  
  // Bind vertex colors.
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
  gl.vertexAttribPointer(gl.a_Color, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(gl.a_Color);
  
  // Bind UV coordinates.
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeUVBuffer);
  gl.vertexAttribPointer(gl.a_UV, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(gl.a_UV);
  
  // Set the model matrix.
  gl.uniformMatrix4fv(gl.u_ModelMatrixLoc, false, modelMatrix.elements);
  // For textured cubes, set texture weight to 1.
  gl.uniform1f(gl.u_texColorWeightLoc, 1.0);
  
  gl.drawArrays(gl.TRIANGLES, 0, 36);
}

function drawColoredCube(modelMatrix, color) {
  initCubeBuffer();
  
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.vertexAttribPointer(gl.a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(gl.a_Position);
  
  let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  gl.uniform4fv(u_FragColor, new Float32Array(color));
  
  gl.uniformMatrix4fv(gl.u_ModelMatrixLoc, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 36);
}
  
class Cube {
  constructor() {
    this.modelMatrix = new Matrix4();
    this.modelMatrix.setIdentity();
    // Default texture weight (1.0 = fully textured)
    this.texWeight = 1.0;
  }
  
  translate(x, y, z) {
    this.modelMatrix.translate(x, y, z);
  }
  
  scale(x, y, z) {
    this.modelMatrix.scale(x, y, z);
  }
  
  rotateY(deg) {
    this.modelMatrix.rotate(deg, 0, 1, 0);
  }
  
  draw() {
    drawCube(this.modelMatrix);
  }
}
