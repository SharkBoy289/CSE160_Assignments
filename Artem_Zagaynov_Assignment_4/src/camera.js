/* camera.js */
// A simple Camera class that supports view updates and basic pan/tilt/jump controls.
var Camera = function(aspect, near, far) {
  this.eye = new Vector3([8, 2.0, 25]);
  this.at = new Vector3([8, 2.0, 8]);
  this.up = new Vector3([0, 1, 0]);
  this.viewMatrix = new Matrix4();
  this.projectionMatrix = new Matrix4();
  this.projectionMatrix.setPerspective(45, aspect, near, far);
  
  // For movement
  this.verticalVelocity = 0;
  this.gravity = -0.02;
  this.isOnGround = false;
};

Camera.prototype.updateView = function() {
  this.viewMatrix.setLookAt(
    this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
    this.at.elements[0], this.at.elements[1], this.at.elements[2],
    this.up.elements[0], this.up.elements[1], this.up.elements[2]
  );
};

Camera.prototype.pan = function(angleDegrees) {
  // Rotate the eye position around the at point about the y-axis.
  var angle = angleDegrees * Math.PI / 180;
  var dirX = this.eye.elements[0] - this.at.elements[0];
  var dirZ = this.eye.elements[2] - this.at.elements[2];
  var cosA = Math.cos(angle);
  var sinA = Math.sin(angle);
  var newX = dirX * cosA - dirZ * sinA;
  var newZ = dirX * sinA + dirZ * cosA;
  this.eye.elements[0] = this.at.elements[0] + newX;
  this.eye.elements[2] = this.at.elements[2] + newZ;
  this.updateView();
};

Camera.prototype.tilt = function(angleDegrees) {
  // Simple tilt: adjust the eye's y coordinate.
  var delta = angleDegrees * 0.05;
  this.eye.elements[1] += delta;
  this.updateView();
};

Camera.prototype.jump = function() {
  if(this.isOnGround) {
    this.verticalVelocity = 0.5;
    this.isOnGround = false;
  }
};

Camera.prototype.updateMovement = function(dt, blocks) {
  // (A placeholder for collision handling and movement updates.)
  // For now, we leave this empty.
};
