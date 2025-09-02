// pages/resources/index.js (новая версия без import)
document.addEventListener('DOMContentLoaded', () => {
  // Регистрируем плагины (глобальные из CDN)
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, TextPlugin, SplitText);

  // ----- Прелоадер -----
  function duringLoading() {
    const preloaderObj = { count: 0 };
    const showPreloaderNum = (selector, obj) => {
      const el = document.querySelector(selector);
      if (el) el.textContent = `${Math.floor(obj.count)}%`;
    };

    gsap.to(preloaderObj, {
      count: 100,
      duration: 2,
      onUpdate: () => showPreloaderNum('.preloader_num', preloaderObj) // <- исправлено имя класса
    });
  }

  duringLoading();

  document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
      const preloader = document.querySelector('.preloader');
      if (preloader) {
        gsap.to(preloader, {
          opacity: 0,
          duration: 0.4,
          onComplete: () => { preloader.style.display = 'none'; }
        });
      }
      // ----- Текст по пути (если он есть на странице) -----
      if (typeof window.setupResizeListener === 'function') {
        const animationConfig = [
          { textPathSelector: '.textpathTeamRev', startOffsetMovePercent: '-65.35%' },
          { textPathSelector: '.textpathTeam',    startOffsetMovePercent: '-61.46%' }
        ];
        window.setupResizeListener(animationConfig);
      }

      // ----- Горизонтальный скролл блока ресурсов -----
      const resourcesTrack   = document.querySelector('.resources_track');
      const resourcesContent = document.querySelector('.resources_wrapper');

      if (resourcesTrack && resourcesContent) {
        const update = () => {
          const contentW = resourcesContent.scrollWidth;
          const trackW   = resourcesTrack.offsetWidth;
          const maxOffset = trackW - contentW;

          // Сносим предыдущие триггеры, чтобы пересчитать при ресайзе/репаблише
          ScrollTrigger.getAll().forEach(t => {
            if (t.vars && t.vars.id === 'resources-scroll') t.kill(true);
          });

          const tl = gsap.timeline({
            scrollTrigger: {
              id: 'resources-scroll',
              trigger: resourcesTrack,
              start: '10% top',
              end: '90% bottom',
              scrub: 1
            }
          });

          // На десктопе двигаем контент влево
          if (window.matchMedia('(min-width: 479px)').matches) {
            tl.to(resourcesContent, { x: maxOffset });
          } else {
            // На мобилке — без горизонтального скролла
            gsap.set(resourcesContent, { x: 0 });
          }
        };

        update();
        // Обновление при ресайзе
        window.addEventListener('resize', () => {
          // чуть дебаунса чтобы не дёргалось
          clearTimeout(window.__resUpd);
          window.__resUpd = setTimeout(update, 150);
        });
      }
    }
  };
});
