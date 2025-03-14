/* models/cube.js */
// Defines a Cube with 24 vertices (each face gets its own set for proper normals).
var Cube = function(gl) {
  // Vertex positions for each face.
  var vertices = [
    // Front face
    -1, -1,  1,
     1, -1,  1,
     1,  1,  1,
    -1,  1,  1,
    // Back face
    -1, -1, -1,
    -1,  1, -1,
     1,  1, -1,
     1, -1, -1,
    // Top face
    -1,  1, -1,
    -1,  1,  1,
     1,  1,  1,
     1,  1, -1,
    // Bottom face
    -1, -1, -1,
     1, -1, -1,
     1, -1,  1,
    -1, -1,  1,
    // Right face
     1, -1, -1,
     1,  1, -1,
     1,  1,  1,
     1, -1,  1,
    // Left face
    -1, -1, -1,
    -1, -1,  1,
    -1,  1,  1,
    -1,  1, -1
  ];
  
  // Normals for each face.
  var normals = [
    // Front
     0,  0,  1,
     0,  0,  1,
     0,  0,  1,
     0,  0,  1,
    // Back
     0,  0, -1,
     0,  0, -1,
     0,  0, -1,
     0,  0, -1,
    // Top
     0,  1,  0,
     0,  1,  0,
     0,  1,  0,
     0,  1,  0,
    // Bottom
     0, -1,  0,
     0, -1,  0,
     0, -1,  0,
     0, -1,  0,
    // Right
     1,  0,  0,
     1,  0,  0,
     1,  0,  0,
     1,  0,  0,
    // Left
    -1,  0,  0,
    -1,  0,  0,
    -1,  0,  0,
    -1,  0,  0
  ];
  
  // Indices for each face.
  var indices = [
    0, 1, 2,   0, 2, 3,      // Front face
    4, 5, 6,   4, 6, 7,      // Back face
    8, 9,10,   8,10,11,      // Top face
   12,13,14,  12,14,15,      // Bottom face
   16,17,18,  16,18,19,      // Right face
   20,21,22,  20,22,23       // Left face
  ];
  
  // Call the base Model constructor.
  Model.call(this, gl, vertices, normals, indices);
};
Cube.prototype = Object.create(Model.prototype);
Cube.prototype.constructor = Cube;
