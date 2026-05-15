(function () {
    const bookingBars = document.querySelectorAll('.search-booking');
    if (!bookingBars.length) {
        return;
    }

    const monthFormatter = new Intl.DateTimeFormat('ar', {month: 'long', year: 'numeric'});
    const weekdayFormatter = new Intl.DateTimeFormat('ar', {weekday: 'long'});
    const weekdayLabels = ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'];

    let activeContext = null;
    let currentViewDate = null;
    let calendarRoot = null;
    let titleEl = null;
    let kickerEl = null;
    let gridEl = null;
    let noteEl = null;

    function parseIsoLocal(value) {
        if (!value) {
            return null;
        }

        const [year, month, day] = value.split('-').map(Number);
        if (!year || !month || !day) {
            return null;
        }

        return new Date(year, month - 1, day);
    }

    function toIso(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function addDays(value, days) {
        const date = parseIsoLocal(value);
        if (!date) {
            return '';
        }

        date.setDate(date.getDate() + days);
        return toIso(date);
    }

    function formatDisplay(value) {
        const date = parseIsoLocal(value);
        if (!date) {
            return 'اختر التاريخ';
        }

        const weekday = weekdayFormatter.format(date);
        return `${weekday} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }

    function startOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }

    function isSameDay(a, b) {
        return a && b
            && a.getFullYear() === b.getFullYear()
            && a.getMonth() === b.getMonth()
            && a.getDate() === b.getDate();
    }

    function compareDates(a, b) {
        return a.getTime() - b.getTime();
    }

    function getMinDate(context) {
        if (!context || context.role !== 'checkout') {
            return null;
        }

        const checkinDate = parseIsoLocal(context.checkinInput.value);
        if (!checkinDate) {
            return null;
        }

        checkinDate.setDate(checkinDate.getDate() + 1);
        return checkinDate;
    }

    function ensureCalendar() {
        if (calendarRoot) {
            return;
        }

        calendarRoot = document.createElement('div');
        calendarRoot.className = 'booking-calendar';
        calendarRoot.innerHTML = `
            <button class="booking-calendar-scrim" type="button" aria-label="إغلاق التقويم"></button>
            <div class="booking-calendar-panel" role="dialog" aria-modal="true" aria-label="اختيار التاريخ" dir="rtl">
                <div class="booking-calendar-head">
                    <div class="booking-calendar-kicker"></div>
                    <div class="booking-calendar-toolbar">
                        <button class="booking-calendar-nav" type="button" data-calendar-nav="next" aria-label="الشهر التالي">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                        <div class="booking-calendar-title"></div>
                        <button class="booking-calendar-nav" type="button" data-calendar-nav="prev" aria-label="الشهر السابق">
                            <i class="bi bi-chevron-left"></i>
                        </button>
                    </div>
                </div>
                <div class="booking-calendar-body">
                    <div class="booking-calendar-weekdays">
                        ${weekdayLabels.map((label) => `<div class="booking-calendar-weekday">${label}</div>`).join('')}
                    </div>
                    <div class="booking-calendar-grid"></div>
                </div>
                <div class="booking-calendar-foot">
                    <div class="booking-calendar-note"></div>
                    <button class="booking-calendar-action" type="button" data-calendar-action="today">اليوم</button>
                </div>
            </div>
        `;

        document.body.appendChild(calendarRoot);

        titleEl = calendarRoot.querySelector('.booking-calendar-title');
        kickerEl = calendarRoot.querySelector('.booking-calendar-kicker');
        gridEl = calendarRoot.querySelector('.booking-calendar-grid');
        noteEl = calendarRoot.querySelector('.booking-calendar-note');

        calendarRoot.querySelector('.booking-calendar-scrim').addEventListener('click', closeCalendar);
        calendarRoot.querySelector('[data-calendar-nav="prev"]').addEventListener('click', () => {
            currentViewDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() - 1, 1);
            renderCalendar();
        });
        calendarRoot.querySelector('[data-calendar-nav="next"]').addEventListener('click', () => {
            currentViewDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 1);
            renderCalendar();
        });
        calendarRoot.querySelector('[data-calendar-action="today"]').addEventListener('click', () => {
            if (!activeContext) {
                return;
            }

            const today = new Date();
            const minDate = getMinDate(activeContext);
            const target = minDate && compareDates(today, minDate) < 0 ? minDate : today;
            selectDate(target);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && calendarRoot?.classList.contains('is-visible')) {
                closeCalendar();
            }
        });
    }

    function positionCalendar() {
        if (!calendarRoot || !activeContext) {
            return;
        }

        const panel = calendarRoot.querySelector('.booking-calendar-panel');
        if (window.innerWidth <= 576) {
            panel.style.removeProperty('top');
            panel.style.removeProperty('left');
            panel.style.removeProperty('right');
            return;
        }

        const triggerRect = activeContext.trigger.getBoundingClientRect();
        const panelRect = panel.getBoundingClientRect();
        const margin = 16;
        let left = triggerRect.right - panelRect.width;
        left = Math.max(margin, Math.min(left, window.innerWidth - panelRect.width - margin));

        let top = triggerRect.bottom + 14;
        if (top + panelRect.height > window.innerHeight - margin) {
            top = Math.max(margin, triggerRect.top - panelRect.height - 14);
        }

        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
    }

    function closeCalendar() {
        if (!calendarRoot) {
            return;
        }

        calendarRoot.classList.remove('is-visible');

        if (activeContext?.trigger) {
            activeContext.trigger.classList.remove('is-open');
        }

        activeContext = null;
    }

    function selectDate(date) {
        if (!activeContext) {
            return;
        }

        activeContext.input.value = toIso(date);
        activeContext.syncDates();
        activeContext.input.dispatchEvent(new Event('input', {bubbles: true}));
        activeContext.input.dispatchEvent(new Event('change', {bubbles: true}));
        closeCalendar();
    }

    function renderCalendar() {
        if (!activeContext || !calendarRoot) {
            return;
        }

        const visibleMonth = startOfMonth(currentViewDate || new Date());
        const selectedDate = parseIsoLocal(activeContext.input.value);
        const minDate = getMinDate(activeContext);
        const today = new Date();
        const monthStartDay = visibleMonth.getDay();
        const offset = (monthStartDay + 1) % 7;
        const gridStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1 - offset);

        titleEl.textContent = monthFormatter.format(visibleMonth);
        kickerEl.textContent = activeContext.role === 'checkin' ? 'اختيار موعد تسجيل الوصول' : 'اختيار موعد تسجيل المغادرة';
        noteEl.textContent = minDate
            ? `أقرب مغادرة: ${formatDisplay(toIso(minDate))}`
            : 'اختر التاريخ الأنسب لإقامتك';

        gridEl.innerHTML = '';

        for (let index = 0; index < 42; index += 1) {
            const cellDate = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'booking-calendar-day';
            button.textContent = String(cellDate.getDate());

            if (cellDate.getMonth() !== visibleMonth.getMonth()) {
                button.classList.add('is-outside');
            }

            if (isSameDay(cellDate, today)) {
                button.classList.add('is-today');
            }

            if (selectedDate && isSameDay(cellDate, selectedDate)) {
                button.classList.add('is-selected');
            }

            if (minDate && compareDates(cellDate, minDate) < 0) {
                button.classList.add('is-disabled');
                button.disabled = true;
            }

            button.addEventListener('click', () => selectDate(cellDate));
            gridEl.appendChild(button);
        }

        requestAnimationFrame(positionCalendar);
    }

    function openCalendar(context) {
        ensureCalendar();

        if (activeContext?.trigger && activeContext.trigger !== context.trigger) {
            activeContext.trigger.classList.remove('is-open');
        }

        activeContext = context;
        activeContext.trigger.classList.add('is-open');
        currentViewDate = parseIsoLocal(context.input.value) || new Date();
        calendarRoot.classList.add('is-visible');
        renderCalendar();
    }

    bookingBars.forEach((bar) => {
        const checkinTrigger = bar.querySelector('[data-date-role="checkin"]');
        const checkoutTrigger = bar.querySelector('[data-date-role="checkout"]');
        const checkinInput = checkinTrigger?.querySelector('.booking-date-input');
        const checkoutInput = checkoutTrigger?.querySelector('.booking-date-input');
        const checkinDisplay = checkinTrigger?.querySelector('[data-date-display="checkin"]');
        const checkoutDisplay = checkoutTrigger?.querySelector('[data-date-display="checkout"]');

        if (!checkinTrigger || !checkoutTrigger || !checkinInput || !checkoutInput) {
            return;
        }

        const syncDates = () => {
            if (checkinInput.value) {
                const minCheckout = addDays(checkinInput.value, 1);
                checkoutInput.min = minCheckout;

                if (!checkoutInput.value || checkoutInput.value < minCheckout) {
                    checkoutInput.value = minCheckout;
                }
            }

            if (checkinDisplay) {
                checkinDisplay.textContent = formatDisplay(checkinInput.value);
            }

            if (checkoutDisplay) {
                checkoutDisplay.textContent = formatDisplay(checkoutInput.value);
            }
        };

        const bindTrigger = (trigger, input, role) => {
            const open = () => openCalendar({
                bar,
                role,
                trigger,
                input,
                checkinInput,
                checkoutInput,
                syncDates
            });

            trigger.addEventListener('click', open);
            trigger.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    open();
                }
            });
        };

        bindTrigger(checkinTrigger, checkinInput, 'checkin');
        bindTrigger(checkoutTrigger, checkoutInput, 'checkout');

        checkinInput.addEventListener('input', syncDates);
        checkinInput.addEventListener('change', syncDates);
        checkoutInput.addEventListener('input', syncDates);
        checkoutInput.addEventListener('change', syncDates);

        syncDates();
    });

    window.addEventListener('resize', () => {
        if (calendarRoot?.classList.contains('is-visible')) {
            positionCalendar();
        }
    }, {passive: true});
})();
