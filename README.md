# koodihaaste 2020


## Libraries/frameworks used:
 - Vue.js
 - Vuetify - UI component library
 - Lodash - helper functions

## How does it work?
The app uses Dijkstra's algorithm to find the fastest path from bus stop a to bus stop b. The UI was made using Vue.js and Vuetify UI component library for rapid development (and because I love Vue). Once the start and end bus stops have been selected, the UI will show the calculated route between them, showing at which bus stops you're supposed to switch to another bus. The user can also click on the bus stop & bus line 'chips' to open a modal to see which bus lines stop at a particular bus stop, or at which bus stops a particular bus line stops at.


## Live demo
Live demo available [here](https://koodihaaste2020.web.app/).

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```