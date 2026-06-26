window.addEventListener("DOMContentLoaded", () => {

// Global Bounce Load
window.executeBounce = (element, duration = 1) => {
  if (!element) return;
  gsap.set(element, { opacity: 0, scale: 0.5 });
  return gsap.to(element, {
    opacity: 1,
    scale: 1,
    duration: duration,
    ease: "elastic.out(1.5, 0.4)",
    force3D: true
  });
};

const initGlobalAnimations = () => {
  document.querySelectorAll('[data-animation="bounce-in"][data-trigger="load"]').forEach(el => {
    window.executeBounce(el);
  });

  document.querySelectorAll('[data-animation="bounce-in"]:not([data-trigger="load"]):not([data-trigger="manual"])').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        window.executeBounce(el);
      }
    });
  });
};

window.addEventListener('load', () => {
  ScrollTrigger.refresh();
  initGlobalAnimations();
});

// Weather Widget
const initWeatherWidget = () => {
  const ICONS = {
    sunny:  'https://cdn.prod.website-files.com/6a327748f2e1175631dd266e/6a3548133d66ff59e85a5921_sunny.svg',
    cloudy: 'https://cdn.prod.website-files.com/6a327748f2e1175631dd266e/6a35489818009a022689e360_cloudy.svg',
    rain:   'https://cdn.prod.website-files.com/6a327748f2e1175631dd266e/6a3548972f4d948a4fcde92f_rain.svg',
    night:  'https://cdn.prod.website-files.com/6a327748f2e1175631dd266e/6a354897857eaf9234f003c8_clear-night.svg'
  };

  const getState = (code, isDay) => {
    if (!isDay) return 'night';
    if (code <= 1) return 'sunny';
    if (code <= 3 || (code >= 45 && code <= 48)) return 'cloudy';
    if (code >= 51 && code <= 82) return 'rain';
    return 'cloudy';
  };

  const ANIM = {
    yDist: 100,
    outY: 1,
    outO: 0.25,
    outStagger: 0.015,
    outEaseY: 'power1.in',
    outEaseO: 'power1.in',
    inY: 1.5,
    inO: 1.5,
    inStagger: 0.015,
    inEaseY: 'power3.out',
    inEaseO: 'power2.out'
  };

  let state = null;
  let currentTemp = null;
  
  const widgetWrap = document.querySelector('.weather-top-wrap');
  const icon = document.querySelector('.weather-icon');
  const tempEl = document.querySelector('.weather-temp');
  const getSentence = s => document.querySelector(`.weather-sentence[data-state="${s}"]`);

  async function fetchWeather() {
    const { current_weather: { temperature, weathercode, is_day } } =
      await fetch('https://api.open-meteo.com/v1/forecast?latitude=39.57&longitude=2.65&current_weather=true')
        .then(r => r.json());
    return { state: getState(weathercode, is_day), temp: Math.round(temperature) };
  }

  function setup(newState, newTemp) {
    document.querySelectorAll('.weather-sentence').forEach(el => {
      el.style.display = el.dataset.state === newState ? 'block' : 'none';
    });
    tempEl.textContent = `${newTemp}° en Mallorca`;
    icon.src = ICONS[newState];
    state = newState;
    currentTemp = newTemp;
  }

  const playIn = (targets) => {
    return gsap.timeline()
      .to(targets, { y: 0, duration: ANIM.inY, stagger: ANIM.inStagger, ease: ANIM.inEaseY }, 0)
      .to(targets, { opacity: 1, duration: ANIM.inO, stagger: ANIM.inStagger, ease: ANIM.inEaseO }, 0);
  };

  const playOut = (targets) => {
    return gsap.timeline()
      .to(targets, { y: -ANIM.yDist, duration: ANIM.outY, stagger: ANIM.outStagger, ease: ANIM.outEaseY }, 0)
      .to(targets, { opacity: 0, duration: ANIM.outO, stagger: ANIM.outStagger, ease: ANIM.outEaseO }, 0);
  };

  window.animateWeatherIn = function() {
    if (!icon || !tempEl || !widgetWrap) return;
    const sentence = getSentence(state);
    if (!sentence) return;

    const splitIn = new SplitText(sentence, { type: 'chars' });
    const splitTempIn = new SplitText(tempEl, { type: 'chars' });

    gsap.set([icon, splitIn.chars, splitTempIn.chars], { y: ANIM.yDist, opacity: 0 });
    gsap.set(widgetWrap, { opacity: 1 });

    return playIn([icon, splitIn.chars, splitTempIn.chars]);
  };

  window.transitionWeatherTo = function(newState, newTemp) {
    if (!icon || !tempEl) return;
    
    if (newState === state) {
      if (newTemp !== currentTemp) {
        currentTemp = newTemp;
        const splitTempOut = new SplitText(tempEl, { type: 'chars' });
        
        playOut(splitTempOut.chars).eventCallback('onComplete', () => {
          splitTempOut.revert();
          tempEl.textContent = `${newTemp}° en Mallorca`;
          const splitTempIn = new SplitText(tempEl, { type: 'chars' });
          gsap.set(splitTempIn.chars, { y: ANIM.yDist, opacity: 0 });
          playIn(splitTempIn.chars);
        });
      }
      return;
    }

    const prevEl = getSentence(state);
    if (!prevEl) return;
    
    const splitOut = new SplitText(prevEl, { type: 'chars' });
    const splitTempOut = new SplitText(tempEl, { type: 'chars' });
    
    state = newState;
    currentTemp = newTemp;

    playOut([icon, splitOut.chars, splitTempOut.chars]).eventCallback('onComplete', () => {
      splitOut.revert();
      splitTempOut.revert();
      
      prevEl.style.display = 'none';
      tempEl.textContent = `${newTemp}° en Mallorca`;
      icon.src = ICONS[newState];

      const nextEl = getSentence(newState);
      if (!nextEl) return;
      
      nextEl.style.display = 'block';
      const splitIn = new SplitText(nextEl, { type: 'chars' });
      const splitTempIn = new SplitText(tempEl, { type: 'chars' });
      
      gsap.set([icon, splitIn.chars, splitTempIn.chars], { y: ANIM.yDist, opacity: 0 });
      playIn([icon, splitIn.chars, splitTempIn.chars]);
    });
  };

  if (icon && tempEl) {
    (async () => {
      try {
        const data = await fetchWeather();
        setup(data.state, data.temp);
        document.dispatchEvent(new CustomEvent('weatherReady'));

        const isHome = window.location.pathname === '/' || window.location.pathname === '/index.html';
        if (!isHome) {
          window.animateWeatherIn();
        }

        setInterval(async () => {
          try {
            const d = await fetchWeather();
            window.transitionWeatherTo(d.state, d.temp);
          } catch(e) {}
        }, 10 * 60 * 1000);
      } catch(e) {}
    })();
  }
};

