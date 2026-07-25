const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const ground = () => canvas.height * 0.75;

// Particle system for dust/dirt kick-up
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 1.5) * 2;
        this.speedY = Math.random() * -1.5 - 0.5;
        this.life = 1; // Alpha life
        this.decay = Math.random() * 0.03 + 0.02;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life * 0.3);
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let particles = [];

class Runner {
    constructor(x, speed, scale = 1) {
        this.x = x;
        this.speed = speed;
        this.scale = scale; // Parallax scale
        this.phase = Math.random() * Math.PI * 2;
    }

    update() {
        this.x += this.speed;
        this.phase += 0.18 * (this.speed / 3); // Sync stride frequency with speed

        // Emit dust particles near foot plant (approx frame phase)
        if (Math.sin(this.phase) > 0.8 && Math.random() < 0.4) {
            const y = ground() + 52 * this.scale;
            particles.push(new Particle(this.x, y));
        }

        if (this.x > canvas.width + 300 * this.scale) {
            this.x = -300 * this.scale;
        }
    }

    draw() {
        const y = ground();
        const arm = Math.sin(this.phase) * 22;
        const leg = Math.sin(this.phase) * 24;

        ctx.save();
        ctx.translate(this.x, y);
        ctx.scale(this.scale, this.scale); // Scale for depth
        
        // Depth-based opacity
        ctx.globalAlpha = 0.25 + (this.scale * 0.25);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

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
        ctx.restore();
    }
}

// Generate runners with varying scales (parallax depth effect)
const runners = [];
const configs = [
    { x: 100, speed: 1.2, scale: 0.6 },
    { x: 400, speed: 2.0, scale: 0.8 },
    { x: 700, speed: 3.2, scale: 1.1 },
    { x: 1000, speed: 2.5, scale: 0.9 },
    { x: 1300, speed: 1.6, scale: 0.7 }
];

configs.forEach(cfg => {
    runners.push(new Runner(cfg.x, cfg.speed, cfg.scale));
});

function drawGround() {
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, ground() + 52);
    ctx.lineTo(canvas.width, ground() + 52);
    ctx.stroke();
    ctx.restore();
}

function animate() {
    // Semi-transparent clear creates a sleek motion trail effect
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGround();

    // Update and draw particles
    particles.forEach((p, index) => {
        p.update();
        p.draw(ctx);
        if (p.life <= 0) {
            particles.splice(index, 1);
        }
    });

    // Update and draw runners
    runners.forEach(r => {
        r.update();
        r.draw();
    });

    requestAnimationFrame(animate);
}

animate();