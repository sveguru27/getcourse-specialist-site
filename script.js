const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.site-nav');
const header = document.querySelector('[data-header]');

menuButton?.addEventListener('click', () => {
  const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(willOpen));
  navigation?.classList.toggle('is-open', willOpen);
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -35px' });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const updateHeader = () => header?.classList.toggle('is-stuck', window.scrollY > 140);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

document.querySelectorAll('[data-slider]').forEach((slider) => {
  const slides = [...slider.querySelectorAll('.slider-slide')];
  const dotsContainer = slider.querySelector('.slider-dots');
  const caption = slider.querySelector('[data-slider-caption]');
  const current = slider.querySelector('[data-slider-current]');
  const total = slider.querySelector('[data-slider-total]');
  const viewport = slider.querySelector('.slider-viewport');
  let activeIndex = 0;
  let touchStartX = 0;

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.dataset.sliderDot = String(index);
    dot.setAttribute('aria-label', `Показать экран ${index + 1}`);
    dotsContainer?.append(dot);
  });
  const dots = [...slider.querySelectorAll('[data-slider-dot]')];
  if (total) total.textContent = String(slides.length).padStart(2, '0');

  const showSlide = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
      slide.querySelector('button')?.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle('is-active', isActive);
      if (isActive) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    if (caption) caption.textContent = slides[activeIndex].dataset.caption;
    if (current) current.textContent = String(activeIndex + 1).padStart(2, '0');
  };

  slider.querySelector('[data-slider-prev]')?.addEventListener('click', () => showSlide(activeIndex - 1));
  slider.querySelector('[data-slider-next]')?.addEventListener('click', () => showSlide(activeIndex + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));

  viewport.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showSlide(activeIndex - 1);
    if (event.key === 'ArrowRight') showSlide(activeIndex + 1);
  });
  viewport.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  viewport.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) < 45) return;
    showSlide(activeIndex + (distance < 0 ? 1 : -1));
  }, { passive: true });

  showSlide(0);
});

const imageDialog = document.querySelector('[data-image-dialog]');
const imageDialogImage = imageDialog?.querySelector('[data-image-dialog-img]');
const imageDialogCaption = imageDialog?.querySelector('[data-image-dialog-caption]');

document.querySelectorAll('.slider-zoom').forEach((button) => {
  button.addEventListener('click', () => {
    const image = button.querySelector('img');
    const slide = button.closest('.slider-slide');
    if (!imageDialog || !imageDialogImage || !image || typeof imageDialog.showModal !== 'function') return;
    imageDialogImage.src = image.currentSrc || image.src;
    imageDialogImage.alt = image.alt;
    if (imageDialogCaption) imageDialogCaption.textContent = slide?.dataset.caption || '';
    imageDialog.showModal();
  });
});

imageDialog?.querySelector('[data-image-dialog-close]')?.addEventListener('click', () => imageDialog.close());
imageDialog?.addEventListener('click', (event) => {
  if (event.target === imageDialog) imageDialog.close();
});
