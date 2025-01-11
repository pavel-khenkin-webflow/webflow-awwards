export function initializeVolumeSlider(thumb, container, display) {
	const maxVolume = 200 // Maximum volume percentage
	const steps = 10 // Number of steps: 0%, 20%, 40%, 60%, 80%, 100%, 120%, 140%, 160%, 180%, 200%
	const thumbWidth = thumb.offsetWidth

	thumb.addEventListener('mousedown', function (event) {
		const containerWidth = container.offsetWidth
		const stepWidth = (containerWidth - thumbWidth) / steps
		const shiftX = event.clientX - thumb.getBoundingClientRect().left

		function onMouseMove(event) {
			let newLeft =
				event.clientX - shiftX - container.getBoundingClientRect().left

			if (newLeft < 0) {
				newLeft = 0
			}
			if (newLeft > containerWidth - thumbWidth) {
				newLeft = containerWidth - thumbWidth
			}

			// Snap to the nearest step
			newLeft = Math.round(newLeft / stepWidth) * stepWidth

			thumb.style.left = newLeft + 'px'
			const volumePercent = Math.round(
				(newLeft / (containerWidth - thumbWidth)) * maxVolume
			)
			display.textContent = `${volumePercent}%`
		}

		document.addEventListener('mousemove', onMouseMove)

		document.addEventListener(
			'mouseup',
			function () {
				document.removeEventListener('mousemove', onMouseMove)
			},
			{ once: true }
		)
	})

	thumb.ondragstart = function () {
		return false
	}
}
