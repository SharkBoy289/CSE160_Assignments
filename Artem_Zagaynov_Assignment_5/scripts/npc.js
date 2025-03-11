import * as THREE from 'three';

export class NPC {
  constructor() {
    this.radius = 1;  // Adjust the radius of the NPC sphere
    const geometry = new THREE.SphereGeometry(this.radius, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    // Set an initial random position (for example, within a 20x20 area)
    this.mesh.position.set(
      Math.random() * 20 - 10,
      this.radius,
      Math.random() * 20 - 10
    );
    // Set an initial random horizontal direction for movement
    this.velocity = new THREE.Vector3(
      Math.random() - 0.5,
      0,
      Math.random() - 0.5
    ).normalize();
    this.speed = 2; // Movement speed
  }

  update(dt) {
    // Calculate displacement
    const displacement = this.velocity.clone().multiplyScalar(this.speed * dt);
    this.mesh.position.add(displacement);

    // Simulate rolling:
    // Roll angle in radians = distance traveled / radius
    const rollAngle = displacement.length() / this.radius;
    // The rolling axis is perpendicular to the movement direction (cross with the up vector)
    const rollAxis = new THREE.Vector3().crossVectors(this.velocity, new THREE.Vector3(0, 1, 0)).normalize();
    this.mesh.rotateOnAxis(rollAxis, rollAngle);

    // Simple boundary check: if the NPC moves outside a 50x50 area, reverse its horizontal direction.
    if (this.mesh.position.x > 50 || this.mesh.position.x < -50) {
      this.velocity.x = -this.velocity.x;
    }
    if (this.mesh.position.z > 50 || this.mesh.position.z < -50) {
      this.velocity.z = -this.velocity.z;
    }

    // Add a small random perturbation to the velocity to vary the movement over time.
    this.velocity.x += (Math.random() - 0.5) * 0.1;
    this.velocity.z += (Math.random() - 0.5) * 0.1;
    this.velocity.normalize();
  }
}
