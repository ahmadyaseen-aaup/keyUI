            (function () {
                const priceRange = document.getElementById('priceRange');
                const priceValue = document.getElementById('priceValue');
                const areaRange = document.getElementById('areaRange');
                const areaValue = document.getElementById('areaValue');
                const bedsRange = document.getElementById('bedsRange');
                const bedsValue = document.getElementById('bedsValue');
                const bathsRange = document.getElementById('bathsRange');
                const bathsValue = document.getElementById('bathsValue');

                if (priceRange && priceValue) {
                    priceRange.addEventListener('input', () => priceValue.textContent = priceRange.value);
                    priceValue.textContent = priceRange.value;
                }
                if (areaRange && areaValue) {
                    areaRange.addEventListener('input', () => areaValue.textContent = areaRange.value);
                    areaValue.textContent = areaRange.value;
                }
                if (bedsRange && bedsValue) {
                    bedsRange.addEventListener('input', () => bedsValue.textContent = bedsRange.value);
                    bedsValue.textContent = bedsRange.value;
                }
                if (bathsRange && bathsValue) {
                    bathsRange.addEventListener('input', () => bathsValue.textContent = bathsRange.value);
                    bathsValue.textContent = bathsRange.value;
                }
            })();
