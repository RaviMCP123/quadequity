import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

export default function HeroSwiper({ children }) {
  return (
    <div className="banner-slider">
      <Swiper
        className="hero-slider"
        modules={[EffectFade, Autoplay]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        speed={1000}
      >
        <SwiperSlide>{children}</SwiperSlide>
      </Swiper>
    </div>
  );
}
