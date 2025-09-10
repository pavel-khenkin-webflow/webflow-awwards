document.addEventListener('DOMContentLoaded', () => {
  const { Engine, Render, Runner, Bodies, Body, World, Mouse, MouseConstraint, Events } = Matter;

  const engine = Engine.create();
  const world = engine.world;

  // Отключаем гравитацию
  world.gravity.x = 0;
  world.gravity.y = 0;
  world.gravity.scale = 0;

  const canvasWrapper = document.getElementById('canvas_wrapper2');
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

  // стены
  const walls = [
    Bodies.rectangle(canvasWrapper.offsetWidth / 2, -50, canvasWrapper.offsetWidth, 100, { isStatic: true }),
    Bodies.rectangle(canvasWrapper.offsetWidth / 2, canvasWrapper.offsetHeight + 50, canvasWrapper.offsetWidth, 100, { isStatic: true }),
    Bodies.rectangle(-50, canvasWrapper.offsetHeight / 2, 100, canvasWrapper.offsetHeight, { isStatic: true }),
    Bodies.rectangle(canvasWrapper.offsetWidth + 50, canvasWrapper.offsetHeight / 2, 100, canvasWrapper.offsetHeight, { isStatic: true }),
  ];
  World.add(world, walls);

  const elements = document.querySelectorAll('.canvas-btn2');
  const wrapperRect = canvasWrapper.getBoundingClientRect();
  const bodies = [];

  elements.forEach(el => {
    const rect = el.getBoundingClientRect();

    el.style.width = `${rect.width}px`;
    el.style.height = `${rect.height}px`;
    el.style.position = 'absolute';
    el.style.pointerEvents = 'none';
    el.style.transformOrigin = 'center center';

    const x = Math.random() * (wrapperRect.width - rect.width) + rect.width / 2;
    const y = Math.random() * (wrapperRect.height - rect.height) + rect.height / 2;

    const body = Bodies.rectangle(x, y, rect.width, rect.height, {
      restitution: 0.9,
      frictionAir: 0.002, // лёгкое сопротивление
      render: { fillStyle: 'transparent' },
    });

    // хорошая начальная скорость
    Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 5,
      y: (Math.random() - 0.5) * 5,
    });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);

    World.add(world, body);
    bodies.push(body);
  });

  // мягкие подталкивания каждые 1–2 секунды
  setInterval(() => {
    bodies.forEach(b => {
      Body.applyForce(b, b.position, {
        x: (Math.random() - 0.5) * 0.0005,
        y: (Math.random() - 0.5) * 0.0005,
      });
    });
  }, 1500);

  Events.on(engine, 'afterUpdate', () => {
    elements.forEach((el, i) => {
      const b = bodies[i];
      el.style.left = `${b.position.x}px`;
      el.style.top = `${b.position.y}px`;
      el.style.transform = `translate(-50%, -50%) rotate(${b.angle}rad)`;
    });
  });

  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, render: { visible: false } },
  });
  World.add(world, mouseConstraint);
  render.mouse = mouse;
});
