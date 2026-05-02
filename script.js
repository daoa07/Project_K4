// Daftarkan ScrollTrigger untuk GSAP
gsap.registerPlugin(ScrollTrigger);

const brandText = document.getElementById("brandText");
const introBox = document.getElementById("introBox");
const contentWrapper = document.querySelector(".content-wrapper");
const navLogo = document.querySelector(".navbar-brand");
const leaf = document.querySelector(".leaf");

// Pecah teks brand agar bisa dianimasikan huruf per huruf
const text = brandText.textContent;
brandText.innerHTML = "";
const letters = text.split("");

letters.forEach((letter) => {
  const span = document.createElement("span");
  span.textContent = letter === " " ? "\u00A0" : letter; // Handle spasi
  brandText.appendChild(span);
});

const spans = document.querySelectorAll(".brand-intro span");


function cinematicEffect() {
  // Fungsi ini sekarang dipanggil dari onUpdate untuk sinkronisasi posisi
  // Tidak lagi menggunakan stagger otomatis
}

// Fungsi pembantu untuk menerangi huruf berdasarkan posisi daun
function revealLetter(index) {
    const span = spans[index];
    if (span && !span.classList.contains('revealed')) {
        span.classList.add('revealed');
        span.classList.add('shimmer');
        gsap.to(span, {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            backgroundPosition: "0% 0%",
            duration: 0.5,
            ease: "back.out(1.7)"
        });
    }
}

let isFinished = false;

function finishIntro() {
  if (isFinished) return;
  isFinished = true;
  const tl = gsap.timeline();

  // 1. Semua huruf menjadi menyala terang
  tl.to(spans, {
    opacity: 1,
    backgroundPosition: "0% 0%",
    duration: 0.4,
    stagger: 0.03,
    ease: "power2.inOut",
  })

    // 2. Transisi: Huruf mengecil, pindah ke posisi Navbar
    .to("#introLogo", { opacity: 0, duration: 0.4 })
    .to(
      brandText,
      {
        x: () => {
          const navImg = document.querySelector(".navbar-brand img");
          return navImg
            ? navImg.getBoundingClientRect().left -
                brandText.getBoundingClientRect().left +
                40
            : -window.innerWidth / 2 + 100;
        },
        y: () => {
          const navImg = document.querySelector(".navbar-brand img");
          return navImg
            ? navImg.getBoundingClientRect().top -
                brandText.getBoundingClientRect().top
            : -window.innerHeight / 2 + 50;
        },
        scale: 0.4,
        transformOrigin: "top left",
        opacity: 0,
        duration: 0.8,
        ease: "power3.inOut",
      },
      "+=0.1",
    )

    // Background intro pudar dari bawah (Reveal)
    .to(
      introBox,
      {
        clipPath: "inset(0 0 100% 0)",
        duration: 1,
        ease: "power2.inOut",
      },
      "<", // Mulai bersamaan dengan pergerakan teks
    )

    // Background warna body berubah
    .to(
      "body",
      {
        backgroundColor: "#fdf5e6",
        duration: 0.6,
      },
      "<",
    )

    // Pastikan konten utama muncul
    .to(
      contentWrapper,
      {
        opacity: 1,
        duration: 0.5,
      },
      "<",
    )

    // Selesaikan pembersihan
    .to(introBox, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        introBox.style.display = "none";
        document.body.style.overflowY = "auto";

        // Tampilkan modal hanya sekali per sesi (saat pertama masuk)
        if (!sessionStorage.getItem("infoModalShown")) {
          var infoModal = new bootstrap.Modal(
            document.getElementById("infoModal"),
          );
          infoModal.show();
          sessionStorage.setItem("infoModalShown", "true");
        }
      },
    })

    // 4. Logo Navbar & Link Menu Fade-in
    .to(
      navLogo,
      {
        opacity: 1,
        duration: 0.3,
      },
      "-=0.3",
    )
    .fromTo(
      ".nav-item",
      {
        opacity: 0,
        y: -10,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
      },
      "-=0.3",
    )


    // 5. Animasi teks Hero muncul dari bawah
    .fromTo(
      ".reveal-text",
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      },
      "-=0.3",
    );
}

