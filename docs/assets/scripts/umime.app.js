/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/smoothscroll-polyfill/dist/smoothscroll.js":
/*!*****************************************************************!*\
  !*** ./node_modules/smoothscroll-polyfill/dist/smoothscroll.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/* smoothscroll v0.4.0 - 2018 - Dustan Kasten, Jeremias Menichelli - MIT License */\n(function () {\n  'use strict';\n\n  // polyfill\n  function polyfill() {\n    // aliases\n    var w = window;\n    var d = document;\n\n    // return if scroll behavior is supported and polyfill is not forced\n    if (\n      'scrollBehavior' in d.documentElement.style &&\n      w.__forceSmoothScrollPolyfill__ !== true\n    ) {\n      return;\n    }\n\n    // globals\n    var Element = w.HTMLElement || w.Element;\n    var SCROLL_TIME = 468;\n\n    // object gathering original scroll methods\n    var original = {\n      scroll: w.scroll || w.scrollTo,\n      scrollBy: w.scrollBy,\n      elementScroll: Element.prototype.scroll || scrollElement,\n      scrollIntoView: Element.prototype.scrollIntoView\n    };\n\n    // define timing method\n    var now =\n      w.performance && w.performance.now\n        ? w.performance.now.bind(w.performance)\n        : Date.now;\n\n    /**\n     * indicates if a the current browser is made by Microsoft\n     * @method isMicrosoftBrowser\n     * @param {String} userAgent\n     * @returns {Boolean}\n     */\n    function isMicrosoftBrowser(userAgent) {\n      var userAgentPatterns = ['MSIE ', 'Trident/', 'Edge/'];\n\n      return new RegExp(userAgentPatterns.join('|')).test(userAgent);\n    }\n\n    /*\n     * IE has rounding bug rounding down clientHeight and clientWidth and\n     * rounding up scrollHeight and scrollWidth causing false positives\n     * on hasScrollableSpace\n     */\n    var ROUNDING_TOLERANCE = isMicrosoftBrowser(w.navigator.userAgent) ? 1 : 0;\n\n    /**\n     * changes scroll position inside an element\n     * @method scrollElement\n     * @param {Number} x\n     * @param {Number} y\n     * @returns {undefined}\n     */\n    function scrollElement(x, y) {\n      this.scrollLeft = x;\n      this.scrollTop = y;\n    }\n\n    /**\n     * returns result of applying ease math function to a number\n     * @method ease\n     * @param {Number} k\n     * @returns {Number}\n     */\n    function ease(k) {\n      return 0.5 * (1 - Math.cos(Math.PI * k));\n    }\n\n    /**\n     * indicates if a smooth behavior should be applied\n     * @method shouldBailOut\n     * @param {Number|Object} firstArg\n     * @returns {Boolean}\n     */\n    function shouldBailOut(firstArg) {\n      if (\n        firstArg === null ||\n        typeof firstArg !== 'object' ||\n        firstArg.behavior === undefined ||\n        firstArg.behavior === 'auto' ||\n        firstArg.behavior === 'instant'\n      ) {\n        // first argument is not an object/null\n        // or behavior is auto, instant or undefined\n        return true;\n      }\n\n      if (typeof firstArg === 'object' && firstArg.behavior === 'smooth') {\n        // first argument is an object and behavior is smooth\n        return false;\n      }\n\n      // throw error when behavior is not supported\n      throw new TypeError(\n        'behavior member of ScrollOptions ' +\n          firstArg.behavior +\n          ' is not a valid value for enumeration ScrollBehavior.'\n      );\n    }\n\n    /**\n     * indicates if an element has scrollable space in the provided axis\n     * @method hasScrollableSpace\n     * @param {Node} el\n     * @param {String} axis\n     * @returns {Boolean}\n     */\n    function hasScrollableSpace(el, axis) {\n      if (axis === 'Y') {\n        return el.clientHeight + ROUNDING_TOLERANCE < el.scrollHeight;\n      }\n\n      if (axis === 'X') {\n        return el.clientWidth + ROUNDING_TOLERANCE < el.scrollWidth;\n      }\n    }\n\n    /**\n     * indicates if an element has a scrollable overflow property in the axis\n     * @method canOverflow\n     * @param {Node} el\n     * @param {String} axis\n     * @returns {Boolean}\n     */\n    function canOverflow(el, axis) {\n      var overflowValue = w.getComputedStyle(el, null)['overflow' + axis];\n\n      return overflowValue === 'auto' || overflowValue === 'scroll';\n    }\n\n    /**\n     * indicates if an element can be scrolled in either axis\n     * @method isScrollable\n     * @param {Node} el\n     * @param {String} axis\n     * @returns {Boolean}\n     */\n    function isScrollable(el) {\n      var isScrollableY = hasScrollableSpace(el, 'Y') && canOverflow(el, 'Y');\n      var isScrollableX = hasScrollableSpace(el, 'X') && canOverflow(el, 'X');\n\n      return isScrollableY || isScrollableX;\n    }\n\n    /**\n     * finds scrollable parent of an element\n     * @method findScrollableParent\n     * @param {Node} el\n     * @returns {Node} el\n     */\n    function findScrollableParent(el) {\n      var isBody;\n\n      do {\n        el = el.parentNode;\n\n        isBody = el === d.body;\n      } while (isBody === false && isScrollable(el) === false);\n\n      isBody = null;\n\n      return el;\n    }\n\n    /**\n     * self invoked function that, given a context, steps through scrolling\n     * @method step\n     * @param {Object} context\n     * @returns {undefined}\n     */\n    function step(context) {\n      var time = now();\n      var value;\n      var currentX;\n      var currentY;\n      var elapsed = (time - context.startTime) / SCROLL_TIME;\n\n      // avoid elapsed times higher than one\n      elapsed = elapsed > 1 ? 1 : elapsed;\n\n      // apply easing to elapsed time\n      value = ease(elapsed);\n\n      currentX = context.startX + (context.x - context.startX) * value;\n      currentY = context.startY + (context.y - context.startY) * value;\n\n      context.method.call(context.scrollable, currentX, currentY);\n\n      // scroll more if we have not reached our destination\n      if (currentX !== context.x || currentY !== context.y) {\n        w.requestAnimationFrame(step.bind(w, context));\n      }\n    }\n\n    /**\n     * scrolls window or element with a smooth behavior\n     * @method smoothScroll\n     * @param {Object|Node} el\n     * @param {Number} x\n     * @param {Number} y\n     * @returns {undefined}\n     */\n    function smoothScroll(el, x, y) {\n      var scrollable;\n      var startX;\n      var startY;\n      var method;\n      var startTime = now();\n\n      // define scroll context\n      if (el === d.body) {\n        scrollable = w;\n        startX = w.scrollX || w.pageXOffset;\n        startY = w.scrollY || w.pageYOffset;\n        method = original.scroll;\n      } else {\n        scrollable = el;\n        startX = el.scrollLeft;\n        startY = el.scrollTop;\n        method = scrollElement;\n      }\n\n      // scroll looping over a frame\n      step({\n        scrollable: scrollable,\n        method: method,\n        startTime: startTime,\n        startX: startX,\n        startY: startY,\n        x: x,\n        y: y\n      });\n    }\n\n    // ORIGINAL METHODS OVERRIDES\n    // w.scroll and w.scrollTo\n    w.scroll = w.scrollTo = function() {\n      // avoid action when no arguments are passed\n      if (arguments[0] === undefined) {\n        return;\n      }\n\n      // avoid smooth behavior if not required\n      if (shouldBailOut(arguments[0]) === true) {\n        original.scroll.call(\n          w,\n          arguments[0].left !== undefined\n            ? arguments[0].left\n            : typeof arguments[0] !== 'object'\n              ? arguments[0]\n              : w.scrollX || w.pageXOffset,\n          // use top prop, second argument if present or fallback to scrollY\n          arguments[0].top !== undefined\n            ? arguments[0].top\n            : arguments[1] !== undefined\n              ? arguments[1]\n              : w.scrollY || w.pageYOffset\n        );\n\n        return;\n      }\n\n      // LET THE SMOOTHNESS BEGIN!\n      smoothScroll.call(\n        w,\n        d.body,\n        arguments[0].left !== undefined\n          ? ~~arguments[0].left\n          : w.scrollX || w.pageXOffset,\n        arguments[0].top !== undefined\n          ? ~~arguments[0].top\n          : w.scrollY || w.pageYOffset\n      );\n    };\n\n    // w.scrollBy\n    w.scrollBy = function() {\n      // avoid action when no arguments are passed\n      if (arguments[0] === undefined) {\n        return;\n      }\n\n      // avoid smooth behavior if not required\n      if (shouldBailOut(arguments[0])) {\n        original.scrollBy.call(\n          w,\n          arguments[0].left !== undefined\n            ? arguments[0].left\n            : typeof arguments[0] !== 'object' ? arguments[0] : 0,\n          arguments[0].top !== undefined\n            ? arguments[0].top\n            : arguments[1] !== undefined ? arguments[1] : 0\n        );\n\n        return;\n      }\n\n      // LET THE SMOOTHNESS BEGIN!\n      smoothScroll.call(\n        w,\n        d.body,\n        ~~arguments[0].left + (w.scrollX || w.pageXOffset),\n        ~~arguments[0].top + (w.scrollY || w.pageYOffset)\n      );\n    };\n\n    // Element.prototype.scroll and Element.prototype.scrollTo\n    Element.prototype.scroll = Element.prototype.scrollTo = function() {\n      // avoid action when no arguments are passed\n      if (arguments[0] === undefined) {\n        return;\n      }\n\n      // avoid smooth behavior if not required\n      if (shouldBailOut(arguments[0]) === true) {\n        // if one number is passed, throw error to match Firefox implementation\n        if (typeof arguments[0] === 'number' && arguments[1] === undefined) {\n          throw new SyntaxError('Value could not be converted');\n        }\n\n        original.elementScroll.call(\n          this,\n          // use left prop, first number argument or fallback to scrollLeft\n          arguments[0].left !== undefined\n            ? ~~arguments[0].left\n            : typeof arguments[0] !== 'object' ? ~~arguments[0] : this.scrollLeft,\n          // use top prop, second argument or fallback to scrollTop\n          arguments[0].top !== undefined\n            ? ~~arguments[0].top\n            : arguments[1] !== undefined ? ~~arguments[1] : this.scrollTop\n        );\n\n        return;\n      }\n\n      var left = arguments[0].left;\n      var top = arguments[0].top;\n\n      // LET THE SMOOTHNESS BEGIN!\n      smoothScroll.call(\n        this,\n        this,\n        typeof left === 'undefined' ? this.scrollLeft : ~~left,\n        typeof top === 'undefined' ? this.scrollTop : ~~top\n      );\n    };\n\n    // Element.prototype.scrollBy\n    Element.prototype.scrollBy = function() {\n      // avoid action when no arguments are passed\n      if (arguments[0] === undefined) {\n        return;\n      }\n\n      // avoid smooth behavior if not required\n      if (shouldBailOut(arguments[0]) === true) {\n        original.elementScroll.call(\n          this,\n          arguments[0].left !== undefined\n            ? ~~arguments[0].left + this.scrollLeft\n            : ~~arguments[0] + this.scrollLeft,\n          arguments[0].top !== undefined\n            ? ~~arguments[0].top + this.scrollTop\n            : ~~arguments[1] + this.scrollTop\n        );\n\n        return;\n      }\n\n      this.scroll({\n        left: ~~arguments[0].left + this.scrollLeft,\n        top: ~~arguments[0].top + this.scrollTop,\n        behavior: arguments[0].behavior\n      });\n    };\n\n    // Element.prototype.scrollIntoView\n    Element.prototype.scrollIntoView = function() {\n      // avoid smooth behavior if not required\n      if (shouldBailOut(arguments[0]) === true) {\n        original.scrollIntoView.call(\n          this,\n          arguments[0] === undefined ? true : arguments[0]\n        );\n\n        return;\n      }\n\n      // LET THE SMOOTHNESS BEGIN!\n      var scrollableParent = findScrollableParent(this);\n      var parentRects = scrollableParent.getBoundingClientRect();\n      var clientRects = this.getBoundingClientRect();\n\n      if (scrollableParent !== d.body) {\n        // reveal element inside parent\n        smoothScroll.call(\n          this,\n          scrollableParent,\n          scrollableParent.scrollLeft + clientRects.left - parentRects.left,\n          scrollableParent.scrollTop + clientRects.top - parentRects.top\n        );\n\n        // reveal parent in viewport unless is fixed\n        if (w.getComputedStyle(scrollableParent).position !== 'fixed') {\n          w.scrollBy({\n            left: parentRects.left,\n            top: parentRects.top,\n            behavior: 'smooth'\n          });\n        }\n      } else {\n        // reveal element in viewport\n        w.scrollBy({\n          left: clientRects.left,\n          top: clientRects.top,\n          behavior: 'smooth'\n        });\n      }\n    };\n  }\n\n  if (true) {\n    // commonjs\n    module.exports = { polyfill: polyfill };\n  } else {}\n\n}());\n\n\n//# sourceURL=webpack:///./node_modules/smoothscroll-polyfill/dist/smoothscroll.js?");

/***/ }),

