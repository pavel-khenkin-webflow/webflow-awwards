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

  // 1) ENGINE + ЖЁСТКАЯ АНТИ-ГРАВИТАЦИЯ
  const engine = Engine.create();
  const world = engine.world;

  // базовая блокировка гравитации
  world.gravity.x = 0;
  world.gravity.y = 0;
  world.gravity.scale = 0;

  // на случай, если где-то в проекте есть старый код с engine.gravity.y = 10 — как в твоём исходнике :contentReference[oaicite:1]{index=1}—
  // мы каждый тик обнуляем гравитацию и компенсируем любые внешние силы тяжести
  const neutralizeGravity = () => {
    const g = world.gravity;
    if (g.x !== 0 || g.y !== 0 || g.scale !== 0) {
      g.x = 0; g.y = 0; g.scale = 0;
    }
  };

  // 2) CANVAS
  const canvasWrapper = document.getElementById('canvas_wrapper2');
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
  const runner = Runner.create({ isFixed: true });
  Runner.run(runner, engine);

  // 3) СТЕНЫ
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

  // 4) ЭЛЕМЕНТЫ
  const elements = Array.from(document.querySelectorAll('.canvas-btn2'));
  const wrapperRect = canvasWrapper.getBoundingClientRect();
  const bodies = [];

  // параметры «рабочей» логики: быстрый старт, затем затухание
  const minSpeed = 0.15;            // не даём «залипать»
  const maxStartSpeed = 10;         // начальная скорость
  const finalFrictionAir = 0.002;   // финишное сопротивление
  const decayTime = 3000;           // время плавного роста frictionAir

  elements.forEach(el => {
    // гарантируем, что абсолютное позиционирование считается от canvasWrapper
    if (!canvasWrapper.contains(el)) canvasWrapper.appendChild(el);

    const rect = el.getBoundingClientRect();

    // подготовка DOM
    el.style.width = `${rect.width}px`;
    el.style.height = `${rect.height}px`;
    el.style.position = 'absolute';
    el.style.left = '0px';
    el.style.top = '0px';
    el.style.pointerEvents = 'none';
    el.style.transformOrigin = 'center center';
    el.style.willChange = 'transform';

    // стартовая точка в пределах контейнера
    const x = Math.random() * (wrapperRect.width - rect.width) + rect.width / 2;
    const y = Math.random() * (wrapperRect.height - rect.height) + rect.height / 2;

    const body = Bodies.rectangle(x, y, rect.width, rect.height, {
      restitution: 0.4,
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0, // старт без сопротивления — как на «рабочей» странице :contentReference[oaicite:2]{index=2}
      chamfer: { radius: 10 },
      render: { fillStyle: 'transparent' },
    });

    // стартовая скорость (вниз, как в рабочем варианте, но zero-g компенсирует притяжение)
    Body.setVelocity(body, { x: 0, y: Math.random() * maxStartSpeed });

    World.add(world, body);
    bodies.push(body);
  });

  // 5) ПЛАВНОЕ ЗАТУХАНИЕ КАК НА «РАБОЧЕЙ» СТРАНИЦЕ
  let decayActive = false;
  function startDecay() {
    if (decayActive) return;
    decayActive = true;
    const t0 = Date.now();

    const h = setInterval(() => {
      const progress = Math.min((Date.now() - t0) / decayTime, 1);

      bodies.forEach(b => {
        // растим сопротивление воздуха постепенно
        b.frictionAir = finalFrictionAir * progress;

        // не даём телам залипать на месте
        const vx = b.velocity.x, vy = b.velocity.y;
        const speed = Math.hypot(vx, vy);
        if (speed < minSpeed) {
          b.frictionAir = 0;
          Body.setVelocity(b, {
            x: Math.abs(vx) < minSpeed ? (Math.random() < 0.5 ? -minSpeed : minSpeed) : vx,
            y: Math.abs(vy) < minSpeed ? (Math.random() < 0.5 ? -minSpeed : minSpeed) : vy,
          });
        }
      });

      if (progress === 1) {
        clearInterval(h);
        decayActive = false;
      }
    }, 100);
  }
  setTimeout(startDecay, 100);

  // 6) «ДРЕЙФ» ДЛЯ ЖИВОСТИ + ЖЁСТКАЯ АНТИ-ГРАВИТАЦИЯ КАЖДЫЙ ТИК
  Events.on(engine, 'beforeUpdate', () => {
    neutralizeGravity();

    // лёгкий дрейф (едва заметные микросилы)
    const t = engine.timing.timestamp * 0.001;
    const drift = 0.00002;
    bodies.forEach((b, i) => {
      Body.applyForce(b, b.position, {
        x: Math.sin(t + i * 0.73) * drift * b.mass,
        y: Math.cos(t * 1.11 + i * 0.37) * drift * b.mass,
      });
    });
  });

  // 7) ОТРИСОВКА DOM (только transform, без left/top на каждом кадре)
  Events.on(engine, 'afterUpdate', () => {
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const b = bodies[i];
      el.style.transform =
        `translate3d(${b.position.x}px, ${b.position.y}px, 0) translate(-50%, -50%) rotate(${b.angle}rad)`;
    }
  });

  // 8) МЫШЬ
  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, render: { visible: false } },
  });
  World.add(world, mouseConstraint);
  render.mouse = mouse;

  // 9) РЕСАЙЗ: пересоздаём стены и холст
  window.addEventListener('resize', () => {
    render.canvas.width = canvasWrapper.offsetWidth;
    render.canvas.height = canvasWrapper.offsetHeight;
    World.remove(world, walls);
    walls = makeWalls();
    World.add(world, walls);
  });
});
