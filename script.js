const SLIDES = [
  { title: 'Santorini, Greece', text: 'Whitewashed houses above a deep blue sea.', emoji: '🏖️', colors: ['#2a9df4', '#1b4965'] },
  { title: 'Kyoto, Japan', text: 'Temples, gardens and quiet cherry blossoms.', emoji: '🏯', colors: ['#e056fd', '#8e2de2'] },
  { title: 'Banff, Canada', text: 'Turquoise lakes ringed by snowy peaks.', emoji: '🏔️', colors: ['#11998e', '#38ef7d'] },
  { title: 'Sahara, Morocco', text: 'Golden dunes under an endless sky.', emoji: '🐪', colors: ['#f7971e', '#ffd200'] },
  { title: 'Reykjavik, Iceland', text: 'Northern lights over volcanic plains.', emoji: '🌌', colors: ['#3a1c71', '#00c9ff'] },
  { title: 'Bali, Indonesia', text: 'Rice terraces and warm tropical rain.', emoji: '🌴', colors: ['#f857a6', '#ff5858'] },
];

const AUTOPLAY_MS = 4200;

const track = document.getElementById('track');
const dots = document.getElementById('dots');
const thumbs = document.getElementById('thumbs');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const playBtn = document.getElementById('playBtn');
const fullBtn = document.getElementById('fullBtn');
const captionTitle = document.getElementById('captionTitle');
const captionText = document.getElementById('captionText');
const counter = document.getElementById('counter');
const progressFill = document.getElementById('progressFill');
const carousel = document.getElementById('carousel');
const viewport = document.getElementById('viewport');

let index = 0;
let playing = false;
let autoplayId = null;
let progressId = null;
let progressStart = 0;

function build() {
  SLIDES.forEach((slide, i) => {
    const el = document.createElement('div');
    el.className = 'slide';
    el.style.background = `linear-gradient(140deg, ${slide.colors[0]}, ${slide.colors[1]})`;
    el.innerHTML = `<span class="slide-emoji">${slide.emoji}</span>`;
    track.appendChild(el);

    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dots.appendChild(dot);

    const thumb = document.createElement('button');
    thumb.className = 'thumb';
    thumb.style.background = `linear-gradient(140deg, ${slide.colors[0]}, ${slide.colors[1]})`;
    thumb.textContent = slide.emoji;
    thumb.addEventListener('click', () => goTo(i));
    thumbs.appendChild(thumb);
  });
}

function render() {
  track.style.transform = `translateX(-${index * 100}%)`;

  const slide = SLIDES[index];
  captionTitle.textContent = slide.title;
  captionText.textContent = slide.text;
  counter.textContent = `${index + 1} / ${SLIDES.length}`;

  dots.querySelectorAll('.dot').forEach((dot, i) => dot.classList.toggle('active', i === index));
  thumbs.querySelectorAll('.thumb').forEach((thumb, i) => thumb.classList.toggle('active', i === index));
}

function goTo(i) {
  index = (i + SLIDES.length) % SLIDES.length;
  render();
  if (playing) restartProgress();
}

function next() {
  goTo(index + 1);
}

function prev() {
  goTo(index - 1);
}

function startAutoplay() {
  playing = true;
  playBtn.textContent = '⏸ Pause';
  playBtn.classList.add('on');
  restartProgress();
}

function stopAutoplay() {
  playing = false;
  playBtn.textContent = '▶ Play';
  playBtn.classList.remove('on');
  clearInterval(autoplayId);
  cancelAnimationFrame(progressId);
  progressFill.style.width = '0%';
}

function restartProgress() {
  clearInterval(autoplayId);
  cancelAnimationFrame(progressId);

  autoplayId = setInterval(() => {
    index = (index + 1) % SLIDES.length;
    render();
    progressStart = performance.now();
  }, AUTOPLAY_MS);

  progressStart = performance.now();
  const animate = (now) => {
    const elapsed = (now - progressStart) % AUTOPLAY_MS;
    progressFill.style.width = `${(elapsed / AUTOPLAY_MS) * 100}%`;
    progressId = requestAnimationFrame(animate);
  };
  progressId = requestAnimationFrame(animate);
}

prevBtn.addEventListener('click', () => {
  prev();
  if (playing) restartProgress();
});

nextBtn.addEventListener('click', () => {
  next();
  if (playing) restartProgress();
});

playBtn.addEventListener('click', () => {
  playing ? stopAutoplay() : startAutoplay();
});

fullBtn.addEventListener('click', () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    carousel.requestFullscreen();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') {
    next();
    if (playing) restartProgress();
  }
  if (e.key === 'ArrowLeft') {
    prev();
    if (playing) restartProgress();
  }
  if (e.key === ' ') {
    e.preventDefault();
    playing ? stopAutoplay() : startAutoplay();
  }
});

let touchStartX = 0;
let dragging = false;

viewport.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });

viewport.addEventListener('touchend', (e) => {
  const delta = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) > 45) {
    delta < 0 ? next() : prev();
    if (playing) restartProgress();
  }
});

viewport.addEventListener('mousedown', (e) => {
  dragging = true;
  touchStartX = e.clientX;
});

window.addEventListener('mouseup', (e) => {
  if (!dragging) return;
  dragging = false;
  const delta = e.clientX - touchStartX;
  if (Math.abs(delta) > 60) {
    delta < 0 ? next() : prev();
    if (playing) restartProgress();
  }
});

carousel.addEventListener('mouseenter', () => {
  if (playing) {
    clearInterval(autoplayId);
    cancelAnimationFrame(progressId);
  }
});

carousel.addEventListener('mouseleave', () => {
  if (playing) restartProgress();
});

build();
render();
