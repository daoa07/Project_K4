// Daftarkan ScrollTrigger untuk GSAP
gsap.registerPlugin(ScrollTrigger);

const brandText = document.getElementById("brandText");
const introBox = document.getElementById("introBox");
const contentWrapper = document.querySelector(".content-wrapper");
const navLogo = document.querySelector(".navbar .logo");

// Pecah teks brand agar bisa dianimasikan huruf per huruf
const text = brandText.textContent;
brandText.innerHTML = "";
const letters = text.split("");

letters.forEach(letter => {
    const span = document.createElement("span");
    span.textContent = letter === " " ? "\u00A0" : letter; // Handle spasi
    brandText.appendChild(span);
});

const spans = document.querySelectorAll(".brand-intro span");

// Animasi Cinematic Light-up
let currentIndex = 0;
let loops = 0;
const maxLoops = 1; // Berapa kali putaran gradient sebelum terbuka

function cinematicEffect() {
    // Reset huruf (redup)
    gsap.to(spans, {
        opacity: 0.5,
        backgroundPosition: "200% 0%",
        duration: 1.0
    });

    // Hidupkan huruf yang aktif (menyala & gradient berjalan)
    if (spans[currentIndex].textContent.trim() !== "") {
        gsap.to(spans[currentIndex], {
            opacity: 1,
            backgroundPosition: "0% 0%",
            duration: 0.3,
            ease: "power2.out"
        });
    }

    currentIndex++;

    // Jika sudah di huruf terakhir, ulang ke huruf pertama
    if (currentIndex >= spans.length) {
        currentIndex = 0;
        loops++;
    }

    // Jika putaran sudah selesai, eksekusi transisi keluar intro
    if (loops >= maxLoops && currentIndex === spans.length - 1) {
        setTimeout(finishIntro, 100); // Dipercepat
        return;
    }

    setTimeout(cinematicEffect, 70); // Jeda 70ms tiap huruf (sangat cepat)
}

function finishIntro() {
    const tl = gsap.timeline();

    // 1. Semua huruf menjadi menyala terang
    tl.to(spans, {
        opacity: 1,
        backgroundPosition: "0% 0%",
        duration: 0.4,
        stagger: 0.03,
        ease: "power2.inOut"
    })
    
    // 2. Transisi: Huruf mengecil, pindah ke posisi Navbar
    .to(brandText, {
        scale: 0.4,
        y: -window.innerHeight / 2 + 50,
        x: -window.innerWidth / 2 + 100,
        opacity: 0,
        duration: 0.6,
        ease: "power3.inOut"
    }, "+=0.1")
    
    // Background warna body berubah dari gelap ke warna terang (beige) secara halus
    .to("body", {
        backgroundColor: "#f5f1eb", 
        duration: 0.6
    }, "<")

    // 3. Matikan layar intro dan munculkan halaman utama
    .to(introBox, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            introBox.style.display = "none";
            document.body.style.overflowY = "auto"; // Kembalikan fungsi scroll
        }
    })
    .to(contentWrapper, {
        opacity: 1,
        duration: 0.5
    }, "-=0.3")
    
    // 4. Logo Navbar & Link Menu Fade-in
    .to(navLogo, {
        opacity: 1,
        duration: 0.3
    }, "-=0.3")
    .fromTo(".nav-links li", {
        opacity: 0,
        y: -10
    }, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out"
    }, "<")
    
    // 5. Animasi teks Hero muncul dari bawah
    .fromTo(".reveal-text", {
        opacity: 0,
        y: 20
    }, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out"
    }, "-=0.3");
}

// Mulai efek cinematic sangat cepat setelah halaman dimuat
setTimeout(cinematicEffect, 100);

// Animasi Scroll (GSAP ScrollTrigger) untuk Card Menu
gsap.utils.toArray('.menu-card').forEach((card, i) => {
    gsap.fromTo(card, {
        opacity: 0,
        y: 50
    }, {
        scrollTrigger: {
            trigger: card,
            start: "top 85%", // Mulai animasi saat card menyentuh 85% layar
            toggleActions: "play none none reverse"
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: i * 0.1, // Beri jarak delay antar card (Staggered effect)
        ease: "power3.out"
    });
});