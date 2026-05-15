(function () {
    const loaderEl = document.getElementById('confirmationLoader');
    const contentEl = document.getElementById('confirmationContent');
    const submitBtn = document.getElementById('confirmationSubmit');

    if (!loaderEl || !contentEl) {
        return;
    }

    const params = new URLSearchParams(window.location.search);

    const getValue = (key, fallback = '') => params.get(key) || fallback;

    const data = {
        title: getValue('title', 'فيلا ضوء القمر'),
        location: getValue('location', 'أريحا - حي العقبة'),
        image: getValue('image', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'),
        checkin: getValue('checkin', 'السبت 15/3/2026'),
        checkout: getValue('checkout', 'الثلاثاء 18/3/2026'),
        stay: getValue('stay', '3 ليال'),
        subtotal: getValue('subtotal', '1650 ش'),
        discount: getValue('discount', '120 ش'),
        service: getValue('service', '75 ش'),
        total: getValue('total', '1605 ش'),
        people: getValue('people', '2'),
        kids: getValue('kids', '1')
    };

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    };

    const imageEl = document.getElementById('confirmationVillaImage');
    if (imageEl) {
        imageEl.src = data.image;
        imageEl.alt = data.title;
    }

    setText('confirmationVillaTitle', data.title);
    setText('confirmationVillaLocation', data.location);
    setText('confirmationCheckin', data.checkin);
    setText('confirmationCheckout', data.checkout);
    setText('confirmationStay', data.stay);
    setText('confirmationSubtotal', data.subtotal);
    setText('confirmationDiscount', data.discount);
    setText('confirmationService', data.service);
    setText('confirmationTotal', data.total);
    setText('confirmationGuests', `${data.people} أشخاص${data.kids !== '0' ? ` • ${data.kids} أطفال` : ''}`);
    setText('confirmationSummaryTitle', data.title);
    setText('confirmationSummaryDates', `${data.checkin} - ${data.checkout}`);
    setText('confirmationSummaryGuests', `${data.people} أشخاص${data.kids !== '0' ? ` • ${data.kids} أطفال` : ''}`);
    setText('confirmationSummaryTotal', data.total);

    submitBtn?.addEventListener('click', () => {
        const nextParams = new URLSearchParams(data);
        window.location.href = `request.html?${nextParams.toString()}`;
    });

    window.setTimeout(() => {
        loaderEl.hidden = true;
        contentEl.hidden = false;
    }, 2000);
})();
