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

  // === ИНИЦ ===
  const engine = Engine.create();
  const world = engine.world;

  // Полностью выключаем гравитацию
  world.gravity.x = 0;
  world.gravity.y = 0;
  world.gravity.scale = 0;

  const canvasWrapper = document.getElementById('canvas_wrapper2');
  // чтобы абсолютные элементы рассчитывались от контейнера
  canvasWrapper.style.position = 'relative';
  canvasWrapper.style.overflow = 'hidden';

  const render = Render.create({
    element: canvasWrapper,
    engine,
    options: {
      width: canvasWrapper.offsetWidth,
      height: canvasWrapper.offsetHeight,
      wireframes: false,
      background: 'transparent',
      pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    },
  });

  Render.run(render);
  const runner = Runner.create({ isFixed: true }); // стабильный таймстеп
  Runner.run(runner, engine);

  // === СТЕНЫ ===
  function makeWalls() {
    const W = canvasWrapper.offsetWidth;
    const H = canvasWrapper.offsetHeight;
    return [
      Bodies.rectangle(W / 2, -50, W, 100, { isStatic: true }),
      Bodies.rectangle(W / 2, H + 50, W, 100, { isStatic: true }),
      Bodies.rectangle(-50, H / 2, 100, H, { isStatic: true }),
      Bodies.rectangle(W + 50, H / 2, 100, H, { isStatic: true }),
    ];
  }
  let walls = makeWalls();
  World.add(world, walls);

  // === ЭЛЕМЕНТЫ ===
  const elements = Array.from(document.querySelectorAll('.canvas-btn2'));
  const wrapperRect = canvasWrapper.getBoundingClientRect();
  const bodies = [];

  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();

    // базовая подготовка DOM
    el.style.width = `${rect.width}px`;
    el.style.height = `${rect.height}px`;
    el.style.position = 'absolute';
    el.style.left = '0px';
    el.style.top = '0px';
    el.style.pointerEvents = 'none';
    el.style.transformOrigin = 'center center';
    el.style.willChange = 'transform';

    const x = Math.random() * (wrapperRect.width - rect.width) + rect.width / 2;
    const y = Math.random() * (wrapperRect.height - rect.height) + rect.height / 2;

    const body = Bodies.rectangle(x, y, rect.width, rect.height, {
      restitution: 0.9,   // упруго, как в невесомости
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0.035, // сглаживаем рывки
      chamfer: { radius: 10 },
      render: { fillStyle: 'transparent' },
    });

    // очень маленькие стартовые скорости
    Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 0.4,
      y: (Math.random() - 0.5) * 0.4,
    });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.01);

    World.add(world, body);
    bodies.push(body);
  });

  // === АНТИ-ГРАВИТАЦИЯ (на случай внешних переопределений) ===
  Events.on(engine, 'beforeUpdate', () => {
    const g = world.gravity;
    // компенсируем любую текущую гравитацию мира
    if ((g.x !== 0 || g.y !== 0) && g.scale !== 0) {
      bodies.forEach((b) => {
        const fx = -g.x * g.scale * b.mass;
        const fy = -g.y * g.scale * b.mass;
        Body.applyForce(b, b.position, { x: fx, y: fy });
      });
    }

    // мягкий дрейф
    const t = engine.timing.timestamp * 0.001;
    const drift = 0.00002;
    bodies.forEach((b, i) => {
      Body.applyForce(b, b.position, {
        x: Math.sin(t + i * 0.73) * drift * b.mass,
        y: Math.cos(t * 1.11 + i * 0.37) * drift * b.mass,
      });
    });
  });

  // редкие маленькие «подталкивания» — чтобы не залипали
  setInterval(() => {
    bodies.forEach((b) => {
      const f = 0.00006 * b.mass;
      Body.applyForce(b, b.position, {
        x: (Math.random() - 0.5) * f,
        y: (Math.random() - 0.5) * f,
      });
    });
  }, 3000);

  // === ОТРИСОВКА DOM ПО ФИЗИКЕ (только transform — без left/top) ===
  Events.on(engine, 'afterUpdate', () => {
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const b = bodies[i];
      // трансформ в мировой системе координат контейнера
      el.style.transform =
        `translate3d(${b.position.x}px, ${b.position.y}px, 0) ` +
        `translate(-50%, -50%) rotate(${b.angle}rad)`;
    }
  });

  // === МЫШЬ ===
  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.1, render: { visible: false } },
  });
  World.add(world, mouseConstraint);
  render.mouse = mouse;

  // === РЕСАЙЗ (пересоздаём стены и канвас) ===
  window.addEventListener('resize', () => {
    render.canvas.width = canvasWrapper.offsetWidth;
    render.canvas.height = canvasWrapper.offsetHeight;

    World.remove(world, walls);
    walls = makeWalls();
    World.add(world, walls);
  });
});
