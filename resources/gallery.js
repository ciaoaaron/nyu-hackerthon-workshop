(function () {
    let ImageGallery = function () {
        // Caching all the elements for quick access.
        let photoElements = document.querySelectorAll(".photo");
        let toolbars = document.querySelectorAll(".toolbar");
        let baseView = document.querySelector(".base-view");
        let gridView = document.querySelector(".gallery .grid");
        let detailView = document.querySelector(".gallery .detail");
        let header = document.querySelector(".header");
        let headerTitle = header.querySelector(".header h1");
        let closeButton = header.querySelector(".close-button");
        let carousel = detailView.querySelector(".carousel");
        let carouselViewport = detailView.querySelector(".scroll-viewport");

        let affirmEvent = (window.ontouchend) ? "touchend" : "click";
        let scrollEvent = (window.ontouchend) ? "touchend" : "scroll";

        let onViewImageElement = null;

        let carouselChildNodes = [];
        let imageElementOffset = [];

        let scrollInterval = null; 

        function init()
        {
            // Add Event Listeners.
            photoElements.forEach((element) => {
                element.addEventListener(affirmEvent, showDetailView);
            });
            closeButton.addEventListener(affirmEvent, showGridView);
            detailView.addEventListener(affirmEvent, toggleToolBars);
            headerTitle.dataset.title = baseView.dataset.title;
            carousel.addEventListener(scrollEvent, checkXForLoadingImage);

            if ("scroll-snap-type" in document.body.style === false) 
                carousel.addEventListener(scrollEvent, ScrollSnap(100));
            
            // Init Carousel childNodes
            for (let x = 0; x < photoElements.length; x++) {
                let img = document.createElement("img");
                img.addEventListener("load", adjustCarouselHeight);
                carouselChildNodes.push(img);
                carousel.appendChild(img);
            }

            //Collect offsetLeft of the images/placeholders in the carousel.
            imageElementOffset = carouselChildNodes.map(node => {
                return node.offsetLeft;
            });
        }

        // Whenever an image is fetched via the network, we compare the images to make sure we are setting a height that can accomodate the tallest image.
        function adjustCarouselHeight(event)
        {
            let tallestImage = carouselChildNodes.reduce((imageA, imageB) => {
                return (imageA.offsetHeight >= imageB.offsetHeight) ? imageA : imageB;
            });

            if (tallestImage === carouselViewport.offsetHeight)
                return;

            // -10 pixel for the viewport so that the scroll bar does not show up in the x axis.
            // Setting a 50ms to take care of the time it takes mobile-safari to redraw.
            setTimeout(() => {
                carouselViewport.setAttribute("style", `height: ${tallestImage.offsetHeight - 10}px`);
            }, 50);
        }

        // A scroll snap plugin before Chrome 69.
        function ScrollSnap(threshold)
        {
            const OFFSET_THRESHOLD = threshold || 100;
            let lastScrollLeft = 0; // For implementing scroll snapping when necessary.
            return function(event)
            {
                if (scrollInterval)
                    clearInterval(scrollInterval);

                scrollInterval = setInterval(() => {
                    let offsetLeft = event.target.scrollLeft;
                    let direction = (lastScrollLeft > offsetLeft) ? "right" : "left"
                    let weight = (lastScrollLeft > offsetLeft) ? -OFFSET_THRESHOLD : OFFSET_THRESHOLD;
                        
                    offsetLeft += weight;

                    let closestBounds = findClosestBounds(offsetLeft);
                    
                    let diff = closestBounds.map(bound => {
                        return Math.abs(offsetLeft - bound);
                    });

                    let selectedDiff = diff.slice(1).reduce((a, b) => { return (a < b) ? a : b;}, diff[0])
                    let selectedBound = closestBounds[diff.indexOf(selectedDiff)];

                    carousel.scrollTo({left: selectedBound, behavior: "smooth"});
                    lastScrollLeft = offsetLeft;
                    clearInterval(scrollInterval);
                }, 100);
            }
        }
        
        function findClosestBounds(value)
        {
            let closest = imageElementOffset.filter(a => {return a < value}).pop();
            let closestIndex = imageElementOffset.indexOf(closest);
            return [imageElementOffset[closestIndex - 1], imageElementOffset[closestIndex], imageElementOffset[closestIndex + 1]].filter(value => {return value !== undefined;})
        }
       
        function checkXForLoadingImage(event)
        {
            let offsetLeft = event.target.scrollLeft;
            let index = imageElementOffset.indexOf(offsetLeft);

            if (index >= 0)
                fetchImageForDetailView(photoElements[index]);
        }

        function changeHeaderTitle(title)
        {
            headerTitle.dataset.title = title;
        }

        // function createDetailImage(url)
        // {
        //     let img = document.createElement("img");
        //     img.setAttribute("src", url);
        //     return img;
        // }

        function fetchImageForDetailView(photoElement)
        {
            let previousPhotoElement = getSiblings(photoElement, 1, "previous");
            let nextphotoElement = getSiblings(photoElement, 1);
            let imageFullURL = photoElement.dataset.fullUrl;
            let elementsToAdd = [];

            // onViewImageElement = createDetailImage(imageFullURL);

            elementsToAdd.push(...previousPhotoElement, photoElement, ...nextphotoElement);

            // Filtering out the ones that have already been loaded and setting a flag the new ones that are being loaded.
            elementsToAdd.filter(candidate => {
                if (candidate.dataset.loaded) 
                    return;
                candidate.dataset.loaded = true;
                return candidate;
            });

            // Getting the full URL for each thumbnail, and then setting them to the img placeholder elements that are already in the carousel.
            elementsToAdd.forEach(image => {
                let imageIndex = Array.prototype.indexOf.call(photoElements, image);
                carouselChildNodes[imageIndex].src = image.dataset.fullUrl;
            });
        }

        function toggleToolBars(event) {
            toolbars.forEach(toolbar => {
                toolbar.classList.toggle("dissolved");
            });
        }

        function getSiblings(startElement, n = 2, direction = "next")
        {
            let siblingDirection = (direction === "next") ? "nextElementSibling" : "previousElementSibling";
            let startMarker = startElement;
            let i = n;
            let result = [];
            while (i > 0) {
                let targetElement = startMarker[siblingDirection];
                // If there is at least one element in the targeted direction, we continue on to iterate through `i`.
                if (targetElement) {
                    result.push(targetElement);
                    startMarker = targetElement;
                    i--;
                    continue;
                }
                // If there is no target element, we can just end this loop.
                i = 0;
            }
            return result;
        }

        function zoomPhotoElement(photoElement, callback)
        {
            // Zooming Idea.
            photoElement.classList.add("zoom");
            let top = photoElement.offsetTop;
            let left = photoElement.offsetLeft;
            let targetOffsetY = window.screen.height * 0.35;
            let targetOffsetX = 0

            let diffY = targetOffsetY - top;
            let diffX = targetOffsetX - left + photoElement.offsetWidth;

            photoElement.setAttribute("style", `transform: translate3d(${diffX}px, ${diffY}px, 0) scale3d(3, 3, 0);`);

            photoElement.addEventListener("transitionend", (event) => {
                unaminatePhotoElement(photoElement);

                if (callback instanceof Function)
                    callback.call(photoElement, event);
            });

        }

        function unaminatePhotoElement(photoElement)
        {
            photoElement.classList.remove("zoom");
            photoElement.classList.remove("fly-away");

            photoElement.removeAttribute("style");
        }

        // Show/Hide Grid and Detail Views.
        function showDetailView(event)
        {
            if (baseView.classList.contains("detail-view"))
                return;
            
            carouselViewport.classList.remove("hide");

            let photoElement = event.target;
            let photoGrid = photoElement.parentElement;

            changeHeaderTitle(photoGrid.dataset.title);

            let photoIndex = Array.prototype.indexOf.call(photoElements, photoElement);
            
            fetchImageForDetailView(photoElement);
           
            zoomPhotoElement(photoElement, (animationendEvent) => {
                baseView.classList.add("detail-view");
                baseView.classList.remove("grid-view");
                carouselViewport.classList.remove("invisible");
                hideGridView(); 
                 // For iOS: A setTimeout with 50ms to clear the redraw of any new height adjustment of the carousel before we set an adjusted height for the scrollViewport.
                setTimeout(() => {
                    carousel.scrollLeft = imageElementOffset[photoIndex];
                }, 25);
            });

            
        }

        function showGridView(event)
        {
            if (baseView.classList.contains("grid-view"))
                return;

            changeHeaderTitle(baseView.dataset.title);

            baseView.classList.remove("detail-view");
            baseView.classList.add("grid-view");

            hideDetailView();
        }

        function hideGridView()
        {
            gridView.classList.add("hide");
        }

        function hideDetailView()
        {
            carouselViewport.classList.add("hide");
            gridView.classList.remove("hide");

        }
        return {
            init: init
        }
    }
    window.IG = ImageGallery();
    IG.init();
})();