/***/ "./src/scripts/components/dropdown.component.js":
/*!******************************************************!*\
  !*** ./src/scripts/components/dropdown.component.js ***!
  \******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nconst DROPDOWN_CLASS = 'dropdown';\nconst DROPDOWN_OPEN_CLASS = 'dropdown-open';\nconst DROPDOWN_BUTTON_CLASS = 'dropdown-button';\n\nconst DROPDOWN_SELECTOR = `.${DROPDOWN_CLASS}`;\nconst DROPDOWN_BUTTON_SELECTOR = `.${DROPDOWN_BUTTON_CLASS}`;\n\nfunction dropdown() {\n    const dropdowns = document.querySelectorAll( DROPDOWN_SELECTOR );\n    dropdowns.forEach( dropdown => {\n        dropdown.addEventListener( 'mouseenter',\n            ( event ) => handleDropdownInteraction( event, dropdown, { forceOpen: true } )\n        );\n        dropdown.addEventListener( 'mouseleave',\n            ( event ) => handleDropdownInteraction( event, dropdown, { forceClose: true } )\n        );\n\n        const children = dropdown.childNodes;\n        children.forEach( child => {\n            if ( child.classList && child.classList.contains( DROPDOWN_BUTTON_CLASS ) ) {\n                child.addEventListener( 'touchstart', ( event ) => handleDropdownInteraction( event, dropdown ) );\n            }\n        } );\n    } );\n\n    window.addEventListener( 'touchstart', setTouchCapable );\n}\n\nlet isTouchCapable = false;\n\nfunction setTouchCapable( event ) {\n    isTouchCapable = event.type === 'touchstart';\n    window.removeEventListener( 'touchstart', setTouchCapable, false );\n}\n\nfunction handleDropdownInteraction( event, container, options = {} ) {\n    // event.preventDefault();\n    // event.stopPropagation();\n\n    if ( isTouchCapable && ( event.type === 'mouseenter' || event.type === 'mouseleave' ) ) return;\n\n    const { forceClose = false, forceOpen = false } = options;\n\n    const open = container.classList.contains( DROPDOWN_OPEN_CLASS );\n\n    if ( open || forceClose ) {\n        container.classList.remove( DROPDOWN_OPEN_CLASS );\n        container.querySelectorAll( DROPDOWN_BUTTON_SELECTOR )\n            .forEach( button => button.blur() );\n    }\n    else if ( !open || forceOpen ) container.classList.add( DROPDOWN_OPEN_CLASS );\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (dropdown);\n\n\n//# sourceURL=webpack:///./src/scripts/components/dropdown.component.js?");

/***/ }),

