(function () {
    const galleries = document.querySelectorAll('[data-villa-gallery]');

    if (!galleries.length) {
        return;
    }

    galleries.forEach((gallery) => {
        const main = gallery.querySelector('[data-gallery-main]');
        const label = gallery.querySelector('[data-gallery-label]');
        const count = gallery.querySelector('[data-gallery-count]');
        const thumbs = Array.from(gallery.querySelectorAll('[data-gallery-thumb]'));
        const prevButton = gallery.querySelector('[data-gallery-prev]');
        const nextButton = gallery.querySelector('[data-gallery-next]');

        if (!main || !thumbs.length) {
            return;
        }

        let currentIndex = Math.max(0, thumbs.findIndex((thumb) => thumb.classList.contains('is-active')));

        const buildMedia = (thumb) => {
            const type = thumb.dataset.mediaType || 'image';
            const src = thumb.dataset.mediaSrc || '';
            const poster = thumb.dataset.mediaPoster || '';
            const mediaTitle = thumb.dataset.mediaTitle || '';
            const total = thumbs.length;

            if (!src) {
                return;
            }

            main.textContent = '';

            let node;

            if (type === 'video') {
                node = document.createElement('video');
                node.setAttribute('controls', '');
                node.setAttribute('playsinline', '');
                node.setAttribute('preload', 'metadata');
                if (poster) {
                    node.setAttribute('poster', poster);
                }

                const source = document.createElement('source');
                source.src = src;
                source.type = 'video/mp4';
                node.appendChild(source);
            } else {
                node = document.createElement('img');
                node.src = src;
                node.alt = mediaTitle;
                node.loading = 'eager';
            }

            main.appendChild(node);

            if (label) {
                label.innerHTML = '';
                const icon = document.createElement('i');
                icon.className = type === 'video' ? 'bi bi-play-circle' : 'bi bi-images';
                const text = document.createElement('span');
                text.textContent = mediaTitle || (type === 'video' ? 'جولة فيديو' : 'صورة من الفيلا');
                label.appendChild(icon);
                label.appendChild(text);
            }

            if (count) {
                count.textContent = `${currentIndex + 1}/${total}`;
            }
        };

        const setActive = (index) => {
            currentIndex = (index + thumbs.length) % thumbs.length;

            thumbs.forEach((thumb, thumbIndex) => {
                const isActive = thumbIndex === currentIndex;
                thumb.classList.toggle('is-active', isActive);
                thumb.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });

            buildMedia(thumbs[currentIndex]);
            thumbs[currentIndex].scrollIntoView({
                block: 'nearest',
                inline: 'nearest',
                behavior: 'smooth'
            });
        };

        thumbs.forEach((thumb, index) => {
            thumb.addEventListener('click', () => setActive(index));
        });

        if (prevButton) {
            prevButton.addEventListener('click', () => setActive(currentIndex - 1));
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => setActive(currentIndex + 1));
        }

        gallery.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                setActive(currentIndex + 1);
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                setActive(currentIndex - 1);
            }
        });

        setActive(currentIndex);
    });
})();
