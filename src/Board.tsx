import React from 'react';
import { Stage, Layer, Rect, Text, Line, Image } from 'react-konva';
import { BoardContext } from './App';


const Board = () => {
  const [tool, setTool] = React.useState('pen');
  const [lines, setLines] = React.useState([]);
  const [texts, setTexts] = React.useState([{message: 'fooaaa環境', x: 10, y: 30}]);
  const isDrawing = React.useRef(false);
  const { boardState, setBoardState } = React.useContext(BoardContext);

  const handleMouseDown = (e: any) => {
    // @ts-ignore
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    if (boardState.mode === 'pencil') {
      // @ts-ignore
      setLines([...lines, { tool, points: [pos.x, pos.y] }]);
    }
    if (boardState.mode === 'text') {
      // create textarea and style it
      var textarea = document.createElement('textarea');
      document.body.appendChild(textarea);

      textarea.value = '';
      textarea.style.position = 'absolute';
      textarea.style.top = pos.y + 'px';
      textarea.style.left = pos.x + 'px';
      textarea.focus();

      textarea.addEventListener('keydown', function (e) {
        // hide on enter
        if (e.keyCode === 13) {
          document.body.removeChild(textarea);
          // @ts-ignore
          setTexts([...texts, {message: textarea.value, x: pos.x, y: pos.y }]);
        }
      });
      // @ts-ignore
      setBoardState({mode: 'normal', file: boardState.file})
    }
  };

  const handleMouseMove = (e: any) => {

    if (boardState.mode === 'pencil') {
      // マウスを押下してなければreturnする
      if (!isDrawing.current) {
        return;
      }
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      let lastLine = lines[lines.length - 1];
      // add point
      // @ts-ignore
      lastLine.points = lastLine.points.concat([point.x, point.y]);

      // replace last
      lines.splice(lines.length - 1, 1, lastLine);
      setLines(lines.concat());
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };
  return (
    <>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
      >
        <Layer>
          <Image x={80} y={0} image={
            // @ts-ignore
            boardState.file
          } />
          {texts.map((text: {message: string; x: number; y: number}, i) => (
            <Text key={i} draggable={true} text={text.message} x={text.x} y={text.y}></Text>
          ))}
          {lines.map((line: {points: number[]; tool: string}, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="#00000"
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === 'eraser' ? 'destination-out' : 'source-over'
              }
            />
          ))}
        </Layer>
      </Stage>
    </>
  )
}

export default Board