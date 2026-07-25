// =======================
// NORMS Stickman Fighter Background
// =======================

const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const ground = () => canvas.height * 0.78;

class Fighter {
    constructor(x, speed, scale, type) {
        this.x = x;
        this.y = ground() + (Math.random() * 80 - 40);
        this.speed = speed;
        this.scale = scale;
        this.phase = Math.random() * Math.PI * 2;
        this.type = type; // 0: Punch/Combat, 1: High Kick, 2: Epic Jump Kick
        this.opacity = 0.12 + Math.random() * 0.12;
    }

    update() {
        this.x += this.speed;
        this.phase += 0.09;

        // Loop screen edges seamlessly
        if (this.x > canvas.width + 300) {
            this.x = -300;
            this.y = ground() + (Math.random() * 80 - 40);
        } else if (this.x < -300) {
            this.x = canvas.width + 300;
            this.y = ground() + (Math.random() * 80 - 40);
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);

        // Face direction based on movement speed
        if (this.speed < 0) {
            ctx.scale(-1, 1);
        }

        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3.5 / this.scale;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const action = Math.sin(this.phase);

        // Head
        ctx.beginPath();
        ctx.arc(0, -48, 13, 0, Math.PI * 2);
        ctx.stroke();

        // Spine / Body
        ctx.beginPath();
        ctx.moveTo(0, -35);
        ctx.lineTo(0, 8);
        ctx.stroke();

        // Limbs based on fighting style
        ctx.beginPath();
        if (this.type === 0) {
            // Dynamic Punching Stance
            ctx.moveTo(0, -22);
            ctx.lineTo(-25 + action * 12, -28); // Rear guard arm
            ctx.moveTo(0, -22);
            ctx.lineTo(32 + action * 22, -18); // Punching jab

            ctx.moveTo(0, 8);
            ctx.lineTo(-22, 42); // Back leg
            ctx.moveTo(0, 8);
            ctx.lineTo(24, 42); // Front leg
        } else if (this.type === 1) {
            // High Kick Form
            ctx.moveTo(0, -22);
            ctx.lineTo(-22, -10);
            ctx.moveTo(0, -22);
            ctx.lineTo(22, -10);

            ctx.moveTo(0, 8);
            ctx.lineTo(-18, 42); // Standing leg
            ctx.moveTo(0, 8);
            ctx.lineTo(42 + action * 18, -12); // Extended high kick
        } else {
            // Aggressive Combat Action
            ctx.moveTo(0, -22);
            ctx.lineTo(-30, -5);
            ctx.moveTo(0, -22);
            ctx.lineTo(28, -5);

            ctx.moveTo(0, 8);
            ctx.lineTo(-25, 42);
            ctx.moveTo(0, 8);
            ctx.lineTo(25, 42);
        }
        ctx.stroke();

        ctx.restore();
    }
}

const fighters = [];

// Generate balanced stickman fighters across the screen
for (let i = 0; i < 9; i++) {
    fighters.push(
        new Fighter(
            i * 250 - 100,
            (i % 2 === 0 ? 1 : -1) * (1.0 + Math.random() * 0.8),
            0.5 + Math.random() * 0.7,
            Math.floor(Math.random() * 3)
        )
    );
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    fighters.forEach(f => {
        f.update();
        f.draw();
    });

    requestAnimationFrame(animate);
}

animate();