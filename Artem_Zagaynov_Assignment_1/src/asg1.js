//
// asg1.js
//

//========== Shaders ==========//
const VSHADER_SOURCE = `
  precision mediump float;
  attribute vec2 a_Position;
  
  uniform float u_PointSize;  // For points (and optionally circles)
  
  void main() {
    gl_Position = vec4(a_Position, 0.0, 1.0);
    gl_PointSize = u_PointSize;
  }
`;

const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  
  void main() {
    gl_FragColor = u_FragColor; 
  }
`;

//========== Global Variables ==========//
let gl;
let g_shapes = []; // This holds all shapes (points, triangles, circles) that we need to draw
let g_selectedShape = 'point'; // 'point', 'triangle', 'circle'
let g_size = 10.0;
let g_segments = 12;
let g_color = [0.0, 0.0, 0.0, 1.0]; // RGBA
let a_Position;
let u_FragColor;
let u_PointSize;

// A simple class for storing and drawing shapes
class Shape {
  constructor(type, x, y, size, color, segments) {
    // type: 'point', 'triangle', 'circle'
    this.type = type;
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;       // [r, g, b, a]
    this.segments = segments; // for circles
  }

  render() {
    // Set the uniform for the color
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    // Set the uniform for point size
    gl.uniform1f(u_PointSize, this.size);

    if (this.type === 'point') {
      drawPoint(this.x, this.y);
    }
    else if (this.type === 'triangle') {
      // We draw a small equilateral triangle around (x,y), sized by `this.size`
      drawTriangle(this.x, this.y, this.size);
    }
    else if (this.type === 'circle') {
      drawCircle(this.x, this.y, this.size, this.segments);
    }
  }
}

//========== Main Entry Point ==========//
function main() {
  // 1. Get canvas & WebGL context
  const canvas = document.getElementById('webgl');
  gl = getWebGLContext(canvas, false); // from cuon-utils.js
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // 2. Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }

  // 3. Keep the shader variable locations
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');

  // 4. Register Event Handlers
  canvas.onmousedown = ev => handleMouseDown(ev, canvas);
  canvas.onmousemove = ev => handleMouseMove(ev, canvas);

  
  // Sliders: track them so we can update global variables
  document.getElementById('redRange').oninput = updateColorSliders;
  document.getElementById('greenRange').oninput = updateColorSliders;
  document.getElementById('blueRange').oninput = updateColorSliders;
  document.getElementById('alphaRange').oninput = updateColorSliders;

  document.getElementById('sizeRange').oninput = updateSizeSlider;
  document.getElementById('segmentRange').oninput = updateSegmentSlider;

  // 5. Configure WebGL
  gl.clearColor(1.0, 1.0, 1.0, 1.0); // white background
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Initial slider updates:
  updateColorSliders();
  updateSizeSlider();
  updateSegmentSlider();
}

//========== Event Handler Functions ==========//
function handleMouseDown(ev, canvas) {
  // figure out x,y in clip coordinates:
  let [x, y] = convertToGLCoord(ev, canvas);

  if (ev.buttons === 1) { // left mouse only
    addShape(x, y);
  }
}

function handleMouseMove(ev, canvas) {
  if (ev.buttons === 1) { // left mouse is held down
    let [x, y] = convertToGLCoord(ev, canvas);
    addShape(x, y);
  }
}

function addShape(x, y) {
  // create a new shape based on the current g_selectedShape:
  let shape = new Shape(g_selectedShape, x, y, g_size, [...g_color], g_segments);
  // push it into g_shapes
  g_shapes.push(shape);
  // re-render
  renderAllShapes();
}

function convertToGLCoord(ev, canvas) {
  // returns [x, y] in [-1, 1] x [-1, 1]
  let rect = ev.target.getBoundingClientRect();
  let x = ev.clientX - rect.left;
  let y = ev.clientY - rect.top;

  // convert range from pixel space to clip space
  let halfW = canvas.width / 2;
  let halfH = canvas.height / 2;

  let coordX = (x - halfW) / halfW;
  let coordY = (halfH - y) / halfH;

  return [coordX, coordY];
}

//========== Sliders & Buttons ==========//
function updateColorSliders() {
  let r = parseFloat(document.getElementById('redRange').value);
  let g = parseFloat(document.getElementById('greenRange').value);
  let b = parseFloat(document.getElementById('blueRange').value);
  let a = parseFloat(document.getElementById('alphaRange').value);

  g_color = [r, g, b, a];

  // Show numeric values next to the sliders
  document.getElementById('redVal').innerText = r.toFixed(2);
  document.getElementById('greenVal').innerText = g.toFixed(2);
  document.getElementById('blueVal').innerText = b.toFixed(2);
  document.getElementById('alphaVal').innerText = a.toFixed(2);
}

function updateSizeSlider() {
  let val = parseFloat(document.getElementById('sizeRange').value);
  g_size = val;
  document.getElementById('sizeVal').innerText = val;
}

function updateSegmentSlider() {
  let val = parseInt(document.getElementById('segmentRange').value);
  g_segments = val;
  document.getElementById('segmentVal').innerText = val;
}

// Called by HTML buttons
function setShape(shapeType) {
  g_selectedShape = shapeType;
}

// Clear everything
function clearCanvas() {
  g_shapes = [];
  renderAllShapes();
}


function drawLilyPad(cx, cy, r, segments, color1, color2) {
  for (let i = 0; i < segments; i++) {
    // angle for the current wedge
    const angle1 = (i / segments) * 2 * Math.PI;
    const angle2 = ((i + 1) / segments) * 2 * Math.PI;

    // pick color depending on i being even/odd
    const c = i % 2 === 0 ? color1 : color2;

    // center point: (cx, cy)
    // wedge points: (cx + r*cos(angle1), cy + r*sin(angle1))
    //              (cx + r*cos(angle2), cy + r*sin(angle2))
    drawTriangle(
      cx,
      cy,
      cx + r * Math.cos(angle1),
      cy + r * Math.sin(angle1),
      cx + r * Math.cos(angle2),
      cy + r * Math.sin(angle2),
      c
    );
  }
}


function drawEllipseFan(cx, cy, rx, ry, segments, color) {
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);

  const angleStep = (2 * Math.PI) / segments;
  const vertices = [];

  // Center of the ellipse fan
  vertices.push(cx, cy);

  // Points around the ellipse perimeter
  for (let i = 0; i <= segments; i++) {
    const angle = i * angleStep;
    const xPos = cx + rx * Math.cos(angle);
    const yPos = cy + ry * Math.sin(angle);
    vertices.push(xPos, yPos);
  }

  // Create & bind buffer
  const vertArray = new Float32Array(vertices);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertArray, gl.STATIC_DRAW);

  // Point a_Position to the buffer data
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // Draw
  gl.drawArrays(gl.TRIANGLE_FAN, 0, segments + 2);
}

// koi fish
function drawMyPicture() {
  // Clear the canvas to start fresh
  gl.clear(gl.COLOR_BUFFER_BIT);


  function drawTriangle(x1, y1, x2, y2, x3, y3, color) {
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);

    const vertices = new Float32Array([x1, y1, x2, y2, x3, y3]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }


  function drawLilyPad(cx, cy, r, segments, color1, color2) {
    for (let i = 0; i < segments; i++) {
      // angle for the current wedge
      const angle1 = (i / segments) * 2 * Math.PI;
      const angle2 = ((i + 1) / segments) * 2 * Math.PI;

      // pick color depending on i being even/odd
      const c = i % 2 === 0 ? color1 : color2;

      // center point: (cx, cy)
      // wedge points: (cx + r*cos(angle1), cy + r*sin(angle1))
      //              (cx + r*cos(angle2), cy + r*sin(angle2))
      drawTriangle(
        cx,
        cy,
        cx + r * Math.cos(angle1),
        cy + r * Math.sin(angle1),
        cx + r * Math.cos(angle2),
        cy + r * Math.sin(angle2),
        c
      );
    }
  }

  //================= Define Colors =================//
  const bodyColorPattern    = [1.0, 0.25, 0.0, 0.9];  // gold-orange
  const rippleColor_2       = [0.0, 0.5, 0.4, 0.2];  // lighter orange
  const eyeWhite            = [1.0, 1.0, 1.0, 1.0];   // white
  const eyeBlack            = [0.0, 0.0, 0.0, 1.0];   // black
  const seaColor            = [0.0, 0.3, 0.2, 1.0];   // greenish pond
  const rippleColor         = [0.0, 0.5, 0.4, 0.4];   // translucent teal
  const lilypadDark         = [0.0, 0.4, 0.0, 1.0];   // darker green
  const lilypadLight        = [0.0, 0.8, 0.0, 1.0];   // lighter green

  //================= Background Pond =================//
  // (Just a big ellipse or circle to color the pond)
  drawEllipseFan(
    0.0, 0.0,
    1.0, 1.0,
    32,
    seaColor
  );

  //================= Ripples =================//
  drawEllipseFan(0.0, 0.0, 0.8, 0.8, 32, rippleColor);    // 1st ripple
  drawEllipseFan(-0.3, 0.0, 0.2, 0.2, 32, rippleColor_2);    // 2nd ripple
  drawEllipseFan(-0.3, 0.0, 0.18, 0.18, 32, rippleColor);    // 3rd ripple
  drawEllipseFan(-0.3, 0.0, 0.2, 0.2, 32, rippleColor_2);    // 2nd ripple
  drawEllipseFan(-0.3, 0.0, 0.18, 0.18, 32, rippleColor);    // 3rd ripple
  drawEllipseFan(-0.3, 0.0, 0.12, 0.12, 32, rippleColor_2);    // 2nd ripple
  drawEllipseFan(-0.3, 0.0, 0.11, 0.11, 32, rippleColor);    // 3rd ripple
  drawEllipseFan(-0.3, 0.0, 0.08, 0.08, 32, rippleColor_2);    // 2nd ripple
  drawEllipseFan(-0.3, 0.0, 0.07, 0.07, 32, rippleColor);    // 3rd ripple

  //================= Koi Fish Body =================//
  // Original shapes
  // Body
  drawEllipseFan(
    -0.1, 0.03,   
    0.2,  0.1,   
    16,    
    eyeWhite
  );

  // Body pattern 1
  drawEllipseFan(
    -0.15, 0.03,  
    0.14,  0.08,  
    16,         
    bodyColorPattern
  );



  //mustache
  drawEllipseFan(
    -0.29, 0.03,   
    0.006,  0.12,  
    3,         
    eyeWhite
  );

  // Body_2
  drawEllipseFan(
    0.1, 0.1,    
    0.09, 0.09,  
    5,
    eyeWhite
  );


  // Body_2 pattern 1
  drawEllipseFan(
    0.1, 0.1,    
    0.07, 0.07,   
    5,
    bodyColorPattern
  );  

  // Tail
  drawEllipseFan(
    0.2, 0.2,
    0.15, 0.15,
    3,
    eyeWhite
  );


  //pattern 2
  drawEllipseFan(
    0.03, 0.02,
    0.04, 0.04,
    5,
    bodyColorPattern
  );

  // Top fin
  drawEllipseFan(
    -0.1, 0.18,
    0.05, 0.1,
    4,
    eyeWhite
  );

  // Bottom fin
  drawEllipseFan(
    -0.05, -0.07,
    0.1, 0.05,
    4,
    eyeWhite
  );

  //vertical fin 1
  drawEllipseFan(
    -0.06, 0.03,
    0.12, 0.03,
    4,
    eyeWhite
  );  

  //vertical fin 2
  drawEllipseFan(
    0.06, 0.07,
    0.03, 0.05,
    5,
    eyeWhite
  );  



  //================= Koi Fish Eyes =================//
  // Eye #1 (White sclera + black pupil)
  drawEllipseFan(-0.22, 0.1, 0.03, 0.02, 8, eyeWhite);
  drawEllipseFan(-0.22, 0.1, 0.02, 0.01, 6, eyeBlack); 

  // Eye #2 (White sclera + black pupil)
  drawEllipseFan(-0.22, -0.05, 0.03, 0.02, 8, eyeWhite);   
  drawEllipseFan(-0.22, -0.05, 0.02, 0.01, 6, eyeBlack); 

  //================= Lily Pads =================//
  drawLilyPad(-0.34, 0.5, 0.12, 16, lilypadDark, lilypadLight);
  drawLilyPad(0.35, -0.4, 0.1, 16, lilypadDark, lilypadLight);
}

//========= Rendering =========//
function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  // For each shape in the list, call .render()
  for (let i = 0; i < g_shapes.length; i++) {
    g_shapes[i].render();
  }
}

function drawPoint(x, y) {
  // We do a single-vertex buffer
  const xy = new Float32Array([x, y]);
  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, xy, gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.POINTS, 0, 1);
}

function drawTriangle(x, y, size) {

  let halfSize = size / 200.0; 

  let x1 = x;
  let y1 = y + halfSize;
  let x2 = x - halfSize * 0.866; // sin(60°)=0.866
  let y2 = y - halfSize * 0.5;
  let x3 = x + halfSize * 0.866;
  let y3 = y - halfSize * 0.5;

  const vertices = new Float32Array([
    x1, y1,
    x2, y2,
    x3, y3
  ]);

  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function drawCircle(x, y, size, segments) {
  // center at (x,y), radius = size/200
  let r = size / 200.0;
  let angleStep = (2 * Math.PI) / segments;
  
  let circleVerts = [];
  // push center
  circleVerts.push(x);
  circleVerts.push(y);

  for (let i = 0; i <= segments; i++) {
    let angle = i * angleStep;
    let cx = x + r * Math.cos(angle);
    let cy = y + r * Math.sin(angle);
    circleVerts.push(cx);
    circleVerts.push(cy);
  }

  let circleArray = new Float32Array(circleVerts);

  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, circleArray, gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // We can use TRIANGLE_FAN
  gl.drawArrays(gl.TRIANGLE_FAN, 0, segments + 2);
}
