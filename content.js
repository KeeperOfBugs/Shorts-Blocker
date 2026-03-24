(() => {
  const COUNTDOWN = 15;

  const messages = [
    "You opened this <strong>unconsciously</strong>.<br>Is this really what you want to do right now?",
    "Pause. Take a breath.<br>You have <strong>better things</strong> going on.",
    "This moment was<strong> automatic</strong>.<br>Now it's a choice.",
    "Your attention is<strong> valuable</strong>.<br>Spend it intentionally.",
    "The scroll can wait.<br>You are <strong>in control</strong>.",
  ];

  let countdownActive = false;

  let msg = messages[Math.floor(Math.random() * messages.length)];

  const buildOverlay = () => {
    const overlay = document.createElement('div');
    overlay.id = 'shorts-pause-overlay';
    msg = messages[Math.floor(Math.random() * messages.length)];
    overlay.innerHTML = `
      <div id="shorts-pause-box">
        <h2>Shorts Pause</h2>
        <div id="shorts-pause-timer">${COUNTDOWN}</div>
        <div id="shorts-pause-bar-track">
          <div id="shorts-pause-bar"></div>
        </div>
        <p id="shorts-pause-message">${msg}</p>
        <button id="shorts-pause-btn">Watch now</button>
        <h1 id="or"> OR </h1>
        <form action="">
            <label id="iaskagain">Whats 33 + 34?</label>
            <input type="text" name="answer" id="answer" placeholder="Solve to watch!"><button type="button" id="answertry">Try</button>
        </form>
      </div>
    `;
    return overlay;
  };

  const startCountdown = (overlay) => {
    const timerEl = overlay.querySelector('#shorts-pause-timer');
    const barEl   = overlay.querySelector('#shorts-pause-bar');
    const btnEl   = overlay.querySelector('#shorts-pause-btn');

    let remaining = COUNTDOWN;

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
      countdownActive = false;
      overlay.style.pointerEvents = 'none';
      overlay.style.transition = 'opacity 0.25s';
      resumeShort();
      overlay.style.opacity = '0';
      document.documentElement.style.overflow = '';
      setTimeout(() => overlay.remove(), 300);
    };

    btnEl.addEventListener('click', dismiss);
  };

  let videoWatcher = null;

  const pauseShort = () => {
    document.querySelectorAll('video').forEach(v => v.pause());

    if (videoWatcher) videoWatcher.disconnect();
    videoWatcher = new MutationObserver(() => {
      document.querySelectorAll('video').forEach(v => {
        if (!v.paused) v.pause();
      });
    });
    videoWatcher.observe(document.documentElement, { childList: true, subtree: true });
  };

  const resumeShort = () => {
    if (videoWatcher) {
      videoWatcher.disconnect();
      videoWatcher = null;
    }
    document.querySelectorAll('video').forEach(v => v.play());
  };

  const inject = () => {
    if (!document.body) {
      requestAnimationFrame(inject);
      return;
    }
    // Guard: don't double-inject
    if (document.getElementById('shorts-pause-overlay')) return;

    const overlay = buildOverlay();
    let bar = overlay.querySelector("#shorts-pause-bar");
    document.documentElement.style.overflow = 'hidden';
    document.body.appendChild(overlay);
    pauseShort();
    startCountdown(overlay);
    bar.style.transition = "0s linear"
    bar.style.width = '100%';
    bar.style.transition = "width 15s linear";
  };

  const tryInject = () => {
    if (!/\/shorts\//.test(location.pathname)) return;
    if (document.getElementById('shorts-pause-overlay')) return;
    if (countdownActive) return;
    countdownActive = true;
    inject();
  };

  let lastPathname = location.pathname;

  const checkPage = () => {
    // console.log(location.pathname)
    // Detect SPA navigation (URL change without full reload)
    if (location.pathname != lastPathname) {
      lastPathname = location.pathname;
      if (/\/shorts\//.test(location.pathname)) {
        countdownActive = false;
        setTimeout(tryInject, 150);
      } else {
        let overlay = document.getElementById("shorts-pause-overlay")
        overlay.style.pointerEvents = 'none';
        overlay.style.transition = 'opacity 0.25s';
        overlay.style.opacity = '0';
        resumeShort();
        document.documentElement.style.overflow = '';
        setTimeout(() => overlay.remove(), 300);
      }
    }

    if (!/\/shorts\//.test(location.pathname)) return;
    
    // Ensure overlay remains if active
    if (!document.getElementById('shorts-pause-overlay') && countdownActive) {
      // Overlay was ripped out by YouTube's router — reset and re-inject
      countdownActive = false;
      setTimeout(tryInject, 150);
    }
  }

  // --- FIX 1: observe <html> with subtree:true so no DOM swap goes undetected ---
  const domObserver = new MutationObserver(() => {
    checkPage()
  });

  // Observe documentElement (not body) so we survive body replacement,
  // and use subtree:true to catch deep removals
  domObserver.observe(document.documentElement, { childList: true, subtree: true });

  // SPA navigation fallback (middle-click / in-app nav)
  document.addEventListener('yt-navigate-finish', () => {
    if (location.pathname !== lastPathname) {
      lastPathname = location.pathname;
    }
    if (/\/shorts\//.test(location.pathname)) {
      countdownActive = false;
      setTimeout(tryInject, 300);
    }
  });

  window.addEventListener('popstate', (event) => {
    checkPage()
  });

  // Initial attempt
  tryInject();
})();