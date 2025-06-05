# QuillJS + Emoji 富文本编辑器演示

这是一个基于 React + QuillJS 的现代化富文本编辑器，集成了表情符号功能。

## 功能特性

- 🎨 **丰富的文本格式化**：支持标题、粗体、斜体、下划线、删除线等
- 😀 **表情符号支持**：内置表情符号选择器和快捷键输入
- 🎯 **实时预览**：编辑内容实时显示在预览区域
- 📱 **响应式设计**：适配移动端和桌面端
- 🚀 **现代化UI**：美观的界面设计和流畅的用户体验

## 表情符号功能

### 方式一：工具栏按钮
点击编辑器工具栏中的笑脸按钮（😀），选择想要的表情符号。

### 方式二：快捷键输入
直接在编辑器中输入表情符号的快捷键，例如：
- `:smile:` → 😊
- `:heart:` → ❤️
- `:thumbsup:` → 👍
- `:fire:` → 🔥
- `:star:` → ⭐
- `:laugh:` → 😂

## 安装依赖

```bash
npm install
```

## 启动开发服务器

```bash
npm start
# 或者
npm run dev
```

访问 http://localhost:3000 即可看到编辑器。

## 构建生产版本

```bash
npm run build
```

## 技术栈

- **React 18**：现代化前端框架
- **QuillJS**：强大的富文本编辑器
- **quill-emoji**：QuillJS 的表情符号扩展
- **Webpack 5**：模块打包工具
- **Babel**：JavaScript 编译器

## 项目结构

```
quilljs-emoji-demo/
├── public/
│   └── index.html          # HTML 模板
├── src/
│   ├── components/
│   │   ├── QuillEmojiEditor.js    # 主编辑器组件
│   │   └── QuillEmojiEditor.css   # 编辑器样式
│   ├── App.js              # 应用主组件
│   ├── App.css             # 应用样式
│   └── index.js            # 应用入口
├── package.json            # 项目依赖
├── webpack.config.js       # Webpack 配置
└── README.md              # 项目说明
```

## 自定义配置

### 添加更多工具栏选项

在 `QuillEmojiEditor.js` 中修改 `toolbar.container` 配置：

```javascript
toolbar: {
  container: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['emoji'],
    ['clean']
  ],
}
```

### 自定义表情符号

可以扩展 `quill-emoji` 模块来添加自定义表情符号或修改表情符号的行为。

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT License

---

开始使用这个强大的富文本编辑器，创造出色的内容体验！ 🚀 