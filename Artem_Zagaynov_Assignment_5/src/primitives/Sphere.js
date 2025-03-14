// scripts/primitives/Sphere.js
import * as THREE from 'three';
import { VertexShader, FragmentShader } from "../shaders/Normal.js";

export default class Sphere extends THREE.Mesh {
  constructor(radius = 0.5, widthSegments = 32, heightSegments = 16) {
    // Create a sphere geometry with the given parameters.
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    // Use a ShaderMaterial with your provided shaders.
    const material = new THREE.ShaderMaterial({
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      side: THREE.BackSide, // For a sky dome, use the back side.
      uniforms: {
        uTime: { value: 0 }
      }
    });
    super(geometry, material);
  }
}
