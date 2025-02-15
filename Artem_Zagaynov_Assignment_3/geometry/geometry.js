// geometry.js

// Returns the cube’s vertex positions.
function createCubeVertices() {
    return new Float32Array([
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
  }
  
// Returns the cube’s normals (one normal per vertex).
function createCubeNormals() {
  return new Float32Array([
    // Front face normals (0,0,1)
    0, 0, 1,  0, 0, 1,  0, 0, 1,
    0, 0, 1,  0, 0, 1,  0, 0, 1,
    // Back face normals (0,0,-1)
    0, 0, -1,  0, 0, -1,  0, 0, -1,
    0, 0, -1,  0, 0, -1,  0, 0, -1,
    // Top face normals (0,1,0)
    0, 1, 0,  0, 1, 0,  0, 1, 0,
    0, 1, 0,  0, 1, 0,  0, 1, 0,
    // Bottom face normals (0,-1,0)
    0, -1, 0,  0, -1, 0,  0, -1, 0,
    0, -1, 0,  0, -1, 0,  0, -1, 0,
    // Right face normals (1,0,0)
    1, 0, 0,  1, 0, 0,  1, 0, 0,
    1, 0, 0,  1, 0, 0,  1, 0, 0,
    // Left face normals (-1,0,0)
    -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
    -1, 0, 0,  -1, 0, 0,  -1, 0, 0
  ]);
}

// Computes per-vertex colors from the normals using color = normal * 0.5 + 0.5.
function createCubeColorsFromNormals() {
  var normals = createCubeNormals();
  var colors = [];
  for (var i = 0; i < normals.length / 3; i++) {
    var nx = normals[i * 3];
    var ny = normals[i * 3 + 1];
    var nz = normals[i * 3 + 2];
    colors.push(nx * 0.5 + 0.5, ny * 0.5 + 0.5, nz * 0.5 + 0.5, 1.0);
  }
  return new Float32Array(colors);
}

// Returns vertices for a simple 2D triangle (embedded in 3D space).
function createTriangleVertices() {
  return new Float32Array([
    0.0,  0.5, 0.0,
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0
  ]);
}

class Geometry {
  constructor() {
    // Initialize vertices to an empty Float32Array.
    this.vertices = new Float32Array();
    // Create a model matrix for transformation.
    this.modelMatrix = new Matrix4();
  }
}