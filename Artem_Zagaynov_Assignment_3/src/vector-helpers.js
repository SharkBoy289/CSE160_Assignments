// vector-helpers.js

// Add helper methods to Vector3 if they don't already exist.

if (!Vector3.prototype.set) {
    Vector3.prototype.set = function(v) {
      this.elements[0] = v.elements[0];
      this.elements[1] = v.elements[1];
      this.elements[2] = v.elements[2];
      return this;
    };
  }
  
  if (!Vector3.prototype.sub) {
    Vector3.prototype.sub = function(v) {
      this.elements[0] -= v.elements[0];
      this.elements[1] -= v.elements[1];
      this.elements[2] -= v.elements[2];
      return this;
    };
  }
  
  if (!Vector3.prototype.add) {
    Vector3.prototype.add = function(v) {
      this.elements[0] += v.elements[0];
      this.elements[1] += v.elements[1];
      this.elements[2] += v.elements[2];
      return this;
    };
  }
  
  if (!Vector3.prototype.mul) {
    Vector3.prototype.mul = function(scalar) {
      this.elements[0] *= scalar;
      this.elements[1] *= scalar;
      this.elements[2] *= scalar;
      return this;
    };
  }
  
  if (!Vector3.prototype.cross) {
    Vector3.prototype.cross = function(v) {
      var a = this.elements, b = v.elements;
      var x = a[1] * b[2] - a[2] * b[1];
      var y = a[2] * b[0] - a[0] * b[2];
      var z = a[0] * b[1] - a[1] * b[0];
      return new Vector3([x, y, z]);
    };
  }
  