/***/ "./src/scripts/components/pages.component.js":
/*!***************************************************!*\
  !*** ./src/scripts/components/pages.component.js ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nconst PAGES_SELECTOR = '.pages';\nconst PAGE_SELECTOR = '.page';\nconst BOOKMARK_SELECTOR = '.page-bookmark';\n\nconst PAGES_CONTAINER_CLASS = 'pages-container';\nconst BOOKMARK_CONTAINER_CLASS = 'page-bookmarks';\nconst BOOKMARK_ACTIVE_CLASS = 'page-bookmark-active';\nconst BOOKMARK_CLASS = 'page-bookmark';\nconst PAGE_ACTIVE_CLASS = 'page-active';\n\nconst SWIPE_THRESHOLD = 100;\n\nfunction pages() {\n    const pageSets = document.querySelectorAll(PAGES_SELECTOR);\n\n    pageSets.forEach(pageSet => {\n        const pagesContainer = document.createElement('div');\n        pagesContainer.classList.add(PAGES_CONTAINER_CLASS);\n\n        pageSet.parentNode.insertBefore(pagesContainer, pageSet);\n        pagesContainer.appendChild(pageSet);\n\n        const bookmarkContainer = document.createElement('div');\n        bookmarkContainer.classList.add(BOOKMARK_CONTAINER_CLASS);\n        pagesContainer.appendChild(bookmarkContainer);\n\n        const pages = pageSet.querySelectorAll(PAGE_SELECTOR);\n        pages.forEach((page, idx) => {\n            const bookmark = document.createElement('div');\n            bookmark.classList.add(BOOKMARK_CLASS);\n            bookmarkContainer.appendChild(bookmark);\n\n            bookmark.addEventListener('touchstart', (event) => handleBookmarkClick(event, pagesContainer, idx));\n            bookmark.addEventListener('click', (event) => handleBookmarkClick(event, pagesContainer, idx));\n\n            attachSwipeHandler(page, pagesContainer, idx);\n        });\n\n        setBookmarkActiveClass(pagesContainer, 0);\n        setPageActiveClass(pagesContainer, 0);\n    });\n}\n\nfunction handleBookmarkClick(event, container, idx) {\n    event.preventDefault();\n\n    scrollToPosition(container, idx);\n\n    setBookmarkActiveClass(container, idx);\n    setPageActiveClass(container, idx);\n}\n\nfunction attachSwipeHandler(handle, container, idx) {\n    const scrollable = container.querySelector(PAGES_SELECTOR);\n    const pages = scrollable.querySelectorAll(PAGE_SELECTOR);\n\n    handle.addEventListener('touchstart', handleStart);\n    handle.addEventListener('touchmove', handleMove);\n    handle.addEventListener('touchend', handleEnd);\n\n    let touchStartX = 0;\n    let touchLastX = 0;\n    let scrollableStartX = 0;\n\n    function handleStart(event) {\n        touchStartX = event.touches[0].clientX;\n        scrollableStartX = scrollable.scrollLeft;\n    }\n\n    function handleMove(event) {\n        touchLastX = event.touches[0].clientX;\n\n        const position = (event.touches[0].clientX - touchStartX) * -1 + scrollableStartX;\n        scrollable.scrollTo({\n            top: 0,\n            left: position,\n        });\n    }\n\n    function handleEnd() {\n        if (Math.abs(touchLastX - touchStartX) >= SWIPE_THRESHOLD) {\n            const idxDirection = touchLastX > touchStartX ? -1 : 1;\n            const targetIdx = Math.max(Math.min(idx + idxDirection, pages.length - 1), 0);\n\n            scrollToPosition(container, targetIdx);\n            setBookmarkActiveClass(container, targetIdx);\n            setPageActiveClass(container, targetIdx);\n        }\n        else {\n            scrollToPosition(container, idx);\n        }\n    }\n}\n\nfunction scrollToPosition(container, idx) {\n    const scrollable = container.querySelector(PAGES_SELECTOR);\n    const pages = scrollable.querySelectorAll(PAGE_SELECTOR);\n    if (pages.length > idx) {\n        const containerBound = scrollable.getBoundingClientRect().left;\n        const position = pages[idx].getBoundingClientRect().left - containerBound + Math.round(scrollable.scrollLeft);\n\n        scrollable.scrollTo({\n            top: 0,\n            left: position,\n            behavior: 'smooth',\n        });\n    }\n}\n\nfunction setBookmarkActiveClass(container, idx) {\n    const bookmarks = container.querySelectorAll(BOOKMARK_SELECTOR);\n    if (bookmarks.length > idx) {\n        bookmarks.forEach(bookmark => bookmark.classList.remove(BOOKMARK_ACTIVE_CLASS));\n        bookmarks[idx].classList.add(BOOKMARK_ACTIVE_CLASS);\n    }\n}\n\nfunction setPageActiveClass(container, idx) {\n    const pages = container.querySelectorAll(PAGE_SELECTOR);\n    if (pages.length > idx) {\n        pages.forEach(page => page.classList.remove(PAGE_ACTIVE_CLASS));\n        pages[idx].classList.add(PAGE_ACTIVE_CLASS);\n    }\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (pages);\n\n\n//# sourceURL=webpack:///./src/scripts/components/pages.component.js?");

/***/ }),

