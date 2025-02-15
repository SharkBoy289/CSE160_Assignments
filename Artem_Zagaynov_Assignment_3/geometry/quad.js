// In ../geometry/quad.js

class Quad {
    constructor() {
      // Create a model matrix for transformations.
      this.modelMatrix = new Matrix4();
      this.modelMatrix.setIdentity();
      // Define a quad in the XZ plane (y = 0) using two triangles.
      // Each vertex has: position (x,y,z), color (r,g,b,a), and UV (u,v).
      this.vertices = new Float32Array([
        // Triangle 1
        -0.5, 0, -0.5,   1,1,1,1,    0,0,
         0.5, 0, -0.5,   1,1,1,1,    1,0,
         0.5, 0,  0.5,   1,1,1,1,    1,1,
        // Triangle 2
        -0.5, 0, -0.5,   1,1,1,1,    0,0,
         0.5, 0,  0.5,   1,1,1,1,    1,1,
        -0.5, 0,  0.5,   1,1,1,1,    0,1,
      ]);
      this.texWeight = 0.0; // Default to solid color.
    }
    
    translate(x, y, z) {
      this.modelMatrix.translate(x, y, z);
    }
    
    scale(x, y, z) {
      this.modelMatrix.scale(x, y, z);
    }
    
    rotate(angle, x, y, z) {
      this.modelMatrix.rotate(angle, x, y, z);
    }
    
    // Draw the quad as a solid-colored quad.
    drawColored(color) {
      drawColoredQuad(this.modelMatrix, color, this.vertices);
    }
  }
  

  function drawColoredQuad(modelMatrix, color, vertices) {
    // Create and bind a temporary buffer for the quad.
    var quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    let FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;
    gl.vertexAttribPointer(gl.a_Position, 3, gl.FLOAT, false, 8 * FLOAT_SIZE, 0);
    gl.enableVertexAttribArray(gl.a_Position);
    gl.vertexAttribPointer(gl.a_Color, 4, gl.FLOAT, false, 8 * FLOAT_SIZE, 3 * FLOAT_SIZE);
    gl.enableVertexAttribArray(gl.a_Color);
    gl.vertexAttribPointer(gl.a_UV, 2, gl.FLOAT, false, 8 * FLOAT_SIZE, 7 * FLOAT_SIZE);
    gl.enableVertexAttribArray(gl.a_UV);
    
    gl.uniformMatrix4fv(gl.u_ModelMatrixLoc, false, modelMatrix.elements);
    gl.uniform1f(gl.u_texColorWeightLoc, 0.0); // Use solid color.
    gl.uniform4fv(gl.u_SolidColorLoc, new Float32Array(color));
    
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 8);
    gl.deleteBuffer(quadBuffer);
  }
  