// triangle.js

var triangleVertexBuffer = null;
var triangleColorBuffer  = null;

/** Create basic data for a single triangle. */
function initTriangleBuffer() {
  if (triangleVertexBuffer && triangleColorBuffer) return; // already inited

  // Positions
  let vertices = new Float32Array([
    0.0,  0.5, 0.0,
   -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0
  ]);
  // Colors for each vertex
  let colors = new Float32Array([
    1,0,0,1,   0,1,0,1,   0,0,1,1
  ]);

  // Create and bind
  triangleVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  triangleColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
}

/** Draw a single triangle with the given modelMatrix. */
function drawTriangle(modelMatrix) {
  initTriangleBuffer();

  // Position
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);
  gl.vertexAttribPointer(gl.a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(gl.a_Position);

  // Color
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBuffer);
  gl.vertexAttribPointer(gl.a_Color, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(gl.a_Color);

  // No UV used for a basic triangle, so disable or skip
  gl.disableVertexAttribArray(gl.a_UV);

  // Set transform & draw
  gl.uniformMatrix4fv(gl.u_ModelMatrixLoc, false, modelMatrix.elements);
  gl.uniform1f(gl.u_texColorWeightLoc, 0.0); // no texture
  gl.uniform4fv(gl.u_SolidColorLoc, [1,1,1,1]); // fallback
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
