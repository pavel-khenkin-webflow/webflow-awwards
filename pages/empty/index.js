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
  engine.gravity.y = 0.01;
  const world = engine.world;

  const canvasWrapper = document.getElementById('canvas_wrapper2');
  const render = Render.create({
    element: canvasWrapper,
    engine: engine,
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

    const x = Math.random() * (wrapperRect.width - rect.width) + rect.width / 2;
    const y = Math.random() * (wrapperRect.height - rect.height) + rect.height / 2;

    const body = Bodies.rectangle(x, y, rect.width, rect.height, {
      restitution: 0.4,
      friction: 0.1,
      frictionAir: 0.01,
      chamfer: { radius: 10 },
      render: { fillStyle: 'transparent' },
    });

    const vx = (Math.random() - 0.5) * 10;
    const vy = Math.random() * 10 + 2;
    Body.setVelocity(body, { x: vx, y: vy });

    World.add(world, body);
    bodies.push(body);
  });

  // обновление позиций
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
    constraint: { stiffness: 0.2, render: { visible: false } },
  });
  World.add(world, mouseConstraint);
  render.mouse = mouse;
});
