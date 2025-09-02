// utility/run-line.js (новая версия без import)
(function () {
  // gsap уже глобальный из CDN
  function animateTextOnPath(textPathSelector, startOffsetMovePercent, duration = 25) {
    const textPaths = document.querySelectorAll(textPathSelector);
    textPaths.forEach(el => {
      if (!el || !el.getAttribute) return;
      gsap.to(el, {
        attr: { startOffset: startOffsetMovePercent },
        duration,
        ease: 'linear',
        repeat: -1
      });
    });
  }

  function debounce(func, wait = 100) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function setupResizeListener(animationConfig) {
    let animations = [];

    function initAllAnimations() {
      animations.forEach(anim => anim?.kill?.());
      animations = animationConfig
        .filter(({ textPathSelector }) => {
          const el = document.querySelector(textPathSelector);
          return el && getComputedStyle(el).display !== 'none';
        })
        .map(({ textPathSelector, startOffsetMovePercent, duration }) =>
          animateTextOnPath(textPathSelector, startOffsetMovePercent, duration)
        );
    }

    window.addEventListener('resize', debounce(initAllAnimations, 300));
    initAllAnimations();
  }

  // Экспортируем в глобальную область
  window.animateTextOnPath = animateTextOnPath;
  window.debounce = debounce;
  window.setupResizeListener = setupResizeListener;
})();
