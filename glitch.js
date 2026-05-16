(function () {
  var phone = document.querySelector(".phone");
  if (!phone) return;

  var overlay = document.createElement("div");
  overlay.className = "glitch-overlay";
  phone.appendChild(overlay);

  var activeTimer = null;
  var cleanupTimer = null;

  function clearGlitch() {
    overlay.classList.remove("active");
    phone.classList.remove("glitch-active");
    if (cleanupTimer) {
      window.clearTimeout(cleanupTimer);
      cleanupTimer = null;
    }
  }

  function randomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  }

  function createBar(top, height, offset, alpha, dark) {
    var bar = document.createElement("div");
    bar.className = "glitch-bar";
    if (dark) bar.dataset.tone = "dark";
    bar.style.top = top + "%";
    bar.style.height = height + "px";
    bar.style.transform = "translateX(" + offset + "px)";
    bar.style.opacity = alpha;
    overlay.appendChild(bar);
    return bar;
  }

  function createSlice(top, height, offset, alpha) {
    return createBar(top, height, offset, alpha, false);
  }

  function spawnGlitch() {
    overlay.innerHTML = "";

    var sliceCount = randomInt(3, 5);
    for (var i = 0; i < sliceCount; i++) {
      var top = randomInt(8, 80);
      var height = randomInt(18, 55);
      var offset = randomInt(-30, 40);
      var alpha = 0.14 + Math.random() * 0.16;
      createSlice(top, height, offset, alpha);
    }

    var noise = document.createElement("div");
    noise.className = "glitch-noise";
    overlay.appendChild(noise);

    var accent = document.createElement("div");
    accent.className = "glitch-accent";
    overlay.appendChild(accent);
  }

  function triggerGlitch() {
    clearGlitch();
    spawnGlitch();
    overlay.classList.add("active");
    phone.classList.add("glitch-active");

    cleanupTimer = window.setTimeout(function () {
      overlay.classList.remove("active");
      cleanupTimer = null;
    }, 1000);
  }

  window.iamgodTriggerGlitch = triggerGlitch;
})();
