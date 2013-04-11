//----------------------------------------------------------------------------------------------------------------------
// Image housed as a canvas for individual pixel evaluation.  To use an ImageCanvase object, you must call the constructor
// then call loadFile(), passing a callback function so the caller knows when it's loaded.
//----------------------------------------------------------------------------------------------------------------------

// Namespace: ImageCanvas
if (ImageCanvas == null || typeof(ImageCanvas) != "object") {var ImageCanvas = new Object();}


//----------------------------------------------------------------------------------------------------------------------
// Constructor
//----------------------------------------------------------------------------------------------------------------------
ImageCanvas = function(document, mazeId, fileName, width, height){
    this.document = document;
    this.mazeId = mazeId;
    this.fileName = fileName;
    this.width = width;
    this.height = height;

    this.canvas = null;
    this.context = null;
    this.image = null;
    this.imageData = null;
};

//----------------------------------------------------------------------------------------------------------------------
// Loads image file.
//   callBackFunction - Function to call when done loading.
//----------------------------------------------------------------------------------------------------------------------
ImageCanvas.prototype.loadFile = function(callBackFunction) {
    var callBackPresent = (typeof(callBackFunction) != "undefined");

    this.canvas = document.createElement("canvas");
    if (!this.canvas.getContext) return;
    this.context = this.canvas.getContext("2d");
    if (!this.context.getImageData) return;

    this.image = new Image();
    this.image.style.position = "absolute";
    this.image.style.left = "-1000px";  // effectively hides image offscreen
    this.document.body.appendChild(this.image);

    var that = this;

    // image on load inline callback
    this.image.onload = function() {
        that.canvas.width = that.width;
        that.canvas.height = that.height;
        that.canvas.style.width = that.width + "px";
        that.canvas.style.height = that.height + "px";
        that.context.drawImage(that.image, 0, 0, that.width, that.height);
        try {
            try {
                that.imageData = that.context.getImageData(0, 0, that.width, that.height);
            } catch (e) {
                netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
                that.imageData = that.context.getImageData(0, 0, that.width, that.height);
            }
        } catch (e) {
            throw new Error("Unable to access image data: " + MazeGlobals.MAZE_DIR + "/" + that.mazeId + "/" + that.fileName);
        }
        if (callBackPresent) callBackFunction(true);     // tell caller we are all done loading and all is positive
    };

    // image on error inline callback
    this.image.onerror = function() {
        // tell caller we are all done, but we failed to load probably due to file not found
        if (callBackPresent) callBackFunction(false, "File not found: " + MazeGlobals.MAZE_DIR + "/" + that.mazeId + "/" + that.fileName);
    };

    this.image.src = MazeGlobals.MAZE_DIR + "/" + this.mazeId + "/" + this.fileName;
}

//----------------------------------------------------------------------------------------------------------------------
// Used for debugging purposes, this method shows the alpha data of the image.
//----------------------------------------------------------------------------------------------------------------------
ImageCanvas.prototype.showAlphaData = function() {
    var alphaData = [];
    for (var i = 0, len = this.imageData.data.length; i < len; i += 4) {
        var row = Math.floor((i / 4) / this.width);
        var col = (i/4) - (row * this.width);
        if (!alphaData[row]) alphaData[row] = [];
        alphaData[row][col] = this.imageData.data[i + 3] == 0 ? 0 : 1;
    }
    alert("ImageCanvas Alpha:\r\n" + alphaData);
}


