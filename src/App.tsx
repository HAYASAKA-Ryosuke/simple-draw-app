import { createContext, Dispatch, SetStateAction, useState } from "react";
import { readBinaryFile } from '@tauri-apps/api/fs';
import styled from "styled-components";
import "./App.css";
import Board from "./Board";
import { open } from '@tauri-apps/api/dialog'

export const ClosedSideBar = styled.header`
.menu {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  list-style-type: none;
  margin: 0;
  padding: 0;
  background: #4D455D;
}
.menu li a{
  display:block;
  height:em;
  width:3em;
  text-indent:-12em;
  line-height:3em;
  text-align:center;
  color: #E96479;
  border-bottom: 1px solid #F5E9CF;
}
.menu li a:before {
  font-family: FontAwesome;
  speak: none;
  text-indent: 0em;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-size: 1.8em;
}
.menu li a.loadingImage:before {
  content: "\f1c5";
}
.menu li a.pencil:before {
  content: "☡";
}
.menu li a.erase:before {
  content: "\f12d";
}
.menu li a.text:before {
  content: "\f075";
}
.menu li a.save:before {
  content: "\f019";
}
.menu li.current a {
  background: #E96479;
  color: #fff;
}
.menu li a.active {
  background: #E96479;
  color: #fff;
}
.menu li{
    position:relative;
}
.menu li:after{
    content: attr(title);
    position:absolute;
    left:3em;
    top:0;
    height:3em;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    text-transform:uppercase;
    background:#ff5c62;
    padding:2em;
    transition: all 0.3s ease-in-out;
    visibility:hidden;
    opacity:0;
}
`  

const BoardCss = styled.header`
transform: translate(40px)
`

export const BoardContext = createContext({} as {
  boardState: {mode: string; color: string; file: HTMLImageElement}
  setBoardState: Dispatch<SetStateAction<{ mode: string; color: string; file: HTMLImageElement; }>>
})

const App = () => {

  const [ boardState, setBoardState ] = useState({mode: 'pencil', color: 'rgb(255,255,255)', file: new Image()})

  const openFileDialog = async () => {
    const img = new Image()
    const selectedImageFile = await open({
     multiple: false,
     filters: [{
       name: 'Image',
       extensions: ['png', 'jpeg']
     }]
    });
    
    const contents = await readBinaryFile(selectedImageFile as string);
    const blob = new Blob( [ contents ], { type: "image/*" } );
    const urlCreator = window.URL;
    const imageUrl = urlCreator.createObjectURL( blob );
    img.src = imageUrl
    setBoardState(prevState => ({ ...prevState, file: img, mode: 'normal' }))
  }

  const loadImageFile = async () => {
    setBoardState(prevState => ({ ...prevState, mode: 'load' }))
    openFileDialog()
  }

  const setErase = () => {
    setBoardState((prevState) => ({...prevState, mode: 'erase'}))
  }

  const setPencil = () => {
    setBoardState((prevState) => ({...prevState, mode: 'pencil'}))
  }

  const setText = () => {
    setBoardState((prevState) => ({...prevState, mode: 'text'}))
  }

  const setColor = () => {
    setBoardState((prevState) => ({...prevState, mode: 'text'}))
  }

  const saveImageFile = () => {
    setBoardState((prevState) => ({...prevState, mode: 'save'}))
  }

  return (
    <div className="container">
      <BoardContext.Provider value={{ boardState, setBoardState }}>
        <ClosedSideBar>
          <ul className="menu">
            <li title="load image"><a onClick={loadImageFile} className={boardState.mode === 'load' ? 'active loadingImage' : 'loadingImage'}>load image</a></li>
            <li title="pencil"><a onClick={setPencil} className={boardState.mode === 'pencil' ? 'active pencil': 'pencil'}>pencil</a></li>
            <li title="erase"><a onClick={setErase} className={boardState.mode === 'erase' ? 'active erase': 'erase'}>erase</a></li>
            <li title="text"><a onClick={setText} className={boardState.mode === 'text' ? 'active text' : 'text'}>text</a></li>
            <li title="save"><a onClick={saveImageFile} className={boardState.mode === 'save' ? 'active save' : 'save'}>save</a></li>
            <li title="color"><a onClick={setColor} className={boardState.mode === 'erase' ? 'active erase': 'erase'}>erase</a></li>
          </ul>
        </ClosedSideBar>
        <BoardCss>
          <Board></Board>
        </BoardCss>
      </BoardContext.Provider>
    </div>
  );
}

export default App;
