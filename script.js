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

// =======================
// NORMS Auth Handler (Login / Register)
// =======================

const registerForm = document.querySelector("#register-form") || document.querySelector("form"); 
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Adjust these selectors or fallback queries based on your form inputs
        const usernameInput = document.querySelector("input[type='text']") || document.querySelector("#username");
        const passwordInput = document.querySelector("input[type='password']") || document.querySelector("#password");

        if (!usernameInput || !passwordInput) {
            console.error("Username or password input fields not found.");
            return;
        }

        const username = usernameInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                alert("Account created successfully!");
                window.location.href = "/dashboard.html"; 
            } else {
                alert(data.message || "Registration failed.");
            }
        } catch (err) {
            console.error("Network error:", err);
            alert("Network error occurred");
        }
    });
}
