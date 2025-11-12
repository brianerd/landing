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


class StepOneAutoDemo {
  constructor(root) {
    this.root = root;
    this.orderFields = {
      quantity: this.getOrderField('quantity'),
      due: this.getOrderField('due'),
      price: this.getOrderField('price'),
    };
    this.dueChip = this.orderFields.due?.el.querySelector('[data-calendar-chip]') || null;
    this.dropzone = root.querySelector('[data-upload-zone]');
    this.uploadMessage = this.dropzone?.querySelector('[data-upload-message]') || null;
    this.uploadStatus = this.dropzone?.querySelector('[data-upload-status]') || null;
    this.uploadMessageDefault = this.uploadMessage?.textContent.trim() || '';
    this.uploadStatusDefault = this.uploadStatus?.textContent.trim() || '';
    this.aiFields = Array.from(root.querySelectorAll('[data-ai-field]')).map((field) => ({
      id: field.dataset.aiField,
      el: field,
      valueEl: field.querySelector('.ai-value'),
      value: field.querySelector('.ai-value')?.dataset.fullText || '',
    }));
    this.parseStatus = root.querySelector('[data-parse-status]');
    this.parseStatusDefault = this.parseStatus?.textContent.trim() || '';
    this.scoreFill = root.querySelector('[data-score-fill]');
    this.scoreOutput = root.querySelector('[data-score-output]');
    this.scoreReady = root.querySelector('[data-score-ready]');
    this.progressTarget = 95;
    this.loopPause = 4000;
    this.sequenceRunning = false;
    this.inView = false;
    this.prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (this.prefersReducedMotion) return;

    this.root.classList.add('auto-demo');
    this.resetState();

    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(this.handleIntersect.bind(this), {
        threshold: 0.45,
      });
      this.observer.observe(this.root);
    } else {
      this.inView = true;
      this.start();
    }
  }

  getOrderField(key) {
    const el = this.root.querySelector(`[data-order-field="${key}"]`);
    if (!el) return null;
    const textEl = el.querySelector('.typing-text');
    return {
      el,
      textEl,
      value: textEl?.dataset.fullText || textEl?.textContent?.trim() || '',
    };
  }

  handleIntersect(entries) {
    const [entry] = entries;
    if (!entry) return;
    if (entry.isIntersecting) {
      this.inView = true;
      this.start();
    } else {
      this.inView = false;
    }
  }

  start() {
    if (this.sequenceRunning || !this.inView) return;
    this.sequenceRunning = true;
    this.runLoop();
  }

  async runLoop() {
    this.resetState();
    await this.wait(300);
    if (!this.inView) {
      this.sequenceRunning = false;
      this.resetState();
      return;
    }

    while (this.inView) {
      await this.playOnce();
      if (!this.inView) break;
      await this.wait(this.loopPause);
      if (!this.inView) break;
      await this.fadeToInitial();
    }

    this.sequenceRunning = false;
    if (!this.inView) {
      this.resetState();
    }
  }

  async fadeToInitial() {
    this.root.classList.add('is-resetting');
    await this.wait(420);
    this.resetState();
    this.root.classList.remove('is-resetting');
    await this.wait(180);
  }

  async playOnce() {
    if (!this.inView) return;
    await this.handleOrderInputs();
    if (!this.inView) return;
    await this.simulateUpload();
    if (!this.inView) return;
    await this.runAiParse();
    if (!this.inView) return;
    await this.fillScore();
  }

  async handleOrderInputs() {
    await this.typeOrderField('quantity', 900);
    if (!this.inView) return;
    await this.wait(150);
    if (!this.inView) return;
    await this.simulateDateSelection(1000);
    if (!this.inView) return;
    await this.wait(150);
    if (!this.inView) return;
    await this.typeOrderField('price', 900);
  }

  async typeOrderField(key, duration = 900) {
    const field = this.orderFields[key];
    if (!field || !field.textEl || !field.value) return;
    field.el.classList.add('is-typing');
    field.el.classList.remove('typing-complete');
    field.textEl.textContent = '';

    const chars = Array.from(field.value);
    const interval = Math.max(duration / chars.length, 35);

    for (let i = 0; i < chars.length; i += 1) {
      field.textEl.textContent = field.value.slice(0, i + 1);
      if (i < chars.length - 1) {
        await this.wait(interval);
        if (!this.inView) return;
      }
    }

    field.textEl.textContent = field.value;
    field.el.classList.remove('is-typing');
    field.el.classList.add('typing-complete');
  }

  async simulateDateSelection(duration = 1000) {
    const field = this.orderFields.due;
    if (!field || !field.textEl || !field.value) return;
    const selectionDelay = Math.max(duration * 0.5, 350);
    const settleDelay = Math.max(duration - selectionDelay, 300);

    field.el.classList.remove('typing-complete');
    field.el.classList.add('is-selecting');
    field.textEl.textContent = '';
    if (this.dueChip) this.dueChip.classList.add('is-active');

    await this.wait(selectionDelay);
    if (!this.inView) return;

    field.textEl.textContent = field.value;
    field.el.classList.add('typing-complete');

    await this.wait(settleDelay);
    if (!this.inView) return;

    field.el.classList.remove('is-selecting');
    if (this.dueChip) this.dueChip.classList.remove('is-active');
  }

  async simulateUpload(duration = 1500) {
    if (!this.dropzone) return;
    this.dropzone.classList.remove('is-uploading', 'is-complete');
    this.dropzone.classList.add('is-dragging');
    this.setUploadStatus('tech-pack.pdf · dragging');
    if (this.uploadMessage) this.uploadMessage.textContent = this.uploadMessageDefault;

    await this.wait(450);
    if (!this.inView) return;

    this.dropzone.classList.remove('is-dragging');
    this.dropzone.classList.add('is-uploading');
    this.setUploadStatus('Uploading… 68%');

    await this.wait(Math.max(duration - 600, 500));
    if (!this.inView) return;

    this.dropzone.classList.remove('is-uploading');
    this.dropzone.classList.add('is-complete');
    this.setUploadStatus('Upload complete · 100%');
    if (this.uploadMessage) this.uploadMessage.textContent = 'tech-pack.pdf';
  }

  setUploadStatus(text) {
    if (this.uploadStatus) {
      this.uploadStatus.textContent = text;
    }
  }

  async runAiParse() {
    if (this.parseStatus) {
      this.parseStatus.textContent = 'AI PARSING...';
      this.parseStatus.classList.add('is-active');
    }

    for (const field of this.aiFields) {
      await this.typeAiField(field, 700);
      if (!this.inView) return;
    }

    if (this.parseStatus) {
      this.parseStatus.textContent = 'AI brief generated';
      this.parseStatus.classList.remove('is-active');
    }
  }

  async typeAiField(field, duration = 700) {
    if (!field?.valueEl || !field.value) return;
    field.el.classList.add('is-active');
    field.el.classList.remove('is-filled');
    field.valueEl.textContent = '';

    const chars = Array.from(field.value);
    const interval = Math.max(duration / chars.length, 35);

    for (let i = 0; i < chars.length; i += 1) {
      field.valueEl.textContent = field.value.slice(0, i + 1);
      if (i < chars.length - 1) {
        await this.wait(interval);
        if (!this.inView) return;
      }
    }

    field.valueEl.textContent = field.value;
    field.el.classList.remove('is-active');
    field.el.classList.add('is-filled');
  }

  async fillScore(duration = 1000) {
    await this.animateScoreNumber(this.progressTarget, duration);
    if (!this.inView) return;
    if (this.scoreReady) this.scoreReady.classList.add('is-visible');
  }

  async animateScoreNumber(target, duration) {
    if (!this.scoreOutput || !this.scoreFill) return;
    const steps = 30;
    const stepDuration = duration / steps;
    for (let i = 1; i <= steps; i += 1) {
      if (!this.inView) return;
      const value = Math.min(target, Math.round((target / steps) * i));
      this.scoreOutput.textContent = `${value}%`;
      this.scoreFill.style.width = `${value}%`;
      await this.wait(stepDuration);
    }
    this.scoreOutput.textContent = `${target}%`;
    this.scoreFill.style.width = `${target}%`;
  }

  resetState() {
    this.resetOrderFields();
    this.resetUpload();
    this.resetAiFields();
    this.resetScore();
    if (this.parseStatus) {
      this.parseStatus.textContent = this.parseStatusDefault;
      this.parseStatus.classList.remove('is-active');
    }
  }

  resetOrderFields() {
    Object.entries(this.orderFields).forEach(([key, field]) => {
      if (!field?.el) return;
      field.el.classList.remove('is-typing', 'typing-complete', 'is-selecting');
      if (field.textEl) field.textEl.textContent = '';
      if (key === 'due' && this.dueChip) {
        this.dueChip.classList.remove('is-active');
      }
    });
  }

  resetUpload() {
    if (this.dropzone) {
      this.dropzone.classList.remove('is-dragging', 'is-uploading', 'is-complete');
    }
    if (this.uploadMessage) {
      this.uploadMessage.textContent = this.uploadMessageDefault;
    }
    if (this.uploadStatus) {
      this.uploadStatus.textContent = this.uploadStatusDefault;
    }
  }

  resetAiFields() {
    this.aiFields.forEach((field) => {
      if (!field?.el) return;
      field.el.classList.remove('is-active', 'is-filled');
      if (field.valueEl) field.valueEl.textContent = '';
    });
  }

  resetScore() {
    if (this.scoreFill) this.scoreFill.style.width = '0%';
    if (this.scoreOutput) this.scoreOutput.textContent = '0%';
    if (this.scoreReady) this.scoreReady.classList.remove('is-visible');
  }

  wait(duration) {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }
}

const stepOneScreen = document.querySelector('.mockup-screen[data-step="step-1"]');
if (stepOneScreen) {
  new StepOneAutoDemo(stepOneScreen);
}
