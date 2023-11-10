let currentSlide = 0;

function showSlide(index) {
  const slides = document.querySelector(".carousel-track");
  const totalSlides = slides.children.length;

  if (index >= totalSlides) {
    currentSlide = 0;
  } else if (index < 0) {
    currentSlide = totalSlides - 1;
  } else {
    currentSlide = index;
  }

  const translateValue = -currentSlide * 25; /* 25% é a largura de cada slide */
  slides.style.transform = `translateX(${translateValue}%)`;
}

function prevSlide() {
  showSlide(currentSlide - 1);
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

setInterval(() => {
  nextSlide();
}, 3500);
