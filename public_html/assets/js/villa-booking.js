(function () {
    const bookingCard = document.querySelector('[data-booking-card]');

    if (!bookingCard) {
        return;
    }

    const dayPrice = Number(bookingCard.dataset.nightlyPrice || 0);
    const serviceFee = Number(bookingCard.dataset.serviceFee || 0);
    const checkinInput = bookingCard.querySelector('[data-booking-checkin]');
    const checkoutInput = bookingCard.querySelector('[data-booking-checkout]');
    const subtotalEl = bookingCard.querySelector('[data-summary="subtotal"]');
    const discountEl = bookingCard.querySelector('[data-summary="discount"]');
    const serviceEl = bookingCard.querySelector('[data-summary="service"]');
    const totalEl = bookingCard.querySelector('[data-summary="total"]');
    const stayMetaEl = bookingCard.querySelector('[data-summary="stay-meta"]');
    const submitBtn = bookingCard.querySelector('[data-booking-submit]');
    const flowTitleEl = document.querySelector('[data-flow-summary="title"]');
    const flowDatesEl = document.querySelector('[data-flow-summary="dates"]');
    const flowGuestsEl = document.querySelector('[data-flow-summary="guests"]');
    const flowTotalEl = document.querySelector('[data-flow-summary="total"]');

    const formatCurrency = (value) => `${Math.max(0, Math.round(value))} ش`;

    const parseIsoLocal = (value) => {
        if (!value) {
            return null;
        }

        const [year, month, day] = value.split('-').map(Number);
        if (!year || !month || !day) {
            return null;
        }

        return new Date(year, month - 1, day);
    };

    const getNights = () => {
        const checkin = parseIsoLocal(checkinInput?.value);
        const checkout = parseIsoLocal(checkoutInput?.value);

        if (!checkin || !checkout) {
            return 1;
        }

        const diffMs = checkout.getTime() - checkin.getTime();
        const nights = Math.round(diffMs / 86400000);
        return Math.max(1, nights);
    };

    const getDiscount = (subtotal, nights) => {
        if (nights >= 5) {
            return 220;
        }

        if (nights >= 3) {
            return 120;
        }

        if (nights >= 2) {
            return 60;
        }

        return 0;
    };

    const updateSummary = () => {
        const nights = getNights();
        const subtotal = nights * dayPrice;
        const discount = getDiscount(subtotal, nights);
        const total = subtotal - discount + serviceFee;

        if (subtotalEl) {
            subtotalEl.textContent = formatCurrency(subtotal);
        }

        if (discountEl) {
            discountEl.textContent = formatCurrency(discount);
        }

        if (serviceEl) {
            serviceEl.textContent = formatCurrency(serviceFee);
        }

        if (totalEl) {
            totalEl.textContent = formatCurrency(total);
        }

        if (stayMetaEl) {
            stayMetaEl.textContent = nights === 1 ? 'ليلة واحدة' : `${nights} ليال`;
        }

        if (flowTitleEl) {
            flowTitleEl.textContent = document.querySelector('.villa-details-title')?.textContent?.trim() || 'فيلا ضوء القمر';
        }

        if (flowDatesEl) {
            const checkinText = bookingCard.querySelector('[data-date-display="checkin"]')?.textContent?.trim() || '';
            const checkoutText = bookingCard.querySelector('[data-date-display="checkout"]')?.textContent?.trim() || '';
            flowDatesEl.textContent = `${checkinText} - ${checkoutText}`;
        }

        if (flowGuestsEl) {
            const people = bookingCard.querySelectorAll('.villa-stepper-input')[0]?.value || '2';
            const kids = bookingCard.querySelectorAll('.villa-stepper-input')[1]?.value || '1';
            flowGuestsEl.textContent = `${people} بالغين • ${kids} طفل`;
        }

        if (flowTotalEl) {
            flowTotalEl.textContent = formatCurrency(total);
        }
    };

    const navigateToConfirmation = () => {
        const villaTitle = document.querySelector('.villa-details-title')?.textContent?.trim() || 'فيلا ضوء القمر';
        const villaLocation = document.querySelector('.villa-meta-chip span')?.textContent?.trim() || 'أريحا - حي العقبة';
        const villaImage = document.querySelector('.villa-gallery-thumb img')?.getAttribute('src')
            || document.querySelector('.villa-gallery-main img')?.getAttribute('src')
            || '';
        const checkinDisplay = bookingCard.querySelector('[data-date-display="checkin"]')?.textContent?.trim() || '';
        const checkoutDisplay = bookingCard.querySelector('[data-date-display="checkout"]')?.textContent?.trim() || '';
        const people = bookingCard.querySelectorAll('.villa-stepper-input')[0]?.value || '2';
        const kids = bookingCard.querySelectorAll('.villa-stepper-input')[1]?.value || '1';

        const params = new URLSearchParams({
            title: villaTitle,
            location: villaLocation,
            image: villaImage,
            checkin: checkinDisplay,
            checkout: checkoutDisplay,
            stay: stayMetaEl?.textContent?.trim() || 'ليلة واحدة',
            subtotal: subtotalEl?.textContent?.trim() || formatCurrency(dayPrice),
            discount: discountEl?.textContent?.trim() || formatCurrency(0),
            service: serviceEl?.textContent?.trim() || formatCurrency(serviceFee),
            total: totalEl?.textContent?.trim() || formatCurrency(dayPrice + serviceFee),
            people,
            kids,
            ownerName: 'أبو يوسف الزعبي',
            ownerMobile: '0599 555 221',
            ownerWhatsapp: '972599555221'
        });

        window.location.href = `confirmation.html?${params.toString()}`;
    };

    bookingCard.querySelectorAll('[data-stepper]').forEach((stepper) => {
        const input = stepper.querySelector('input');

        if (!input) {
            return;
        }

        const getValue = () => Number(input.value || 0);
        const min = Number(input.min || 0);
        const max = Number(input.max || 99);
        const step = Number(input.step || 1);

        stepper.querySelectorAll('[data-stepper-action]').forEach((button) => {
            button.addEventListener('click', () => {
                const direction = button.dataset.stepperAction === 'increase' ? 1 : -1;
                const nextValue = Math.max(min, Math.min(max, getValue() + (direction * step)));
                input.value = String(nextValue);
                input.dispatchEvent(new Event('input', {bubbles: true}));
                input.dispatchEvent(new Event('change', {bubbles: true}));
            });
        });
    });

    checkinInput?.addEventListener('input', updateSummary);
    checkoutInput?.addEventListener('input', updateSummary);
    checkinInput?.addEventListener('change', updateSummary);
    checkoutInput?.addEventListener('change', updateSummary);

    submitBtn?.addEventListener('click', navigateToConfirmation);

    updateSummary();
})();
