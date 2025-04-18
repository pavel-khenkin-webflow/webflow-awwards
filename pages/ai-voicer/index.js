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
			//now animate each character into place from 100px above, fading in:
			gsap.from(splitH1Hero.chars, {
				duration: 0.4,
				y: 100,
				autoAlpha: 0,
				stagger: 0.02,
			})
			let heroTimeLine = gsap.timeline({})
			heroTimeLine.from(
				'[animate="hero-text"]',
				{
					opacity: 0,
					y: '50%',
					duration: 0.6,
					delay: 0.5,
				},
				0
			)
			heroTimeLine.from(
				"[animate='hero_card']",
				{
					opacity: 0,
					y: '100%',
					duration: 0.6,
					stagger: 0.1,
				},
				0
			)
			heroTimeLine.from(
				'.section_ai .bg-line',
				{
					height: '0%',
					duration: 3,
					stagger: 0.2,
					delay: 0.5,
				},
				0
			)
			heroTimeLine.from(
				'.ai_lines',
				{
					opacity: 0,
					duration: 2,
				},
				0
			)

			// SECTION AI VOICE SECTION
			const aiVoiceTl = gsap.timeline({
				scrollTrigger: {
					trigger: '.section_ai-voice',
					start: 'top center',
					end: 'bottom bottom',
				},
			})
			aiVoiceTl.from(
				'.section_ai-voice .bg-line',
				{
					height: '0%',
					duration: 3,
					stagger: 0.2,
					delay: 0.5,
				},
				0
			)
			// AI VOICE CARD TOP
			const aiVoiceTitle01 = new SplitText("[da='ai-voice-title-01']", {
				type: 'words, chars',
			})
			const aiVoiceCard01Tl = gsap.timeline({
				scrollTrigger: {
					trigger: "[da='ai-voice-card-01']",
					start: 'top center',
					end: 'bottom bottom',
				},
			})
			aiVoiceCard01Tl.from(aiVoiceTitle01.chars, {
				duration: 0.3,
				y: 100,
				autoAlpha: 0,
				stagger: 0.02,
			})
			aiVoiceCard01Tl.from(
				"[da='ai-voice-card-01'] [da='ai-voice-text']",
				{
					opacity: 0,
					duration: 0.4,
				},
				'<'
			)
			aiVoiceCard01Tl.from(
				"[da='ai-voice-card-01'] .ai-voice_card-image",
				{
					opacity: 0,
					y: '50%',
					duration: 0.6,
				},
				'<'
			)
			// AI VOICE CARD TOP DEMO
			const aiDemoCircleWrapper = document.querySelector('.ai-record-demo_btn')
			const aiDemoCircle = document.querySelector('.ai-record-demo_btn-wrapper')
			const aiDemoCircleTl = gsap.timeline({
				duration: 0.6,
				yoyo: true,
				repeat: -1,
			})
			aiDemoCircleTl.to(aiDemoCircleWrapper, {
				scale: 1.1,
			})
			aiDemoCircleTl.to(
				aiDemoCircle,
				{
					scale: 1.02,
				},
				'<'
			)
			// AI VOICE CARD BOT
			const aiVoiceTitle02 = new SplitText("[da='ai-voice-title-02']", {
				type: 'words, chars',
			})
			const aiVoiceCard02Tl = gsap.timeline({
				scrollTrigger: {
					trigger: "[da='ai-voice-card-02']",
					start: 'top center',
					end: 'bottom bottom',
				},
			})
			aiVoiceCard02Tl.from(aiVoiceTitle02.chars, {
				duration: 0.3,
				y: 100,
				autoAlpha: 0,
				stagger: 0.02,
			})
			aiVoiceCard02Tl.from(
				"[da='ai-voice-card-02'] [da='ai-voice-text']",
				{
					opacity: 0,
					duration: 0.4,
				},
				'<'
			)
			aiVoiceCard02Tl.from(
				"[da='ai-voice-card-02'] .ai-voice_card-image",
				{
					opacity: 0,
					y: '50%',
					duration: 0.6,
				},
				'<'
			)

			// AI VOICE DEMO
			const aiDemoWrapper = document.querySelector('.ai-voice_demo')
			const aiDemoText = aiDemoWrapper.querySelector('.ai-voice-demo_text')
			const aiDemoBtn = aiDemoWrapper.querySelector('.ai-voice-demo_btn')
			const aiDemoSound = aiDemoWrapper.querySelector('.ai_voice-demo_bot')

			// AI SPLIT TEXT
			const aiDemoSplit = new SplitText(aiDemoText, {
				type: 'words',
			})

			// AI DEMO SET SETTINGS
			gsap.set(aiDemoSound, {
				opacity: 0,
				height: 0,
			})
			gsap.set(aiDemoSplit.words, {
				opacity: 0,
				y: '50%',
			})

			// AI DEMO ANIMATION
			const aiDemoTl = gsap.timeline({ repeat: -1, repeatDelay: 1 })
			aiDemoTl.to(aiDemoSplit.words, {
				opacity: 1,
				y: '0%',
				duration: 1,
				stagger: 0.1,
			})
			aiDemoTl.to(aiDemoBtn, {
				backgroundColor: '#005EFF',
				duration: 0.5,
			})
			aiDemoTl.to(aiDemoBtn, {
				rotation: 180,
				duration: 0.5,
			})
			aiDemoTl.to(aiDemoSound, {
				opacity: 1,
				height: 'auto',
				duration: 1,
				onComplete: function () {
					gsap.to(aiDemoSound, {
						opacity: 0,
						height: 0,
						delay: 1,
						duration: 1,
					})
					gsap.to(
						aiDemoBtn,
						{
							backgroundColor: '#141718',
							rotation: 0,
							duration: 0.5,
						},
						'<'
					)
				},
			})

			// // OTHER PRODUCTS SECTION
			// const otherProductsTitleSplit = new SplitText(
			// 	"[da='other-products-title']",
			// 	{
			// 		type: 'words, chars',
			// 	}
			// )
			// const otherSectionTl = gsap.timeline({
			// 	scrollTrigger: {
			// 		trigger: '.section_other-resources',
			// 		start: 'top center',
			// 		end: 'bottom bottom',
			// 	},
			// })
			// otherSectionTl.from(otherProductsTitleSplit.chars, {
			// 	duration: 0.3,
			// 	y: 100,
			// 	autoAlpha: 0,
			// 	stagger: 0.02,
			// })
			// otherSectionTl.from(
			// 	'.other-resources_card',
			// 	{
			// 		opacity: 0,
			// 		y: '50%',
			// 		duration: 0.6,
			// 		stagger: 0.1,
			// 	},
			// 	'<'
			// )
			// otherSectionTl.from('.other-resources_bot', {
			// 	opacity: 0,
			// 	y: '50%',
			// 	duration: 0.5,
			// })
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
