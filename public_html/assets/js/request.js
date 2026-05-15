(function () {
    const stepButtons = Array.from(document.querySelectorAll('[data-step-target]'));
    const stepPanels = Array.from(document.querySelectorAll('[data-step-panel]'));
    const toPaymentBtn = document.getElementById('requestAdvanceToPayment');
    const toSuccessBtn = document.getElementById('requestAdvanceToSuccess');
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
        kids: getValue('kids', '1'),
        ownerName: getValue('ownerName', 'أبو يوسف الزعبي'),
        ownerMobile: getValue('ownerMobile', '0599 555 221'),
        ownerWhatsapp: getValue('ownerWhatsapp', '972599555221')
    };

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    };

    let currentStep = 1;
    let didInitialRender = false;

    function renderStep() {
        let activePanel = null;

        stepButtons.forEach((button) => {
            const step = Number(button.dataset.stepTarget);
            button.classList.toggle('is-active', step === currentStep);
            button.classList.toggle('is-complete', step <= currentStep);
            button.setAttribute('aria-current', step === currentStep ? 'step' : 'false');
        });

        stepPanels.forEach((panel) => {
            const step = Number(panel.dataset.stepPanel);
            const isActive = step === currentStep;
            panel.hidden = !isActive;
            panel.classList.toggle('is-active', isActive);
            if (isActive) {
                activePanel = panel;
            }
        });

        if (didInitialRender && activePanel) {
            window.setTimeout(() => {
                activePanel.scrollIntoView({behavior: 'smooth', block: 'start'});
            }, 120);
        }

        didInitialRender = true;
    }

    function startCountdown(element, totalSeconds, progressElement) {
        if (!element) return;

        let remaining = totalSeconds;

        function render() {
            const hours = Math.floor(remaining / 3600);
            const minutes = Math.floor((remaining % 3600) / 60);
            const seconds = remaining % 60;

            if (hours > 0) {
                element.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            } else {
                element.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }

            if (progressElement) {
                const ratio = totalSeconds > 0 ? remaining / totalSeconds : 0;
                progressElement.style.setProperty('--timer-progress', String(Math.max(0, ratio)));
            }
        }

        render();

        window.setInterval(() => {
            remaining = Math.max(0, remaining - 1);
            render();
        }, 1000);
    }

    const imageEl = document.getElementById('requestVillaImage');
    if (imageEl) {
        imageEl.src = data.image;
        imageEl.alt = data.title;
    }

    setText('requestVillaTitleStep1', data.title);
    setText('requestStayStep1', `${data.checkin} - ${data.checkout}`);
    setText('requestSubtotal', data.subtotal);
    setText('requestDiscount', data.discount);
    setText('requestService', data.service);
    setText('requestTotal', data.total);
    setText('requestSummaryTitle', data.title);
    setText('requestSummaryDates', `${data.checkin} - ${data.checkout}`);
    setText('requestSummaryGuests', `${data.people} أشخاص${data.kids !== '0' ? ` • ${data.kids} أطفال` : ''}`);
    setText('requestSummaryTotal', data.total);
    setText('requestVillaTitle', data.title);
    setText('requestVillaLocation', data.location);
    setText('requestCheckin', data.checkin);
    setText('requestCheckout', data.checkout);
    setText('requestStay', data.stay);
    setText('requestOwnerName', data.ownerName);
    setText('requestOwnerMobile', data.ownerMobile);

    const mobileDigits = data.ownerMobile.replace(/\s+/g, '');
    const callLink = document.getElementById('requestOwnerMobile');
    const callAction = document.getElementById('requestOwnerCallAction');
    const whatsappLink = document.getElementById('requestOwnerWhatsapp');
    const whatsappAction = document.getElementById('requestOwnerWhatsappAction');

    if (callLink) {
        callLink.href = `tel:${mobileDigits}`;
    }

    if (callAction) {
        callAction.href = `tel:${mobileDigits}`;
    }

    const whatsappUrl = `https://wa.me/${data.ownerWhatsapp}`;

    if (whatsappLink) {
        whatsappLink.href = whatsappUrl;
    }

    if (whatsappAction) {
        whatsappAction.href = whatsappUrl;
    }

    stepButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const step = Number(button.dataset.stepTarget);
            if (!step || step > currentStep) {
                return;
            }

            currentStep = step;
            renderStep();
        });
    });

    toPaymentBtn?.addEventListener('click', () => {
        currentStep = 2;
        renderStep();
    });

    toSuccessBtn?.addEventListener('click', () => {
        currentStep = 3;
        renderStep();
    });

    startCountdown(
        document.getElementById('requestWaitTimer'),
        30 * 60,
        document.getElementById('requestWaitTimerRing')
    );
    startCountdown(
        document.getElementById('requestPaymentTimer'),
        60 * 60,
        document.getElementById('requestPaymentTimerRing')
    );
    renderStep();
})();
