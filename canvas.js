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
    }

    update() {
        this.x += this.speed;
        this.phase += 0.18;

        if (this.x > canvas.width + 200) {
            this.x = -200;
        }
    }

    draw() {

        const y = ground();

        const arm = Math.sin(this.phase) * 22;
        const leg = Math.sin(this.phase) * 24;

        ctx.save();

        ctx.translate(this.x, y);

        // More visible
        ctx.globalAlpha = 0.45;

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

    ctx.globalAlpha = 0.08;

    ctx.strokeStyle = "#000";

    ctx.lineWidth = 2;

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