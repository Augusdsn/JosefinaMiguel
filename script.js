/* Abrir invitación */

const page = document.querySelector(".page");
const openInviteBtn = document.getElementById("openInvite");
const muteBtn = document.getElementById("muteBtn");
const backgroundMusic = document.getElementById("backgroundMusic");

let isPlaying = false;
let startedMuted = false;
let autoplayTries = 0;
const AUTOPLAY_MAX_TRIES = 6;
const AUTOPLAY_RETRY_MS = 700;

// Helper to start background music (handles autoplay restrictions gracefully)
function startMusic(forceUnmute = false) {
  if (!backgroundMusic) return;

  // iOS/Safari niceties
  try {
    backgroundMusic.setAttribute("playsinline", "");
    backgroundMusic.playsInline = true;
  } catch (e) {}

  // If already playing, just handle unmute requests
  if (!backgroundMusic.paused) {
    if (forceUnmute) {
      backgroundMusic.muted = false;
      backgroundMusic.volume = 0.7;
      startedMuted = false;
      if (muteBtn) {
        muteBtn.textContent = "🔊";
        muteBtn.classList.remove("muted");
      }
    }
    return;
  }

  // Goal: start immediately on load WITHOUT user interaction.
  // The only reliable cross-browser way is to start muted.
  backgroundMusic.autoplay = true;
  backgroundMusic.muted = true;
  backgroundMusic.volume = 0.7;

  const mutedPlay = backgroundMusic.play();
  if (mutedPlay !== undefined) {
    mutedPlay
      .then(() => {
        isPlaying = true;
        startedMuted = true;
        if (muteBtn) {
          muteBtn.textContent = "🔇";
          muteBtn.classList.add("muted");
        }

        // If the caller explicitly asked to unmute (user gesture), do it now.
        if (forceUnmute) {
          backgroundMusic.muted = false;
          backgroundMusic.volume = 0.7;
          startedMuted = false;
          if (muteBtn) {
            muteBtn.textContent = "🔊";
            muteBtn.classList.remove("muted");
          }
          return;
        }

        // Try to auto-unmute (will usually be blocked). If blocked, stay muted.
        try {
          backgroundMusic.muted = false;
          const unmuteTry = backgroundMusic.play();
          if (unmuteTry !== undefined) {
            unmuteTry
              .then(() => {
                startedMuted = false;
                if (muteBtn) {
                  muteBtn.textContent = "🔊";
                  muteBtn.classList.remove("muted");
                }
              })
              .catch(() => {
                backgroundMusic.muted = true;
              });
          }
        } catch (e) {
          backgroundMusic.muted = true;
        }
      })
      .catch((err) => {
        console.log("Muted autoplay was prevented:", err);
      });
  }
}

// Init autoplay ASAP (muted)
window.addEventListener("DOMContentLoaded", () => {
  // small delay helps some mobile browsers
  setTimeout(() => startMusic(false), 50);
});

// If the audio wasn't ready yet, try again as soon as it can play
if (backgroundMusic) {
  backgroundMusic.addEventListener(
    "canplay",
    () => {
      if (!isPlaying) startMusic(false);
    },
    { once: true }
  );
}

// Retry a few times in case the first autoplay attempt is delayed
const autoplayRetry = setInterval(() => {
  if (isPlaying || autoplayTries >= AUTOPLAY_MAX_TRIES) {
    clearInterval(autoplayRetry);
    return;
  }
  autoplayTries += 1;
  startMusic(false);
}, AUTOPLAY_RETRY_MS);

// Fallback: first user interaction starts music if blocked
["click", "touchstart"].forEach((evt) => {
  document.addEventListener(
    evt,
    () => {
      startMusic(true);
    },
    { once: true }
  );
});

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
    startMusic(true);
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
    if (!backgroundMusic) return;

    // If not playing yet, this user gesture can start + unmute
    if (backgroundMusic.paused) {
      startMusic(true);
      return;
    }

    // Toggle mute state WITHOUT pausing
    if (backgroundMusic.muted) {
      backgroundMusic.muted = false;
      backgroundMusic.volume = 0.7;
      startedMuted = false;
      muteBtn.textContent = "🔊";
      muteBtn.classList.remove("muted");
    } else {
      backgroundMusic.muted = true;
      startedMuted = true;
      muteBtn.textContent = "🔇";
      muteBtn.classList.add("muted");
    }
  });
}

// Keep button state in sync with actual playback
if (backgroundMusic) {
  backgroundMusic.addEventListener("pause", () => {
    isPlaying = false;
    // When paused, show muted icon (no audio)
    if (muteBtn) {
      muteBtn.textContent = "🔇";
      muteBtn.classList.add("muted");
    }
  });

  backgroundMusic.addEventListener("play", () => {
    isPlaying = true;
    if (muteBtn) {
      muteBtn.textContent = "🔊";
      muteBtn.classList.remove("muted");
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
