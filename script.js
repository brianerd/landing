const workflow = document.querySelector('#workflow');

if (workflow) {
  const steps = Array.from(workflow.querySelectorAll('.step-card'));
  const mockups = Array.from(workflow.querySelectorAll('.mockup-screen'));
  const navPills = Array.from(workflow.querySelectorAll('.nav-pill'));
  const layout = workflow.querySelector('.workflow-layout');
  const scrollBreakpoint = 960;
  let currentIndex = steps.findIndex((step) => step.classList.contains('active'));
  if (currentIndex === -1) currentIndex = 0;

  let layoutTop = 0;
  let layoutHeight = 0;
  let stepAnchors = [];
  let scrollSyncEnabled = window.innerWidth >= scrollBreakpoint;
  let ticking = false;
  const AUTOPLAY_INTERVAL = 4500;
  const AUTOPLAY_RESUME_DELAY = 9000;
  let autoplayTimer = null;
  let autoplayResumeTimer = null;

  const stopAutoplay = () => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  const startAutoplay = () => {
    if (autoplayTimer) return;
    autoplayTimer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % steps.length;
      setActive(nextIndex, { force: true, source: 'autoplay' });
    }, AUTOPLAY_INTERVAL);
  };

  const updateNavPills = (index) => {
    navPills.forEach((pill, pillIndex) => {
      pill.classList.toggle('active', pillIndex === index);
    });
  };

  const handleUserInteraction = (source) => {
    if (source === 'autoplay') return;
    stopAutoplay();
    if (autoplayResumeTimer) clearTimeout(autoplayResumeTimer);
    autoplayResumeTimer = setTimeout(() => {
      startAutoplay();
    }, AUTOPLAY_RESUME_DELAY);
  };

  const setActive = (index, { force = false, source = 'manual' } = {}) => {
    const step = steps[index];
    if (!step) return;
    if (!force && index === currentIndex) return;
    steps.forEach((btn) => btn.classList.remove('active'));
    mockups.forEach((block) => block.classList.remove('active'));
    step.classList.add('active');
    const panelId = step.dataset.panel;
    const block = workflow.querySelector(`.mockup-screen[data-step="${panelId}"]`);
    if (block) block.classList.add('active');
    currentIndex = index;
    updateNavPills(index);
    handleUserInteraction(source);
  };

  const calculateAnchors = () => {
    if (!layout) return;
    const rect = layout.getBoundingClientRect();
    layoutTop = window.scrollY + rect.top;
    layoutHeight = rect.height || 1;
    const divisions = Math.max(steps.length - 1, 1);
    const segment = layoutHeight / divisions;
    stepAnchors = steps.map((_, idx) => layoutTop + segment * idx);
  };

  const syncWithScroll = () => {
    if (!scrollSyncEnabled || !stepAnchors.length) return;
    const probeLine = window.scrollY + window.innerHeight * 0.4;

    if (probeLine <= stepAnchors[0]) {
      if (currentIndex !== 0) setActive(0, { force: true, source: 'scroll' });
      return;
    }

    const lastIndex = stepAnchors.length - 1;
    if (probeLine >= stepAnchors[lastIndex]) {
      if (currentIndex !== lastIndex) setActive(lastIndex, { force: true, source: 'scroll' });
      return;
    }

    for (let i = lastIndex; i >= 0; i -= 1) {
      if (probeLine >= stepAnchors[i]) {
        if (currentIndex !== i) setActive(i, { force: true, source: 'scroll' });
        break;
      }
    }
  };

  const handleScroll = () => {
    if (!scrollSyncEnabled) return;
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(() => {
        syncWithScroll();
        ticking = false;
      });
    }
  };

  const updateScrollSyncState = () => {
    scrollSyncEnabled = window.innerWidth >= scrollBreakpoint;
    calculateAnchors();
    if (scrollSyncEnabled) {
      syncWithScroll();
    }
  };

  steps.forEach((step, index) => {
    step.addEventListener('click', () => {
      setActive(index, { force: true, source: 'click' });
    });
  });

  setActive(currentIndex, { force: true });
  calculateAnchors();
  syncWithScroll();
  startAutoplay();

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', updateScrollSyncState);
  window.addEventListener('load', () => {
    calculateAnchors();
    syncWithScroll();
  });
}
