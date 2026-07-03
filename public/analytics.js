(function () {
  const domain = document.documentElement.dataset.analyticsDomain || window.location.hostname;

  window.dataLayer = window.dataLayer || [];

  function track(eventName, props) {
    const payload = Object.assign({ event: eventName, page: location.pathname }, props || {});
    window.dataLayer.push(payload);

    if (typeof window.plausible === 'function') {
      window.plausible(eventName, { props: props || {} });
    }
  }

  window.trackEvent = track;

  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-track]');
    if (!el) return;
    track(el.dataset.track, {
      label: el.dataset.trackLabel || el.textContent.trim().slice(0, 80),
      href: el.getAttribute('href') || undefined,
    });
  });

  document.addEventListener('DOMContentLoaded', function () {
    track('page_view', { domain: domain });

    const plausibleScript = document.getElementById('plausible-script');
    if (plausibleScript && domain && domain !== 'localhost') {
      const script = document.createElement('script');
      script.defer = true;
      script.dataset.domain = domain;
      script.src = plausibleScript.dataset.src || 'https://plausible.io/js/script.js';
      document.head.appendChild(script);
    }
  });
})();
