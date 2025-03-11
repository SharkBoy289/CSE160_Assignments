/* models/model.js */
// A basic Model class that creates buffers for vertices, normals, indices, and optionally texture coordinates.
var Model = function(gl, vertices, normals, indices, uvs) {
    this.gl = gl;
    this.vertexBuffer = gl.createBuffer();
    this.normalBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();
    this.numIndices = indices.length;
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    if (uvs) {
      this.uvBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
    }
  };
  
  Model.prototype.draw = function(gl, shaderProgram) {
    // Bind vertex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(shaderProgram.a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderProgram.a_Position);
    
    // Bind normals
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(shaderProgram.a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderProgram.a_Normal);
    
    // Bind texture coordinates if available
    if (this.uvBuffer && shaderProgram.a_TexCoord !== -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
      gl.vertexAttribPointer(shaderProgram.a_TexCoord, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(shaderProgram.a_TexCoord);
    }
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
  };
  