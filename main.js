/* ═══════════════════════════════════════════════════
   PORTFOLIO — MAIN JAVASCRIPT
   Interactions, animations, scroll, form handling
   ═══════════════════════════════════════════════════ */

'use strict';

/* ─── DOM READY WRAPPER ───────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    initAll();
});

/* ─── MASTER INIT FUNCTION ────────────────────────── */
function initAll() {
    initNavbar();
    initMobileMenu();
    initReveal();
    initCounters();
    initFilter();
    initContactForm();
    initSmoothScroll();
    initActiveNav();
    initCursor();
    initParallax();
    initCardTilt();
    initHeroHighlight();
    initImageLoaders();
    initTestimonialHeights();
    initVideoCards(); // ✨ Video project support
}

/* ─── NAVBAR SCROLL BEHAVIOUR ─────────────────────── */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScrollY = 0;
    let ticking = false;

    const updateNavbar = () => {
        if (lastScrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }, { passive: true });
}

/* ─── IMAGE & VIDEO FADE-IN LOADERS ───────────────── */
function initImageLoaders() {
    const loadMedia = (media) => {
        if (media.complete || media.readyState >= 2) {
            media.classList.add('loaded');
        } else {
            const onLoad = () => {
                media.classList.add('loaded');
                media.removeEventListener('load', onLoad);
                media.removeEventListener('error', onError);
            };
            const onError = () => {
                media.style.opacity = '1';
                media.removeEventListener('load', onLoad);
                media.removeEventListener('error', onError);
            };
            media.addEventListener('load', onLoad, { once: true });
            media.addEventListener('error', onError, { once: true });
        }
    };

    // Handle both images and videos
    document.querySelectorAll('.about-photo, .project-image, .project-video').forEach(loadMedia);
}

/* ─── MOBILE MENU ─────────────────────────────────── */
function initMobileMenu() {
    const toggle  = document.getElementById('navToggle');
    const menu    = document.getElementById('mobileMenu');
    const links   = document.querySelectorAll('.mobile-link');
    if (!toggle || !menu) return;

    let isOpen = false;

    const openMenu = () => {
        isOpen = true;
        menu.classList.add('open');
        document.body.style.overflow = 'hidden';
        toggle.setAttribute('aria-expanded', 'true');
        toggleLines(true);
    };

    const closeMenu = () => {
        isOpen = false;
        menu.classList.remove('open');
        document.body.style.overflow = '';
        toggle.setAttribute('aria-expanded', 'false');
        toggleLines(false);
    };

    const toggleLines = (open) => {
        const spans = toggle.querySelectorAll('span');
        if (open) {
            spans[0].style.cssText = 'transform: translateY(7px) rotate(45deg)';
            spans[1].style.cssText = 'opacity: 0; transform: scaleX(0)';
            spans[2].style.cssText = 'transform: translateY(-7px) rotate(-45deg)';
        } else {
            spans.forEach(s => s.removeAttribute('style'));
        }
    };

    toggle.addEventListener('click', () => isOpen ? closeMenu() : openMenu());
    links.forEach(link => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            closeMenu();
            toggle.focus();
        }
    });

    document.addEventListener('click', (e) => {
        if (isOpen && !e.target.closest('.nav-container') && !e.target.closest('.mobile-menu')) {
            closeMenu();
        }
    });
}

