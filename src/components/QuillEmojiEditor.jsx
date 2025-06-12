import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import "./QuillEmojiEditor.css";

const QuillEmojiEditor = forwardRef(
  (
    {
      value,
      onChange,
      placeholder = "开始输入内容... 点击工具栏的表情按钮添加emoji！",
      height = 300,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const editorRef = useRef(null);
    const quillRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      getQuill: () => quillRef.current,
      getContent: () => {
        if (quillRef.current) {
          return {
            html: quillRef.current.root.innerHTML,
            text: quillRef.current.getText(),
            delta: quillRef.current.getContents(),
          };
        }
        return null;
      },
      setContent: (content) => {
        if (quillRef.current) {
          quillRef.current.root.innerHTML = content;
        }
      },
      clear: () => {
        if (quillRef.current) {
          quillRef.current.setContents([]);
        }
      },
      focus: () => {
        if (quillRef.current) {
          quillRef.current.focus();
        }
      },
    }));

    useEffect(() => {
      if (editorRef.current && !quillRef.current) {
        // 创建自定义emoji按钮
        const icons = Quill.import("ui/icons");
        icons["emoji"] = "😀";

        // QuillJS 配置
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
                ["link"],
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

        // 监听内容变化
        quill.on("text-change", () => {
          const html = quill.root.innerHTML;
          const isEmpty = quill.getText().trim().length === 0;
          const content = isEmpty ? "" : html;

          if (onChange) {
            onChange(content);
          }
        });

        quillRef.current = quill;

        // 设置初始值
        if (value) {
          quill.root.innerHTML = value;
        }
      }

      return () => {
        if (quillRef.current) {
          quillRef.current = null;
        }
      };
    }, []);

    // 监听value变化
    useEffect(() => {
      if (quillRef.current && value !== undefined) {
        const currentContent = quillRef.current.root.innerHTML;
        if (currentContent !== value) {
          quillRef.current.root.innerHTML = value || "";
        }
      }
    }, [value]);

    // 监听disabled状态
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
          // 如果没有选择范围，在末尾插入
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
          <div
            ref={editorRef}
            className="editor"
            style={{ minHeight: height }}
          />

          {/* Emoji选择器 */}
          {showEmojiPicker && !disabled && (
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
      </div>
    );
  }
);

QuillEmojiEditor.displayName = "QuillEmojiEditor";

export default QuillEmojiEditor;
