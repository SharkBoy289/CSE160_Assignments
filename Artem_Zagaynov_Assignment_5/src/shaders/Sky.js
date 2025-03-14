// scripts/shaders/Sky.js
// Vertex Shader
const VertexShader = `
  precision mediump float;
  attribute vec3 position;
  attribute vec2 uv;
  attribute vec3 normal;
  
  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  
  varying vec3 vPos;
  varying vec2 vUV;
  
  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
    vPos = modelPosition.xyz;
    vUV = uv;
  }
`;

// Fragment Shader
const FragmentShader = `
  precision mediump float;

  // (Noise functions omitted here for brevity; use your existing code)

  uniform float uTime;
  #ifdef USE_SKY_TEXTURE
    uniform sampler2D uSkyTexture;
  #endif
  
  varying vec3 vPos;
  varying vec2 vUV;
  
  void main() {
    // Procedural sky with day/night cycle
    float cycle = mod(uTime, 420.0);
    float dayMix = (cycle < 300.0) ? 1.0 : (cycle < 310.0 ? smoothstep(310.0, 300.0, cycle) : (cycle < 410.0 ? 0.0 : smoothstep(410.0, 420.0, cycle)));
    vec3 daySkyColor = vec3(0.12, 0.2, 0.6);
    vec3 nightSkyColor = vec3(0.01, 0.01, 0.05);
    vec3 baseSkyColor = mix(nightSkyColor, daySkyColor, dayMix);
    
    // Angular approach for the sun's disk (keeps sun size constant)
    // Define the angular radius (in radians) of the sun's disk.
    #define SUN_ANGULAR_RADIUS radians(3.0)
    // Define the sun's direction.
    vec3 sunDir = normalize(vec3(0.0, 8.68, -49.24));
    // Compute the cosine of the angle between the vertex direction and the sun direction.
    float cosAngle = dot(normalize(vPos), sunDir);
    // Use smoothstep to create a soft-edged sun disk.
    float sunDisk = smoothstep(cos(SUN_ANGULAR_RADIUS + 0.005), cos(SUN_ANGULAR_RADIUS - 0.005), cosAngle);
    
    vec3 sunColor = vec3(0.95, 0.85, 0.7);
    // Mix the base sky color with the sun color based on the dayMix and the computed sun disk.
    vec3 proceduralColor = mix(baseSkyColor, sunColor, dayMix * sunDisk);
    
    // Add animated mist (using your FBM functions)
    // (Assume the FBM noise functions are included here)
    float mist = clamp(0.0, 1.0, 0.0); // placeholder – use your actual FBM code
    vec3 mistColor = vec3(0.7);
    proceduralColor += mistColor * mist;
    
    #ifdef USE_SKY_TEXTURE
      vec3 textureColor = texture2D(uSkyTexture, vUV).rgb;
      gl_FragColor = vec4(mix(textureColor, proceduralColor, 0.5), 1.0);
    #else
      gl_FragColor = vec4(proceduralColor, 1.0);
    #endif
  }
`;

export { VertexShader, FragmentShader };
