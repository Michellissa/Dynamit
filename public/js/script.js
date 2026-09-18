// ============================================================
// script.js – Dynamit Bygg v3
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ----------------------------------------------------------
  // 1. Navbar Scroll Effect
  // ----------------------------------------------------------
  const navbar = document.querySelector('.navbar');

  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll);
  handleNavbarScroll();

  // ----------------------------------------------------------
  // 2. Hamburger Menu Toggle
  // ----------------------------------------------------------
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const allNavLinks = document.querySelectorAll('.nav-links a');

  function toggleMenu() {
    if (!hamburger || !navLinks) return;
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  }

  function closeMenu() {
    if (!hamburger || !navLinks) return;
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleMenu);
  }

  allNavLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // ----------------------------------------------------------
  // 3. Mega Menu Dropdown
  // ----------------------------------------------------------
  const dropdownToggle = document.querySelector('.nav-dropdown-toggle');
  const dropdown = document.querySelector('.nav-dropdown');

  if (dropdownToggle && dropdown) {
    dropdownToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropdown.classList.toggle('open');
      dropdownToggle.setAttribute('aria-expanded', dropdown.classList.contains('open'));
    });

    // Mobile: accordion sub-categories
    const megaCols = document.querySelectorAll('.mega-col');
    megaCols.forEach(col => {
      const heading = col.querySelector('.mega-heading');
      if (heading) {
        heading.addEventListener('click', () => {
          col.classList.toggle('open');
        });
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
        dropdownToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdown.classList.contains('open')) {
        dropdown.classList.remove('open');
        dropdownToggle.setAttribute('aria-expanded', 'false');
        dropdownToggle.focus();
      }
    });
  }

  // ----------------------------------------------------------
  // 4. Contact Form
  // ----------------------------------------------------------
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const submitBtn = form.querySelector('button[type="submit"]');
      const messageBox = form.querySelector('.form-message') || createMessageElement(form);
      const data = Object.fromEntries(new FormData(form));

      setButtonLoading(submitBtn, true);
      messageBox.textContent = '';
      messageBox.className = 'form-message';

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed');
        showMessage(messageBox, 'success', 'Meddelande skickat! Vi återkommer snart.');
        form.reset();
      } catch (err) {
        showMessage(messageBox, 'error', err.message || 'Ett fel inträffade. Försök igen senare.');
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }

  // ----------------------------------------------------------
  // 4. Quote Form
  // ----------------------------------------------------------
  const quoteForm = document.getElementById('quoteForm');

  if (quoteForm) {
    quoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const submitBtn = form.querySelector('button[type="submit"]');
      const messageBox = form.querySelector('.form-message') || createMessageElement(form);
      const formData = new FormData(form);
      const data = {};
      const files = [];

      for (const [key, value] of formData.entries()) {
        if (value instanceof File && value.size > 0) {
          files.push({ key, file: value });
        } else if (!(value instanceof File)) {
          data[key] = value;
        }
      }

      setButtonLoading(submitBtn, true);
      messageBox.textContent = '';
      messageBox.className = 'form-message';

      try {
        if (files.length > 0) {
          const uploadData = new FormData();
          files.forEach(f => uploadData.append('bilder', f.file));
          const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadData });
          if (!uploadRes.ok) throw new Error('Filuppladdning misslyckades');
          const uploadResult = await uploadRes.json();
          data.bilder = uploadResult.files.map(f => f.url);
        }

        const response = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed');

        form.style.display = 'none';
        const successDiv = document.getElementById('quoteSuccess');
        if (successDiv) {
          successDiv.style.display = 'block';
        } else {
          showMessage(messageBox, 'success', 'Offertforfragans skickad! Vi atar som mojligt.');
        }
      } catch (err) {
        showMessage(messageBox, 'error', err.message || 'Ett fel inträffade. Försök igen senare.');
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }

  // ----------------------------------------------------------
  // 5. Smooth Scroll for Anchor Links
  // ----------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;
      e.preventDefault();
      const navbarHeight = navbar ? navbar.offsetHeight : 80;
      const top = targetEl.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ----------------------------------------------------------
  // 6. Scroll to Top Button
  // ----------------------------------------------------------
  let scrollToTopBtn = document.querySelector('.scroll-to-top');

  if (!scrollToTopBtn) {
    scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.setAttribute('aria-label', 'Scrolla till toppen');
    scrollToTopBtn.innerHTML = '&#8679;';
    document.body.appendChild(scrollToTopBtn);
  }

  function handleScrollToTopVisibility() {
    if (window.scrollY > 300) {
      scrollToTopBtn.classList.add('visible');
    } else {
      scrollToTopBtn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', handleScrollToTopVisibility);
  handleScrollToTopVisibility();

  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ----------------------------------------------------------
  // 7. Scroll Reveal (fade-in + reveal classes)
  // ----------------------------------------------------------
  const revealEls = document.querySelectorAll('.fade-in, .reveal');

  if (revealEls.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // ----------------------------------------------------------
  // 8. Count-Up Animation (stats numbers)
  // ----------------------------------------------------------
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');

  function animateCountUp(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(easeOutCubic(progress) * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    el.textContent = '0' + suffix;
    requestAnimationFrame(tick);
  }

  if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCountUp(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statNumbers.forEach(el => countObserver.observe(el));
  } else {
    statNumbers.forEach(el => {
      el.textContent = (el.dataset.count || '0') + (el.dataset.suffix || '');
    });
  }

  // ----------------------------------------------------------
  // 9. Sticky CTA Bar (shows after scrolling past hero)
  // ----------------------------------------------------------
  const stickyCta = document.querySelector('.sticky-cta');

  if (stickyCta) {
    const hero = document.querySelector('.hero');
    const threshold = hero ? hero.offsetHeight : 400;

    function handleStickyCta() {
      if (window.scrollY > threshold) {
        stickyCta.classList.add('visible');
      } else {
        stickyCta.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', handleStickyCta);
    handleStickyCta();
  }

  // ----------------------------------------------------------
  // Helper Functions
  // ----------------------------------------------------------
  function showMessage(el, type, text) {
    el.textContent = text;
    el.className = 'form-message ' + type;
    setTimeout(() => {
      el.textContent = '';
      el.className = 'form-message';
    }, 5000);
  }

  function setButtonLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.dataset.originalText = btn.textContent;
      btn.textContent = 'Skickar...';
      btn.disabled = true;
    } else {
      btn.textContent = btn.dataset.originalText || btn.textContent;
      btn.disabled = false;
    }
  }

  function createMessageElement(form) {
    const div = document.createElement('div');
    div.className = 'form-message';
    form.appendChild(div);
    return div;
  }

});
