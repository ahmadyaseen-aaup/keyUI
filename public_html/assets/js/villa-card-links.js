(function () {
    const RECENT_STORAGE_KEY = 'keygo_recently_viewed_villas';
    const SELECTED_STORAGE_KEY = 'keygo_selected_villa';
    const cards = document.querySelectorAll('.listing-cardx, .offer-card');

    if (!cards.length) {
        return;
    }

    const readRecentItems = () => {
        try {
            const raw = window.localStorage.getItem(RECENT_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    };

    const writeRecentItems = (items) => {
        try {
            window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(items));
        } catch (error) {
            // ignore storage errors
        }
    };

    const extractCardData = (card, detailsUrl) => {
        const title =
            card.querySelector('.listing-bottom .title')?.textContent?.trim()
            || card.querySelector('.offer-bottom .title')?.textContent?.trim()
            || 'فيلا مميزة';
        const location =
            card.querySelector('.listing-bottom .info-right .sub')?.textContent?.trim()
            || card.querySelector('.offer-bottom .sub')?.textContent?.trim()
            || 'وجهة خاصة';
        const image = card.querySelector('img')?.getAttribute('src') || '';
        const price =
            card.querySelector('.listing-bottom .info-left .price')?.textContent?.trim()
            || card.querySelector('.offer-prices .new .num')?.textContent?.trim()
            || '';

        return {
            id: `${title}-${location}`.replace(/\s+/g, '-'),
            title,
            location,
            image,
            price: price ? `${price.replace(/\s+/g, ' ')}${price.includes('ش') ? '' : ' ش'}` : 'السعر عند الطلب',
            href: detailsUrl,
            viewedAt: Date.now()
        };
    };

    const rememberCard = (card, detailsUrl) => {
        const nextItem = extractCardData(card, detailsUrl);
        const currentItems = readRecentItems().filter((item) => item && item.id !== nextItem.id);
        writeRecentItems([nextItem, ...currentItems].slice(0, 6));
    };

    const rememberSelectedVilla = (card, detailsUrl) => {
        const nextItem = extractCardData(card, detailsUrl);
        const oldPrice =
            card.querySelector('.listing-media .old-price .num')?.textContent?.trim()
            || card.querySelector('.offer-prices .old .num')?.textContent?.trim()
            || '';
        const ratingStars = card.querySelectorAll('.stars .bi-star-fill').length;

        try {
            window.localStorage.setItem(SELECTED_STORAGE_KEY, JSON.stringify({
                ...nextItem,
                oldPrice: oldPrice ? `${oldPrice}${oldPrice.includes('ش') ? '' : ' ش'}` : '',
                rating: ratingStars ? `${ratingStars}.0` : '4.9'
            }));
        } catch (error) {
            // ignore storage errors
        }
    };

    const navigateToDetails = (url) => {
        window.location.href = url;
    };

    cards.forEach((card) => {
        const detailsUrl = card.dataset.detailsHref || 'villa-details.html';
        const actionButtons = card.querySelectorAll('.overlay-btn, .btn-book');

        card.tabIndex = 0;
        card.setAttribute('role', 'link');
        card.style.cursor = 'pointer';

        card.addEventListener('click', (event) => {
            if (event.target.closest('a, input, select, textarea, label')) {
                return;
            }

            rememberCard(card, detailsUrl);
            rememberSelectedVilla(card, detailsUrl);
            navigateToDetails(detailsUrl);
        });

        card.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }

            event.preventDefault();
            rememberCard(card, detailsUrl);
            rememberSelectedVilla(card, detailsUrl);
            navigateToDetails(detailsUrl);
        });

        actionButtons.forEach((button) => {
            button.setAttribute('type', 'button');
            button.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                rememberCard(card, detailsUrl);
                rememberSelectedVilla(card, detailsUrl);
                navigateToDetails(detailsUrl);
            });
        });
    });
})();
