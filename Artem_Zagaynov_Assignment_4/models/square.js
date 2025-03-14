// square.js

class Square {
  constructor() {
    this.modelMatrix = new Matrix4();
    this.modelMatrix.setIdentity();
    // (x, y, z), (r, g, b, a), (u, v)
    // Two triangles forming a square in the XY plane
    this.vertices = new Float32Array([
      // Triangle 1
      -0.5,  0.5, 0.0,   1,0,0,1,   0,1,
      -0.5, -0.5, 0.0,   0,1,0,1,   0,0,
       0.5, -0.5, 0.0,   0,0,1,1,   1,0,
      // Triangle 2
      -0.5,  0.5, 0.0,   1,0,0,1,   0,1,
       0.5, -0.5, 0.0,   0,0,1,1,   1,0,
       0.5,  0.5, 0.0,   0,1,0,1,   1,1
    ]);
    this.buffer = null;
  }

  translate(x, y, z) { this.modelMatrix.translate(x, y, z); }
  scale(x, y, z)     { this.modelMatrix.scale(x, y, z); }
  rotate(angle, x, y, z) { this.modelMatrix.rotate(angle, x, y, z); }

  initBuffer() {
    if (this.buffer) return;
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
  }

  draw() {
    this.initBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    let FSIZE = Float32Array.BYTES_PER_ELEMENT;
    // position
    gl.vertexAttribPointer(gl.a_Position, 3, gl.FLOAT, false, 9*FSIZE, 0);
    gl.enableVertexAttribArray(gl.a_Position);
    // color
    gl.vertexAttribPointer(gl.a_Color, 4, gl.FLOAT, false, 9*FSIZE, 3*FSIZE);
    gl.enableVertexAttribArray(gl.a_Color);
    // uv
    gl.vertexAttribPointer(gl.a_UV, 2, gl.FLOAT, false, 9*FSIZE, 7*FSIZE);
    gl.enableVertexAttribArray(gl.a_UV);

    // Uniforms
    gl.uniformMatrix4fv(gl.u_ModelMatrixLoc, false, this.modelMatrix.elements);
    gl.uniform1f(gl.u_texColorWeightLoc, 0.0); // no texture for a plain square
    gl.uniform4fv(gl.u_SolidColorLoc, [1,1,1,1]);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
