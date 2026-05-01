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
// Animasi Cinematic Light-up
let currentIndex = 0;
let loops = 0;
const maxLoops = 1; // Berapa kali putaran gradient sebelum terbuka

function cinematicEffect() {
  // Reset huruf (redup)
  gsap.to(spans, {
    opacity: 0.4,
    backgroundPosition: "200% 0%",
    duration: 0.4,
    ease: "power2.out",
  });

  // Hidupkan huruf yang aktif (menyala & gradient berjalan)
  if (spans[currentIndex].textContent.trim() !== "") {
    gsap.to(spans[currentIndex], {
      opacity: 1,
      backgroundPosition: "0% 0%",
      duration: 0.3,
      ease: "power3.out",
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
    setTimeout(finishIntro, 300); // Dipercepat
    return;
  }

  setTimeout(cinematicEffect, 100); // Jeda 100ms tiap huruf (sangat cepat)
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

    // Background warna body berubah dari gelap ke warna terang (beige) secara halus
    .to(
      "body",
      {
        backgroundColor: "#f5f1eb",
        duration: 0.6,
      },
      "<",
    )

    // 3. Matikan layar intro dan munculkan halaman utama
    .to(introBox, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        introBox.style.display = "none";
        document.body.style.overflowY = "auto"; // Kembalikan fungsi scroll

        // Tampilkan popup info
        var infoModal = new bootstrap.Modal(
          document.getElementById("infoModal"),
        );
        infoModal.show();
      },
    })
    .to(
      contentWrapper,
      {
        opacity: 1,
        duration: 0.5,
      },
      "-=0.3",
    )

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
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
      },
      "<",
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

// ANIMASI DAUN (Besar & Bergoyang Natural)
// Set posisi awal daun tersembunyi di luar layar (kiri)
gsap.set(leaf, {
  x: -300,
  y: window.innerHeight / 3,
  rotation: -45,
  opacity: 0,
});

const leafTL = gsap.timeline();

// Animasi hembusan angin (garis lurus melintas cepat)
leafTL.to(
  windLines,
  {
    x: "200vw", // Bergerak menembus ke luar layar kanan
    duration: 2.5,
    ease: "power1.inOut",
    stagger: 0.15, // Muncul bergantian dengan jeda cepat
  },
  0,
); // Mulai pada detik ke-0 (bersamaan dengan daun masuk)

// Fase 1: Daun masuk ke tengah layar dengan gerakan mengayun perlahan
leafTL
  .to(
    leaf,
    {
      x: window.innerWidth / 2 - 125, // Bergerak ke tengah layar
      y: window.innerHeight / 2 + 50, // Mengayun sedikit ke bawah
      rotation: 30, // Daun berputar pelan secara natural
      opacity: 0.9, // Daun memudar masuk (fade in)
      duration: 2.5,
      ease: "sine.inOut",
    },
    0,
  ) // Mulai pada detik ke-0
  // Fase 2: Daun keluar dari layar ke arah kanan atas sambil memicu efek teks
  .to(
    leaf,
    {
      x: window.innerWidth + 300, // Terbang menjauh ke luar layar kanan
      y: window.innerHeight / 3 - 100, // Mengayun naik ke atas
      rotation: 120, // Berputar lebih jauh seiring tertiup angin
      opacity: 0, // Memudar keluar (fade out)
      duration: 2.5,
      ease: "sine.inOut",
      onStart: () => {
        // Memicu animasi teks bercahaya tepat saat daun mulai meninggalkan tengah layar
        cinematicEffect();
      },
    },
    2.5,
  ); // Mulai di detik ke-2.5 (melanjutkan fase 1)

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

introBox.addEventListener("click", (e) => {
  if (isFinished) return;

  if (e.target.id === "skipIntro") return;

  finishIntro();
});

// Navbar & TopBar Scroll Effect
window.addEventListener("scroll", function () {
  const headerWrapper = document.getElementById("headerWrapper");
  const navbar = document.querySelector(".navbar");
  const topBar = document.getElementById("topBar");

  if (window.scrollY > 50) {
    if (navbar) navbar.classList.add("scrolled");
    if (topBar && topBar.style.display !== "none" && headerWrapper) {
      headerWrapper.style.transform = `translateY(-${topBar.offsetHeight}px)`;
    }
  } else {
    if (navbar) navbar.classList.remove("scrolled");
    if (headerWrapper) headerWrapper.style.transform = "translateY(0)";
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
  if (!runningToast || document.getElementById("home").classList.contains("active") === false) {
      if(runningToast) runningToast.classList.remove("show");
      return;
  }
  
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

// ================= FLOATING WA POPUP LOGIC =================
const waWrapper = document.getElementById("floatingWA");
const waToggle  = document.getElementById("waToggle");
const waPopup   = document.getElementById("waPopup");

if (waToggle && waPopup) {
  // Toggle popup saat tombol diklik
  waToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = waPopup.classList.contains("open");
    waPopup.classList.toggle("open");
    waToggle.classList.toggle("active");
  });

  // Tutup popup saat klik di luar
  document.addEventListener("click", (e) => {
    if (waWrapper && !waWrapper.contains(e.target)) {
      waPopup.classList.remove("open");
      waToggle.classList.remove("active");
    }
  });

  // Tutup popup setelah pilihan diklik
  waPopup.querySelectorAll(".wa-option").forEach(opt => {
    opt.addEventListener("click", () => {
      waPopup.classList.remove("open");
      waToggle.classList.remove("active");
    });
  });
}
