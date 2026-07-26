(() => {
  "use strict";

  const FRAME_COUNT = 180;
  const FRAME_PREFIX = "Scroll-images-ai-web/ezgif-frame-";
  const FRAME_EXTENSION = ".jpg";
  const MOBILE_QUERY = "(max-width: 760px)";
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = matchMedia(MOBILE_QUERY).matches;
  const loader = document.querySelector(".loader");

  gsap.registerPlugin(ScrollTrigger);

  let lenis;
  if (!reducedMotion) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target || !lenis) return;
      event.preventDefault();
      lenis.scrollTo(target, { duration: 1.2 });
    });
  });

  const revealElements = document.querySelectorAll(".section-copy, .stats > div");
  if (reducedMotion) {
    loader.classList.add("is-done");
    revealElements.forEach((element) => {
      gsap.from(element, { opacity: 0, duration: 0.5, scrollTrigger: { trigger: element, start: "top 88%", once: true } });
    });
    return;
  }

  gsap.from(".hero__copy > *", { opacity: 0, y: 28, duration: 1, stagger: 0.12, ease: "power3.out", delay: 0.2 });
  gsap.from(".scroll-cue", { opacity: 0, y: 12, duration: 0.8, delay: 0.7, ease: "power2.out" });

  gsap.timeline({
    scrollTrigger: { trigger: ".design", start: "top top", end: "+=140%", pin: true, scrub: 1 }
  })
    .fromTo(".design__visual img", { scale: 1.1, xPercent: 4 }, { scale: 1, xPercent: -3, ease: "none" }, 0)
    .from(".design__copy > *", { opacity: 0, y: 35, stagger: 0.08, ease: "power2.out" }, 0.08)
    .from(".callouts li", { opacity: 0, x: 18, stagger: 0.08, ease: "power2.out" }, 0.35);

  gsap.from(".explode-intro .section-copy > *", {
    opacity: 0, y: 40, stagger: 0.12, duration: 1,
    scrollTrigger: { trigger: ".explode-intro", start: "top 70%", once: true }
  });

  document.querySelectorAll("[data-count]").forEach((node) => {
    const value = Number(node.dataset.count);
    const decimals = Number(node.dataset.decimals || 0);
    const state = { value: 0 };
    gsap.to(state, {
      value, duration: 1.6, ease: "power3.out",
      scrollTrigger: { trigger: node, start: "top 85%", once: true },
      onUpdate: () => { node.textContent = state.value.toFixed(decimals); }
    });
  });

  gsap.from(".performance__heading > *", { opacity: 0, y: 30, stagger: 0.1, duration: 1, scrollTrigger: { trigger: ".performance", start: "top 65%", once: true } });
  gsap.from(".stats > div", { opacity: 0, x: 30, stagger: 0.09, duration: 0.8, scrollTrigger: { trigger: ".stats", start: "top 80%", once: true } });
  gsap.from(".closing__copy > *", { opacity: 0, y: 30, stagger: 0.1, duration: 1, scrollTrigger: { trigger: ".closing", start: "top 65%", once: true } });

  if (isMobile) {
    loader.classList.add("is-done");
    return;
  }

  const canvas = document.querySelector(".sequence");
  const context = canvas.getContext("2d");
  const images = [];
  let loaded = 0;

  const framePath = (index) => `${FRAME_PREFIX}${String(index + 1).padStart(3, "0")}${FRAME_EXTENSION}`;
  const drawFrame = (index) => {
    const image = images[index];
    if (!image?.complete) return;
    const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
  };

  const resizeCanvas = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    drawFrame(sequence.frame);
  };

  const sequence = { frame: 0 };
  for (let index = 0; index < FRAME_COUNT; index += 1) {
    const image = new Image();
    image.decoding = "async";
    image.src = framePath(index);
    image.onload = image.onerror = () => {
      loaded += 1;
      const percent = Math.round((loaded / FRAME_COUNT) * 100);
      document.querySelector(".loader__bar").style.width = `${percent}%`;
      document.querySelector(".loader__value").textContent = `${percent}%`;
      if (loaded === FRAME_COUNT) {
        drawFrame(0);
        loader.classList.add("is-done");
        ScrollTrigger.refresh();
      }
    };
    images.push(image);
  }

  addEventListener("resize", resizeCanvas);
  resizeCanvas();

  gsap.to(sequence, {
    frame: FRAME_COUNT - 1,
    snap: "frame",
    ease: "none",
    onUpdate: () => {
      drawFrame(sequence.frame);
      document.querySelector(".explode__progress span").textContent = String(sequence.frame + 1).padStart(2, "0");
    },
    scrollTrigger: { trigger: ".explode", start: "top top", end: "bottom bottom", scrub: 0.4 }
  });

  gsap.to(".explode__closing", {
    opacity: 1,
    scrollTrigger: { trigger: ".explode", start: "85% bottom", end: "bottom bottom", scrub: 0.4 }
  });
})();
