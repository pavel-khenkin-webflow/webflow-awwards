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
	// Gsap registerPlugin
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

	const adaptive = gsap.matchMedia()

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
				{ textSelector: '.line-text-02', pathSelector: '.hero-line-02' },
				// Можно добавлять больше конфигураций
			]
			setupResizeListener(animationConfig)
			// Resources section
			const resourcesTrack = document.querySelector('.resources_track')
			const resourcesContent = document.querySelector('.resources_wrapper')

			const resourcesContentWidth = resourcesContent.scrollWidth
			const resourcesTrackWidth = resourcesTrack.offsetWidth

			let maxOffset = resourcesTrackWidth - resourcesContentWidth
			console.log(resourcesContentWidth)

			const resourcesTl = gsap.timeline({
				scrollTrigger: {
					trigger: resourcesTrack,
					start: '10% top',
					end: '90% bottom',
					scrub: 1,
				},
			})
			adaptive.add('(min-width: 479px)', () => {
				resourcesTl.to(resourcesContent, {
					x: maxOffset,
				})
			})
		}
	}
})
