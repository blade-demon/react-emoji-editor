import React, { useRef, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import "./QuillEmojiEditor.css";

const QuillEmojiEditor = () => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [content, setContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      // 创建自定义emoji按钮
      const icons = Quill.import("ui/icons");
      icons["emoji"] = "😀";

      // QuillJS 配置
      const quill = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "开始输入内容... 点击工具栏的表情按钮添加emoji！",
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ color: [] }, { background: [] }],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ align: [] }],
              ["link", "image"],
              ["emoji"],
              ["clean"],
            ],
            handlers: {
              emoji: () => {
                setShowEmojiPicker(!showEmojiPicker);
              },
            },
          },
        },
      });

      // 监听内容变化
      quill.on("text-change", () => {
        const html = quill.root.innerHTML;
        setContent(html);
      });

      // 设置初始内容
      const initialContent = `
        <h2>欢迎使用 QuillJS + Emoji-Mart 编辑器！🎉</h2>
        <p>这是一个功能丰富的富文本编辑器，支持以下功能：</p>
        <ul>
          <li>📝 丰富的文本格式化选项</li>
          <li>😀 现代化表情符号选择器（点击工具栏的😀图标）</li>
          <li>🖼️ 图片和链接插入</li>
          <li>📋 列表和对齐功能</li>
          <li>🎨 文字颜色和背景色</li>
        </ul>
        <p>点击上方工具栏的表情符号按钮来添加emoji！ 😊</p>
        <p><strong>技术升级：</strong></p>
        <p>✅ 使用 Vite 作为构建工具（更快的开发体验）</p>
        <p>✅ 使用 emoji-mart（现代化的emoji选择器，无弃用警告）</p>
        <p>✅ 响应式设计，支持移动端和桌面端</p>
      `;

      quill.root.innerHTML = initialContent;
      quillRef.current = quill;
    }

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, []);

  const handleEmojiSelect = (emoji) => {
    if (quillRef.current) {
      const range = quillRef.current.getSelection();
      if (range) {
        quillRef.current.insertText(range.index, emoji.native);
        quillRef.current.setSelection(range.index + emoji.native.length);
      } else {
        // 如果没有选择范围，在末尾插入
        const length = quillRef.current.getLength();
        quillRef.current.insertText(length - 1, emoji.native);
      }
      setShowEmojiPicker(false);
    }
  };

  const handleClear = () => {
    if (quillRef.current) {
      quillRef.current.setContents([]);
      setContent("");
    }
  };

  const handleGetContent = () => {
    if (quillRef.current) {
      const delta = quillRef.current.getContents();
      const html = quillRef.current.root.innerHTML;
      const text = quillRef.current.getText();
      console.log("Delta格式：", delta);
      console.log("HTML格式：", html);
      console.log("纯文本：", text);
      alert("内容已输出到控制台！请按F12查看。");
    }
  };

  return (
    <div className="quill-emoji-editor">
      <div className="editor-container">
        <div ref={editorRef} className="editor" />

        {/* Emoji选择器 */}
        {showEmojiPicker && (
          <div className="emoji-picker-container">
            <div
              className="emoji-picker-overlay"
              onClick={() => setShowEmojiPicker(false)}
            />
            <div className="emoji-picker">
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="light"
                locale="zh"
                previewPosition="none"
                skinTonePosition="none"
              />
            </div>
          </div>
        )}
      </div>

      <div className="editor-actions">
        <button onClick={handleClear} className="action-btn clear-btn">
          🗑️ 清空内容
        </button>
        <button
          onClick={handleGetContent}
          className="action-btn get-content-btn"
        >
          📋 获取内容
        </button>
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="action-btn emoji-btn"
        >
          😀 {showEmojiPicker ? "关闭" : "打开"}表情选择器
        </button>
      </div>

      <div className="content-preview">
        <h3>实时预览：</h3>
        <div
          className="preview-content"
          dangerouslySetInnerHTML={{
            __html: content || "<p><em>暂无内容...</em></p>",
          }}
        />
      </div>
    </div>
  );
};

export default QuillEmojiEditor;
