/* camera.js */
var Camera = function() {
  // Initial eye position, looking at the origin with up along Y
  this.eye = [0, 3, 8];
  this.center = [0, 0, 0];
  this.up = [0, 1, 0];
  this.viewMatrix = new Matrix4();
};

Camera.prototype.update = function() {
  this.viewMatrix.setLookAt(
    this.eye[0], this.eye[1], this.eye[2],
    this.center[0], this.center[1], this.center[2],
    this.up[0], this.up[1], this.up[2]
  );
};

Camera.prototype.getViewMatrix = function() {
  this.update();
  return this.viewMatrix;
};

Camera.prototype.handleKeyDown = function(event) {
  var step = 0.5;
  switch(event.key) {
    case 'ArrowUp':
      this.eye[2] -= step;
      break;
    case 'ArrowDown':
      this.eye[2] += step;
      break;
    case 'ArrowLeft':
      this.eye[0] -= step;
      break;
    case 'ArrowRight':
      this.eye[0] += step;
      break;
  }
};
