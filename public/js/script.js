// ============================================================
// script.js – Dynamit Bygg
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
  // 3. Contact Form (id="contactForm")
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
  // 4. Quote Form (id="quoteForm")
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
        // Upload files first
        if (files.length > 0) {
          const uploadData = new FormData();
          files.forEach(f => uploadData.append('bilder', f.file));

          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: uploadData,
          });

          if (!uploadRes.ok) throw new Error('Filuppladdning misslyckades');

          const uploadResult = await uploadRes.json();
          data.bilder = uploadResult.files.map(f => f.url);
        }

        // Submit quote request
        const response = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.error || 'Failed');

        // Show success, hide form
        form.style.display = 'none';
        const successDiv = document.getElementById('quoteSuccess');
        if (successDiv) {
          successDiv.style.display = 'block';
        } else {
          showMessage(messageBox, 'success', 'Offertförfrågan skickad! Vi återkommer så snart som möjligt.');
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
  // 6. Active Nav Link
  // ----------------------------------------------------------
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/index.html';

  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPath = href.replace(/\/$/, '') || '/index.html';

    // Don't override the explicit "active" class set in HTML
    if (linkPath === currentPath && !link.classList.contains('btn')) {
      // The HTML already has active class where needed
    }
  });

  // ----------------------------------------------------------
  // 7. Scroll to Top Button
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
  // 8. Scroll Animations (IntersectionObserver)
  // ----------------------------------------------------------
  const fadeElements = document.querySelectorAll('.fade-in');

  if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    fadeElements.forEach(el => fadeObserver.observe(el));
  } else {
    fadeElements.forEach(el => el.classList.add('visible'));
  }

  // ==========================================================
  // Helper Functions
  // ==========================================================

  function showMessage(el, type, text) {
    el.textContent = text;
    el.className = `form-message ${type}`;

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
