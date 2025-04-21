document.addEventListener('DOMContentLoaded', function() {
    // Get all see more links
    const seeMoreLinks = document.querySelectorAll('.see-more-link');
    
    seeMoreLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const descContainer = this.closest('.description');
            const fullDesc = descContainer.querySelector('.full-desc');
            
            // Toggle the full description
            if (fullDesc.style.display === 'block') {
                fullDesc.style.display = 'none';
                this.textContent = 'See More';
            } else {
                // Hide all other expanded descriptions first
                document.querySelectorAll('.full-desc').forEach(desc => {
                    if (desc !== fullDesc) {
                        desc.style.display = 'none';
                        desc.closest('.description').querySelector('.see-more-link').textContent = 'See More';
                    }
                });
                
                fullDesc.style.display = 'block';
                this.textContent = 'See Less';
            }
        });
    });
    
    // Close expanded description when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.description-container')) {
            document.querySelectorAll('.full-desc').forEach(desc => {
                desc.style.display = 'none';
                desc.closest('.description').querySelector('.see-more-link').textContent = 'See More';
            });
        }
    });
}); 