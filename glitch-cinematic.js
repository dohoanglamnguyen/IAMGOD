(function () {
  var glitchActive = false;

  function getPhone() {
    return document.querySelector(".phone");
  }

  function canRunCinematicGlitch() {
    try {
      if (!window.html2canvas) return false;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return false;
      }
      return !!getPhone();
    } catch (err) {
      return false;
    }
  }

  function placeOverlay(overlay, rect) {
    overlay.style.cssText =
      "position: fixed; top: " +
      rect.top +
      "px; left: " +
      rect.left +
      "px; width: " +
      rect.width +
      "px; height: " +
      rect.height +
      "px; z-index: 99999; pointer-events: none; overflow: hidden; background: rgba(102,0,0,0.2);";
  }

  function randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function runCssFallback(phone, rect) {
    var overlay = document.createElement("div");
    overlay.id = "glitch-overlay";
    placeOverlay(overlay, rect);
    document.body.appendChild(overlay);

    var sliceCount = 8 + Math.floor(Math.random() * 5);
    for (var i = 0; i < sliceCount; i++) {
      var bar = document.createElement("div");
      var topPct = randomRange(5, 85);
      var h = randomRange(12, 48);
      var offsetX = randomRange(-50, 50);
      bar.style.cssText =
        "position: absolute; left: 0; right: 0; top: " +
        topPct +
        "%; height: " +
        h +
        "px; transform: translateX(" +
        offsetX +
        "px); background: rgba(255,255,255,0.08); mix-blend-mode: screen; opacity: " +
        randomRange(0.35, 0.85) +
        ";";
      overlay.appendChild(bar);
    }

    var tint = document.createElement("div");
    tint.style.cssText =
      "position: absolute; inset: 0; background: rgba(180,0,0,0.18); mix-blend-mode: screen; pointer-events: none;";
    overlay.appendChild(tint);

    var start = performance.now();
    function tick(now) {
      var elapsed = now - start;
      if (elapsed > 1000) {
        overlay.remove();
        glitchActive = false;
        return;
      }
      Array.prototype.forEach.call(overlay.children, function (child, idx) {
        if (idx === overlay.children.length - 1) return;
        child.style.transform =
          "translateX(" + randomRange(-60, 60) + "px) skewX(" + randomRange(-6, 6) + "deg)";
        child.style.opacity = String(randomRange(0.25, 0.9));
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function triggerCinematicGlitch() {
    if (!canRunCinematicGlitch()) return;
    if (glitchActive) return;

    var phone = getPhone();
    var rect = phone.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    glitchActive = true;

    var overlayContainer = document.createElement("div");
    overlayContainer.id = "glitch-overlay";
    placeOverlay(overlayContainer, rect);
    document.body.appendChild(overlayContainer);

    var preloadLayer = document.createElement("div");
    preloadLayer.style.cssText =
      "position: absolute; inset: 0; opacity: 0.35; mix-blend-mode: screen; background: radial-gradient(circle at 20% 20%, rgba(255,0,0,0.12), transparent 20%), radial-gradient(circle at 80% 25%, rgba(255,255,255,0.05), transparent 18%);";
    overlayContainer.appendChild(preloadLayer);

    var captureScale = Math.min(
      2,
      Math.max(1, (window.devicePixelRatio || 1) * (402 / rect.width))
    );
    if (rect.width * captureScale > 900) {
      captureScale = 900 / rect.width;
    }

    html2canvas(phone, {
      ignoreElements: function (el) {
        return el === overlayContainer || overlayContainer.contains(el);
      },
      backgroundColor: null,
      logging: false,
      scale: captureScale,
      useCORS: true,
      allowTaint: true,
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    })
      .then(function (sourceCanvas) {
        if (!sourceCanvas.width || !sourceCanvas.height) {
          throw new Error("Empty glitch capture");
        }

        overlayContainer.innerHTML = "";
        overlayContainer.style.background = "black";

        var canvasWidth = sourceCanvas.width;
        var canvasHeight = sourceCanvas.height;

        var sliceCount = Math.floor(15 + Math.random() * 11);
        var slices = [];
        var accumulatedY = 0;

        for (var i = 0; i < sliceCount; i++) {
          var sliceHeight =
            i === sliceCount - 1
              ? canvasHeight - accumulatedY
              : Math.floor(
                  (canvasHeight / sliceCount) * (0.6 + Math.random() * 0.8)
                );

          var sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvasWidth;
          sliceCanvas.height = sliceHeight;
          var sliceCtx = sliceCanvas.getContext("2d");

          sliceCtx.drawImage(
            sourceCanvas,
            0,
            accumulatedY,
            canvasWidth,
            sliceHeight,
            0,
            0,
            canvasWidth,
            sliceHeight
          );

          var sliceDiv = document.createElement("div");
          sliceDiv.style.cssText =
            "position: absolute; top: " +
            (accumulatedY / canvasHeight) * 100 +
            "%; left: 0; width: 100%; height: " +
            (sliceHeight / canvasHeight) * 100 +
            "%; z-index: 3; image-rendering: pixelated;";
          var sliceImg = document.createElement("img");
          sliceImg.src = sliceCanvas.toDataURL();
          sliceImg.style.cssText =
            "display: block; width: 100%; height: 100%; object-fit: fill;";
          sliceDiv.appendChild(sliceImg);
          overlayContainer.appendChild(sliceDiv);

          slices.push({
            element: sliceDiv
          });

          accumulatedY += sliceHeight;
        }

        var redLayer = document.createElement("canvas");
        redLayer.width = canvasWidth;
        redLayer.height = canvasHeight;
        redLayer.style.cssText =
          "position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; opacity: 0.3; mix-blend-mode: screen; filter: saturate(5) hue-rotate(0deg);";
        redLayer.getContext("2d").drawImage(sourceCanvas, 0, 0);
        overlayContainer.appendChild(redLayer);

        var blueLayer = document.createElement("canvas");
        blueLayer.width = canvasWidth;
        blueLayer.height = canvasHeight;
        blueLayer.style.cssText =
          "position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; opacity: 0.25; mix-blend-mode: screen; filter: saturate(5) hue-rotate(200deg);";
        blueLayer.getContext("2d").drawImage(sourceCanvas, 0, 0);
        overlayContainer.appendChild(blueLayer);

        var flickerLayer = document.createElement("div");
        flickerLayer.style.cssText =
          "position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 4; pointer-events: none;";
        overlayContainer.appendChild(flickerLayer);

        var scanlineLayer = document.createElement("div");
        scanlineLayer.style.cssText =
          "position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 5; background-image: repeating-linear-gradient(0deg, rgba(0,0,0,1) 0px, rgba(0,0,0,1) 1px, transparent 1px, transparent 4px); background-size: 100% 4px; opacity: 0.3; pointer-events: none;";
        overlayContainer.appendChild(scanlineLayer);

        var startTime = performance.now();
        var redBaseOffset = 12;
        var blueBaseOffset = -12;
        var frameCount = 0;

        function animateGlitch(currentTime) {
          var elapsed = currentTime - startTime;

          if (elapsed > 1000) {
            overlayContainer.remove();
            glitchActive = false;
            return;
          }

          frameCount++;

          slices.forEach(function (slice) {
            var offsetX = randomRange(-80, 80);
            var offsetY = randomRange(-10, 10);
            var scaleX = randomRange(0.85, 1.15);
            var skewX = randomRange(-8, 8);
            var opacity = randomRange(0.4, 1.0);
            var visible = Math.random() < 0.7;

            slice.element.style.transform =
              "translateX(" +
              offsetX +
              "px) translateY(" +
              offsetY +
              "px) scaleX(" +
              scaleX +
              ") skewX(" +
              skewX +
              "deg)";
            slice.element.style.opacity = visible ? opacity : 0;
          });

          redLayer.style.transform =
            "translateX(" + (redBaseOffset + randomRange(-5, 5)) + "px)";
          blueLayer.style.transform =
            "translateX(" + (blueBaseOffset + randomRange(-5, 5)) + "px)";

          if (frameCount % (2 + Math.floor(Math.random() * 3)) === 0) {
            var flickerState = Math.random();
            if (flickerState < 0.33) {
              flickerLayer.style.background = "rgba(180, 0, 0, 0.15)";
            } else if (flickerState < 0.66) {
              flickerLayer.style.background = "rgba(0, 0, 0, 0.6)";
            } else {
              flickerLayer.style.background = "transparent";
            }
          }

          scanlineLayer.style.backgroundPosition =
            "0 " + (((elapsed / 1000) * 60) % 4) + "px";

          requestAnimationFrame(animateGlitch);
        }

        requestAnimationFrame(animateGlitch);
      })
      .catch(function (error) {
        if (overlayContainer.parentNode) {
          overlayContainer.remove();
        }
        glitchActive = false;
        console.warn("Cinematic glitch capture failed, using CSS fallback:", error);
        runCssFallback(phone, rect);
      });
  }

  window.iamgodTriggerCinematicGlitch = triggerCinematicGlitch;
})();
