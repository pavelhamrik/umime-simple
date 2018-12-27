import smoothscroll from 'smoothscroll-polyfill';
import dropdown from './components/dropdown.component';
import tabs from './components/tabs.component';
import pages from './components/pages.component';
import smoothScroll from './utils/smoothScroll.util';

function init() {
    smoothscroll.polyfill();
    smoothScroll();
    dropdown();
    tabs();
    pages();
}

window.addEventListener('load', init);