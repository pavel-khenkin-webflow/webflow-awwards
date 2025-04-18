import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { setupResizeListener } from '../utility/run-line'

gsap.registerPlugin(SplitText, MotionPathPlugin)

document.addEventListener('DOMContentLoaded', () => {
	// Прелоудер
	function duringLoading() {
		const preloaderObj = { count: 0 }

		const showPreloaderNum = (selector, obj) => {
			const el = document.querySelector(selector)
			if (el) el.textContent = `${Math.floor(obj.count)}%`
		}

		gsap.to(preloaderObj, {
			count: 100,
			duration: 2,
			onUpdate: () => {
				showPreloaderNum('.prelaoder_num', preloaderObj)
			},
		})
	}

	
	// Обработчик загрузки для скрытия прелоадера
	document.onreadystatechange = () => {
		if (document.readyState === 'interactive') {
			duringLoading()
		} else if (document.readyState === 'complete') {
			const preloader = document.querySelector('.preloader')
			gsap.to(preloader, {
				opacity: 0,
				duration: 0.4,
				onComplete: () => {
					preloader.style.display = 'none'
				},
			})
			console.log('✅ Прелоудер завершён')
		}
	}
	
	
	// SVG путь с текстом (запускаем после загрузки DOM)
	const animationConfig = [
		{ textSelector: '.line-text', pathSelector: '.hero-line-01' },
		{ textSelector: '.line-text-02', pathSelector: '.hero-line-02' },
		{ textSelector: '.line-text-03', pathSelector: '.hero-line-03' },
	]
	setupResizeListener(animationConfig);


})
