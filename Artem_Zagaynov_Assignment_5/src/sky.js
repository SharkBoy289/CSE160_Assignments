import * as THREE from 'three';
import Sphere from "./primitives/sphere.js";
import { VertexShader, FragmentShader } from "./shaders/Sky.js";

export class Sky {
  constructor(scene) {
    // Create a large sky dome
    this.skyDome = new Sphere(500, 32, 16);
    
    // Replace the material with a RawShaderMaterial so no extra chunks are injected.
    this.skyDome.material = new THREE.RawShaderMaterial({
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      side: THREE.BackSide,
      uniforms: {
        uTime: { value: 0 }
        // Add additional uniforms (such as uSkyTexture) if needed.
      },
      depthWrite: false // Ensure the sky doesn't write to depth, so it appears behind everything.
    });
    
    // Render the sky first (low render order) so that it serves as a background.
    this.skyDome.renderOrder = -100;
    
    // Add the sky dome to the scene.
    scene.add(this.skyDome);
  }
  
  update(dt) {
    // Update the time uniform for your procedural effects.
    this.skyDome.material.uniforms.uTime.value += dt;
  }
}
