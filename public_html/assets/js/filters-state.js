            (function () {
                const STORAGE_KEY = 'keygo_filters_v1';

                const canvas = document.getElementById('filtersCanvas');
                const trigger = document.querySelector('.filter-trigger');
                const badgeEl = document.getElementById('filtersCountBadge');

                const clearBtn = document.getElementById('clearFiltersBtn');
                const applyBtn = document.getElementById('applyFiltersBtn');

                if (!canvas || !trigger || !badgeEl)
                    return;

                // Collect all filter inputs inside canvas
                const inputs = Array.from(canvas.querySelectorAll('input'));
                const ranges = inputs.filter(i => i.type === 'range');
                const checks = inputs.filter(i => i.type === 'checkbox');
                const radios = inputs.filter(i => i.type === 'radio');

                // ---------- helpers ----------
                const defaultValues = {
                    // match your markup defaults
                    priceRange: document.getElementById('priceRange')?.value ?? "700",
                    areaRange: document.getElementById('areaRange')?.value ?? "250",
                    bedsRange: document.getElementById('bedsRange')?.value ?? "2",
                    bathsRange: document.getElementById('bathsRange')?.value ?? "2",
                };

                function getState() {
                    const state = {inputs: {}};

                    inputs.forEach(el => {
                        if (!el.id && !el.name)
                            return;

                        // Use id if present, else name (for radio groups)
                        const key = el.id || el.name;

                        if (el.type === 'checkbox') {
                            state.inputs[key] = !!el.checked;
                        } else if (el.type === 'radio') {
                            // store chosen value per radio group name
                            if (el.name) {
                                if (el.checked)
                                    state.inputs[el.name] = el.value || el.id;
                            }
                        } else if (el.type === 'range') {
                            state.inputs[el.id] = el.value;
                        }
                    });

                    return state;
                }

                function applyState(state) {
                    if (!state || !state.inputs)
                        return;

                    // restore checkboxes + ranges
                    inputs.forEach(el => {
                        const key = el.id || el.name;
                        if (!key)
                            return;

                        if (el.type === 'checkbox') {
                            if (key in state.inputs)
                                el.checked = !!state.inputs[key];
                        } else if (el.type === 'range') {
                            if (key in state.inputs)
                                el.value = state.inputs[key];
                        }
                    });

                    // restore radio groups
                    const groups = new Map();
                    radios.forEach(r => {
                        if (r.name)
                            groups.set(r.name, true);
                    });

                    groups.forEach((_, name) => {
                        const saved = state.inputs[name];
                        if (saved == null)
                            return;
                        radios.filter(r => r.name === name).forEach(r => {
                            r.checked = (r.value === saved) || (r.id === saved);
                        });
                    });

                    // update the number labels (your existing spans)
                    const pv = document.getElementById('priceValue');
                    const av = document.getElementById('areaValue');
                    const bv = document.getElementById('bedsValue');
                    const bav = document.getElementById('bathsValue');

                    if (pv && document.getElementById('priceRange'))
                        pv.textContent = document.getElementById('priceRange').value;
                    if (av && document.getElementById('areaRange'))
                        av.textContent = document.getElementById('areaRange').value;
                    if (bv && document.getElementById('bedsRange'))
                        bv.textContent = document.getElementById('bedsRange').value;
                    if (bav && document.getElementById('bathsRange'))
                        bav.textContent = document.getElementById('bathsRange').value;
                }

                function isDefault() {
                    // checkbox defaults: unchecked
                    for (const c of checks) {
                        if (c.checked)
                            return false;
                    }

                    // radio defaults: none selected (unless you want a default city, then change this logic)
                    // if you want city1 as default, treat it as default:
                    for (const r of radios) {
                        if (r.checked)
                            return false;
                    }

                    // ranges defaults
                    const pr = document.getElementById('priceRange');
                    const ar = document.getElementById('areaRange');
                    const br = document.getElementById('bedsRange');
                    const bar = document.getElementById('bathsRange');

                    if (pr && pr.value !== defaultValues.priceRange)
                        return false;
                    if (ar && ar.value !== defaultValues.areaRange)
                        return false;
                    if (br && br.value !== defaultValues.bedsRange)
                        return false;
                    if (bar && bar.value !== defaultValues.bathsRange)
                        return false;

                    return true;
                }

                function selectedCount() {
                    // count “active” selections (you can tweak this definition)
                    let count = 0;

                    // checkboxes
                    checks.forEach(c => {
                        if (c.checked)
                            count++;
                    });

                    // radios: count selected per group, excluding city1 default if you want
                    const radioGroups = new Map();
                    radios.forEach(r => {
                        if (!r.name)
                            return;
                        if (r.checked)
                            radioGroups.set(r.name, r.id);
                    });


                    count += radioGroups.size;

                    // ranges count if changed from default
                    const pr = document.getElementById('priceRange');
                    const ar = document.getElementById('areaRange');
                    const br = document.getElementById('bedsRange');
                    const bar = document.getElementById('bathsRange');

                    if (pr && pr.value !== defaultValues.priceRange)
                        count++;
                    if (ar && ar.value !== defaultValues.areaRange)
                        count++;
                    if (br && br.value !== defaultValues.bedsRange)
                        count++;
                    if (bar && bar.value !== defaultValues.bathsRange)
                        count++;

                    return count;
                }

                function updateTriggerUI() {
                    const c = selectedCount();

                if (c > 0) {
                    badgeEl.textContent = String(c);
                    badgeEl.classList.remove('d-none');
                    
                } else {
                    badgeEl.classList.add('d-none');
                    
                }
            }

                function save() {
                    try {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(getState()));
                    } catch (e) {
                    }
                }

                function load() {
                    try {
                        const raw = localStorage.getItem(STORAGE_KEY);
                        if (!raw)
                            return;
                        const state = JSON.parse(raw);
                        applyState(state);
                    } catch (e) {
                    }
                }

                function clearAll() {
                    // clear checkboxes
                    checks.forEach(c => c.checked = false);

                    // radios: reset to city1 if exists, else clear all
                    radios.forEach(r => r.checked = false);

                    // reset ranges
                    const pr = document.getElementById('priceRange');
                    const ar = document.getElementById('areaRange');
                    const br = document.getElementById('bedsRange');
                    const bar = document.getElementById('bathsRange');

                    if (pr)
                        pr.value = defaultValues.priceRange;
                    if (ar)
                        ar.value = defaultValues.areaRange;
                    if (br)
                        br.value = defaultValues.bedsRange;
                    if (bar)
                        bar.value = defaultValues.bathsRange;

                    // update displayed labels
                    const pv = document.getElementById('priceValue');
                    const av = document.getElementById('areaValue');
                    const bv = document.getElementById('bedsValue');
                    const bav = document.getElementById('bathsValue');

                    if (pv && pr)
                        pv.textContent = pr.value;
                    if (av && ar)
                        av.textContent = ar.value;
                    if (bv && br)
                        bv.textContent = br.value;
                    if (bav && bar)
                        bav.textContent = bar.value;

                    // persist cleared
                    try {
                        localStorage.removeItem(STORAGE_KEY);
                    } catch (e) {
                    }
                    updateTriggerUI();
                }

                // ---------- wire events ----------
                load();
                updateTriggerUI();

                // Save + update on any change
                inputs.forEach(el => {
                    el.addEventListener('change', () => {
                        save();
                        updateTriggerUI();
                    });
                    if (el.type === 'range') {
                        el.addEventListener('input', () => {
                            save();
                            updateTriggerUI();
                        });
                    }
                });

                // Offcanvas open/close -> trigger behaves like select
                canvas.addEventListener('show.bs.offcanvas', () => {
                    trigger.classList.add('is-open');
                    trigger.setAttribute('aria-expanded', 'true');
                });

                canvas.addEventListener('hidden.bs.offcanvas', () => {
                    trigger.classList.remove('is-open');
                    trigger.setAttribute('aria-expanded', 'false');
                    // Like a select: after closing, label reflects selections
                    updateTriggerUI();
                });

                // Clear button
                if (clearBtn) {
                    clearBtn.addEventListener('click', () => {
                        clearAll();
                    });
                }

                // Apply button: close offcanvas (and keep saved state)
                if (applyBtn) {
                    applyBtn.addEventListener('click', () => {
                        save();
                        updateTriggerUI();
                        const inst = bootstrap.Offcanvas.getOrCreateInstance(canvas);
                        inst.hide();
                    });
                }

            })();
