export function initializeCardHoverEffect(cardClass, textClass) {
	const cards = document.querySelectorAll(cardClass)

	cards.forEach((card) => {
		const text = card.querySelector(textClass)

		card.addEventListener('mouseenter', () => {
			gsap.to(text, { height: 'auto', opacity: 1, duration: 0.3 })
			gsap.to(card, {
				backgroundColor: 'white',
				padding: '1.25em',
				borderRadius: '1.25em',
				duration: 0.3,
			})
		})

		card.addEventListener('mouseleave', () => {
			gsap.to(text, { height: '0em', opacity: 0, duration: 0.3 })
			gsap.to(card, {
				backgroundColor: 'transparent',
				padding: 0,
				borderRadius: 0,
				duration: 0.3,
			})
		})
	})
}
