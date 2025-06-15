import React, { useState } from "react";
import { ConfigProvider, Button, Space } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import AntdForm from "./components/AntdForm";
// import { ExperimentOutlined, FileTextOutlined } from "@ant-design/icons";
// import ArticleForm from "./components/ArticleForm";
// import EditorExamples from "./components/EditorExamples";
// import TestComponent from "./components/TestComponent";
// import "./App.css";

function App() {
  // const [currentView, setCurrentView] = useState("article"); // 'article' | 'examples'

  return (
    <ConfigProvider locale={zhCN}>
      <div className="app">
        <header className="app-header"></header>

        <main className="app-main">
          <AntdForm />
        </main>
      </div>
    </ConfigProvider>
  );
}

export default App;
