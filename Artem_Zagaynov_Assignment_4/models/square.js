/* models/sphere.js */
// Generates a sphere mesh with latitude/longitude subdivisions and computes UV coordinates.
var Sphere = function(gl, radius, latBands, longBands) {
  var vertices = [];
  var normals = [];
  var uvs = [];
  var indices = [];
  
  for (var latNumber = 0; latNumber <= latBands; latNumber++) {
    var theta = latNumber * Math.PI / latBands;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);
    
    for (var longNumber = 0; longNumber <= longBands; longNumber++) {
      var phi = longNumber * 2 * Math.PI / longBands;
      var sinPhi = Math.sin(phi);
      var cosPhi = Math.cos(phi);
      
      var x = cosPhi * sinTheta;
      var y = cosTheta;
      var z = sinPhi * sinTheta;
      
      normals.push(x, y, z);
      vertices.push(radius * x, radius * y, radius * z);
      var u = longNumber / longBands;
      var v = latNumber / latBands;
      uvs.push(u, v);
    }
  }
  
  for (var latNumber = 0; latNumber < latBands; latNumber++) {
    for (var longNumber = 0; longNumber < longBands; longNumber++) {
      var first = (latNumber * (longBands + 1)) + longNumber;
      var second = first + longBands + 1;
      
      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }
  
  Model.call(this, gl, vertices, normals, indices, uvs);
};
Sphere.prototype = Object.create(Model.prototype);
Sphere.prototype.constructor = Sphere;
