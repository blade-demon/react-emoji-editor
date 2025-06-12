import React, { useRef, useState, useCallback } from "react";
import {
  Card,
  Button,
  Space,
  Divider,
  Typography,
  message,
  Row,
  Col,
} from "antd";
import {
  ApiOutlined,
  FunctionOutlined,
  BugOutlined,
  HistoryOutlined,
} from "@ant-design/icons";

// 导入不同版本的编辑器
import QuillEmojiEditor from "./QuillEmojiEditor"; // useImperativeHandle版本
import QuillEmojiEditorClass from "./QuillEmojiEditorClass"; // 类组件版本
import QuillEmojiEditorCallback from "./QuillEmojiEditorCallback"; // 回调函数版本

const { Title, Paragraph, Text } = Typography;

const EditorExamples = () => {
  // 1. useImperativeHandle 方式
  const hookEditorRef = useRef(null);

  // 2. 类组件方式
  const classEditorRef = useRef(null);

  // 3. 回调函数方式
  const [callbackEditorAPI, setCallbackEditorAPI] = useState(null);

  // 示例操作函数
  const handleGetContent = (editorRef, type) => {
    let content = null;

    switch (type) {
      case "hook":
        content = editorRef.current?.getContent();
        break;
      case "class":
        content = editorRef.current?.getContent();
        break;
      case "callback":
        content = callbackEditorAPI?.getContent();
        break;
    }

    if (content) {
      console.log(`${type} 编辑器内容:`, content);
      message.success(`${type} 内容已输出到控制台！`);
    } else {
      message.error("无法获取内容！");
    }
  };

  const handleClearEditor = (editorRef, type) => {
    switch (type) {
      case "hook":
        editorRef.current?.clear();
        break;
      case "class":
        editorRef.current?.clear();
        break;
      case "callback":
        callbackEditorAPI?.clear();
        break;
    }
    message.info(`${type} 编辑器已清空！`);
  };

  const handleInsertText = (editorRef, type) => {
    const text = " 🚀 通过外部方法插入的文本！";

    switch (type) {
      case "hook":
        const quill1 = editorRef.current?.getQuill();
        if (quill1) {
          const length = quill1.getLength();
          quill1.insertText(length - 1, text);
        }
        break;
      case "class":
        const quill2 = editorRef.current?.getQuill();
        if (quill2) {
          const length = quill2.getLength();
          quill2.insertText(length - 1, text);
        }
        break;
      case "callback":
        callbackEditorAPI?.insertText(text);
        break;
    }
    message.success(`${type} 已插入文本！`);
  };

  // 回调函数：当编辑器准备好时调用
  const handleEditorReady = useCallback((api) => {
    setCallbackEditorAPI(api);
    message.success("回调函数编辑器已准备就绪！");
  }, []);

  const renderActionButtons = (editorRef, type) => (
    <Space wrap>
      <Button
        type="primary"
        icon={<ApiOutlined />}
        onClick={() => handleGetContent(editorRef, type)}
      >
        获取内容
      </Button>
      <Button
        icon={<FunctionOutlined />}
        onClick={() => handleInsertText(editorRef, type)}
      >
        插入文本
      </Button>
      <Button danger onClick={() => handleClearEditor(editorRef, type)}>
        清空编辑器
      </Button>
    </Space>
  );

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <Title level={1}>
          <BugOutlined /> 获取组件内部方法的不同实现方式
        </Title>
        <Paragraph type="secondary" style={{ fontSize: "16px" }}>
          演示在不同 React 版本中如何从组件外部调用内部方法
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        {/* 方法1: useImperativeHandle (React 16.8+) */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <span>
                <HistoryOutlined style={{ color: "#1890ff" }} />
                &nbsp;Hook + useImperativeHandle
              </span>
            }
            size="small"
          >
            <Paragraph>
              <Text strong>React 16.8+</Text>
              <br />
              使用 <Text code>useImperativeHandle</Text> 和{" "}
              <Text code>forwardRef</Text>
            </Paragraph>

            <QuillEmojiEditor
              ref={hookEditorRef}
              height={200}
              placeholder="Hook版本编辑器..."
            />

            <Divider />
            {renderActionButtons(hookEditorRef, "hook")}

            <Divider />
            <Paragraph style={{ fontSize: "12px" }}>
              <Text type="secondary">
                优点：现代React推荐方式
                <br />
                缺点：需要React 16.8+
              </Text>
            </Paragraph>
          </Card>
        </Col>

        {/* 方法2: 类组件 (React 15+) */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <span>
                <ApiOutlined style={{ color: "#52c41a" }} />
                &nbsp;类组件 + ref
              </span>
            }
            size="small"
          >
            <Paragraph>
              <Text strong>React 15+</Text>
              <br />
              直接通过 <Text code>ref</Text> 访问类组件实例方法
            </Paragraph>

            <QuillEmojiEditorClass
              ref={classEditorRef}
              height={200}
              placeholder="类组件版本编辑器..."
            />

            <Divider />
            {renderActionButtons(classEditorRef, "class")}

            <Divider />
            <Paragraph style={{ fontSize: "12px" }}>
              <Text type="secondary">
                优点：简单直接，兼容性好
                <br />
                缺点：类组件较重，现已不推荐
              </Text>
            </Paragraph>
          </Card>
        </Col>

        {/* 方法3: 回调函数 (所有版本) */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <span>
                <FunctionOutlined style={{ color: "#faad14" }} />
                &nbsp;回调函数模式
              </span>
            }
            size="small"
          >
            <Paragraph>
              <Text strong>所有React版本</Text>
              <br />
              通过 <Text code>onEditorReady</Text> 回调函数传递API
            </Paragraph>

            <QuillEmojiEditorCallback
              height={200}
              placeholder="回调函数版本编辑器..."
              onEditorReady={handleEditorReady}
            />

            <Divider />
            {renderActionButtons(null, "callback")}

            <Divider />
            <Paragraph style={{ fontSize: "12px" }}>
              <Text type="secondary">
                优点：兼容所有版本，灵活
                <br />
                缺点：需要状态管理回调API
              </Text>
            </Paragraph>
          </Card>
        </Col>
      </Row>

      {/* 其他方法说明 */}
      <Card style={{ marginTop: "20px" }} title="其他获取内部方法的模式">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Title level={4}>4. Context 模式</Title>
            <Paragraph>
              <Text code>
                {`const EditorContext = createContext();
// 在组件内部提供方法
<EditorContext.Provider value={api}>
// 在外部消费方法
const api = useContext(EditorContext);`}
              </Text>
            </Paragraph>
          </Col>

          <Col xs={24} md={12}>
            <Title level={4}>5. 状态提升模式</Title>
            <Paragraph>
              <Text code>
                {`// 将状态和方法提升到父组件
const [editorState, setEditorState] = useState();
// 通过props传递给子组件
<Editor state={editorState} onChange={setEditorState} />`}
              </Text>
            </Paragraph>
          </Col>
        </Row>

        <Divider />

        <Title level={4}>React 版本兼容性总结</Title>
        <ul>
          <li>
            <Text strong>React 15 及更早：</Text> 主要使用类组件 + ref 直接访问
          </li>
          <li>
            <Text strong>React 16.3+：</Text> 引入 React.createRef() 和
            React.forwardRef()
          </li>
          <li>
            <Text strong>React 16.8+：</Text> 引入 Hooks，useImperativeHandle
            成为首选
          </li>
          <li>
            <Text strong>通用方案：</Text> 回调函数模式适用于所有版本
          </li>
        </ul>
      </Card>

      <Card
        style={{
          marginTop: "20px",
          background: "#f6ffed",
          border: "1px solid #b7eb8f",
        }}
      >
        <Title level={4} style={{ color: "#389e0d" }}>
          💡 最佳实践建议
        </Title>
        <ul>
          <li>
            <Text strong>现代项目：</Text> 优先使用{" "}
            <Text code>useImperativeHandle</Text>
          </li>
          <li>
            <Text strong>老项目：</Text> 类组件 + ref 是最直接的方式
          </li>
          <li>
            <Text strong>跨版本兼容：</Text> 回调函数模式最通用
          </li>
          <li>
            <Text strong>状态管理：</Text> 复杂场景考虑 Context 或状态提升
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default EditorExamples;
