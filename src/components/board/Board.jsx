import "./style.css";
import io from "socket.io-client";
import { useEffect, useRef, useState } from "react";
function Board() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  let timeout;

  let socket = io.connect("http://localhost:4000");
  console.log(socket);
  socket.on("canvas", function (data) {
    console.log(socket);
    const img = new Image();
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    img.onload = function () {
      context.drawImage(img, 0, 0);
    };
    img.src = data;
  });
  useEffect(() => {
      console.log("calling useeffect")
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.lineCap = "round";
    context.strokeStyle = "black";
    context.lineWidth = 5;
    contextRef.current = context;
  }, []);

  const startDraw = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };
  const endDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };
  const draw = ({ nativeEvent }) => {
      console.log(nativeEvent)
    if (!isDrawing) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    const canvas = canvasRef.current;
    if (timeout != undefined) clearTimeout(timeout);
    timeout = setTimeout(function () {
      const base64Image = canvas.toDataURL("image/png");
      socket.emit("canvas", base64Image);
    }, 1000);
  };
  return (
    <div>
      <h1>Board</h1>
      <canvas
        className="board"
        id="board"
        onMouseDown={startDraw}
        onMouseUp={endDrawing}
        onMouseMove={draw}
        ref={canvasRef}
      ></canvas>
    </div>
  );
}

export default Board;
