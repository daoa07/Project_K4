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
    if (span && !span.classList.contains("revealed")) {
      span.classList.add("revealed");
      span.classList.add("shimmer");
      gsap.to(span, {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        backgroundPosition: "0% 0%",
        duration: 0.5,
        ease: "back.out(1.7)",
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
          
          if (typeof ScrollTrigger !== "undefined") {
            ScrollTrigger.refresh();
          }

          // Tampilkan modal hanya sekali
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
    scale: 0.8,
  });

  const leafTL = gsap.timeline();

  // Cache posisi huruf untuk performa tinggi (menghindari getBoundingClientRect tiap frame)
  let spanPositions = [];
  function updateSpanPositions() {
    spanPositions = Array.from(spans).map(span => span.getBoundingClientRect().left);
  }
  // Panggil pertama kali
  setTimeout(updateSpanPositions, 100);

  // 1. Animasi Angin (Muncul 2 kali dengan jeda sama)
  leafTL.fromTo(
    windLines,
    {
      x: "-100vw",
    },
    {
      x: "200vw", // Lebih jauh agar tidak "nyangkut"
      duration: 1.5,
      ease: "power1.inOut",
      stagger: 0.15,
      repeat: 1, // Total 2 kali muncul
      repeatDelay: 0.8,
    },
    0,
  );

  // 2. Gerakan Horizontal (X) - Konstan agar smooth
  leafTL.to(
    leaf,
    {
      x: window.innerWidth + 500,
      duration: 5,
      ease: "none",
      opacity: 1,
      onUpdate: function () {
        const currentX = gsap.getProperty(leaf, "x");
        const leafCenter = currentX + 90; // Titik tengah daun (setengah dari 180px)

        // Cek setiap huruf menggunakan posisi cache (sangat ringan)
        spans.forEach((span, index) => {
          if (leafCenter > spanPositions[index]) {
            revealLetter(index);
          }
        });

        // Cek jika semua huruf sudah muncul, beri jedah lalu selesai
        const revealedCount = document.querySelectorAll(
          ".brand-intro span.revealed",
        ).length;
        if (revealedCount === spans.length && !leaf.dataset.finishedTriggered) {
          leaf.dataset.finishedTriggered = "true";
          setTimeout(finishIntro, 1500);
        }
      },
    },
    0,
  );

  // 3. Gerakan Vertikal (Y) - SESUAI REQUEST (Tengah -> Tengah Atas -> Tengah Bawah -> Tengah)
  leafTL
    .to(
      leaf,
      {
        y: window.innerHeight * 0.35, // Tengah Atas
        duration: 1.65,
        ease: "sine.inOut",
      },
      0,
    )
    .to(
      leaf,
      {
        y: window.innerHeight * 0.65, // Tengah Bawah
        duration: 1.7,
        ease: "sine.inOut",
      },
      1.65,
    )
    .to(
      leaf,
      {
        y: window.innerHeight / 2, // Kembali ke Tengah
        duration: 1.65,
        ease: "sine.inOut",
      },
      3.35,
    );

  // 4. Extra Juice: Polished 3D Motion
  leafTL.to(
    leaf,
    {
      rotationY: 720,
      rotation: 180,
      scale: 1.2, // Sedikit membesar saat di tengah
      duration: 2.5,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut",
    },
    0,
  );

  // Fade out halus di ujung layar
  leafTL.to(
    leaf,
    {
      opacity: 0,
      scale: 0.5,
      duration: 0.8,
    },
    4.2,
  );

  // Animasi Scroll (GSAP ScrollTrigger) untuk Card Menu
  gsap.set(".menu-card", { y: 50, opacity: 0 });

  ScrollTrigger.batch(".menu-card", {
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out", overwrite: true }),
    onLeave: (batch) => gsap.set(batch, { opacity: 0, y: -50, overwrite: true }),
    onEnterBack: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out", overwrite: true }),
    onLeaveBack: (batch) => gsap.set(batch, { opacity: 0, y: 50, overwrite: true }),
    start: "top 85%",
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

  // Scroll Reveal Animation (Modern Intersection Observer)
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  }, {
    rootMargin: "0px 0px -100px 0px"
  });

  function reveal() {
    document.querySelectorAll(".reveal").forEach((el) => {
      revealObserver.observe(el);
    });
  }

  let resizeTimeout;
  window.addEventListener("resize", () => {
    if (!isFinished) updateSpanPositions();
    
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      reveal();
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    }, 250); // Debounce untuk mencegah frame drop ekstrim saat di-resize
  });
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
      setTimeout(() => {
        reveal();
        if (typeof ScrollTrigger !== "undefined") {
          ScrollTrigger.refresh();
        }
      }, 100); // Trigger scroll reveal
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

    // Perbarui visibilitas keranjang
    if (typeof updateCheckoutBar === "function") {
      updateCheckoutBar();
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
      message:
        "Didirikan pada tahun 2026 oleh Kelompok 4 Sintak 2026 dengan visi menyatukan pecinta kopi.",
      image:
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=150",
    },
    {
      title: "Filosofi Kami",
      message:
        "Menggunakan biji kopi pilihan terbaik langsung dari petani lokal Nusantara.",
      image:
        "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=150",
    },
    {
      title: "Biji Kopi Premium",
      message:
        "100% Arabica berkualitas tinggi yang disangrai dengan teknik artisanal.",
      image:
        "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=150",
    },
    {
      title: "Fakta Unik",
      message:
        "Setiap cangkir kopi diseduh dengan suhu presisi untuk mengekstrak rasa maksimal.",
      image:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=150",
    },
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

      // Menampilkan gambar
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

  // ================= ORDERING SYSTEM LOGIC =================
  let cart = {};

  function updateQty(btn, delta) {
    const card = btn.closest(".menu-card");
    const name = card.querySelector("h3").textContent;
    const price = parseInt(
      card.querySelector(".menu-price").getAttribute("data-price"),
    );
    const input = card.querySelector(".qty-input");

    let val = parseInt(input.value) + delta;
    if (val < 0) val = 0;
    input.value = val;

    if (val > 0) {
      cart[name] = { price, qty: val };
    } else {
      delete cart[name];
    }

    updateCheckoutBar();
  }

  function updateCartQty(name, delta) {
    if (cart[name]) {
      cart[name].qty += delta;
      if (cart[name].qty <= 0) {
        delete cart[name];
      }

      // Update input in menu section too
      document.querySelectorAll(".menu-card").forEach((card) => {
        if (card.querySelector("h3").textContent === name) {
          card.querySelector(".qty-input").value = cart[name]
            ? cart[name].qty
            : 0;
        }
      });

      updateCheckoutBar();
      showCheckoutModal(true); // Refresh modal without creating new instance
    }
  }

  function updateCheckoutBar() {
    const bar = document.getElementById("checkoutBar");
    const totalPriceEl = document.getElementById("barTotalPrice");

    // Hanya muncul di halaman Menu
    const activePage = document.querySelector(".page-section.active")?.id;

    let total = 0;
    let hasItems = false;

    for (const item in cart) {
      total += cart[item].price * cart[item].qty;
      hasItems = true;
    }

    if (hasItems && activePage === "menu") {
      totalPriceEl.textContent = `Rp ${total.toLocaleString("id-ID")}`;
      bar.classList.add("show");
    } else {
      bar.classList.remove("show");
      // Also close modal if it's open and cart becomes empty
      const modalEl = document.getElementById("checkoutModal");
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal && !hasItems) modal.hide();
    }
  }

  let pendingOrderData = null;

  function setOrderType(type, btnEl) {
    document.getElementById('orderType').value = type;
    document.querySelectorAll('.checkout-tab').forEach(tab => tab.classList.remove('active'));
    btnEl.classList.add('active');
  }

  function removeFromCart(name) {
    delete cart[name];
    
    // Reset input value in menu UI
    document.querySelectorAll(".menu-card").forEach((card) => {
      if (card.querySelector("h3").textContent === name) {
        card.querySelector(".qty-input").value = 0;
      }
    });
    
    updateCheckoutBar();
    showCheckoutModal(true);
  }

  function clearCart(event) {
    if (event) event.preventDefault();
    cart = {};
    document.querySelectorAll(".qty-input").forEach(input => input.value = 0);
    updateCheckoutBar();
    const modalEl = document.getElementById("checkoutModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }

  function showCheckoutModal(isRefresh = false) {
    const listEl = document.getElementById("orderSummaryList");
    const totalEl = document.getElementById("modalGrandTotal");

    listEl.innerHTML = "";
    let total = 0;
    let hasItems = false;

    for (const name in cart) {
      const item = cart[name];
      const subtotal = item.price * item.qty;
      total += subtotal;
      hasItems = true;

      // Check if it's a coffee (basic check)
      const isCoffee = name.toLowerCase().includes("espresso") || name.toLowerCase().includes("latte") || name.toLowerCase().includes("cappuccino") || name.toLowerCase().includes("frap") || name.toLowerCase().includes("con panna") || name.toLowerCase().includes("mocca") || name.toLowerCase().includes("dalgona") || name.toLowerCase().includes("americano") || name.toLowerCase().includes("macchiato");

      let addOnHtml = "";
      if (isCoffee) {
        addOnHtml = `
          <select class="form-select select-modern mt-2 add-on-select" data-item-name="${name}">
            <option value="Normal">Normal</option>
            <option value="Decaf">Decaf (+Rp 5.000)</option>
            <option value="Less Sugar">Less Sugar</option>
            <option value="Oat Milk">Oat Milk (+Rp 10.000)</option>
            <option value="Extra Shot">Extra Shot (+Rp 5.000)</option>
          </select>
        `;
      } else {
        addOnHtml = `
          <select class="form-select select-modern mt-2 add-on-select" data-item-name="${name}">
            <option value="Normal">Normal</option>
            <option value="Pedas">Pedas</option>
            <option value="Tidak Pedas">Tidak Pedas</option>
          </select>
        `;
      }

      listEl.innerHTML += `
        <div class="order-item align-items-start border-bottom pb-3 mb-3">
          <div class="order-item-info w-100 me-3">
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="mb-1 fw-bold">${name}</h6>
              <button class="btn-trash" onclick="removeFromCart('${name}')" title="Hapus Item"><i class="bi bi-trash"></i></button>
            </div>
            <span class="text-muted d-block mb-2">Rp ${item.price.toLocaleString("id-ID")}</span>
            ${addOnHtml}
            <div class="modal-qty-control mt-3">
              <button class="qty-btn-sm" onclick="updateCartQty('${name}', -1)"><i class="bi bi-dash"></i></button>
              <span class="mx-2 fw-bold">${item.qty}</span>
              <button class="qty-btn-sm" onclick="updateCartQty('${name}', 1)"><i class="bi bi-plus"></i></button>
            </div>
          </div>
          <div class="order-item-price align-self-end fw-bold text-success">Rp ${subtotal.toLocaleString("id-ID")}</div>
        </div>
      `;
    }

    if (!hasItems) {
      listEl.innerHTML =
        '<p class="text-center text-muted py-4">Keranjang Anda kosong.</p>';
    }

    totalEl.textContent = `Rp ${total.toLocaleString("id-ID")}`;

    if (!isRefresh) {
      const modal = new bootstrap.Modal(document.getElementById("checkoutModal"));
      modal.show();
    }
  }

  function generateOrderNo() {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${rand}`;
  }

  function confirmOrder(event) {
    event.preventDefault();
    
    const customerName = document.getElementById("customerName").value.trim();
    if (!customerName) {
      alert("Mohon masukkan Nama Pemesan terlebih dahulu!");
      return;
    }
    
    const orderType = document.getElementById("orderType").value;
    const paymentMethod = document.getElementById("paymentMethod").value;
    const customerNote = document.getElementById("customerNote").value.trim();
    const orderNo = generateOrderNo();
    
    let total = 0;
    let waText = `Halo DE CAFÉ, saya ingin memesan:\n\n*No. Pesanan:* ${orderNo}\n*Nama:* ${customerName}\n*Tipe Pesanan:* ${orderType}\n*Pembayaran:* ${paymentMethod}\n*Catatan:* ${customerNote || "-"}\n\n*Detail Pesanan:*\n`;
    let receiptText = `================================\n           DE CAFÉ\n      STRUK PEMBELIAN\n================================\nNo. Pesanan : ${orderNo}\nTanggal     : ${new Date().toLocaleString('id-ID')}\nNama Pemesan: ${customerName}\nTipe Pesanan: ${orderType}\nPembayaran  : ${paymentMethod}\nCatatan     : ${customerNote || "-"}\n--------------------------------\n`;
    
    const receiptItems = [];

    const addOnSelects = document.querySelectorAll(".add-on-select");
    const itemAddOns = {};
    addOnSelects.forEach(select => {
      itemAddOns[select.getAttribute("data-item-name")] = select.value;
    });

    for (const name in cart) {
      const item = cart[name];
      let price = item.price;
      const addOn = itemAddOns[name] || "Normal";
      
      let addOnPrice = 0;
      if (addOn.includes("+Rp 5.000")) addOnPrice = 5000;
      if (addOn.includes("+Rp 10.000")) addOnPrice = 10000;
      
      const subtotal = (price + addOnPrice) * item.qty;
      total += subtotal;
      
      const addOnText = addOn !== "Normal" ? ` [${addOn}]` : "";
      
      waText += `- ${name}${addOnText} (${item.qty}x) = Rp ${subtotal.toLocaleString("id-ID")}\n`;
      receiptText += `${name}${addOnText}\n${item.qty} x Rp ${(price + addOnPrice).toLocaleString("id-ID")} = Rp ${subtotal.toLocaleString("id-ID")}\n`;
      
      receiptItems.push({
        name: name,
        qty: item.qty,
        addOn: addOn,
        price: price + addOnPrice,
        subtotal: subtotal
      });
    }

    waText += `\n*Total Bayar: Rp ${total.toLocaleString("id-ID")}*`;
    receiptText += `--------------------------------\nTotal Bayar: Rp ${total.toLocaleString("id-ID")}\n================================\nTerima kasih atas kunjungan Anda!`;

    pendingOrderData = {
      orderNo,
      customerName,
      date: new Date().toISOString(),
      orderType,
      paymentMethod,
      items: receiptItems,
      total,
      receiptText,
      waText
    };

    if (paymentMethod === "Cash") {
      // Jika cash, konfirmasi native lalu buka WA tanpa download struk otomatis
      if (confirm("Apakah pesanan Anda sudah benar?")) {
        saveOrderAndRedirectWA(false);
      }
    } else {
      // Jika QRIS atau TF, tampilkan paymentModal
      const checkoutModal = bootstrap.Modal.getInstance(document.getElementById("checkoutModal"));
      checkoutModal.hide();
      
      document.getElementById("paymentTotal").textContent = `Rp ${total.toLocaleString("id-ID")}`;
      document.getElementById("paymentModalTitle").textContent = `Pembayaran ${paymentMethod}`;
      
      if (paymentMethod === "QRIS") {
        document.getElementById("qrisBox").classList.remove("d-none");
        document.getElementById("tfBox").classList.add("d-none");
      } else {
        document.getElementById("qrisBox").classList.add("d-none");
        document.getElementById("tfBox").classList.remove("d-none");
      }
      
      const paymentModal = new bootstrap.Modal(document.getElementById("paymentModal"));
      paymentModal.show();
    }
  }

  function finishPayment() {
    saveOrderAndRedirectWA(true);
    const paymentModal = bootstrap.Modal.getInstance(document.getElementById("paymentModal"));
    if (paymentModal) paymentModal.hide();
  }

  function saveOrderAndRedirectWA(downloadReceipt) {
    if (!pendingOrderData) return;
    
    // Simpan ke Local Storage
    const existingOrders = JSON.parse(localStorage.getItem("deCafeOrders") || "[]");
    existingOrders.push(pendingOrderData);
    localStorage.setItem("deCafeOrders", JSON.stringify(existingOrders));

    if (downloadReceipt) {
      // Buat dan download file struk.txt
      const blob = new Blob([pendingOrderData.receiptText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `struk_de_cafe_${pendingOrderData.orderNo}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // Buka WhatsApp
    const waUrl = `https://wa.me/6285180785177?text=${encodeURIComponent(pendingOrderData.waText)}`;
    window.open(waUrl, "_blank");
    
    // Bersihkan keranjang
    clearCart();
  }

  // ================= DYNAMIC PROMO LOGIC =================
  const promoOptions = [
    {
      discount: "5%",
      title: "Diskon 5% Paket Hemat!",
      description:
        "Beli kombinasi <strong>makanan & minuman</strong> apa saja, dapatkan potongan langsung <strong>5%</strong> di kasir.",
      terms:
        '<p style="margin: 0 0 6px">Min. 1 makanan + 1 minuman</p><p style="margin: 0 0 6px">Berlaku setiap hari</p><p style="margin: 0">Hanya untuk makan di tempat</p>',
    },
    {
      discount: "10%",
      title: "Diskon 10% Pelajar & Mahasiswa!",
      description:
        "Tunjukkan <strong>kartu identitas</strong> pelajar/mahasiswa Anda untuk mendapatkan potongan <strong>10%</strong>.",
      terms:
        '<p style="margin: 0 0 6px">Wajib menunjukkan kartu identitas</p><p style="margin: 0 0 6px">Hanya berlaku hari Senin-Jumat</p><p style="margin: 0">Maks. 1x transaksi per hari</p>',
    },
    {
      discount: "15%",
      title: "Diskon 15% Weekend Seru!",
      description:
        "Nikmati akhir pekan Anda dengan diskon spesial <strong>15%</strong> untuk semua menu favorit.",
      terms:
        '<p style="margin: 0 0 6px">Berlaku Sabtu & Minggu</p><p style="margin: 0 0 6px">Min. transaksi Rp 100.000</p><p style="margin: 0">Berlaku untuk semua menu</p>',
    },
  ];

  function initDynamicPromo() {
    let promoIndex = sessionStorage.getItem("selectedPromoIndex");

    if (promoIndex === null) {
      // Pilih random jika belum ada di session
      promoIndex = Math.floor(Math.random() * promoOptions.length);
      sessionStorage.setItem("selectedPromoIndex", promoIndex);
    }

    const selectedPromo = promoOptions[parseInt(promoIndex)];

    // Apply ke DOM
    const discountCircle = document.getElementById("promoDiscountCircle");
    const titleEl = document.getElementById("promoTitle");
    const descEl = document.getElementById("promoDescription");
    const termsEl = document.getElementById("promoTerms");

    if (discountCircle) discountCircle.textContent = selectedPromo.discount;
    if (titleEl) titleEl.textContent = selectedPromo.title;
    if (descEl) descEl.innerHTML = selectedPromo.description;
    if (termsEl) termsEl.innerHTML = selectedPromo.terms;
  }

  // Jalankan saat dokumen siap
  document.addEventListener("DOMContentLoaded", initDynamicPromo);
