// cylinder.js

var cylinderVertexBuffer = null;
var cylinderColorBuffer = null;
var cylinderVertexCount = 0;

function initCylinderBuffer() {
  if (cylinderVertexBuffer && cylinderColorBuffer) return;
  
  var slices = 20;      // Number of slices around the cylinder
  var radius = 0.5;
  var height = 1.0;
  var vertices = [];
  var colors = [];
  
  // Create vertices for the side surface.
  for (var i = 0; i < slices; i++) {
    var theta = (i / slices) * 2 * Math.PI;
    var nextTheta = ((i + 1) / slices) * 2 * Math.PI;
    
    // Compute x,z positions on the circle.
    var x1 = radius * Math.cos(theta);
    var z1 = radius * Math.sin(theta);
    var x2 = radius * Math.cos(nextTheta);
    var z2 = radius * Math.sin(nextTheta);
    
    // First triangle of the quad.
    vertices.push(x1, -height / 2, z1);
    vertices.push(x2, -height / 2, z2);
    vertices.push(x2, height / 2, z2);
    
    // Second triangle.
    vertices.push(x1, -height / 2, z1);
    vertices.push(x2, height / 2, z2);
    vertices.push(x1, height / 2, z1);
    
    // For color we can vary with the angle.
    var r = 0.5 + 0.5 * Math.cos(theta);
    var g = 0.5 + 0.5 * Math.sin(theta);
    var b = 0.5;
    for (var j = 0; j < 6; j++) {
      colors.push(r, g, b, 1.0);
    }
  }
  
  cylinderVertexCount = vertices.length / 3;
  
  // Create and fill the vertex buffer.
  cylinderVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  
  // Create and fill the color buffer.
  cylinderColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cylinderColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
}

function drawCylinder(modelMatrix) {
  initCylinderBuffer();
  
  // Bind vertex positions.
  gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexBuffer);
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  
  // Bind vertex colors.
  gl.bindBuffer(gl.ARRAY_BUFFER, cylinderColorBuffer);
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Color);
  
  // Pass the model matrix.
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  
  // Draw the cylinder.
  gl.drawArrays(gl.TRIANGLES, 0, cylinderVertexCount);
}
