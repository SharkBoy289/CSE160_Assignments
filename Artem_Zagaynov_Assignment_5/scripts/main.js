// scripts/main.js
import * as THREE from '/node_module/three';
import Stats from '/node_modules/three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';
import { World } from './world.js';
import { Player } from './player.js';
import { Physics } from './physics.js';
import { setupUI } from './ui.js';
import { ModelLoader } from './modelLoader.js';
import { Sky } from './sky.js';  // Adjust path if needed
import { NPC } from './npc.js';  

// Setup Stats panel
const stats = new Stats();
document.body.appendChild(stats.dom);

// Renderer setup – clear color is now black
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);  // Changed to black
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Scene setup – set fog to black so it doesn't override our sky
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x87ceeb, 100, 300);


// Create the sky dome first. 
// (Your Sky class should create a dome with radius ~500, use RawShaderMaterial with depthWrite: false and a low renderOrder)
const sky = new Sky(scene);

// Create the rest of your scene objects.
const world = new World();
world.generate();
scene.add(world);

const player = new Player(scene, world);
const physics = new Physics(scene);

// Camera setup
const orbitCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
orbitCamera.position.set(24, 24, 24);
orbitCamera.layers.enable(1);

const controls = new OrbitControls(orbitCamera, renderer.domElement);
controls.update();

const modelLoader = new ModelLoader((models) => {
  player.setTool(models.pickaxe);
});

// Create the sun directional light.
const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(50, 50, 50);
sunLight.castShadow = true;
sunLight.shadow.camera.left = -40;
sunLight.shadow.camera.right = 40;
sunLight.shadow.camera.top = 40;
sunLight.shadow.camera.bottom = -40;
sunLight.shadow.camera.near = 0.1;
sunLight.shadow.camera.far = 200;
sunLight.shadow.bias = -0.0001;
sunLight.shadow.mapSize.set(2048, 2048);
scene.add(sunLight);
scene.add(sunLight.target);

// Pass the sun position to the sky shader (make sure your Sky shader uses a uniform "uSunPos")
sky.skyDome.material.uniforms.uSunPos = { value: sunLight.position.clone() };

// Add a flashlight as a point light, toggled with F.
const flashlight = new THREE.PointLight(0xffffff, 30, 10000);
flashlight.position.copy(player.camera.position);
flashlight.visible = false;
scene.add(flashlight);

document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyF') {
    flashlight.visible = !flashlight.visible;
  }
});

// Optional ambient light.
function setupLights() {
  const ambient = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambient);
}
setupLights();

setupUI(world, player, physics, scene);


const npcs = [];
const numNPCs = 5; // or however many you want

for (let i = 0; i < numNPCs; i++) {
  const npc = new NPC();
  scene.add(npc.mesh);
  npcs.push(npc);
}

// Animation loop
let previousTime = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const currentTime = performance.now();
  const dt = (currentTime - previousTime) / 1000;
  previousTime = currentTime;


  // Update the sky (its uTime uniform and sun blending effects)
  sky.update(dt);

  npcs.forEach(npc => {
    npc.update(dt);
  });

  // Update flashlight to follow the player's camera.
  flashlight.position.copy(player.camera.position);

  // Update world and player if in first-person mode.
  if (player.controls.isLocked) {
    physics.update(dt, player, world);
    player.update(world);
    world.update(player);

    // Adjust sun position relative to the player.
    sunLight.position.copy(player.camera.position).add(new THREE.Vector3(50, 50, 50));
    sunLight.target.position.copy(player.camera.position);
    // Update the sky shader uniform with the new sun position.
    sky.skyDome.material.uniforms.uSunPos.value.copy(sunLight.position);

    // Update orbit camera to track the player.
    orbitCamera.position.copy(player.position).add(new THREE.Vector3(16, 16, 16));
    controls.target.copy(player.position);
  }

  sky.skyDome.position.copy(player.camera.position);


  renderer.render(scene, player.controls.isLocked ? player.camera : orbitCamera);
  stats.update();
}



window.addEventListener('resize', () => {
  orbitCamera.aspect = window.innerWidth / window.innerHeight;
  orbitCamera.updateProjectionMatrix();
  player.camera.aspect = window.innerWidth / window.innerHeight;
  player.camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
