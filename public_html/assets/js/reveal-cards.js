(function () {
    const cards = [
        ...document.querySelectorAll('.section .listing-cardx'),
        ...document.querySelectorAll('.section .offer-card')
    ];

    if (!cards.length) {
        return;
    }

    cards.forEach((element, index) => {
        element.classList.add('reveal-card');

        const delay = Math.min((index % 8) * 70, 420);
        element.style.transitionDelay = `${delay}ms`;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, {
        root: null,
        threshold: 0.12,
        rootMargin: '0px 0px -10% 0px'
    });

    cards.forEach((element) => observer.observe(element));
})();