/***/ "./src/scripts/components/tabs.component.js":
/*!**************************************************!*\
  !*** ./src/scripts/components/tabs.component.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nconst CONTAINER_CLASS = '.tabs';\nconst BOOKMARK_CLASS = '.tab-bookmark';\nconst TAB_CLASS = '.tab';\nconst BOOKMARK_ACTIVE_CLASS = 'tab-bookmark-active';\nconst TAB_ACTIVE_CLASS = 'tab-active';\n\nfunction tabs() {\n    const tabSets = document.querySelectorAll(CONTAINER_CLASS);\n\n    tabSets.forEach(tabSet => {\n        const bookmarks = tabSet.querySelectorAll(BOOKMARK_CLASS);\n        bookmarks.forEach((bookmark, idx) => {\n            bookmark.addEventListener('touchstart', (event) => handleBookmarkClick(event, tabSet, idx));\n            bookmark.addEventListener('click', (event) => handleBookmarkClick(event, tabSet, idx));\n            if (idx === 0) bookmark.classList.add(BOOKMARK_ACTIVE_CLASS);\n        });\n\n        const tabs = tabSet.querySelectorAll(TAB_CLASS);\n        if (tabs.length !== 0) {\n            tabs[0].classList.add(TAB_ACTIVE_CLASS);\n        }\n    });\n}\n\nfunction handleBookmarkClick(event, tabSet, idx) {\n    event.preventDefault();\n\n    const bookmarks = tabSet.querySelectorAll(BOOKMARK_CLASS);\n    if (bookmarks.length > idx) {\n        bookmarks.forEach(bookmark => bookmark.classList.remove(BOOKMARK_ACTIVE_CLASS));\n        bookmarks[idx].classList.add(BOOKMARK_ACTIVE_CLASS);\n    }\n\n    const tabs = tabSet.querySelectorAll(TAB_CLASS);\n    if (tabs.length > idx) {\n        tabs.forEach(tab => tab.classList.remove(TAB_ACTIVE_CLASS));\n        tabs[idx].classList.add(TAB_ACTIVE_CLASS);\n    }\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (tabs);\n\n\n//# sourceURL=webpack:///./src/scripts/components/tabs.component.js?");

/***/ }),

