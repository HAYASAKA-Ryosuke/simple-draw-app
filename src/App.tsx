import { createContext, Dispatch, SetStateAction, useState } from "react";
import { readBinaryFile } from '@tauri-apps/api/fs';
import styled from "styled-components";
import "./App.css";
import { FaBeer } from 'react-icons/fa';
import Board from "./Board";
import { open } from '@tauri-apps/api/dialog'

export const ClosedSideBar = styled.header`
position: fixed;
left: 0;
top: 0;
z-index: 100;

display: flex;
align-items: left;
flex-direction: left;

nav {
  display: flex;
  ul {
    width: 100%;
      a {
        padding: 16px 0;
        display: flex;
        svg {
          width: 20px;
          height: 20px;
      }
    }
  }
}
`  

export const BoardContext = createContext({} as {
  boardState: {mode: string; file: HTMLImageElement}
  setBoardState: Dispatch<SetStateAction<{ mode: string; file: HTMLImageElement; }>>
})

const App = () => {

  const [ boardState, setBoardState ] = useState({mode: 'pencil', file: new Image()})

  const openDialog = async () => {
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
    setBoardState(prevState => ({ ...prevState, file: img }))
  }

  const loadImageFile = async () => {
	openDialog()
  }

  const setPencil = () => {
    setBoardState((prevState) => ({...prevState, mode: 'pencil'}))
  }

  const setText = () => {
    setBoardState((prevState) => ({...prevState, mode: 'text'}))
  }

  return (
    <div className="container">
      <BoardContext.Provider value={{ boardState, setBoardState }}>
        <ClosedSideBar>
          <nav>
            <ul>
              <a onClick={loadImageFile} title="load image file">
                <FaBeer></FaBeer>
              </a>
              <a onClick={setPencil} title="pencil">
                <FaBeer></FaBeer>
              </a>
              <a onClick={setText} title="text">
                <FaBeer></FaBeer>
              </a>
            </ul>
          </nav>
        </ClosedSideBar>
        <Board></Board>
      </BoardContext.Provider>
    </div>
  );
}

export default App;
