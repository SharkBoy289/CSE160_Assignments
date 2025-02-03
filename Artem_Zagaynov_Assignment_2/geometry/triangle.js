// triangle.js

var triangleVertexBuffer = null;
var triangleColorBuffer = null;

function initTriangleBuffer() {
  if (triangleVertexBuffer && triangleColorBuffer) return;
  
  var vertices = createTriangleVertices();
  // Assign each vertex a distinct color.
  var colors = new Float32Array([
    1, 0, 0, 1,  // Red
    0, 1, 0, 1,  // Green
    0, 0, 1, 1   // Blue
  ]);
  
  triangleVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
  triangleColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
}

function drawTriangle(modelMatrix) {
  initTriangleBuffer();
  
  // Bind vertex positions.
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  
  // Bind vertex colors.
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBuffer);
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Color);
  
  // Set the model transformation matrix.
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
