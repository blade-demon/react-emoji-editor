import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import data from "emoji-mart/data/google.json";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import { Form, Input, Upload, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const QuillEmojiEditor = forwardRef(
  (
    {
      value,
      onChange,
      placeholder = "点击任意位置开始编辑... 使用 Ctrl+E 快速添加表情！",
      height = 300,
      disabled = false,
      showTips = true,
      ...props
    },
    ref
  ) => {
    const editorRef = useRef(null);
    const quillRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    // 拖拽相关 state
    const [pickerPos, setPickerPos] = useState(null); // {left, top} 或 null 居中
    const dragOffset = useRef({ x: 0, y: 0 });
    const dragging = useRef(false);
    const pickerRef = useRef(null);
    const editorContainerRef = useRef(null);

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
        // 创建自定义图标 - 使用SVG
        const icons = Quill.import("ui/icons");

        // Emoji SVG 图标
        icons[
          "emoji"
        ] = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zM8.5 9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-5.436 6.928A6.985 6.985 0 0 0 12 16.5a6.985 6.985 0 0 0 1.936-.428 1 1 0 1 1 .547 1.921A8.978 8.978 0 0 1 12 18.5a8.978 8.978 0 0 1-2.483-.507 1 1 0 1 1 .547-1.921z"/>
        </svg>`;

        // User SVG 图标
        icons[
          "user"
        ] = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>`;

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
                ["emoji", "user"],
                ["clean"],
              ],
              handlers: {
                emoji: () => {
                  if (!disabled) {
                    setShowEmojiPicker(!showEmojiPicker);
                  }
                },
                user: () => {
                  if (!disabled) {
                    handleUserInsert();
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

        // 添加键盘快捷键支持
        quill.keyboard.addBinding({
          key: "e",
          ctrlKey: true,
          handler: () => {
            if (!disabled) {
              setShowEmojiPicker(!showEmojiPicker);
              return false; // 阻止默认行为
            }
          },
        });

        // 添加用户插入快捷键 Ctrl+U
        quill.keyboard.addBinding({
          key: "u",
          ctrlKey: true,
          handler: () => {
            if (!disabled) {
              handleUserInsert();
              return false; // 阻止默认行为
            }
          },
        });

        // ESC 关闭 emoji 选择器
        quill.keyboard.addBinding({
          key: "Escape",
          handler: () => {
            if (showEmojiPicker) {
              setShowEmojiPicker(false);
              return false;
            }
          },
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

    // 关闭 picker 时重置位置
    useEffect(() => {
      if (!showEmojiPicker) {
        setPickerPos(null);
      }
    }, [showEmojiPicker]);

    // 拖拽事件处理
    const onDragStart = (e) => {
      if (!pickerRef.current || !editorContainerRef.current) return;
      dragging.current = true;
      const pickerRect = pickerRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - pickerRect.left,
        y: e.clientY - pickerRect.top,
      };
      document.addEventListener("mousemove", onDragMove);
      document.addEventListener("mouseup", onDragEnd);
    };
    const onDragMove = (e) => {
      if (!dragging.current || !editorContainerRef.current) return;
      const editorRect = editorContainerRef.current.getBoundingClientRect();
      let left = e.clientX - editorRect.left - dragOffset.current.x;
      let top = e.clientY - editorRect.top - dragOffset.current.y;
      // 限制在编辑器区域内
      const pickerWidth = pickerRef.current.offsetWidth;
      const pickerHeight = pickerRef.current.offsetHeight;
      left = Math.max(0, Math.min(left, editorRect.width - pickerWidth));
      top = Math.max(0, Math.min(top, editorRect.height - pickerHeight));
      setPickerPos({ left, top });
    };
    const onDragEnd = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", onDragMove);
      document.removeEventListener("mouseup", onDragEnd);
    };

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

    // 处理用户插入
    const handleUserInsert = () => {
      if (quillRef.current && !disabled) {
        const range = quillRef.current.getSelection();
        const userText = "@user@";

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

    // 处理编辑器容器点击事件
    const handleEditorContainerClick = (e) => {
      if (quillRef.current && !disabled) {
        // 检查点击的是否是工具栏或emoji选择器
        const isToolbarClick = e.target.closest(".ql-toolbar");
        const isEmojiPickerClick = e.target.closest(".emoji-picker-container");

        // 如果不是工具栏或emoji选择器，则聚焦编辑器
        if (!isToolbarClick && !isEmojiPickerClick) {
          quillRef.current.focus();

          // 如果点击的是编辑器容器但不是编辑器内容区域，将光标定位到末尾
          const isEditorContent = e.target.closest(".ql-editor");
          if (!isEditorContent) {
            const length = quillRef.current.getLength();
            quillRef.current.setSelection(length - 1);
          }
        }
      }
    };

    return (
      <div
        className={`quill-emoji-editor-wrapper ${disabled ? "disabled" : ""}`}
        {...props}
      >
        <div
          className="editor-container"
          onClick={handleEditorContainerClick}
          ref={editorContainerRef}
        >
          <div
            ref={editorRef}
            className="editor"
            style={{ minHeight: height }}
          />

          {/* Emoji选择器 */}
          {showEmojiPicker && !disabled && (
            <div
              className="emoji-picker-container"
              style={
                pickerPos
                  ? {
                      left: pickerPos.left,
                      top: pickerPos.top,
                      transform: "none",
                    }
                  : {}
              }
            >
              <div
                className="emoji-picker-overlay"
                onClick={() => setShowEmojiPicker(false)}
              />
              <div className="emoji-picker" ref={pickerRef}>
                {/* 拖拽手柄 */}
                <div
                  className="emoji-picker-drag-bar"
                  onMouseDown={onDragStart}
                  style={{ cursor: "move", userSelect: "none" }}
                  title="拖拽移动表情选择框"
                >
                  <span style={{ fontSize: 14, color: "#888" }}>
                    拖拽此处移动
                  </span>
                </div>
                {/* 关闭按钮 */}
                <button
                  className="emoji-picker-close"
                  onClick={() => setShowEmojiPicker(false)}
                  title="关闭表情选择器 (ESC)"
                >
                  ×
                </button>
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
                  backgroundImageFn={(set, sheetSize) => {
                    return `/emoji.png`;
                  }}
                  tooltip={true}
                />
              </div>
            </div>
          )}
        </div>

        {/* 交互提示 */}
        {showTips && !disabled && (
          <div className="editor-tips">
            <span className="tip-item">💡 点击编辑器任意位置开始输入</span>
            <span className="tip-item">⌨️ Ctrl+E 快速添加表情</span>
            <span className="tip-item">👤 Ctrl+U 插入用户标签</span>
            <span className="tip-item">⎋ ESC 关闭表情选择器</span>
          </div>
        )}
      </div>
    );
  }
);

QuillEmojiEditor.displayName = "QuillEmojiEditor";

export default QuillEmojiEditor;

// ====== 以下为表单示例，集成图片上传 ======
const normFile = (e) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

export const QuillFormWithUpload = () => {
  const [fileList, setFileList] = useState([]);
  const [editorValue, setEditorValue] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);

  // 上传前转base64用于本地预览
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new window.FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  const onFinish = (values) => {
    // 这里可以处理表单提交逻辑
    console.log("表单提交内容：", values);
  };

  return (
    <Form onFinish={onFinish} layout="vertical">
      <Form.Item
        label="标题"
        name="title"
        rules={[{ required: true, message: "请输入标题" }]}
      >
        <Input placeholder="请输入标题" />
      </Form.Item>
      <Form.Item
        label="内容"
        name="content"
        rules={[{ required: true, message: "请输入内容" }]}
      >
        <QuillEmojiEditor value={editorValue} onChange={setEditorValue} />
      </Form.Item>
      <Form.Item
        label="上传图片"
        name="images"
        valuePropName="fileList"
        getValueFromEvent={normFile}
      >
        <Upload
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={({ fileList: newFileList }) => setFileList(newFileList)}
          beforeUpload={() => false} // 阻止自动上传
        >
          {fileList.length >= 8 ? null : (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>上传</div>
            </div>
          )}
        </Upload>
        {/* 图片预览弹窗 */}
        {previewVisible && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setPreviewVisible(false)}
          >
            <img
              alt="预览"
              style={{ maxWidth: "80vw", maxHeight: "80vh" }}
              src={previewImage}
            />
          </div>
        )}
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};
