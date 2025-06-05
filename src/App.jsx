import React from "react";
import QuillEmojiEditor from "./components/QuillEmojiEditor.jsx";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>QuillJS + Emoji 富文本编辑器</h1>
        <p>支持表情符号的现代化文本编辑器</p>
      </header>
      <main className="app-main">
        <QuillEmojiEditor />
      </main>
    </div>
  );
}

export default App;
