// =======================
// NORMS Premium Effects
// =======================

// Product Card Hover 3D Effect
const cards = document.querySelectorAll(".card");

cards.forEach(card => {
    card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotateY = ((x / rect.width) - 0.5) * 8;
        const rotateX = ((y / rect.height) - 0.5) * -8;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    });
});

// Fade In Animation Observer
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, {
    threshold: .15
});

document.querySelectorAll(".card, .hero, #about, #contact").forEach(el => {
    observer.observe(el);
});

// Navbar Blur / Shadow on Scroll
const nav = document.querySelector("nav");

window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        nav.style.boxShadow = "0 8px 30px rgba(0,0,0,.06)";
    } else {
        nav.style.boxShadow = "none";
    }
});
