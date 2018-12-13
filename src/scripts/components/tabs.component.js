const CONTAINER_CLASS = '.tabs';
const BOOKMARK_CLASS = '.tab-bookmark';
const TAB_CLASS = '.tab';
const BOOKMARK_ACTIVE_CLASS = 'tab-bookmark-active';
const TAB_ACTIVE_CLASS = 'tab-active';

function tabs() {
    const tabSets = document.querySelectorAll(CONTAINER_CLASS);

    tabSets.forEach(tabSet => {
        const bookmarks = tabSet.querySelectorAll(BOOKMARK_CLASS);
        bookmarks.forEach((bookmark, idx) => {
            bookmark.addEventListener('touchstart', (event) => handleBookmarkClick(event, tabSet, idx));
            bookmark.addEventListener('click', (event) => handleBookmarkClick(event, tabSet, idx));
            if (idx === 0) bookmark.classList.add(BOOKMARK_ACTIVE_CLASS);
        });

        const tabs = tabSet.querySelectorAll(TAB_CLASS);
        if (tabs.length !== 0) {
            tabs[0].classList.add(TAB_ACTIVE_CLASS);
        }
    });
}

function handleBookmarkClick(event, tabSet, idx) {
    event.preventDefault();

    const bookmarks = tabSet.querySelectorAll(BOOKMARK_CLASS);
    if (bookmarks.length > idx) {
        bookmarks.forEach(bookmark => bookmark.classList.remove(BOOKMARK_ACTIVE_CLASS));
        bookmarks[idx].classList.add(BOOKMARK_ACTIVE_CLASS);
    }

    const tabs = tabSet.querySelectorAll(TAB_CLASS);
    if (tabs.length > idx) {
        tabs.forEach(tab => tab.classList.remove(TAB_ACTIVE_CLASS));
        tabs[idx].classList.add(TAB_ACTIVE_CLASS);
    }
}

export default tabs;
