window.Webflow = window.Webflow || [];
window.Webflow.push(() => {

  // Lenis smooth scroll
  const initSmoothScroll = () => {
    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    return lenis;
  };

  // Hero Bubble Animation
  const initBubbleAnimations = () => {
    const container = document.querySelector('.hero-bottom-bubbles');
    if (!container) return;
    const nextSection = document.querySelector('.s-about-intro');
    if (!nextSection) return;
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
            trigger: nextSection,
            start: "top 75%",
            end: "top top",
            scrub: true,
            invalidateOnRefresh: true
          }
        });
      }
    });
  };

  // Hero text scroll
  const initHeroScroll = () => {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 992px)", () => {
      const section = document.querySelector('.about-hero-content');
      if (!section) return;

      const scroller = section.querySelector('.about-hero-text-scroller');
      if (!scroller) return;

      gsap.set(scroller, { position: "relative" });

      gsap.fromTo(scroller, 
        { opacity: 0,
          left: "10vw"
        },
        { 
          opacity: 1,
          left: "0vw", 
          duration: 1.6, 
          ease: "power3.out" 
        }
      );

      gsap.to(scroller, {
        x: () => -(scroller.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => `+=${scroller.scrollWidth - window.innerWidth}`,
          invalidateOnRefresh: true,
          refreshPriority: 1
        }
      });

      return () => {
        gsap.set(scroller, { x: 0, left: "0vw" });
      };
    });
  };

  // Pics deck
  const initPictureDeck = () => {
    const container = document.querySelector('.about-pics');
    if (!container) return;
    const cards = Array.from(container.querySelectorAll('.about-pic-wrap'));
    if (cards.length !== 4) return;

    let deck = [...cards];

    const getRotation = (index) => {
      if (index === 0) return 2.5;
      if (index === 1) return 10;
      if (index === 2) return -12;
      return -12;
    };

    gsap.set(container, { opacity: 0, scale: 0.5 });
    gsap.set(deck, {
      zIndex: i => 4 - i,
      rotation: 0,
      xPercent: 0,
      transformOrigin: "50% 50%"
    });

    const startDeckLoop = () => {
      moveDeck();
      setInterval(moveDeck, 2500);
    };

    const moveDeck = () => {
      const activeCard = deck.shift();
      deck.push(activeCard);

      const tl = gsap.timeline();

      tl.to(activeCard, {
        xPercent: 110,
        duration: 1,
        ease: "power2.out"
      }, 0);

      tl.to(activeCard, {
        rotation: -12,
        duration: 0.5,
        ease: "power2.inOut"
      }, 0);

      tl.set(activeCard, { zIndex: 1 }, 0.5);

      tl.to(activeCard, {
        xPercent: 0,
        duration: 0.5,
        ease: "power2.in"
      }, 0.5);

      deck.forEach((card, index) => {
        if (card !== activeCard) {
          tl.to(card, {
            rotation: getRotation(index),
            duration: 1,
            ease: "power2.inOut"
          }, 0);
          tl.set(card, { zIndex: 4 - index }, 0.5);
        }
      });
    };

    const deckObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          deckObserver.disconnect();
          
          const bounce = window.executeBounce(container);

          if (bounce) {
            bounce.eventCallback("onComplete", () => {
              gsap.to(deck, {
                rotation: i => getRotation(i),
                duration: 0.5,
                ease: "back.out(2)",
                onComplete: () => {
                  gsap.delayedCall(1.5, startDeckLoop);
                }
              });
            });
          } else {
            gsap.set(container, { scale: 1, opacity: 1 });
            gsap.set(deck, { rotation: i => getRotation(i) });
            gsap.delayedCall(1.5, startDeckLoop);
          }
        }
      });
    }, {
      rootMargin: "0px 0px -100px 0px"
    });

    deckObserver.observe(container);
  };

  // Method blocks scroll
  const initMethodScroll = () => {
    const section = document.querySelector('.method-blocks-wrap');
    if (!section) return;

    const scroller = section.querySelector('.method-blocks');
    if (!scroller) return;

    gsap.to(scroller, {
      x: () => -(scroller.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        pin: true,
        scrub: 1,
        start: 'top top',
        end: () => `+=${scroller.scrollWidth - window.innerWidth}`,
        invalidateOnRefresh: true,
        refreshPriority: 1
      }
    });
  };

  // FAQ accordion
  const initFaqAccordion = () => {
    const triggers = document.querySelectorAll(".faq-item");
    if (!triggers.length) return;

    const transitionStyle = "height 0.3s cubic-bezier(0.25, 1, 0.5, 1)";
    const iconTransitionStyle = "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)";

    triggers.forEach((trigger) => {
      const answer = trigger.querySelector(".faq-answer-clip");
      const icon = trigger.querySelector(".faq-icon-line-v");

      if (answer) {
        answer.style.height = "0px";
        answer.style.transition = transitionStyle;
      }
      if (icon) {
        icon.style.transition = iconTransitionStyle;
        icon.style.transform = "rotate(0deg)";
      }

      trigger.addEventListener("click", function () {
        const targetAnswer = this.querySelector(".faq-answer-clip");
        const targetIcon = this.querySelector(".faq-icon-line-v");
        if (!targetAnswer) return;

        const isOpen = targetAnswer.style.height !== "0px";

        triggers.forEach((otherTrigger) => {
          const otherAnswer = otherTrigger.querySelector(".faq-answer-clip");
          const otherIcon = otherTrigger.querySelector(".faq-icon-line-v");

          if (otherAnswer) otherAnswer.style.height = "0px";
          if (otherIcon) otherIcon.style.transform = "rotate(0deg)";
        });

        if (!isOpen) {
          targetAnswer.style.height = `${targetAnswer.scrollHeight}px`;
          if (targetIcon) targetIcon.style.transform = "rotate(90deg)";
        }
      });
    });
  };

  const runAboutScripts = () => {
    initSmoothScroll();
    initBubbleAnimations();
    initHeroScroll();
    initPictureDeck();
    initMethodScroll();
    initFaqAccordion();
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  };

  runAboutScripts();
});