const DROPDOWN_CLASS = 'dropdown';
const DROPDOWN_OPEN_CLASS = 'dropdown-open';
const DROPDOWN_BUTTON_CLASS = 'dropdown-button';

const DROPDOWN_SELECTOR = `.${DROPDOWN_CLASS}`;
const DROPDOWN_BUTTON_SELECTOR = `.${DROPDOWN_BUTTON_CLASS}`;

function dropdown() {
    const dropdowns = document.querySelectorAll( DROPDOWN_SELECTOR );
    dropdowns.forEach( dropdown => {
        dropdown.addEventListener( 'mouseenter',
            ( event ) => handleDropdownInteraction( event, dropdown, { forceOpen: true } )
        );
        dropdown.addEventListener( 'mouseleave',
            ( event ) => handleDropdownInteraction( event, dropdown, { forceClose: true } )
        );

        const children = dropdown.childNodes;
        children.forEach( child => {
            if ( child.classList && child.classList.contains( DROPDOWN_BUTTON_CLASS ) ) {
                child.addEventListener( 'touchstart', ( event ) => handleDropdownInteraction( event, dropdown ) );
            }
        } );
    } );

    window.addEventListener( 'touchstart', setTouchCapable );
}

let isTouchCapable = false;

function setTouchCapable( event ) {
    isTouchCapable = event.type === 'touchstart';
    window.removeEventListener( 'touchstart', setTouchCapable, false );
}

function handleDropdownInteraction( event, container, options = {} ) {
    // event.preventDefault();
    // event.stopPropagation();

    if ( isTouchCapable && ( event.type === 'mouseenter' || event.type === 'mouseleave' ) ) return;

    const { forceClose = false, forceOpen = false } = options;

    const open = container.classList.contains( DROPDOWN_OPEN_CLASS );

    if ( open || forceClose ) {
        container.classList.remove( DROPDOWN_OPEN_CLASS );
        container.querySelectorAll( DROPDOWN_BUTTON_SELECTOR )
            .forEach( button => button.blur() );
    }
    else if ( !open || forceOpen ) container.classList.add( DROPDOWN_OPEN_CLASS );
}

export default dropdown;
