<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Ninja Fighting Stickmen</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #f0f0f0;
        }
        canvas {
            display: block;
        }
    </style>
</head>
<body>

<canvas id="bg"></canvas>

<script>
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const ground = () => canvas.height * 0.75;

class NinjaPair {
    constructor(x) {
        this.x = x;
        this.time = 0;
        
        // Two ninjas starting close enough to fight immediately
        this.n1 = { xOffset: -30 };
        this.n2 = { xOffset: 30 };
    }

    update() {
        this.time += 0.08;
    }

    drawNinja(nx, ny, facingRight, actionType) {
        ctx.save();
        ctx.translate(nx, ny);
        if (!facingRight) {
            ctx.scale(-1, 1);
        }

        // Solid pure black, high visibility
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = "#000000";
        ctx.fillStyle = "#000000";
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Head
        ctx.beginPath();
        ctx.arc(0, -60, 18, 0, Math.PI * 2);
        ctx.stroke();

        // Ninja headband
        ctx.beginPath();
        ctx.moveTo(-18, -65);
        ctx.lineTo(18, -65);
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(15, -63);
        ctx.lineTo(32, -55 + Math.sin(this.time) * 5);
        ctx.stroke();

        ctx.lineWidth = 6;

        // Dynamic fighting poses driven continuously by sine waves
        ctx.beginPath();
        if (actionType === 1) {
            // Attacker: Punching forward
            ctx.moveTo(0, -42);
            ctx.lineTo(-5, 15);
            ctx.moveTo(-5, -25);
            ctx.lineTo(45, -28 + Math.sin(this.time * 4) * 10); // active punch thrust
            ctx.moveTo(-5, -25);
            ctx.lineTo(-20, -10);
            ctx.moveTo(-5, 15);
            ctx.lineTo(-30, 52);
            ctx.moveTo(-5, 15);
            ctx.lineTo(25, 52);
        } else {
            // Defender: Blocking / Reeling back from impact
            const recoil = Math.max(0, Math.sin(this.time * 4) * 15);
            ctx.moveTo(0, -42);
            ctx.lineTo(5 + recoil, 15);
            ctx.moveTo(5, -25);
            ctx.lineTo(25 - recoil, -35); // blocking arms
            ctx.moveTo(5, -25);
            ctx.lineTo(15, -15);
            ctx.moveTo(5, 15);
            ctx.lineTo(-15, 52);
            ctx.moveTo(5, 15);
            ctx.lineTo(15 + recoil, 52);
        }
        ctx.stroke();

        ctx.restore();
    }

    draw() {
        const y = ground();
        // Switch who attacks/defends based on time cycle so they continuously exchange blows
        const actionToggle = Math.sin(this.time * 2) > 0;
        
        this.drawNinja(this.x + this.n1.xOffset, y, true, actionToggle ? 1 : 2);
        this.drawNinja(this.x + this.n2.xOffset, y, false, actionToggle ? 2 : 1);
    }
}

const pairs = [
    new NinjaPair(window.innerWidth * 0.25),
    new NinjaPair(window.innerWidth * 0.5),
    new NinjaPair(window.innerWidth * 0.75)
];

function drawGround() {
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, ground() + 52);
    ctx.lineTo(canvas.width, ground() + 52);
    ctx.stroke();
    ctx.restore();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();

    pairs.forEach(pair => {
        pair.update();
        pair.draw();
    });

    requestAnimationFrame(animate);
}

animate();
</script>

</body>
</html>