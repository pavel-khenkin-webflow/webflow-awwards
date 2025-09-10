// index.js — версия для прода

// Подключаем Matter.js
const {
  Engine,
  Render,
  Runner,
  World,
  Bodies,
  Body,
  Events
} = Matter;

// Получаем wrapper и элементы кнопок
const wrapper = document.getElementById('error-canvas_wrapper');
const elements = document.querySelectorAll('.canvas-btn_white');

if (wrapper && elements.length > 0) {
  const engine = Engine.create();
  const world = engine.world;

  // Создаём канвас поверх wrapper
  const render = Render.create({
    element: wrapper,
    engine: engine,
    options: {
      width: wrapper.offsetWidth,
      height: wrapper.offsetHeight,
      wireframes: false,
      background: 'transparent'
    }
  });

  Render.run(render);
  const runner = Runner.create();
  Runner.run(runner, engine);

  // Добавляем стены, чтобы блоки не выпадали
  const walls = [
    Bodies.rectangle(wrapper.offsetWidth / 2, wrapper.offsetHeight + 25, wrapper.offsetWidth, 50, { isStatic: true }),
    Bodies.rectangle(-25, wrapper.offsetHeight / 2, 50, wrapper.offsetHeight, { isStatic: true }),
    Bodies.rectangle(wrapper.offsetWidth + 25, wrapper.offsetHeight / 2, 50, wrapper.offsetHeight, { isStatic: true })
  ];
  World.add(world, walls);

  // Переносим .canvas-btn_white в Matter.js как падающие блоки
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    const w = rect.width || 150;
    const h = rect.height || 50;

    // Создаём физическое тело
    const body = Bodies.rectangle(
      Math.random() * wrapper.offsetWidth, // случайная X позиция
      -100, // начинаем сверху
      w,
      h,
      {
        restitution: 0.5, // упругость
        render: {
          fillStyle: '#fff'
        }
      }
    );

    // Прикрепляем DOM к body (опционально для синхронизации)
    el.style.position = 'absolute';
    el.style.left = '0px';
    el.style.top = '0px';

    Body.setVelocity(body, { x: (Math.random() - 0.5) * 5, y: 0 });
    World.add(world, body);

    // Синхронизируем DOM-элемент с Matter.js телом
    Events.on(engine, 'afterUpdate', () => {
      el.style.transform = `translate(${body.position.x - w / 2}px, ${body.position.y - h / 2}px) rotate(${body.angle}rad)`;
    });
  });

  // Автоматический ресайз
  window.addEventListener('resize', () => {
    Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: wrapper.offsetWidth, y: wrapper.offsetHeight }
    });
  });
}
