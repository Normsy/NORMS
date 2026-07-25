<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Running & Crying Stickmen</title>
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

class Runner {
    constructor(x, speed) {
        this.x = x;
        this.speed = speed;
        this.phase = Math.random() * Math.PI * 2;
        
        // Behavior states: "RUN" or "CRY"
        this.state = "RUN";
        this.stateTimer = 0;
        // Random x coordinate where this runner will decide to stop and cry
        this.cryTriggerX = 300 + Math.random() * (canvas.width - 600);
    }

    update() {
        if (this.state === "RUN") {
            this.x += this.speed;
            this.phase += 0.18;

            // Check if it's time to stop and cry
            if (this.x >= this.cryTriggerX) {
                this.state = "CRY";
                this.stateTimer = 120; // Frames to spend crying (~2 seconds)
            }
        } else if (this.state === "CRY") {
            this.stateTimer--;
            // Subtle shaking/sobbing motion while crying
            this.phase += 0.05;

            // Resume running after timer hits zero, reset trigger further down the line
            if (this.stateTimer <= 0) {
                this.state = "RUN";
                this.cryTriggerX = this.x + 400 + Math.random() * 500;
            }
        }

        // Loop back to the start if off screen
        if (this.x > canvas.width + 200) {
            this.x = -200;
            this.cryTriggerX = 300 + Math.random() * 500;
            this.state = "RUN";
        }
    }

    draw() {
        const y = ground();

        ctx.save();
        ctx.translate(this.x, y);

        // Make stickman much more visible
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (this.state === "RUN") {
            // Running kinematics
            const arm = Math.sin(this.phase) * 22;
            const leg = Math.sin(this.phase) * 24;

            // Head
            ctx.beginPath();
            ctx.arc(0, -60, 18, 0, Math.PI * 2);
            ctx.stroke();

            // Body
            ctx.beginPath();
            ctx.moveTo(0, -42);
            ctx.lineTo(0, 15);

            // Left Arm
            ctx.moveTo(0, -25);
            ctx.lineTo(-arm, -5);

            // Right Arm
            ctx.moveTo(0, -25);
            ctx.lineTo(arm, -5);

            // Left Leg
            ctx.moveTo(0, 15);
            ctx.lineTo(-leg, 52);

            // Right Leg
            ctx.moveTo(0, 15);
            ctx.lineTo(leg, 52);
            ctx.stroke();

        } else if (this.state === "CRY") {
            // Crying kinematics (hunched forward, hands covering face/head)
            const sobOffset = Math.sin(this.stateTimer * 0.5) * 2; // shaking effect

            // Head (hunched forward and lower)
            ctx.beginPath();
            ctx.arc(10, -50 + sobOffset, 18, 0, Math.PI * 2);
            ctx.stroke();

            // Body (leaning forward)
            ctx.beginPath();
            ctx.moveTo(0, -42);
            ctx.lineTo(5, 15);

            // Arms lifted up to the face/head
            ctx.moveTo(5, -25);
            ctx.lineTo(15, -45 + sobOffset);

            // Legs (standing still, slightly bent)
            ctx.moveTo(5, 15);
            ctx.lineTo(-5, 52);

            ctx.moveTo(5, 15);
            ctx.lineTo(12, 52);
            ctx.stroke();
        }

        ctx.restore();
    }
}

const runners = [];
for (let i = 0; i < 5; i++) {
    runners.push(
        new Runner(
            i * 350,
            2 + Math.random() * 1.5
        )
    );
}

function drawGround() {
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = "#000";
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

    runners.forEach(r => {
        r.update();
        r.draw();
    });

    requestAnimationFrame(animate);
}

animate();
</script>

</body>
</html>