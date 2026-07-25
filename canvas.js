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
        this.phase = Math.random() * Math.PI * 2;
        
        // Actions: "APPROACH", "FIGHT", "BACKOFF"
        this.state = "APPROACH";
        this.stateTimer = 0;
        
        // Two ninjas facing each other
        this.n1 = { xOffset: -50, action: "stance" };
        this.n2 = { xOffset: 50, action: "stance" };
    }

    update() {
        this.phase += 0.1;

        if (this.state === "APPROACH") {
            // Move toward center to engage
            this.n1.xOffset += 1.2;
            this.n2.xOffset -= 1.2;

            if (this.n1.xOffset >= -25) {
                this.state = "FIGHT";
                this.stateTimer = 180; // Fight duration (~3 seconds)
            }
        } else if (this.state === "FIGHT") {
            this.stateTimer--;
            
            // Alternate attack animations based on phase
            if (Math.sin(this.phase * 2) > 0) {
                this.n1.action = "punch";
                this.n2.action = "block";
            } else {
                this.n1.action = "kick";
                this.n2.action = "dodge";
            }

            if (this.stateTimer <= 0) {
                this.state = "BACKOFF";
            }
        } else if (this.state === "BACKOFF") {
            // Separate after fighting
            this.n1.xOffset -= 1.2;
            this.n2.xOffset += 1.2;
            this.n1.action = "stance";
            this.n2.action = "stance";

            if (this.n1.xOffset <= -80) {
                this.state = "APPROACH";
            }
        }

        // Slowly drift the whole pair across the screen
        this.x += 0.3;
        if (this.x > canvas.width + 150) {
            this.x = -150;
        }
    }

    drawNinja(nx, ny, facingRight, action) {
        ctx.save();
        ctx.translate(nx, ny);
        if (!facingRight) {
            ctx.scale(-1, 1);
        }

        // High visibility solid pure black ink
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

        // Ninja headband (adds sharp ninja flair)
        ctx.beginPath();
        ctx.moveTo(-18, -65);
        ctx.lineTo(18, -65);
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(15, -63);
        ctx.lineTo(32, -55 + Math.sin(this.phase) * 5); // flowing tie
        ctx.stroke();

        ctx.lineWidth = 6; // reset line width

        // Body postures based on action
        ctx.beginPath();
        if (action === "punch") {
            // Leaning forward punch
            ctx.moveTo(0, -42);
            ctx.lineTo(-5, 15);
            // Punching arm extended
            ctx.moveTo(-5, -25);
            ctx.lineTo(45, -28);
            // Back arm guarding
            ctx.moveTo(-5, -25);
            ctx.lineTo(-20, -10);
            // Legs in lunge
            ctx.moveTo(-5, 15);
            ctx.lineTo(-30, 52);
            ctx.moveTo(-5, 15);
            ctx.lineTo(25, 52);
        } else if (action === "kick") {
            // High side kick
            ctx.moveTo(0, -42);
            ctx.lineTo(5, 15);
            // Arms balanced
            ctx.moveTo(5, -25);
            ctx.lineTo(-20, -15);
            ctx.moveTo(5, -25);
            ctx.lineTo(30, -15);
            // Standing leg and kicking leg
            ctx.moveTo(5, 15);
            ctx.lineTo(-5, 52);
            ctx.moveTo(5, 15);
            ctx.lineTo(45, -5); // extended kick
        } else if (action === "block") {
            // Defensive stance
            ctx.moveTo(0, -42);
            ctx.lineTo(0, 15);
            ctx.moveTo(0, -25);
            ctx.lineTo(25, -35); // blocking arms up
            ctx.moveTo(0, -25);
            ctx.lineTo(15, -15);
            ctx.moveTo(0, 15);
            ctx.lineTo(-15, 52);
            ctx.moveTo(0, 15);
            ctx.lineTo(15, 52);
        } else if (action === "dodge") {
            // Lean back dodge
            ctx.moveTo(0, -42);
            ctx.lineTo(-15, 15);
            ctx.moveTo(-10, -25);
            ctx.lineTo(-30, -30);
            ctx.moveTo(-10, -25);
            ctx.lineTo(10, -10);
            ctx.moveTo(-15, 15);
            ctx.lineTo(-35, 52);
            ctx.moveTo(-15, 15);
            ctx.lineTo(5, 52);
        } else {
            // Neutral combat stance
            const bob = Math.sin(this.phase) * 3;
            ctx.moveTo(0, -42 + bob);
            ctx.lineTo(0, 15 + bob);
            ctx.moveTo(0, -25 + bob);
            ctx.lineTo(-22, -10 + bob);
            ctx.moveTo(0, -25 + bob);
            ctx.lineTo(22, -10 + bob);
            ctx.moveTo(0, 15 + bob);
            ctx.lineTo(-18, 52);
            ctx.moveTo(0, 15 + bob);
            ctx.lineTo(18, 52);
        }
        ctx.stroke();

        ctx.restore();
    }

    draw() {
        const y = ground();

        // Draw Ninja 1 (facing right)
        this.drawNinja(this.x + this.n1.xOffset, y, true, this.n1.action);

        // Draw Ninja 2 (facing left)
        this.drawNinja(this.x + this.n2.xOffset, y, false, this.n2.action);
    }
}

const pairs = [];
for (let i = 0; i < 3; i++) {
    pairs.push(new NinjaPair(i * 500 + 250));
}

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