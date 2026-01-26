<template>
  <div v-if="slides && slides.length > 0" class="slider-wrapper">
    <Swiper
      :modules="modules"
      :slides-per-view="1"
      :loop="slides.length > 1"
      :autoplay="autoplay ? { delay: 5000, disableOnInteraction: false } : false"
      :navigation="true"
      :pagination="showIndicators ? { clickable: true } : false"
      class="header-swiper"
    >
      <SwiperSlide v-for="(slide, index) in slides" :key="index" class="slide">
        <div class="slide-content">
          <p class="slide-description">{{ slide.description }}</p>
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
  <div v-else class="no-slides">
    No slides configured
  </div>
</template>

<script setup>
  import { Swiper, SwiperSlide } from 'swiper/vue';
  import { Navigation, Autoplay, Pagination } from 'swiper/modules';
  import 'swiper/css';
  import 'swiper/css/navigation';
  import 'swiper/css/pagination';

  const props = defineProps({
    slides: {
      type: Array,
      default: () => [],
    },
    autoplay: {
      type: Boolean,
      default: true,
    },
    showIndicators: {
      type: Boolean,
      default: false,
    },
  });

  const modules = [Navigation, Autoplay, Pagination];
</script>

<style scoped>
.slider-wrapper {
  position: relative;
  width: 100%;
  background: #F6F6F7;
}

.header-swiper {
  width: 100%;
}

.slide {
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.slide-description {
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
}

/* Swiper Navigation Buttons */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  width: 20px;
  height: 20px;
  color: #333;
  background: transparent;
  border-radius: 50%;
  transition: all 0.3s ease;
  top: 0;
  bottom: 0;
  margin: auto 0;
}

:deep(.swiper-button-next::after),
:deep(.swiper-button-prev::after) {
  font-size: 16px;
}

:deep(.swiper-button-next:hover),
:deep(.swiper-button-prev:hover) {}

:deep(.swiper-button-prev) {
  left: 0.5rem;
}

:deep(.swiper-button-next) {
  right: 0.5rem;
}

/* Swiper Pagination */
:deep(.swiper-pagination) {
  bottom: 0.5rem;
}

:deep(.swiper-pagination-bullet) {
  width: 6px;
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
}

:deep(.swiper-pagination-bullet:hover) {
  background: rgba(0, 0, 0, 0.6);
  transform: scale(1.3);
}

:deep(.swiper-pagination-bullet-active) {
  background: #000;
  border-color: #000;
  width: 20px;
  border-radius: 3px;
}

.no-slides {
  padding: 0.5rem 1rem;
  text-align: center;
  color: #999;
  font-style: italic;
  background: #f5f5f5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .slide {
    padding: 0.625rem 0.75rem;
    min-height: 50px;
  }

  .slide-description {
    font-size: 0.8125rem;
  }

  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    width: 24px;
    height: 24px;
  }

  :deep(.swiper-button-next::after),
  :deep(.swiper-button-prev::after) {
    font-size: 14px;
  }

  :deep(.swiper-button-prev) {
    left: 0.25rem;
  }

  :deep(.swiper-button-next) {
    right: 0.25rem;
  }

  :deep(.swiper-pagination) {
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
  }

  .slide-description {
    font-size: 0.75rem;
  }

  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    width: 20px;
    height: 20px;
  }

  :deep(.swiper-button-next::after),
  :deep(.swiper-button-prev::after) {
    font-size: 12px;
  }
}
</style>
