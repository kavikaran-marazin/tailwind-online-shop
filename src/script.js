const animationImage = document.getElementById("animationImage");
const hero = document.getElementById("home");

const totalFrames = 80;

const frames = [];

let currentFrame = 0;
let targetFrame = 0;

// ======================================
// PRELOAD ALL 80 FRAMES
// ======================================

for (let i = 1; i <= totalFrames; i++) {
  const img = new Image();

  img.src = `./images/animation/frame_${String(i).padStart(3, "0")}.png`;

  frames.push(img);
}

// ======================================
// GET SCROLL POSITION
// ======================================

function updateTargetFrame() {
  const rect = hero.getBoundingClientRect();

  const scrollDistance = hero.offsetHeight - window.innerHeight;

  let progress = -rect.top / scrollDistance;

  // Keep between 0 and 1
  progress = Math.max(0, Math.min(progress, 1));

  targetFrame = progress * (totalFrames - 1);
}

// ======================================
// SMOOTH FRAME INTERPOLATION
// ======================================

function animate() {
  // Lower value = smoother
  // Higher value = faster response

  currentFrame += (targetFrame - currentFrame) * 0.08;

  const frameIndex = Math.round(currentFrame);

  // Only change image when necessary
  if (
    frames[frameIndex] &&
    frames[frameIndex].complete &&
    animationImage.dataset.frame != frameIndex
  ) {
    animationImage.src = frames[frameIndex].src;

    animationImage.dataset.frame = frameIndex;
  }

  requestAnimationFrame(animate);
}

// ======================================
// SCROLL EVENT
// ======================================

window.addEventListener("scroll", updateTargetFrame, { passive: true });

// ======================================
// START
// ======================================

updateTargetFrame();
animate();

document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================
       REVIEW SLIDER
    ========================================== */

  const reviewTrack = document.getElementById("reviewTrack");
  const reviewViewport = document.getElementById("reviewViewport");
  const reviewSlides = document.querySelectorAll(".review-slide");

  const prevReview = document.getElementById("prevReview");
  const nextReview = document.getElementById("nextReview");
  const reviewDots = document.getElementById("reviewDots");

  // Stop if review section doesn't exist
  if (
    !reviewTrack ||
    !reviewViewport ||
    !prevReview ||
    !nextReview ||
    !reviewDots ||
    reviewSlides.length === 0
  ) {
    return;
  }

  /* ==========================================
       VARIABLES
    ========================================== */

  let currentIndex = 0;

  let cardsPerView = getCardsPerView();

  let totalSlides = reviewSlides.length;

  let maxIndex = Math.max(0, totalSlides - cardsPerView);

  /* ==========================================
       GET CARDS PER VIEW
    ========================================== */

  function getCardsPerView() {
    const width = window.innerWidth;

    if (width >= 1024) {
      return 3;
    }

    if (width >= 640) {
      return 2;
    }

    return 1;
  }

  /* ==========================================
       CREATE DOTS
    ========================================== */

  function createDots() {
    reviewDots.innerHTML = "";

    const numberOfDots = maxIndex + 1;

    for (let i = 0; i < numberOfDots; i++) {
      const dot = document.createElement("button");

      dot.type = "button";

      dot.setAttribute("aria-label", `Go to review ${i + 1}`);

      dot.className = `
                w-2.5 h-2.5
                rounded-full
                transition-all
                duration-300
                cursor-pointer
            `;

      dot.addEventListener("click", () => {
        currentIndex = i;

        updateSlider();
      });

      reviewDots.appendChild(dot);
    }

    updateDots();
  }

  /* ==========================================
       UPDATE DOTS
    ========================================== */

  function updateDots() {
    const dots = reviewDots.querySelectorAll("button");

    dots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.classList.remove("bg-gray-300", "w-2.5");

        dot.classList.add("bg-red-600", "w-6");
      } else {
        dot.classList.remove("bg-red-600", "w-6");

        dot.classList.add("bg-gray-300", "w-2.5");
      }
    });
  }

  /* ==========================================
       UPDATE BUTTONS
    ========================================== */

  function updateButtons() {
    // Previous button

    if (currentIndex <= 0) {
      prevReview.disabled = true;

      prevReview.classList.add("opacity-40", "cursor-not-allowed");

      prevReview.classList.remove("hover:bg-red-700");
    } else {
      prevReview.disabled = false;

      prevReview.classList.remove("opacity-40", "cursor-not-allowed");

      prevReview.classList.add("hover:bg-red-700");
    }

    // Next button

    if (currentIndex >= maxIndex) {
      nextReview.disabled = true;

      nextReview.classList.add("opacity-40", "cursor-not-allowed");

      nextReview.classList.remove("hover:bg-red-700");
    } else {
      nextReview.disabled = false;

      nextReview.classList.remove("opacity-40", "cursor-not-allowed");

      nextReview.classList.add("hover:bg-red-700");
    }
  }

  /* ==========================================
       UPDATE SLIDER
    ========================================== */

  function updateSlider() {

    cardsPerView = getCardsPerView();

    maxIndex = Math.max(
        0,
        totalSlides - cardsPerView
    );

    // Keep index within limits
    if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
    }

    if (currentIndex < 0) {
        currentIndex = 0;
    }

    /*
        Move by one CARD at a time.

        Desktop:
        3 cards visible
        1 card = 33.333%

        Tablet:
        2 cards visible
        1 card = 50%

        Mobile:
        1 card visible
        1 card = 100%
    */

    const cardWidth = 100 / cardsPerView;

    const translateX = currentIndex * cardWidth;

    reviewTrack.style.transform =
        `translateX(-${translateX}%)`;

    updateButtons();
    updateDots();
}

  /* ==========================================
       PREVIOUS BUTTON
    ========================================== */

  prevReview.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;

      updateSlider();
    }
  });

  /* ==========================================
       NEXT BUTTON
    ========================================== */

  nextReview.addEventListener("click", () => {
    if (currentIndex < maxIndex) {
      currentIndex++;

      updateSlider();
    }
  });

  /* ==========================================
       WINDOW RESIZE
    ========================================== */

  window.addEventListener("resize", () => {
    const oldCardsPerView = cardsPerView;

    cardsPerView = getCardsPerView();

    maxIndex = Math.max(0, totalSlides - cardsPerView);

    /*
            Rebuild dots if the number
            of visible cards changed.
        */

    if (oldCardsPerView !== cardsPerView) {
      currentIndex = 0;

      createDots();
    }

    updateSlider();
  });

  /* ==========================================
       TOUCH / SWIPE SUPPORT
    ========================================== */

  let touchStartX = 0;
  let touchEndX = 0;

  reviewViewport.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].screenX;
    },
    { passive: true },
  );

  reviewViewport.addEventListener(
    "touchend",
    (event) => {
      touchEndX = event.changedTouches[0].screenX;

      handleSwipe();
    },
    { passive: true },
  );

  function handleSwipe() {
    const swipeDistance = touchStartX - touchEndX;

    // Swipe left → next

    if (swipeDistance > 50) {
      if (currentIndex < maxIndex) {
        currentIndex++;

        updateSlider();
      }
    }

    // Swipe right → previous

    if (swipeDistance < -50) {
      if (currentIndex > 0) {
        currentIndex--;

        updateSlider();
      }
    }
  }

  /* ==========================================
       INITIALIZE
    ========================================== */

  createDots();

  updateSlider();
});
