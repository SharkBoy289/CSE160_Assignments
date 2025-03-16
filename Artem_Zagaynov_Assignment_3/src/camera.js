// camera.js

class Camera {
  constructor(aspectRatio, near, far) {
    this.fov = 60;
    // The camera's eye represents the player's head.
    // We want the head at y=2.0 so that the foot (eye.y - 1.0) is at y=1.0.
    this.eye = new Vector3([8, 0, 25]);
    this.at  = new Vector3([8, 0, 8]);
    this.up  = new Vector3([0, 1, 0]);

    // Horizontal momentum.
    this.moveVelocity = new Vector3([0, 0, 0]);
    this.acceleration = 30.0; // units per second²
    this.friction = 5.0;      // friction factor

    // Vertical momentum.
    this.verticalVelocity = 0.0;
    this.gravity = -0.015;
    this.jumpStrength = 0.25;
    this.isOnGround = true;

    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();
    this.projectionMatrix.setPerspective(this.fov, aspectRatio, near, far);
    this.updateView();
  }

  // updateMovement: dt in seconds; blocks is array of collidable blocks.
  // We update x and z separately.
  updateMovement(dt, blocks) {
    let forward = new Vector3(this.at.elements);
    forward.sub(this.eye);
    forward.elements[1] = 0;
    forward.normalize();
  
    let left = this.up.cross(forward);
    left.elements[1] = 0;
    left.normalize();
  
    let accel = new Vector3([0, 0, 0]);
    if (keysPressed['w']) accel.add(forward);
    if (keysPressed['s']) accel.add(new Vector3(forward.elements).mul(-1));
    if (keysPressed['a']) accel.add(left);
    if (keysPressed['d']) accel.add(new Vector3(left.elements).mul(-1));
    let aLen = Math.sqrt(accel.elements[0]**2 + accel.elements[1]**2 + accel.elements[2]**2);
    if (aLen > 0.0001) {
      accel.normalize().mul(this.acceleration);
    }
    this.moveVelocity.add(new Vector3([accel.elements[0] * dt, 0, accel.elements[2] * dt]));
    let frictionFactor = Math.max(0, 1 - this.friction * dt);
    this.moveVelocity.elements[0] *= frictionFactor;
    this.moveVelocity.elements[2] *= frictionFactor;
  
    // Use a collision radius (for example, 0.5).
    let cameraRadius = 0.5;
  
    // Save old positions for x and z.
    let oldEyeX = this.eye.elements[0], oldAtX = this.at.elements[0];
    let oldEyeZ = this.eye.elements[2], oldAtZ = this.at.elements[2];
  
    // Update x axis.
    this.eye.elements[0] += this.moveVelocity.elements[0] * dt;
    this.at.elements[0] += this.moveVelocity.elements[0] * dt;
    for (let block of blocks) {
      if (block.position) {
        let blockTop = block.position.elements[1] + 0.5;
        let playerFoot = this.eye.elements[1] - 1.0;
        if (playerFoot < blockTop) {
          if (Math.abs(this.eye.elements[0] - block.position.elements[0]) < (cameraRadius + 0.5) &&
              Math.abs(this.eye.elements[2] - block.position.elements[2]) < 0.5) {
            // On collision, simply revert x movement.
            this.eye.elements[0] = oldEyeX;
            this.at.elements[0] = oldAtX;
            this.moveVelocity.elements[0] = 0;
            break;
          }
        }
      }
    }
  
    // Update z axis.
    this.eye.elements[2] += this.moveVelocity.elements[2] * dt;
    this.at.elements[2] += this.moveVelocity.elements[2] * dt;
    for (let block of blocks) {
      if (block.position) {
        let blockTop = block.position.elements[1] + 0.5;
        let playerFoot = this.eye.elements[1] - 1.0;
        if (playerFoot < blockTop) {
          if (Math.abs(this.eye.elements[2] - block.position.elements[2]) < (cameraRadius + 0.5) &&
              Math.abs(this.eye.elements[0] - block.position.elements[0]) < 0.5) {
            // Revert z movement.
            this.eye.elements[2] = oldEyeZ;
            this.at.elements[2] = oldAtZ;
            this.moveVelocity.elements[2] = 0;
            break;
          }
        }
      }
    }
    this.updateView();
  }
  

  // Rotation.
  pan(angleDeg) {
    let forward = new Vector3(this.at.elements);
    forward.sub(this.eye);
    let rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(angleDeg, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    let newForward = rotationMatrix.multiplyVector3(forward);
    this.at = new Vector3([
      this.eye.elements[0] + newForward.elements[0],
      this.eye.elements[1] + newForward.elements[1],
      this.eye.elements[2] + newForward.elements[2]
    ]);
    this.updateView();
  }
  panLeft() { this.pan(5); }
  panRight() { this.pan(-5); }

  // Tilt the camera up/down by rotating the forward vector about the right axis.
  // Constrain the pitch to between -80 and +80 degrees.
  tilt(angleDeg) {
    // Compute the current forward vector.
    let forward = new Vector3(this.at.elements);
    forward.sub(this.eye);
    let length = Math.sqrt(forward.elements[0]**2 + forward.elements[1]**2 + forward.elements[2]**2);
    forward.normalize();
    
    // Compute current pitch in degrees.
    // pitch = arcsin(forward.y) in degrees.
    let currentPitch = Math.asin(forward.elements[1]) * (180 / Math.PI);
    
    // Compute new pitch.
    let newPitch = currentPitch + angleDeg;
    // Clamp newPitch to [-80, 80].
    newPitch = Math.max(-80, Math.min(80, newPitch));
    
    // Also compute current yaw (angle in XZ plane).
    // yaw = arctan2(forward.z, forward.x) in degrees.
    let currentYaw = Math.atan2(forward.elements[2], forward.elements[0]) * (180 / Math.PI);
    
    // Convert newPitch and currentYaw back to a forward vector.
    let newPitchRad = newPitch * Math.PI / 180;
    let yawRad = currentYaw * Math.PI / 180;
    let newForward = new Vector3([
      Math.cos(newPitchRad) * Math.cos(yawRad),
      Math.sin(newPitchRad),
      Math.cos(newPitchRad) * Math.sin(yawRad)
    ]);
    // Scale newForward by the previous length.
    newForward.mul(length);
    // Update the at vector.
    this.at = new Vector3(this.eye.elements);
    this.at.add(newForward);
    this.updateView();
  }



  jump() {
    if (this.isOnGround) {
      this.verticalVelocity = this.jumpStrength;
      this.isOnGround = false;
    }
  }

  // updateGravity: always active.
  updateGravity() {
    // Always apply gravity.
    this.verticalVelocity += this.gravity;
    this.eye.elements[1] += this.verticalVelocity;
    this.at.elements[1]  += this.verticalVelocity;
    // Compute ground level at the player's current x,z.
    let groundLevel = computeGroundLevel(this.eye.elements[0], this.eye.elements[2]);
    // Desired head height = groundLevel + 1.0.
    let desiredHead = groundLevel + 1.0;
    if (this.eye.elements[1] < desiredHead) {
      let diff = desiredHead - this.eye.elements[1];
      this.eye.elements[1] = desiredHead;
      this.at.elements[1] += diff;
      this.verticalVelocity = 0;
      this.isOnGround = true;
    } else {
      this.isOnGround = false;
    }
    this.updateView();
  }

  updateView() {
    this.viewMatrix.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0],  this.at.elements[1],  this.at.elements[2],
      this.up.elements[0],  this.up.elements[1],  this.up.elements[2]
    );
  }
}
