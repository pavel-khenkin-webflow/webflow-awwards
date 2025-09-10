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

  // Невесомость
  engine.world.gravity.y = 0;
  engine.world.gravity.x = 0;

  const world = engine.world;

  const canvasWrapper = document.getElementById('canvas_wrapper2');
  canvasWrapper.style.position = 'relative'; // чтобы абсолютные элементы позиционировались

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
  const bodies = [];

  elements.forEach(element => {
    const rect = element.getBoundingClientRect();

    element.style.width = `${rect.width}px`;
    element.style.height = `${rect.height}px`;
    element.style.position = 'absolute';
    element.style.pointerEvents = 'none';
    element.style.transformOrigin = 'center center';
    element.style.willChange = 'transform, left, top';

    const x = Math.random() * (wrapperRect.width - rect.width) + rect.width / 2;
    const y = Math.random() * (wrapperRect.height - rect.height) + rect.height / 2;

    const body = Bodies.rectangle(x, y, rect.width, rect.height, {
      restitution: 0.9,     // упругие столкновения
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0.02,    // лёгкое сопротивление воздуха
      chamfer: { radius: 10 },
      render: { fillStyle: 'transparent' },
    });

    // небольшие стартовые скорости
    const vx = (Math.random() - 0.5) * 2;
    const vy = (Math.random() - 0.5) * 2;
    Body.setVelocity(body, { x: vx, y: vy });

    // лёгкое вращение
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.02);

    World.add(world, body);
    bodies.push(body);
  });

  // плавный дрейф — микросилы
  Events.on(engine, 'beforeUpdate', (event) => {
    const t = event.timestamp * 0.001; // секунды
    const base = 0.00002;

    bodies.forEach((b, i) => {
      const fx = Math.sin(t + i * 0.7) * base * b.mass;
      const fy = Math.cos(t * 1.1 + i * 0.37) * base * b.mass;
      Body.applyForce(b, b.position, { x: fx, y: fy });
    });
  });

  // редкие «подталкивания»
  setInterval(() => {
    bodies.forEach(b => {
      const f = 0.00008 * b.mass;
      Body.applyForce(b, b.position, {
        x: (Math.random() - 0.5) * f,
        y: (Math.random() - 0.5) * f,
      });
    });
  }, 3000);

  // обновление позиций DOM-элементов
  Events.on(engine, 'afterUpdate', () => {
    elements.forEach((element, i) => {
      const body = bodies[i];
      element.style.left = `${body.position.x}px`;
      element.style.top = `${body.position.y}px`;
      element.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
    });
  });

  // мышь для интерактивности
  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: { stiffness: 0.1, render: { visible: false } },
  });
  World.add(world, mouseConstraint);
  render.mouse = mouse;

  // адаптация к ресайзу
  window.addEventListener('resize', () => {
    render.canvas.width = canvasWrapper.offsetWidth;
    render.canvas.height = canvasWrapper.offsetHeight;
  });
});
