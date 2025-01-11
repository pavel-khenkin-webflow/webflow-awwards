import { gsap } from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(MotionPathPlugin, SplitText)

// Функция анимации текста по пути
export function animateTextOnPath(
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

	// Проверяем, найдены ли элементы
	if (!textElement || !pathElement) {
		console.error(
			`Элемент текста или путь не найдены для селекторов: ${textSelector}, ${pathSelector}`
		)
		return
	}

	// Разбиваем текст на слова
	const words = new SplitText(textElement, { type: 'words' })

	// Создаем новый массив символов, включая пробелы
	const newChars = []
	words.words.forEach((word, index) => {
		// Разбиваем каждое слово на символы
		const chars = new SplitText(word, { type: 'words, chars' }).chars
		newChars.push(...chars)

		if (index < words.words.length - 1) {
			// Добавляем пробелы между словами
			const space = document.createElement('span')
			space.innerHTML = '&nbsp;'
			space.classList.add('space')
			newChars.push(space)
		}
	})

	// Очищаем текстовый элемент и добавляем обратно символы с пробелами
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

	return tl
}

// Функция debounce для оптимизации пересчета при изменении размеров экрана
function debounce(func, wait = 100) {
	let timeout
	return function () {
		clearTimeout(timeout)
		timeout = setTimeout(() => func.apply(this, arguments), wait)
	}
}

// Функция для пересоздания анимаций при изменении размеров экрана
export function setupResizeListener(animationConfig) {
	let animations = []

	function initAllAnimations() {
		// Уничтожаем старые анимации, если они существуют
		if (animations.length > 0) {
			animations.forEach(tl => tl.kill())
		}

		// Инициализируем анимации для всех переданных конфигураций
		animations = animationConfig.map(({ textSelector, pathSelector }) =>
			animateTextOnPath(textSelector, pathSelector)
		)
	}

	// Добавляем обработчик события resize с debounce
	window.addEventListener(
		'resize',
		debounce(() => {
			initAllAnimations() // Пересоздаем анимации при изменении размеров окна
		}, 200)
	)

	// Инициализируем анимации при первом запуске
	initAllAnimations()
}
