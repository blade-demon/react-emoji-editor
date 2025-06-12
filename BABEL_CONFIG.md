# Babel 配置说明

## 环境要求
- Node.js 14+
- React 16.14.0
- Webpack 4.x
- @babel/preset-env 7.4.4

## 已配置的 Babel 插件

### 1. 可选链操作符支持 (Optional Chaining)
**插件**: `@babel/plugin-transform-optional-chaining`

```javascript
// 支持以下语法
const value = obj?.prop?.method?.();
const arrayItem = array?.[index];
const result = func?.();
```

### 2. 空值合并操作符支持 (Nullish Coalescing)
**插件**: `@babel/plugin-transform-nullish-coalescing-operator`

```javascript
// 支持以下语法
const defaultValue = value ?? 'default';
const config = userConfig ?? defaultConfig;
```

### 3. 类属性支持 (Class Properties)
**插件**: `@babel/plugin-transform-class-properties`

```javascript
// 支持以下语法
class MyComponent extends React.Component {
  state = { count: 0 };
  
  handleClick = () => {
    this.setState({ count: this.state.count + 1 });
  };
}
```

## 配置文件

### .babelrc
```json
{
  "presets": [
    ["@babel/preset-env", {
      "targets": {
        "node": "14"
      }
    }],
    "@babel/preset-react"
  ],
  "plugins": [
    "@babel/plugin-transform-optional-chaining",
    "@babel/plugin-transform-nullish-coalescing-operator",
    "@babel/plugin-transform-class-properties"
  ]
}
```

### webpack.config.js 中的 babel-loader 配置
```javascript
{
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-env', '@babel/preset-react'],
      plugins: [
        '@babel/plugin-transform-optional-chaining',
        '@babel/plugin-transform-nullish-coalescing-operator',
        '@babel/plugin-transform-class-properties',
      ],
    },
  },
}
```

## 使用示例

在项目中，现在可以安全地使用现代 JavaScript 语法：

```javascript
// ArticleForm.jsx 中的示例
const editorContent = editorRef.current?.getContent();
const content = editorContent?.html ?? "";
const text = editorContent?.text ?? "";
const delta = editorContent?.delta ?? null;

// QuillEmojiEditorClass.jsx 中的类属性
class QuillEmojiEditorClass extends Component {
  initializeQuill = () => {
    // 箭头函数自动绑定 this
  };
  
  handleEmojiSelect = (emoji) => {
    // 类方法使用箭头函数语法
  };
}
```

## 兼容性说明

- ✅ 支持可选链操作符 (`?.`)
- ✅ 支持空值合并操作符 (`??`)
- ✅ 支持类属性和箭头函数方法
- ✅ 兼容 Node 14 和 React 16
- ✅ 与 Webpack 4.x 完全兼容

配置完成后，项目可以使用这些现代 JavaScript 特性，同时保持与指定版本的兼容性。 