import React, { useState } from "react";
import { ConfigProvider, Button, Space } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import { ExperimentOutlined, FileTextOutlined } from "@ant-design/icons";
import ArticleForm from "./components/ArticleForm";
import EditorExamples from "./components/EditorExamples";
import TestComponent from "./components/TestComponent";
import "./App.css";

function App() {
  const [currentView, setCurrentView] = useState("article"); // 'article' | 'examples'

  return (
    <ConfigProvider locale={zhCN}>
      <div className="app">
        <header className="app-header">
          <h1>📝 React + QuillJS + Emoji 项目</h1>
          <p>富文本编辑器与组件通信模式演示</p>

          <Space style={{ marginTop: "16px" }}>
            <Button
              type={currentView === "article" ? "primary" : "default"}
              icon={<FileTextOutlined />}
              onClick={() => setCurrentView("article")}
            >
              文章发布系统
            </Button>
            <Button
              type={currentView === "examples" ? "primary" : "default"}
              icon={<ExperimentOutlined />}
              onClick={() => setCurrentView("examples")}
            >
              组件通信示例
            </Button>
          </Space>
        </header>

        <main className="app-main">
          <TestComponent />
          {currentView === "article" ? <ArticleForm /> : <EditorExamples />}
        </main>
      </div>
    </ConfigProvider>
  );
}

export default App;
