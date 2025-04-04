// import { gsap } from 'gsap'
// import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
// import { SplitText } from 'gsap/SplitText'

// gsap.registerPlugin(MotionPathPlugin, SplitText)

// // Функция анимации текста по пути
// export function animateTextOnPath(
// 	textSelector,
// 	pathSelector,
// 	duration = 20,
// 	staggerEach = 0.3,
// 	pathStart = 1,
// 	pathEnd = 0,
// 	initialProgress = 0.5
// ) {
// 	const textElement = document.querySelector(textSelector)
// 	const pathElement = document.querySelector(pathSelector)

// 	// Проверяем, найдены ли элементы
// 	if (!textElement || !pathElement) {
// 		console.error(
// 			`Элемент текста или путь не найдены для селекторов: ${textSelector}, ${pathSelector}`
// 		)
// 		return
// 	}

// 	// Разбиваем текст на слова
// 	const words = new SplitText(textElement, { type: 'words' })

// 	// Создаем новый массив символов, включая пробелы
// 	const newChars = []
// 	words.words.forEach((word, index) => {
// 		// Разбиваем каждое слово на символы
// 		const chars = new SplitText(word, { type: 'words, chars' }).chars
// 		newChars.push(...chars)

// 		if (index < words.words.length - 1) {
// 			// Добавляем пробелы между словами
// 			const space = document.createElement('span')
// 			space.innerHTML = '&nbsp;'
// 			space.classList.add('space')
// 			newChars.push(space)
// 		}
// 	})

// 	// Очищаем текстовый элемент и добавляем обратно символы с пробелами
// 	textElement.innerHTML = ''
// 	newChars.forEach(char => textElement.appendChild(char))

// 	// Получаем обновленный список символов для анимации
// 	const updatedChars = Array.from(textElement.children)

// 	// Устанавливаем начальные позиции символов и переворачиваем по осям X и Y
// 	gsap.set(updatedChars, { xPercent: -50, yPercent: -50 })

// 	// Создаем анимацию с GSAP
// 	const tl = gsap.timeline({ repeat: -1 }).to(updatedChars, {
// 		duration: duration, // Продолжительность анимации
// 		motionPath: {
// 			path: pathElement,
// 			align: pathElement,
// 			alignOrigin: [0.5, 0.5],
// 			autoRotate: true, // Включаем autoRotate
// 			start: pathStart, // Начинаем с конца пути
// 			end: pathEnd, // Движемся к началу пути
// 		},
// 		ease: 'linear',
// 		stagger: {
// 			each: staggerEach, // Расстояние между символами
// 			repeat: -1,
// 			from: 'end', // Начало с первой буквы
// 		},
// 		immediateRender: true,
// 	})

// 	// Устанавливаем начальное состояние анимации
// 	tl.progress(initialProgress)

// 	return tl
// }

// // Функция debounce для оптимизации пересчета при изменении размеров экрана
// function debounce(func, wait = 100) {
// 	let timeout
// 	return function () {
// 		clearTimeout(timeout)
// 		timeout = setTimeout(() => func.apply(this, arguments), wait)
// 	}
// }

// // Функция для пересоздания анимаций при изменении размеров экрана
// export function setupResizeListener(animationConfig) {
// 	let animations = []

// 	function initAllAnimations() {
// 		// Уничтожаем старые анимации, если они существуют
// 		if (animations.length > 0) {
// 			animations.forEach(tl => tl.kill())
// 		}

// 		// Инициализируем анимации для всех переданных конфигураций
// 		animations = animationConfig.map(({ textSelector, pathSelector }) =>
// 			animateTextOnPath(textSelector, pathSelector)
// 		)
// 	}

// 	// Добавляем обработчик события resize с debounce
// 	window.addEventListener(
// 		'resize',
// 		debounce(() => {
// 			initAllAnimations() // Пересоздаем анимации при изменении размеров окна
// 		}, 200)
// 	)

// 	// Инициализируем анимации при первом запуске
// 	initAllAnimations()
// }


// utility/run-line.js

// export function setupTextPathAnimations(pairs) {
// 	const animations = []
  
// 	function initAll() {
// 	  animations.forEach(anim => cancelAnimationFrame(anim.raf))
// 	  animations.length = 0
  
// 	  pairs.forEach(({ textSelector, pathClass, idSuffix }) => {
// 		const paragraph = document.querySelector(textSelector)
// 		const path = document.querySelector(`.${pathClass}`)
// 		const svg = path?.closest('svg')
  
// 		if (!paragraph || !path || !svg) return
  
// 		const pathId = `path-${idSuffix}`
// 		path.setAttribute('id', pathId)
  
