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
  engine.gravity.y = 1; // стандартная гравитация, как в работающем примере
  const world = engine.world;

  const canvasWrapper = document.getElementById('canvas_wrapper2');
  canvasWrapper.style.position = 'relative';
  canvasWrapper.style.overflow = 'hidden';

  const render = Render.create({
    element: canvasWrapper,
    engine: engine,
    options: {
      width: canvasWrapper.offsetWidth,
      height: canvasWrapper.offsetHeight,
      wireframes: false,
      background: 'transparent',
      pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    },
  });

  Render.run(render);
  const runner = Runner.create();
  Runner.run(runner, engine);

  // стены
  const walls = [
    Bodies.rectangle(canvasWrapper.offsetWidth / 2, -50, canvasWrapper.offsetWidth, 100, { isStatic: true }),
    Bodies.rectangle(canvasWrapper.offsetWidth / 2, canvasWrapper.offsetHeight + 50, canvasWrapper.offsetWidth, 100, { isStatic: true }),
    Bodies.rectangle(-50, canvasWrapper.offsetHeight / 2, 100, canvasWrapper.offsetHeight, { isStatic: true }),
    Bodies.rectangle(canvasWrapper.offsetWidth + 50, canvasWrapper.offsetHeight / 2, 100, canvasWrapper.offsetHeight, { isStatic: true }),
  ];
  World.add(world, walls);

  // элементы
  const elements = document.querySelectorAll('.canvas-btn2');
  const wrapperRect = canvasWrapper.getBoundingClientRect();

  const minSpeed = 0.15;       // минимальная скорость
  const maxSpeed = 10;         // максимальная начальная скорость
  const finalFrictionAir = 0.002; // финальное сопротивление воздуха
  const decayTime = 3000;      // время плавного нарастания сопротивления
  const bodies = [];

  elements.forEach(element => {
    const rect = element.getBoundingClientRect();

    element.style.width = `${rect.width}px`;
    element.style.height = `${rect.height}px`;
    element.style.position = 'absolute';
    element.style.pointerEvents = 'none';
    element.style.transformOrigin = 'center center';
    element.style.willChange = 'transform';

    const x = Math.random() * (wrapperRect.width - rect.width) + rect.width / 2;
    const y = Math.random() * (wrapperRect.height - rect.height) + rect.height / 2;

    const body = Bodies.rectangle(x, y, rect.width, rect.height, {
      restitution: 0.4,
      friction: 0,
      frictionAir: 0, // стартуем без сопротивления
      chamfer: { radius: 10 },
      render: { fillStyle: 'transparent' },
    });

    // начальная скорость вниз
    const vx = 0;
    const vy = Math.random() * maxSpeed;
    Body.setVelocity(body, { x: vx, y: vy });

    World.add(world, body);
    bodies.push(body);
  });

  // обновление позиций DOM
  Events.on(engine, 'afterUpdate', () => {
    elements.forEach((element, i) => {
      const body = bodies[i];
      element.style.left = `${body.position.x}px`;
      element.style.top = `${body.position.y}px`;
      element.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
    });
  });

  // плавное нарастание сопротивления воздуха (decay)
  let decayActive = false;
  function startDecay() {
    if (decayActive) return;
    decayActive = true;
    const start = Date.now();

    const interval = setInterval(() => {
      const progress = Math.min((Date.now() - start) / decayTime, 1);

      bodies.forEach(body => {
        body.frictionAir = finalFrictionAir * progress;

        // проверяем, чтобы не залипали
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

  // запуск decay через 100мс после загрузки
  setTimeout(startDecay, 100);

  // мышь для интерактивности
  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: { stiffness: 0.2, render: { visible: false } },
  });
  World.add(world, mouseConstraint);
  render.mouse = mouse;

  // адаптация к ресайзу
  window.addEventListener('resize', () => {
    render.canvas.width = canvasWrapper.offsetWidth;
    render.canvas.height = canvasWrapper.offsetHeight;
  });
});
