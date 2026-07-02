document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menuBtn');
  const ghLinks = document.getElementById('ghLinks');

  if (menuBtn && ghLinks) {
    menuBtn.addEventListener('click', () => {
      ghLinks.classList.toggle('open');
      menuBtn.classList.toggle('active');
    });
    ghLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        ghLinks.classList.remove('open');
        menuBtn.classList.remove('active');
      });
    });
  }

  // --- Navbar scroll effect (Adyen-style solid on scroll) ---
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (navbar) {
      navbar.classList.toggle('scrolled', y > 10);
    }
    lastScroll = y;
  }, { passive: true });

  // --- Word-by-word reveal for headlines with .word-reveal ---
  document.querySelectorAll('.word-reveal').forEach((el) => {
    const html = el.innerHTML;
    // Wrap each word in a span; preserve <br> and <span> tags
    const parts = html.split(/(<[^>]+>)/);
    let wordIndex = 0;
    const rebuilt = parts.map((part) => {
      if (part.startsWith('<')) return part; // keep tags
      return part.split(/(\s+)/).map((frag) => {
        if (/^\s+$/.test(frag) || frag === '') return frag;
        const delay = wordIndex * 0.07;
        wordIndex++;
        return '<span class="word" style="transition-delay:' + delay.toFixed(2) + 's">' + frag + '</span>';
      }).join('');
    }).join('');
    el.innerHTML = rebuilt;
  });

  // --- Intersection Observer for [data-animate], [data-stagger], .word-reveal ---
  const animatedEls = document.querySelectorAll('[data-animate], [data-stagger], .word-reveal');
  const animObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          animObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  animatedEls.forEach((el) => animObs.observe(el));

  // --- Parallax on scroll for [data-parallax] ---
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length) {
    const updateParallax = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        const center = rect.top + rect.height / 2;
        const offset = (center - vh / 2) * speed;
        el.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
      });
      requestAnimationFrame(updateParallax);
    };
    requestAnimationFrame(updateParallax);
  }

  // --- Stat counters with Adyen-style smooth easing ---
  const statEls = document.querySelectorAll('.stat-num[data-count]');
  const counterObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateNum(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  statEls.forEach((el) => counterObs.observe(el));

  function animateNum(el) {
    const raw = el.getAttribute('data-count');
    const target = parseFloat(raw);
    const isFloat = raw.includes('.');
    const suffix = el.textContent.replace(/[0-9.]/g, '');
    const dur = 2000;
    const start = performance.now();

    (function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      // Adyen-style smooth deceleration
      const ease = 1 - Math.pow(1 - t, 4);
      const val = isFloat ? (target * ease).toFixed(1) : Math.round(target * ease);
      el.textContent = val + suffix;
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }

  // ========================================================
  // HERO INLINE FORM HANDLER
  // ========================================================
  const heroForm = document.getElementById('heroForm');
  const heroFormSuccess = document.getElementById('heroFormSuccess');

  if (heroForm) {
    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Clear previous errors
      heroForm.querySelectorAll('input.error').forEach((el) => el.classList.remove('error'));

      const name = heroForm.heroName.value.trim();
      const email = heroForm.heroEmail.value.trim();
      const phone = heroForm.heroPhone.value.trim();
      let ok = true;

      if (!name) { heroForm.heroName.classList.add('error'); ok = false; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { heroForm.heroEmail.classList.add('error'); ok = false; }
      if (!phone) { heroForm.heroPhone.classList.add('error'); ok = false; }
      if (!ok) return;

      const btn = heroForm.querySelector('.hero-form-submit');
      btn.querySelector('.btn-text').style.display = 'none';
      btn.querySelector('.btn-spinner').style.display = 'flex';
      btn.disabled = true;

      const body = [
        'Name: ' + name,
        'Email: ' + email,
        'Phone: ' + phone
      ].join('\n');

      fetch('https://formsubmit.co/ajax/admin@mathrix.co.uk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone,
          _subject: 'Free Demo Request from ' + name,
          message: body
        })
      }).catch(() => {});

      setTimeout(() => {
        heroForm.style.display = 'none';
        heroFormSuccess.style.display = 'block';
      }, 1200);
    });
  }

  // ========================================================
  // HERO DEVICE MOCKUPS — Start in finished app state (no code animation)
  // ========================================================
  // The devices now start with .fade-in class in the HTML, so the app UI is
  // visible immediately. No typing animation needed.

  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();

      const name = form.fullName.value.trim();
      const email = form.workEmail.value.trim();
      const company = form.company.value.trim();
      const projectType = form.projectType.value;
      const budget = form.budget.value;
      let ok = true;

      if (!name) {
        err('fullName', 'Enter your name.');
        ok = false;
      }
      if (!email) {
        err('workEmail', 'Enter your email.');
        ok = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        err('workEmail', 'Enter a valid email.');
        ok = false;
      }
      if (!company) {
        err('company', 'Enter your company.');
        ok = false;
      }
      if (!projectType) {
        err('projectType', 'Select a project type.');
        ok = false;
      }
      if (!budget) {
        err('budget', 'Select a budget range.');
        ok = false;
      }

      if (!ok) return;

      const btn = form.querySelector('.submit-btn');
      btn.querySelector('.btn-text').style.display = 'none';
      btn.querySelector('.btn-spinner').style.display = 'flex';
      btn.disabled = true;

      const formData = new FormData(form);
      const body = [
        'Name: ' + (formData.get('fullName') || ''),
        'Email: ' + (formData.get('workEmail') || ''),
        'Mobile: ' + (formData.get('mobile') || ''),
        'Company: ' + (formData.get('company') || ''),
        'Project Type: ' + (formData.get('projectType') || ''),
        'Budget: ' + (formData.get('budget') || ''),
        'Message: ' + (formData.get('message') || '')
      ].join('\n');

      fetch('https://formsubmit.co/ajax/admin@mathrix.co.uk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: formData.get('fullName'),
          email: formData.get('workEmail'),
          phone: formData.get('mobile'),
          company: formData.get('company'),
          _subject: 'New AutoLabs Enquiry from ' + formData.get('fullName'),
          message: body
        })
      }).catch(() => {});

      setTimeout(() => {
        form.style.display = 'none';
        success.style.display = 'block';
      }, 1400);
    });
  }

  function err(id, msg) {
    const field = document.getElementById(id);
    const errEl = document.getElementById(id + 'Error');
    if (field) field.classList.add('error');
    if (errEl) errEl.textContent = msg;
  }

  function clearErrors() {
    document.querySelectorAll('.form-error').forEach((e) => {
      e.textContent = '';
    });
    document.querySelectorAll('.error').forEach((e) => {
      e.classList.remove('error');
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (a.getAttribute('href') === '#audit') return;
      const t = document.querySelector(a.getAttribute('href'));
      if (t) {
        e.preventDefault();
        t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // FAQ Accordion
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      // Close all others
      document.querySelectorAll('.faq-question').forEach((other) => {
        other.setAttribute('aria-expanded', 'false');
        other.nextElementSibling.style.maxHeight = null;
      });
      // Toggle current
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        const answer = btn.nextElementSibling;
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // Demo modal
  const demoModal = document.getElementById('demoModal');
  const openBtn = document.getElementById('openDemoModal');
  const closeBtn = document.getElementById('closeDemoModal');
  const demoForm = document.getElementById('demoForm');
  const demoSuccess = document.getElementById('demoSuccess');

  if (openBtn && demoModal) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      demoModal.classList.add('active');
    });
    closeBtn.addEventListener('click', () => demoModal.classList.remove('active'));
    demoModal.addEventListener('click', (e) => {
      if (e.target === demoModal) demoModal.classList.remove('active');
    });
  }

  if (demoForm) {
    demoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(demoForm);
      const body = [
        'Name: ' + (fd.get('demoName') || ''),
        'Email: ' + (fd.get('demoEmail') || ''),
        'Phone: ' + (fd.get('demoPhone') || ''),
        'Business: ' + (fd.get('demoBusiness') || ''),
        'Details: ' + (fd.get('demoDetails') || '')
      ].join('\n');

      fetch('https://formsubmit.co/ajax/admin@mathrix.co.uk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: fd.get('demoName'),
          email: fd.get('demoEmail'),
          _subject: 'Free Demo Request from ' + fd.get('demoName'),
          message: body
        })
      }).catch(() => {});

      demoForm.style.display = 'none';
      demoSuccess.style.display = 'block';
    });
  }

  // ========================================================
  // HERO TABS
  // ========================================================
  const heroTabAudit = document.getElementById('heroTabAudit');
  const heroTabDemo = document.getElementById('heroTabDemo');
  const heroAuditPanel = document.getElementById('heroAuditPanel');
  const heroDemoPanel = document.getElementById('heroDemoPanel');

  function activateHeroTab(tab) {
    const isAudit = tab === 'audit';
    if (heroTabAudit) {
      heroTabAudit.classList.toggle('active', isAudit);
      heroTabAudit.setAttribute('aria-selected', isAudit ? 'true' : 'false');
    }
    if (heroTabDemo) {
      heroTabDemo.classList.toggle('active', !isAudit);
      heroTabDemo.setAttribute('aria-selected', !isAudit ? 'true' : 'false');
    }
    if (heroAuditPanel) {
      heroAuditPanel.classList.toggle('active', isAudit);
      heroAuditPanel.hidden = !isAudit;
    }
    if (heroDemoPanel) {
      heroDemoPanel.classList.toggle('active', !isAudit);
      heroDemoPanel.hidden = isAudit;
    }
  }

  if (heroTabAudit && heroTabDemo) {
    heroTabAudit.addEventListener('click', () => activateHeroTab('audit'));
    heroTabDemo.addEventListener('click', () => activateHeroTab('demo'));
  }

  document.querySelectorAll('a[href="#audit"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      activateHeroTab('audit');
      const hero = document.getElementById('hero');
      if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const auditScrollToHero = document.getElementById('auditScrollToHero');
  if (auditScrollToHero) {
    auditScrollToHero.addEventListener('click', (e) => {
      e.preventDefault();
      activateHeroTab('audit');
      const hero = document.getElementById('hero');
      if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // ========================================================
  // FREE WEBSITE AUDIT
  // ========================================================
  const heroAuditForm = document.getElementById('heroAuditForm');
  const heroAuditUrlInput = document.getElementById('heroAuditUrl');
  const heroAuditSubmitBtn = document.getElementById('heroAuditSubmitBtn');
  const heroAuditError = document.getElementById('heroAuditError');
  const heroAuditResults = document.getElementById('heroAuditResults');
  const auditResults = document.getElementById('auditResults');
  const auditSectionIntro = document.getElementById('auditSectionIntro');
  const auditModal = document.getElementById('auditModal');
  const closeAuditModal = document.getElementById('closeAuditModal');
  const auditContactForm = document.getElementById('auditContactForm');
  const auditContactSuccess = document.getElementById('auditContactSuccess');
  const auditModalUrl = document.getElementById('auditModalUrl');
  const auditModalMessage = document.getElementById('auditModalMessage');

  const auditPanels = [
    {
      results: heroAuditResults,
      scoreRing: document.getElementById('heroAuditScoreRing'),
      scoreValue: document.getElementById('heroAuditScoreValue'),
      scoreHeadline: document.getElementById('heroAuditScoreHeadline'),
      scoreSummary: document.getElementById('heroAuditScoreSummary'),
      urlDisplay: document.getElementById('heroAuditUrlDisplay'),
      passList: document.getElementById('heroAuditPassList'),
      issueList: document.getElementById('heroAuditIssueList'),
      form: heroAuditForm
    },
    {
      results: auditResults,
      scoreRing: document.getElementById('auditScoreRing'),
      scoreValue: document.getElementById('auditScoreValue'),
      scoreHeadline: document.getElementById('auditScoreHeadline'),
      scoreSummary: document.getElementById('auditScoreSummary'),
      urlDisplay: document.getElementById('auditUrlDisplay'),
      passList: document.getElementById('auditPassList'),
      issueList: document.getElementById('auditIssueList'),
      form: null
    }
  ].filter((panel) => panel.results);

  let lastAuditResult = null;

  function normalizeUrl(value) {
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return 'https://' + trimmed;
  }

  function scoreClass(score) {
    if (score >= 75) return 'score-good';
    if (score >= 50) return 'score-warn';
    return 'score-bad';
  }

  function scoreHeadline(score) {
    if (score >= 75) return 'Looking good — a few tweaks could help';
    if (score >= 50) return 'Room for improvement';
    return 'Your site needs attention';
  }

  function renderAuditList(listEl, checks, emptyMessage) {
    if (!listEl) return;
    listEl.innerHTML = '';
    if (checks.length === 0) {
      const li = document.createElement('li');
      li.className = 'pass';
      li.textContent = emptyMessage;
      listEl.appendChild(li);
      return;
    }
    checks.forEach((check) => {
      const li = document.createElement('li');
      li.className = check.status;
      li.innerHTML = '<strong>' + check.label + '</strong> — ' + check.message;
      listEl.appendChild(li);
    });
  }

  function renderAuditResults(result) {
    lastAuditResult = result;
    const passChecks = result.checks.filter((c) => c.status === 'pass');
    const issueChecks = result.checks.filter((c) => c.status !== 'pass');
    const summaryText = 'We checked ' + result.checks.length + ' SEO, performance, and mobile signals.';

    auditPanels.forEach((panel) => {
      panel.results.hidden = false;
      if (panel.scoreValue) panel.scoreValue.textContent = String(result.score);
      if (panel.scoreRing) panel.scoreRing.className = 'audit-score-ring ' + scoreClass(result.score);
      if (panel.scoreHeadline) panel.scoreHeadline.textContent = scoreHeadline(result.score);
      if (panel.scoreSummary) panel.scoreSummary.textContent = summaryText;
      if (panel.urlDisplay) panel.urlDisplay.textContent = result.url;
      renderAuditList(panel.passList, passChecks, 'No passing checks yet.');
      renderAuditList(
        panel.issueList,
        issueChecks,
        issueChecks.length === 0 ? 'All checks passed — your site is in great shape.' : ''
      );
    });

    if (auditSectionIntro) auditSectionIntro.textContent = 'Full breakdown for ' + result.url;
  }

  function setAuditLoading(loading, submitBtn) {
    if (!submitBtn) return;
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');
    if (btnText) btnText.style.display = loading ? 'none' : 'inline';
    if (btnSpinner) btnSpinner.style.display = loading ? 'flex' : 'none';
    submitBtn.disabled = loading;
  }

  async function handleAuditSubmit(e, urlInput, errorEl, submitBtn) {
    e.preventDefault();
    if (errorEl) errorEl.textContent = '';
    if (urlInput) urlInput.classList.remove('error');

    const rawUrl = urlInput ? urlInput.value.trim() : '';
    if (!rawUrl) {
      if (urlInput) urlInput.classList.add('error');
      if (errorEl) errorEl.textContent = 'Please enter your website URL.';
      return;
    }

    const url = normalizeUrl(rawUrl);
    setAuditLoading(true, submitBtn);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Audit failed. Please try again.');
      }

      renderAuditResults(data);
      if (auditResults) {
        auditResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      if (errorEl) errorEl.textContent = err.message || 'Something went wrong. Please try again.';
    } finally {
      setAuditLoading(false, submitBtn);
    }
  }

  if (heroAuditForm) {
    heroAuditForm.addEventListener('submit', (e) => {
      handleAuditSubmit(e, heroAuditUrlInput, heroAuditError, heroAuditSubmitBtn);
    });
  }

  function openAuditModal() {
    if (!auditModal || !lastAuditResult) return;
    auditModal.classList.add('active');
    if (auditModalUrl) auditModalUrl.value = lastAuditResult.url;
    if (auditModalMessage) auditModalMessage.value = lastAuditResult.summary;
    if (auditContactForm) auditContactForm.style.display = 'flex';
    if (auditContactSuccess) auditContactSuccess.style.display = 'none';
  }

  function closeAuditModalFn() {
    if (auditModal) auditModal.classList.remove('active');
  }

  document.querySelectorAll('#auditImproveBtn, #heroAuditImproveBtn').forEach((btn) => {
    btn.addEventListener('click', openAuditModal);
  });

  if (auditModal) {
    if (closeAuditModal) closeAuditModal.addEventListener('click', closeAuditModalFn);
    auditModal.addEventListener('click', (e) => {
      if (e.target === auditModal) closeAuditModalFn();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && auditModal && auditModal.classList.contains('active')) {
      closeAuditModalFn();
    }
  });

  if (auditContactForm) {
    auditContactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(auditContactForm);
      const name = fd.get('auditName') || '';
      const body = [
        'Name: ' + name,
        'Email: ' + (fd.get('auditEmail') || ''),
        'Phone: ' + (fd.get('auditPhone') || ''),
        'Website: ' + (fd.get('auditWebsite') || ''),
        '',
        fd.get('auditMessage') || ''
      ].join('\n');

      fetch('https://formsubmit.co/ajax/admin@mathrix.co.uk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: fd.get('auditEmail'),
          phone: fd.get('auditPhone'),
          _subject: 'Website Audit — Improve Request from ' + name,
          message: body
        })
      }).catch(() => {});

      auditContactForm.style.display = 'none';
      auditContactSuccess.style.display = 'block';
    });
  }
});
