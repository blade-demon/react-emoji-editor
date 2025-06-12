import React, { useRef, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import "./QuillEmojiEditor.css";

// 使用回调函数模式暴露内部方法
const QuillEmojiEditorCallback = ({
  value,
  onChange,
  onEditorReady, // 新增：当编辑器准备好时的回调
  placeholder = "开始输入内容...",
  height = 300,
  disabled = false,
  ...props
}) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // 创建API对象
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

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      const icons = Quill.import("ui/icons");
      icons["emoji"] = "😀";

      const quill = new Quill(editorRef.current, {
        theme: "snow",
        placeholder,
        readOnly: disabled,
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
                if (!disabled) {
                  setShowEmojiPicker(!showEmojiPicker);
                }
              },
            },
          },
        },
      });

      quill.on("text-change", () => {
        const html = quill.root.innerHTML;
        const isEmpty = quill.getText().trim().length === 0;
        const content = isEmpty ? "" : html;

        if (onChange) {
          onChange(content);
        }
      });

      quillRef.current = quill;

      if (value) {
        quill.root.innerHTML = value;
      }

      // 🎯 关键：通过回调函数暴露API
      if (onEditorReady) {
        onEditorReady(createEditorAPI(quill));
      }
    }

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (quillRef.current && value !== undefined) {
      const currentContent = quillRef.current.root.innerHTML;
      if (currentContent !== value) {
        quillRef.current.root.innerHTML = value || "";
      }
    }
  }, [value]);

  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.enable(!disabled);
    }
  }, [disabled]);

  const handleEmojiSelect = (emoji) => {
    if (quillRef.current && !disabled) {
      const range = quillRef.current.getSelection();
      if (range) {
        quillRef.current.insertText(range.index, emoji.native);
        quillRef.current.setSelection(range.index + emoji.native.length);
      } else {
        const length = quillRef.current.getLength();
        quillRef.current.insertText(length - 1, emoji.native);
      }
      setShowEmojiPicker(false);
    }
  };

  return (
    <div
      className={`quill-emoji-editor-wrapper ${disabled ? "disabled" : ""}`}
      {...props}
    >
      <div className="editor-container">
        <div ref={editorRef} className="editor" style={{ minHeight: height }} />

        {showEmojiPicker && !disabled && (
          <div className="emoji-picker-container">
            <div
              className="emoji-picker-overlay"
              onClick={() => setShowEmojiPicker(false)}
            />
            <div className="emoji-picker">
              <Picker
                onSelect={handleEmojiSelect}
                theme="light"
                i18n={{
                  search: "搜索",
                  clear: "清除",
                  notfound: "未找到表情",
                  skintext: "选择肤色",
                  categories: {
                    search: "搜索结果",
                    recent: "最近使用",
                    people: "人物",
                    nature: "自然",
                    foods: "食物",
                    activity: "活动",
                    places: "地点",
                    objects: "物体",
                    symbols: "符号",
                    flags: "旗帜",
                  },
                }}
                showPreview={false}
                showSkinTones={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuillEmojiEditorCallback;
