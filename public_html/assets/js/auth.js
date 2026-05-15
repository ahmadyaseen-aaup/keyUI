(function () {
    const toggles = document.querySelectorAll('[data-auth-toggle]');

    toggles.forEach((button) => {
        const targetSelector = button.getAttribute('data-auth-toggle');
        const input = targetSelector ? document.querySelector(targetSelector) : null;
        const icon = button.querySelector('i');

        if (!input) {
            return;
        }

        button.addEventListener('click', () => {
            const isPassword = input.getAttribute('type') === 'password';
            input.setAttribute('type', isPassword ? 'text' : 'password');

            if (icon) {
                icon.className = isPassword ? 'bi bi-eye-slash' : 'bi bi-eye';
            }
        });
    });
})();