initWeatherWidget();

// Weather API Test
document.addEventListener('weatherReady', () => {
  const mockStates = [
    { state: 'sunny', temp: 26 },
    { state: 'cloudy', temp: 21 },
    { state: 'rain', temp: 17 },
    { state: 'night', temp: 15 }
  ];
  
  let index = 0;
  
  setInterval(() => {
    const nextData = mockStates[index % mockStates.length];
    if (typeof window.transitionWeatherTo === 'function') {
      window.transitionWeatherTo(nextData.state, nextData.temp);
    }
    index++;
  }, 5000);
});

// Text Reveal data-animation="words"
const initWordAnimations = () => {
  document.querySelectorAll('[data-animation="words"]').forEach(el => {
    gsap.set(el, { visibility: 'visible' });

    const split = new SplitText(el, { type: 'words', tag: 'div', wordsClass: 'single-word-inner' });

    split.words.forEach(word => {
      const mask = document.createElement('span');
      mask.className = 'single-word';
      gsap.set(mask, { 
        position: 'relative', 
        display: 'inline-block', 
        overflow: 'hidden', 
        verticalAlign: 'bottom',
        padding: '0.2em 0.05em',
        margin: '-0.2em -0.05em'
      });
      word.parentNode.insertBefore(mask, word);
      mask.appendChild(word);
    });

    gsap.set(split.words, { display: 'inline-block', yPercent: 100, opacity: 0 });

    gsap.to(split.words, {
      yPercent: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.05,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });
};

initWordAnimations();

// Nav In / Out
const initGlobalNav = () => {
  const menu = document.querySelector('.menu');
  const footer = document.querySelector('.footer');
  if (!menu || !footer) return;

  gsap.set(menu, { scale: 0, opacity: 0 });

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        gsap.to(menu, { scale: 0, opacity: 0, duration: 0.3, ease: "power2.in" });
      } else {
        if (document.querySelector('.home-hero-logo') && !window.navAllowedOnHome) return;
        window.executeBounce(menu, 0.5);
      }
    });
  }, { rootMargin: "0px 0px 0px 0px" });

  navObserver.observe(footer);
};

initGlobalNav();

