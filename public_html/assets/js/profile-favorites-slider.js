(function () {
    const rails = document.querySelectorAll('[data-favorites-rail]');

    if (!rails.length) {
        return;
    }

    const parsePriceValue = (text) => {
        const normalized = (text || '').replace(/[^\d]/g, '');
        const numeric = Number.parseInt(normalized, 10);
        return Number.isFinite(numeric) ? numeric : null;
    };

    const ensureOverlayMarkup = (card) => {
        const media = card.querySelector('.listing-media');
        if (!media || media.querySelector('.listing-overlay')) {
            return;
        }

        const priceText = card.querySelector('.info-left .price')?.textContent || '';
        const currentPrice = parsePriceValue(priceText);

        if (!currentPrice) {
            return;
        }

        const oldPrice = Math.round(currentPrice * 1.35);

        const overlay = document.createElement('div');
        overlay.className = 'listing-overlay';
        overlay.innerHTML = `
            <div class="overlay-top">
                <div class="old-price">
                    <span class="num">${oldPrice}</span>
                    <span class="cur">شيكل</span>
                    <span class="slash"></span>
                </div>
                <div class="new-price">
                    <span class="num">${currentPrice}</span>
                    <span class="cur">شيكل</span>
                </div>
                <div class="overlay-sub">إجمالي ليلة واحدة</div>
            </div>
            <button class="overlay-btn" type="button">احجز</button>
        `;

        media.appendChild(overlay);
    };

    rails.forEach((rail) => {
        rail.querySelectorAll('.listing-cardx').forEach(ensureOverlayMarkup);

        const previousButton = document.querySelector(`[data-favorites-prev="${rail.id}"]`);
        const nextButton = document.querySelector(`[data-favorites-next="${rail.id}"]`);

        const getStep = () => {
            const firstCard = rail.querySelector('.profile-favorites-card');
            if (!firstCard) {
                return 220;
            }

            const cardWidth = firstCard.getBoundingClientRect().width;
            return cardWidth + 12;
        };

        if (previousButton) {
            previousButton.addEventListener('click', () => {
                rail.scrollBy({left: -getStep(), behavior: 'smooth'});
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                rail.scrollBy({left: getStep(), behavior: 'smooth'});
            });
        }
    });
})();
