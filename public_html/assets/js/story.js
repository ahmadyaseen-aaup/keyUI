(function () {
    const rail = document.querySelector('.story-rail');
    if (!rail) return;
    const previousButton = rail.id ? document.querySelector(`[data-story-prev="${rail.id}"]`) : null;
    const nextButton = rail.id ? document.querySelector(`[data-story-next="${rail.id}"]`) : null;
    const previousIcon = previousButton?.querySelector('i');
    const nextIcon = nextButton?.querySelector('i');

    let isDragging = false;
    let startX = 0;
    let startScroll = 0;

    function isRtl() {
        return document.documentElement.getAttribute('dir') !== 'ltr';
    }

    function syncArrowIcons() {
        if (previousIcon) {
            previousIcon.className = isRtl() ? 'bi bi-chevron-right' : 'bi bi-chevron-left';
        }

        if (nextIcon) {
            nextIcon.className = isRtl() ? 'bi bi-chevron-left' : 'bi bi-chevron-right';
        }
    }

    function getPreviousStep() {
        return isRtl() ? -getStep() : getStep();
    }

    function getNextStep() {
        return isRtl() ? getStep() : -getStep();
    }

    function getStep() {
        const firstCard = rail.querySelector('.story-card');
        if (!firstCard) {
            return 150;
        }

        return firstCard.getBoundingClientRect().width + 18;
    }

    rail.setAttribute('tabindex', '0');

    rail.addEventListener('wheel', (event) => {
        const mostlyVertical = Math.abs(event.deltaY) > Math.abs(event.deltaX);
        if (!mostlyVertical) return;

        event.preventDefault();
        rail.scrollBy({
            left: event.deltaY,
            behavior: 'auto'
        });
    }, { passive: false });

    rail.addEventListener('mousedown', (event) => {
        if (event.button !== 0) return;

        isDragging = false;
        startX = event.clientX;
        startScroll = rail.scrollLeft;
        rail.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', (event) => {
        if (!rail.classList.contains('is-dragging')) return;

        const delta = event.clientX - startX;
        if (Math.abs(delta) > 6) {
            isDragging = true;
        }

        if (!isDragging) return;

        rail.scrollLeft = startScroll - delta;
    });

    function stopDragging() {
        if (!rail.classList.contains('is-dragging')) return;
        rail.classList.remove('is-dragging');
    }

    window.addEventListener('mouseup', stopDragging);

    rail.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            rail.scrollBy({ left: getPreviousStep(), behavior: 'smooth' });
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            rail.scrollBy({ left: getNextStep(), behavior: 'smooth' });
        }
    });

    if (previousButton) {
        previousButton.addEventListener('click', () => {
            rail.scrollBy({ left: getPreviousStep(), behavior: 'smooth' });
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            rail.scrollBy({ left: getNextStep(), behavior: 'smooth' });
        });
    }

    window.addEventListener('keygo:languagechange', syncArrowIcons);
    syncArrowIcons();
})();

