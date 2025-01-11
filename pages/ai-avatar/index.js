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
				'.ai-avatar_image',
				{
					opacity: 0,
					y: '100%',
					duration: 0.6,
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
					trigger: '.section_ai-v',
					start: 'top center',
					end: 'bottom bottom',
				},
			})
			aiVoiceTl.from(
				'.section_ai-v .bg-line',
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
				'.ai-v_image',
				{
					opacity: 0,
					y: '50%',
					duration: 0.6,
				},
				'<'
			)
			aiVoiceCard01Tl.from(
				'.ai_content_top-s',
				{
					opacity: 0,
					x: '-100%',
					duration: 0.6,
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
				"[da='ai-voice-card-02'] .ai-v_card-content",
				{
					opacity: 0,
					y: '50%',
					duration: 0.6,
				},
				'<'
			)
			// OTHER PRODUCTS SECTION
			const otherProductsTitleSplit = new SplitText(
				"[da='other-products-title']",
				{
					type: 'words, chars',
				}
			)
			const otherSectionTl = gsap.timeline({
				scrollTrigger: {
					trigger: '.section_other-resources',
					start: 'top center',
					end: 'bottom bottom',
				},
			})
			otherSectionTl.from(otherProductsTitleSplit.chars, {
				duration: 0.3,
				y: 100,
				autoAlpha: 0,
				stagger: 0.02,
			})
			otherSectionTl.from(
				'.other-resources_card',
				{
					opacity: 0,
					y: '50%',
					duration: 0.6,
					stagger: 0.1,
				},
				'<'
			)
			otherSectionTl.from('.other-resources_bot', {
				opacity: 0,
				y: '50%',
				duration: 0.5,
			})
		}
	}
})
