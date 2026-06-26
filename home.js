// Hero Load
const initHeroAnimation = () => {
  const menu = document.querySelector('.menu');
  const logo = document.querySelector('.home-hero-logo');
  const content = document.querySelector('.home-hero-content');
  const spikeWrap = document.querySelector('.spike-wrap');
  const sparks = document.querySelectorAll('.spike-wrap-spark');
  const weather = document.querySelector('.weather-top-wrap');

  if (!logo) return;

  const logoRect = logo.getBoundingClientRect();
  const centerY = window.innerHeight / 2;
  const logoCenterY = logo.offsetTop + (logo.offsetHeight / 2);
  const initialYOffset = centerY - logoCenterY;

  let weatherIsReady = false;
  document.addEventListener('weatherReady', () => weatherIsReady = true);

  gsap.set(logo, { y: initialYOffset, scale: 1.4, opacity: 0 });
  if (spikeWrap) gsap.set(spikeWrap, { opacity: 0, y: 30 });
  if (sparks.length) gsap.set(sparks, { opacity: 0, scale: 0, transformOrigin: "50% 50%" });

  const heroTl = gsap.timeline();

  heroTl.to(logo, {
    opacity: 1,
    scale: 1,
    duration: 1.4,
    ease: "elastic.out(1.5, 0.5)",
    force3D: true
  });

  heroTl.to(logo, {
    y: 0,
    duration: 0.6,
    ease: "power3.inOut"
  });

  if (spikeWrap) {
    heroTl.to(spikeWrap, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.5)",
      onComplete: () => {
        gsap.to(spikeWrap, {
          y: "-0.5rem",
          duration: 3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1
        });
      }
    }, "-=0.25");
  }

  if (sparks.length) {
    heroTl.to(sparks, {
      opacity: 1,
      scale: 1,
      duration: 1,
      ease: "elastic.out(1, 0.5)",
      stagger: 0.15,
      force3D: true,
      onComplete: () => {
        sparks.forEach((spark, index) => {
          gsap.to(spark, {
            y: index % 2 === 0 ? "-0.5rem" : "0.5rem",
            duration: 2 + (index * 0.5),
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
          });
        });
      }
    }, "-=0.5");
  }

  if (weather) {
    heroTl.add(() => {
      if (weatherIsReady) {
        window.animateWeatherIn();
      } else {
        document.addEventListener('weatherReady', () => {
          window.animateWeatherIn();
        }, { once: true });
      }
    }, "-=1");
  }

  heroTl.add(() => {
    window.navAllowedOnHome = true;
    const footer = document.querySelector('.footer');
    const footerVisible = footer && footer.getBoundingClientRect().top < window.innerHeight;
    if (!footerVisible && menu) {
      window.executeBounce(menu, 0.5);
    }
  }, "-=0.5");
};

// Hero Bubble Animation
const initBubbleAnimations = () => {
  const container = document.querySelector('.hero-bottom-bubbles');
  if (!container) return;
  const bubbles = container.querySelectorAll('.hero-bottom-bubble');
  if (!bubbles.length) return;

  gsap.set(bubbles, { opacity: 0, scaleY: 0.2, yPercent: 20, transformOrigin: "50% 100%" });

  gsap.timeline().to(bubbles, {
    opacity: 1,
    scaleY: 1,
    yPercent: 0,
    duration: 0.8,
    ease: "back.out(1.7)",
    stagger: { each: 0.08, from: "center" },
    onComplete: () => {
      gsap.to(bubbles, {
        scaleY: 0.2,
        yPercent: 20,
        ease: "power1.inOut",
        stagger: { each: 0.05, from: "center" },
        scrollTrigger: {
          trigger: container,
          start: "top 75%",
          end: "top top",
          scrub: true,
          invalidateOnRefresh: true
        }
      });
    }
  });
};

// Stickers Load
const initStickerLoadAnimations = () => {
  const stickers = document.querySelectorAll('[data-animation="bounce-in"]');
  
  stickers.forEach(sticker => {
    gsap.set(sticker, { opacity: 0, scale: 0.5, rotation: 0.001 });

    ScrollTrigger.create({
      trigger: sticker,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(sticker, {
          opacity: 1,
          scale: 1,
          rotation: 0.001,
          duration: 0.8,
          ease: "elastic.out(1, 0.3)"
        });
      }
    });
  });
};

