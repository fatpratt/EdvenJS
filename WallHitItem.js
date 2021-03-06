/**
 * @license Copyright 2014 EdVentureMaze.com
 */

//------------------------------------------------------------------------------
// Data for a position on a wall which is hit by a ray.
// The WallItem serves as a means of tracking and comparing all wall hits
// for the Maze.
// @author brianpratt
//------------------------------------------------------------------------------

var WallHitItemConsts = (function() {
    'use strict';
    return {
        TOP_SIDE_HIT: 0,
        RIGHT_SIDE_HIT: 1,
        BOTTOM_SIDE_HIT: 2,
        LEFT_SIDE_HIT: 3,

        HORIZ_HIT: 0,
        VERT_HIT: 1
    }
}());

// Namespace: WallHitItem
if (WallHitItem == null || typeof(WallHitItem) != "object") {var WallHitItem = new Object();}

//------------------------------------------------------------------------------
// constructor
//------------------------------------------------------------------------------
WallHitItem = function (hitType, gridLine, intersection, castArc){
    'use strict';
    this.hitType = hitType;           // this should be HORIZ_HIT or VERT_HIT
    this.gridLine = gridLine;         // int is okay here because it is always even multiple of 64
    this.intersection = intersection; // float here because it is usually not an a evenly rounded number
    this.castArc = castArc;           // just useful for debugging
};

                                     // gridline and intersection are the x, y positions of the hit
WallHitItem.prototype.gridLine = 0;  // the position of the grid line which is hit by the ray
                                     // ... this is a horiz grid line described in terms of y for horiz hits
                                     // ... this is a vert grid line described in terms of x vert hits
WallHitItem.prototype.intersection = 0.0;   // intersection of ray on grid line
                                            // ...this is an x value for horiz grid and y for vert

WallHitItem.prototype.hitType = WallHitItemConsts.HORIZ_HIT;      // horiz or vertical grid line hit
WallHitItem.prototype.hitSide = WallHitItemConsts.TOP_SIDE_HIT;   // hit top, bottom, right or left side of cube (from arial perspective)

WallHitItem.prototype.offTheMap = false;          // true - this ray went off the map
WallHitItem.prototype.distToItem = 0.0;           // distance from player to wall being hit

WallHitItem.prototype.xGridIndex = 0;        // x position of hit on the smaller (aerial) map
WallHitItem.prototype.yGridIndex = 0;        // y position of hit on the smaller (aerial) map
WallHitItem.prototype.mapPos = 0;            // x and y converted to one dimensional (y * mapWidth) + x

WallHitItem.prototype.castArc = 0;

// -------- setters and getters ------------

WallHitItem.prototype.isHorizHit = function() {
    'use strict';
	return (this.hitType == WallHitItemConsts.HORIZ_HIT);
};

WallHitItem.prototype.isVertHit = function() {
    'use strict';
	return (this.hitType == WallHitItemConsts.VERT_HIT);
};

//------------------------------------------------------------------------------
// Returns which of the two WallItems is the closest.
//------------------------------------------------------------------------------
function determineClosestHit(horizItemHit, vertItemHit) {
    'use strict';
	if (vertItemHit.offTheMap && horizItemHit.offTheMap) return horizItemHit;
	if (vertItemHit.offTheMap) return horizItemHit;
	if (horizItemHit.offTheMap) return vertItemHit;
	if (horizItemHit.distToItem <  vertItemHit.distToItem) return horizItemHit;
	else return vertItemHit;
};

//------------------------------------------------------------------------------
// Converts the maze coordinates to a position in the small aerial map and
// sets data members accordingly.  Generally you should call calcAndSetOffTheMap
// after calling this.
//------------------------------------------------------------------------------
WallHitItem.prototype.calcAndSetMapPos = function(mapData) {
    'use strict';
	if (this.hitType == WallHitItemConsts.HORIZ_HIT) { // round down to x position of intersection on small grid
	    this.xGridIndex = ~~(this.intersection / MazeGlobals.TILE_SIZE);
	    this.yGridIndex = (this.gridLine >> MazeGlobals.TILE_SIZE_SHIFT);
	} else {
		this.xGridIndex = (this.gridLine >> MazeGlobals.TILE_SIZE_SHIFT);
		this.yGridIndex = ~~(this.intersection / MazeGlobals.TILE_SIZE);
	}
    this.mapPos = mapData.convertPointToMapPos(this.xGridIndex, this.yGridIndex);
    return this.mapPos;
};

//------------------------------------------------------------------------------
// Determines if the member variables xGridIndex and yGridIndex are off the map
// and if so, it sets data members including distance accordingly.  Assumes
// calcAndSetMapPos (in derived class) was called just prior.
//------------------------------------------------------------------------------
WallHitItem.prototype.calcAndSetOffTheMap = function(mapData) {
    'use strict';
	// xGridIndex and yGridIndex index is hopefully set prior
	if ((this.xGridIndex >= mapData.mapWidth) || (this.yGridIndex >= mapData.mapHeight) ||
			this.xGridIndex < 0 || this.yGridIndex < 0) {
		this.distToItem = Number.MAX_VALUE;
		this.offTheMap = true;
	}
	return this.offTheMap;
};
