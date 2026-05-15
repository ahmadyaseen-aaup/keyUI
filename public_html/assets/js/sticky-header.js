            (function () {
                const header = document.querySelector('.nav-sticky');
                const spacer = document.getElementById('nav-sticky-spacer');
                if (!header || !spacer)
                    return;

                const getSwitchPoint = () => header.offsetTop;

                let fixed = false;
                let switchPoint = getSwitchPoint();

                const setSpacer = (on) => {
                    if (!on) {
                        spacer.style.height = '0px';
                        return;
                    }
                    // use current rendered height (changes on mobile when top-strip hidden)
                    spacer.style.height = header.getBoundingClientRect().height + 'px';
                };

                const onScroll = () => {
                    const shouldFix = window.scrollY > switchPoint;

                    if (shouldFix && !fixed) {
                        fixed = true;
                        setSpacer(true);
                        header.classList.add('is-fixed');
                        // after class changes, height may change (mobile hides top strip)
                        requestAnimationFrame(() => setSpacer(true));
                    } else if (!shouldFix && fixed) {
                        fixed = false;
                        header.classList.remove('is-fixed');
                        setSpacer(false);
                    }
                };

                const onResize = () => {
                    switchPoint = getSwitchPoint();
                    if (fixed) {
                        // keep centered width & correct spacer height on resize/orientation change
                        setSpacer(true);
                        requestAnimationFrame(() => setSpacer(true));
                    }
                    onScroll();
                };

                window.addEventListener('scroll', onScroll, {passive: true});
                window.addEventListener('resize', onResize, {passive: true});

                onResize();
            })();
