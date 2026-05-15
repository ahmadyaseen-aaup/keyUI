(function () {
    const groups = document.querySelectorAll('[data-listings-view]');

    if (!groups.length) {
        return;
    }

    const MOBILE_BREAKPOINT = 768;
    const DEFAULT_MOBILE_VIEW = 'list';
    const parseNumber = (value) => Number(String(value || '').replace(/[^\d.]/g, '')) || 0;

    const ensureCompactMetaRow = (container, discountText, oldPriceText) => {
        if (!container) {
            return;
        }

        let row = container.querySelector('.compact-meta-row');
        if (!row) {
            row = document.createElement('div');
            row.className = 'compact-meta-row';
            row.innerHTML = `
                <div class="compact-discount"></div>
                <div class="compact-old-price"><span class="compact-old-value"></span></div>
            `;
            container.prepend(row);
        }

        const discount = row.querySelector('.compact-discount');
        const oldPrice = row.querySelector('.compact-old-value');

        discount.textContent = discountText || '';
        oldPrice.textContent = oldPriceText || '';
    };

    const ensureVillaCompactMeta = (group) => {
        group.querySelectorAll('.listing-cardx').forEach((card) => {
            const bottom = card.querySelector('.listing-bottom');
            const oldNum = parseNumber(card.querySelector('.old-price .num')?.textContent);
            const newNum = parseNumber(card.querySelector('.new-price .num')?.textContent);

            if (!bottom || !oldNum || !newNum) {
                return;
            }

            const discountPercent = Math.max(0, Math.round(((oldNum - newNum) / oldNum) * 100));
            ensureCompactMetaRow(bottom, `%${discountPercent} خصم`, `${oldNum} ش`);
        });
    };

    const ensureOfferCompactPrice = (group) => {
        group.querySelectorAll('.offer-card').forEach((card) => {
            const bottom = card.querySelector('.offer-bottom');
            const title = bottom?.querySelector('.title');
            const subtitle = bottom?.querySelector('.sub');
            const newPrice = card.querySelector('.offer-prices .new .num');
            const oldNum = parseNumber(card.querySelector('.offer-prices .old .num')?.textContent);
            const discountPercent = card.querySelector('.offer-discount .percent')?.textContent?.trim() || '';

            if (!bottom || !title || !subtitle || !newPrice) {
                return;
            }

            let copy = bottom.querySelector('.offer-bottom-copy');
            if (!copy) {
                copy = document.createElement('div');
                copy.className = 'offer-bottom-copy';
                bottom.prepend(copy);
                copy.appendChild(title);
                copy.appendChild(subtitle);
            }

            let compactPrice = bottom.querySelector('.compact-price');
            if (!compactPrice) {
                compactPrice = document.createElement('div');
                compactPrice.className = 'compact-price';
                bottom.appendChild(compactPrice);
            }

            compactPrice.innerHTML = `
                <span class="compact-price-value">${newPrice.textContent.trim()} ش</span>
                <span class="compact-price-sub">اجمالي ليلة واحدة</span>
            `;

            ensureCompactMetaRow(bottom, discountPercent ? `خصم ${discountPercent}` : '', oldNum ? `${oldNum} ش` : '');
        });
    };

    const applyView = (group, controls, view, persist) => {
        const safeView = view === 'list' ? 'list' : 'grid';

        group.classList.toggle('is-list', safeView === 'list');
        group.classList.toggle('is-grid', safeView === 'grid');
        group.dataset.currentView = safeView;

        controls.querySelectorAll('[data-view-option]').forEach((button) => {
            const isActive = button.dataset.viewOption === safeView;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        if (persist) {
            localStorage.setItem(group.dataset.viewStorage, safeView);
        }
    };

    groups.forEach((group) => {
        if (group.dataset.listingsKind === 'villa') {
            ensureVillaCompactMeta(group);
        }

        if (group.dataset.listingsKind === 'offer') {
            ensureOfferCompactPrice(group);
        }

        const storageKey = group.dataset.viewStorage || '';
        const controls = document.querySelector(`[data-view-controls="${storageKey}"]`);

        if (!controls) {
            return;
        }

        const storedView = storageKey ? localStorage.getItem(storageKey) : null;
        applyView(group, controls, storedView || DEFAULT_MOBILE_VIEW, false);

        controls.querySelectorAll('[data-view-option]').forEach((button) => {
            button.addEventListener('click', () => {
                applyView(group, controls, button.dataset.viewOption, true);
            });
        });

        const onResize = () => {
            if (window.innerWidth >= MOBILE_BREAKPOINT) {
                group.classList.remove('is-list', 'is-grid');
                group.dataset.currentView = '';
                return;
            }

            applyView(group, controls, localStorage.getItem(storageKey) || DEFAULT_MOBILE_VIEW, false);
        };

        window.addEventListener('resize', onResize, {passive: true});
        onResize();
    });
})();
