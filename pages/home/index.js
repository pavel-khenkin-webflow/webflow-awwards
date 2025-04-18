import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Draggable, InertiaPlugin, SplitText, TextPlugin } from 'gsap/all'
import { setupResizeListener } from '../utility/run-line'
import { initializeVolumeSlider } from './interface'
import { initializeCardHoverEffect } from './slider-team'

console.log('init!')
document.addEventListener('DOMContentLoaded', event => {
	// Функция, которая выполняется во время загрузки страницы
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

	gsap.registerPlugin(
		Flip,
		ScrollTrigger,
		MotionPathPlugin,
		SplitText,
		Draggable,
		InertiaPlugin
	)

	// //add runlines animation
	// setupTextPathAnimations([
	// 	{ textSelector: '.line-text', pathClass: 'hero-line-01', idSuffix: '1' },
	// 	{ textSelector: '.line-text-02', pathClass: 'hero-line-02', idSuffix: '2' },
	// 	{ textSelector: '.line-text-03', pathClass: 'hero-line-03', idSuffix: '3' },
	// 	{ textSelector: '.line-text-r-01', pathClass: 'reviews-01-path', idSuffix: 'r1' },
	// 	{ textSelector: '.line-text-r-02', pathClass: 'reviews-02-path', idSuffix: 'r2' }
	// ])
	

	// Обработчик события загрузки
	document.onreadystatechange = function () {
		if (document.readyState === 'interactive') {
			duringLoading()
		} else if (document.readyState === 'complete') {
			const preloader = document.querySelector('.preloader')
			gsap.registerPlugin(TextPlugin)

			gsap.to(preloader, {
				opacity: 0,
				duration: 0.4,
				onComplete: function () {
					preloader.style.display = 'none'
				},
			})
			console.log('prelaoder finish!')

			// Hero load animate

			var splitH1Hero = new SplitText('[animate="text-h1"]', {
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
				'[gapsy-animate="hero-text"]',
				{
					opacity: 0,
					y: '50%',
					duration: 0.6,
					delay: 0.5,
				},
				0
			)
			heroTimeLine.from(
				'.hero_interface',
				{
					opacity: 0,
					y: '100%',
					duration: 0.5,
					delay: 1,
				},
				0
			)
			heroTimeLine.from(
				'.section_hero .bg-line',
				{
					height: '0%',
					duration: 3,
					stagger: 0.2,
					delay: 0.5,
				},
				0
			)
			heroTimeLine.from(
				'.hero_bg',
				{
					opacity: 0,
					duration: 2,
				},
				0
			)
			const InterfaceTimeLine = gsap.timeline({
				paused: true,
			})

			InterfaceTimeLine.to(
				'.section_hero',
				{
					backgroundColor: '#000000',
					duration: 0.4,
					ease: 'power1.inOut',
				},
				0
			)

			InterfaceTimeLine.to(
				"[gapsy-animate='hero-lines']",
				{
					opacity: 0,
					duration: 0.4,
					ease: 'power1.inOut',
				},
				0
			)

			ScrollTrigger.create({
				trigger: '.hero_interface-wrapper',
				start: 'top+=10% top',
				end: 'bottom bottom',
				onEnter: () => InterfaceTimeLine.play(),
				onLeaveBack: () => InterfaceTimeLine.reverse(),
			})

			const interfaceTl = gsap.timeline({
				scrollTrigger: {
					trigger: '.hero_interface-wrapper',
					start: 'top top',
					end: 'bottom bottom',
					scrub: true,
				},
			})
			interfaceTl.to('.hero_interface', {
				scale: 1, // Анимация изменения размера шрифта
				duration: 0.5,
			})

			// player functional
			const videoContainer = document.getElementById('video')
			const video = videoContainer.querySelector('video')
			const playButton = document.getElementById('play-button')
			const playIcon = playButton.querySelector('img')
			const progress = document.getElementById('progress')
			const progressSecondary = document.getElementById('progress-secondary')
			const progressBar = document.getElementById('progress-bar')
			const progressBarSecondary = document.getElementById(
				'progress-bar-secondary'
			)
			const timeDisplays = document.querySelectorAll("[time='time-video']")
			const subtitlesContainer = document.getElementById('subtitles')
			const subtitlesText = document.getElementById('subtitles-text')
			const timeInInput = document.getElementById('time-in')
			const timeOutInput = document.getElementById('time-out')
			const addButton = document.querySelector('.dub-add-btn')
			const subContentText = document.querySelector('.sub_content-text')
			const deleteButton = document.getElementById('sub-delete')
			const orientationSelect = document.getElementById('settings-orientation')

			const playIconSrc =
				'https://uploads-ssl.webflow.com/6616849abf3f88813e571497/668c041a64a1223405e36af0_play.svg' // Путь к иконке play
			const pauseIconSrc =
				'https://uploads-ssl.webflow.com/6616849abf3f88813e571497/668c03a9643fb34bd857eab6_pause.svg' // Путь к иконке pause

			let subtitleIntervalId = null
			let subtitles = []

			// Функция форматирования времени в формате мм:сс
			function formatTime(seconds) {
				const minutes = Math.floor(seconds / 60)
				const secs = Math.floor(seconds % 60)
				return `${minutes.toString().padStart(2, '0')}:${secs
					.toString()
					.padStart(2, '0')}`
			}

			// Функция для разбивки текста на пары слов и возвращения массива пар слов с помощью GSAP SplitText
			function splitTextIntoWordPairs(text) {
				const tempElement = document.createElement('div')
				tempElement.style.display = 'none' // Скрываем временный элемент
				tempElement.innerHTML = text
				document.body.appendChild(tempElement)

				const splitTextInstance = new SplitText(tempElement, { type: 'words' })
				const words = splitTextInstance.words.map(word => word.textContent)

				document.body.removeChild(tempElement) // Удаляем временный элемент

				// Создаем массив пар слов
				const wordPairs = []
				for (let i = 0; i < words.length; i += 2) {
					const pair = words[i] + (words[i + 1] ? ' ' + words[i + 1] : '')
					wordPairs.push(pair)
				}

				return wordPairs
			}

			// Функция для отображения субтитров в зависимости от текущего времени видео
			function displaySubtitles() {
				if (subtitleIntervalId) {
					clearTimeout(subtitleIntervalId)
				}

				function showNextSubtitle() {
					const currentTime = video.currentTime
					const currentSubtitle = subtitles.find(
						sub => currentTime >= sub.start && currentTime <= sub.end
					)
					if (currentSubtitle) {
						subtitlesContainer.textContent = currentSubtitle.text
					} else {
						subtitlesContainer.textContent = ''
					}
					subtitleIntervalId = setTimeout(showNextSubtitle, 100) // Проверяем субтитры каждые 100 мс
				}

				showNextSubtitle()
			}

			// Функция для обновления кнопки добавления субтитров
			function updateAddButtonState() {
				const text = subtitlesText.value.trim()
				const timeIn = timeInInput.value.trim()
				const timeOut = timeOutInput.value.trim()

				if (
					text &&
					timeIn &&
					timeOut &&
					isValidTime(timeIn) &&
					isValidTime(timeOut)
				) {
					addButton.classList.remove('is--disabled')
				} else {
					addButton.classList.add('is--disabled')
				}
			}

			// Функция для проверки валидности времени
			function isValidTime(time) {
				return (
					/^([0-5][0-9]):([0-5][0-9])$/.test(time) &&
					timeStringToSeconds(time) <= video.duration
				)
			}

			// Функция для конвертации времени формата мм:сс в секунды
			function timeStringToSeconds(timeString) {
				const parts = timeString.split(':')
				return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
			}

			// Функция для валидации времени в инпутах
			function validateTimeInput(input) {
				const time = input.value.trim()
				if (!isValidTime(time)) {
					input.style.borderColor = 'red'
					if (!document.getElementById(`${input.id}-error`)) {
						const errorLabel = document.createElement('label')
						errorLabel.id = `${input.id}-error`
						errorLabel.style.color = 'red'
						errorLabel.textContent = `Max time — ${formatTime(video.duration)}`
						input.parentNode.insertBefore(errorLabel, input.nextSibling)
					}
				} else {
					input.style.borderColor = ''
					const errorLabel = document.getElementById(`${input.id}-error`)
					if (errorLabel) {
						errorLabel.remove()
					}
				}
				updateAddButtonState()
			}

			// Функция для автоматического добавления двоеточия в инпутах времени
			function formatTimeInput(input) {
				let value = input.value.replace(/\D/g, '') // Удаляем все нечисловые символы
				if (value.length >= 3) {
					value = value.slice(0, 2) + ':' + value.slice(2, 4)
				}
				input.value = value
				validateTimeInput(input)
			}

			// Функция для добавления субтитров
			function addSubtitle() {
				const text = subtitlesText.value.trim()
				const timeIn = timeStringToSeconds(timeInInput.value.trim())
				const timeOut = timeStringToSeconds(timeOutInput.value.trim())

				if (
					text &&
					timeIn &&
					timeOut &&
					timeOut > timeIn &&
					timeOut <= video.duration
				) {
					// Удаляем старые субтитры, которые перекрывают новый временной отрезок
					subtitles = subtitles.filter(
						sub => sub.start >= timeOut || sub.end <= timeIn
					)

					// Добавляем новый субтитр
					subtitles.push({ text, start: timeIn, end: timeOut })
					subtitles.sort((a, b) => a.start - b.start) // Сортируем субтитры по времени начала
					resetSubtitles()
				}
			}

			// Функция для обновления элементов на таймлайне
			function updateTimeline() {
				// Удаляем старые элементы
				subContentText.innerHTML = ''

				const timelineWidth = subContentText.clientWidth

				// Создаем и добавляем новые элементы
				subtitles.forEach(sub => {
					const subTextShape = document.createElement('div')
					subTextShape.className = 'sub-text-shape'
					subTextShape.textContent = sub.text

					const subtitleTextWrap = document.createElement('div')
					subtitleTextWrap.className = 'subtitle-text-wrap'
					subtitleTextWrap.style.left = `${
						(sub.start / video.duration) * timelineWidth
					}px`
					subtitleTextWrap.style.width = `${
						((sub.end - sub.start) / video.duration) * timelineWidth
					}px`

					subtitleTextWrap.appendChild(subTextShape)
					subContentText.appendChild(subtitleTextWrap)
				})
			}

			// Функция для запуска субтитров и обновления таймлайна
			function resetSubtitles() {
				if (subtitles.length === 0) {
					const placeholderText = subtitlesText.placeholder
					const wordPairs = splitTextIntoWordPairs(placeholderText)
					const wordInterval = video.duration / wordPairs.length
					wordPairs.forEach((pair, index) => {
						const start = index * wordInterval
						const end = start + wordInterval
						subtitles.push({ text: pair, start, end })
					})
				}
				displaySubtitles()
				updateTimeline()
			}

			// Обработчик для кнопки удаления
			deleteButton.addEventListener('click', function () {
				subtitlesText.value = ''
				timeInInput.value = ''
				timeOutInput.value = ''
				subtitles = []
				updateAddButtonState()
				resetSubtitles()
			})

			// Обработчик для изменения ориентации субтитров
			orientationSelect.addEventListener('change', function () {
				const value = orientationSelect.value
				subtitlesContainer.classList.remove(
					'is--center',
					'is--left',
					'is--right'
				)
				if (value === 'left') {
					subtitlesContainer.classList.add('is--left')
				} else if (value === 'right') {
					subtitlesContainer.classList.add('is--right')
				} else if (value === 'center') {
					subtitlesContainer.classList.add('is--center')
				}
			})

			// Обработчики для инпутов и кнопки добавления
			subtitlesText.addEventListener('input', updateAddButtonState)
			timeInInput.addEventListener('input', function () {
				formatTimeInput(timeInInput)
			})
			timeOutInput.addEventListener('input', function () {
				formatTimeInput(timeOutInput)
			})
			addButton.addEventListener('click', function () {
				if (!addButton.classList.contains('is--disabled')) {
					addSubtitle()
				}
			})

			// Проверка, что элемент найден и является видеоэлементом
			if (video && video.tagName === 'VIDEO') {
				// Воспроизведение видео после полной загрузки страницы
				window.onload = function () {
					video.play()
					playIcon.src = pauseIconSrc
					resetSubtitles()
				}

				// Переключение воспроизведение/пауза при нажатии на кнопку
				playButton.addEventListener('click', function () {
					if (video.paused) {
						video.play()
						playIcon.src = pauseIconSrc
						if (subtitleIntervalId) {
							clearTimeout(subtitleIntervalId)
							displaySubtitles()
						}
					} else {
						video.pause()
						playIcon.src = playIconSrc
						if (subtitleIntervalId) {
							clearTimeout(subtitleIntervalId)
						}
					}
				})

				// Плавное обновление прогресс-баров и времени
				function updateProgress() {
					const percent = (video.currentTime / video.duration) * 100
					gsap.to(progress, {
						width: percent + '%',
						duration: 0.1,
						ease: 'linear',
					})
					gsap.to(progressSecondary, {
						width: percent + '%',
						duration: 0.1,
						ease: 'linear',
					})

					const formattedTime = formatTime(video.currentTime)
					timeDisplays.forEach(display => {
						display.textContent = formattedTime
					})

					requestAnimationFrame(updateProgress)
				}

				video.addEventListener('play', function () {
					requestAnimationFrame(updateProgress)
				})

				video.addEventListener('pause', function () {
					// Останавливаем обновление прогресс-баров при паузе
					cancelAnimationFrame(updateProgress)
				})

				// Добавляем задержку в 1 секунду между повторами
				video.addEventListener('ended', function () {
					setTimeout(() => {
						video.currentTime = 0
						video.play()
						playIcon.src = pauseIconSrc
						resetSubtitles()
					}, 1000) // Задержка 1 секунда
				})

				// Инициализация прогресса при загрузке видео
				video.addEventListener('loadedmetadata', function () {
					resetSubtitles()
					updateProgress()
				})

				// Обновляем субтитры при изменении текста в input
				subtitlesText.addEventListener('input', function () {
					resetSubtitles()
				})

				// Функция для установки текущего времени видео при клике или перетаскивании прогресс-бара
				function seekVideo(event, progressBar) {
					const rect = progressBar.getBoundingClientRect()
					const posX = event.clientX - rect.left
					const newTime = (posX / rect.width) * video.duration
					video.currentTime = newTime
					displaySubtitles() // Синхронизация субтитров с текущим временем видео
				}

				// Обработчики для первого прогресс-бара
				progressBar.addEventListener('mousedown', event =>
					seekVideo(event, progressBar)
				)
				progressBar.addEventListener('mousemove', event => {
					if (event.buttons === 1) {
						// Проверяем, что кнопка мыши удерживается
						seekVideo(event, progressBar)
					}
				})

				// Обработчики для второго прогресс-бара
				progressBarSecondary.addEventListener('mousedown', event =>
					seekVideo(event, progressBarSecondary)
				)
				progressBarSecondary.addEventListener('mousemove', event => {
					if (event.buttons === 1) {
						// Проверяем, что кнопка мыши удерживается
						seekVideo(event, progressBarSecondary)
					}
				})
			} else {
				console.error('Элемент видео не найден или не является видеоэлементом')
			}
		}
	}
	// ----------------------------------------------------------------ANIMATION FUNCTIONS---------------------------------------------------------------
	// Levitation animation elements

	const levitateAround = (selector, duration) => {
		return gsap.to(selector, {
			duration: duration,
			repeat: -1,
			ease: 'none',
			yoyo: true,
			motionPath: {
				path: [
					{ x: 25, y: 25 },
					{ x: 0, y: 25 },
					{ x: -25, y: -25 },
					{ x: 0, y: -25 },
				],
				// curviness: 1.5,
				autoRotate: false,
			},
		})
	}

	const levitateAroundReverse = (selector, duration) => {
		return gsap.to(selector, {
			duration: duration,
			repeat: -1,
			ease: 'none',
			yoyo: true,
			motionPath: {
				path: [
					{ x: -25, y: -25 },
					{ x: 0, y: -25 },
					{ x: 25, y: 25 },
					{ x: 0, y: 25 },
				],
				// curviness: 1.5,
				autoRotate: false,
			},
		})
	}

	function levitateRight(selector) {
		return gsap.to(selector, {
			rotation: 15,
			duration: 2,
			// ease: 'power1.inOut',
			repeat: -1,
			yoyo: true,
		})
	}

	function cardLevitationLeft(selector) {
		return gsap.to(selector, {
			x: '10%',
			duration: 2,
			stagger: 0.1,
			repeat: -1,
			yoyo: true,
			ease: 'back.out(1.7)',
		})
	}
	function cardLevitationRight(selector) {
		return gsap.to(selector, {
			x: '-10%',
			duration: 2,
			stagger: 0.1,
			repeat: -1,
			yoyo: true,
			ease: 'back.out(1.7)',
		})
	}

	// Инициализация Swiper
	var mySwiper = new Swiper('.team_slider', {
		slidesPerView: 'auto',
		speed: 1200,
		loop: true,
		disableOnInteraction: true,
		autoplay: {
			delay: 400,
		},
		navigation: {
			nextEl: '.slider-btn-next',
			prevEl: '.slider-btn-prev',
		},
		on: {
			init: function () {
				saveInitialPaddingValues(this.slides)
				animateSlide(this.slides[this.activeIndex], '0em') // Анимируем начальный слайд
			},
			slideChange: function () {
				var activeSlide = this.slides[this.activeIndex]
				var prevActiveSlide = this.slides[this.previousIndex]
				var prevPadding = getInitialPaddingValue(prevActiveSlide)

				animateSlide(prevActiveSlide, prevPadding) // Восстанавливаем паддинг предыдущего слайда
				animateSlide(activeSlide, '0em') // Анимируем текущий активный слайд с паддингом 0
			},
		},
	})

	// Функция для сохранения начальных значений отступов для всех слайдов
	function saveInitialPaddingValues(slides) {
		slides.forEach(function (slide) {
			var slidePadding = slide.querySelector('.slide-padding')
			if (slidePadding) {
				slide.dataset.initialPadding =
					window.getComputedStyle(slidePadding).paddingTop
			}
		})
	}

	// Функция для получения начального значения отступа для конкретного слайда
	function getInitialPaddingValue(slide) {
		return slide.dataset.initialPadding || '0px'
	}

	// Функция для анимации отступа верхнего поля слайда
	function animateSlide(slide, paddingTop) {
		var slidePadding = slide.querySelector('.slide-padding')
		if (slidePadding) {
			gsap.to(slidePadding, {
				paddingTop: paddingTop,
				duration: 1,
			})
		}
	}

	// lines text run animation
	const animationConfig = [
		{ textSelector: '.line-text', pathSelector: '.hero-line-01' },
		{ textSelector: '.line-text-02', pathSelector: '.hero-line-02' },
		{ textSelector: '.line-text-03', pathSelector: '.hero-line-03' },
		{ textSelector: '.line-text-r-01', pathSelector: '.reviews-01-path' },
		{ textSelector: '.line-text-r-02', pathSelector: '.reviews-02-path' },
		// Можно добавлять больше конфигураций
	]
	setupResizeListener(animationConfig)

	// Interface animate
	const InterfaceTimeLine = gsap.timeline({
		scrollTrigger: {
			trigger: '.hero_interface-wrapper',
			start: 'top 45%',
			end: '80% bottom',
			scrub: true,
		},
	})

	// InterfaceTimeLine.to('.hero_interface', {
	// 	// top: '0%',
	// 	width: '90%',
	// 	height: '90vh',
	// })
	// Culture Animate on ScrollTrigger

	const cultureTimeLine = gsap.timeline({
		scrollTrigger: {
			trigger: '.section_culture',
			start: 'top 40%',
			end: 'bottom bottom',
		},
	})
	cultureTimeLine.from(
		'.culture_accent',
		{
			opacity: 0,
			rotation: -30,
			transformOrigin: 'top left',
		},
		0
	)
	cultureTimeLine.add(levitateRight('.culture_accent'))
	cultureTimeLine.add(levitateAround('[levitation="right"]', 7), 0)
	cultureTimeLine.add(levitateAroundReverse('[levitation="left"]', 10), 0)

	cultureTimeLine.from(
		".section_culture [gapsy-animate='title-h2']",
		{
			opacity: 0,
			height: '0%',
			duration: 0.3,
			stagger: 0.2,
			ease: 'power1.inOut',
		},
		0
	)
	cultureTimeLine.from(
		".section_culture [gapsy-animate='culture-divider']",
		{
			scale: 0,
			width: '0em',
			duration: 0.4,
			ease: 'power1.inOut',
			delay: 0.5,
			stagger: 0.2,
		},
		0
	)
	cultureTimeLine.to('[levitation="scale"]', {
		scale: 0.9,
		duration: 3,
		ease: 'circ.inOut',
		repeat: -1,
		yoyo: true,
	})
	cultureTimeLine.from(
		'.section_culture .bg-line-white',
		{
			height: '0%',
			duration: 3,
			stagger: 0.2,
			delay: 1,
		},
		0
	)

	// functions animated

	const functionTimeLine = gsap.timeline({
		scrollTrigger: {
			trigger: '.section_functions',
			start: 'top 40%',
			end: 'bottom bottom',
		},
	})

	functionTimeLine.from('.section_functions', {
		backgroundColor: '#000000',
		duration: 0.3,
		ease: 'power1.inOut',
	})
	functionTimeLine.from(
		'.function-accent',
		{
			opacity: 0,
			rotation: -30,
			transformOrigin: 'top left',
		},
		0
	)
	functionTimeLine.add(levitateRight('.function-accent'))
	functionTimeLine.from(
		".section_functions [gapsy-animate='title-h2']",
		{
			opacity: 0,
			height: '0%',
			duration: 0.3,
			stagger: 0.5,
			ease: 'power1.inOut',
		},
		0
	)
	functionTimeLine.from(
		"[gapsy-animate='functions-star']",
		{
			rotation: -40,
			scale: 0,
			duration: 1,
			ease: 'power1.in',
		},
		0
	)
	functionTimeLine.from(
		"[gapsy-animate='media-functions']",
		{
			scale: 0,
			opacity: 0,
			duration: 1,
			delay: 0.2,
			stagger: 0.2,
			ease: 'power1.in',
		},
		0
	)
	functionTimeLine.to("[gapsy-animate='media-functions']", {
		scale: 0.98,
		duration: 1.5,
		stagger: 0.2,
		ease: 'bounce1.in',
		repeat: -1,
		yoyo: true,
	})
	functionTimeLine.from(
		".section_functions [gapsy-animate='left-card']",
		{
			opacity: 0,
			x: '-100%',
			duration: 0.5,
			delay: 1,
			stagger: 0.2,
			ease: 'power1.in',
		},
		0
	)
	functionTimeLine.add(
		cardLevitationRight(".section_functions [gapsy-animate='left-card']")
	)
	functionTimeLine.from(
		".section_functions [gapsy-animate='rigth-card']",
		{
			opacity: 0,
			x: '100%',
			duration: 0.5,
			delay: 1,
			stagger: 0.2,
			ease: 'power1.in',
		},
		0
	)
	functionTimeLine.add(
		cardLevitationLeft(".section_functions [gapsy-animate='rigth-card']")
	)
	functionTimeLine.from(
		'.section_functions .bg-line',
		{
			height: '0%',
			duration: 3,
			stagger: 0.2,
			delay: 1.3,
		},
		0
	)

	// functions cards

	const cards = document.querySelectorAll('.functions_card')

	cards.forEach(card => {
		const caption = card.querySelector('.caption-14')
		const originalText = caption.textContent.trim() // Save the original full text
		const truncatedText =
			originalText.length > 62
				? originalText.slice(0, 62) + '...'
				: originalText

		// Initial setup for truncating text
		caption.textContent = truncatedText

		card.addEventListener('mouseenter', () => {
			gsap.to(card, {
				backgroundColor: '#ffffff', // Animate background color to white
				scale: 1.2,
				duration: 0.4,
				ease: 'power1.inOut',
			})

			gsap.to(caption, {
				text: originalText, // Animate to show the full text
				duration: 0.5,
				ease: 'power1.inOut',
			})
		})

		card.addEventListener('mouseleave', () => {
			gsap.to(card, {
				backgroundColor: '#f3efe7', // Animate background color back to initial
				scale: 1,
				duration: 0.4,
				ease: 'power1.inOut',
			})

			gsap.to(caption, {
				text: truncatedText, // Animate back to the truncated text
				duration: 0.5,
				ease: 'power1.inOut',
			})
		})
	})

	// Features AnimationEffect

	const featuresTimeLine = gsap.timeline({
		scrollTrigger: {
			// markers: true,
			trigger: '.section_features', // Элемент, который является триггером для анимации
			start: 'top 40%', // Начать анимации, когда верхняя часть элемента достигнет центра окна просмотра
			end: 'bottom bottom', // Закончить анимации, когда нижняя часть элемента достигнет центра окна просмотра
		},
	})
	featuresTimeLine.from('.features_accent', {
		opacity: 0,
		rotation: -30,
		transformOrigin: 'top left',
	})
	featuresTimeLine.add(levitateRight('.features_accent'))
	featuresTimeLine.from(
		".section_features [gapsy-animate='title-h2']",
		{
			opacity: 0,
			height: '0%',
			duration: 0.3,
			stagger: 0.5,
		},
		0
	)
	featuresTimeLine.from(
		".section_features [gapsy-animate='text-rigth']",
		{
			opacity: 0,
			x: '50%',
			duration: 0.5,
			delay: 0.2,
			ease: 'power1.inOut',
		},
		0
	)
	featuresTimeLine.from(
		".section_features [gapsy-animate='card-bottom']",
		{
			opacity: 0,
			y: '50%',
			duration: 0.4,
			delay: 0.4,
			stagger: 0.1,
			ease: 'power1.out',
		},
		0
	)
	featuresTimeLine.from(
		".section_features [gapsy-animate='rigth-card']",
		{
			opacity: 0,
			x: '100%',
			duration: 0.7,
			delay: 0.6,
			ease: 'power1.out',
		},
		0
	)

	const volumeThumb = document.getElementById('volumeThumb')
	const volumeWrapper = document.getElementById('volumeWrapper')
	const volumeDisplay = document.getElementById('volumeDisplay')
	initializeVolumeSlider(volumeThumb, volumeWrapper, volumeDisplay)

	// Team animate

	const teamTimeLine = gsap.timeline({
		scrollTrigger: {
			// markers: true,
			trigger: '.section_team', // Элемент, который является триггером для анимации
			start: 'top 40%', // Начать анимации, когда верхняя часть элемента достигнет центра окна просмотра
			end: 'bottom bottom', // Закончить анимации, когда нижняя часть элемента достигнет центра окна просмотра
		},
	})

	teamTimeLine.from('.section_team', {
		backgroundColor: 'transparent',
		duration: 0.4,
		ease: 'power1.inOut',
	})
	teamTimeLine.from('.team_accent', {
		opacity: 0,
		rotation: -30,
		transformOrigin: 'top left',
	})
	teamTimeLine.add(levitateRight('.team_accent'))
	teamTimeLine.from(
		".section_team [gapsy-animate='title-h2']",
		{
			opacity: 0,
			height: '0%',
			duration: 0.3,
			stagger: 0.5,
			ease: 'power1.inOut',
		},
		0
	)
	teamTimeLine.from(
		".section_team [gapsy-animate='text-rigth']",
		{
			opacity: 0,
			x: '50%',
			duration: 0.5,
			delay: 0.2,
			ease: 'power1.inOut',
		},
		0
	)
	teamTimeLine.from(
		'.section_team .bg-line',
		{
			height: '0%',
			duration: 3,
			stagger: 0.2,
			delay: 2,
		},
		0
	)

	initializeCardHoverEffect('.team_slide-wrapper', '.team-card-content')

	// reviews animations

	const reviewsTimeLine = gsap.timeline({
		scrollTrigger: {
			trigger: '.section_reviews',
			start: 'top center',
			end: 'bottom bottom',
			// markers: true,
		},
	})
	reviewsTimeLine.from('.section_reviews', {
		backgroundColor: '#f3efe7',
		duration: 0.8,
	})
	reviewsTimeLine.from(
		".section_reviews [gapsy-animate='title-h2']",
		{
			opacity: 0,
			height: '0%',
			duration: 0.3,
			stagger: 0.5,
			delay: 0.7,
		},
		0
	)
	reviewsTimeLine.from(
		".section_reviews [gapsy-animate='text-rigth']",
		{
			opacity: 0,
			x: '50%',
			duration: 0.5,
			delay: 1,
			ease: 'power1.inOut',
		},
		0
	)
	reviewsTimeLine.from(
		'.section_reviews .bg-line-white',
		{
			height: '0%',
			duration: 3,
			stagger: 0.2,
			delay: 2.5,
		},
		0
	)
	reviewsTimeLine.from(
		'.reviews_line-01',
		{
			opacity: 0,
			duration: 0.6,
		},
		0
	)
	reviewsTimeLine.from(
		'.reviews_line-02',
		{
			opacity: 0,
			duration: 0.6,
		},
		0
	)
	reviewsTimeLine.from(
		'.reviews_accent',
		{
			opacity: 0,
			rotation: -30,
			transformOrigin: 'top left',
		},
		0
	)
	reviewsTimeLine.add(levitateRight('.reviews_accent'))
	reviewsTimeLine.from(
		'.reviews_wrapper',
		{
			opacity: 0,
			duration: 0.6,
		},
		0
	)
	// Reviews lines

	console.clear()
	const boxes = gsap.utils.toArray('.reviews_card')
	const boxesAmount = boxes.length
	const step = 360 / boxesAmount
	let activeIndex = 0
	let nextIndex
	let rotationTween

	// Функция для создания анимации бесконечного вращения
	function startInfiniteRotation() {
		rotationTween = gsap.to('.reviews_slider-wrap', {
			rotation: '+=360', // вращение на 360 градусов
			ease: 'linear', // плавное движение без ускорения и замедления
			repeat: -1, // бесконечная анимация
			duration: 50, // продолжительность одного полного оборота (в секундах)
		})
	}

	// Функция для установки начального состояния
	function initializeAnimation() {
		gsap.set(boxes, {
			motionPath: {
				path: '#slider-way',
				align: '#slider-way',
				alignOrigin: [0.5, 0.5],
				start: -0.25,
				end: i => i / boxesAmount - 0.25,
				autoRotate: true,
			},
		})
	}

	// Debounce функция
	function debounce(func, wait) {
		let timeout
		return function (...args) {
			const context = this
			clearTimeout(timeout)
			timeout = setTimeout(() => func.apply(context, args), wait)
		}
	}

	// Функция для обновления анимации при изменении ширины экрана
	function updateOnResize() {
		rotationTween.kill() // Останавливаем текущую анимацию
		initializeAnimation() // Переинициализация
		startInfiniteRotation() // Перезапуск бесконечного вращения
	}

	// Запуск начальной установки
	initializeAnimation()
	startInfiniteRotation()

	// Draggable настройки
	Draggable.create('.reviews_slider-wrap', {
		type: 'rotation',
		inertia: true,
		snap: endVal => {
			const snap = gsap.utils.snap(step, endVal)
			const modulus = snap % 360
			nextIndex = Math.abs((modulus > 0 ? 360 - modulus : modulus) / step)
			return snap
		},
		onDragStart: () => {
			// Останавливаем бесконечную анимацию, когда начинается ручное вращение
			rotationTween.kill()
		},
		onDragEnd: () => {
			// Перезапускаем анимацию с текущего положения
			rotationTween = gsap.to('.reviews_slider-wrap', {
				rotation: `+=360`, // продолжаем вращение
				ease: 'linear',
				repeat: -1,
				duration: 50, // продолжительность одного полного оборота
				overwrite: true, // перезаписываем текущие tweens
			})
		},
	})

	// Привязка к изменению ширины экрана
	window.addEventListener('resize', debounce(updateOnResize, 300))
})
