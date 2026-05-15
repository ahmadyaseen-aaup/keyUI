(function () {
    const labels = {
        all: 'الكل',
        'private-pool': 'مسبح خاص',
        families: 'مناسبة للعائلات',
        'today-deals': 'عروض اليوم',
        nearby: 'قريبة منك',
        'open-view': 'إطلالة مفتوحة'
    };

    const params = new URLSearchParams(window.location.search);
    const shortcut = params.get('shortcut') || 'all';
    const shortcutLabel = labels[shortcut] || 'بحث سريع';
    const checkin = params.get('checkin') || 'السبت 15/3/2026';
    const checkout = params.get('checkout') || 'الثلاثاء 18/3/2026';

    const titleEl = document.querySelector('[data-results-title]');
    const subtitleEl = document.querySelector('[data-results-subtitle]');
    const countEls = document.querySelectorAll('[data-results-count]');
    const checkinDisplayEls = document.querySelectorAll('[data-date-display="checkin"]');
    const checkoutDisplayEls = document.querySelectorAll('[data-date-display="checkout"]');
    const shortcutButtons = Array.from(document.querySelectorAll('[data-results-shortcut-chip]'));
    const searchButton = document.querySelector('[data-results-search-btn]');

    const activateShortcut = (value) => {
        shortcutButtons.forEach((button) => {
            button.querySelectorAll('.bi.bi-magic').forEach((icon) => icon.remove());
            const isActive = button.dataset.shortcutValue === value;
            button.classList.toggle('is-active', isActive);
            if (isActive) {
                const icon = document.createElement('i');
                icon.className = 'bi bi-magic';
                button.insertBefore(icon, button.firstElementChild || null);
            }
        });
    };

    const buildResultsUrl = (shortcutValue) => {
        const params = new URLSearchParams();
        const activeShortcut = shortcutValue || shortcutButtons.find((button) => button.classList.contains('is-active'))?.dataset.shortcutValue || shortcut;
        const checkin = document.querySelector('[data-date-display="checkin"]')?.textContent.trim();
        const checkout = document.querySelector('[data-date-display="checkout"]')?.textContent.trim();

        if (activeShortcut && activeShortcut !== 'all') {
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

    if (titleEl) {
        titleEl.textContent = shortcut === 'all' ? 'جميع النتائج' : `نتائج ${shortcutLabel}`;
    }

    if (subtitleEl) {
        subtitleEl.textContent = shortcut === 'all'
            ? 'عرضنا لك 8 فلل متنوعة لتبدأ منها بسرعة. يمكنك تعديل البحث أو تطبيق أي اختصار من الأعلى.'
            : `عرضنا لك 8 فلل مناسبة لـ ${shortcutLabel}. يمكنك تعديل البحث أو تطبيق اختصار آخر بسهولة.`;
    }

    checkinDisplayEls.forEach((el) => {
        el.textContent = checkin;
    });

    checkoutDisplayEls.forEach((el) => {
        el.textContent = checkout;
    });

    countEls.forEach((el) => {
        el.textContent = '8 نتائج متاحة';
    });

    if (shortcutButtons.length) {
        activateShortcut(shortcut);
        shortcutButtons.forEach((button) => {
            button.addEventListener('click', () => {
                activateShortcut(button.dataset.shortcutValue);
                window.location.href = buildResultsUrl(button.dataset.shortcutValue);
            });
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', () => {
            window.location.href = buildResultsUrl();
        });
    }
})();
