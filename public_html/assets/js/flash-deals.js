(function () {
    const countdowns = document.querySelectorAll('[data-flash-countdown]');

    countdowns.forEach((countdown) => {
        const hoursEl = countdown.querySelector('[data-flash-unit="hours"]');
        const minutesEl = countdown.querySelector('[data-flash-unit="minutes"]');
        const secondsEl = countdown.querySelector('[data-flash-unit="seconds"]');
        const durationHours = Number(countdown.dataset.flashHours || 6);
        const targetTime = Date.now() + (durationHours * 60 * 60 * 1000);

        function render() {
            const remaining = Math.max(0, targetTime - Date.now());
            const totalSeconds = Math.floor(remaining / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
            if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
        }

        render();
        window.setInterval(render, 1000);
    });
})();

(function () {
    const featuredCard = document.querySelector('[data-flash-featured]');
    const previewCard = document.querySelector('[data-flash-preview]');
    const slides = Array.from(document.querySelectorAll('[data-flash-slide]'));
    const previousButton = document.querySelector('[data-flash-prev]');
    const nextButton = document.querySelector('[data-flash-next]');

    if (!featuredCard || !previewCard || !slides.length) {
        return;
    }

    const featuredImage = featuredCard.querySelector('[data-flash-featured-image]');
    const featuredDiscount = featuredCard.querySelector('[data-flash-featured-discount]');
    const featuredUrgent = featuredCard.querySelector('[data-flash-featured-urgent]');
    const featuredAvailability = featuredCard.querySelector('[data-flash-featured-availability]');
    const featuredLocation = featuredCard.querySelector('[data-flash-featured-location]');
    const featuredTitle = featuredCard.querySelector('[data-flash-featured-title]');
    const featuredCopy = featuredCard.querySelector('[data-flash-featured-copy]');
    const featuredOldPrice = featuredCard.querySelector('[data-flash-featured-old-price]');
    const featuredNewPrice = featuredCard.querySelector('[data-flash-featured-new-price]');
    const featuredNote = featuredCard.querySelector('[data-flash-featured-note]');
    const featuredCta = featuredCard.querySelector('[data-flash-featured-cta]');

    const previewImage = previewCard.querySelector('[data-flash-preview-image]');
    const previewDiscount = previewCard.querySelector('[data-flash-preview-discount]');
    const previewTitle = previewCard.querySelector('[data-flash-preview-title]');
    const previewLocation = previewCard.querySelector('[data-flash-preview-location]');
    const previewPrice = previewCard.querySelector('[data-flash-preview-price]');
    const previousIcon = previousButton?.querySelector('i');
    const nextIcon = nextButton?.querySelector('i');

    function extractItem(element) {
        const image = element.querySelector('img');

        return {
            imageSrc: image?.getAttribute('src') || '',
            imageAlt: image?.getAttribute('alt') || '',
            title: element.dataset.featuredTitle || '',
            location: element.dataset.featuredLocation || '',
            copy: element.dataset.featuredCopy || '',
            discount: element.dataset.featuredDiscount || '',
            urgent: element.dataset.featuredUrgent || '',
            availability: element.dataset.featuredAvailability || '',
            oldPrice: element.dataset.featuredOldPrice || '',
            newPrice: element.dataset.featuredNewPrice || '',
            note: element.dataset.featuredNote || '',
            href: element.dataset.featuredHref || element.getAttribute('href') || 'villa-details.html'
        };
    }

    const items = [extractItem(featuredCard), ...slides.map(extractItem)];
    let currentIndex = 0;
    let isAnimating = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchDeltaX = 0;
    let touchDeltaY = 0;

    function isRtl() {
        return document.documentElement.getAttribute('dir') !== 'ltr';
    }

    function syncArrowIcons() {
        if (previousIcon) {
            previousIcon.className = isRtl() ? 'bi bi-chevron-right' : 'bi bi-chevron-left';
        }

        if (nextIcon) {
            nextIcon.className = isRtl() ? 'bi bi-chevron-left' : 'bi bi-chevron-right';
        }
    }

    function getNextIndex() {
        return (currentIndex + 1) % items.length;
    }

    function renderFeatured(item) {
        if (featuredImage) {
            featuredImage.setAttribute('src', item.imageSrc);
            featuredImage.setAttribute('alt', item.imageAlt || item.title);
        }

        if (featuredDiscount) featuredDiscount.textContent = item.discount;
        if (featuredUrgent) featuredUrgent.textContent = item.urgent;
        if (featuredAvailability) featuredAvailability.textContent = item.availability;
        if (featuredLocation) featuredLocation.textContent = item.location;
        if (featuredTitle) featuredTitle.textContent = item.title;
        if (featuredCopy) featuredCopy.textContent = item.copy;
        if (featuredOldPrice) featuredOldPrice.textContent = item.oldPrice;
        if (featuredNewPrice) featuredNewPrice.textContent = item.newPrice;
        if (featuredNote) featuredNote.textContent = item.note;
        if (featuredCta) featuredCta.setAttribute('href', item.href);
    }

    function renderPreview(item) {
        if (previewImage) {
            previewImage.setAttribute('src', item.imageSrc);
            previewImage.setAttribute('alt', item.imageAlt || item.title);
        }

        if (previewDiscount) previewDiscount.textContent = item.discount;
        if (previewTitle) previewTitle.textContent = item.title;
        if (previewLocation) previewLocation.textContent = item.location;
        if (previewPrice) previewPrice.textContent = item.newPrice;
    }

    function renderAll() {
        renderFeatured(items[currentIndex]);
        renderPreview(items[getNextIndex()]);
    }

    function animateTo(nextIndex, direction) {
        if (isAnimating) {
            return;
        }

        isAnimating = true;
        const boundedIndex = (nextIndex + items.length) % items.length;
        const directionClass = direction === 'prev' ? 'is-slide-prev' : 'is-slide-next';

        [featuredCard, previewCard].forEach((card) => {
            card.classList.remove('is-transition-in', 'is-transition-out', 'is-slide-next', 'is-slide-prev');
            card.classList.add('is-transitioning', directionClass, 'is-transition-out');
        });

        window.setTimeout(() => {
            currentIndex = boundedIndex;
            renderAll();

            [featuredCard, previewCard].forEach((card) => {
                card.classList.remove('is-transition-out');
                card.classList.add('is-transition-in');
            });

            window.setTimeout(() => {
                [featuredCard, previewCard].forEach((card) => {
                    card.classList.remove('is-transitioning', 'is-transition-in', 'is-slide-next', 'is-slide-prev');
                });
                isAnimating = false;
            }, 260);
        }, 170);
    }

    if (previousButton) {
        previousButton.addEventListener('click', () => {
            if (isRtl()) {
                animateTo(currentIndex - 1, 'prev');
            } else {
                animateTo(currentIndex + 1, 'next');
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (isRtl()) {
                animateTo(currentIndex + 1, 'next');
            } else {
                animateTo(currentIndex - 1, 'prev');
            }
        });
    }

    window.addEventListener('keygo:languagechange', syncArrowIcons);

    function onTouchStart(event) {
        if (!event.touches || event.touches.length !== 1) {
            return;
        }

        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchDeltaX = 0;
        touchDeltaY = 0;
    }

    function onTouchMove(event) {
        if (!event.touches || event.touches.length !== 1) {
            return;
        }

        const touch = event.touches[0];
        touchDeltaX = touch.clientX - touchStartX;
        touchDeltaY = touch.clientY - touchStartY;
    }

    function onTouchEnd() {
        const absX = Math.abs(touchDeltaX);
        const absY = Math.abs(touchDeltaY);

        if (absX < 48 || absX <= absY * 1.15) {
            return;
        }

        if (touchDeltaX < 0) {
            animateTo(currentIndex + 1, 'next');
        } else {
            animateTo(currentIndex - 1, 'prev');
        }
    }

    [featuredCard, previewCard].forEach((card) => {
        card.addEventListener('touchstart', onTouchStart, { passive: true });
        card.addEventListener('touchmove', onTouchMove, { passive: true });
        card.addEventListener('touchend', onTouchEnd, { passive: true });
    });

    syncArrowIcons();
    renderAll();
})();
