//----------------------------------------------------------------------------------------------------------------------
// The text area box is the graphical component that is used to display a questions and log messages.
// This object can be used as a singleton through out the application calling methods to display text
// repeatedly like a console.  Typically you make two calls for the text to appear... first call setDisplayText()
// then call render(), or you could simply call dumpText() (or dumpError()) and do it all in one statement.
// @author brianpratt
//----------------------------------------------------------------------------------------------------------------------

// Namespace: TextAreaBox
if (TextAreaBox == null || typeof(TextAreaBox) != "object") {var TextAreaBox = new Object();}

//----------------------------------------------------------------------------------------------------------------------
// Constructor
//----------------------------------------------------------------------------------------------------------------------
TextAreaBox = function(context, backGroundClrStr, textClrStr, leftStartPoint, width, height){
    'use strict';
    this.context = context;
    this.backGroundClrStr = backGroundClrStr;
    this.textClrStr = textClrStr;
    this.origTextClrStr = textClrStr;
    this.leftStartPoint = leftStartPoint;
    this.width = width;
    this.height = height;
    this.displayText = "";
    this.clear();
};

TextAreaBox.prototype.TOP_MARGIN = 12;
TextAreaBox.prototype.MARGIN = 5;
TextAreaBox.prototype.LINE_HEIGHT = 12;
TextAreaBox.prototype.LINE_SEPARATOR_HEIGHT = 2;
TextAreaBox.prototype.FONT_STYLE = "11px Arial,sans-serif";
TextAreaBox.prototype.ERROR_TEXT_COLOR = "red";


//----------------------------------------------------------------------------------------------------------------------
// Clears display text area text.
//----------------------------------------------------------------------------------------------------------------------
TextAreaBox.prototype.clear = function() {
    'use strict';
    this.context.beginPath();
    this.context.rect(this.leftStartPoint, 0, this.width, this.height);
    this.context.closePath();
    this.context.fillStyle = this.backGroundClrStr;
    this.context.fill();
    this.context.stroke();
};

//----------------------------------------------------------------------------------------------------------------------
// Sets the text color.
//----------------------------------------------------------------------------------------------------------------------
TextAreaBox.prototype.setTextClr = function(textClrStr) {
    'use strict';
    this.textClrStr = textClrStr;
}

//----------------------------------------------------------------------------------------------------------------------
// Sets the display text.
//----------------------------------------------------------------------------------------------------------------------
TextAreaBox.prototype.setDisplayText = function(str) {
    'use strict';
    this.displayText = str.replace(/(\r)/gm, "");   // removes return carriage
    this.context.font = this.FONT_STYLE;
    this.context.fillStyle = this.textClrStr;
    this.displayText = this.wrapLines(this.displayText, this.width - this.leftStartPoint);
};

//----------------------------------------------------------------------------------------------------------------------
// Renders the display text.
//----------------------------------------------------------------------------------------------------------------------
TextAreaBox.prototype.render = function() {
    'use strict';
    this.context.font = this.FONT_STYLE;
    this.context.fillStyle = this.textClrStr;

    // display one line at a time
    var lines = this.displayText.split(/\r\n|\r|\n/);
    var xPos = this.TOP_MARGIN;
    var that = this;
    lines.forEach(function(line) {
        that.context.fillText(line, that.leftStartPoint + that.MARGIN, xPos);
        xPos = xPos + that.LINE_HEIGHT + that.LINE_SEPARATOR_HEIGHT;
    });
};

//----------------------------------------------------------------------------------------------------------------------
// Dumps a bunch of text in using the standard text color.
//----------------------------------------------------------------------------------------------------------------------
TextAreaBox.prototype.dumpText = function(textStr) {
    'use strict';
    this.clear();
    this.setTextClr(this.origTextClrStr);
    this.setDisplayText(textStr);
    this.render();
};

//----------------------------------------------------------------------------------------------------------------------
// Dumps a bunch of text in using the error color.
//----------------------------------------------------------------------------------------------------------------------
TextAreaBox.prototype.dumpError = function(textStr) {
    'use strict';
    this.clear();
    this.setTextClr(this.ERROR_TEXT_COLOR);
    this.setDisplayText(textStr);
    console.log(textStr);       // dump error to console, as well
    this.render();
};

//----------------------------------------------------------------------------------------------------------------------
// Injects newline characters into the input string where the words spill off the right margin.  Returns the modified
// string.
//----------------------------------------------------------------------------------------------------------------------
TextAreaBox.prototype.wrapLines = function(displayStr, maxDisplayWidth) {
    'use strict';
    var that = this;
    var out = "";
    var lines = displayStr.split(/\r\n|\r|\n/);
    lines.forEach(function(line) {
        var words = line.split(" ");
        var accumWords = "";
        var separator = "";
        words.forEach(function(word) {
            var tempAccumWords = "" + accumWords + separator + word;
            var metrics = that.context.measureText(tempAccumWords);
            var metricWidth = metrics.width;
            if (metricWidth < (that.width - (that.MARGIN + that.MARGIN))) {
                accumWords = "" + accumWords + separator + word;
                separator = " ";
            } else {
                out = "" + out + accumWords + "\n";
                accumWords = word;
                separator = " ";
            }
        });
        out = "" + out + accumWords + "\n";
    });
    return out;
};


