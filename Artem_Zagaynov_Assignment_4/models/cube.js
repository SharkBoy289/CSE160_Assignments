/* models/cube.js */
// Defines a Cube with 24 vertices (each face has its own vertices for correct normals and UV mapping).
var Cube = function(gl) {
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
  
  var normals = [
    // Front
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    // Back
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    // Top
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    // Bottom
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    // Right
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    // Left
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0
  ];
  
  var uvs = [
    // Front face
    0, 0,
    1, 0,
    1, 1,
    0, 1,
    // Back face
    0, 0,
    1, 0,
    1, 1,
    0, 1,
    // Top face
    0, 0,
    1, 0,
    1, 1,
    0, 1,
    // Bottom face
    0, 0,
    1, 0,
    1, 1,
    0, 1,
    // Right face
    0, 0,
    1, 0,
    1, 1,
    0, 1,
    // Left face
    0, 0,
    1, 0,
    1, 1,
    0, 1
  ];
  
  var indices = [
     0, 1, 2,  0, 2, 3,       // front
     4, 5, 6,  4, 6, 7,       // back
     8, 9,10,  8,10,11,       // top
    12,13,14, 12,14,15,       // bottom
    16,17,18, 16,18,19,       // right
    20,21,22, 20,22,23        // left
  ];
  
  Model.call(this, gl, vertices, normals, indices, uvs);
};
Cube.prototype = Object.create(Model.prototype);
Cube.prototype.constructor = Cube;
