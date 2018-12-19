import smoothscroll from 'smoothscroll-polyfill';
import tabs from './components/tabs.component';
import smoothScroll from './utils/smoothScroll.util';

function init() {
    smoothscroll.polyfill();
    smoothScroll();
    tabs();
}

window.onload = init;