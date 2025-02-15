// camera.js

// Add helper methods to Vector3 if missing
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
    Vector3.prototype.mul = function(s) {
      this.elements[0] *= s;
      this.elements[1] *= s;
      this.elements[2] *= s;
      return this;
    };
  }
  if (!Vector3.prototype.cross) {
    Vector3.prototype.cross = function(v) {
      let a = this.elements, b = v.elements;
      let x = a[1]*b[2] - a[2]*b[1];
      let y = a[2]*b[0] - a[0]*b[2];
      let z = a[0]*b[1] - a[1]*b[0];
      return new Vector3([x, y, z]);
    };
  }
  if (!Vector3.prototype.normalize) {
    Vector3.prototype.normalize = function() {
      let e = this.elements;
      let len = Math.sqrt(e[0]*e[0] + e[1]*e[1] + e[2]*e[2]);
      if(len > 0.00001){
        e[0] /= len; e[1] /= len; e[2] /= len;
      }
      return this;
    };
  }
  
  class Camera {
    constructor(aspectRatio, near, far) {
        this.fov = 60;
        // Start roughly above and behind the world center.
        this.eye = new Vector3([8, 2.0, 25]);
        // Look toward the center of the world (roughly at [8, 2.0, 8]).
        this.at  = new Vector3([8, 2.0, 8]);
        this.up  = new Vector3([0, 1, 0]);
        this.moveSpeed = 0.2;   // adjust as needed
        this.panAngle = 5;      // degrees for key presses
        this.viewMatrix = new Matrix4();
        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(this.fov, aspectRatio, near, far);
        this.updateView();
      }
    
    // Moves the camera forward along its viewing direction.
    moveForward() {
      let f = new Vector3(this.at.elements);
      f.sub(this.eye).normalize().mul(this.moveSpeed);
      this.eye.add(f);
      this.at.add(f);
      this.updateView();
    }
    
    // Moves the camera backwards.
    moveBackwards() {
      let f = new Vector3(this.at.elements);
      f.sub(this.eye).normalize().mul(this.moveSpeed);
      this.eye.sub(f);
      this.at.sub(f);
      this.updateView();
    }
    
    // Strafes left (using the cross product of up and forward).
    moveLeft() {
      let f = new Vector3(this.at.elements);
      f.sub(this.eye).normalize();
      let side = this.up.cross(f).normalize().mul(this.moveSpeed);
      this.eye.add(side);
      this.at.add(side);
      this.updateView();
    }
    
    // Strafes right.
    moveRight() {
      let f = new Vector3(this.at.elements);
      f.sub(this.eye).normalize();
      let side = f.cross(this.up).normalize().mul(this.moveSpeed);
      this.eye.add(side);
      this.at.add(side);
      this.updateView();
    }
    
    // Rotates the camera horizontally by the given angle (in degrees).
    pan(angle) {
      let f = new Vector3(this.at.elements);
      f.sub(this.eye);
      let rotationMatrix = new Matrix4();
      rotationMatrix.setRotate(angle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
      let f_prime = rotationMatrix.multiplyVector3(f);
      this.at = new Vector3([
        this.eye.elements[0] + f_prime.elements[0],
        this.eye.elements[1] + f_prime.elements[1],
        this.eye.elements[2] + f_prime.elements[2]
      ]);
      this.updateView();
    }
    
    panLeft() { this.pan(this.panAngle); }
    panRight() { this.pan(-this.panAngle); }
    
    updateView() {
        this.viewMatrix.setLookAt(
          this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
          this.at.elements[0], this.at.elements[1], this.at.elements[2],
          this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }
  }
  