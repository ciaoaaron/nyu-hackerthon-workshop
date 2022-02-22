class BasicGallery {
    constructor({ thumbNailClass, overlayClass, detailImageClass, overlayCloseBtnClass }) {
        const basicGallery = document.querySelector('.basic-gallery');
        if (!basicGallery) throw new Error('Cannot find element with class ".basic-gallery".');
        if (!thumbNailClass || !overlayClass || !detailImageClass || !overlayCloseBtnClass) throw new Error('Missing required selectors');

        const thumbnails = basicGallery.querySelectorAll(`.${thumbNailClass}`);
        const title = basicGallery.querySelector('h1');
        const overlay = basicGallery.querySelector(`.${overlayClass}`);
        const overlayCloseBtn = overlay?.querySelector(`.${overlayCloseBtnClass}`);
        const detailImgs = overlay?.querySelectorAll(`.${detailImageClass}`);
        
        if (!thumbnails.length || !overlay || !detailImgs || !overlayCloseBtn) throw new Error('Cannot find required elements.');

        this.thumbnails = Array.from(thumbnails);
        this.overlay = overlay;
        this.detailImgs = detailImgs;
        this.overlayCloseBtn = overlayCloseBtn;
        this.galleryTitle = title;
        this.defaultTitle = basicGallery.dataset.title || 'My Photo Gallery';

        this.thumbnails.forEach((thumbnail) => {
           thumbnail.addEventListener('click', this.showDetail.bind(this, thumbnail.dataset.idx));
        });

        this.overlayCloseBtn.addEventListener('click', this.hideDetail.bind(this));

        this.updateTitle(this.defaultTitle);

    }

    updateTitle(text) {
        this.galleryTitle.textContent = text;
    }

    showDetail(activeImageIdx, event) {
        const { currentTarget } = event;
        this.toggleActiveImage(activeImageIdx);
        this.updateTitle(currentTarget.dataset.title);
        this.showDetailOverlay();
        this.galleryTitle.focus();
    }

    toggleActiveImage(activeImageIdx) {
        this.detailImgs[activeImageIdx].classList.toggle('active');
        this.currentActiveIdx = Number.isInteger(this.currentActiveIdx) ? null : activeImageIdx;
    }

    hideDetail() {
        const idx = this.currentActiveIdx;
        this.toggleActiveImage(this.currentActiveIdx);
        this.updateTitle(this.defaultTitle);
        this.hideDetailOverlay();
        this.thumbnails[idx].children[0].focus();
    }

    showDetailOverlay() {
        document.body.classList.add('detail-view');
    }

    hideDetailOverlay() {
        document.body.classList.remove('detail-view');
    }
}

const g = new BasicGallery({
    thumbNailClass: 'photo',
    overlayClass: 'detail-overlay',
    detailImageClass: 'detail-overlay-img',
    overlayCloseBtnClass: 'close-button',
});