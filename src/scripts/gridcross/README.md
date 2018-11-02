# Gridcross

An interactive exercise teaching you about planar geometry and applications of the Pythagorean theorem.

## Deployment

Include the following three lines in your HTML file.

```$xslt
<div id="gridcross"></div>
<link rel="stylesheet" href="gridcross.css">
<script src="gridcross.exercise.js"></script>
```
It should be fine to just put them into the `body` tag.

### Packaging

- `svg.draggable.js` plugin for `svg.js` had to be modified to work in a ES6 module environment
- Uhe `intersections.js` file contains a syntactically modified part of the [KLD Intersections](https://github.com/thelonious/kld-intersections) library 
- Ultimately, if you are using only the dist version of gridcross, you don't have to worry about this as they are both included in the package

## Todos

- [x] detecting intersects for newly added lines 
- [x] 'infinite' line helpers drawn for player-added line segments
- [ ] drawing circles
- [ ] end state detection
- [x] use groups for layers
- [x] use SVG.Nested for better node indicators
- [ ] exercise assignment definitions
- [ ] webpack production config
- [ ] state management and undo, drawing from state
