const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const fighters = [
    { x: -150, y: 0, speed: 3, phase: 0 },
    { x: -450, y: 0, speed: 3.5, phase: Math.PI }
];

function drawStick(x, y, phase) {

    const arm = Math.sin(phase) * 18;
    const leg = Math.sin(phase) * 20;

    ctx.strokeStyle = "rgba(255,255,255,.18)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    // Head
    ctx.beginPath();
    ctx.arc(x, y - 42, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.moveTo(x, y - 30);
    ctx.lineTo(x, y + 8);

    // Arms
    ctx.moveTo(x, y - 18);
    ctx.lineTo(x - arm, y - 5);

    ctx.moveTo(x, y - 18);
    ctx.lineTo(x + arm, y - 5);

    // Legs
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x - leg, y + 34);

    ctx.moveTo(x, y + 8);
    ctx.lineTo(x + leg, y + 34);

    ctx.stroke();
}

function animate() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Purple glow
    const g = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        50,
        canvas.width / 2,
        canvas.height / 2,
        700
    );

    g.addColorStop(0, "rgba(124,58,237,.18)");
    g.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = g;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    fighters.forEach(f => {

        f.phase += 0.2;
        f.x += f.speed;

        if (f.x > canvas.width + 150)
            f.x = -200;

        drawStick(
            f.x,
            canvas.height * 0.72,
            f.phase
        );

    });

    requestAnimationFrame(animate);
}

animate();
