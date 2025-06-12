import React, { Component } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import "./QuillEmojiEditor.css";

// React 15 风格的类组件
class QuillEmojiEditorClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showEmojiPicker: false,
    };

    // 创建ref来引用DOM元素
    this.editorRef = null;
    this.quillInstance = null;
  }

  componentDidMount() {
    this.initializeQuill();
  }

  componentWillUnmount() {
    if (this.quillInstance) {
      this.quillInstance = null;
    }
  }

  componentDidUpdate(prevProps) {
    // 监听props变化
    if (prevProps.value !== this.props.value && this.quillInstance) {
      const currentContent = this.quillInstance.root.innerHTML;
      if (currentContent !== this.props.value) {
        this.quillInstance.root.innerHTML = this.props.value || "";
      }
    }

    if (prevProps.disabled !== this.props.disabled && this.quillInstance) {
      this.quillInstance.enable(!this.props.disabled);
    }
  }

  initializeQuill = () => {
    if (this.editorRef && !this.quillInstance) {
      const icons = Quill.import("ui/icons");
      icons["emoji"] = "😀";

      const quill = new Quill(this.editorRef, {
        theme: "snow",
        placeholder: this.props.placeholder || "开始输入内容...",
        readOnly: this.props.disabled || false,
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
                if (!this.props.disabled) {
                  this.setState({
                    showEmojiPicker: !this.state.showEmojiPicker,
                  });
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

        if (this.props.onChange) {
          this.props.onChange(content);
        }
      });

      this.quillInstance = quill;

      if (this.props.value) {
        quill.root.innerHTML = this.props.value;
      }
    }
  };

  // 公开的方法 - 可以通过ref直接调用
  getContent = () => {
    if (this.quillInstance) {
      return {
        html: this.quillInstance.root.innerHTML,
        text: this.quillInstance.getText(),
        delta: this.quillInstance.getContents(),
      };
    }
    return null;
  };

  setContent = (content) => {
    if (this.quillInstance) {
      this.quillInstance.root.innerHTML = content;
    }
  };

  clear = () => {
    if (this.quillInstance) {
      this.quillInstance.setContents([]);
    }
  };

  focus = () => {
    if (this.quillInstance) {
      this.quillInstance.focus();
    }
  };

  getQuill = () => {
    return this.quillInstance;
  };

  handleEmojiSelect = (emoji) => {
    if (this.quillInstance && !this.props.disabled) {
      const range = this.quillInstance.getSelection();
      if (range) {
        this.quillInstance.insertText(range.index, emoji.native);
        this.quillInstance.setSelection(range.index + emoji.native.length);
      } else {
        const length = this.quillInstance.getLength();
        this.quillInstance.insertText(length - 1, emoji.native);
      }
      this.setState({ showEmojiPicker: false });
    }
  };

  render() {
    const {
      height = 300,
      disabled = false,
      className = "",
      ...props
    } = this.props;
    const { showEmojiPicker } = this.state;

    return (
      <div
        className={`quill-emoji-editor-wrapper ${
          disabled ? "disabled" : ""
        } ${className}`}
        {...props}
      >
        <div className="editor-container">
          <div
            ref={(ref) => (this.editorRef = ref)}
            className="editor"
            style={{ minHeight: height }}
          />

          {showEmojiPicker && !disabled && (
            <div className="emoji-picker-container">
              <div
                className="emoji-picker-overlay"
                onClick={() => this.setState({ showEmojiPicker: false })}
              />
              <div className="emoji-picker">
                <Picker
                  data={data}
                  onEmojiSelect={this.handleEmojiSelect}
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
}

export default QuillEmojiEditorClass;
