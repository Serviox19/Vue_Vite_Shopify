<template>
  <div class="slider-wrapper" v-if="slides && slides.length > 0">
    <div
      class="slider-track"
      :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div
        v-for="(slide, index) in slides"
        :key="index"
        class="slide"
      >
        <div class="slide-content">
          <h2 class="slide-title">{{ slide.title }}</h2>
          <p class="slide-description">{{ slide.description }}</p>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <button
      class="slider-nav slider-nav-prev"
      @click="prevSlide"
      :disabled="currentSlide === 0"
      aria-label="Previous slide"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>
    <button
      class="slider-nav slider-nav-next"
      @click="nextSlide"
      :disabled="currentSlide === slides.length - 1"
      aria-label="Next slide"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>

    <!-- Slide Indicators -->
    <div v-if="showIndicators" class="slider-indicators">
      <button
        v-for="(slide, index) in slides"
        :key="index"
        :class="['indicator', { active: index === currentSlide }]"
        @click="goToSlide(index)"
        :aria-label="`Go to slide ${index + 1}`"
      ></button>
    </div>
  </div>
  <div v-else class="no-slides">
    No slides configured
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';

  const props = defineProps({
    slides: {
      type: Array,
      default: () => [],
    },
    autoplay: {
      type: Boolean,
      default: true,
    },
    autoplayInterval: {
      type: Number,
      default: 5000,
    },
    showIndicators: {
      type: Boolean,
      default: true,
    },
  });

  const currentSlide = ref(0);
  let autoplayTimer = null;
  let touchStartX = 0;
  let touchEndX = 0;

  const nextSlide = () => {
    if (currentSlide.value < props.slides.length - 1) {
      currentSlide.value++;
    } else {
      currentSlide.value = 0; // Loop back to start
    }
    resetAutoplay();
  };

  const prevSlide = () => {
    if (currentSlide.value > 0) {
      currentSlide.value--;
    } else {
      currentSlide.value = props.slides.length - 1; // Loop to end
    }
    resetAutoplay();
  };

  const goToSlide = (index) => {
    if (index >= 0 && index < props.slides.length) {
      currentSlide.value = index;
      resetAutoplay();
    }
  };

  const startAutoplay = () => {
    if (props.autoplay && props.slides.length > 1) {
      autoplayTimer = setInterval(() => {
        nextSlide();
      }, props.autoplayInterval);
    }
  };

  const stopAutoplay = () => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  const resetAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
    stopAutoplay();
  };

  const handleTouchMove = (e) => {
    touchEndX = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;

    const diff = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swipe left - next slide
        nextSlide();
      } else {
        // Swipe right - previous slide
        prevSlide();
      }
    }

    touchStartX = 0;
    touchEndX = 0;
    startAutoplay();
  };

  const handleKeydown = (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  onMounted(() => {
    startAutoplay();
    window.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    stopAutoplay();
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

<style scoped>
.header-slider {
  width: 100%;
  position: relative;
  margin: 0;
  padding: 0;
}

.slider-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 0;
  box-shadow: none;
}

.slider-track {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.slide {
  min-width: 100%;
  width: 100%;
  flex-shrink: 0;
  position: relative;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 60px;
}

.slide-content {
  max-width: 100%;
  color: var(--color-black);
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.slide-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
}

.slide-description {
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
}

/* Navigation Buttons */
.slider-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 50%;
  z-index: 10;
  color: #333;
  padding: 0;
}

.slider-nav svg {
  width: 16px;
  height: 16px;
}

.slider-nav:hover:not(:disabled) {
  background: white;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.slider-nav:active:not(:disabled) {
  transform: translateY(-50%) scale(0.95);
}

.slider-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.slider-nav-prev {
  left: 0.5rem;
}

.slider-nav-next {
  right: 0.5rem;
}

/* Slide Indicators */
.slider-indicators {
  position: absolute;
  bottom: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.375rem;
  z-index: 10;
}

.indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  margin: 0;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: scale(1.3);
}

.indicator.active {
  background: white;
  border-color: white;
  width: 20px;
  border-radius: 3px;
}

/* No Slides Message */
.no-slides {
  padding: 3rem;
  text-align: center;
  color: #999;
  font-style: italic;
  background: #f5f5f5;
  border-radius: 8px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .slide {
    padding: 0.625rem 0.75rem;
    min-height: 50px;
  }

  .slide-content {
    gap: 0.75rem;
  }

  .slide-title {
    font-size: 0.8125rem;
  }

  .slide-description {
    font-size: 0.8125rem;
  }

  .slider-nav {
    width: 24px;
    height: 24px;
  }

  .slider-nav svg {
    width: 20px;
    height: 20px;
  }

  .slider-nav-prev {
    left: 0.25rem;
  }

  .slider-nav-next {
    right: 0.25rem;
  }

  .slider-indicators {
    bottom: 0.375rem;
  }
}

@media (max-width: 480px) {
  .slide {
    padding: 0.5rem 0.625rem;
    min-height: 45px;
  }

  .slide-content {
    gap: 0.5rem;
    flex-direction: column;
  }

  .slide-title {
    font-size: 0.75rem;
  }

  .slide-description {
    font-size: 0.75rem;
  }

  .slider-nav {
    width: 20px;
    height: 20px;
  }

  .slider-nav svg {
    width: 16px;
    height: 16px;
  }
}
</style>
