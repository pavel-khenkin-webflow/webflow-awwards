import { CSSPlugin, gsap } from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText, TextPlugin } from 'gsap/all'
import { setupResizeListener } from '../utility/run-line'

gsap.registerPlugin(
	ScrollTrigger,
	CSSPlugin,
	MotionPathPlugin,
	SplitText,
	TextPlugin
)

console.log('init!')
document.addEventListener('DOMContentLoaded', event => {
	// Hero load animate
	function duringLoading() {
		const preloaderObj = { count: 0 }
		const showPreloaderNum = (selector, obj) => {
			const el = document.querySelector(selector)
			el.textContent = `${Math.floor(obj.count)}%`
		}

		gsap.to(preloaderObj, {
			count: 100,
			onUpdate: function () {
				showPreloaderNum('.prelaoder_num', preloaderObj)
			},
		})
	}

	duringLoading()

	document.onreadystatechange = function () {
		if (document.readyState === 'interactive') {
			duringLoading()
		} else if (document.readyState === 'complete') {
			const preloader = document.querySelector('.preloader')
			gsap.to(preloader, {
				opacity: 0,
				duration: 0.4,
				onComplete: function () {
					preloader.style.display = 'none'
				},
			})
			console.log('prelaoder finish!')
			const animationConfig = [
				{ textSelector: '.line-text', pathSelector: '.hero-line-01' },
				// Можно добавлять больше конфигураций
			]
			setupResizeListener(animationConfig)
			// HERO SECTION
			const splitH1Hero = new SplitText('[animate="text-h1"]', {
				type: 'words, chars',
			})
			const heroTimeLine = gsap.timeline({})
			heroTimeLine.from(splitH1Hero.chars, {
				duration: 0.4,
				y: 100,
				autoAlpha: 0,
				stagger: 0.02,
			})
			heroTimeLine.from(
				'[animate="hero-text"]',
				{
					opacity: 0,
					y: '50%',
					duration: 0.6,
					delay: 0.5,
				},
				'<'
			)
			heroTimeLine.from(
				'.v-upd_content',
				{
					opacity: 0,
					y: '100%',
					duration: 0.6,
				},
				'<'
			)
			heroTimeLine.from(
				'.section_v-upd .bg-line',
				{
					height: '0%',
					duration: 3,
					stagger: 0.2,
					delay: 0.5,
				},
				'<'
			)
			heroTimeLine.from(
				'.ai_lines',
				{
					opacity: 0,
					duration: 2,
				},
				0
			)

			// SECTION COMPRESS
			const aiContactTitle = new SplitText("[da='compress-title']", {
				type: 'words, chars',
			})
			const aiContactTl = gsap.timeline({
				scrollTrigger: {
					trigger: '.section_compress',
					start: 'top center',
					end: 'bottom bottom',
				},
			})
			aiContactTl.from(aiContactTitle.chars, {
				duration: 0.3,
				y: 100,
				autoAlpha: 0,
				stagger: 0.02,
			})
			aiContactTl.from(
				"[da='compress-text']",
				{
					opacity: 0,
					duration: 0.4,
				},
				'<'
			)
			aiContactTl.from(
				'.compress_image',
				{
					opacity: 0,
					y: '50%',
					duration: 0.6,
				},
				'<'
			)
			aiContactTl.from(
				'.section_compress .bg-line',
				{
					height: '0%',
					duration: 3,
					stagger: 0.2,
					delay: 0.5,
				},
				'<'
			)
			
		}
	}
	//SWIPER
	const swiper = new Swiper('.other-resources_slider', {
		slidesPerView: 'auto',
		spaceBetween: 30,
		speed: 1200,
		grabCursor: true,
		freeMode: true,
		// Navigation buttons
		navigation: {
			prevEl: '.other-resources_nav .navigation-prev',
			nextEl: '.other-resources_nav .navigation-next',
		},
	})
})
