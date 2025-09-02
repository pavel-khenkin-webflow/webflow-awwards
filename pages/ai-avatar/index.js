// pages/ai-avatar/index.js — без ESM
document.addEventListener('DOMContentLoaded', () => {
  // GSAP плагины глобальны (из CDN)
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, TextPlugin, SplitText);
  }

  // ----- Прелоадер -----
  function duringLoading() {
    const preloaderObj = { count: 0 };
    const showPreloaderNum = (selector, obj) => {
      const el = document.querySelector(selector);
      if (el) el.textContent = `${Math.floor(obj.count)}%`;
    };

    gsap.to(preloaderObj, {
      count: 100,
      onUpdate: () => showPreloaderNum('.preloader_num', preloaderObj) // <- фикс
    });
  }

  duringLoading();

  document.onreadystatechange = () => {
    if (document.readyState === 'interactive') {
      duringLoading();
    } else if (document.readyState === 'complete') {
      const preloader = document.querySelector('.preloader');
      if (preloader) {
        gsap.to(preloader, {
          opacity: 0,
          duration: 0.4,
          onComplete: () => { preloader.style.display = 'none'; }
        });
      }

      // Бегущая надпись по пути (если элемент есть на странице)
      if (typeof window.setupResizeListener === 'function') {
        const animationConfig = [
          { textPathSelector: '.textpathTeam', startOffsetMovePercent: '-45.82%' }
        ];
        window.setupResizeListener(animationConfig);
      }

      // === HERO ===
      const splitH1Hero = new SplitText('[animate="text-h1"]', { type: 'words, chars' });
      gsap.from(splitH1Hero.chars, { duration: 0.4, y: 100, autoAlpha: 0, stagger: 0.02 });

      const heroTl = gsap.timeline({});
      heroTl.from('[animate="hero-text"]', { opacity: 0, y: '50%', duration: 0.6, delay: 0.5 }, 0)
            .from('.ai-avatar_image',     { opacity: 0, y: '100%', duration: 0.6 }, 0)
            .from('.section_ai .bg-line', { height: '0%', duration: 3, stagger: 0.2, delay: 0.5 }, 0)
            .from('.ai_lines',            { opacity: 0, duration: 2 }, 0);

      // === SECTION AI VOICE ===
      const aiVoiceTl = gsap.timeline({
        scrollTrigger: { trigger: '.section_ai-v', start: 'top center', end: 'bottom bottom' }
      }).from('.section_ai-v .bg-line', { height: '0%', duration: 3, stagger: 0.2, delay: 0.5 }, 0);

      // Карточка TOP
      const aiVoiceTitle01 = new SplitText("[da='ai-voice-title-01']", { type: 'words, chars' });
      const aiVoiceCard01Tl = gsap.timeline({
        scrollTrigger: { trigger: "[da='ai-voice-card-01']", start: 'top center', end: 'bottom bottom' }
      });
      aiVoiceCard01Tl.from(aiVoiceTitle01.chars, { duration: 0.3, y: 100, autoAlpha: 0, stagger: 0.02 })
                     .from("[da='ai-voice-card-01'] [da='ai-voice-text']", { opacity: 0, duration: 0.4 }, '<')
                     .from('.ai-v_image', { opacity: 0, y: '50%', duration: 0.6 }, '<')
                     .from('.ai_content_top-s', { opacity: 0, x: '-100%', duration: 0.6 }, '<');

      // Карточка BOTTOM
      const aiVoiceTitle02 = new SplitText("[da='ai-voice-title-02']", { type: 'words, chars' });
      const aiVoiceCard02Tl = gsap.timeline({
        scrollTrigger: { trigger: "[da='ai-voice-card-02']", start: 'top center', end: 'bottom bottom' }
      });
      aiVoiceCard02Tl.from(aiVoiceTitle02.chars, { duration: 0.3, y: 100, autoAlpha: 0, stagger: 0.02 })
                     .from("[da='ai-voice-card-02'] [da='ai-voice-text']", { opacity: 0, duration: 0.4 }, '<')
                     .from("[da='ai-voice-card-02'] .ai-v_card-content", { opacity: 0, y: '50%', duration: 0.6 }, '<');
    }
  };

  // Swiper (Other resources)
  if (typeof Swiper !== 'undefined') {
    new Swiper('.other-resources_slider', {
      slidesPerView: 'auto',
      spaceBetween: 30,
      speed: 1200,
      grabCursor: true,
      freeMode: true,
      navigation: {
        prevEl: '.other-resources_nav .navigation-prev',
        nextEl: '.other-resources_nav .navigation-next',
      },
    });
  }
});
