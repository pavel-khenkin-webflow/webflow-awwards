// pages/ai-voiceover-e-cloning/index.js — без ESM
document.addEventListener('DOMContentLoaded', () => {
  // GSAP плагины из CDN
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
      onUpdate: () => showPreloaderNum('.preloader_num', preloaderObj)
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

      // run-line.js
      const animationConfig = [
        { textSelector: '.line-text', pathSelector: '.hero-line-01' },
      ];
      if (typeof window.setupResizeListener === 'function') {
        window.setupResizeListener(animationConfig);
      }

      // ==== HERO ====
      const splitH1Hero = new SplitText('[animate="text-h1"]', { type: 'words, chars' });
      gsap.from(splitH1Hero.chars, { duration: 0.4, y: 100, autoAlpha: 0, stagger: 0.02 });

      const heroTimeLine = gsap.timeline({});
      heroTimeLine
        .from('[animate="hero-text"]', { opacity: 0, y: '50%', duration: 0.6, delay: 0.5 }, 0)
        .from("[animate='hero_card']", { opacity: 0, y: '100%', duration: 0.6, stagger: 0.1 }, 0)
        .from('.section_ai .bg-line', { height: '0%', duration: 3, stagger: 0.2, delay: 0.5 }, 0)
        .from('.ai_lines', { opacity: 0, duration: 2 }, 0);

      // ==== AI VOICE SECTION ====
      const aiVoiceTl = gsap.timeline({
        scrollTrigger: { trigger: '.section_ai-voice', start: 'top center', end: 'bottom bottom' }
      }).from('.section_ai-voice .bg-line', { height: '0%', duration: 3, stagger: 0.2, delay: 0.5 }, 0);

      // TOP card
      const aiVoiceTitle01 = new SplitText("[da='ai-voice-title-01']", { type: 'words, chars' });
      const aiVoiceCard01Tl = gsap.timeline({
        scrollTrigger: { trigger: "[da='ai-voice-card-01']", start: 'top center', end: 'bottom bottom' }
      });
      aiVoiceCard01Tl
        .from(aiVoiceTitle01.chars, { duration: 0.3, y: 100, autoAlpha: 0, stagger: 0.02 })
        .from("[da='ai-voice-card-01'] [da='ai-voice-text']", { opacity: 0, duration: 0.4 }, '<')
        .from("[da='ai-voice-card-01'] .ai-voice_card-image", { opacity: 0, y: '50%', duration: 0.6 }, '<');

      // Demo pulsation
      const aiDemoCircleWrapper = document.querySelector('.ai-record-demo_btn');
      const aiDemoCircle = document.querySelector('.ai-record-demo_btn-wrapper');
      if (aiDemoCircleWrapper && aiDemoCircle) {
        const aiDemoCircleTl = gsap.timeline({ duration: 0.6, yoyo: true, repeat: -1 });
        aiDemoCircleTl.to(aiDemoCircleWrapper, { scale: 1.1 })
                      .to(aiDemoCircle, { scale: 1.02 }, '<');
      }

      // BOTTOM card
      const aiVoiceTitle02 = new SplitText("[da='ai-voice-title-02']", { type: 'words, chars' });
      const aiVoiceCard02Tl = gsap.timeline({
        scrollTrigger: { trigger: "[da='ai-voice-card-02']", start: 'top center', end: 'bottom bottom' }
      });
      aiVoiceCard02Tl
        .from(aiVoiceTitle02.chars, { duration: 0.3, y: 100, autoAlpha: 0, stagger: 0.02 })
        .from("[da='ai-voice-card-02'] [da='ai-voice-text']", { opacity: 0, duration: 0.4 }, '<')
        .from("[da='ai-voice-card-02'] .ai-voice_card-image", { opacity: 0, y: '50%', duration: 0.6 }, '<');

      // ==== Demo text =====
      const aiDemoWrapper = document.querySelector('.ai-voice_demo');
      if (aiDemoWrapper) {
        const aiDemoText  = aiDemoWrapper.querySelector('.ai-voice-demo_text');
        const aiDemoBtn   = aiDemoWrapper.querySelector('.ai-voice-demo_btn');
        const aiDemoSound = aiDemoWrapper.querySelector('.ai_voice-demo_bot');

        if (aiDemoText && aiDemoBtn && aiDemoSound) {
          const aiDemoSplit = new SplitText(aiDemoText, { type: 'words' });

          gsap.set(aiDemoSound, { opacity: 0, height: 0 });
          gsap.set(aiDemoSplit.words, { opacity: 0, y: '50%' });

          const aiDemoTl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
          aiDemoTl
            .to(aiDemoSplit.words, { opacity: 1, y: '0%', duration: 1, stagger: 0.1 })
            .to(aiDemoBtn, { backgroundColor: '#005EFF', duration: 0.5 })
            .to(aiDemoBtn, { rotation: 180, duration: 0.5 })
            .to(aiDemoSound, {
              opacity: 1,
              height: 'auto',
              duration: 1,
              onComplete: () => {
                gsap.to(aiDemoSound, { opacity: 0, height: 0, delay: 1, duration: 1 });
                gsap.to(aiDemoBtn, { backgroundColor: '#141718', rotation: 0, duration: 0.5 }, '<');
              }
            });
        }
      }
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