/* ─── VIDEO PROJECT CARD INTERACTIONS ─────────────── */
function initVideoCards() {
    const videoCards = document.querySelectorAll('.project-visual-video');
    
    videoCards.forEach(card => {
        const video = card.querySelector('.project-video');
        const playBtn = card.querySelector('.video-play-btn');
        const poster = card.querySelector('.project-image');
        
        if (!video || !playBtn) return;
        
        // Lazy-load video metadata on intersection
        const videoObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                video.load();
                videoObserver.unobserve(video);
            }
        }, { threshold: 0.1 });
        
        videoObserver.observe(video);
        
        // Play/Pause toggle
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (video.paused) {
                video.play().then(() => {
                    playBtn.classList.add('playing');
                    if (window.innerWidth >= 768) {
                        video.controls = true;
                    }
                }).catch(err => {
                    console.warn('Video play failed:', err);
                    if (poster) poster.style.opacity = '1';
                });
            } else {
                video.pause();
                playBtn.classList.remove('playing');
                video.controls = false;
            }
        });
        
        // Reset on video end
        video.addEventListener('ended', () => {
            playBtn.classList.remove('playing');
            video.currentTime = 0;
            video.controls = false;
        });
        
        // Pause when card leaves viewport
        const pauseObserver = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting && !video.paused) {
                video.pause();
                playBtn.classList.remove('playing');
                video.controls = false;
            }
        }, { threshold: 0 });
        
        pauseObserver.observe(card);
    });
}

/* ─── PORTFOLIO FILTER (with video support) ───────── */
function initFilter() {
    const buttons  = document.querySelectorAll('.filter-btn');
    const cards    = document.querySelectorAll('.project-card');
    if (!buttons.length || !cards.length) return;

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            // Update button states
            buttons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            // Filter cards with staggered animation
            cards.forEach((card, i) => {
                const category = card.dataset.category;
                const show = filter === 'all' || category === filter;
                const video = card.querySelector('.project-video');

                if (show) {
                    card.style.display = '';
                    void card.offsetWidth; // Force reflow
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                        
                        // Ensure video poster is visible initially
                        if (video && !video.classList.contains('loaded')) {
                            const poster = card.querySelector('.project-image');
                            if (poster) poster.style.opacity = '1';
                        }
                    }, i * 80);
                } else {
                    // Pause video when hiding
                    if (video && !video.paused) {
                        video.pause();
                        const playBtn = card.querySelector('.video-play-btn');
                        if (playBtn) playBtn.classList.remove('playing');
                        video.controls = false;
                    }
                    
                    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });

            // Scroll to portfolio on mobile after filter change
            if (window.innerWidth < 768) {
                const portfolio = document.getElementById('portfolio');
                if (portfolio) {
                    setTimeout(() => {
                        portfolio.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 400);
                }
            }
        });

        // Keyboard navigation for accessibility
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const btns = Array.from(buttons);
                const currentIndex = btns.indexOf(btn);
                const nextIndex = e.key === 'ArrowRight' 
                    ? (currentIndex + 1) % btns.length 
                    : (currentIndex - 1 + btns.length) % btns.length;
                btns[nextIndex].focus();
                btns[nextIndex].click();
            }
        });
    });
}

/* ─── SCROLL REVEAL ANIMATIONS ───────────────────── */
function initReveal() {
    const els = document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-left, .reveal-right');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px'
    });

    els.forEach(el => observer.observe(el));
}

/* ─── COUNTER ANIMATION ───────────────────────────── */
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    const parseValue = (str) => {
        const num   = parseFloat(str.replace(/[^0-9.]/g, ''));
        const suffix = str.replace(/[0-9.]/g, '');
        return { num, suffix };
    };

    const animateCounter = (el) => {
        const raw = el.textContent.trim();
        const { num, suffix } = parseValue(raw);
        const duration = 1800;
        const start = performance.now();

        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * num;

            if (Number.isInteger(num)) {
                el.textContent = Math.floor(current) + suffix;
            } else {
                el.textContent = current.toFixed(0) + suffix;
            }

            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = raw;
        };

        requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
}

