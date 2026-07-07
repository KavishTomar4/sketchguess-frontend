import React, { useRef, useEffect, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import socket from "./socket";
import { useParams } from "react-router";

function Canvas({ isDrawer }) {
    let canvasRef = useRef(null);
    let { roomid } = useParams();
    let [color, setColor] = useState("black");
    let [width, setWidth] = useState(4);

    
    let handleStroke = async () => {
        let paths = await canvasRef.current.exportPaths();
        socket.emit('draw', { roomcode: roomid, paths });
    };

    useEffect(() => {
        
        socket.on('draw', (data) => {
            canvasRef.current.loadPaths(data.paths);
        });

        
        socket.on('canvas_history', (paths) => {
            canvasRef.current.loadPaths(paths);
        });

        
        socket.on('clear_canvas', () => {
            canvasRef.current.clearCanvas();
        });

        return () => {
            socket.off('draw');
            socket.off('canvas_history');
            socket.off('clear_canvas');
        };
    }, []);

    let handleClear = () => {
        canvasRef.current.clearCanvas();
        socket.emit('clear_canvas', { roomcode: roomid });
    };

    let handleUndo = () => {
        canvasRef.current.undo();
        handleStroke();
    };

    return (
        <div>
            <ReactSketchCanvas
                ref={canvasRef}
                width="800px"
                height="600px"
                strokeWidth={width}
                strokeColor={color}
                canvasColor="white"
                readOnly={!isDrawer}   
                onStroke={isDrawer ? handleStroke : undefined}
            />

            {isDrawer && (
                <div>
                    <button onClick={() => setColor("black")}>Black</button>
                    <button onClick={() => setColor("red")}>Red</button>
                    <button onClick={() => setColor("blue")}>Blue</button>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value))}
                    />
                    <button onClick={handleUndo}>Undo</button>
                    <button onClick={handleClear}>Clear</button>
                </div>
            )}
        </div>
    );
}

export default Canvas;