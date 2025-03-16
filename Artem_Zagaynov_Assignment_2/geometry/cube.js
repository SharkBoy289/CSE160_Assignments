var cubeVertexBuffer = null;
var cubeColorBuffer = null;

function initCubeBuffer() {
  if (cubeVertexBuffer && cubeColorBuffer) return; // Already initialized.
  
  // Cube vertices: 6 faces; 2 triangles per face (36 vertices total).
  var vertices = new Float32Array([
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
  
  // Build per-face color data (each face gets its own pink tone).
  var colors = [];
  for (var i = 0; i < 6; i++) { // Front face
      colors.push(1.0, 0.8, 0.8, 1.0);
  }
  for (var i = 0; i < 6; i++) { // Back face
      colors.push(1.0, 0.4, 0.7, 1.0);
  }
  for (var i = 0; i < 6; i++) { // Top face
      colors.push(0.95, 0.7, 0.75, 1.0);
  }
  for (var i = 0; i < 6; i++) { // Bottom face
      colors.push(1.0, 0.6, 0.6, 1.0);
  }
  for (var i = 0; i < 6; i++) { // Right face
      colors.push(1.0, 0.08, 0.58, 1.0);
  }
  for (var i = 0; i < 6; i++) { // Left face
      colors.push(1.0, 0.7, 0.6, 1.0);
  }
  colors = new Float32Array(colors);
  
  // Create and fill the vertex buffer.
  cubeVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
  // Create and fill the color buffer.
  cubeColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
}

function drawCube(modelMatrix) {
  initCubeBuffer();
  
  // Bind vertex positions.
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  
  // Bind vertex colors.
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Color);
  
  // Set model transformation and draw.
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 36);
}

function drawColoredCube(modelMatrix, color) {
    initCubeBuffer();
  
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
  
    // **Use uniform color instead of disabling `a_Color`**
    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    gl.uniform4fv(u_FragColor, new Float32Array(color));
  
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
  
