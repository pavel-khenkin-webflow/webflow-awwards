import Matter from 'matter-js';

document.addEventListener('DOMContentLoaded', () => {
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
	} = Matter;

	const engine = Engine.create();
	engine.gravity.y = 0.02;
	const world = engine.world;

	const canvasWrapper = document.getElementById('error-canvas_wrapper');
	if (!canvasWrapper) return;

	const render = Render.create({
		element: canvasWrapper,
		engine,
		options: {
			width: canvasWrapper.offsetWidth,
			height: canvasWrapper.offsetHeight,
			wireframes: false,
			background: 'transparent',
		},
	});

	Render.run(render);
	const runner = Runner.create();
	Runner.run(runner, engine);

	let walls = [];

	function createWalls() {
		walls.forEach(w => World.remove(world, w));
		const w = canvasWrapper.offsetWidth;
		const h = canvasWrapper.offsetHeight;

		walls = [
			Bodies.rectangle(w / 2, -50, w, 100, { isStatic: true }),
			Bodies.rectangle(w / 2, h + 50, w, 100, { isStatic: true }),
			Bodies.rectangle(-50, h / 2, 100, h, { isStatic: true }),
			Bodies.rectangle(w + 50, h / 2, 100, h, { isStatic: true }),
		];

		World.add(world, walls);
	}

	createWalls();

	function resizeCanvas() {
		render.canvas.width = canvasWrapper.offsetWidth;
		render.canvas.height = canvasWrapper.offsetHeight;
		render.options.width = canvasWrapper.offsetWidth;
		render.options.height = canvasWrapper.offsetHeight;
		createWalls();
	}

	let resizeTimeout = null;
	window.addEventListener('resize', () => {
		if (resizeTimeout) return;
		resizeTimeout = setTimeout(() => {
			resizeTimeout = null;
			resizeCanvas();
		}, 200);
	});

	const elements = document.querySelectorAll('.canvas-btn_white');
	const minSpeed = 0.15;
	const maxSpeed = 10;
	const finalFrictionAir = 0.002;
	const decayTime = 3000;
	const bodies = [];

	elements.forEach((element) => {
		const rect = element.getBoundingClientRect();
		const wrapperRect = canvasWrapper.getBoundingClientRect();

		element.style.width = `${rect.width}px`;
		element.style.height = `${rect.height}px`;
		element.style.position = 'absolute';
		element.style.overflow = 'hidden';
		element.style.boxSizing = 'border-box';
		element.style.pointerEvents = 'none';
		element.style.willChange = 'transform';
		element.style.transformOrigin = 'center center';

		const x = Math.random() * (wrapperRect.width - rect.width) + rect.width / 2;
		const y = Math.random() * (wrapperRect.height - rect.height) + rect.height / 2;

		const body = Bodies.rectangle(x, y, rect.width, rect.height, {
			restitution: 1,
			friction: 0,
			frictionAir: 0,
			chamfer: { radius: 10 },
			render: { fillStyle: 'transparent' },
		});

		const vx = (Math.random() - 0.5) * maxSpeed;
		const vy = (Math.random() - 0.5) * maxSpeed;
		Body.setVelocity(body, { x: vx, y: vy });

		World.add(world, body);
		bodies.push(body);
	});

	Events.on(engine, 'afterUpdate', () => {
		elements.forEach((element, i) => {
			const body = bodies[i];
			element.style.left = `${body.position.x}px`;
			element.style.top = `${body.position.y}px`;
			element.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
		});
	});

	let decayActive = false;
	function startDecay() {
		if (decayActive) return;
		decayActive = true;
		const start = Date.now();

		const interval = setInterval(() => {
			const progress = Math.min((Date.now() - start) / decayTime, 1);

			bodies.forEach((body) => {
				body.frictionAir = finalFrictionAir * progress;

				const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
				if (speed < minSpeed) {
					body.frictionAir = 0;

					const vx = body.velocity.x === 0 ? (Math.random() > 0.5 ? minSpeed : -minSpeed) : body.velocity.x;
					const vy = body.velocity.y === 0 ? (Math.random() > 0.5 ? minSpeed : -minSpeed) : body.velocity.y;

					Body.setVelocity(body, {
						x: Math.abs(vx) < minSpeed ? (vx < 0 ? -minSpeed : minSpeed) : vx,
						y: Math.abs(vy) < minSpeed ? (vy < 0 ? -minSpeed : minSpeed) : vy,
					});
				}
			});

			if (progress === 1) {
				clearInterval(interval);
				decayActive = false;
			}
		}, 100);
	}

	setTimeout(startDecay, 100);

	const mouse = Mouse.create(render.canvas);
	mouse.element.removeEventListener('wheel', mouse.mousewheel); // отключаем scroll захват

	const mouseConstraint = MouseConstraint.create(engine, {
		mouse,
		constraint: {
			stiffness: 0.2,
			render: { visible: false },
		},
	});
	World.add(world, mouseConstraint);
	render.mouse = mouse;
});
