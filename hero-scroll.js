function smoothScrollBy(distance, duration) {
  const start = window.scrollY;
  const startTime = performance.now();
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, start + distance * easeInOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function setFormLanguage(form) {
  if (!form) return;
  const lang = (document.documentElement.lang || 'de').toUpperCase();
  const langInput = form.querySelector('[name="language"], #booking-language');
  if (langInput) langInput.value = lang;
}

function updateModalText(modal, mode) {
  if (!modal || typeof applyLanguage !== 'function') return;

  const title = modal.querySelector('h2');
  const submitBtn = modal.querySelector('button[type="submit"]');
  const bookingInfo = modal.querySelector('[data-i18n="booking_info"]');

  if (title && !modal.dataset.originalTitleKey) {
    modal.dataset.originalTitleKey = title.dataset.i18n || '';
  }
  if (submitBtn && !modal.dataset.originalSubmitKey) {
    modal.dataset.originalSubmitKey = submitBtn.dataset.i18n || '';
  }

  if (mode === 'inquiry') {
    modal.dataset.mode = 'inquiry';
    if (title) title.dataset.i18n = 'contact_title';
    if (submitBtn) submitBtn.dataset.i18n = 'hero_contact_submit';
    if (bookingInfo) bookingInfo.style.display = 'none';
  } else if (mode === 'quote') {
    modal.dataset.mode = 'quote';
    if (title && modal.dataset.originalTitleKey) title.dataset.i18n = modal.dataset.originalTitleKey;
    if (submitBtn && modal.dataset.originalSubmitKey) submitBtn.dataset.i18n = modal.dataset.originalSubmitKey;
    if (bookingInfo) bookingInfo.style.display = 'none';
  } else {
    modal.dataset.mode = 'booking';
    if (title && modal.dataset.originalTitleKey) title.dataset.i18n = modal.dataset.originalTitleKey;
    if (submitBtn && modal.dataset.originalSubmitKey) submitBtn.dataset.i18n = modal.dataset.originalSubmitKey;
    if (bookingInfo) bookingInfo.style.display = 'block';
  }

  applyLanguage(document.documentElement.lang || 'de');
}

function setInquiryMode(modal) {
  if (!modal) return;
  updateModalText(modal, 'inquiry');
  const bookingType = modal.querySelector('[name="booking_type"]');
  const bookingHours = modal.querySelector('[name="booking_hours"]');
  const bookingDiscount = modal.querySelector('[name="discount"]');
  if (bookingType) bookingType.value = 'inquiry';
  if (bookingHours) bookingHours.value = 'NA';
  if (bookingDiscount) bookingDiscount.value = 'NA';
  setFormLanguage(modal.querySelector('form'));
}

function setBookingMode(modal) {
  if (!modal) return;
  updateModalText(modal, 'booking');
}

function setQuoteMode(modal) {
  if (!modal) return;
  updateModalText(modal, 'quote');
  const bookingType = modal.querySelector('[name="booking_type"]');
  const bookingHours = modal.querySelector('[name="booking_hours"]');
  const bookingDiscount = modal.querySelector('[name="discount"]');
  if (bookingType) bookingType.value = 'inquiry';
  if (bookingHours) bookingHours.value = 'NA';
  if (bookingDiscount) bookingDiscount.value = 'NA';
  setFormLanguage(modal.querySelector('form'));
}

function setupPricingCards() {
  const pricingContainer = document.querySelector('.features.pricing-grid, .pricing-grid');
  if (!pricingContainer) return;

  const cards = pricingContainer.querySelectorAll('.card');
  let lastOpenedCard = null;

  pricingContainer.addEventListener('click', function(e) {
    const card = e.target.closest('.card');
    if (!card) return;
    if (e.target.closest('.btn, .open-modal')) return;
    e.preventDefault();
    e.stopPropagation();

    const wasExpanded = card.classList.contains('expanded');
    cards.forEach(c => { if (c !== card) c.classList.remove('expanded'); });
    card.classList.toggle('expanded');
    const isNowExpanded = card.classList.contains('expanded');

    if (isNowExpanded && !wasExpanded && card !== lastOpenedCard) {
      lastOpenedCard = card;
      setTimeout(() => {
        const cardRect = card.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const scrollTo = cardRect.top + cardRect.height / 2 - viewportH / 2;
        smoothScrollBy(scrollTo, 500);
      }, 450);
    }

    const anyOpen = Array.from(cards).some(c => c.classList.contains('expanded'));
    if (!anyOpen) {
      lastOpenedCard = null;
      if (window.innerWidth > 768) {
        const pricingSection = document.getElementById('pricing');
        if (pricingSection) {
          const rect = pricingSection.getBoundingClientRect();
          smoothScrollBy(rect.top - 375, 500);
        }
      }
    }
  });
}

function setupServiceCards() {
  const cards = document.querySelectorAll('.service-card');
  if (!cards.length) return;

  let openCard = null;

  cards.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function(e) {
      if (e.target.closest('.btn, .open-modal')) return;
      e.stopPropagation();
      if (this === openCard) {
        this.classList.remove('expanded');
        openCard = null;
      } else {
        if (openCard) openCard.classList.remove('expanded');
        this.classList.add('expanded');
        openCard = this;
      }
    });
  });

  const isMobile = () => window.innerWidth <= 768;
  if (!isMobile()) return;

  cards.forEach(card => card.classList.remove('expanded'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          if (!card.classList.contains('expanded')) {
            card.classList.add('expanded');
          }
          obs.unobserve(card);
        }
      });
    }, { threshold: 0.25 });
    cards.forEach(card => observer.observe(card));
  } else {
    let ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.75 && rect.bottom > 0) {
              if (!card.classList.contains('expanded')) {
                card.classList.add('expanded');
              }
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    setTimeout(() => window.dispatchEvent(new Event('scroll')), 300);
  }
}

function setupContactForms() {
  const forms = document.querySelectorAll('.contact-form, .quote-form, #pricing-form, #booking-form');
  if (!forms.length) return;

  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      setFormLanguage(form);

      const toast = document.getElementById('toast');
      if (toast) {
        const mode = document.getElementById('contactModal')?.dataset.mode || 'inquiry';
        const key = mode === 'booking' ? 'toast_booking' : 'toast_inquiry';
        toast.textContent = translations[currentLang]?.[key] || toast.textContent;
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 2500);
      }
      setTimeout(() => { this.submit(); }, 3300);
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  setupPricingCards();
  setupServiceCards();
  setupContactForms();

  const modal = document.getElementById('contactModal');
  if (modal) {
    document.querySelectorAll('.open-modal').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        if (this.closest('.btn-book')) {
          setBookingMode(modal);
        } else if (this.closest('.btn-quote')) {
          setQuoteMode(modal);
        } else {
          setInquiryMode(modal);
        }
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);

        const serviceField = modal.querySelector('[name="booking_service"]');
        if (serviceField && this.dataset.service) {
          serviceField.value = this.dataset.service;
        }
      });
    });

    const modalContent = modal.querySelector('.modal');
    if (modalContent) {
      modalContent.addEventListener('click', function(event) {
        event.stopPropagation();
      });
    }
  }
});

function closeModal() {
  const modal = document.getElementById('contactModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
  }
}

// Close button event listener
document.addEventListener('DOMContentLoaded', function() {
  const closeBtn = document.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      closeModal();
    });
  }
});

document.addEventListener('click', function(e) {
  if (e.target.closest('.modal-overlay')) {
    closeModal();
  }
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeModal();
  }
});
