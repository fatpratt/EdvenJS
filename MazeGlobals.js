//--------------------------------------------------------------------------------------------------
// Defines globals used throughout.
//--------------------------------------------------------------------------------------------------

var MazeGlobals = (function() {
    return {
        PROJECTIONPLANEWIDTH: 320,
        PROJECTIONPLANEHEIGHT: 200,
        PROJECTIONPLANE_WIDTHTIMESHEIGHT: 64000,

        TILE_SIZE: 64,
        TILE_SIZE_SHIFT: 6   // used for bitwise shifting to simulate div and mult by TILE_SIZE
    }
}());