// 		svg.querySelector('text')?.remove()
  
// 		const computedStyles = getComputedStyle(paragraph)
// 		const fontSize = computedStyles.fontSize
// 		const fontFamily = computedStyles.fontFamily
// 		const color = computedStyles.color
  
// 		const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text')
// 		textEl.setAttribute('font-size', fontSize)
// 		textEl.setAttribute('font-family', fontFamily)
// 		textEl.setAttribute('fill', color)
  
// 		const textPathEl = document.createElementNS('http://www.w3.org/2000/svg', 'textPath')
// 		textPathEl.setAttribute('href', `#${pathId}`)
// 		textPathEl.setAttribute('startOffset', '0%')
  
// 		textEl.appendChild(textPathEl)
// 		svg.appendChild(textEl)
  
// 		const pathLength = path.getTotalLength()
  
// 		const dummy = document.createElement('span')
// 		dummy.style.visibility = 'hidden'
// 		dummy.style.whiteSpace = 'nowrap'
// 		dummy.style.fontSize = fontSize
// 		dummy.style.fontFamily = fontFamily
// 		dummy.textContent = paragraph.textContent
// 		document.body.appendChild(dummy)
// 		const baseTextWidth = dummy.offsetWidth
// 		dummy.remove()
  
// 		const repeatCount = Math.ceil((pathLength * 2.5) / baseTextWidth)
// 		const repeatedText = paragraph.textContent.repeat(repeatCount)
// 		textPathEl.textContent = repeatedText
  
// 		paragraph.style.display = 'none'
  
// 		let offset = 0
// 		const speed = 0.1
// 		function animate() {
// 		  offset = (offset - speed + 100) % 100
// 		  textPathEl.setAttribute('startOffset', `${offset}%`)
// 		  anim.raf = requestAnimationFrame(animate)
// 		}
  
// 		const anim = { raf: null }
// 		animations.push(anim)
// 		animate()
// 	  })
// 	}
  
// 	function debounce(func, wait = 200) {
// 	  let timeout
// 	  return function () {
// 		clearTimeout(timeout)
// 		timeout = setTimeout(() => func(), wait)
// 	  }
// 	}
  
// 	window.addEventListener('resize', debounce(initAll))
// 	initAll()
//   }
  
// export function setupTextPathAnimations(pairs) {
// 	const animations = []
  
// 	function initAll() {
// 	  animations.forEach(anim => cancelAnimationFrame(anim.raf))
// 	  animations.length = 0
  
// 	  pairs.forEach(({ textSelector, pathClass, idSuffix }) => {
// 		const paragraph = document.querySelector(textSelector)
// 		const path = document.querySelector(`.${pathClass}`)
// 		const svg = path?.closest('svg')
  
// 		if (!paragraph || !path || !svg) return
  
// 		const pathId = `path-${idSuffix}`
// 		path.setAttribute('id', pathId)
  
// 		svg.querySelector('text')?.remove()
  
// 		const computedStyles = getComputedStyle(paragraph)
// 		const fontSize = computedStyles.fontSize
// 		const fontFamily = computedStyles.fontFamily
// 		const color = computedStyles.color
  
// 		const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text')
// 		textEl.setAttribute('font-size', fontSize)
// 		textEl.setAttribute('font-family', fontFamily)
// 		textEl.setAttribute('fill', color)
// 		textEl.setAttribute('dominant-baseline', 'top')
// 		textEl.setAttribute('dy', '0.35em')
  
// 		const textPathEl = document.createElementNS('http://www.w3.org/2000/svg', 'textPath')
// 		textPathEl.setAttribute('href', `#${pathId}`)
// 		textPathEl.setAttribute('startOffset', '0%')
  
// 		textEl.appendChild(textPathEl)
// 		svg.appendChild(textEl)
  
// 		// 🔥 Новый способ дублирования текста на основе длины пути и ширины текста
// 		const baseText = paragraph.textContent.trim()
// 		const pathLength = path.getTotalLength()
  
// 		const dummy = document.createElement('span')
// 		dummy.style.visibility = 'hidden'
// 		dummy.style.whiteSpace = 'nowrap'
// 		dummy.style.fontSize = fontSize
// 		dummy.style.fontFamily = fontFamily
// 		dummy.textContent = baseText
// 		document.body.appendChild(dummy)
// 		const baseTextWidth = dummy.offsetWidth
// 		dummy.remove()
  
// 		// Повторяем, чтобы итоговая длина была ≥ 2.5 × длины пути
// 		const repeatCount = Math.ceil((pathLength * 2.5) / baseTextWidth)
// 		const finalText = baseText.repeat(repeatCount)
// 		textPathEl.textContent = finalText
  
