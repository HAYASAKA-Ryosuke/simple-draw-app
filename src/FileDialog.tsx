import React from 'react';
import logo from './logo.svg';
import './App.css';
import { open } from '@tauri-apps/api/dialog'

const FileDialog = () => {
  const openDialog = () => {
    open().then(files => console.log(files))
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.

          <br></br>
          Hello Tauri
        </p>
        <button onClick={openDialog}>Click to open dialog</button>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default FileDialog;