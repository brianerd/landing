const workflow = document.querySelector('#workflow');

if (workflow) {
  const steps = Array.from(workflow.querySelectorAll('.step-card'));
  const mockups = Array.from(workflow.querySelectorAll('.mockup-screen'));
  const navPills = Array.from(workflow.querySelectorAll('.nav-pill'));
  let currentIndex = steps.findIndex((step) => step.classList.contains('active'));
  if (currentIndex === -1) currentIndex = 0;

  const updateNavPills = (index) => {
    navPills.forEach((pill, pillIndex) => {
      pill.classList.toggle('active', pillIndex === index);
    });
  };

  const setActive = (index, { force = false } = {}) => {
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

    // Restart animation for the active step
    if (window.demoInstances && window.demoInstances[panelId]) {
      window.demoInstances[panelId].restart();
    }
  };

  steps.forEach((step, index) => {
    step.addEventListener('click', () => {
      setActive(index, { force: true });
    });
  });

  setActive(currentIndex, { force: true });
}


class StepOneAutoDemo {
  constructor(root) {
    this.root = root;
    this.orderFields = {
      'product-name': this.getOrderField('product-name'),
      quantity: this.getOrderField('quantity'),
      due: this.getOrderField('due'),
      price: this.getOrderField('price'),
      description: this.getOrderField('description'),
    };
    this.dueChip = this.orderFields.due?.el.querySelector('[data-calendar-chip]') || null;
    this.generateBtn = root.querySelector('[data-generate-btn]');
    this.aiBriefCard = root.querySelector('.ai-brief-card');
    this.dropzone = root.querySelector('[data-upload-zone]');
    this.uploadStatus = this.dropzone?.querySelector('[data-upload-status]') || null;
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
    this.runId = 0;
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

  async restart() {
    this.runId += 1;
    this.inView = false;
    this.sequenceRunning = false;
    this.root.classList.add('is-resetting');
    this.resetState();
    await this.wait(50);
    this.root.classList.remove('is-resetting');
    await this.wait(50);
    this.inView = true;
    this.start();
  }

  async runLoop() {
    const currentRunId = this.runId;
    this.resetState();
    await this.wait(300);
    if (!this.inView || this.runId !== currentRunId) {
      this.sequenceRunning = false;
      this.resetState();
      return;
    }

    while (this.inView && this.runId === currentRunId) {
      await this.playOnce(currentRunId);
      if (!this.inView || this.runId !== currentRunId) break;
      await this.wait(this.loopPause);
      if (!this.inView || this.runId !== currentRunId) break;
      await this.fadeToInitial();
    }

    this.sequenceRunning = false;
    if (!this.inView || this.runId !== currentRunId) {
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

  async playOnce(currentRunId) {
    if (!this.inView || this.runId !== currentRunId) return;
    await this.handleOrderInputs(currentRunId);
    if (!this.inView || this.runId !== currentRunId) return;
    await this.wait(200);
    if (!this.inView || this.runId !== currentRunId) return;
    await this.simulateUpload();
    if (!this.inView || this.runId !== currentRunId) return;
    await this.wait(150);
    if (!this.inView || this.runId !== currentRunId) return;
    await this.simulateButtonClick();
    if (!this.inView || this.runId !== currentRunId) return;
    await this.revealAiPanel();
    if (!this.inView || this.runId !== currentRunId) return;
    await this.runAiParse(currentRunId);
    if (!this.inView || this.runId !== currentRunId) return;
    await this.fillScore();
  }

  async handleOrderInputs(currentRunId) {
    await this.typeOrderField('product-name', 800, currentRunId);
    if (!this.inView || this.runId !== currentRunId) return;
    await this.wait(100);
    if (!this.inView || this.runId !== currentRunId) return;
    await this.typeOrderField('quantity', 600, currentRunId);
    if (!this.inView || this.runId !== currentRunId) return;
    await this.wait(100);
    if (!this.inView || this.runId !== currentRunId) return;
    await this.simulateDateSelection(1000);
    if (!this.inView || this.runId !== currentRunId) return;
    await this.wait(100);
    if (!this.inView || this.runId !== currentRunId) return;
    await this.typeOrderField('price', 600, currentRunId);
    if (!this.inView || this.runId !== currentRunId) return;
    await this.wait(100);
    if (!this.inView || this.runId !== currentRunId) return;
    await this.typeOrderField('description', 1200, currentRunId);
  }

  async typeOrderField(key, duration = 900, currentRunId) {
    const field = this.orderFields[key];
    if (!field || !field.textEl || !field.value) return;
    field.el.classList.add('is-typing');
    field.el.classList.remove('typing-complete');
    field.textEl.textContent = '';

    const chars = Array.from(field.value);
    const interval = Math.max(duration / chars.length, 35);

    for (let i = 0; i < chars.length; i += 1) {
      if (!this.inView || this.runId !== currentRunId) return;
      field.textEl.textContent = field.value.slice(0, i + 1);
      if (i < chars.length - 1) {
        await this.wait(interval);
        if (!this.inView || this.runId !== currentRunId) return;
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

  async simulateButtonClick(duration = 1000) {
    if (!this.generateBtn) return;

    this.generateBtn.classList.add('is-loading');
    if (this.parseStatus) {
      this.parseStatus.textContent = 'Parsing...';
      this.parseStatus.classList.add('is-active');
    }

    await this.wait(duration);
    if (!this.inView) return;

    this.generateBtn.classList.remove('is-loading');
  }

  async revealAiPanel(duration = 500) {
    if (!this.aiBriefCard) return;

    this.aiBriefCard.classList.add('is-visible');
    await this.wait(duration);
  }

  async simulateUpload(duration = 1000) {
    if (!this.dropzone) return;
    this.dropzone.classList.remove('is-uploading', 'is-complete');
    this.dropzone.classList.add('is-dragging');
    this.setUploadStatus('Dragging...');

    await this.wait(300);
    if (!this.inView) return;

    this.dropzone.classList.remove('is-dragging');
    this.dropzone.classList.add('is-uploading');
    this.setUploadStatus('Uploading...');

    await this.wait(Math.max(duration - 450, 350));
    if (!this.inView) return;

    this.dropzone.classList.remove('is-uploading');
    this.dropzone.classList.add('is-complete');
    this.setUploadStatus('✓ Uploaded');
  }

  setUploadStatus(text) {
    if (this.uploadStatus) {
      this.uploadStatus.textContent = text;
    }
  }

  async runAiParse(currentRunId) {
    if (this.parseStatus) {
      this.parseStatus.textContent = 'AI PARSING...';
      this.parseStatus.classList.add('is-active');
    }

    for (const field of this.aiFields) {
      await this.typeAiField(field, 700, currentRunId);
      if (!this.inView || this.runId !== currentRunId) return;
    }

    if (this.parseStatus) {
      this.parseStatus.textContent = 'AI brief generated';
      this.parseStatus.classList.remove('is-active');
    }
  }

  async typeAiField(field, duration = 700, currentRunId) {
    if (!field?.valueEl || !field.value) return;
    field.el.classList.add('is-active');
    field.el.classList.remove('is-filled');
    field.valueEl.textContent = '';

    const chars = Array.from(field.value);
    const interval = Math.max(duration / chars.length, 35);

    for (let i = 0; i < chars.length; i += 1) {
      if (!this.inView || this.runId !== currentRunId) return;
      field.valueEl.textContent = field.value.slice(0, i + 1);
      if (i < chars.length - 1) {
        await this.wait(interval);
        if (!this.inView || this.runId !== currentRunId) return;
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
    this.resetButton();
    this.resetAiPanel();
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
    if (this.uploadStatus) {
      this.uploadStatus.textContent = '';
    }
  }

  resetButton() {
    if (this.generateBtn) {
      this.generateBtn.classList.remove('is-loading');
    }
  }

  resetAiPanel() {
    if (this.aiBriefCard) {
      this.aiBriefCard.classList.remove('is-visible');
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

class StepTwoAutoDemo {
  constructor(root) {
    this.root = root;
    this.flagCards = Array.from(root.querySelectorAll('.flag-card'));
    this.flagCounters = this.flagCards.map(card => ({
      el: card,
      counterEl: card.querySelector('.flag-count'),
      targetValue: parseInt(card.querySelector('.flag-count')?.textContent) || 0,
    }));
    this.factoryEntries = Array.from(root.querySelectorAll('.factory-entry'));
    this.factoryData = this.factoryEntries.map((entry, index) => ({
      el: entry,
      checkbox: entry.querySelector('input[type="checkbox"]'),
      scoreEl: entry.querySelector('.factory-score strong'),
      targetScore: parseInt(entry.querySelector('.factory-score strong')?.textContent) || 0,
      aiHint: entry.querySelector('[data-ai-hint]'),
      index,
    }));
    this.selectionBar = root.querySelector('.selection-bar');
    this.quoteBtn = root.querySelector('[data-quote-btn]');
    this.quoteCount = root.querySelector('[data-quote-count]');
    this.selectionCount = root.querySelector('[data-selection-count]');
    this.loopPause = 3000;
    this.sequenceRunning = false;
    this.inView = false;
    this.runId = 0;
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

  async restart() {
    this.runId += 1;
    this.inView = false;
    this.sequenceRunning = false;
    this.root.classList.add('is-resetting');
    this.resetState();
    await this.wait(50);
    this.root.classList.remove('is-resetting');
    await this.wait(50);
    this.inView = true;
    this.start();
  }

  async runLoop() {
    const currentRunId = this.runId;
    this.resetState();
    await this.wait(300);
    if (!this.inView || this.runId !== currentRunId) {
      this.sequenceRunning = false;
      this.resetState();
      return;
    }

    while (this.inView && this.runId === currentRunId) {
      await this.playOnce(currentRunId);
      if (!this.inView || this.runId !== currentRunId) break;
      await this.wait(this.loopPause);
      if (!this.inView || this.runId !== currentRunId) break;
      await this.fadeToInitial();
    }

    this.sequenceRunning = false;
    if (!this.inView || this.runId !== currentRunId) {
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

  async playOnce(currentRunId) {
    // Step A: Animate Regional Data (1s)
    if (!this.inView || this.runId !== currentRunId) return;
    await this.animateRegionalData(currentRunId);
    if (!this.inView || this.runId !== currentRunId) return;
    await this.wait(300);

    // Step B: Reveal Factory Cards (2s)
    if (!this.inView || this.runId !== currentRunId) return;
    await this.revealFactoryCards(currentRunId);
    if (!this.inView || this.runId !== currentRunId) return;
    await this.wait(300);

    // Step C: Reveal AI Hints (1s)
    if (!this.inView || this.runId !== currentRunId) return;
    await this.revealAiHints(currentRunId);
    if (!this.inView || this.runId !== currentRunId) return;
    await this.wait(300);

    // Step D: Simulate Selection (1s)
    if (!this.inView || this.runId !== currentRunId) return;
    await this.simulateSelection();
  }

  async animateRegionalData(currentRunId) {
    const duration = 1000;
    const steps = 30;
    const stepDuration = duration / steps;

    this.flagCounters.forEach(({ el }) => {
      el.classList.add('is-animating');
    });

    for (let i = 1; i <= steps; i += 1) {
      if (!this.inView || this.runId !== currentRunId) return;
      this.flagCounters.forEach(({ counterEl, targetValue }) => {
        if (!counterEl) return;
        const value = Math.round((targetValue / steps) * i);
        counterEl.textContent = `${value}%`;
      });
      await this.wait(stepDuration);
    }

    this.flagCounters.forEach(({ counterEl, targetValue, el }) => {
      if (counterEl) counterEl.textContent = `${targetValue}%`;
      el.classList.remove('is-animating');
      el.classList.add('animation-complete');
    });
  }

  async revealFactoryCards(currentRunId) {
    const cardDelay = 600;
    const countDuration = 1000;

    for (const factory of this.factoryData) {
      if (!this.inView || this.runId !== currentRunId) return;

      factory.el.classList.add('is-revealing');
      await this.animateFactoryScore(factory, countDuration, currentRunId);
      factory.el.classList.remove('is-revealing');
      factory.el.classList.add('is-visible');

      await this.wait(cardDelay);
    }
  }

  async revealAiHints(currentRunId) {
    const hintDelay = 400;

    for (const factory of this.factoryData) {
      if (!this.inView || this.runId !== currentRunId) return;
      if (!factory.aiHint) continue;

      factory.aiHint.classList.add('is-revealing');
      await this.wait(hintDelay);
      factory.aiHint.classList.remove('is-revealing');
      factory.aiHint.classList.add('is-visible');

      // Add special border styling for top match
      if (factory.aiHint.dataset.aiHint === 'top') {
        factory.el.classList.add('has-top-match');
      }
    }
  }

  async animateFactoryScore(factory, duration, currentRunId) {
    if (!factory.scoreEl) return;

    const steps = 25;
    const stepDuration = duration / steps;

    for (let i = 1; i <= steps; i += 1) {
      if (!this.inView || this.runId !== currentRunId) return;
      const value = Math.round((factory.targetScore / steps) * i);
      factory.scoreEl.textContent = `${value}%`;
      await this.wait(stepDuration);
    }

    factory.scoreEl.textContent = `${factory.targetScore}%`;
  }

  async simulateSelection() {
    const selectDelay = 400;

    // Select only first factory (Factory A-007)
    if (!this.inView) return;
    const factory = this.factoryData[0];
    if (!factory) return;

    factory.el.classList.add('is-selecting');
    await this.wait(300);

    if (factory.checkbox) {
      factory.checkbox.checked = true;
    }
    factory.el.classList.add('selected');
    factory.el.classList.remove('is-selecting');

    await this.wait(selectDelay);

    // Activate button and update counts
    if (!this.inView) return;
    if (this.selectionBar) {
      this.selectionBar.classList.add('is-active');
    }
    if (this.quoteBtn) {
      this.quoteBtn.classList.add('is-active');
    }
    if (this.quoteCount) {
      this.quoteCount.textContent = '1';
    }
    if (this.selectionCount) {
      this.selectionCount.textContent = '1';
    }
  }

  resetState() {
    // Reset flag counters
    this.flagCounters.forEach(({ el, counterEl }) => {
      el.classList.remove('is-animating', 'animation-complete');
      if (counterEl) counterEl.textContent = '0%';
    });

    // Reset factory cards
    this.factoryData.forEach(({ el, checkbox, scoreEl, aiHint }) => {
      el.classList.remove('is-revealing', 'is-visible', 'selected', 'is-selecting', 'has-top-match');
      if (checkbox) checkbox.checked = false;
      if (scoreEl) scoreEl.textContent = '0%';
      if (aiHint) {
        aiHint.classList.remove('is-revealing', 'is-visible');
      }
    });

    // Reset buttons and counts
    if (this.selectionBar) {
      this.selectionBar.classList.remove('is-active');
    }
    if (this.quoteBtn) {
      this.quoteBtn.classList.remove('is-active');
    }
    if (this.quoteCount) {
      this.quoteCount.textContent = '0';
    }
    if (this.selectionCount) {
      this.selectionCount.textContent = '0';
    }
  }

  wait(duration) {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }
}

class StepThreeAutoDemo {
  constructor(root) {
    this.root = root;
    this.progressFill = root.querySelector('[data-progress-fill]');
    this.progressLabel = root.querySelector('[data-progress-label]');
    this.unitsEl = root.querySelector('[data-units-count]');
    this.confidenceEl = root.querySelector('[data-confidence]');
    this.stageLabel = root.querySelector('[data-stage-label]');
    this.statusChip = root.querySelector('[data-status-chip]');
    this.qcFeed = root.querySelector('[data-qc-feed]');
    this.qcEmpty = root.querySelector('[data-qc-empty]');
    this.milestones = {
      cutting: root.querySelector('[data-milestone="cutting"]'),
      sewing: root.querySelector('[data-milestone="sewing"]'),
      qc: root.querySelector('[data-milestone="qc"]'),
      finishing: root.querySelector('[data-milestone="finishing"]'),
    };
    this.sequenceRunning = false;
    this.inView = false;
    this.runId = 0;
    this.holdDuration = 4000;
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

  async restart() {
    this.runId += 1;
    this.inView = false;
    this.sequenceRunning = false;
    this.root.classList.add('is-resetting');
    this.resetState();
    await this.wait(50);
    this.root.classList.remove('is-resetting');
    await this.wait(50);
    this.inView = true;
    this.start();
  }

  async runLoop() {
    const currentRunId = this.runId;
    this.resetState();
    await this.wait(300);
    if (!this.inView || this.runId !== currentRunId) {
      this.sequenceRunning = false;
      return;
    }

    while (this.inView && this.runId === currentRunId) {
      await this.playOnce(currentRunId);
      if (!this.inView || this.runId !== currentRunId) break;
    }

    this.sequenceRunning = false;
  }

  async fadeToInitial() {
    this.root.classList.add('is-resetting');
    await this.wait(420);
    this.resetState();
    this.root.classList.remove('is-resetting');
    await this.wait(180);
  }

  async playOnce(currentRunId) {
    if (!this.inView || this.runId !== currentRunId) return;
    await this.phaseCutting(currentRunId);
    if (!this.inView || this.runId !== currentRunId) return;
    await this.wait(1000);
    if (!this.inView || this.runId !== currentRunId) return;
    await this.phaseSewing(currentRunId);
    if (!this.inView || this.runId !== currentRunId) return;
    await this.wait(this.holdDuration);
    if (!this.inView || this.runId !== currentRunId) return;
    await this.fadeToInitial();
  }

  async phaseCutting(currentRunId) {
    this.setMilestoneState('cutting', 'active');
    this.setMilestoneState('sewing', 'pending');
    this.setMilestoneState('qc', 'pending');
    this.setMilestoneState('finishing', 'pending');
    if (this.stageLabel) {
      this.stageLabel.textContent = 'Cutting in progress';
    }

    const tasks = [
      this.animateProgress(0, 25, 2000, currentRunId),
      this.animateUnits(0, 4000, 2000, currentRunId),
      this.scheduleQcCard(
        {
          title: 'Panel cutting - 08:15',
          detail: 'Batch 12 · Floor cam',
          photo: 'Pictures/panel_cutting.webp',
        },
        900,
        currentRunId
      ),
    ];
    await Promise.all(tasks);

    this.setMilestoneState('cutting', 'complete');
    this.setMilestoneState('sewing', 'active');
    if (this.stageLabel) {
      this.stageLabel.textContent = 'Cutting complete';
    }
  }

  async phaseSewing(currentRunId) {
    if (this.stageLabel) {
      this.stageLabel.textContent = 'Sewing in progress';
    }

    const tasks = [
      this.animateProgress(25, 40, 2000, currentRunId),
      this.animateUnits(4000, 8100, 2000, currentRunId),
      this.animateConfidence(100, 98, 2000, currentRunId),
      this.scheduleQcCard(
        {
          title: 'Collar stitching - 10:30',
          detail: 'Needle tension check',
          photo: 'Pictures/collar_sewing.jpg',
        },
        1000,
        currentRunId
      ),
    ];
    await Promise.all(tasks);

    this.setMilestoneState('sewing', 'active');
    this.setMilestoneState('qc', 'pending');
    this.setMilestoneState('finishing', 'pending');
  }

  setMilestoneState(key, state) {
    const el = this.milestones[key];
    if (!el) return;
    el.classList.remove('is-active', 'is-complete', 'is-pending');
    if (state === 'active') {
      el.classList.add('is-active');
    } else if (state === 'complete') {
      el.classList.add('is-complete');
    } else {
      el.classList.add('is-pending');
    }
  }

  async scheduleQcCard(card, delay, currentRunId) {
    await this.wait(delay);
    if (!this.inView || this.runId !== currentRunId) return;
    this.addQcCard(card);
  }

  addQcCard({ title, detail, gradient, photo }) {
    if (!this.qcFeed) return;

    if (this.qcEmpty) {
      this.qcEmpty.classList.add('is-hidden');
    }

    const entry = document.createElement('article');
    entry.className = 'qc-entry';

    const photoEl = document.createElement('div');
    photoEl.className = 'qc-photo';
    if (photo) {
      photoEl.classList.add('has-photo');
      photoEl.style.setProperty('--qc-image', `url('${photo}')`);
    } else if (gradient) {
      photoEl.style.setProperty('--qc-gradient', gradient);
    }

    const copy = document.createElement('div');
    const heading = document.createElement('h6');
    heading.textContent = title;
    const detailEl = document.createElement('p');
    detailEl.textContent = detail || 'Live floor update';

    copy.appendChild(heading);
    copy.appendChild(detailEl);

    entry.appendChild(photoEl);
    entry.appendChild(copy);

    this.qcFeed.appendChild(entry);

    requestAnimationFrame(() => {
      entry.classList.add('is-visible');
    });
  }

  clearQcFeed() {
    if (!this.qcFeed) return;
    this.qcFeed.querySelectorAll('.qc-entry').forEach((entry) => entry.remove());
    if (this.qcEmpty) {
      this.qcEmpty.classList.remove('is-hidden');
    }
  }

  animateProgress(start, end, duration, currentRunId) {
    if (!this.progressFill) return Promise.resolve();
    return this.animateBetween(start, end, duration, (value) => {
      this.progressFill.style.width = `${value}%`;
      if (this.progressLabel) {
        this.progressLabel.textContent = `${Math.round(value)}%`;
      }
    }, currentRunId);
  }

  animateUnits(start, end, duration, currentRunId) {
    if (!this.unitsEl) return Promise.resolve();
    return this.animateBetween(start, end, duration, (value) => {
      const rounded = Math.round(value);
      this.unitsEl.textContent = `${this.formatNumber(rounded)} / 25,000`;
    }, currentRunId);
  }

  animateConfidence(start, end, duration, currentRunId) {
    if (!this.confidenceEl) return Promise.resolve();
    return this.animateBetween(start, end, duration, (value) => {
      this.confidenceEl.textContent = `${Math.round(value)}%`;
    }, currentRunId);
  }

  animateBetween(start, end, duration, onUpdate, currentRunId) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const frame = (now) => {
        if (!this.inView || this.runId !== currentRunId) {
          resolve();
          return;
        }
        const progress = Math.min((now - startTime) / duration, 1);
        const value = start + (end - start) * progress;
        onUpdate(value);
        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(frame);
    });
  }

  formatNumber(value) {
    return new Intl.NumberFormat('en-US').format(value);
  }

  resetState() {
    if (this.progressFill) {
      this.progressFill.style.width = '0%';
    }
    if (this.progressLabel) {
      this.progressLabel.textContent = '0%';
    }
    if (this.unitsEl) {
      this.unitsEl.textContent = '0 / 25,000';
    }
    if (this.confidenceEl) {
      this.confidenceEl.textContent = '100%';
    }
    if (this.stageLabel) {
      this.stageLabel.textContent = 'Cutting in progress';
    }
    Object.keys(this.milestones).forEach((key) => {
      if (key === 'cutting') {
        this.setMilestoneState(key, 'active');
      } else {
        this.setMilestoneState(key, 'pending');
      }
    });
    if (this.statusChip) {
      this.statusChip.textContent = 'On track';
    }
    this.clearQcFeed();
  }

  wait(duration) {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }
}

class StepFourAutoDemo {
  constructor(root) {
    this.root = root;
    this.statusChip = root.querySelector('[data-step4-status]');
    this.confidenceEl = root.querySelector('[data-step4-confidence]');
    this.alertBar = root.querySelector('[data-alert-bar]');
    this.alertButton = root.querySelector('[data-alert-button]');
    this.alertTitle = root.querySelector('[data-alert-title]');
    this.alertMessage = root.querySelector('[data-alert-message]');
    this.alertIcon = this.alertBar?.querySelector('.alert-icon');
    this.solutionPanel = root.querySelector('[data-solution-panel]');
    this.approveBtn = root.querySelector('[data-approve-btn]');

    this.sequenceRunning = false;
    this.inView = false;
    this.runId = 0;
    this.holdDuration = 4000;
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

  async restart() {
    this.runId += 1;
    this.inView = false;
    this.sequenceRunning = false;
    this.root.classList.add('is-resetting');
    this.resetState();
    await this.wait(50);
    this.root.classList.remove('is-resetting');
    await this.wait(50);
    this.inView = true;
    this.start();
  }

  async runLoop() {
    const currentRunId = this.runId;
    this.resetState();
    await this.wait(300);
    if (!this.inView || this.runId !== currentRunId) {
      this.sequenceRunning = false;
      return;
    }

    while (this.inView && this.runId === currentRunId) {
      await this.playOnce(currentRunId);
      if (!this.inView || this.runId !== currentRunId) break;
    }

    this.sequenceRunning = false;
  }

  async playOnce(currentRunId) {
    // Initial happy state (1s)
    if (!this.inView || this.runId !== currentRunId) return;
    await this.wait(1000);

    // Step A: THE PROBLEM (1.5s)
    if (!this.inView || this.runId !== currentRunId) return;
    await this.showProblem(currentRunId);
    if (!this.inView || this.runId !== currentRunId) return;
    await this.wait(300);

    // Step B: THE TRIAGE ALERT (1s)
    if (!this.inView || this.runId !== currentRunId) return;
    await this.showTriageAlert();
    if (!this.inView || this.runId !== currentRunId) return;
    await this.wait(1000);

    // Step C: ACTION 1 - Click "View AI Solution" (1s)
    if (!this.inView || this.runId !== currentRunId) return;
    await this.clickAlertButton();
    if (!this.inView || this.runId !== currentRunId) return;
    await this.wait(400);

    // Step D: THE SOLUTION PANEL (1.5s)
    if (!this.inView || this.runId !== currentRunId) return;
    await this.showSolutionPanel();
    if (!this.inView || this.runId !== currentRunId) return;
    await this.wait(1500);

    // Step E: ACTION 2 - Click "Approve Reroute" (1s)
    if (!this.inView || this.runId !== currentRunId) return;
    await this.clickApproveButton();
    if (!this.inView || this.runId !== currentRunId) return;
    await this.wait(600);

    // Step F: THE RESOLUTION (2s)
    if (!this.inView || this.runId !== currentRunId) return;
    await this.showResolution(currentRunId);
    if (!this.inView || this.runId !== currentRunId) return;

    // Hold on recovered state (4s)
    await this.wait(this.holdDuration);
    if (!this.inView || this.runId !== currentRunId) return;

    // Reset and loop
    await this.fadeToInitial();
  }

  async showProblem(currentRunId) {
    // Flash status chip to red
    if (this.statusChip) {
      this.statusChip.textContent = '⚠️ Delay Detected';
      this.statusChip.classList.remove('status-positive');
      this.statusChip.classList.add('status-danger');
    }

    // Animate confidence dropping from 98% to 55%
    await this.animateConfidence(98, 55, 1200, currentRunId);
  }

  async showTriageAlert() {
    // Slide up the alert bar
    if (this.alertBar) {
      this.alertBar.classList.add('is-visible');
    }
  }

  async clickAlertButton() {
    // Flash the "View AI Solution" button
    if (this.alertButton) {
      this.alertButton.classList.add('is-clicked');
      await this.wait(600);
      this.alertButton.classList.remove('is-clicked');
    }
  }

  async showSolutionPanel() {
    // Slide in the solution panel from right
    if (this.solutionPanel) {
      this.solutionPanel.classList.add('is-visible');
    }
  }

  async clickApproveButton() {
    // Flash the "Approve Reroute" button
    if (this.approveBtn) {
      this.approveBtn.classList.add('is-clicked');
      await this.wait(600);
      this.approveBtn.classList.remove('is-clicked');
    }
  }

  async showResolution(currentRunId) {
    // Hide solution panel
    if (this.solutionPanel) {
      this.solutionPanel.classList.remove('is-visible');
    }
    await this.wait(300);

    // Change alert bar to green "Solution Active"
    if (this.alertBar) {
      this.alertBar.classList.add('is-resolved');
    }
    if (this.alertIcon) {
      this.alertIcon.textContent = '✅';
    }
    if (this.alertTitle) {
      this.alertTitle.textContent = 'SOLUTION ACTIVE:';
    }
    if (this.alertMessage) {
      this.alertMessage.textContent = 'Reroute approved. Production rebalancing in progress.';
    }

    // Change status back to "On track"
    if (this.statusChip) {
      this.statusChip.textContent = '✅ On track';
      this.statusChip.classList.remove('status-danger');
      this.statusChip.classList.add('status-positive');
    }

    // Animate confidence climbing from 55% to 96%
    await this.animateConfidence(55, 96, 1500, currentRunId);
  }

  async animateConfidence(start, end, duration, currentRunId) {
    if (!this.confidenceEl) return Promise.resolve();

    return new Promise((resolve) => {
      const startTime = performance.now();

      // Update color class based on confidence level
      const updateColorClass = (value) => {
        this.confidenceEl.classList.remove('metric-positive', 'metric-danger');
        if (value >= 80) {
          this.confidenceEl.classList.add('metric-positive');
        } else {
          this.confidenceEl.classList.add('metric-danger');
        }
      };

      const frame = (now) => {
        if (!this.inView || this.runId !== currentRunId) {
          resolve();
          return;
        }
        const progress = Math.min((now - startTime) / duration, 1);
        const value = start + (end - start) * progress;
        const rounded = Math.round(value);

        this.confidenceEl.textContent = `${rounded}%`;
        updateColorClass(rounded);

        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(frame);
    });
  }

  async fadeToInitial() {
    this.root.classList.add('is-resetting');
    await this.wait(420);
    this.resetState();
    this.root.classList.remove('is-resetting');
    await this.wait(180);
  }

  resetState() {
    // Reset status chip
    if (this.statusChip) {
      this.statusChip.textContent = 'On track';
      this.statusChip.classList.remove('status-danger');
      this.statusChip.classList.add('status-positive');
    }

    // Reset confidence
    if (this.confidenceEl) {
      this.confidenceEl.textContent = '98%';
      this.confidenceEl.classList.remove('metric-danger');
      this.confidenceEl.classList.add('metric-positive');
    }

    // Reset alert bar
    if (this.alertBar) {
      this.alertBar.classList.remove('is-visible', 'is-resolved');
    }
    if (this.alertIcon) {
      this.alertIcon.textContent = '⚠️';
    }
    if (this.alertTitle) {
      this.alertTitle.textContent = 'AI-DE-RISK ACTIVATED:';
    }
    if (this.alertMessage) {
      this.alertMessage.textContent = 'Sewing phase 22% behind schedule.';
    }

    // Reset buttons
    if (this.alertButton) {
      this.alertButton.classList.remove('is-clicked');
    }
    if (this.approveBtn) {
      this.approveBtn.classList.remove('is-clicked');
    }

    // Reset solution panel
    if (this.solutionPanel) {
      this.solutionPanel.classList.remove('is-visible');
    }
  }

  wait(duration) {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }
}

// Store animation instances for restart functionality
window.demoInstances = {};

const stepOneScreen = document.querySelector('.mockup-screen[data-step="step-1"]');
if (stepOneScreen) {
  window.demoInstances['step-1'] = new StepOneAutoDemo(stepOneScreen);
}

const stepTwoScreen = document.querySelector('.mockup-screen[data-step="step-2"]');
if (stepTwoScreen) {
  window.demoInstances['step-2'] = new StepTwoAutoDemo(stepTwoScreen);
}

const stepThreeScreen = document.querySelector('.mockup-screen[data-step="step-3"]');
if (stepThreeScreen) {
  window.demoInstances['step-3'] = new StepThreeAutoDemo(stepThreeScreen);
}

const stepFourScreen = document.querySelector('.mockup-screen[data-step="step-4"]');
if (stepFourScreen) {
  window.demoInstances['step-4'] = new StepFourAutoDemo(stepFourScreen);
}

const waitlistForm = document.querySelector('[data-formspree]');
if (waitlistForm) {
  const statusEl = waitlistForm.querySelector('[data-form-status]');
  const submitBtn = waitlistForm.querySelector('button[type="submit"]');

  const setStatus = (message, variant = 'neutral') => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.statusVariant = variant;
  };

  waitlistForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(waitlistForm);
    submitBtn.disabled = true;
    setStatus('Sending…');

    try {
      const response = await fetch(waitlistForm.action, {
        method: waitlistForm.method,
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      waitlistForm.reset();
      setStatus('Thanks! We added you to the waitlist.', 'success');
    } catch (error) {
      setStatus('Something went wrong—please try again or email us.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}