// Nav Open / Close
const initNavMenu = () => {
  const trigger = document.querySelector('.nav-menu-trigger');
  const navOpen = document.querySelector('.nav-open');
  const closeBtn = document.querySelector('.nav-open-close');
  
  if (!trigger || !navOpen) return;
  
  const links = navOpen.querySelectorAll('.nav-open-link');

  links.forEach(link => {
    link._baseRotation = gsap.getProperty(link, "rotation") || 0;
  });

  const navTl = gsap.timeline({ paused: true });
  
  navTl.set(links, { opacity: 0, scale: 0, transformOrigin: "50% 50%" });
  if (closeBtn) {
    navTl.set(closeBtn, { opacity: 0, scale: 0, transformOrigin: "50% 50%" });
  }

  navTl.to(navOpen, { display: 'flex', opacity: 1, duration: 0.3, ease: 'power2.out' });
  navTl.to(links, {
    opacity: 1,
    scale: 1,
    duration: 1.2,
    ease: "elastic.out(1, 0.5)",
    stagger: 0.15,
    force3D: true
  }, 0.15);

  if (closeBtn) {
    navTl.to(closeBtn, {
      opacity: 1,
      scale: 1,
      duration: 1.2,
      ease: "elastic.out(1, 0.5)",
      force3D: true
    }, "-=0.6");
  }

  trigger.addEventListener('click', () => {
    navTl.restart();
  });

  const closeMenu = () => {
    navTl.pause();
    
    const closeTl = gsap.timeline();
    const exitElements = closeBtn ? [...links, closeBtn] : [...links];
    
    closeTl.to(exitElements, {
      scale: 0.5,
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut"
    });
    
    closeTl.to(navOpen, {
      opacity: 0,
      display: 'none',
      duration: 0.3,
      ease: "power2.out"
    }, 0.25);
  };

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenu();
    });
  }

  navOpen.addEventListener('click', (e) => {
    if (e.target === navOpen) {
      closeMenu();
    }
  });

  if (window.matchMedia("(min-width: 992px)").matches) {
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        gsap.to(link, { 
          rotation: link._baseRotation + 6, 
          duration: 0.6, 
          ease: "elastic.out(1, 0.4)", 
          overwrite: "auto" 
        });
      });
      
      link.addEventListener('mouseleave', () => {
        gsap.to(link, { 
          rotation: link._baseRotation, 
          duration: 0.4, 
          ease: "power2.out", 
          overwrite: "auto" 
        });
      });
    });
  }
};

initNavMenu();

// Footer Bubbles Animation
  const footerBubblesContainer = document.querySelector('.footer-bubbles');
  if (footerBubblesContainer) {
    const bubbles = footerBubblesContainer.querySelectorAll('.footer-bubble');
    
    if (bubbles.length) {
      gsap.set(bubbles, { scaleY: 0.2, yPercent: 20, transformOrigin: "50% 100%" });

      const bubbleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            gsap.to(bubbles, {
              scaleY: 1,
              yPercent: 0,
              duration: 0.8,
              ease: "back.out(1.7)",
              stagger: { each: 0.08, from: "center" },
              overwrite: "auto"
            });
          } else if (entry.boundingClientRect.top > 0) {
            gsap.to(bubbles, {
              scaleY: 0.2,
              yPercent: 20,
              duration: 0.4,
              ease: "power2.out",
              stagger: { each: 0.04, from: "center" },
              overwrite: "auto"
            });
          }
        });
      }, {
        rootMargin: "0px 0px -50px 0px"
      });

      bubbleObserver.observe(footerBubblesContainer);
    }
  }

  // Footer Logo Animation
const footerBottom = document.querySelector(".footer-bottom");
if (footerBottom) {
  const footerLogo = footerBottom.querySelector(".footer-logo");
  if (footerLogo) {
    gsap.set(footerLogo, { 
      scaleY: 0.2, 
      yPercent: 30,
      transformOrigin: "100% 100%", 
      pointerEvents: "none" 
    });
    
    const logoShapes = footerLogo.querySelectorAll("path, g, [class*='char']");
    if (logoShapes.length) {
      gsap.set(logoShapes, { pointerEvents: "auto" });
    }

    const logoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.to(footerLogo, {
            scaleY: 1,
            transformOrigin: "100% 100%",
            ease: "back.out(1.4)",
            duration: 0.8,
            overwrite: "auto"
          });
        } else if (entry.boundingClientRect.top > 0) {
          gsap.to(footerLogo, {
            scaleY: 0.2,
            transformOrigin: "100% 100%",
            ease: "power2.out",
            duration: 0.4,
            overwrite: "auto"
          });
        }
      });
    }, {
      rootMargin: "0px 0px -100px 0px"
    });

    logoObserver.observe(footerBottom);

    footerLogo.addEventListener("mouseenter", () => {
      gsap.to(footerLogo, {
        y: "8px",
        ease: "back.out(1.2)",
        duration: 0.4,
        overwrite: "auto"
      });
    });

    footerLogo.addEventListener("mouseleave", () => {
      gsap.to(footerLogo, {
        y: "0px",
        ease: "back.out(1.2)",
        duration: 0.4,
        overwrite: "auto"
      });
    });
  }
}

  // Button hover
