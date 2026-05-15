(function () {
    const RECENT_STORAGE_KEY = 'keygo_recently_viewed_villas';
    const SHORTCUT_STORAGE_KEY = 'keygo_home_shortcut';

    const shortcutButtons = Array.from(document.querySelectorAll('[data-shortcut-chip]'));
    const searchResultsButton = document.querySelector('.booking-search-btn');
    const recentSection = document.getElementById('recentlyViewedSection');
    const recentGrid = document.querySelector('[data-recently-viewed-grid]');
    const recentEmpty = document.querySelector('[data-recently-viewed-empty]');

    const readStorage = (key, fallback) => {
        try {
            const raw = window.localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            return fallback;
        }
    };

    const writeStorage = (key, value) => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            // ignore storage errors
        }
    };

    const activateShortcut = (value) => {
        shortcutButtons.forEach((button) => {
            button.classList.toggle('is-active', button.dataset.shortcutValue === value);
        });
        writeStorage(SHORTCUT_STORAGE_KEY, value);
    };

    const buildSearchResultsUrl = (shortcutValue) => {
        const params = new URLSearchParams();
        const activeShortcut = shortcutValue || readStorage(SHORTCUT_STORAGE_KEY, shortcutButtons[0]?.dataset.shortcutValue);
        const checkin = document.querySelector('[data-date-display="checkin"]')?.textContent.trim();
        const checkout = document.querySelector('[data-date-display="checkout"]')?.textContent.trim();

        if (activeShortcut) {
            params.set('shortcut', activeShortcut);
        }

        if (checkin) {
            params.set('checkin', checkin);
        }

        if (checkout) {
            params.set('checkout', checkout);
        }

        const query = params.toString();
        return `search-results.html${query ? `?${query}` : ''}`;
    };

    if (shortcutButtons.length) {
        const savedShortcut = readStorage(SHORTCUT_STORAGE_KEY, shortcutButtons[0]?.dataset.shortcutValue);
        activateShortcut(savedShortcut);

        shortcutButtons.forEach((button) => {
            button.addEventListener('click', () => {
                activateShortcut(button.dataset.shortcutValue);
                window.location.href = buildSearchResultsUrl(button.dataset.shortcutValue);
            });
        });
    }

    if (searchResultsButton) {
        searchResultsButton.addEventListener('click', () => {
            window.location.href = buildSearchResultsUrl();
        });
    }

    if (!recentSection || !recentGrid || !recentEmpty) {
        return;
    }

    const recentItems = readStorage(RECENT_STORAGE_KEY, []);

    if (!Array.isArray(recentItems) || !recentItems.length) {
        recentSection.hidden = true;
        return;
    }

    recentSection.hidden = false;
    recentEmpty.hidden = true;
    recentGrid.hidden = false;
    recentGrid.innerHTML = '';

    recentItems.slice(0, 3).forEach((item) => {
        if (!item) {
            return;
        }

        const link = document.createElement('a');
        link.className = 'recently-viewed-card';
        link.href = item.href || 'villa-details.html';
        link.innerHTML = `
            <div class="recently-viewed-media">
                <img src="${item.image || ''}" alt="${item.title || 'فيلا'}" />
            </div>
            <div class="recently-viewed-body">
                <div class="recently-viewed-info">
                    <div class="recently-viewed-meta">
                        <i class="bi bi-geo-alt-fill"></i>
                        <span>${item.location || 'وجهة خاصة'}</span>
                    </div>
                    <h3 class="recently-viewed-title">${item.title || 'فيلا مميزة'}</h3>
                </div>
                <div class="recently-viewed-offer">
                    <div class="recently-viewed-price">${item.price || 'السعر عند الطلب'}</div>
                    <div class="recently-viewed-note">إجمالي ليلة واحدة</div>
                </div>
            </div>
        `;

        recentGrid.appendChild(link);
    });
})();
