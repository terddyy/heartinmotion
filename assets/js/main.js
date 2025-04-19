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
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
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

    // Memory Box Interactions
    const memoryBoxes = document.querySelectorAll('.memory-box');
    let activeBox = null;

    memoryBoxes.forEach(box => {
      box.addEventListener('click', function() {
        if (activeBox === this) {
          // Closing the box
          this.classList.remove('expanded');
          activeBox = null;
        } else {
          // Opening the box
          if (activeBox) {
            activeBox.classList.remove('expanded');
          }
          this.classList.add('expanded');
          document.body.classList.add('memory-expanded');
          activeBox = this;
        }
      });

      // Add close button to each memory box
      const closeBtn = document.createElement('div');
      closeBtn.className = 'close-btn';
      closeBtn.innerHTML = '×';
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event from bubbling to memory box
        const box = e.target.closest('.memory-box');
        if (box) {
          box.classList.remove('expanded');
          box.classList.add('closing');
          document.body.classList.add('memory-closing');
          document.body.classList.remove('memory-expanded');
          
          setTimeout(() => {
            box.classList.remove('closing');
            document.body.classList.remove('memory-closing');
          }, 500);
          
          activeBox = null;
        }
      });
      box.appendChild(closeBtn);

      box.addEventListener('mouseenter', function() {
        if (!this.classList.contains('expanded')) {
          this.style.transform = 'scale(1.05)';
          this.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.3)';
        }
      });

      box.addEventListener('mouseleave', function() {
        if (!this.classList.contains('expanded')) {
          this.style.transform = 'scale(1)';
          this.style.boxShadow = 'none';
        }
      });
    });

    // Close expanded box when clicking outside
    document.addEventListener('click', function(e) {
      if (activeBox && !activeBox.contains(e.target)) {
        activeBox.classList.remove('expanded');
        activeBox.classList.add('closing');
        document.body.classList.add('memory-closing');
        document.body.classList.remove('memory-expanded');
        
        setTimeout(() => {
          activeBox.classList.remove('closing');
          document.body.classList.remove('memory-closing');
        }, 500);
        
        activeBox = null;
      }
    });
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

})();