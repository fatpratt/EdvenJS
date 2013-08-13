//--------------------------------------------------------------------------------------------------
// Defines globals used throughout.
// @author brianpratt
//--------------------------------------------------------------------------------------------------

var MazeGlobals = (function() {
    'use strict';
    return {
        PROP_HEIGHT: 64,

        PROJECTIONPLANEWIDTH: 320,
        PROJECTIONPLANEHEIGHT: 200,
        PROJECTIONPLANE_WIDTHTIMESHEIGHT: 64000,

        TEXTBOXWIDTH: 320,
        TEXTBOXHEIGHT: 200,

        TILE_SIZE: 64,
        TILE_SIZE_SHIFT: 6,   // used for bitwise shifting to simulate div and mult by TILE_SIZE

        PLAYER_DIST_TO_PROJ_PLANE: 277,  // distance from play to the projection plane

        MAZE_DIR: "MazeDir"
    }
}());


