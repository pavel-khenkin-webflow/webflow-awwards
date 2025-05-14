import { gsap } from 'gsap'

export function animateTextOnPath(textPathSelector, startOffsetMovePercent, duration = 25) {
	const textPaths = document.querySelectorAll(textPathSelector)

	textPaths.forEach(el => {
		if (!el || !el.getAttribute) return

		gsap.to(el, {
			attr: { startOffset: startOffsetMovePercent },
			duration,
			ease: 'linear',
			repeat: -1
		})
	})
}

export function debounce(func, wait = 100) {
	let timeout
	return function (...args) {
		clearTimeout(timeout)
		timeout = setTimeout(() => func.apply(this, args), wait)
	}
}

export function setupResizeListener(animationConfig) {
	let animations = []

	function initAllAnimations() {
		animations.forEach(anim => anim?.kill?.())

		animations = animationConfig
			.filter(({ textPathSelector }) => {
				const el = document.querySelector(textPathSelector)
				return el && getComputedStyle(el).display !== 'none'
			})
			.map(({ textPathSelector, startOffsetMovePercent, duration }) =>
				animateTextOnPath(textPathSelector, startOffsetMovePercent, duration)
			)
	}

	window.addEventListener('resize', debounce(initAllAnimations, 300))
	initAllAnimations()
}

