const SMOOTH_SCROLL_LINK_SELECTOR = '.smooth-scroll';

function smoothScroll() {
    const links = document.querySelectorAll(SMOOTH_SCROLL_LINK_SELECTOR);

    links.forEach(link => {
        const linkHref = link.getAttribute('href').split('#');
        const to = `#${linkHref[linkHref.length - 1]}`;

        link.addEventListener('touchstart', (event) => handleAnchorLinkClick(event, to));
        link.addEventListener('click', (event) => handleAnchorLinkClick(event, to));
    });
}

function handleAnchorLinkClick(event, to) {
    event.preventDefault();
    event.stopPropagation();

    const elem = document.querySelector(to);
    const topBodyBound = document.body.getBoundingClientRect().top;
    const position = elem !== null
        ? elem.getBoundingClientRect().top - topBodyBound - 100
        : 0;

    window.scrollTo({
        top: position,
        left: 0,
        behavior: 'smooth',
    });
}

export default smoothScroll;