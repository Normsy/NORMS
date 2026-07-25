document.querySelectorAll(".card").forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.style.boxShadow="0 20px 40px rgba(0,0,0,.12)";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.boxShadow="0 10px 30px rgba(0,0,0,.05)";

    });

});