// Animasi angin (garis lurus bergerak)
const windLines = document.querySelectorAll(".wind-line");

// // ANIMASI DAUN (Premium 3-Point Wave: Tengah -> Atas (33%) -> Bawah (67%) -> Tengah)
gsap.set(leaf, {
  x: -350,
  y: window.innerHeight / 2,
  rotation: -45,
  opacity: 0,
  scale: 0.8
});

const leafTL = gsap.timeline();

// 1. Animasi Angin (Muncul 2 kali dengan jeda sama)
leafTL.fromTo(windLines, {
  x: "-100vw"
}, {
  x: "200vw", // Lebih jauh agar tidak "nyangkut"
  duration: 1.5,
  ease: "power1.inOut",
  stagger: 0.15,
  repeat: 1, // Total 2 kali muncul
  repeatDelay: 0.8
}, 0);

// 2. Gerakan Horizontal (X) - Konstan agar smooth
leafTL.to(leaf, {
  x: window.innerWidth + 500,
  duration: 5,
  ease: "none",
  opacity: 1,
  onUpdate: function() {
    const currentX = gsap.getProperty(leaf, "x");
    const leafCenter = currentX + 90; // Titik tengah daun (setengah dari 180px)
    
    // Cek setiap huruf
    spans.forEach((span, index) => {
        const rect = span.getBoundingClientRect();
        // Jika daun melewati posisi kiri huruf
        if (leafCenter > rect.left) {
            revealLetter(index);
        }
    });

    // Cek jika semua huruf sudah muncul, beri jedah lalu selesai
    const revealedCount = document.querySelectorAll('.brand-intro span.revealed').length;
    if (revealedCount === spans.length && !leaf.dataset.finishedTriggered) {
        leaf.dataset.finishedTriggered = "true";
        setTimeout(finishIntro, 1500);
    }
  }
}, 0);

// 3. Gerakan Vertikal (Y) - SESUAI REQUEST (Tengah -> Tengah Atas -> Tengah Bawah -> Tengah)
leafTL
  .to(leaf, {
    y: window.innerHeight * 0.35, // Tengah Atas
    duration: 1.65,
    ease: "sine.inOut"
  }, 0)
  .to(leaf, {
    y: window.innerHeight * 0.65, // Tengah Bawah
    duration: 1.7,
    ease: "sine.inOut"
  }, 1.65)
  .to(leaf, {
    y: window.innerHeight / 2, // Kembali ke Tengah
    duration: 1.65,
    ease: "sine.inOut"
  }, 3.35);

// 4. Extra Juice: Polished 3D Motion
leafTL.to(leaf, {
  rotationY: 720,
  rotation: 180,
  scale: 1.2, // Sedikit membesar saat di tengah
  duration: 2.5,
  yoyo: true,
  repeat: 1,
  ease: "power1.inOut"
}, 0);

// Fade out halus di ujung layar
leafTL.to(leaf, {
  opacity: 0,
  scale: 0.5,
  duration: 0.8
}, 4.2);

// Animasi Scroll (GSAP ScrollTrigger) untuk Card Menu
gsap.utils.toArray(".menu-card").forEach((card, i) => {
  gsap.fromTo(
    card,
    {
      opacity: 0,
      y: 50,
    },
    {
      scrollTrigger: {
        trigger: card,
        start: "top 85%", // Mulai animasi saat card menyentuh 85% layar
        toggleActions: "play none none reverse",
      },
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: i * 0.1, // Beri jarak delay antar card (Staggered effect)
      ease: "power3.out",
    },
  );
});

introBox.addEventListener("click", () => {
  if (isFinished) return;
  finishIntro();
});

// Navbar Scroll Effect
window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");

  if (window.scrollY > 50) {
    if (navbar) navbar.classList.add("scrolled");
  } else {
    if (navbar) navbar.classList.remove("scrolled");
  }
});

