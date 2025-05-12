// Description functionality for memory boxes and portfolio items
document.addEventListener('DOMContentLoaded', function() {
    // Handle portfolio "see more" links
    const seeMoreLinks = document.querySelectorAll('.see-more-link');
    seeMoreLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const container = this.closest('.description-container');
            if (!container) return;
            
            const shortDesc = container.querySelector('.short-desc');
            const fullDesc = container.querySelector('.full-desc');
            
            if (!shortDesc || !fullDesc) return;
            
            const isExpanded = fullDesc.style.display !== 'none';
            
            shortDesc.style.display = isExpanded ? 'inline' : 'none';
            fullDesc.style.display = isExpanded ? 'none' : 'inline';
            this.textContent = isExpanded ? 'See More' : 'See Less';
        });
    });

    // Handle memory box descriptions
    const memoryBoxes = document.querySelectorAll('.memory-box');
    memoryBoxes.forEach(box => {
        const description = box.querySelector('.description');
        if (description) {
            // Initially hide the description
            description.style.opacity = '0';
            description.style.visibility = 'hidden';
            
            // Show description only when box is expanded
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const isExpanded = box.classList.contains('expanded');
                        description.style.opacity = isExpanded ? '1' : '0';
                        description.style.visibility = isExpanded ? 'visible' : 'hidden';
                    }
                });
            });
            
            observer.observe(box, { attributes: true });
        }
    });
});

// Game controls
function restartGame() {
    const gameFrame = document.querySelector('.game-frame');
    if (gameFrame) {
        gameFrame.contentWindow.location.reload();
    }
}

function toggleFullscreen() {
    const gameFrame = document.querySelector('.game-frame');
    if (!gameFrame) return;

    if (!document.fullscreenElement) {
        if (gameFrame.requestFullscreen) {
            gameFrame.requestFullscreen();
        } else if (gameFrame.webkitRequestFullscreen) {
            gameFrame.webkitRequestFullscreen();
        } else if (gameFrame.msRequestFullscreen) {
            gameFrame.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
}); 