// See More/Less functionality for portfolio descriptions
document.addEventListener('DOMContentLoaded', function() {
    const seeMoreLinks = document.querySelectorAll('.see-more-link');
    
    seeMoreLinks.forEach(link => {
        link.addEventListener('click', function() {
            const container = this.closest('.description-container');
            const shortDesc = container.querySelector('.short-desc');
            const fullDesc = container.querySelector('.full-desc');
            
            if (fullDesc.style.display === 'none') {
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