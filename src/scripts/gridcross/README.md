# Gridcross

An interactive exercise teaching you about planar geometry and applications of the Pythagorean theorem.

## Deployment

Include the following three lines in your HTML file, making sure the paths point where the corresponding files are.

```
<div id="gridcross"></div>
<link rel="stylesheet" href="gridcross.css">
<script src="gridcross.exercise.js"></script>
```
It's fine to simply put them into the `body` tag, grouped like this.

To use [KaTeX](https://katex.org/) in your assignment's text, load the library separately. Gridcross checks for its presence and strips all unsupported markup if the library is not loaded.

### API

The app loads the assignments over standard XMLHttpRequest in JSON format.

The format it expects it:

```
{
    "text": "Description of the exercise, specifying the problem to the person solving it.",
    "problem": {
        "points": [
            {geometry: [4, 3], label: {text: "A", position: [1, 0]}}
        ],
        "lines": [
            {geometry: [[1, 6], [3, 0]], label: {text: "l"}}
        ]
    },
    "solutions": [
        {
            "lines": [
                [[3, 6], [5, 0]]
            ]
        }
    ],
    "config": {
        "uiOnlySelect": true,
        "uiEvalSegmentsAsLines": false,
        "maxUserNodes": 3,
        "maxUserLines": 2,
    }
}
```

Recognized keys for both `problem` and `solutions` are `points`, `segments` and `lines`. `solutions` must be an array, even if it contains just one element.

The `label` optional attribute displays the associated object. `position` is optional and defaults to `[1, -1]` (to the left and top from the object). 

#### Config attributes

- `uiOnlySelect` – the user is only allowed to select existing objects. Defaults to `false`.
- `uiEvalSegmentsAsLines` – user's segments are considered lines when evaluating. Defaults to `false`.
- `maxUserNodes`, `maxUserLines` – user can create or select no more than the set amount of objects. Defaults to `0` – unlimited.'


## Development

Ask for a demo, docs TBD thereafter.

### Non-standard dependencies

- `svg.draggable.js` plugin for `svg.js` had to be modified to work in a ES6 module environment
- Uhe `intersections.js` file contains a syntactically modified part of the [KLD Intersections](https://github.com/thelonious/kld-intersections) library 
- If you are using only the distribution version of gridcross, you don't have to worry about this as they are both included in the package.

## Todos

- [x] detecting intersects for newly added lines 
- [x] 'infinite' line helpers drawn for player-added line segments
- [x] use state, unidirectional data flow and independent render based solely on state
- [x] create initial state from a JSON config 
- [x] end state detection
- [x] use groups for layers
- [x] use SVG.Nested for better node indicators
- [x] exercise assignment definitions
- [x] webpack production config
- [x] state management and undo, drawing from state
- [x] handling erroneous HTTP requests
- [x] loading of the next assignment
- [x] export paths and lined to console
- [x] makes canvas non-interactive when a valid solution is found
- [x] import solution locally
- [x] `done, nov 15` assignment's 'lines' are extended to edges regardless of their original coords; same for solutions
- [x] `done, nov 15` extending segments to lines based on assignment config
- [x] `done, nov 19` selecting & deselecting lines, configurable 'select only' mode
- [x] `done, nov 19` selecting & deselecting nodes, configurable 'select only' mode
- [x] `done, nov 19` point and line labels
- [x] `done, nov 21` repeat the XHR on timeout
- [x] `done, nov 21` implement stats, logging and sending a response back to the backend
- [x] `done, nov 21` deploy to [umimematiku.cz](https://www.umimematiku.cz)
- [x] `won't do` ~~send better stats for selection-style assignments~~
- [x] `done, nov 22` transpile into a 'safer' JS version on build (babel)
- [x] `done, nov 22` determine resolution on load to better fit the screen
- [x] `done, nov 22` emphasize reaction to selection and finding a correct solution
- [x] `done, nov 22` allow HTML in assignment's text
- [x] `done, nov 22` KaTeX support
- [x] log an assignment's opening (all values `0`)
- [x] improve the `undo` and `redo` buttons placement
- [x] limit user geometry count, signalize failure and enforce undo
- [x] implement the reset button
- [x] connecting & separating lines

### Later

- [ ] drawing circles
- [ ] getting the background image from assignment

### Bug fixes

- [x] node classes are being needlessly overwritten
- [x] an edge-to-edge user line doesn't get drawn or appear as one
- [x] vertical lines on right and left edge overreach the top
- [x] button presses are being registered even when the buttons are disabled; handle listeners
- [x] `fixed, nov 14` draggable is offset by window scroll position
- [x] `fixed, nov 14` arrays are exported to console as strings
- [x] `misreported, nov 14` solution checker doesn't validate for nodes
- [x] `fixed, nov 15` allow tolerance for small numerical errors when checking a solution
- [x] `fixed, nov 15` some intersections threw 'Point.equals' is not a function error 
- [x] `fixed, nov 19` gridlines coinciding with axislines are not updated with the axisline class  
- [x] `fixed, nov 22` existing geometry is ignoring labels from the assignment  
- [x] `fixed, nov 22` selection-style exercises are not working on touch devices
- [x] `irreproducible` window url is not updating when changing exercise (wrong build config was being used)
- [x] `fixex, jan 14` edge-to-edge connected lines are not being connected by an auxline
- [x] `fixex, jan 15` auxlines are not connecting recursively
- [x] `fixex, jan 15` auxlines are getting duplicated
- [x] `fixex, jan 15` solutions including auxlines highlight more geometry than they should
- [x] `fixex, jan 18` in select-lines style of assignments, any selection of the required amount of selected objects highlights the correct solution and is accepted
- [x] `fixex, feb 3` in selection assignment types, if the solution only includes one type of geometry, accidental selection of an object of the other geometry type prevents a correct solution from ever being accepted