// 		paragraph.style.display = 'none'
  
// 		// Анимация
// 		let offset = 0
// 		const speed = 0.1
  
// 		function animate() {
// 		  offset = (offset - speed) % 100
// 		  textPathEl.setAttribute('startOffset', `${offset}%`)
// 		  anim.raf = requestAnimationFrame(animate)
// 		}
  
// 		const anim = { raf: null }
// 		animations.push(anim)
// 		animate()
// 	  })
// 	}
  
// 	function debounce(func, wait = 200) {
// 	  let timeout
// 	  return function () {
// 		clearTimeout(timeout)
// 		timeout = setTimeout(() => func(), wait)
// 	  }
// 	}
  
// 	window.addEventListener('resize', debounce(initAll))
// 	initAll()
//   }
  

export function setupTextPathAnimations(pairs) {
	const animations = []

	function initAll() {
		// Останавливаем все прошлые анимации
		animations.forEach(anim => cancelAnimationFrame(anim.raf))
		animations.length = 0

		pairs.forEach(({ textSelector, pathClass, idSuffix }) => {
			const paragraph = document.querySelector(textSelector)
			const path = document.querySelector(`.${pathClass}`)
			const svg = path?.closest('svg')

			if (!paragraph || !path || !svg) return

			// Назначаем уникальный ID пути
			const pathId = `path-${idSuffix}`
			path.setAttribute('id', pathId)

			// Удаляем старый <text>, если есть
			const oldText = svg.querySelector('text')
			if (oldText) oldText.remove()

			// Получаем стили параграфа
			const computedStyles = getComputedStyle(paragraph)
			const fontSize = computedStyles.fontSize
			const fontFamily = computedStyles.fontFamily
			const color = computedStyles.color

			// Создаем SVG <text>
			const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text')
			textEl.setAttribute('font-size', fontSize)
			textEl.setAttribute('font-family', fontFamily)
			textEl.setAttribute('fill', color)
			textEl.setAttribute('dominant-baseline', 'top')
			textEl.setAttribute('dy', '0.35em')
			textEl.setAttribute('text-anchor', 'middle')

			// Отзеркаливаем текст по вертикали и горизонтали для второго SVG
			if (idSuffix === '2') {
				const bbox = path.getBBox()
				const centerX = bbox.x + bbox.width / 2
				const centerY = bbox.y + bbox.height / 2

				// Сначала двигаем в центр, потом отражаем, потом возвращаем обратно
				const transform = `
					translate(${2 * centerX}, ${2 * centerY})
					scale(-1, -1)
				`
				textEl.setAttribute('transform', transform.trim())
			}

			// Создаем <textPath> и прикрепляем его к пути
			const textPathEl = document.createElementNS('http://www.w3.org/2000/svg', 'textPath')
			textPathEl.setAttribute('href', `#${pathId}`)
			textPathEl.setAttribute('startOffset', '0%')

			textEl.appendChild(textPathEl)
			svg.appendChild(textEl)

			// Подготовка текста к повторению по длине пути
			const baseText = paragraph.textContent.trim()
			const pathLength = path.getTotalLength()

			const dummy = document.createElement('span')
			dummy.style.visibility = 'hidden'
			dummy.style.whiteSpace = 'nowrap'
			dummy.style.fontSize = fontSize
			dummy.style.fontFamily = fontFamily
			dummy.textContent = baseText
			document.body.appendChild(dummy)
			const baseTextWidth = dummy.offsetWidth
			dummy.remove()

			const repeatCount = Math.ceil((pathLength * 2.5) / baseTextWidth)
			const finalText = baseText.repeat(repeatCount)
			textPathEl.textContent = finalText

			paragraph.style.display = 'none'

			// Анимация: направление зависит от idSuffix
			let offset
			if (idSuffix === '2') {
				offset = -100 // стартуем справа, двигаемся вправо
			} else {
				offset = 0 // стартуем слева, двигаемся влево
			}

			const speed = 0.2

			function animate() {
				if (idSuffix === '2') {
					offset = (offset + speed) % 100 // вправо
				} else {
					offset = (offset - speed + 100) % 100 // влево
				}
				textPathEl.setAttribute('startOffset', `${offset}%`)
				anim.raf = requestAnimationFrame(animate)
			}

			const anim = { raf: null }
			animations.push(anim)
			animate()
		})
	}

	// Обработка resize с debounce
	function debounce(func, wait = 200) {
		let timeout
		return function () {
			clearTimeout(timeout)
			timeout = setTimeout(() => func(), wait)
		}
	}

	window.addEventListener('resize', debounce(initAll))
	initAll()
}
