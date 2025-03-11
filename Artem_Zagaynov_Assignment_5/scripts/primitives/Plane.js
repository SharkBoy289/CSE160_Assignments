// scripts/primitives/Plane.js
import * as THREE from 'three';
import { VertexShader, FragmentShader } from "../shaders/Normal.js";

export default class Plane extends THREE.Mesh {
  constructor(widthSegments = 1, heightSegments = 1) {
    // Create a plane geometry that spans 1 unit by 1 unit
    const geometry = new THREE.PlaneGeometry(1, 1, widthSegments, heightSegments);
    // Create a ShaderMaterial using your vertex/fragment code.
    const material = new THREE.ShaderMaterial({
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 } // if your shader uses uTime
      }
    });
    super(geometry, material);
  }
}