/* ─── CONTACT FORM — GOOGLE SHEETS INTEGRATION ───── */
function initContactForm() {
    const form    = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');
    if (!form) return;

    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxIhktiMTgvwzx0-yiDCNvRjWTa6YuCcX0FcKb7-rRV73wrNwfspNzxPgXqQuy0Fhjv/exec';
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name  = form.querySelector('#name')?.value.trim();
        const email = form.querySelector('#email')?.value.trim();
        const msg   = form.querySelector('#message')?.value.trim();

        if (!name || !email || !msg) {
            showFieldErrors(form);
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = `<span class="spinner"></span> Sending…`;

            try {
                const formData = {
                    name,
                    email,
                    company: form.querySelector('#company')?.value.trim() || '',
                    service: form.querySelector('#service')?.value || '',
                    budget: form.querySelector('#budget')?.value || '',
                    message: msg
                };

                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                form.style.opacity = '0';
                form.style.transform = 'scale(0.97)';
                form.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                
                setTimeout(() => {
                    form.style.display = 'none';
                    if (success) {
                        success.hidden = false;
                        success.classList.add('show');
                        success.style.opacity = '0';
                        setTimeout(() => {
                            success.style.transition = 'opacity 0.5s ease';
                            success.style.opacity = '1';
                        }, 50);
                    }
                }, 300);

                setTimeout(() => {
                    form.reset();
                    form.style.display = '';
                    form.style.opacity = '1';
                    form.style.transform = '';
                    success.classList.remove('show');
                    success.style.opacity = '';
                    success.hidden = true;
                }, 5000);

            } catch (err) {
                console.warn('Form submission error:', err);
                alert('Something went wrong. Please try again or contact us directly at elgchiriibtihal@gmail.com');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }
    });

    function showFieldErrors(form) {
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#ef4444';
                field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                field.setAttribute('aria-invalid', 'true');
                
                field.addEventListener('input', () => {
                    field.style.borderColor = '';
                    field.style.boxShadow = '';
                    field.removeAttribute('aria-invalid');
                }, { once: true });
            }
        });
    }

    form.querySelectorAll('[required]').forEach(field => {
        field.addEventListener('blur', () => {
            if (!field.value.trim()) {
                field.style.borderColor = '#ef4444';
                field.setAttribute('aria-invalid', 'true');
            }
        });
        field.addEventListener('input', () => {
            if (field.value.trim()) {
                field.style.borderColor = '';
                field.removeAttribute('aria-invalid');
            }
        });
    });
}

/* ─── SMOOTH ANCHOR SCROLL ────────────────────────── */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const nav = document.getElementById('navbar');
            const navH = nav?.offsetHeight || 80;
            const top  = target.getBoundingClientRect().top + window.scrollY - navH - 12;

            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu?.classList.contains('open')) {
                mobileMenu.classList.remove('open');
                document.body.style.overflow = '';
            }

            window.scrollTo({ top, behavior: 'smooth' });
            
            setTimeout(() => {
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            }, 500);
        });
    });
}

/* ─── ACTIVE NAV LINK HIGHLIGHT ───────────────────── */
function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links li a:not(.nav-cta)');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    const isActive = link.getAttribute('href') === '#' + id;
                    link.classList.toggle('active', isActive);
                    link.setAttribute('aria-current', isActive ? 'page' : 'false');
                });
            }
        });
    }, { threshold: 0.4 });

    sections.forEach(section => observer.observe(section));
}

/* ─── CUSTOM CURSOR (desktop only) ───────────────── */
function initCursor() {
    if (window.matchMedia('(hover: none)').matches || 
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const cursor   = document.createElement('div');
    const follower = document.createElement('div');

    cursor.className   = 'cursor';
    follower.className = 'cursor-follower';
    cursor.setAttribute('aria-hidden', 'true');
    follower.setAttribute('aria-hidden', 'true');

    document.body.appendChild(cursor);
    document.body.appendChild(follower);

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    let isIdle = false;

    let idleTimer;
    const hideCursorWhenIdle = () => {
        isIdle = true;
        cursor.style.opacity = '0';
        follower.style.opacity = '0';
    };

    const showCursor = () => {
        isIdle = false;
        cursor.style.opacity = '1';
        follower.style.opacity = '0.5';
        clearTimeout(idleTimer);
        idleTimer = setTimeout(hideCursorWhenIdle, 2000);
    };

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left   = (mouseX - 5) + 'px';
        cursor.style.top    = (mouseY - 5) + 'px';
        showCursor();
    });

    function animateFollower() {
        if (!isIdle) {
            followerX += (mouseX - followerX) * 0.12;
            followerY += (mouseY - followerY) * 0.12;
            follower.style.left = (followerX - 16) + 'px';
            follower.style.top  = (followerY - 16) + 'px';
        }
        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        follower.style.opacity = '0';
    });
    document.addEventListener('mouseenter', showCursor);

    const interactives = document.querySelectorAll(
        'a, button, .project-card, .service-card, .filter-btn, .testimonial-card, .contact-method'
    );
    
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform   = 'scale(2)';
            follower.style.transform = 'scale(1.5)';
            follower.style.opacity   = '0.3';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform   = '';
            follower.style.transform = '';
            follower.style.opacity   = isIdle ? '0' : '0.5';
        });
    });
}

