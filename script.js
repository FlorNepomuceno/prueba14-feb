function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

window.addEventListener('DOMContentLoaded', () => {
  const musicSection = document.getElementById('musicSection');
  const viewport = document.getElementById('viewport');
  const photoRoll = document.getElementById('photoRoll');
  const progressFill = document.getElementById('progressFill');
  const musicToggle = document.getElementById('musicToggle');
  const musicStatus = document.getElementById('musicStatus');
  const repeatBtn = document.getElementById('repeatBtn');
  const bgMusic = document.getElementById('bgMusic');

  if (
    !musicSection ||
    !viewport ||
    !photoRoll ||
    !progressFill ||
    !musicToggle ||
    !musicStatus ||
    !repeatBtn ||
    !bgMusic
  ) {
    return;
  }

  let targetProgress = 0;
  let smoothedProgress = 0;

  function getSectionProgress() {
    const sectionTop = musicSection.offsetTop;
    const sectionHeight = musicSection.offsetHeight;
    const viewportHeight = window.innerHeight;

    // Convertimos el scroll de la sección en un progreso normalizado [0..1].
    // Empieza en 0 cuando la sección entra en pantalla y termina en 1 al salir.
    const rawProgress = (window.scrollY - sectionTop) / (sectionHeight - viewportHeight);
    return clamp(rawProgress, 0, 1);
  }

  function updateRollPosition(progress) {
    const availableTravel = Math.max(photoRoll.scrollHeight - viewport.clientHeight, 0);
    const y = -availableTravel * progress;

    photoRoll.style.transform = `translateY(${y}px)`;

    // La barra usa el mismo progreso exacto del rollo para mantenerse sincronizada.
    progressFill.style.transform = `scaleX(${progress})`;
  }

  function animate() {
    targetProgress = getSectionProgress();

    // Lerp: acerca gradualmente el progreso visible al progreso real del scroll.
    // Esto suaviza saltos bruscos cuando el usuario se desplaza rápido.
    smoothedProgress = lerp(smoothedProgress, targetProgress, 0.12);

    if (Math.abs(smoothedProgress - targetProgress) < 0.001) {
      smoothedProgress = targetProgress;
    }

    updateRollPosition(smoothedProgress);
    requestAnimationFrame(animate);
  }

  musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic
        .play()
        .then(() => {
          musicToggle.textContent = 'Pausar música';
          musicStatus.textContent = 'Música: ON';
        })
        .catch(() => {
          musicStatus.textContent = 'Música: OFF (faltó cargar assets/music.mp3)';
        });
      return;
    }

    bgMusic.pause();
    musicToggle.textContent = 'Iniciar música';
    musicStatus.textContent = 'Música: OFF';
  });

  repeatBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('resize', () => {
    targetProgress = getSectionProgress();
    smoothedProgress = targetProgress;
    updateRollPosition(smoothedProgress);
  });

  requestAnimationFrame(animate);
});
