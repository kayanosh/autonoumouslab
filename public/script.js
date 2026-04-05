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
  // HERO CODE → APP MORPH ANIMATION
  // ========================================================
  const laptopCodeLines = [
    '<span class="ck">import</span> <span class="cv">React</span> <span class="ck">from</span> <span class="cs">"react"</span>;',
    '<span class="ck">import</span> { <span class="cv">motion</span> } <span class="ck">from</span> <span class="cs">"framer-motion"</span>;',
    '',
    '<span class="ck">export default function</span> <span class="cf">App</span>() {',
    '  <span class="ck">return</span> (',
    '    &lt;<span class="ct">motion.div</span>',
    '      <span class="ca">initial</span>={{ <span class="ca">opacity</span>: <span class="cn">0</span> }}',
    '      <span class="ca">animate</span>={{ <span class="ca">opacity</span>: <span class="cn">1</span> }}',
    '      <span class="ca">className</span>=<span class="cs">"app-container"</span>',
    '    &gt;',
    '      &lt;<span class="ct">Navbar</span> /&gt;',
    '      &lt;<span class="ct">Hero</span>',
    '        <span class="ca">title</span>=<span class="cs">"Build amazing"</span>',
    '        <span class="ca">cta</span>=<span class="cs">"Get started"</span>',
    '      /&gt;',
    '      &lt;<span class="ct">Features</span> <span class="ca">columns</span>={<span class="cn">3</span>} /&gt;',
    '    &lt;/<span class="ct">motion.div</span>&gt;',
    '  );',
    '}',
  ];

  const phoneCodeLines = [
    '<span class="ck">const</span> <span class="cf">Home</span> = () =&gt; {',
    '  <span class="ck">return</span> (',
    '    &lt;<span class="ct">View</span> <span class="ca">style</span>={<span class="cv">styles</span>}&gt;',
    '      &lt;<span class="ct">Avatar</span> /&gt;',
    '      &lt;<span class="ct">Search</span>',
    '        <span class="ca">placeholder</span>=<span class="cs">"Search"</span>',
    '      /&gt;',
    '      &lt;<span class="ct">CardRow</span> /&gt;',
    '      &lt;<span class="ct">List</span>',
    '        <span class="ca">data</span>={<span class="cv">items</span>}',
    '      /&gt;',
    '      &lt;<span class="ct">TabBar</span> /&gt;',
    '    &lt;/<span class="ct">View</span>&gt;',
    '  );',
    '};',
  ];

  function runHeroAnimation() {
    const laptopBody = document.getElementById('laptopCodeBody');
    const phoneBody = document.getElementById('phoneCodeBody');
    const laptopGutter = document.getElementById('laptopGutter');
    const laptopCursor = document.getElementById('laptopCursor');
    const phoneCursor = document.getElementById('phoneCursor');
    const laptopCodeEl = document.getElementById('laptopCode');
    const laptopAppEl = document.getElementById('laptopApp');
    const phoneCodeEl = document.getElementById('phoneCode');
    const phoneAppEl = document.getElementById('phoneApp');

    if (!laptopBody || !phoneBody) return;

    let laptopLineIdx = 0;
    let phoneLineIdx = 0;
    let laptopCharIdx = 0;
    let phoneCharIdx = 0;
    let laptopCurrentHTML = '';
    let phoneCurrentHTML = '';

    // Type a line character by character (uses innerHTML for syntax colors)
    function typeLine(lines, lineIdx, charIdx, bodyEl, gutterEl, cursorEl, isPhone, cb) {
      if (lineIdx >= lines.length) { cb(); return; }
      const line = lines[lineIdx];
      const plainText = line.replace(/<[^>]+>/g, '');

      if (charIdx === 0 && gutterEl) {
        const num = document.createElement('span');
        num.textContent = lineIdx + 1;
        gutterEl.appendChild(num);
      }

      if (charIdx >= plainText.length) {
        // Finish this line
        if (isPhone) {
          phoneCurrentHTML += line + '\n';
          bodyEl.innerHTML = phoneCurrentHTML;
        } else {
          laptopCurrentHTML += line + '\n';
          bodyEl.innerHTML = laptopCurrentHTML;
        }
        // Move cursor
        if (cursorEl) {
          const lineH = isPhone ? 9 : 16;
          const topOffset = isPhone ? 24 : 48;
          cursorEl.style.top = topOffset + (lineIdx + 1) * lineH + 'px';
        }
        setTimeout(() => typeLine(lines, lineIdx + 1, 0, bodyEl, gutterEl, cursorEl, isPhone, cb), 40 + Math.random() * 30);
        return;
      }

      // Build partial line: show full syntax-highlighted HTML up to charIdx
      let shown = 0;
      let partialHTML = '';
      let inTag = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '<') { inTag = true; partialHTML += line[i]; continue; }
        if (line[i] === '>') { inTag = false; partialHTML += line[i]; continue; }
        if (inTag) { partialHTML += line[i]; continue; }
        if (shown < charIdx + 1) {
          partialHTML += line[i];
          shown++;
        }
      }

      const allPrev = isPhone ? phoneCurrentHTML : laptopCurrentHTML;
      bodyEl.innerHTML = allPrev + partialHTML;

      // Move cursor horizontally
      if (cursorEl) {
        const charW = isPhone ? 3.3 : 6;
        const leftOffset = isPhone ? 10 : 40;
        const lineH = isPhone ? 9 : 16;
        const topOffset = isPhone ? 24 : 48;
        cursorEl.style.left = leftOffset + (charIdx + 1) * charW + 'px';
        cursorEl.style.top = topOffset + lineIdx * lineH + 'px';
      }

      const speed = 18 + Math.random() * 22;
      setTimeout(() => typeLine(lines, lineIdx, charIdx + 1, bodyEl, gutterEl, cursorEl, isPhone, cb), speed);
    }

    // Start both typing in parallel
    let laptopDone = false;
    let phoneDone = false;

    function checkMorph() {
      if (laptopDone && phoneDone) {
        // Flash effect then morph
        setTimeout(() => {
          // Hide cursors
          if (laptopCursor) laptopCursor.style.display = 'none';
          if (phoneCursor) phoneCursor.style.display = 'none';

          // Brief white flash
          laptopCodeEl.style.filter = 'brightness(1.8)';
          phoneCodeEl.style.filter = 'brightness(1.8)';

          setTimeout(() => {
            laptopCodeEl.style.filter = '';
            phoneCodeEl.style.filter = '';
            // Cross-fade: code out, app in
            laptopCodeEl.classList.add('fade-out');
            phoneCodeEl.classList.add('fade-out');
            laptopAppEl.classList.add('fade-in');
            phoneAppEl.classList.add('fade-in');
          }, 300);
        }, 600);
      }
    }

    typeLine(laptopCodeLines, 0, 0, laptopBody, laptopGutter, laptopCursor, false, () => {
      laptopDone = true;
      checkMorph();
    });

    setTimeout(() => {
      typeLine(phoneCodeLines, 0, 0, phoneBody, null, phoneCursor, true, () => {
        phoneDone = true;
        checkMorph();
      });
    }, 400); // Phone starts slightly after laptop
  }

  // Start hero animation when hero is visible
  const heroDevices = document.querySelector('.hero-devices');
  if (heroDevices) {
    const heroObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(runHeroAnimation, 500);
          heroObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    heroObs.observe(heroDevices);
  }

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
});
