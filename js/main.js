/**
 * Portfolio Website JavaScript
 * Tyler Battle - Professional Portfolio
 * 
 * This file contains all the interactive functionality for the portfolio website,
 * including navigation, smooth scrolling, form handling, and dynamic UI updates.
 */

// ==========================================================================
// Utility Functions
// ==========================================================================

/**
 * Debounce function to limit the rate of function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

/**
 * Throttle function to limit function execution to once per interval
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Smooth scroll to element with offset for fixed navbar
 * @param {Element} target - Target element to scroll to
 * @param {number} offset - Offset in pixels (default: 80)
 */
function smoothScrollToElement(target, offset = 80) {
    if (!target) return;
    
    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @param {number} threshold - Threshold percentage (default: 0.1)
 */
function isElementInViewport(element, threshold = 0.1) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const elementHeight = rect.bottom - rect.top;
    const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    
    return visibleHeight / elementHeight >= threshold;
}

// ==========================================================================
// DOM Elements
// ==========================================================================

const DOM = {
    // Navigation
    navbar: document.getElementById('navbar'),
    navToggle: document.getElementById('nav-toggle'),
    navMenu: document.getElementById('nav-menu'),
    navLinks: document.querySelectorAll('.nav-link'),
    
    // Sections
    sections: document.querySelectorAll('section[id]'),
    
    // Buttons
    backToTop: document.getElementById('backToTop'),
    
    // Forms
    contactForm: document.getElementById('contact-form'),
    
    // Other elements
    heroButtons: document.querySelectorAll('.hero .btn'),
    projectLinks: document.querySelectorAll('.project-link'),
    socialLinks: document.querySelectorAll('.social-link'),
};

// ==========================================================================
// Navigation Management
// ==========================================================================

class Navigation {
    constructor() {
        this.isMenuOpen = false;
        this.activeSection = null;
        this.scrollThreshold = 100;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateActiveSection();
        this.handleNavbarScroll();
    }
    
    bindEvents() {
        // Mobile menu toggle
        if (DOM.navToggle) {
            DOM.navToggle.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        // Navigation links
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !DOM.navbar.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
        
        // Scroll events
        window.addEventListener('scroll', throttle(() => {
            this.handleNavbarScroll();
            this.updateActiveSection();
        }, 16));
    }
    
    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        DOM.navToggle.classList.toggle('active');
        DOM.navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }
    
    closeMobileMenu() {
        this.isMenuOpen = false;
        DOM.navToggle.classList.remove('active');
        DOM.navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    handleNavClick(e) {
        e.preventDefault();
        
        const href = e.target.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        
        const target = document.querySelector(href);
        if (target) {
            smoothScrollToElement(target);
            this.closeMobileMenu();
        }
    }
    
    handleNavbarScroll() {
        const scrolled = window.pageYOffset > this.scrollThreshold;
        DOM.navbar.classList.toggle('scrolled', scrolled);
    }
    
    updateActiveSection() {
        let current = '';
        
        DOM.sections.forEach(section => {
            if (isElementInViewport(section, 0.3)) {
                current = section.getAttribute('id');
            }
        });
        
        if (current !== this.activeSection) {
            this.activeSection = current;
            this.updateActiveNavLink(current);
        }
    }
    
    updateActiveNavLink(sectionId) {
        DOM.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }
}

// ==========================================================================
// Scroll Management
// ==========================================================================

class ScrollManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateBackToTop();
    }
    
    bindEvents() {
        // Back to top button
        if (DOM.backToTop) {
            DOM.backToTop.addEventListener('click', () => this.scrollToTop());
        }
        
        // Scroll event for back to top visibility
        window.addEventListener('scroll', throttle(() => {
            this.updateBackToTop();
        }, 100));
        
        // Smooth scroll for all internal links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => this.handleSmoothScroll(e));
        });
    }
    
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    updateBackToTop() {
        const scrolled = window.pageYOffset > 500;
        if (DOM.backToTop) {
            DOM.backToTop.classList.toggle('visible', scrolled);
        }
    }
    
    handleSmoothScroll(e) {
        const href = e.target.getAttribute('href');
        if (!href || !href.startsWith('#') || href.length <= 1) return;
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            smoothScrollToElement(target);
        }
    }
}

// ==========================================================================
// Form Management
// ==========================================================================

class FormManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.bindEvents();
    }
    
    bindEvents() {
        if (DOM.contactForm) {
            DOM.contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }
        
        // Form validation on input
        const inputs = DOM.contactForm?.querySelectorAll('input, textarea');
        inputs?.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }
    
    handleContactForm(e) {
        e.preventDefault();
        
        const formData = new FormData(DOM.contactForm);
        const data = Object.fromEntries(formData.entries());
        
        // Validate form
        if (!this.validateForm(data)) {
            return;
        }
        
        // Show loading state
        const submitBtn = DOM.contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // Simulate form submission (in real implementation, you'd send to a server)
        setTimeout(() => {
            this.showFormSuccess();
            DOM.contactForm.reset();
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }
    
    validateForm(data) {
        let isValid = true;
        
        // Required fields validation
        const requiredFields = ['name', 'email', 'subject', 'message'];
        requiredFields.forEach(field => {
            if (!data[field] || data[field].trim() === '') {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            }
        });
        
        // Email validation
        if (data.email && !this.isValidEmail(data.email)) {
            this.showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        return isValid;
    }
    
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.getAttribute('name');
        
        // Clear previous errors
        this.clearFieldError(field);
        
        // Required field check
        if (field.hasAttribute('required') && !value) {
            this.showFieldError(fieldName, 'This field is required');
            return false;
        }
        
        // Email validation
        if (fieldName === 'email' && value && !this.isValidEmail(value)) {
            this.showFieldError(fieldName, 'Please enter a valid email address');
            return false;
        }
        
        return true;
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    showFieldError(fieldName, message) {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (!field) return;
        
        field.style.borderColor = '#ef4444';
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }
    
    clearFieldError(field) {
        field.style.borderColor = '';
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
    
    showFormSuccess() {
        // Create success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            background: #10b981;
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
            text-align: center;
            font-weight: 500;
        `;
        successDiv.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your message has been sent successfully.';
        
        // Insert before form
        DOM.contactForm.parentNode.insertBefore(successDiv, DOM.contactForm);
        
        // Remove success message after 5 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
        
        // Scroll to success message
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// ==========================================================================
// Animation and Visual Effects
// ==========================================================================

class AnimationManager {
    constructor() {
        this.observedElements = new Map();
        this.init();
    }
    
    init() {
        this.setupIntersectionObserver();
        this.animateOnScroll();
        this.setupTypewriter();
    }
    
    setupIntersectionObserver() {
        // Options for the observer
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        // Create observer
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, options);
        
        // Observe elements
        this.observeElements();
    }
    
    observeElements() {
        // Elements to animate on scroll
        const elementsToObserve = [
            '.project-card',
            '.timeline-item',
            '.skill-item',
            '.contact-method',
            '.about-text',
            '.hero-content'
        ];
        
        elementsToObserve.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                // Add initial animation classes
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                
                this.observer.observe(element);
            });
        });
    }
    
    animateElement(element) {
        // Animate element into view
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        
        // Stop observing this element
        this.observer.unobserve(element);
    }
    
    animateOnScroll() {
        // Parallax effect for hero section
        window.addEventListener('scroll', throttle(() => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero');
            
            if (hero && scrolled < window.innerHeight) {
                const speed = 0.5;
                hero.style.transform = `translateY(${scrolled * speed}px)`;
            }
        }, 16));
    }
    
    setupTypewriter() {
        // Typewriter effect for hero subtitle (optional enhancement)
        const subtitle = document.querySelector('.hero-subtitle');
        if (subtitle) {
            const text = subtitle.textContent;
            subtitle.textContent = '';
            let i = 0;
            
            const typeWriter = () => {
                if (i < text.length) {
                    subtitle.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                }
            };
            
            // Start typewriter effect after a delay
            setTimeout(typeWriter, 1000);
        }
    }
}

// ==========================================================================
// Performance and Accessibility
// ==========================================================================

class PerformanceManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.lazyLoadImages();
        this.prefetchLinks();
        this.setupKeyboardNavigation();
    }
    
    lazyLoadImages() {
        // Lazy loading for images (if any are added later)
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    prefetchLinks() {
        // Prefetch external links on hover
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            link.addEventListener('mouseenter', () => {
                const linkElement = document.createElement('link');
                linkElement.rel = 'prefetch';
                linkElement.href = link.href;
                document.head.appendChild(linkElement);
            }, { once: true });
        });
    }
    
    setupKeyboardNavigation() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Tab navigation enhancement
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
            
            // ESC key handlers
            if (e.key === 'Escape') {
                // Close any open modals or menus
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    activeModal.classList.remove('active');
                }
            }
        });
        
        // Remove keyboard navigation class on mouse use
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
}

// ==========================================================================
// Project Gallery Enhancement
// ==========================================================================

class ProjectGallery {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupProjectCards();
        this.setupProjectFiltering();
    }
    
    setupProjectCards() {
        document.querySelectorAll('.project-card').forEach(card => {
            // Add hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
            
            // Add click handling for mobile
            card.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    card.classList.toggle('active');
                }
            });
        });
    }
    
    setupProjectFiltering() {
        // Project filtering by technology (if filter buttons are added)
        const filterButtons = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                
                // Update active button
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter projects
                projectCards.forEach(card => {
                    if (filter === 'all' || card.dataset.category === filter) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }
}

// ==========================================================================
// Theme Management (Future Enhancement)
// ==========================================================================

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }
    
    init() {
        this.applyTheme();
        this.setupThemeToggle();
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }
    
    setupThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('theme', this.currentTheme);
    }
}

// ==========================================================================
// Main Application
// ==========================================================================

class Portfolio {
    constructor() {
        this.navigation = new Navigation();
        this.scrollManager = new ScrollManager();
        this.formManager = new FormManager();
        this.animationManager = new AnimationManager();
        this.performanceManager = new PerformanceManager();
        this.projectGallery = new ProjectGallery();
        this.themeManager = new ThemeManager();
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onReady());
        } else {
            this.onReady();
        }
    }
    
    onReady() {
        console.log('Portfolio website initialized successfully!');
        
        // Add any additional initialization here
        this.setupAnalytics();
        this.setupServiceWorker();
    }
    
    setupAnalytics() {
        // Google Analytics or other analytics setup
        // This would be implemented based on specific requirements
        console.log('Analytics initialized');
    }
    
    setupServiceWorker() {
        // Service worker for PWA functionality (future enhancement)
        if ('serviceWorker' in navigator) {
            // Register service worker when available
        }
    }
}

// ==========================================================================
// Initialize Application
// ==========================================================================

// Start the portfolio application
const portfolioApp = new Portfolio();

// Global error handling
window.addEventListener('error', (e) => {
    console.error('Portfolio Error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Portfolio;
}