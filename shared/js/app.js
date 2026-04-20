var w = window;

document.addEventListener('DOMContentLoaded', function () {

  const slideName = document.body.dataset.slide;

  startTracking(slideName);
  
  // Автоматическое создание нижнего меню
  const hub = document.getElementById('hub');
  if (hub) {
    hub.innerHTML = `<img class="i-trigger" data-slide="../start/index.html" src="../../shared/img/home.png" alt="home" width="50">`;
  }

  // Триггер для перехода между слайдами и добавления/снятия класса с элемента
  const triggers = document.querySelectorAll('.i-trigger');

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();

      // Переход к слайду
      const slideUrl = this.dataset.slide;
      if (slideUrl) {
        endTracking(slideUrl);
        window.location.href = slideUrl;
      }

      // Добавление/снятие класса с элемента
      const targetSelector = this.dataset.target;
      if (!targetSelector) return;

      const targetElement = document.querySelector(targetSelector);
      if (!targetElement) {
        console.log(`"Элемент ${targetSelector} не найден"`);
        return;
      }

      const toggleClass = this.dataset.toggle;
      const addClass = this.dataset.class;

      if (toggleClass) {
        targetElement.classList.toggle(toggleClass);
      } else if (addClass) {
        targetElement.classList.add(addClass);
      } else {
        targetElement.classList.toggle('active');
      }
    });
  });

  // Автоматическое изменение размера слайда под размер экрана устройства
  function resizeViewport() {
    var slide = document.querySelector('.slide-frame');
    var r_width = w.innerWidth;
    var r_height = w.innerHeight;
    var s_width = slide.clientWidth;
    var s_height = slide.clientHeight;
    var x_scale = r_width / s_width;
    var y_scale = r_height / s_height;
    var c_scale = Math.min(x_scale, y_scale);

    document.querySelector('.viewport').style.transform = 'scale(' + c_scale + ')';
  }

  w.addEventListener('load', () => resizeViewport());
  w.addEventListener('resize', () => resizeViewport());
});
