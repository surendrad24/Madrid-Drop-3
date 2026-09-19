(function () {
  function fitStickySummaryCopy() {
    const stickyBar = document.getElementById('phStickyBar');
    if (!stickyBar) return;

    const title = stickyBar.querySelector('.ph-sticky-pdp-product-title');
    const price = stickyBar.querySelector('.ph-sticky-summary-price');
    const subtitle = stickyBar.querySelector('.ph-sticky-pdp-product-subtitle');
    if (!title || !price) return;

    const setStyleValue = (node, property, value) => {
      if (node.style[property] !== value) {
        node.style[property] = value;
      }
    };

    if (window.innerWidth >= 768) {
      setStyleValue(title, 'fontSize', '');
      setStyleValue(title, 'letterSpacing', '');
      setStyleValue(price, 'fontSize', '');
      setStyleValue(price, 'letterSpacing', '');
      if (subtitle) {
        setStyleValue(subtitle, 'fontSize', '');
        setStyleValue(subtitle, 'letterSpacing', '');
      }
      return;
    }

    const width = Math.min(window.innerWidth || 375, document.documentElement.clientWidth || 375);
    let size = Math.min(12, Math.max(11, width * 0.032));
    let spacing = Math.min(1, Math.max(0.65, width * 0.0028));
    const minSize = 9.5;
    const minSpacing = 0.2;

    const applyType = () => {
      setStyleValue(title, 'fontSize', `${size}px`);
      setStyleValue(title, 'letterSpacing', `${spacing}px`);
      setStyleValue(price, 'fontSize', `${size}px`);
      setStyleValue(price, 'letterSpacing', `${spacing}px`);
    };

    applyType();

    for (let guard = 0; title.scrollWidth > title.clientWidth && guard < 36; guard += 1) {
      if (spacing > minSpacing) {
        spacing = Math.max(minSpacing, spacing - 0.1);
      } else if (size > minSize) {
        size = Math.max(minSize, size - 0.25);
      } else {
        break;
      }
      applyType();
    }

    if (!subtitle) return;

    let subtitleSize = Math.min(8, Math.max(8, width * 0.024));
    let subtitleSpacing = Math.min(2, Math.max(1.35, width * 0.005));
    const minSubtitleSize = 7;
    const minSubtitleSpacing = 0.2;
    const applySubtitleType = () => {
      setStyleValue(subtitle, 'fontSize', `${subtitleSize}px`);
      setStyleValue(subtitle, 'letterSpacing', `${subtitleSpacing}px`);
    };

    applySubtitleType();

    for (let guard = 0; subtitle.scrollWidth > subtitle.clientWidth && guard < 56; guard += 1) {
      if (subtitleSpacing > minSubtitleSpacing) {
        subtitleSpacing = Math.max(minSubtitleSpacing, subtitleSpacing - 0.15);
      } else if (subtitleSize > minSubtitleSize) {
        subtitleSize = Math.max(minSubtitleSize, subtitleSize - 0.25);
      } else {
        break;
      }
      applySubtitleType();
    }
  }

  function bindStickyFit() {
    fitStickySummaryCopy();
    window.addEventListener('resize', fitStickySummaryCopy);

    const stickyBar = document.getElementById('phStickyBar');
    if (stickyBar) {
      new MutationObserver(fitStickySummaryCopy).observe(stickyBar, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(fitStickySummaryCopy).catch(() => {});
    }
  }

  window.phPdpFitStickySummaryCopy = fitStickySummaryCopy;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindStickyFit, { once: true });
  } else {
    bindStickyFit();
  }
}());
