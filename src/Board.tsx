import { save } from '@tauri-apps/api/dialog';
import { writeBinaryFile } from '@tauri-apps/api/fs';
import { appWindow } from '@tauri-apps/api/window'
import React from 'react';
import { Stage, Layer, Rect, Text, Line, Image } from 'react-konva';
import { BoardContext } from './App';


type LineType = {
  tool: string
  points: number[]
}

type TextType = {
  message: string
  x: number
  y: number
}

const Board = () => {
  const [tool, setTool] = React.useState('pen');
  const [lines, setLines] = React.useState<LineType[]>([]);
  const [texts, setTexts] = React.useState<TextType[]>([]);
  const isDrawing = React.useRef(false);
  const { boardState, setBoardState } = React.useContext(BoardContext);
  const stageRef = React.useRef(null);
  const [width, setWidth] = React.useState(window.innerWidth)
  const [height, setHeight] = React.useState(window.innerHeight)

  appWindow.onResized(({ payload: size }) => {
    setWidth(size.width);
    setHeight(size.height);
  });

  const saveFileDialog = async () => {
    const filePath = await save({
      filters: [{
        name: 'Image',
        extensions: ['png', 'jpeg']
      }]
    });
    // @ts-ignore
    const image: Blob = await stageRef.current.toBlob()
    await writeBinaryFile(filePath as string, await image.arrayBuffer());
    setBoardState(prevState => ({ ...prevState, mode: 'normal' }))
  }

  const changeEventBoardState = React.useCallback(() => {
    if (boardState.mode === 'save') {
      saveFileDialog()
    }
    if (boardState.mode === 'erase') {
      setTool('eraser')
    }else {
      setTool('pen')
    }
  }, [boardState])

  React.useEffect(() => {
    changeEventBoardState()
  }, [changeEventBoardState])

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    if (boardState.mode === 'pencil') {
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
        if (e.key === 'Enter') {
          document.body.removeChild(textarea);
          setTexts([...texts, {message: textarea.value, x: pos.x, y: pos.y }]);
        }
      });
      setBoardState({mode: 'normal', file: boardState.file})
    }
  };

  const handleMouseMove = (e: any) => {

    if (boardState.mode === 'pencil' || boardState.mode === 'erase') {
      // マウスを押下してなければreturnする
      if (!isDrawing.current) {
        return;
      }
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      let lastLine = lines[lines.length - 1];
      // add point
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
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        ref={stageRef}
      >
        <Layer>
          <Image image={boardState.file} />
        </Layer>
        <Layer>
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