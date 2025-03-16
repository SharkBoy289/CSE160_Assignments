// asg0.js

function main() {
    const canvas = document.getElementById("example");
    const ctx = canvas.getContext("2d");
    clearCanvas(ctx);

    // Set up event listeners for user interaction
    document.getElementById("draw-btn").addEventListener("click", handleDrawEvent);
    document.getElementById("op-btn").addEventListener("click", handleDrawOperationEvent);
}

function clearCanvas(ctx) {
    ctx.clearRect(0, 0, 400, 400);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 400, 400);
}

function drawVector(ctx, v, color) {
    ctx.beginPath();
    ctx.moveTo(200, 200); // Canvas center
    ctx.lineTo(200 + v.elements[0] * 20, 200 - v.elements[1] * 20);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

function handleDrawEvent() {
    const canvas = document.getElementById("example");
    const ctx = canvas.getContext("2d");
    clearCanvas(ctx);

    const x1 = parseFloat(document.getElementById("x1").value) || 0;
    const y1 = parseFloat(document.getElementById("y1").value) || 0;
    const v1 = new Vector3([x1, y1, 0]);
    drawVector(ctx, v1, "red");

    const x2 = parseFloat(document.getElementById("x2").value) || 0;
    const y2 = parseFloat(document.getElementById("y2").value) || 0;
    const v2 = new Vector3([x2, y2, 0]);
    drawVector(ctx, v2, "blue");
}

function handleDrawOperationEvent() {
    const canvas = document.getElementById("example");
    const ctx = canvas.getContext("2d");
    clearCanvas(ctx);

    const x1 = parseFloat(document.getElementById("x1").value) || 0;
    const y1 = parseFloat(document.getElementById("y1").value) || 0;
    const x2 = parseFloat(document.getElementById("x2").value) || 0;
    const y2 = parseFloat(document.getElementById("y2").value) || 0;

    const v1 = new Vector3([x1, y1, 0]);
    const v2 = new Vector3([x2, y2, 0]);
    drawVector(ctx, v1, "red");
    drawVector(ctx, v2, "blue");

    const operation = document.getElementById("operation").value;
    const scalar = parseFloat(document.getElementById("scalar").value) || 1;

    if (operation === "add") {
        const v3 = new Vector3(v1.elements).add(v2);
        drawVector(ctx, v3, "green");
    } else if (operation === "sub") {
        const v3 = new Vector3(v1.elements).sub(v2);
        drawVector(ctx, v3, "green");
    } else if (operation === "mul") {
        const v3 = new Vector3(v1.elements).mul(scalar);
        const v4 = new Vector3(v2.elements).mul(scalar);
        drawVector(ctx, v3, "green");
        drawVector(ctx, v4, "yellow");
    } else if (operation === "div") {
        const v3 = new Vector3(v1.elements).div(scalar);
        const v4 = new Vector3(v2.elements).div(scalar);
        drawVector(ctx, v3, "green");
        drawVector(ctx, v4, "yellow");
    } else if (operation === "magnitude") {
        console.log("Magnitude of v1:", v1.magnitude());
        console.log("Magnitude of v2:", v2.magnitude());
    } else if (operation === "normalize") {
        const norm1 = new Vector3(v1.elements).normalize();
        const norm2 = new Vector3(v2.elements).normalize();
        drawVector(ctx, norm1, "green");
        drawVector(ctx, norm2, "yellow");
    } else if (operation === "angle") {
        const angle = Math.acos(Vector3.dot(v1, v2) / (v1.magnitude() * v2.magnitude()));
        console.log("Angle between v1 and v2 (radians):", angle);
    } else if (operation === "area") {
        const cross = Vector3.cross(v1, v2);
        console.log("Area of triangle formed by v1 and v2:", 0.5 * cross.magnitude());
    }
}
