import React, { useRef, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { Picker } from "emoji-mart";
// import emojiPng from './images/emoji.png';
import "emoji-mart/css/emoji-mart.css";
import "./index.less";

const Editor = ({
  value,
  onChange,
  onEditorReady, // 新增：当编辑器准备好时的回调
  placeholder = "开始输入内容...",
  disabled = false,
  ...props
}) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [content, setContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const createEditorAPI = (quillInstance) => ({
    getContent: () => {
      if (quillInstance) {
        return {
          html: quillInstance.root.innerHTML,
          text: quillInstance.getText(),
          delta: quillInstance.getContents(),
        };
      }
      return null;
    },
    setContent: (content) => {
      if (quillInstance) {
        quillInstance.root.innerHTML = content;
      }
    },
    clear: () => {
      if (quillInstance) {
        quillInstance.setContents([]);
      }
    },
    focus: () => {
      if (quillInstance) {
        quillInstance.focus();
      }
    },
    getQuill: () => quillInstance,
    insertText: (text, index) => {
      if (quillInstance) {
        const insertIndex =
          index !== undefined ? index : quillInstance.getLength() - 1;
        quillInstance.insertText(insertIndex, text);
      }
    },
  });

  const handleUserInsert = () => {
    if (quillRef.current) {
      const range = quillRef.current.getSelection();
      const userText = "@微信昵称@";
      if (range) {
        quillRef.current.insertText(range.index, userText);
        quillRef.current.setSelection(range.index + userText.length);
      } else {
        // 如果没有选择范围，在末尾插入
        const length = quillRef.current.getLength();
        quillRef.current.insertText(length - 1, userText);
        quillRef.current.setSelection(length - 1 + userText.length);
      }
    }
  };

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      // 创建自定义emoji按钮
      const icons = Quill.import("ui/icons");
      icons["emoji"] = "😀";
      icons[
        "user"
      ] = `<svg style="width: 18px;height: 18px;margin-left: 0" viewBox="64 64 896 896" focusable="false" data-icon="user" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"></path></svg>`;

      // QuillJS 配置
      const quill = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "内容不超过999字，超过字数提示“文本内容不超过999字",
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ color: [] }, { background: [] }],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ align: [] }],
              ["link"],
              ["emoji", "user"],
              ["clean"],
            ],
            handlers: {
              emoji: () => {
                setShowEmojiPicker((prev) => !prev);
              },
              user: () => {
                console.log("插入user");
                handleUserInsert();
              },
              clean: () => {
                // console.log("clean");
                quill.root.innerHTML = "";
                setContent("");
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

      quill.keyboard.addBinding({
        key: "Escape",
        handler: () => {
          setShowEmojiPicker(false);
          return false;
        },
      });

      if (onEditorReady) {
        onEditorReady(createEditorAPI(quill));
      }

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

  /**
   * 处理编辑器容器点击事件
   * @param {MouseEvent} e 鼠标点击事件对象
   */
  const handleEditorContainerClick = (e) => {
    if (quillRef.current) {
      const isToolbarClick = e.target.closest(".ql-toolbar");
      const isEmojiPickerClick = e.target.closest(".emoji-picker-container");

      if (!isToolbarClick && !isEmojiPickerClick) {
        quillRef.current.focus();

        const isEditorContent = e.target.closest(".ql-editor");
        if (!isEditorContent) {
          const length = quillRef.current.getLength();
          quillRef.current.setSelection(length - 1);
        }
      }
    }
  };

  return (
    <div className="quill-emoji-editor">
      <div className="editor-container" onClick={handleEditorContainerClick}>
        <div ref={editorRef} className="editor" />

        {/* Emoji选择器 */}
        {showEmojiPicker && (
          <div className="emoji-picker-container">
            <Picker
              // backgroundImageFn={() => emojiPng}
              onSelect={handleEmojiSelect}
              theme="light"
              showPreview={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
