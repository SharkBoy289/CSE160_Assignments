/* models/model.js */
// Base Model class for creating and drawing 3D meshes.
var Model = function(gl, vertices, normals, indices) {
    this.gl = gl;
    this.vertexBuffer = gl.createBuffer();
    this.normalBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();
    this.numIndices = indices.length;
    
    // Upload vertex positions.
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    // Upload normals.
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    
    // Upload indices.
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  };
  
  Model.prototype.draw = function(gl, shaderProgram) {
    // Bind and set vertex attribute.
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(shaderProgram.a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderProgram.a_Position);
    
    // Bind and set normal attribute.
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(shaderProgram.a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderProgram.a_Normal);
    
    // Bind index buffer and draw elements.
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
  };
  