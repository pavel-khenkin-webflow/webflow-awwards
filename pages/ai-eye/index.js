// pages/ai-eye/index.js — версия без import/ESM
document.addEventListener('DOMContentLoaded', () => {
  // Зарегистрировать плагины GSAP (они уже подключены через CDN)
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

      // HERO
      const splitH1Hero = new SplitText('[animate="text-h1"]', { type: 'words, chars' });
      const heroTl = gsap.timeline({});
      heroTl.from(splitH1Hero.chars, { duration: 0.4, y: 100, autoAlpha: 0, stagger: 0.02 });
      heroTl.from('[animate="hero-text"]', { opacity: 0, y: '50%', duration: 0.6, delay: 0.5 }, '<');
      heroTl.from('.eye_content', { opacity: 0, y: '100%', duration: 0.6 }, '<');
      heroTl.from('.section_eye .bg-line', { height: '0%', duration: 3, stagger: 0.2, delay: 0.5 }, '<');
      heroTl.from('.ai_lines', { opacity: 0, duration: 2 }, 0);

      // Слайдер сравнения
      const eyeSlider = document.getElementById('eye-slider');
      const eyeContainer = document.querySelector('.eye_content');
      if (eyeSlider && eyeContainer) {
        eyeSlider.addEventListener('input', e => {
          eyeContainer.style.setProperty('--position', `${e.target.value}%`);
        });
      }

      // SECTION AI EYE CONTACT
      const aiContactTitle = new SplitText("[da='ai-contact-title']", { type: 'words, chars' });
      const aiContactTl = gsap.timeline({
        scrollTrigger: { trigger: '.section_eye-contact', start: 'top center', end: 'bottom bottom' }
      });
      aiContactTl.from(aiContactTitle.chars, { duration: 0.3, y: 100, autoAlpha: 0, stagger: 0.02 });
      aiContactTl.from("[da='ai-eye-text']", { opacity: 0, duration: 0.4 }, '<');
      aiContactTl.from('.eye-contact_content', { opacity: 0, y: '50%', duration: 0.6 }, '<');
      aiContactTl.from('.section_eye-contact .bg-line', { height: '0%', duration: 3, stagger: 0.2, delay: 0.5 }, '<');

    }
  };

  // Swiper (блок "Other resources")
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