/***/ "./src/scripts/umime.app.js":
/*!**********************************!*\
  !*** ./src/scripts/umime.app.js ***!
  \**********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var smoothscroll_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! smoothscroll-polyfill */ \"./node_modules/smoothscroll-polyfill/dist/smoothscroll.js\");\n/* harmony import */ var smoothscroll_polyfill__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(smoothscroll_polyfill__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _components_dropdown_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/dropdown.component */ \"./src/scripts/components/dropdown.component.js\");\n/* harmony import */ var _components_tabs_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/tabs.component */ \"./src/scripts/components/tabs.component.js\");\n/* harmony import */ var _components_pages_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/pages.component */ \"./src/scripts/components/pages.component.js\");\n/* harmony import */ var _utils_smoothScroll_util__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils/smoothScroll.util */ \"./src/scripts/utils/smoothScroll.util.js\");\n\n\n\n\n\n\nfunction init() {\n    smoothscroll_polyfill__WEBPACK_IMPORTED_MODULE_0___default.a.polyfill();\n    Object(_utils_smoothScroll_util__WEBPACK_IMPORTED_MODULE_4__[\"default\"])();\n    Object(_components_dropdown_component__WEBPACK_IMPORTED_MODULE_1__[\"default\"])();\n    Object(_components_tabs_component__WEBPACK_IMPORTED_MODULE_2__[\"default\"])();\n    Object(_components_pages_component__WEBPACK_IMPORTED_MODULE_3__[\"default\"])();\n}\n\nwindow.addEventListener('load', init);\n\n//# sourceURL=webpack:///./src/scripts/umime.app.js?");