// Scroll Reveal Animation
function reveal() {
  var reveals = document.querySelectorAll(".reveal");
  for (var i = 0; i < reveals.length; i++) {
    var windowHeight = window.innerHeight;
    var elementTop = reveals[i].getBoundingClientRect().top;
    var elementVisible = 150;
    if (elementTop < windowHeight - elementVisible) {
      reveals[i].classList.add("active");
    }
  }
}
window.addEventListener("scroll", reveal);
reveal();
// SPA Logic
function switchPage(pageId) {
  document.querySelectorAll(".page-section").forEach((section) => {
    section.classList.remove("active");
  });
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add("active");
    window.scrollTo(0, 0); // Scroll to top when switching pages
    setTimeout(reveal, 100); // Trigger scroll reveal
  }
//   baru
  const footer = document.querySelector("footer");
  const waBtn = document.getElementById("floatingWA");

  if (pageId === "contact") {
    if (footer) footer.style.display = "none";
    // Tampilkan tombol WA dengan animasi slide dari kanan
    if (waBtn) {
      waBtn.classList.remove("wa-visible");
      void waBtn.offsetWidth; // reset animasi
      setTimeout(() => waBtn.classList.add("wa-visible"), 100);
    }
  } else {
    if (footer) footer.style.display = "block";
    // Sembunyikan tombol WA
    if (waBtn) {
      waBtn.classList.remove("wa-visible");
    }
  }
}

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href && href.startsWith("#")) {
      e.preventDefault();
      switchPage(href.substring(1));
    }
  });
});

// ================= RUNNING TOAST LOGIC =================
const toastData = [
  { 
    title: "Sejarah De Café", 
    message: "Didirikan pada tahun 2026 oleh Kelompok 4 Sintak 2026 dengan visi menyatukan pecinta kopi.",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=150"
  },
  { 
    title: "Filosofi Kami", 
    message: "Menggunakan biji kopi pilihan terbaik langsung dari petani lokal Nusantara.",
    image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=150"
  },
  { 
    title: "Biji Kopi Premium", 
    message: "100% Arabica berkualitas tinggi yang disangrai dengan teknik artisanal.",
    image: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=150"
  },
  { 
    title: "Fakta Unik", 
    message: "Setiap cangkir kopi diseduh dengan suhu presisi untuk mengekstrak rasa maksimal.",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=150"
  }
];

let currentToastIndex = 0;
const runningToast = document.getElementById("runningToast");
const toastTitle = document.getElementById("toastTitle");
const toastMessage = document.getElementById("toastMessage");
const toastImage = document.getElementById("toastImage");
const toastImgWrapper = document.getElementById("toastImgWrapper");
const toastIcon = document.getElementById("toastIcon");

function showNextToast() {
  if (!runningToast) return;
  
  // Sekarang toast fixed, bisa muncul di mana saja
  
  // Sembunyikan toast sebelumnya
  runningToast.classList.remove("show");
  
  setTimeout(() => {
    // Update konten
    const data = toastData[currentToastIndex];
    toastTitle.textContent = data.title;
    toastMessage.textContent = data.message;
    
    // Tampilkan gambar jika ada
    if (data.image) {
      if (toastImage) toastImage.src = data.image;
      if (toastImgWrapper) toastImgWrapper.style.display = "block";
      if (toastIcon) toastIcon.style.display = "none";
    } else {
      if (toastImgWrapper) toastImgWrapper.style.display = "none";
      if (toastIcon) toastIcon.style.display = "flex";
    }
    
    // Tampilkan toast
    runningToast.classList.add("show");
    
    currentToastIndex = (currentToastIndex + 1) % toastData.length;
    
    // Sembunyikan setelah 5 detik
    setTimeout(() => {
      runningToast.classList.remove("show");
    }, 5000);
  }, 1000);
}

// Mulai loop toast tiap 7 detik
setInterval(showNextToast, 7000);

// Tampilkan toast pertama setelah intro selesai
setTimeout(showNextToast, 4000);