// Stickers Trail
const initStickerTrail = () => {
  const section = document.querySelector('.s-home-stickers');
  if (!section || window.matchMedia('(pointer: coarse)').matches) return;

  const images = section.querySelectorAll('.sticker-trail-img');
  if (!images.length) return;

  let currentIndex = 0;
  let lastX = 0;
  let lastY = 0;
  let zIndex = 1;

  const thresholds = [40, 70, 110, 160, 220];
  let currentThreshold = thresholds[0];

  section.addEventListener('mousemove', (e) => {
    const rect = section.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const buffer = 70;
    if (y < buffer || y > rect.height - buffer || x < buffer || x > rect.width - buffer) {
      lastX = 0;
      lastY = 0;
      return;
    }

    if (lastX === 0 && lastY === 0) {
      lastX = x;
      lastY = y;
      return;
    }

    const distance = Math.hypot(x - lastX, y - lastY);

    if (distance > currentThreshold) {
      const img = images[currentIndex];
      zIndex++;

      gsap.killTweensOf(img);

      gsap.timeline()
        .fromTo(img, 
          {
            opacity: 1,
            zIndex: zIndex,
            x: x,
            y: y,
            scale: 1.4,
            rotation: gsap.utils.random(-20, 20)
          },
          {
            scale: 1,
            duration: 0.25,
            ease: 'power2.out'
          }
        )
        .to(img, {
          opacity: 0,
          scale: 0.8,
          duration: 0.35,
          ease: 'power1.in'
        }, '+=0.15');

      currentIndex = (currentIndex + 1) % images.length;
      currentThreshold = gsap.utils.random(thresholds);
      lastX = x;
      lastY = y;
    }
  });

  section.addEventListener('mouseleave', () => {
    lastX = 0;
    lastY = 0;
  });
};


// Projects Scroll
const initProjectScroll = () => {
  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  gsap.matchMedia().add('(min-width: 300px)', () => {
    document.querySelectorAll('.home-project').forEach(section => {
      const images = section.querySelector('.home-project-images-list');
      if (!images) return;
      gsap.to(images, {
        x: () => -(images.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => `+=${images.scrollWidth - window.innerWidth}`,
          invalidateOnRefresh: true,
          refreshPriority: 1
        }
      });
    });
  });
};

// Dark BG Project
const initProjectStyles = () => {
  document.querySelectorAll('.home-project').forEach(proyecto => {
    if (!proyecto.querySelector(':scope > .has-dark-bg')) return;
    proyecto.style.color = '#fff';
    proyecto.querySelectorAll('.button').forEach(el => {
      el.style.color = '#362b22';
      el.style.backgroundColor = '#fff';
    });
    proyecto.querySelectorAll('.tag').forEach(el => {
      el.style.borderColor = 'rgba(185, 185, 185, 0.4)';
    });
  });
};

// Price Cards
const initHomePricesAnimation = () => {
  const pinContainer = document.querySelector('.pin');
  const cardsContainer = document.querySelector('.home-prices-cards');
  const pinkCard = document.querySelector('.home-price-card.pink-card');
  const greenCard = document.querySelector('.home-price-card.green-card');
  const titleWrap = document.querySelector('.home-prices-section-header');

  if (!pinContainer || !cardsContainer || !pinkCard || !greenCard || !titleWrap) return;

  const mm = gsap.matchMedia();

  mm.add("(min-width: 768px)", () => {
    const vh = window.innerHeight;
    const greenH = greenCard.offsetHeight;
    const pinkH = pinkCard.offsetHeight;

    const greenExitY = -(vh / 2 + greenH / 2);
    const pinkExitY = -(vh / 2 + pinkH / 2);

    gsap.set([greenCard, pinkCard], {
      y: "100vh",
      rotation: 0
    });
    gsap.set(titleWrap, { y: "0vh" });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pinContainer,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        pin: pinContainer,
        invalidateOnRefresh: true
      }
    });

    tl.to(greenCard, {
      y: 0,
      rotation: 6,
      duration: 1.2,
      ease: "power1.out"
    }, 0);

    tl.to(pinkCard, {
      y: 0,
      rotation: -6,
      duration: 1.2,
      ease: "power1.out"
    }, 0.4);

    tl.to(greenCard, {
      y: "5vh",
      duration: 0.5,
      ease: "power1.inOut"
    }, 1.0);

    tl.to(pinkCard, {
      y: "5vh",
      duration: 0.5,
      ease: "power1.inOut"
    }, 1.5);

    tl.to(greenCard, {
      y: greenExitY,
      rotation: 0,
      duration: 2.2,
      ease: "power2.in"
    }, 1.5);

    tl.to(titleWrap, {
      y: "-100vh",
      duration: 1.9,
      ease: "power2.in"
    }, 2.2);

    tl.to(pinkCard, {
      y: pinkExitY,
      rotation: 0,
      duration: 1.9,
      ease: "power2.in"
    }, 2.2);

    return () => {
      gsap.set([greenCard, pinkCard], {
        y: 0,
        rotation: 0
      });
      gsap.set(titleWrap, { y: "0vh" });
    };
  });
};

const runHomeScripts = () => {
  initHeroAnimation();
  initBubbleAnimations();
  initStickerLoadAnimations();
  initStickerTrail();
  initProjectScroll();
  initProjectStyles();
  initHomePricesAnimation();
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
};

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", runHomeScripts);
} else {
  runHomeScripts();
}