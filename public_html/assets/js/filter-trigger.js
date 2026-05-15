            (function () {
                const trigger = document.querySelector('.filter-trigger');
                const canvas = document.getElementById('filtersCanvas');
                if (!trigger || !canvas)
                    return;

                // When offcanvas opens
                canvas.addEventListener('show.bs.offcanvas', () => {
                    trigger.classList.add('is-open');
                    trigger.setAttribute('aria-expanded', 'true');
                });

                // When offcanvas closes
                canvas.addEventListener('hidden.bs.offcanvas', () => {
                    trigger.classList.remove('is-open');
                    trigger.setAttribute('aria-expanded', 'false');
                });

                // Keyboard support (Enter / Space)
                trigger.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        trigger.click();
                    }
                });
            })();
