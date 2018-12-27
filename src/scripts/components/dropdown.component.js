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
            if (child.classList && child.classList.contains(DROPDOWN_BUTTON_CLASS)) {
                child.addEventListener( 'touchstart', ( event ) => handleDropdownInteraction( event, dropdown ) );
            }
        } );
    } );
}

function handleDropdownInteraction( event, container, options = {} ) {
    event.preventDefault();
    event.stopPropagation();

    const { forceClose = false, forceOpen = false } = options;

    if ( forceClose ) {
        container.classList.remove( DROPDOWN_OPEN_CLASS );
        container.querySelectorAll(DROPDOWN_BUTTON_SELECTOR)
            .forEach(button => button.blur());
    }
    else if ( forceOpen ) container.classList.add( DROPDOWN_OPEN_CLASS );
    else container.classList.toggle( DROPDOWN_OPEN_CLASS );
}

export default dropdown;
