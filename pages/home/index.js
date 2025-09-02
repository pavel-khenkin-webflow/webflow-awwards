import { setupResizeListener } from '../utility/run-line.js'
import { initializeVolumeSlider } from './interface.js'
import { initializeCardHoverEffect } from './slider-team.js'

document.addEventListener('DOMContentLoaded', event => {
	const isMobile = window.innerWidth <= 478;

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
			subtitlesContainer.classList.remove('is--center', 'is--left', 'is--right')
			if (value === 'left') {
			subtitlesContainer.classList.add('is--left')
			} else if (value === 'right') {
			subtitlesContainer.classList.add('is--right')
			} else if (value === 'center') {
			subtitlesContainer.classList.add('is--center')
			}
			})

			// =======================
			// Subtitles UI manager (origin / font / size / color)
			// =======================
			const el = {
			  subs:  document.getElementById('subtitles'),
			  origin: document.getElementById('settings-origin'),
			  font:   document.getElementById('settings-font'),
			  size:   document.getElementById('settings-size-font'),
			  color:  document.getElementById('settings-color-font'),
			};
			
			if (el.subs) {
			  // ---- helpers
			  const removeAll = (node, classes) => node.classList.remove(...classes.filter(Boolean));
			
			  // ---------- origin (above / average / below)
			  (function initOrigin() {
			    if (!el.origin) return;
			
			    const ORIGIN_CLASSES = ['is--above', 'is--average', 'is--below'];
			    const ORIGIN_MAP = { above: 'is--above', average: 'is--average', below: 'is--below' };
			
			    if (!ORIGIN_CLASSES.some(c => el.subs.classList.contains(c))) {
			      el.subs.classList.add('is--below'); // дефолт
			    }
			
			    const apply = (raw) => {
			      const v = String(raw || '').trim().toLowerCase();
			      removeAll(el.subs, ORIGIN_CLASSES);
			      el.subs.classList.add(ORIGIN_MAP[v] || 'is--below');
			    };
			
			    apply(el.origin.value);
			    el.origin.addEventListener('change', (e) => apply(e.target.value));
			  })();
			
			  // ---------- font (Poppins / Oswald / Rocksalt)
			  (function initFont() {
			    if (!el.font) return;
			
			    const FONT_CLASSES = ['is--poppins', 'is--oswald', 'is--rocksalt'];
			    const FONT_MAP = { poppins: 'is--poppins', oswald: 'is--oswald', rocksalt: 'is--rocksalt' };
			
			    const apply = (raw) => {
			      const v = String(raw || '').trim().toLowerCase();
			      removeAll(el.subs, FONT_CLASSES);
			      el.subs.classList.add(FONT_MAP[v] || 'is--poppins'); // дефолт
			    };
			
			    apply(el.font.value);
			    el.font.addEventListener('change', (e) => apply(e.target.value));
			  })();
			
			  // ---------- size (16 / 24 / 32)
			  (function initSize() {
			    if (!el.size) return;
			
			    const SIZE_CLASSES = ['is--size16', 'is--size24', 'is--size32'];
			
			    const apply = (raw) => {
			      const key = String(raw || '').replace(/[^\d]/g, '');
			      removeAll(el.subs, SIZE_CLASSES);
			
			      if (key === '24')      el.subs.classList.add('is--size24');
			      else if (key === '32') el.subs.classList.add('is--size32');
			      else                   el.subs.classList.add('is--size16'); // дефолт
			    };
			
			    apply(el.size.value);
			    el.size.addEventListener('change', (e) => apply(e.target.value));
			  })();
			
			  // ---------- color (white / green / blue)
			  (function initColor() {
			    if (!el.color) return;
			
			    const COLOR_CLASSES = ['is--white', 'is--green', 'is--blue'];
			    const COLOR_MAP = { white: 'is--white', green: 'is--green', blue: 'is--blue' };
			
			    const apply = (raw) => {
			      const v = String(raw || '').trim().toLowerCase();
			      removeAll(el.subs, COLOR_CLASSES);
			      el.subs.classList.add(COLOR_MAP[v] || 'is--white'); // дефолт
			    };
			
			    apply(el.color.value);
			    el.color.addEventListener('change', (e) => apply(e.target.value));
			  })();
			}

			// Получаем элементы селектов шрифта, размера и цвета текста субтитров
			const fontSelect = document.getElementById('settings-font')
			const sizeSelect = document.getElementById('settings-size-font')
			const colorSelect = document.getElementById('settings-size-font-2')
			
			// Обработчик изменения семейства шрифта
			fontSelect.addEventListener('change', function () {
			  subtitlesContainer.style.fontFamily = fontSelect.value || 'inherit'
			})
			
			// Обработчик изменения размера шрифта
			sizeSelect.addEventListener('change', function () {
			  const size = sizeSelect.value || '24'
			  subtitlesContainer.style.fontSize = size + 'px'
			})
			
			// Обработчик изменения цвета текста
			colorSelect.addEventListener('change', function () {
			  subtitlesContainer.style.color = colorSelect.value || '#000000'
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
		{ textPathSelector: '.textPath01', startOffsetMovePercent: '-125.65%' },
		{ textPathSelector: '.textPath02', startOffsetMovePercent: '-110.77%' },
		{ textPathSelector: '.textPath03', startOffsetMovePercent: '-141.32%' },
		{ textPathSelector: '.textPath04', startOffsetMovePercent: '-184.58%' },
		{ textPathSelector: '.textPath05', startOffsetMovePercent: '-131.07%' }
	]

	setupResizeListener(animationConfig);

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
	if (!isMobile) {
		functionTimeLine.add(
			cardLevitationRight(".section_functions [gapsy-animate='left-card']")
		)
	}
	
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
if (!isMobile) {
	functionTimeLine.add(
		cardLevitationLeft(".section_functions [gapsy-animate='rigth-card']")
	)
}

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
	// ---------------- Reviews lines ----------------
	const container = document.querySelector('.reviews_slider-wrap');
	let boxes = gsap.utils.toArray('.reviews_card');
	let horizontalTween;
	let dragInstance;
	let halfWidth;
	let isCurrentlyMobile = window.innerWidth <= 768;
	
	function duplicateCards() {
		const clone = container.innerHTML;
		container.insertAdjacentHTML('beforeend', clone);
		boxes = gsap.utils.toArray('.reviews_card');
	}
	
	function createAutoScrollTween() {
		return gsap.to(container, {
			x: `-=${halfWidth}`,
			duration: 30,
			ease: 'linear',
			repeat: -1,
			modifiers: {
				x: gsap.utils.unitize(x => parseFloat(x) % halfWidth),
			}
		});
	}

	function animateDesktopCards() {
		const path = document.querySelector('#slider-way');
		if (!path) return;
	
		const container = document.querySelector('.reviews_slider-wrap');
		let boxes = gsap.utils.toArray('.reviews_card');
		if (!boxes.length) return;
	
		// Настройки
		const cardSpacingEm = 4.8;
		const animationDuration = 90;
		const dragSpeedFactor = 0.000005;
	
		// Вычисление необходимого количества карточек
		const pathLength = path.getTotalLength();
		const baseFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
		const cardSpacingPx = cardSpacingEm * baseFontSize;
		const requiredCount = Math.ceil(pathLength / cardSpacingPx);
	
		// Дублируем карточки до нужного количества
		while (boxes.length < requiredCount) {
			container.insertAdjacentHTML('beforeend', container.innerHTML);
			boxes = gsap.utils.toArray('.reviews_card');
		}
	
		// Отображаем только нужное количество карточек
		const visibleBoxes = boxes.slice(0, requiredCount);
		visibleBoxes.forEach(el => el.style.display = '');
		boxes.slice(requiredCount).forEach(el => el.style.display = 'none');
	
		// Очистка предыдущей анимации
		if (window.desktopTimeline?.kill) window.desktopTimeline.kill();
	
		// Создание timeline с анимацией по SVG пути
		const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'linear' } });
		window.desktopTimeline = tl;
	
		visibleBoxes.forEach((box, i) => {
			const startProgress = i / requiredCount;
			tl.to(box, {
				motionPath: {
					path,
					align: path,
					alignOrigin: [0.5, 0.5],
					autoRotate: true,
					start: startProgress,
					end: startProgress + 1,
				},
				duration: animationDuration
			}, 0);
		});
	
		// Обнуление возможного смещения контейнера
		gsap.set(container, { x: 0 });
	
		// Drag-контроль прогресса анимации
		if (window.dragInstance?.kill) window.dragInstance.kill();
	
		window.dragInstance = Draggable.create(container, {
			type: 'x',
			zIndexBoost: false,
			inertia: true,
			cursor: 'grab',
			onPress() {
				tl.pause();
				gsap.set(container, { x: 0 });
			},
			onDrag() {
				const dx = this.deltaX;
				const shift = dx * dragSpeedFactor * animationDuration;
				tl.totalTime((tl.totalTime() + shift + animationDuration) % animationDuration);
				gsap.set(container, { x: 0 });
			},
			onRelease() {
				gsap.set(container, { x: 0 });
				tl.play();
			},
			onThrowUpdate() {
				gsap.set(container, { x: 0 });
			}
		})[0];
	}

	function animateMobileCards(container, cardSelector) {
		let dragInstance, horizontalTween;
	
		const cards = gsap.utils.toArray(cardSelector);
		if (!cards.length) return;
	
		// Дублируем карточки для бесшовности
		const containerHTML = container.innerHTML;
		container.insertAdjacentHTML('beforeend', containerHTML);
	
		// Пересобираем карточки после дублирования
		const allCards = gsap.utils.toArray(cardSelector);
	
		// Вычисляем половину ширины для петли
		const containerStyles = window.getComputedStyle(container);
		const paddingLeft = parseFloat(containerStyles.paddingLeft);
		const paddingRight = parseFloat(containerStyles.paddingRight);
		const totalWidth = container.scrollWidth - paddingLeft - paddingRight;
		const halfWidth = totalWidth / 2;
	
		// Создаём бесшовную автопрокрутку
		const createAutoScrollTween = () => gsap.to(container, {
			x: `-=${halfWidth}`,
			duration: 20,
			ease: 'linear',
			repeat: -1,
			modifiers: {
				x: gsap.utils.unitize(x => parseFloat(x) % halfWidth)
			}
		});
	
		horizontalTween = createAutoScrollTween();
	
		// Создаём Drag управление
		const draggableInstances = Draggable.create(container, {
			type: 'x',
			inertia: true,
			preventDefault: true,
			allowNativeTouchScrolling: false,
			onPress() {
				if (horizontalTween) horizontalTween.pause();
			},
			onRelease() {
				gsap.delayedCall(0.2, () => {
					const currentX = parseFloat(gsap.getProperty(container, 'x'));
					gsap.set(container, { x: currentX % halfWidth });
					horizontalTween = createAutoScrollTween();
				});
			}
		});
	
		if (draggableInstances?.[0]) {
			dragInstance = draggableInstances[0];
		} else {
			console.error(' Draggable instance не создан!');
		}
	
		return { dragInstance, horizontalTween };
	}
	
	
			
	function initializeAnimation() {
		const container = document.querySelector('.reviews_slider-wrap');
		const cardSelector = '.reviews_card';
	
		if (!container) return;
	
		gsap.set(container, { clearProps: 'all' });
	
		if (window.horizontalTween) window.horizontalTween.kill();
		if (window.dragInstance?.kill) window.dragInstance.kill();
	
		if (isCurrentlyMobile) {
			const result = animateMobileCards(container, cardSelector);
			window.horizontalTween = result.horizontalTween;
			window.dragInstance = result.dragInstance;
		} else {
			animateDesktopCards(); // содержит самостоятельные querySelector внутри
		}
	}
	
	
	
	function debounce(func, wait) {
		let timeout;
		return function (...args) {
			clearTimeout(timeout);
			timeout = setTimeout(() => func.apply(this, args), wait);
		};
	}
	
	function updateOnResize() {
		const wasMobile = isCurrentlyMobile;
		isCurrentlyMobile = window.innerWidth <= 768;
	
		if (wasMobile !== isCurrentlyMobile) {
			boxes = gsap.utils.toArray('.reviews_card');
			initializeAnimation();
		} else if (isCurrentlyMobile) {
			// обновить ширину при повороте экрана
			const containerStyles = window.getComputedStyle(container);
			const paddingLeft = parseFloat(containerStyles.paddingLeft);
			const paddingRight = parseFloat(containerStyles.paddingRight);
			const totalWidth = container.scrollWidth - paddingLeft - paddingRight;
			halfWidth = totalWidth / 2;
		}
	}
	
	// Старт
	initializeAnimation();
	window.addEventListener('resize', debounce(updateOnResize, 300));
	
})
