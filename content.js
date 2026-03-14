(() => {
  const COUNTDOWN = 15;

  const messages = [
    "You opened this <strong>unconsciously</strong>.<br>Is this really what you want to do right now?",
    "Pause. Take a breath.<br>You have <strong>better things</strong> going on.",
    "This moment was<strong> automatic</strong>.<br>Now it's a choice.",
    "Your attention is<strong> valuable</strong>.<br>Spend it intentionally.",
    "The scroll can wait.<br>You are <strong>in control</strong>.",
  ];

  const msg = messages[Math.floor(Math.random() * messages.length)];

  // Build overlay HTML
  const overlay = document.createElement('div');
  overlay.id = 'shorts-pause-overlay';
  overlay.innerHTML = `
    <div id="shorts-pause-box">
      <h2>Shorts Pause</h2>
      <div id="shorts-pause-timer">${COUNTDOWN}</div>
      <div id="shorts-pause-bar-track">
        <div id="shorts-pause-bar"></div>
      </div>
      <p id="shorts-pause-message">${msg}</p>
      <button id="shorts-pause-btn">Watch now</button>
    </div>
  `;

  // Block scrolling on page while overlay is up
  document.documentElement.style.overflow = 'hidden';

  const inject = () => {
    if (!document.body) {
      requestAnimationFrame(inject);
      return;
    }
    document.body.appendChild(overlay);
    startCountdown();
  };

  const startCountdown = () => {
    const timerEl = document.getElementById('shorts-pause-timer');
    const barEl   = document.getElementById('shorts-pause-bar');
    const btnEl   = document.getElementById('shorts-pause-btn');

    let remaining = COUNTDOWN;

    // Trigger CSS bar animation on next frame so transition fires
    requestAnimationFrame(() => {
      barEl.style.width = '0%';
    });

    const tick = () => {
      remaining--;
      timerEl.textContent = remaining;

      if (remaining <= 0) {
        clearInterval(interval);
        timerEl.textContent = '✓';
        btnEl.style.display = 'inline-block';
        
      }
    };

    const interval = setInterval(tick, 1000);

    const dismiss = () => {
      overlay.style.transition = 'opacity 0.25s';
      overlay.style.opacity = '0';
      document.documentElement.style.overflow = '';
      setTimeout(() => overlay.remove(), 300);
    };

    btnEl.addEventListener('click', dismiss);

  };

  // Run on initial load
  inject();

  // YouTube is a SPA — re-run overlay on Shorts navigation
  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (/youtube\.com\/shorts\//.test(location.href)) {
        // Small delay so the new page DOM settles
        setTimeout(() => {
          const existing = document.getElementById('shorts-pause-overlay');
          if (!existing) inject();
        }, 400);
      }
    }
  });

  observer.observe(document.body || document.documentElement, {
    subtree: true,
    childList: true,
  });
})();