/***/ }),

/***/ "./src/scripts/utils/smoothScroll.util.js":
/*!************************************************!*\
  !*** ./src/scripts/utils/smoothScroll.util.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nconst SMOOTH_SCROLL_LINK_SELECTOR = '.smooth-scroll';\n\nfunction smoothScroll() {\n    const links = document.querySelectorAll(SMOOTH_SCROLL_LINK_SELECTOR);\n\n    links.forEach(link => {\n        const linkHref = link.getAttribute('href').split('#');\n        const to = `#${linkHref[linkHref.length - 1]}`;\n\n        link.addEventListener('touchstart', (event) => handleAnchorLinkClick(event, to));\n        link.addEventListener('click', (event) => handleAnchorLinkClick(event, to));\n    });\n}\n\nfunction handleAnchorLinkClick(event, to) {\n    event.preventDefault();\n    event.stopPropagation();\n\n    const elem = document.querySelector(to);\n    const topBodyBound = document.body.getBoundingClientRect().top;\n    const position = elem !== null\n        ? elem.getBoundingClientRect().top - topBodyBound - 100\n        : 0;\n\n    window.scrollTo({\n        top: position,\n        left: 0,\n        behavior: 'smooth',\n    });\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (smoothScroll);\n\n//# sourceURL=webpack:///./src/scripts/utils/smoothScroll.util.js?");

/***/ }),

/***/ 1:
/*!****************************************!*\
  !*** multi ./src/scripts/umime.app.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("module.exports = __webpack_require__(/*! /Users/inscient/Git/umime-simple/src/scripts/umime.app.js */\"./src/scripts/umime.app.js\");\n\n\n//# sourceURL=webpack:///multi_./src/scripts/umime.app.js?");

/***/ })

/******/ });