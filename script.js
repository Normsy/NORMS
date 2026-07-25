// Smooth card hover animation
const cards = document.querySelectorAll(".card");

cards.forEach(card => {

    card.addEventListener("mousemove", e => {

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotateY = ((x / rect.width) - 0.5) * 16;
        const rotateX = ((y / rect.height) - 0.5) * -16;

        card.style.transform =
            `perspective(1000px)
             rotateX(${rotateX}deg)
             rotateY(${rotateY}deg)
             translateY(-10px)`;

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform =
            "perspective(1000px) rotateX(0) rotateY(0) translateY(0)";

    });

});

// Buy Button Effect
document.querySelectorAll(".card button").forEach(button=>{

    button.addEventListener("click",()=>{

        button.innerHTML="Opening...";

        button.style.background="#22c55e";

        setTimeout(()=>{

            button.innerHTML="BUY NOW";

        },1500);

    });

});

// Reveal animation while scrolling
const observer = new IntersectionObserver(entries=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.style.opacity="1";
            entry.target.style.transform="translateY(0)";

        }

    });

},{threshold:.2});

cards.forEach(card=>{

    card.style.opacity="0";
    card.style.transform="translateY(50px)";
    card.style.transition=".7s";

    observer.observe(card);

});
