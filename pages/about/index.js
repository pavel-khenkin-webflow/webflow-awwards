import { CSSPlugin, gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Draggable, InertiaPlugin, SplitText, TextPlugin } from 'gsap/all'
import Matter from 'matter-js'

gsap.registerPlugin(
	Flip,
	ScrollTrigger,
	CSSPlugin,
	MotionPathPlugin,
	Draggable,
	InertiaPlugin,
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
			// lines text run animation

			function animateTextOnPath(
				textSelector,
				pathSelector,
				duration = 20,
				staggerEach = 0.3,
				pathStart = 1,
				pathEnd = 0,
				initialProgress = 0.5
			) {
				const textElement = document.querySelector(textSelector)
				const pathElement = document.querySelector(pathSelector)

				// Разбиваем текст на слова
				const words = new SplitText(textElement, { type: 'words' })

				// Создаем новый массив символов, включая пробелы
				const newChars = []
				words.words.forEach((word, index) => {
					// Разбиваем каждое слово на символы
					const chars = new SplitText(word, { type: 'chars' }).chars
					newChars.push(...chars)

					if (index < words.words.length - 1) {
						// Добавляем пробелы между словами
						const space = document.createElement('span')
						space.innerHTML = '&nbsp;'
						space.classList.add('space')
						newChars.push(space)
					}
				})

				// Очистить textElement и добавить обратно символы с пробелами
				textElement.innerHTML = ''
				newChars.forEach(char => textElement.appendChild(char))

				// Получаем обновленный список символов для анимации
				const updatedChars = Array.from(textElement.children)

				// Устанавливаем начальные позиции символов и переворачиваем по осям X и Y
				gsap.set(updatedChars, { xPercent: -50, yPercent: -50 })

				// Создаем анимацию с GSAP
				const tl = gsap.timeline({ repeat: -1 }).to(updatedChars, {
					duration: duration, // Продолжительность анимации
					motionPath: {
						path: pathElement,
						align: pathElement,
						alignOrigin: [0.5, 0.5],
						autoRotate: true, // Включаем autoRotate
						start: pathStart, // Начинаем с конца пути
						end: pathEnd, // Движемся к началу пути
					},
					ease: 'linear',
					stagger: {
						each: staggerEach, // Расстояние между символами
						repeat: -1,
						from: 'end', // Начало с первой буквы
					},
					immediateRender: true,
				})

				// Устанавливаем начальное состояние анимации
				tl.progress(initialProgress)
			}

			animateTextOnPath('.line-text', '.hero-line-01', 20, 0.3, 1, 0, 0.5)
			animateTextOnPath('.line-text-02', '.hero-line-02', 20, 0.3, 1, 0, 0.5)
			
			const aboutCardsTl = gsap.timeline({ paused: true })
			aboutCardsTl.from('[gapsy-animate="about-01"]', {
				opacity: 0,
				x: '-300%',
				duraton: 3,
			})
			aboutCardsTl.from(
				'[gapsy-animate="about-02"]',
				{
					x: '-200%',
					opacity: 0,
					rotation: 90,
					duraton: 3,
				},
				0
			)
			aboutCardsTl.from(
				'[gapsy-animate="about-03"]',
				{
					y: '-300%',
					x: '-200%',
					duraton: 3,
					opacity: 0,
				},
				0
			)
			aboutCardsTl.from(
				'[gapsy-animate="about-04"]',
				{
					y: '-500%',
					opacity: 0,
					x: '-21%',
					rotation: 15,
					duraton: 3,
				},
				0
			)
			aboutCardsTl.from(
				'[gapsy-animate="about-05"]',
				{
					y: '200',
					opacity: 0,
					x: '5%',
					rotation: -48,
					duraton: 3,
				},
				0
			)
			aboutCardsTl.from(
				'[gapsy-animate="about-06"]',
				{
					y: '-90%',
					opacity: 0,
					x: '200%',
					rotation: 13,
					duraton: 3,
				},
				0
			)

			// main timeline
			const heroAboutTimeLine = gsap.timeline({})
			heroAboutTimeLine.from('.section_about-hero [gapsy-animate="h1-title"]', {
				y: '30%',
				opacity: 0,
				duration: 0.8,
				ease: 'power1.inOut',
			})
			heroAboutTimeLine.from(
				'.section_about-hero [gapsy-animate="text-bottom"]',
				{
					opacity: 0,
					y: '20%',
					duration: 0.5,
					delay: 0.6,
					ease: 'power1.inOut',
				},
				0
			)
			heroAboutTimeLine.add(aboutCardsTl.play())
			heroAboutTimeLine.from(
				'.section_about-hero .hero_bg',
				{
					scale: 5,
					duration: 2,
					ease: 'power1.inOut',
				},
				0
			)

			// benefits cards
			const benefitsCardsTl = gsap.timeline({
				paused: true,
			})
			if (window.matchMedia('(max-width: 479px)').matches) {
				// Вставьте сюда код для экранов шириной до 479 пикселей
				benefitsCardsTl.from('[gapsy-animate="benefits-card-01"]', {
					y: '200%',
					rotation: -126,
					duration: 2,
				})
				benefitsCardsTl.to(
					'[gapsy-animate="benefits-card-01"]',
					{
						rotation: 5,
						delay: 1,
						duration: 1.5,
						delay: 2,
					},
					0
				)
				benefitsCardsTl.from(
					'[gapsy-animate="benefits-card-02"]',
					{
						y: '200%',
						rotation: -126,
						duration: 1.5,
						delay: 2,
					},
					0
				)
				benefitsCardsTl.to(
					'[gapsy-animate="benefits-card-02"]',
					{
						rotation: 7,
						duration: 1.5,
						delay: 4,
					},
					0
				)
				benefitsCardsTl.from(
					'[gapsy-animate="benefits-card-03"]',
					{
						y: '200%',
						rotation: 60,
						duration: 1.5,
						delay: 4,
					},
					0
				)
				benefitsCardsTl.to(
					'[gapsy-animate="benefits-card-03"]',
					{
						rotation: 9,
						duration: 1.5,
						delay: 6,
					},
					0
				)
				benefitsCardsTl.from(
					'[gapsy-animate="benefits-card-04"]',
					{
						y: '200%',
						rotation: -140,
						duration: 1.5,
						delay: 6,
					},
					0
				)
				benefitsCardsTl.to(
					'[gapsy-animate="benefits-card-04"]',
					{
						rotation: 11,
						duration: 1.5,
						delay: 8,
					},
					0
				)
				benefitsCardsTl.from(
					'[gapsy-animate="benefits-card-05"]',
					{
						y: '200%',
						rotation: -120,
						duration: 1.5,
						delay: 8,
					},
					0
				)
				benefitsCardsTl.to(
					'[gapsy-animate="benefits-card-05"]',
					{
						rotation: -4,
						dduration: 1.5,
						delay: 10,
					},
					0
				)
				benefitsCardsTl.from(
					'[gapsy-animate="benefits-card-06"]',
					{
						y: '200%',
						rotation: -150,
						duration: 1.5,
						delay: 10,
					},
					0
				)
				benefitsCardsTl.to(
					'[gapsy-animate="benefits-card-06"]',
					{
						rotation: -8,
						duration: 1.5,
						delay: 12,
					},
					0
				)
				benefitsCardsTl.from(
					'[gapsy-animate="benefits-card-07"]',
					{
						y: '200%',
						rotation: -170,
						duration: 1.5,
						delay: 12,
					},
					0
				)
			} else {
				// Вставьте сюда код для экранов шириной 480 пикселей и более
				benefitsCardsTl.from('[gapsy-animate="benefits-card-01"]', {
					y: '200%',
					rotation: -126,
					duration: 2,
				})
				benefitsCardsTl.to(
					'[gapsy-animate="benefits-card-01"]',
					{
						rotation: 30,
						delay: 1,
						duration: 1.5,
						delay: 2,
					},
					0
				)
				benefitsCardsTl.from(
					'[gapsy-animate="benefits-card-02"]',
					{
						y: '200%',
						rotation: -126,
						duration: 1.5,
						delay: 2,
					},
					0
				)
				benefitsCardsTl.to(
					'[gapsy-animate="benefits-card-02"]',
					{
						rotation: 60,
						duration: 1.5,
						delay: 4,
					},
					0
				)
				benefitsCardsTl.from(
					'[gapsy-animate="benefits-card-03"]',
					{
						y: '200%',
						rotation: 60,
						duration: 1.5,
						delay: 4,
					},
					0
				)
				benefitsCardsTl.to(
					'[gapsy-animate="benefits-card-03"]',
					{
						rotation: 90,
						duration: 1.5,
						delay: 6,
					},
					0
				)
				benefitsCardsTl.from(
					'[gapsy-animate="benefits-card-04"]',
					{
						y: '200%',
						rotation: -140,
						duration: 1.5,
						delay: 6,
					},
					0
				)
				benefitsCardsTl.to(
					'[gapsy-animate="benefits-card-04"]',
					{
						rotation: 120,
						duration: 1.5,
						delay: 8,
					},
					0
				)
				benefitsCardsTl.from(
					'[gapsy-animate="benefits-card-05"]',
					{
						y: '200%',
						rotation: -12,
						duration: 1.5,
						delay: 8,
					},
					0
				)
				benefitsCardsTl.to(
					'[gapsy-animate="benefits-card-05"]',
					{
						rotation: 150,
						dduration: 1.5,
						delay: 10,
					},
					0
				)
				benefitsCardsTl.from(
					'[gapsy-animate="benefits-card-06"]',
					{
						y: '200%',
						rotation: -150,
						duration: 1.5,
						delay: 10,
					},
					0
				)
				benefitsCardsTl.to(
					'[gapsy-animate="benefits-card-06"]',
					{
						rotation: 180,
						duration: 1.5,
						delay: 12,
					},
					0
				)
				benefitsCardsTl.from(
					'[gapsy-animate="benefits-card-07"]',
					{
						y: '200%',
						rotation: 210,
						duration: 1.5,
						delay: 12,
					},
					0
				)
			}

			// about benefits

			const benefitsTimeLine = gsap.timeline({
				scrollTrigger: {
					// markers: true,
					trigger: '.section_benefits',
					start: 'top 45%',
					end: '80% bottom',
					scrub: 1,
				},
			})
			benefitsTimeLine.from(
				'.bernefits_track',
				{
					width: '0%',
					duration: 1,
				},
				0
			)
			benefitsTimeLine.add(benefitsCardsTl.play())

			// Vision section
			const visionTitleSplit = new SplitText('[da="vision-title"]', {
				type: 'chars',
			})
			const visionTl = gsap.timeline({
				scrollTrigger: {
					trigger: '.section_vision',
					start: 'top center',
					end: 'bottom bottom',
				},
			})
			visionTl.from(visionTitleSplit.chars, {
				duration: 0.3,
				y: 100,
				autoAlpha: 0,
				stagger: 0.02,
			})
			visionTl.from(
				'[da="vision-text"]',
				{
					opacity: 0,
					duration: 0.4,
				},
				'<'
			)
			visionTl.from(
				'[da="vision-icon"]',
				{
					rotation: -40,
					scale: 0,
					duration: 1,
					ease: 'power1.in',
				},
				'<'
			)
			visionTl.from(
				'[da="vision-img',
				{
					opacity: 0,
					y: '100%',
					duration: 0.8,
					stagger: 0.3,
					ease: 'power1.Out',
					delay: 0.3,
				},
				'<'
			)
			visionTl.from(
				'[da="vision-phone"]',
				{
					opacity: 0,
					scale: 0,
					y: '100%',
					duration: 0.6,
					ease: 'power1.Out',
				},
				'<'
			)

			// Team
			const teamSplitText = new SplitText('[da="team-title"', {
				type: 'chars',
			})
			const teamTl = gsap.timeline({
				scrollTrigger: {
					trigger: '.section_about-team',
					start: 'top center',
					end: 'bottom bottom',
				},
			})
			teamTl.from(teamSplitText.chars, {
				duration: 0.6,
				y: 100,
				autoAlpha: 0,
				stagger: 0.02,
			})
			teamTl.from(
				'[da="team-text"]',
				{
					opacity: 0,
					duration: 0.4,
				},
				'<'
			)
			teamTl.from(
				'[da="team-icon"]',
				{
					rotation: -40,
					scale: 0,
					duration: 1,
					ease: 'power1.in',
				},
				'<'
			)
			teamTl.from(
				'.about-team_card',
				{
					autoAlpha: 0,
					y: '100%',
					duration: 0.5,
					stagger: 0.1,
				},
				'<'
			)

			// Инициализация Swiper
			var mySwiper = new Swiper('.team_slider', {
				slidesPerView: 'auto',
				speed: 1200,
				loop: true,
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

			// section title
			const titleSplitText = new SplitText('.section_title h2', {
				type: 'chars',
			})
			const titleTl = gsap.timeline({
				scrollTrigger: {
					trigger: '.section_title',
					start: 'top center',
					end: 'bottom bottom',
				},
			})
			titleTl.from('.section_title', {
				backgroundColor: '#000000',
				duration: 0.3,
				ease: 'power1.inOut',
			})
			titleTl.from(
				titleSplitText.chars,
				{
					duration: 0.6,
					y: 100,
					autoAlpha: 0,
					stagger: 0.02,
				},
				0
			)
			titleTl.from(
				'.section_title .bg-line',
				{
					height: '0%',
					duration: 3,
					stagger: 0.2,
					delay: 1.3,
				},
				0
			)
		// 	// Инициализация Matter.js
		// 	const {
		// 		Engine,
		// 		Render,
		// 		Runner,
		// 		Bodies,
		// 		World,
		// 		Mouse,
		// 		MouseConstraint,
		// 		Composite,
		// 		Events,
		// 	} = Matter

		// 	const engine = Engine.create()
		// 	const world = engine.world

		// 	const canvasWrapper = document.getElementById('canvas_wrapper')

		// 	const render = Render.create({
		// 		element: canvasWrapper,
		// 		engine: engine,
		// 		options: {
		// 			width: canvasWrapper.offsetWidth,
		// 			height: canvasWrapper.offsetHeight,
		// 			wireframes: false,
		// 			background: 'transparent',
		// 		},
		// 	})

		// 	Render.run(render)
		// 	const runner = Runner.create()
		// 	Runner.run(runner, engine)

		// 	// Создаём невидимые стены, чтобы элементы не выходили за пределы
		// 	const walls = [
		// 		Bodies.rectangle(
		// 			canvasWrapper.offsetWidth / 2,
		// 			-50,
		// 			canvasWrapper.offsetWidth,
		// 			100,
		// 			{ isStatic: true }
		// 		), // верхняя стена
		// 		Bodies.rectangle(
		// 			canvasWrapper.offsetWidth / 2,
		// 			canvasWrapper.offsetHeight + 50,
		// 			canvasWrapper.offsetWidth,
		// 			100,
		// 			{ isStatic: true }
		// 		), // нижняя стена
		// 		Bodies.rectangle(
		// 			-50,
		// 			canvasWrapper.offsetHeight / 2,
		// 			100,
		// 			canvasWrapper.offsetHeight,
		// 			{ isStatic: true }
		// 		), // левая стена
		// 		Bodies.rectangle(
		// 			canvasWrapper.offsetWidth + 50,
		// 			canvasWrapper.offsetHeight / 2,
		// 			100,
		// 			canvasWrapper.offsetHeight,
		// 			{ isStatic: true }
		// 		), // правая стена
		// 	]
		// 	World.add(world, walls)

		// 	// Получаем все элементы с классом .interactive и создаём для них тела
		// 	const elements = document.querySelectorAll('.canvas-btn')
		// 	const bodies = []
		// 	elements.forEach(element => {
		// 		const rect = element.getBoundingClientRect()
		// 		const wrapperRect = canvasWrapper.getBoundingClientRect() // Получаем размеры контейнера

		// 		// Координаты элементов относительно wrapper
		// 		const xPos = rect.left - wrapperRect.left + rect.width / 2
		// 		const yPos = rect.top - wrapperRect.top + rect.height / 2

		// 		// Создаём Matter.js тела для каждого элемента
		// 		const body = Bodies.rectangle(xPos, yPos, rect.width, rect.height, {
		// 			restitution: 0.8, // коэффициент упругости
		// 			chamfer: { radius: 10 },
		// 			render: { fillStyle: 'transparent' },
		// 		})

		// 		World.add(world, body)
		// 		bodies.push(body)

		// 		// Синхронизация DOM-элементов с телами Matter.js
		// 		Events.on(engine, 'afterUpdate', () => {
		// 			element.style.left = `${body.position.x - rect.width / 2}px`
		// 			element.style.top = `${body.position.y - rect.height / 2}px`
		// 			element.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`
		// 		})
		// 	})

		// 	// Добавляем возможность перетаскивания элементов мышью
		// 	const mouse = Mouse.create(render.canvas)
		// 	const mouseConstraint = MouseConstraint.create(engine, {
		// 		mouse: mouse,
		// 		constraint: {
		// 			stiffness: 0.2,
		// 			render: { visible: false },
		// 		},
		// 	})
		// 	World.add(world, mouseConstraint)

		// 	render.mouse = mouse
		// }
		const {
			Engine,
			Render,
			Runner,
			Bodies,
			Body,
			World,
			Mouse,
			MouseConstraint,
			Events,
		} = Matter
		
		const engine = Engine.create()
		engine.gravity.y = 0.02
		const world = engine.world
		
		const canvasWrapper = document.getElementById('canvas_wrapper')
		
		const render = Render.create({
			element: canvasWrapper,
			engine: engine,
			options: {
				width: canvasWrapper.offsetWidth,
				height: canvasWrapper.offsetHeight,
				wireframes: false,
				background: 'transparent',
			},
		})
		
		Render.run(render)
		const runner = Runner.create()
		Runner.run(runner, engine)
		
		// Стены
		const walls = [
			Bodies.rectangle(canvasWrapper.offsetWidth / 2, -50, canvasWrapper.offsetWidth, 100, { isStatic: true }),
			Bodies.rectangle(canvasWrapper.offsetWidth / 2, canvasWrapper.offsetHeight + 50, canvasWrapper.offsetWidth, 100, { isStatic: true }),
			Bodies.rectangle(-50, canvasWrapper.offsetHeight / 2, 100, canvasWrapper.offsetHeight, { isStatic: true }),
			Bodies.rectangle(canvasWrapper.offsetWidth + 50, canvasWrapper.offsetHeight / 2, 100, canvasWrapper.offsetHeight, { isStatic: true }),
		]
		World.add(world, walls)
		
		// Элементы
		const elements = document.querySelectorAll('.canvas-btn')
		const wrapperRect = canvasWrapper.getBoundingClientRect()
		const minSpeed = 0.15
		const maxSpeed = 10
		const finalFrictionAir = 0.002
		const decayTime = 3000
		const bodies = []
		
		elements.forEach(element => {
			const rect = element.getBoundingClientRect()
		
			// === УСТАНАВЛИВАЕМ ФИКСИРОВАННЫЕ РАЗМЕРЫ ===
			element.style.width = `${rect.width}px`
			element.style.height = `${rect.height}px`
			element.style.position = 'absolute'
			element.style.overflow = 'hidden'
			element.style.boxSizing = 'border-box'
			element.style.pointerEvents = 'none' // для производительности и чистоты
			element.style.willChange = 'transform'
			element.style.transformOrigin = 'center center'
		
			// Позиция внутри wrapper
			const x = Math.random() * (wrapperRect.width - rect.width) + rect.width / 2
			const y = Math.random() * (wrapperRect.height - rect.height) + rect.height / 2
		
			const body = Bodies.rectangle(x, y, rect.width, rect.height, {
				restitution: 1,
				friction: 0,
				frictionAir: 0,
				chamfer: { radius: 10 },
				render: { fillStyle: 'transparent' },
			})
		
			// Ограниченная начальная скорость
			const vx = (Math.random() - 0.5) * maxSpeed
			const vy = (Math.random() - 0.5) * maxSpeed
			Body.setVelocity(body, { x: vx, y: vy })
		
			World.add(world, body)
			bodies.push(body)
		})
		
		// Единая синхронизация всех DOM-элементов
		Events.on(engine, 'afterUpdate', () => {
			elements.forEach((element, i) => {
				const body = bodies[i]
				element.style.left = `${body.position.x}px`
				element.style.top = `${body.position.y}px`
				element.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`
			})
		})
		
		// Плавное замедление с минимальным движением
		let decayActive = false
		function startDecay() {
			if (decayActive) return
			decayActive = true
			const start = Date.now()
		
			const interval = setInterval(() => {
				const progress = Math.min((Date.now() - start) / decayTime, 1)
		
				bodies.forEach(body => {
					body.frictionAir = finalFrictionAir * progress
		
					const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2)
					if (speed < minSpeed) {
						body.frictionAir = 0
		
						const vx = body.velocity.x === 0 ? (Math.random() > 0.5 ? minSpeed : -minSpeed) : body.velocity.x
						const vy = body.velocity.y === 0 ? (Math.random() > 0.5 ? minSpeed : -minSpeed) : body.velocity.y
		
						Body.setVelocity(body, {
							x: Math.abs(vx) < minSpeed ? (vx < 0 ? -minSpeed : minSpeed) : vx,
							y: Math.abs(vy) < minSpeed ? (vy < 0 ? -minSpeed : minSpeed) : vy,
						})
					}
				})
		
				if (progress === 1) {
					clearInterval(interval)
					decayActive = false
				}
			}, 100)
		}
		
		setTimeout(startDecay, 100)
		
		// Перетаскивание мышью
		const mouse = Mouse.create(render.canvas)
		const mouseConstraint = MouseConstraint.create(engine, {
			mouse: mouse,
			constraint: {
				stiffness: 0.2,
				render: { visible: false },
			},
		})
		World.add(world, mouseConstraint)
		render.mouse = mouse
		}
	}
})
