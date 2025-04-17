/**
 * Animation and Effects Handler
 * Manages all custom animations and interactive effects for the portfolio
 */

class AnimationHandler {
    constructor() {
        // Initialize animation triggers
        this.initializeAnimations();
        
        // Handle video background
        this.setupVideoBackground();
        
        // Setup scroll-based animations
        this.setupScrollAnimations();
        
        // Initialize parallax effects
        this.setupParallax();
    }
    
    initializeAnimations() {
        // Add loaded class to video background after loading
        const videoBackground = document.querySelector('.video-background');
        if (videoBackground) {
            videoBackground.addEventListener('loadeddata', () => {
                videoBackground.classList.add('loaded');
            });
        }
        
        // Initialize fade-in elements
        this.fadeInElements = document.querySelectorAll('.fade-in');
    }
    
    setupVideoBackground() {
        const video = document.querySelector('.video-background');
        if (!video) return;
        
        // Ensure video plays smoothly
        video.playbackRate = 0.8;
        
        // Handle video loading
        video.addEventListener('canplay', () => {
            video.play().catch(console.error);
        });
    }
    
    setupScrollAnimations() {
        // Create intersection observer for fade-in elements
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe all fade-in elements
        this.fadeInElements.forEach(element => {
            observer.observe(element);
        });
    }
    
    setupParallax() {
        const parallaxElements = document.querySelectorAll('.parallax');
        
        window.addEventListener('scroll', () => {
            requestAnimationFrame(() => {
                parallaxElements.forEach(element => {
                    const speed = element.dataset.speed || 0.5;
                    const yPos = -(window.pageYOffset * speed);
                    element.style.transform = `translateY(${yPos}px)`;
                });
            });
        });
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnimationHandler();
    
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}); 