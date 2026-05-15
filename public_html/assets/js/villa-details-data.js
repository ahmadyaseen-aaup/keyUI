(function () {
    const SELECTED_STORAGE_KEY = 'keygo_selected_villa';

    const getSelectedVilla = () => {
        try {
            const raw = window.localStorage.getItem(SELECTED_STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    };

    const selectedVilla = getSelectedVilla();

    if (!selectedVilla) {
        return;
    }

    const setText = (selector, value) => {
        const element = document.querySelector(selector);
        if (element && value) {
            element.textContent = value;
        }
    };

    const title = selectedVilla.title || 'فيلا مميزة';
    const location = selectedVilla.location || 'وجهة خاصة';
    const image = selectedVilla.image || '';
    const price = selectedVilla.price || '550 ش';
    const rating = selectedVilla.rating || '4.9';

    document.title = `KeyGo - ${title}`;
    setText('.villa-details-title', title);
    setText('.villa-details-subtitle', `إقامة خاصة في ${location} مع خصوصية كاملة وأجواء مناسبة للعائلات والأصدقاء.`);

    const locationChip = document.querySelector('.villa-details-actions .villa-meta-chip:first-child span');
    if (locationChip) {
        locationChip.textContent = location;
    }

    const ratingChip = document.querySelector('.villa-details-actions .villa-meta-chip:nth-child(2) span');
    if (ratingChip) {
        ratingChip.textContent = `${rating} (128 تقييم)`;
    }

    const bookingCard = document.querySelector('[data-booking-card]');
    const bookingPriceMain = document.querySelector('.villa-booking-price-main strong');
    const numericPrice = Number(String(price).replace(/[^\d]/g, '')) || 550;

    if (bookingCard) {
        bookingCard.dataset.nightlyPrice = String(numericPrice);
    }

    if (bookingPriceMain) {
        bookingPriceMain.textContent = `${numericPrice} ش`;
    }

    const firstThumb = document.querySelector('[data-gallery-thumb]');
    if (firstThumb && image) {
        firstThumb.dataset.mediaType = 'image';
        firstThumb.dataset.mediaSrc = image;
        firstThumb.dataset.mediaTitle = title;

        const thumbImage = firstThumb.querySelector('img');
        if (thumbImage) {
            thumbImage.src = image;
            thumbImage.alt = title;
        }
    }
})();
