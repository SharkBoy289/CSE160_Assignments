// quad.js

class Quad {
  constructor() {
    this.modelMatrix = new Matrix4();
    this.modelMatrix.setIdentity();
    this.texWeight = 0.0;

    // Positions in XZ plane, y=0
    // (x, y, z), (r, g, b, a), (u, v)
    this.vertices = new Float32Array([
      // Triangle 1
      -0.5, 0, -0.5,   1,1,1,1,   0,0,
       0.5, 0, -0.5,   1,1,1,1,   1,0,
       0.5, 0,  0.5,   1,1,1,1,   1,1,
      // Triangle 2
      -0.5, 0, -0.5,   1,1,1,1,   0,0,
       0.5, 0,  0.5,   1,1,1,1,   1,1,
      -0.5, 0,  0.5,   1,1,1,1,   0,1
    ]);
    this.buffer = null;
  }

  translate(x, y, z) { this.modelMatrix.translate(x, y, z); }
  scale(x, y, z)     { this.modelMatrix.scale(x, y, z); }
  rotate(angle, rx, ry, rz) { this.modelMatrix.rotate(angle, rx, ry, rz); }

  initBuffer() {
    if (this.buffer) return;
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
  }

  drawColored(color) {
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

    // Set matrix, color, etc.
    gl.uniformMatrix4fv(gl.u_ModelMatrixLoc, false, this.modelMatrix.elements);
    gl.uniform1f(gl.u_texColorWeightLoc, this.texWeight);
    gl.uniform4fv(gl.u_SolidColorLoc, new Float32Array(color));

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
