//------------------------------------------------------------------------------
// Contains the data which defines the walls of the map.  Essentially this map
// represents an aerial view of the maze showing which blocks are walls and
// which are open spaces.
//------------------------------------------------------------------------------

// Constructor 
MapData = function(){};        

MapData.prototype.mapWidth = 8;          // width should always be a power of 2
MapData.prototype.mapWidthShift = 3;     // this must be in sync with width for easy division    
MapData.prototype.mapHeight = 8;         // height doesn't have to be a power of 2 

// Here is the map.  The player starts out near the upper left corner.
// 1 represents walls and 0 represents open spaces.  Change this
// array and corresponding static members above to alter the maze's design.
// Note this is actually a single dimensional array, but can be
// thought of as a two dimensional array as represented here.

MapData.prototype.mapData = ['1','1','1','1','1','1','1','1',
                             '1','0','0','0','0','0','0','1',
							 '1','0','0','0','0','0','0','1',
							 '1','0','0','0','0','1','1','1',
							 '1','0','0','0','1','1','0','1',
							 '1','0','0','0','0','0','0','1',
							 '1','0','0','0','0','0','0','1',
							 '1','1','1','1','1','1','1','1'];


//------------- getters and setters -------------

/***
MapData.prototype.getMapHeight = function() {
	return this.mapHeight;
};

MapData.prototype.getMapWidth = function() {
	return this.mapWidth;
};

MapData.prototype.getMapWidthShift = function() {
	return this.mapWidthShift;
};
***/

//------------------------------------------------------------------------------
// returns true if the specified map item is a wall
//------------------------------------------------------------------------------
MapData.prototype.isWall = function(mapPos) {
	return(!(this.mapData[mapPos] == '0'));
};

//------------------------------------------------------------------------------
// returns the value at the specified position
//------------------------------------------------------------------------------
MapData.prototype.getValue = function(mapPos) {
	if (mapPos < 0 || mapPos >= this.mapHeight << this.mapWidthShift) return('0');
	else return(this.mapData[mapPos]);
};

//------------------------------------------------------------------------------
// takes x, y coordinates and converts them to a position in the one
// dimensional array representing the aerial view of the maze map
//------------------------------------------------------------------------------
MapData.prototype.convertPointToMapPos = function(x, y) {
	return ((y << this.mapWidthShift) + x);    // shifting makes this go faster
};
