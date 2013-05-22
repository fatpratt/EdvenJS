//--------------------------------------------------------------------------------------------------
// Defines globals used throughout.
//--------------------------------------------------------------------------------------------------

var MazeGlobals = (function() {
    'use strict';
    return {
        PROJECTIONPLANEWIDTH: 320,
        PROJECTIONPLANEHEIGHT: 200,
        PROJECTIONPLANE_WIDTHTIMESHEIGHT: 64000,

        TEXTBOXWIDTH: 320,
        TEXTBOXHEIGHT: 200,

        TILE_SIZE: 64,
        TILE_SIZE_SHIFT: 6,   // used for bitwise shifting to simulate div and mult by TILE_SIZE

        MAZE_DIR: "MazeDir"
    }
}());

