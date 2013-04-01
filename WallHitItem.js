//------------------------------------------------------------------------------
// Data for a position on a wall which is hit by a ray.
// The WallItem serves as a means of tracking and comparing all wall hits
// for the Maze.
//------------------------------------------------------------------------------

// constructor
function WallHitItem(hitType, gridLine, intersection, castArc){
    this.hitType = hitType;           // this should be HORIZ_HIT or VERT_HIT
    this.gridLine = gridLine;         // int is okay here because it is always even multiple of 64
    this.intersection = intersection; // float here because it is usually not an a evenly rounded number
    this.castArc = castArc;           // just useful for debugging
};

WallHitItem.prototype.HORIZ_HIT = 0;        // hit type
WallHitItem.prototype.VERT_HIT = 1;

WallHitItem.prototype.TOP_SIDE_HIT  = 0;    // hit side
WallHitItem.prototype.RIGHT_SIDE_HIT = 1;
WallHitItem.prototype.BOTTOM_SIDE_HIT = 2;
WallHitItem.prototype.LEFT_SIDE_HIT = 3;

                                     // gridline and intersection are the x, y positions of the hit
WallHitItem.prototype.gridLine = 0;  // the position of the grid line which is hit by the ray
                                     // ... this is a horiz grid line described in terms of y for horiz hits
                                     // ... this is a vert grid line described in terms of x vert hits
WallHitItem.prototype.intersection = 0.0;   // intersection of ray on grid line
                                            // ...this is an x value for horiz grid and y for vert

WallHitItem.prototype.hitType = this.HORIZ_HIT;      // horiz or vertical grid line hit
WallHitItem.prototype.hitSide = this.TOP_SIDE_HIT;   // hit top, bottom, right or left side of cube (from arial perspective)

WallHitItem.prototype.offTheMap = false;          // true - this ray went off the map
WallHitItem.prototype.distToItem = 0.0;           // distance from player to wall being hit

WallHitItem.prototype.xGridIndex = 0;        // x position of hit on the smaller (aerial) map
WallHitItem.prototype.yGridIndex = 0;        // y position of hit on the smaller (aerial) map
WallHitItem.prototype.mapPos = 0;            // x and y converted to one dimensional (y * mapWidth) + x

WallHitItem.prototype.castArc = 0;

// -------- setters and getters ------------

/***
WallHitItem.prototype.isOffTheMap = function() {
	return this.offTheMap;
};

WallHitItem.prototype.setOffTheMap = function(offTheMap) {
	return this.offTheMap = offTheMap;
};
*****/

WallHitItem.prototype.isHorizHit = function() {
	return (this.hitType == this.HORIZ_HIT);
};

WallHitItem.prototype.isVertHit = function() {
	return (this.hitType == this.VERT_HIT);
};

/***
WallHitItem.prototype.setMapPos = function(mapPos) {
	this.mapPos = mapPos;
};

WallHitItem.prototype.getMapPos = function() {
	return this.mapPos;
};

WallHitItem.prototype.getDistToItem = function() {
	return this.distToItem;
};

WallHitItem.prototype.setDistToItem = function(distToItem) {
	this.distToItem = distToItem;
};

WallHitItem.prototype.getIntersection = function() {
	return this.intersection;
};

WallHitItem.prototype.setIntersection = function(intersection) {
	this.intersection = intersection;
};

WallHitItem.prototype.getGridLine = function() {
	return this.gridLine;
};

WallHitItem.prototype.setGridLine = function(gridLine) {
	this.gridLine = gridLine;
};
****/

//------------------------------------------------------------------------------
//Returns which of the two WallItems is the closest.
//------------------------------------------------------------------------------
function determineClosestHit(horizItemHit, vertItemHit) {
	if (vertItemHit.offTheMap && horizItemHit.offTheMap) return horizItemHit;
	if (vertItemHit.offTheMap) return horizItemHit;
	if (horizItemHit.offTheMap) return vertItemHit;
	if (horizItemHit.distToItem <  vertItemHit.distToItem) return horizItemHit;
	else return vertItemHit;
};

//------------------------------------------------------------------------------
// Determines if the member variables xGridIndex and yGridIndex are off the map
// and if so, it sets data members including distance accordingly.  Assumes
// calcAndSetMapPos (in derived class) was called just prior.
//------------------------------------------------------------------------------
WallHitItem.prototype.calcAndSetOffTheMap = function(mapData) {
	// xGridIndex and yGridIndex index is hopefully set prior
	if ((this.xGridIndex >= mapData.mapWidth) || (this.yGridIndex >= mapData.mapHeight) ||
			this.xGridIndex < 0 || this.yGridIndex < 0) {
		this.distToItem = Number.MAX_VALUE;
		this.offTheMap = true;
	}
	return this.offTheMap;
};

//------------------------------------------------------------------------------
//Converts the maze coordinates to a position in the small aerial map and
//sets data members accordingly.  Generally you should call calcAndSetOffTheMap
//after calling this.
//------------------------------------------------------------------------------
WallHitItem.prototype.calcAndSetMapPos = function(mapData) {
	if (this.hitType == this.HORIZ_HIT) { // round down to x position of intersection on small grid
	    this.xGridIndex = ~~(this.intersection / 64);
	    this.yGridIndex = (this.gridLine >> 6);
	} else {
		this.xGridIndex = (this.gridLine >> 6);
		this.yGridIndex = ~~(this.intersection / 64);
	}
    this.mapPos = mapData.convertPointToMapPos(this.xGridIndex, this.yGridIndex);
    return this.mapPos;
};

