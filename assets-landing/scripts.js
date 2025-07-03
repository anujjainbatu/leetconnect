// Smooth scrolling for navigation links
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

// Enhanced animation classes on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-on-scroll');
            
            // Special handling for features section
            if (entry.target.classList.contains('features')) {
                const featureCards = entry.target.querySelectorAll('.feature-card');
                featureCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animate-on-scroll');
                    }, index * 100);
                });
            }
            
            // Special handling for use-cases section
            if (entry.target.classList.contains('use-cases')) {
                const useCases = entry.target.querySelectorAll('.use-case');
                useCases.forEach((useCase, index) => {
                    setTimeout(() => {
                        useCase.classList.add('animate-on-scroll');
                    }, index * 150);
                });
            }
        }
    });
}, observerOptions);

// Observe all sections and individual cards
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Track button clicks for analytics (if needed)
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function() {
        // Add analytics tracking here if needed
        console.log('Button clicked:', this.textContent);
    });
});

// Add hover effects for feature cards
document.addEventListener('DOMContentLoaded', function() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Add subtle sound effect or haptic feedback here if needed
            this.style.transform = 'translateY(-10px) rotateX(5deg) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
});