/* ─── PARALLAX EFFECT ─────────────────────────────── */
function initParallax() {
    const orbs = document.querySelectorAll('.hero-orb, .cta-orb');
    if (!orbs.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;
    
    const updateParallax = () => {
        const scrollY = window.scrollY;
        orbs.forEach((orb, i) => {
            const factor = i % 2 === 0 ? 0.15 : -0.1;
            orb.style.transform = `translateY(${scrollY * factor}px)`;
        });
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
}

/* ─── CARD TILT EFFECT ────────────────────────────── */
function initCardTilt() {
    const cards = document.querySelectorAll('.project-card, .service-card');
    if (!cards.length) return;

    if (window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    cards.forEach(card => {
        let isTilted = false;

        card.addEventListener('mousemove', (e) => {
            if (!isTilted) {
                card.style.willChange = 'transform';
                isTilted = true;
            }
            
            const rect   = card.getBoundingClientRect();
            const x      = e.clientX - rect.left;
            const y      = e.clientY - rect.top;
            const cx     = rect.width  / 2;
            const cy     = rect.height / 2;
            const tiltX  = ((y - cy) / cy) * -4;
            const tiltY  = ((x - cx) / cx) * 4;

            card.style.transform = `translateY(-6px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.willChange = '';
            isTilted = false;
        });
    });
}

/* ─── TYPED HEADLINE EFFECT ───────────────────────── */
function initHeroHighlight() {
    const italic = document.querySelector('.hero-title em');
    if (!italic) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const phrases = ['that convert', 'that stand out', 'with purpose', 'that endure'];
    let index = 0;

    const cyclePhrase = () => {
        italic.style.opacity = '0';
        italic.style.transform = 'translateY(-8px)';
        
        setTimeout(() => {
            index = (index + 1) % phrases.length;
            italic.textContent = phrases[index];
            italic.style.opacity = '1';
            italic.style.transform = 'translateY(0)';
        }, 400);
    };

    setTimeout(() => {
        setInterval(cyclePhrase, 3000);
    }, 2000);
}

/* ─── TESTIMONIAL CARD HEIGHTS ────────────────────── */
function initTestimonialHeights() {
    const cards = document.querySelectorAll('.testimonial-card');
    if (!cards.length) return;

    const equalizeHeights = () => {
        cards.forEach(card => card.style.height = 'auto');
        
        if (window.innerWidth >= 769) {
            const maxHeight = Math.max(...Array.from(cards).map(card => card.offsetHeight));
            cards.forEach(card => card.style.height = `${maxHeight}px`);
        }
    };

    equalizeHeights();
    window.addEventListener('resize', () => {
        clearTimeout(window.__testimonialResizeTimer);
        window.__testimonialResizeTimer = setTimeout(equalizeHeights, 100);
    });
}

/* ─── UTILITY FUNCTIONS ───────────────────────────── */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/* ─── CONSOLE WELCOME ─────────────────────────────── */
console.log(
    '%c Strategic Elgchiri Designs  %c\n\nBuilt with intention.\nInterested in working together? Let\'s talk: elgchiriibtihal@gmail.com',
    'background: linear-gradient(135deg, #1a6b4a, #2d9966); color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;',
    'color: #6b7280;'
);