document.querySelectorAll('.button').forEach(button => {
  let direction = -1;
  const width = button.offsetWidth;
  const rotationAmount = width <= 100 ? 5 : Math.max(2, 5 - ((width - 100) * 0.05));

  button.addEventListener('mouseenter', () => {
    gsap.to(button, {
      rotation: rotationAmount * direction,
      scale: 1.02,
      duration: 0.8,
      ease: 'elastic.out(1.2, 0.35)',
      overwrite: 'auto'
    });
    direction *= -1;
  });

  button.addEventListener('mouseleave', () => {
    gsap.to(button, {
      rotation: 0,
      scale: 1,
      duration: 0.8,
      ease: 'elastic.out(1.2, 0.35)',
      overwrite: 'auto'
    });
  });
});

 // Bubble wrappers
function buildPerimeterBubbles(wrapper, d, overlap) {
  const step = d - overlap;
  const r = d / 2;
  const w = wrapper.offsetWidth;
  const h = wrapper.offsetHeight;
  const bg = getComputedStyle(wrapper).backgroundColor;
  const cr = Math.min(d, w / 2, h / 2);

  let container = wrapper.querySelector('.bubble-perimeter');
  if (!container) {
    container = document.createElement('div');
    container.className = 'bubble-perimeter';
    wrapper.appendChild(container);
  }
  container.innerHTML = '';

  const arcLen = Math.PI / 2 * cr;
  const sw = Math.max(0, w - 2 * cr);
  const sh = Math.max(0, h - 2 * cr);
  const perimeter = 2 * (sw + sh) + 4 * arcLen;

  const count = Math.round(perimeter / step);
  if (count < 1) return;
  const actualStep = perimeter / count;

  const segments = [
    { len: sw,     fn: t => [cr + t * sw, 0] },
    { len: arcLen, fn: t => [w - cr + Math.cos(-Math.PI/2 + t * Math.PI/2) * cr, cr + Math.sin(-Math.PI/2 + t * Math.PI/2) * cr] },
    { len: sh,     fn: t => [w, cr + t * sh] },
    { len: arcLen, fn: t => [w - cr + Math.cos(t * Math.PI/2) * cr,             h - cr + Math.sin(t * Math.PI/2) * cr] },
    { len: sw,     fn: t => [w - cr - t * sw, h] },
    { len: arcLen, fn: t => [cr + Math.cos(Math.PI/2 + t * Math.PI/2) * cr,     h - cr + Math.sin(Math.PI/2 + t * Math.PI/2) * cr] },
    { len: sh,     fn: t => [0, h - cr - t * sh] },
    { len: arcLen, fn: t => [cr + Math.cos(Math.PI + t * Math.PI/2) * cr,       cr + Math.sin(Math.PI + t * Math.PI/2) * cr] },
  ].filter(seg => seg.len > 0);

  for (let i = 0; i < count; i++) {
    const dist = (i * actualStep + actualStep / 2) % perimeter;
    let rem = dist;
    let cx = 0, cy = 0;

    for (let s = 0; s < segments.length; s++) {
      const seg = segments[s];
      if (rem <= seg.len || s === segments.length - 1) {
        [cx, cy] = seg.fn(Math.min(rem / seg.len, 1));
        break;
      }
      rem -= seg.len;
    }

    const c = document.createElement('div');
    c.style.cssText = `position:absolute;width:${d}px;height:${d}px;border-radius:50%;background-color:${bg};left:${cx - r}px;top:${cy - r}px;`;
    container.appendChild(c);
  }
}

function getD(el) {
  if (el.matches('.nav-open-link')) return window.innerWidth <= 767 ? 29 : 63;
  return window.innerWidth <= 479 ? 33.5 : 43;
}

const resizeObserver = new ResizeObserver(entries => {
  entries.forEach(entry => buildPerimeterBubbles(entry.target, getD(entry.target), 4));
});

document.querySelectorAll('.bubble-borders-wrap, .nav-open-link').forEach(el => {
  buildPerimeterBubbles(el, getD(el), 4);
  resizeObserver.observe(el);
});

  // Copy email
  const emailBtn = document.querySelector('.button-email-copy');
  const emailTarget = document.querySelector('#footer-email-address');
  if (emailBtn && emailTarget) {
    emailBtn.addEventListener('click', () => {
      const email = emailTarget.textContent.trim();
      navigator.clipboard.writeText(email);
    });
  }

  // Update Year
  const yearEl = document.querySelector('#current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

});