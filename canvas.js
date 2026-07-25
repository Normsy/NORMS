const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const ground = () => canvas.height * 0.78;

class Runner{

    constructor(x,speed){

        this.x=x;
        this.speed=speed;
        this.phase=Math.random()*Math.PI*2;

    }

    update(){

        this.x+=this.speed;
        this.phase+=0.18;

        if(this.x>canvas.width+120){

            this.x=-120;

        }

    }

    draw(){

        const y=ground();

        const swing=Math.sin(this.phase)*12;
        const leg=Math.sin(this.phase)*16;

        ctx.save();

        ctx.translate(this.x,y);

        ctx.globalAlpha=.12;

        ctx.strokeStyle="#000";
        ctx.lineWidth=3;
        ctx.lineCap="round";

        // head

        ctx.beginPath();
        ctx.arc(0,-42,12,0,Math.PI*2);
        ctx.stroke();

        // body

        ctx.beginPath();

        ctx.moveTo(0,-30);
        ctx.lineTo(0,5);

        // left arm

        ctx.moveTo(0,-18);
        ctx.lineTo(-swing,-5);

        // right arm

        ctx.moveTo(0,-18);
        ctx.lineTo(swing,-5);

        // left leg

        ctx.moveTo(0,5);
        ctx.lineTo(-leg,28);

        // right leg

        ctx.moveTo(0,5);
        ctx.lineTo(leg,28);

        ctx.stroke();

        ctx.restore();

    }

}

const runners=[];

for(let i=0;i<6;i++){

    runners.push(
        new Runner(
            i*250,
            1.5+Math.random()*1.5
        )
    );

}

function animate(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    runners.forEach(r=>{

        r.update();
        r.draw();

    });

    requestAnimationFrame(animate);

}

animate();