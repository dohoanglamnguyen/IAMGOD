(function () {
  var glitchActive = false;

  function triggerCinematicGlitch() {
    if (glitchActive) return;
    glitchActive = true;

    var overlayContainer = document.createElement("div");
    overlayContainer.id = "glitch-overlay";
    overlayContainer.style.cssText =
      "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 99999; pointer-events: none; overflow: hidden; background: rgba(102,0,0,0.2);";
    document.body.appendChild(overlayContainer);

    var preloadLayer = document.createElement("div");
    preloadLayer.style.cssText =
      "position: absolute; inset: 0; opacity: 0.35; mix-blend-mode: screen; background: radial-gradient(circle at 20% 20%, rgba(255,0,0,0.12), transparent 20%), radial-gradient(circle at 80% 25%, rgba(255,255,255,0.05), transparent 18%);";
    overlayContainer.appendChild(preloadLayer);

    html2canvas(document.body, {
      ignoreElements: function (el) {
        return el === overlayContainer || overlayContainer.contains(el);
      },
      backgroundColor: null,
      logging: false,
      scale: 1,
      useCORS: true,
      allowTaint: true
    })
      .then(function (sourceCanvas) {
        overlayContainer.innerHTML = "";
        overlayContainer.style.background = "black";

        var sourceCtx = sourceCanvas.getContext("2d");
        var canvasWidth = sourceCanvas.width;
        var canvasHeight = sourceCanvas.height;

      var sliceCount = Math.floor(15 + Math.random() * 11);
      var slices = [];
      var accumulatedY = 0;

      for (var i = 0; i < sliceCount; i++) {
        var sliceHeight =
          i === sliceCount - 1
            ? canvasHeight - accumulatedY
            : Math.floor((canvasHeight / sliceCount) * (0.6 + Math.random() * 0.8));

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
          accumulatedY +
          "px; left: 0; width: 100%; height: " +
          sliceHeight +
          "px; z-index: 3; image-rendering: pixelated;";
        var sliceImg = document.createElement("img");
        sliceImg.src = sliceCanvas.toDataURL();
        sliceImg.style.cssText = "display: block; width: 100%; height: 100%; object-fit: cover;";
        sliceDiv.appendChild(sliceImg);
        overlayContainer.appendChild(sliceDiv);

        slices.push({
          element: sliceDiv,
          img: sliceImg,
          baseY: accumulatedY,
          height: sliceHeight,
          canvas: sliceCanvas,
          ctx: sliceCtx
        });

        accumulatedY += sliceHeight;
      }

      var redLayer = document.createElement("canvas");
      redLayer.width = canvasWidth;
      redLayer.height = canvasHeight;
      redLayer.style.cssText =
        "position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; opacity: 0.3; mix-blend-mode: screen; filter: saturate(5) hue-rotate(0deg);";
      var redCtx = redLayer.getContext("2d");
      redCtx.drawImage(sourceCanvas, 0, 0);
      overlayContainer.appendChild(redLayer);

      var blueLayer = document.createElement("canvas");
      blueLayer.width = canvasWidth;
      blueLayer.height = canvasHeight;
      blueLayer.style.cssText =
        "position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; opacity: 0.25; mix-blend-mode: screen; filter: saturate(5) hue-rotate(200deg);";
      var blueCtx = blueLayer.getContext("2d");
      blueCtx.drawImage(sourceCanvas, 0, 0);
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
      var tearActive = false;
      var tearData = null;

      function randomRange(min, max) {
        return min + Math.random() * (max - min);
      }

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

        var redOffsetX = redBaseOffset + randomRange(-5, 5);
        redLayer.style.transform = "translateX(" + redOffsetX + "px)";

        var blueOffsetX = blueBaseOffset + randomRange(-5, 5);
        blueLayer.style.transform = "translateX(" + blueOffsetX + "px)";

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

        var scrollPos = ((elapsed / 1000) * 60) % 4;
        scanlineLayer.style.backgroundPosition = "0 " + scrollPos + "px";

        if (frameCount % (3 + Math.floor(Math.random() * 3)) === 0 && !tearActive) {
          tearActive = true;
          var tearY = randomRange(0, canvasHeight * 0.8);
          var tearHeight = randomRange(20, 80);
          var tearOffsetX = randomRange(-120, 120);
          tearData = {
            y: tearY,
            height: tearHeight,
            offsetX: tearOffsetX,
            startFrame: frameCount
          };
        }

        if (tearActive && tearData) {
          if (frameCount - tearData.startFrame > 2) {
            tearActive = false;
            tearData = null;
          }
        }

        requestAnimationFrame(animateGlitch);
      }

      requestAnimationFrame(animateGlitch);
    })
    .catch(function (error) {
      if (overlayContainer) {
        overlayContainer.remove();
      }
      glitchActive = false;
      console.error("Cinematic glitch capture failed:", error);
    });
  }

  window.iamgodTriggerCinematicGlitch = triggerCinematicGlitch;
})();
