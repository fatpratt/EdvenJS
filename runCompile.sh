#!/bin/sh
set -u    # Don't use undefined variables
set -e    # Exit on error

java -jar compiler.jar --js=MazeGlobals.js --js=Background.js --js=Dest.js --js=GeneralConfig.js --js=ImageCanvas.js --js=IniFile.js --js=MapData.js --js=MathUtils.js --js=Maze.js --js=MazeConfig.js  --js=TextAreaBox.js --js=Trap.js --js=Trig.js --js=WallHitItem.js --js_output_file=EM.js  



                                          

