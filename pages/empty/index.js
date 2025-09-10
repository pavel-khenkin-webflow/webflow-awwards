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

  engine.world.gravity.y = 0;   
  engine.world.gravity.x = 0; 
  engine.world.gravity.scale = 0.0008;

  const world = engine.world;

  const canvasWrapper = document.getElementById('canvas_wrapper2');
  canvasWrapper.style.position = 'relative';

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
      restitution: 0.9,     // упругие столкновения — эффект "космоса"
      friction: 0,          // без трения о поверхности
      frictionStatic: 0,
      frictionAir: 0.02,    // лёгкое сопротивление воздуха — плавность
      chamfer: { radius: 10 },
      render: { fillStyle: 'transparent' },
    });

    // мягкие стартовые скорости (не вниз)
    const vx = (Math.random() - 0.5) * 1.2;
    const vy = (Math.random() - 0.5) * 1.2;
    Body.setVelocity(body, { x: vx, y: vy });

    // лёгкое начальное вращение
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.02);

    World.add(world, body);
    bodies.push(body);
  });

  // плавный "дрейф" — микросилы по синусам
  Events.on(engine, 'beforeUpdate', (event) => {
    const t = event.timestamp * 0.001; // секунды
    const base = 0.00002;              // сила дрейфа; при необходимости подстрой

    bodies.forEach((b, i) => {
      const fx = Math.sin(t + i * 0.7) * base * b.mass;
      const fy = Math.cos(t * 1.1 + i * 0.37) * base * b.mass;
      Body.applyForce(b, b.position, { x: fx, y: fy });
    });
  });

  // редкие "подталкивания", чтобы не залипали
  const nudge = () => {
    bodies.forEach((b) => {
      const f = 0.00008 * b.mass;
      Body.applyForce(b, b.position, {
        x: (Math.random() - 0.5) * f,
        y: (Math.random() - 0.5) * f,
      });
    });
  };
  setInterval(nudge, 2800 + Math.random() * 1200);

  // обновление позиций DOM-элементов под физику
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

  // (опционально) адаптация к ресайзу
  window.addEventListener('resize', () => {
    render.canvas.width = canvasWrapper.offsetWidth;
    render.canvas.height = canvasWrapper.offsetHeight;
  });
});
