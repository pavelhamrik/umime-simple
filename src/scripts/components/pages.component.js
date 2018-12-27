const PAGES_SELECTOR = '.pages';
const PAGE_SELECTOR = '.page';
const BOOKMARK_SELECTOR = '.page-bookmark';

const PAGES_CONTAINER_CLASS = 'pages-container';
const BOOKMARK_CONTAINER_CLASS = 'page-bookmarks';
const BOOKMARK_ACTIVE_CLASS = 'page-bookmark-active';
const BOOKMARK_CLASS = 'page-bookmark';
const PAGE_ACTIVE_CLASS = 'page-active';

const SWIPE_THRESHOLD = 100;

function pages() {
    const pageSets = document.querySelectorAll(PAGES_SELECTOR);

    pageSets.forEach(pageSet => {
        const pagesContainer = document.createElement('div');
        pagesContainer.classList.add(PAGES_CONTAINER_CLASS);

        pageSet.parentNode.insertBefore(pagesContainer, pageSet);
        pagesContainer.appendChild(pageSet);

        const bookmarkContainer = document.createElement('div');
        bookmarkContainer.classList.add(BOOKMARK_CONTAINER_CLASS);
        pagesContainer.appendChild(bookmarkContainer);

        const pages = pageSet.querySelectorAll(PAGE_SELECTOR);
        pages.forEach((page, idx) => {
            const bookmark = document.createElement('div');
            bookmark.classList.add(BOOKMARK_CLASS);
            bookmarkContainer.appendChild(bookmark);

            bookmark.addEventListener('touchstart', (event) => handleBookmarkClick(event, pagesContainer, idx));
            bookmark.addEventListener('click', (event) => handleBookmarkClick(event, pagesContainer, idx));

            attachSwipeHandler(page, pagesContainer, idx);
        });

        setBookmarkActiveClass(pagesContainer, 0);
        setPageActiveClass(pagesContainer, 0);
    });
}

function handleBookmarkClick(event, container, idx) {
    event.preventDefault();

    scrollToPosition(container, idx);

    setBookmarkActiveClass(container, idx);
    setPageActiveClass(container, idx);
}

function attachSwipeHandler(handle, container, idx) {
    const scrollable = container.querySelector(PAGES_SELECTOR);
    const pages = scrollable.querySelectorAll(PAGE_SELECTOR);

    handle.addEventListener('touchstart', handleStart);
    handle.addEventListener('touchmove', handleMove);
    handle.addEventListener('touchend', handleEnd);

    let touchStartX = 0;
    let touchLastX = 0;
    let scrollableStartX = 0;

    function handleStart(event) {
        touchStartX = event.touches[0].clientX;
        scrollableStartX = scrollable.scrollLeft;
    }

    function handleMove(event) {
        touchLastX = event.touches[0].clientX;

        const position = (event.touches[0].clientX - touchStartX) * -1 + scrollableStartX;
        scrollable.scrollTo({
            top: 0,
            left: position,
        });
    }

    function handleEnd() {
        if (Math.abs(touchLastX - touchStartX) >= SWIPE_THRESHOLD) {
            const idxDirection = touchLastX > touchStartX ? -1 : 1;
            const targetIdx = Math.max(Math.min(idx + idxDirection, pages.length - 1), 0);

            scrollToPosition(container, targetIdx);
            setBookmarkActiveClass(container, targetIdx);
            setPageActiveClass(container, targetIdx);
        }
        else {
            scrollToPosition(container, idx);
        }
    }
}

function scrollToPosition(container, idx) {
    const scrollable = container.querySelector(PAGES_SELECTOR);
    const pages = scrollable.querySelectorAll(PAGE_SELECTOR);
    if (pages.length > idx) {
        const containerBound = scrollable.getBoundingClientRect().left;
        const position = pages[idx].getBoundingClientRect().left - containerBound + Math.round(scrollable.scrollLeft);

        scrollable.scrollTo({
            top: 0,
            left: position,
            behavior: 'smooth',
        });
    }
}

function setBookmarkActiveClass(container, idx) {
    const bookmarks = container.querySelectorAll(BOOKMARK_SELECTOR);
    if (bookmarks.length > idx) {
        bookmarks.forEach(bookmark => bookmark.classList.remove(BOOKMARK_ACTIVE_CLASS));
        bookmarks[idx].classList.add(BOOKMARK_ACTIVE_CLASS);
    }
}

function setPageActiveClass(container, idx) {
    const pages = container.querySelectorAll(PAGE_SELECTOR);
    if (pages.length > idx) {
        pages.forEach(page => page.classList.remove(PAGE_ACTIVE_CLASS));
        pages[idx].classList.add(PAGE_ACTIVE_CLASS);
    }
}

export default pages;
