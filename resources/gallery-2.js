class BasicGallery {
    constructor({ thumbNailClass, overlayClass, detailImageClass, overlayCloseBtnClass }) {
        const basicGallery = document.querySelector('.basic-gallery');
        if (!basicGallery) throw new Error('Cannot find element with class ".basic-gallery".');
        if (!thumbNailClass || !overlayClass || !detailImageClass || !overlayCloseBtnClass) throw new Error('Missing required selectors');

        const thumbnails = basicGallery.querySelectorAll(`.${thumbNailClass}`);
        const title = basicGallery.querySelector('h1');

        const overlay = basicGallery.querySelector(`.${overlayClass}`);
        const overlayCloseBtn = overlay?.querySelector(`.${overlayCloseBtnClass}`);
        const detailImg = overlay?.querySelector(`.${detailImageClass}`);
        
        if (!thumbnails.length || !overlay || !detailImg || !overlayCloseBtn) throw new Error('Cannot find required elements.');

        this.thumbnail = Array.from(thumbnails);
        this.overlay = overlay;
        this.detailImg = detailImg;
        this.overlayCloseBtn = overlayCloseBtn;
        this.galleryTitle = title;
        this.defaultTitle = basicGallery.dataset.title || 'My Photo Gallery';

        this.thumbnail.forEach((thumbnail) => {
           thumbnail.addEventListener('click', this.showDetail.bind(this));
        });

        this.overlayCloseBtn.addEventListener('click', this.hideDetail.bind(this));

        this.updateTitle(this.defaultTitle);

    }

    updateTitle(text) {
        this.galleryTitle.textContent = text;
    }

    showDetail(event) {
        const { currentTarget } = event;
        const { fullUrl, title } = currentTarget.dataset;
        this.renderDetailImage(fullUrl);
        this.updateTitle(title);
        this.showDetailOverlay();
    }

    hideDetail() {
        this.detailImg.setAttribute('src', '');
        this.updateTitle(this.defaultTitle);
        this.hideDetailOverlay();
    }

    renderDetailImage(url) {
        if (!url) return;
        this.detailImg.setAttribute('src', url);
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