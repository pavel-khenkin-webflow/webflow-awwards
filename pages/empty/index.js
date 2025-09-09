// Ждём пока Webflow загрузит DOM
window.Webflow ||= [];
window.Webflow.push(() => {
  console.log('[matter] init start...');

  // === Безопасный поиск контейнера ===
  const canvasWrapper =
    document.getElementById('error-canvas_wrapper') ||
    document.getElementById('canvas_wrapper2');

  if (!canvasWrapper) {
    console.warn('[matter] контейнер для canvas не найден');
    return;
  }

  // Если канваса внутри нет – создаём его
  let canvas = canvasWrapper.querySelector('canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvasWrapper.appendChild(canvas);
  }

  // Подгон размеров канваса
  const resizeCanvas = () => {
    canvas.width = canvasWrapper.offsetWidth || window.innerWidth;
    canvas.height = canvasWrapper.offsetHeight || window.innerHeight;
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // ==== Дальше идёт ТВОЙ оригинальный код ====
  // Я ничего в нём не менял кроме замены document.getElementById('canvas_wrapper2')
  // на переменную canvasWrapper / canvas.

  const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Composites = Matter.Composites,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies;

  // create engine
  const engine = Engine.create(),
    world = engine.world;

  // create renderer
  const render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
      width: canvas.width,
      height: canvas.height,
      wireframes: false,
      background: 'transparent',
    },
  });

  Render.run(render);

  // create runner
  const runner = Runner.create();
  Runner.run(runner, engine);

  // walls
  const offset = 10;
  World.add(world, [
    Bodies.rectangle(canvas.width / 2, -offset, canvas.width, 50, {
      isStatic: true,
    }),
    Bodies.rectangle(canvas.width / 2, canvas.height + offset, canvas.width, 50, {
      isStatic: true,
    }),
    Bodies.rectangle(canvas.width + offset, canvas.height / 2, 50, canvas.height, {
      isStatic: true,
    }),
    Bodies.rectangle(-offset, canvas.height / 2, 50, canvas.height, {
      isStatic: true,
    }),
  ]);

  // примеры объектов (оставляю твои оригинальные)
  const stack = Composites.stack(100, 100, 6, 3, 0, 0, function (x, y) {
    return Bodies.circle(x, y, 30, {
      restitution: 0.9,
      render: {
        fillStyle: '#fff',
      },
    });
  });

  World.add(world, stack);

  // add mouse control
  const mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

  World.add(world, mouseConstraint);

  // keep the mouse in sync with rendering
  render.mouse = mouse;

  console.log('[matter] init done.');
});