(function () {
    const cards = Array.from(document.querySelectorAll('.story-card'));
    const viewer = document.getElementById('storyViewer');
    const mediaHost = document.getElementById('storyViewerMedia');
    const progressHost = document.getElementById('storyProgress');
    const titleEl = document.getElementById('storyViewerTitle');
    const metaEl = document.getElementById('storyViewerMeta');
    const avatarEl = document.getElementById('storyViewerAvatar');
    const captionEl = document.getElementById('storyViewerCaption');
    const bookBtnEl = document.getElementById('storyViewerBookBtn');
    const closeBtn = document.getElementById('storyViewerClose');
    const playToggleBtn = document.getElementById('storyPlayToggle');
    const prevBtn = document.getElementById('storyPrev');
    const nextBtn = document.getElementById('storyNext');
    const stageEl = viewer?.querySelector('.story-viewer-stage');
    const shellEl = viewer?.querySelector('.story-viewer-shell');
    const transitionLayerEl = document.getElementById('storyTransitionLayer');
    const isRtl = getComputedStyle(document.documentElement).direction === 'rtl';
    const VIEWED_STORIES_KEY = 'keygo_viewed_stories_v1';

    if (!cards.length || !viewer || !mediaHost || !progressHost || !titleEl || !metaEl || !avatarEl || !captionEl || !bookBtnEl || !closeBtn || !playToggleBtn || !prevBtn || !nextBtn || !stageEl || !shellEl || !transitionLayerEl) {
        return;
    }

    const extraImages = [
        "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
    ];

    const videoPool = [
        "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/bee.mp4",
        "https://www.w3schools.com/html/mov_bbb.mp4"
    ];

    const leadLines = [
        "جولة سريعة داخل المكان مع تفاصيل الحجز لهذا اليوم.",
        "لقطات قصيرة توضح الجو العام والمساحات الداخلية.",
        "تفاصيل جديدة ومشاهد حية قبل تأكيد الحجز."
    ];

    const stories = cards.map((card, index) => {
        const image = card.querySelector('img');
        const title = card.querySelector('.story-name')?.textContent?.trim() || `قصة ${index + 1}`;
        const meta = card.querySelector('.story-meta')?.textContent?.trim() || 'كي جو';
        const thumb = image?.getAttribute('src') || '';
        const alt = image?.getAttribute('alt') || title;

        return {
            title,
            meta,
            thumb,
            alt,
            href: card.dataset.storyHref || card.dataset.detailsHref || 'villa-details.html',
            slides: [
                {
                    type: 'image',
                    src: thumb,
                    duration: 4800,
                    caption: `${title} - ${leadLines[index % leadLines.length]}`
                },
                {
                    type: 'image',
                    src: extraImages[index % extraImages.length],
                    duration: 4400,
                    caption: `تفاصيل إضافية عن ${title} مع أجواء المكان وتجهيزاته.`
                },
                {
                    type: 'video',
                    src: videoPool[index % videoPool.length],
                    poster: extraImages[(index + 2) % extraImages.length],
                    caption: `مشهد فيديو قصير يوضح الإحساس العام داخل ${title}.`
                }
            ]
        };
    });

    let currentStoryIndex = 0;
    let currentSlideIndex = 0;
    let rafId = 0;
    let imageTimerStartedAt = 0;
    let imageElapsed = 0;
    let imageDuration = 5000;
    let activeVideo = null;
    let isOpen = false;
    let isPaused = false;
    let swipePointerId = null;
    let swipeStartX = 0;
    let swipeStartY = 0;
    let swipeLastX = 0;
    let swipeLastY = 0;
    let pointerStartTime = 0;
    let transitionTimeoutId = 0;
    const viewedStories = loadViewedStories();

    function cancelTick() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
        }
    }

    function loadViewedStories() {
        try {
            const raw = localStorage.getItem(VIEWED_STORIES_KEY);
            if (!raw) return new Set();
            const parsed = JSON.parse(raw);
            return new Set(Array.isArray(parsed) ? parsed : []);
        } catch (error) {
            return new Set();
        }
    }

    function saveViewedStories() {
        try {
            localStorage.setItem(VIEWED_STORIES_KEY, JSON.stringify(Array.from(viewedStories)));
        } catch (error) { }
    }

    function applyViewedState() {
        cards.forEach((card, index) => {
            card.classList.toggle('is-viewed', viewedStories.has(index));
        });
    }

    function markStoryViewed(index) {
        if (viewedStories.has(index)) return;
        viewedStories.add(index);
        saveViewedStories();
        applyViewedState();
    }

    function setMediaLoading(isLoading) {
        mediaHost.classList.toggle('is-loading', isLoading);
    }

    function updatePlayToggleIcon() {
        const icon = playToggleBtn.querySelector('i');
        if (!icon) return;

        icon.className = isPaused ? 'bi bi-play-fill' : 'bi bi-pause-fill';
        playToggleBtn.setAttribute('aria-label', isPaused ? 'استئناف' : 'إيقاف مؤقت');
    }

    function buildProgress(story) {
        progressHost.innerHTML = '';

        story.slides.forEach((_, slideIndex) => {
            const item = document.createElement('div');
            item.className = 'story-progress-item';

            const bar = document.createElement('div');
            bar.className = 'story-progress-bar';
            bar.style.width = slideIndex < currentSlideIndex ? '100%' : '0%';

            item.appendChild(bar);
            progressHost.appendChild(item);
        });
    }

    function setProgress(value) {
        const bars = progressHost.querySelectorAll('.story-progress-bar');

        bars.forEach((bar, index) => {
            if (index < currentSlideIndex) {
                bar.style.width = '100%';
            } else if (index > currentSlideIndex) {
                bar.style.width = '0%';
            } else {
                bar.style.width = `${Math.max(0, Math.min(100, value))}%`;
            }
        });
    }

    function nextSlide() {
        const story = stories[currentStoryIndex];

        if (currentSlideIndex < story.slides.length - 1) {
            currentSlideIndex += 1;
            renderCurrentSlide();
            return;
        }

        if (currentStoryIndex < stories.length - 1) {
            currentStoryIndex += 1;
            currentSlideIndex = 0;
            markStoryViewed(currentStoryIndex);
            renderCurrentStory();
            return;
        }

        closeViewer();
    }

    function prevSlide() {
        if (currentSlideIndex > 0) {
            currentSlideIndex -= 1;
            renderCurrentSlide();
            return;
        }

        if (currentStoryIndex > 0) {
            currentStoryIndex -= 1;
            currentSlideIndex = stories[currentStoryIndex].slides.length - 1;
            markStoryViewed(currentStoryIndex);
            renderCurrentStory();
        }
    }

    function nextStory() {
        if (currentStoryIndex < stories.length - 1) {
            transitionToStory(currentStoryIndex + 1, 'next');
            return;
        }

        closeViewer();
    }

    function prevStory() {
        if (currentStoryIndex > 0) {
            transitionToStory(currentStoryIndex - 1, 'prev');
            return;
        }

        currentSlideIndex = 0;
        renderCurrentStory();
    }

    function goForwardSlide() {
        nextSlide();
    }

    function goBackwardSlide() {
        prevSlide();
    }

    function goForwardStory() {
        nextStory();
    }

    function goBackwardStory() {
        prevStory();
    }

    function getVisualStoryTransition(direction) {
        if (direction !== 'next' && direction !== 'prev') return direction;
        if (!isRtl) return direction;
        return direction === 'next' ? 'prev' : 'next';
    }

    function tickImage(timestamp) {
        if (!isOpen || isPaused) return;

        if (!imageTimerStartedAt) {
            imageTimerStartedAt = timestamp - imageElapsed;
        }

        imageElapsed = timestamp - imageTimerStartedAt;
        const progress = (imageElapsed / imageDuration) * 100;
        setProgress(progress);

        if (imageElapsed >= imageDuration) {
            nextSlide();
            return;
        }

        rafId = requestAnimationFrame(tickImage);
    }

    function startImageTimer(duration) {
        cancelTick();
        imageDuration = duration;
        imageElapsed = 0;
        imageTimerStartedAt = 0;
        rafId = requestAnimationFrame(tickImage);
    }

    function renderVideoSlide(slide) {
        const video = document.createElement('video');
        video.src = slide.src;
        video.playsInline = true;
        video.autoplay = true;
        video.muted = true;
        video.preload = 'metadata';
        video.poster = slide.poster || '';
        video.setAttribute('webkit-playsinline', 'true');

        setMediaLoading(true);
        mediaHost.replaceChildren(video);
        activeVideo = video;
        setProgress(0);

        video.addEventListener('loadedmetadata', () => {
            if (!isOpen) return;
            setMediaLoading(false);
            video.play().catch(() => { });
        });

        video.addEventListener('canplay', () => {
            setMediaLoading(false);
        });

        video.addEventListener('timeupdate', () => {
            if (!video.duration || Number.isNaN(video.duration)) return;
            setProgress((video.currentTime / video.duration) * 100);
        });

        video.addEventListener('ended', () => {
            nextSlide();
        });

        video.addEventListener('error', () => {
            setMediaLoading(false);
            nextSlide();
        });
    }

    function renderImageSlide(slide) {
        const img = document.createElement('img');
        img.src = slide.src;
        img.alt = slide.caption || '';
        setMediaLoading(true);
        mediaHost.replaceChildren(img);
        activeVideo = null;

        img.addEventListener('load', () => {
            setMediaLoading(false);
            startImageTimer(slide.duration || 5000);
        }, { once: true });

        img.addEventListener('error', () => {
            setMediaLoading(false);
            nextSlide();
        }, { once: true });

        if (img.complete) {
            setMediaLoading(false);
            startImageTimer(slide.duration || 5000);
        }
    }

    function renderCurrentSlide() {
        cancelTick();

        if (activeVideo) {
            activeVideo.pause();
            activeVideo = null;
        }

        const story = stories[currentStoryIndex];
        const slide = story.slides[currentSlideIndex];
        captionEl.textContent = slide.caption || '';
        bookBtnEl.setAttribute('href', story.href || 'villa-details.html');
        setProgress(0);

        if (slide.type === 'video') {
            renderVideoSlide(slide);
        } else {
            renderImageSlide(slide);
        }

        isPaused = false;
        updatePlayToggleIcon();
    }

    function renderCurrentStory() {
        const story = stories[currentStoryIndex];
        titleEl.textContent = story.title;
        metaEl.textContent = story.meta;
        avatarEl.src = story.thumb;
        avatarEl.alt = story.alt;
        buildProgress(story);
        renderCurrentSlide();
    }

    function openViewer(storyIndex) {
        currentStoryIndex = storyIndex;
        currentSlideIndex = 0;
        isOpen = true;
        isPaused = false;
        markStoryViewed(storyIndex);
        viewer.classList.add('is-open');
        viewer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('story-open');
        renderCurrentStory();
    }

    function closeViewer() {
        isOpen = false;
        cancelTick();

        if (activeVideo) {
            activeVideo.pause();
            activeVideo = null;
        }

        viewer.classList.remove('is-open');
        viewer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('story-open');
        setMediaLoading(false);
        mediaHost.replaceChildren();
        transitionLayerEl.className = 'story-transition-layer';
        transitionLayerEl.replaceChildren();
        shellEl.classList.remove('is-hidden-during-transition');
    }

    function togglePause() {
        if (!isOpen) return;

        isPaused = !isPaused;
        updatePlayToggleIcon();

        if (activeVideo) {
            if (isPaused) {
                activeVideo.pause();
            } else {
                activeVideo.play().catch(() => { });
            }
            return;
        }

        if (isPaused) {
            cancelTick();
        } else {
            imageTimerStartedAt = 0;
            rafId = requestAnimationFrame(tickImage);
        }
    }

    function onViewerPointerDown(event) {
        if (!isOpen) return;
        if (event.target.closest('.story-viewer-actions, .story-viewer-book-btn')) return;

        swipePointerId = event.pointerId;
        swipeStartX = event.clientX;
        swipeStartY = event.clientY;
        swipeLastX = event.clientX;
        swipeLastY = event.clientY;
        pointerStartTime = Date.now();

        if (typeof stageEl.setPointerCapture === 'function') {
            stageEl.setPointerCapture(event.pointerId);
        }
    }

    function onViewerPointerMove(event) {
        if (swipePointerId !== event.pointerId) return;

        swipeLastX = event.clientX;
        swipeLastY = event.clientY;

        const deltaX = swipeLastX - swipeStartX;
        const deltaY = swipeLastY - swipeStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 12) {
            event.preventDefault();
        }
    }

    function finishViewerSwipe(event) {
        if (swipePointerId !== event.pointerId) return;

        const deltaX = swipeLastX - swipeStartX;
        const deltaY = swipeLastY - swipeStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        const elapsed = Date.now() - pointerStartTime;
        swipePointerId = null;

        if (typeof stageEl.releasePointerCapture === 'function' && typeof stageEl.hasPointerCapture === 'function' && stageEl.hasPointerCapture(event.pointerId)) {
            stageEl.releasePointerCapture(event.pointerId);
        }

        if (absDeltaX >= 60 && absDeltaX > absDeltaY * 1.2) {
            if (deltaX < 0) {
                goBackwardStory();
            } else {
                goForwardStory();
            }
            return;
        }

        if (event.target.closest('.story-viewer-book-btn')) {
            return;
        }

        if (absDeltaX <= 12 && absDeltaY <= 12 && elapsed < 350) {
            handleStageTap(event.clientX);
        }
    }

    function handleStageTap(clientX) {
        if (!isOpen) return;

        const rect = stageEl.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        const third = rect.width / 3;

        if (offsetX < third) {
            goForwardSlide();
            return;
        }

        if (offsetX > rect.width - third) {
            goBackwardSlide();
            return;
        }

        togglePause();
    }

    function buildSnapshotPanel(storyIndex, slideIndex, progressPercent, roleClass) {
        const story = stories[storyIndex];
        const slide = story.slides[slideIndex];
        const mediaSrc = slide.type === 'video' ? (slide.poster || story.thumb) : slide.src;

        const panel = document.createElement('div');
        panel.className = `story-transition-panel ${roleClass}`;

        const progressMarkup = story.slides.map((_, index) => {
            let width = '0%';
            if (index < slideIndex) width = '100%';
            if (index === slideIndex) width = `${Math.max(0, Math.min(100, progressPercent))}%`;

            return `
                <div class="story-progress-item">
                    <div class="story-progress-bar" style="width:${width}"></div>
                </div>
            `;
        }).join('');

        panel.innerHTML = `
            <div class="story-progress">${progressMarkup}</div>
            <div class="story-viewer-header">
                <div class="story-viewer-user">
                    <div class="story-viewer-avatar">
                        <img src="${story.thumb}" alt="${story.alt}">
                    </div>
                    <div class="story-viewer-copy">
                        <div class="story-viewer-title">${story.title}</div>
                        <div class="story-viewer-meta">${story.meta}</div>
                    </div>
                </div>
            </div>
            <div class="story-viewer-media">
                <img src="${mediaSrc}" alt="${slide.caption || story.title}">
            </div>
            <div class="story-viewer-gradient"></div>
            <div class="story-viewer-caption">
                <div class="story-viewer-caption-text">${slide.caption || ''}</div>
            </div>
        `;

        return panel;
    }

    function transitionToStory(targetStoryIndex, direction) {
        const visualDirection = getVisualStoryTransition(direction);
        const currentProgressBar = progressHost.querySelectorAll('.story-progress-bar')[currentSlideIndex];
        const currentProgress = currentProgressBar ? parseFloat(currentProgressBar.style.width) || 0 : 0;

        transitionLayerEl.replaceChildren(
            buildSnapshotPanel(currentStoryIndex, currentSlideIndex, currentProgress, 'from-panel'),
            buildSnapshotPanel(targetStoryIndex, 0, 0, 'to-panel')
        );

        transitionLayerEl.className = `story-transition-layer is-active ${visualDirection === 'next' ? 'is-next' : 'is-prev'}`;
        shellEl.classList.add('is-hidden-during-transition');

        currentStoryIndex = targetStoryIndex;
        currentSlideIndex = 0;
        markStoryViewed(targetStoryIndex);
        renderCurrentStory();

        if (transitionTimeoutId) {
            window.clearTimeout(transitionTimeoutId);
        }

        transitionTimeoutId = window.setTimeout(() => {
            transitionLayerEl.className = 'story-transition-layer';
            transitionLayerEl.replaceChildren();
            shellEl.classList.remove('is-hidden-during-transition');
            transitionTimeoutId = 0;
        }, 430);
    }

    cards.forEach((card, index) => {
        card.dataset.storyIndex = String(index);
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `عرض قصة ${stories[index].title}`);

        card.addEventListener('click', (event) => {
            event.preventDefault();
            openViewer(index);
        });
    });

    applyViewedState();

    closeBtn.addEventListener('click', closeViewer);
    playToggleBtn.addEventListener('click', togglePause);
    stageEl.addEventListener('pointerdown', onViewerPointerDown);
    stageEl.addEventListener('pointermove', onViewerPointerMove);
    stageEl.addEventListener('pointerup', finishViewerSwipe);
    stageEl.addEventListener('pointercancel', (event) => {
        if (swipePointerId !== event.pointerId) return;
        swipePointerId = null;
    });

    viewer.addEventListener('click', (event) => {
        if (event.target === viewer) {
            closeViewer();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (!isOpen) return;

        if (event.key === 'Escape') {
            closeViewer();
        }

        if (event.key === 'ArrowLeft') {
            goBackwardSlide();
        }

        if (event.key === 'ArrowRight') {
            goForwardSlide();
        }

        if (event.key === ' ' || event.key === 'Spacebar') {
            event.preventDefault();
            togglePause();
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (!isOpen) return;

        if (document.hidden && !isPaused) {
            togglePause();
        }
    });
})();
