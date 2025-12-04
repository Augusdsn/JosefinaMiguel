/* Abrir invitación */

const page = document.querySelector(".page");
const openInviteBtn = document.getElementById("openInvite");
const muteBtn = document.getElementById("muteBtn");
const backgroundMusic = document.getElementById("backgroundMusic");

let isPlaying = false;

if (openInviteBtn) {
openInviteBtn.addEventListener("click", () => {
  // 1) Fade-out cinematografico del hero
  page.classList.add("fade-out-hero");

  // Fade-out del pasaporte cerrado
  const passportClosed = document.querySelector(".hero-passport-img");
  passportClosed.classList.add("fade-out");

  passportClosed.addEventListener("transitionend", () => {
    passportClosed.style.display = "none";
  }, { once: true });

  // 2) Mostrar layout con fade-in suave
  setTimeout(() => {
    page.classList.add("show-layout");
    document.body.classList.add("show-layout");
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // 3) Start playing music when entering hero-open
    if (backgroundMusic && !isPlaying) {
      backgroundMusic.volume = 0.7; // Set volume to 70%
      const playPromise = backgroundMusic.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log("Music started playing");
          isPlaying = true;
        }).catch(err => {
          console.log("Autoplay was prevented:", err);
          // Try playing on user interaction
        });
      }
    }
  }, 1000);

  // 4) Activar animacion del pasaporte abierto (fade-in + saltito)
  setTimeout(() => {
    const passportOpen = document.querySelector(".collage-open");
    passportOpen.classList.add("show");
  }, 1200);
})
}

/* Music mute button */
if (muteBtn) {
  muteBtn.addEventListener("click", () => {
    if (backgroundMusic) {
      if (backgroundMusic.paused) {
        // Play the music
        backgroundMusic.volume = 0.7; // Keep volume at 70%
        backgroundMusic.play().catch(err => {
          console.log("Play error:", err);
        });
        muteBtn.textContent = "🔊";
        muteBtn.classList.remove("muted");
      } else {
        // Pause the music
        backgroundMusic.pause();
        muteBtn.textContent = "🔇";
        muteBtn.classList.add("muted");
      }
    }
  });
}

/* COUNTDOWN */

// Fecha exacta del evento
const targetDate = new Date("2026-03-20T17:00:00");

function monthDiff(a, b) {
  let months = (b.getFullYear() - a.getFullYear()) * 12;
  months += b.getMonth() - a.getMonth();
  return Math.max(0, months);
}

function updateCountdown() {
  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    updateDigits("months-container", 0);
    updateDigits("days-container", 0);
    updateDigits("hours-container", 0);
    return;
  }

  const months = monthDiff(now, targetDate);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24)) % 30;
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;

  updateDigits("months-container", months);
  updateDigits("days-container", days);
  updateDigits("hours-container", hours);
}

function updateDigits(containerId, value) {
  const digits = value.toString().padStart(2, "0").split("");
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  digits.forEach((d) => {
    const el = document.createElement("div");
    el.className = "digit";

    const span = document.createElement("span");
    span.textContent = d;

    el.appendChild(span);
    container.appendChild(el);
  });
}

updateCountdown();
setInterval(updateCountdown, 60 * 1000); // Se actualiza cada minuto
