/**
* Template Name: MyResume
* Template URL: https://bootstrapmade.com/free-html-bootstrap-template-my-resume/
* Updated: Jun 29 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.remove();
      }, 100);
    });
  }

  /**
   * Header and Navigation Toggle
   */
  const header = document.querySelector('#header');
  const navToggleBtn = document.querySelector('#navToggleBtn');
  let isNavVisible = true; // Start with nav visible
  let isScrolled = false;

  // Function to update nav toggle button state
  function updateNavToggleButton() {
    if (isNavVisible) {
      navToggleBtn.querySelector('i').classList.remove('bi-chevron-down');
      navToggleBtn.querySelector('i').classList.add('bi-chevron-up');
    } else {
      navToggleBtn.querySelector('i').classList.remove('bi-chevron-up');
      navToggleBtn.querySelector('i').classList.add('bi-chevron-down');
    }
  }

  // Function to handle header visibility
  function handleHeaderVisibility() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    isScrolled = scrollTop > 50;
    
    if (!isNavVisible) {
      header.classList.add('hidden');
    } else {
      header.classList.remove('hidden');
    }
    
    updateNavToggleButton();
  }

  // Toggle navigation visibility
  if (navToggleBtn) {
    navToggleBtn.addEventListener('click', () => {
      isNavVisible = !isNavVisible;
      handleHeaderVisibility();
    });
  }

  // Handle scroll events
  window.addEventListener('scroll', handleHeaderVisibility);
  window.addEventListener('load', () => {
    handleHeaderVisibility();
  });

  /**
   * Header toggle
   */
  const headerToggleBtn = document.querySelector('.header-toggle');
  if (headerToggleBtn) {
    function headerToggle() {
      const header = document.querySelector('#header');
      if (header) {
        header.classList.toggle('header-show');
        headerToggleBtn.classList.toggle('bi-list');
        headerToggleBtn.classList.toggle('bi-x');
      }
    }
    headerToggleBtn.addEventListener('click', headerToggle);
  }

  /**
   * Navigation and Smooth Scrolling
   */
  document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.navmenu a');
    const sections = document.querySelectorAll('section');
    let currentSection = 'hero';

    // Function to handle navigation
    function handleNavigation(e) {
      const href = this.getAttribute('href');
      
      // If we're on portfolio-details.html, let the default navigation happen
      if (window.location.pathname.includes('portfolio-details.html')) {
        return true;
      }

      e.preventDefault();
      const targetId = href.includes('#') ? href.split('#')[1] : href;
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        // Update active link
        navLinks.forEach(link => link.classList.remove('active'));
        this.classList.add('active');

        // Hide mobile menu if open
        if (document.querySelector('.header-show')) {
          headerToggle();
        }

        // Scroll to section
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Update current section
        currentSection = targetId;
      }
    }

    // Add click event listeners to navigation links
    navLinks.forEach(link => {
      link.addEventListener('click', handleNavigation);
    });

    // If we're on index.html and there's a hash in the URL, scroll to that section
    if ((window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) && window.location.hash) {
      const targetId = window.location.hash.substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        setTimeout(() => {
          targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
    }

    // Handle scroll events
    function handleScroll() {
      const scrollPosition = window.scrollY + 200;

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // See More Functionality
    const seeMoreLinks = document.querySelectorAll('.see-more-link');
    seeMoreLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const container = this.closest('.description-container');
        const shortDesc = container.querySelector('.short-desc');
        const fullDesc = container.querySelector('.full-desc');
        
        if (fullDesc.style.display === 'none' || !fullDesc.style.display) {
          shortDesc.style.display = 'none';
          fullDesc.style.display = 'inline';
          this.textContent = 'See Less';
        } else {
          shortDesc.style.display = 'inline';
          fullDesc.style.display = 'none';
          this.textContent = 'See More';
        }
      });
    });

    // Memory Box Functionality
    const memoryBoxes = document.querySelectorAll('.memory-box');
    let currentlyExpanded = null;

    memoryBoxes.forEach(box => {
        // Add close button to each memory box
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '×';
        box.appendChild(closeBtn);

        // Click handler for memory box
        box.addEventListener('click', function(e) {
            if (e.target.classList.contains('close-btn')) {
                return; // Let the close button handler handle this
            }
            
            if (!this.classList.contains('expanded')) {
                expandMemoryBox(this);
            }
        });

        // Click handler for close button
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeMemoryBox(box);
        });
    });

    // Close expanded memory box when clicking outside
    document.addEventListener('click', function(e) {
        if (currentlyExpanded && !e.target.closest('.memory-box')) {
            closeMemoryBox(currentlyExpanded);
        }
    });

    // Handle escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && currentlyExpanded) {
            closeMemoryBox(currentlyExpanded);
        }
    });

    function expandMemoryBox(box) {
        if (currentlyExpanded) {
            closeMemoryBox(currentlyExpanded);
        }
        box.classList.add('expanded');
        document.body.classList.add('memory-expanded');
        currentlyExpanded = box;
    }

    function closeMemoryBox(box) {
        box.classList.remove('expanded');
        document.body.classList.remove('memory-expanded');
        currentlyExpanded = null;
    }
  });

  /**
   * Scroll top button
   */
  const scrollTop = document.querySelector('.scroll-top');
  if (scrollTop) {
    function toggleScrollTop() {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    window.addEventListener('load', toggleScrollTop);
    document.addEventListener('scroll', toggleScrollTop);
  }

  /**
   * Animation on scroll function and init
   */
  if (typeof AOS !== 'undefined') {
    function aosInit() {
      AOS.init({
        duration: 600,
        easing: 'ease-in-out',
        once: true,
        mirror: false
      });
    }
    window.addEventListener('load', aosInit);
  }

  /**
   * Init typed.js
   */
  const selectTyped = document.querySelector('.typed');
  if (selectTyped && typeof Typed !== 'undefined') {
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    if (typed_strings) {
      typed_strings = typed_strings.split(',');
      new Typed('.typed', {
        strings: typed_strings,
        loop: true,
        typeSpeed: 100,
        backSpeed: 50,
        backDelay: 2000
      });
    }
  }

  /**
   * Initiate Pure Counter
   */
  if (typeof PureCounter !== 'undefined') {
    new PureCounter();
  }

  /**
   * Animate the skills items on reveal
   */
  if (typeof Waypoint !== 'undefined') {
    const skillsAnimation = document.querySelectorAll('.skills-animation');
    skillsAnimation.forEach((item) => {
      new Waypoint({
        element: item,
        offset: '80%',
        handler: function(direction) {
          const progress = item.querySelectorAll('.progress .progress-bar');
          progress.forEach(el => {
            el.style.width = el.getAttribute('aria-valuenow') + '%';
          });
        }
      });
    });
  }

  /**
   * Initiate glightbox
   */
  if (typeof GLightbox !== 'undefined') {
    const glightbox = GLightbox({
      selector: '.glightbox'
    });
  }

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  // Add magical particles to minigame section
  function createParticles() {
    const minigameSection = document.querySelector('.minigame');
    if (!minigameSection) return;

    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random initial position
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      
      // Random size
      const size = Math.random() * 4 + 2;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      
      // Random animation delay
      particle.style.animationDelay = Math.random() * 5 + 's';
      
      // Random animation duration
      particle.style.animationDuration = (Math.random() * 6 + 3) + 's';
      
      minigameSection.appendChild(particle);
    }
  }

  // Call the function when the page loads
  document.addEventListener('DOMContentLoaded', createParticles);

  // Contact form handling
  document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const loading = this.querySelector('.loading');
        const errorMessage = this.querySelector('.error-message');
        const sentMessage = this.querySelector('.sent-message');
        
        // Show loading
        loading.classList.remove('d-none');
        errorMessage.style.display = 'none';
        sentMessage.classList.add('d-none');

        // Get form data
        const formData = new FormData(this);

        // Send form data to Formspree
        fetch(this.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        })
        .then(response => {
          if (response.ok) {
            // Success
            loading.classList.add('d-none');
            sentMessage.classList.remove('d-none');
            contactForm.reset();
          } else {
            throw new Error('Form submission failed');
          }
        })
        .catch(error => {
          // Error
          loading.classList.add('d-none');
          errorMessage.textContent = 'Form submission failed. Please try again.';
          errorMessage.style.display = 'block';
        });
      });
    }
  });

  // Portfolio Details Navigation Handler
  document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.navmenu a');
    
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href.includes('#')) {
          const targetPage = href.split('#')[0];
          const targetSection = href.split('#')[1];
          
          if (targetPage === 'index.html') {
            sessionStorage.setItem('scrollToSection', targetSection);
          }
        }
      });
    });
  });

  // Check for scroll target on index page load
  if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
    const scrollTarget = sessionStorage.getItem('scrollToSection');
    if (scrollTarget) {
      window.addEventListener('load', function() {
        const targetElement = document.getElementById(scrollTarget);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          sessionStorage.removeItem('scrollToSection');
        }
      });
    }
  }

})();