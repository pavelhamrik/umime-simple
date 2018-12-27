import smoothscroll from 'smoothscroll-polyfill';
import tabs from './components/tabs.component';
import pages from './components/pages.component';
import smoothScroll from './utils/smoothScroll.util';

function init() {
    smoothscroll.polyfill();
    smoothScroll();
    tabs();
    pages();
}

window.addEventListener('load', init);