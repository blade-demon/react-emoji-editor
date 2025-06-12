# 🎨 CSS 自动导入解决方案指南

## 概述

在 React 项目中，手动导入 CSS 文件可能会变得繁琐。本指南介绍了几种自动导入 CSS 的方法，适用于 Node 14 + React 16 + Webpack 4 + Babel 环境。

## 🚀 方案一：babel-plugin-import（推荐用于第三方库）

### 1. 安装依赖

```bash
npm install --save-dev babel-plugin-import less@^3.13.1 less-loader@^7.3.0
```

### 2. 配置 .babelrc

```json
{
  "presets": [
    ["@babel/preset-env", { "targets": { "node": "14" } }],
    "@babel/preset-react"
  ],
  "plugins": [
    "@babel/plugin-transform-optional-chaining",
    "@babel/plugin-transform-nullish-coalescing-operator",
    "@babel/plugin-transform-class-properties",
    [
      "import",
      {
        "libraryName": "antd",
        "style": true
      },
      "antd"
    ]
  ]
}
```

### 3. 更新 webpack.config.js

```javascript
module.exports = {
  // ... 其他配置
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.less$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
    ],
  },
};
```

### 4. 使用效果

**之前：**
```javascript
import { Button } from 'antd';
import 'antd/dist/antd.css'; // 需要手动导入
```

**之后：**
```javascript
import { Button } from 'antd'; // 自动导入对应的样式
```

## 🛠️ 方案二：自定义 Babel 插件（自动导入同名 CSS）

### 1. 创建自定义插件

创建 `babel-plugin-auto-css-import.js` 文件：

```javascript
const path = require('path');
const fs = require('fs');

module.exports = function(babel) {
  const { types: t } = babel;

  return {
    name: 'auto-css-import',
    visitor: {
      Program(path, state) {
        const filename = state.filename;
        if (!filename || !filename.endsWith('.jsx') && !filename.endsWith('.js')) {
          return;
        }

        // 获取组件文件的目录和基础名称
        const dir = path.dirname(filename);
        const baseName = path.basename(filename, path.extname(filename));
        
        // 查找对应的 CSS 文件
        const cssFile = path.join(dir, `${baseName}.css`);
        
        if (fs.existsSync(cssFile)) {
          // 检查是否已经导入了该 CSS 文件
          let hasImport = false;
          path.traverse({
            ImportDeclaration(importPath) {
              const source = importPath.node.source.value;
              if (source.endsWith(`${baseName}.css`) || source === `./${baseName}.css`) {
                hasImport = true;
              }
            }
          });

          // 如果没有导入，则添加导入语句
          if (!hasImport) {
            const importDeclaration = t.importDeclaration(
              [],
              t.stringLiteral(`./${baseName}.css`)
            );
            
            // 在第一个非导入语句前插入 CSS 导入
            let insertIndex = 0;
            for (let i = 0; i < path.node.body.length; i++) {
              if (!t.isImportDeclaration(path.node.body[i])) {
                insertIndex = i;
                break;
              }
              insertIndex = i + 1;
            }
            
            path.node.body.splice(insertIndex, 0, importDeclaration);
          }
        }
      }
    }
  };
};
```

### 2. 配置 .babelrc

```json
{
  "plugins": [
    // ... 其他插件
    "./babel-plugin-auto-css-import.js"
  ]
}
```

### 3. 使用效果

**文件结构：**
```
src/components/
├── Button.jsx
├── Button.css    ← 自动导入
├── Header.jsx
└── Header.css    ← 自动导入
```

**代码：**
```javascript
// Button.jsx
import React from 'react';
// import './Button.css'; ← 不需要手动导入，插件会自动添加

const Button = () => <button className="btn">Click me</button>;
export default Button;
```

## 🎯 方案三：CSS Modules 自动导入

### 1. 安装依赖

```bash
npm install --save-dev babel-plugin-react-css-modules
```

### 2. 配置 webpack

```javascript
{
  test: /\.css$/,
  use: [
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        modules: {
          localIdentName: '[name]__[local]--[hash:base64:5]',
        },
      },
    },
  ],
}
```

### 3. 配置 .babelrc

```json
{
  "plugins": [
    [
      "react-css-modules",
      {
        "generateScopedName": "[name]__[local]--[hash:base64:5]",
        "autoResolveMultipleImports": true
      }
    ]
  ]
}
```

### 4. 使用效果

```javascript
// Button.jsx
import React from 'react';
// CSS 会自动导入

const Button = () => (
  <button styleName="btn primary">Click me</button>
);
```

## 📦 方案四：Webpack resolve.alias + 全局样式

### 1. 配置 webpack.config.js

```javascript
const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@components': path.resolve(__dirname, 'src/components'),
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        include: path.resolve(__dirname, 'src/styles'),
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
```

### 2. 创建全局样式入口

```javascript
// src/styles/index.js
import './global.css';
import './components.css';
import './utilities.css';
```

### 3. 在入口文件导入

```javascript
// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import '@styles'; // 自动导入所有样式
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
```

## 🔧 方案五：PostCSS + autoprefixer 自动化

### 1. 安装依赖

```bash
npm install --save-dev postcss-loader autoprefixer postcss-import
```

### 2. 创建 postcss.config.js

```javascript
module.exports = {
  plugins: [
    require('postcss-import'),
    require('autoprefixer'),
  ],
};
```

### 3. 配置 webpack

```javascript
{
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader',
    'postcss-loader',
  ],
}
```

### 4. 使用 @import 规则

```css
/* main.css */
@import './components/button.css';
@import './components/header.css';
@import './utils/utilities.css';
```

## 🎨 最佳实践建议

### 1. 选择合适的方案

- **第三方库样式**：使用 `babel-plugin-import`
- **组件同名样式**：使用自定义 Babel 插件
- **CSS Modules**：使用 `babel-plugin-react-css-modules`
- **全局样式**：使用 webpack alias + 统一入口

### 2. 项目结构建议

```
src/
├── styles/
│   ├── index.js          ← 全局样式入口
│   ├── globals.css       ← 全局样式
│   └── variables.css     ← CSS 变量
├── components/
│   ├── Button/
│   │   ├── Button.jsx
│   │   └── Button.css    ← 组件样式
│   └── Header/
│       ├── Header.jsx
│       └── Header.css
└── App.jsx
```

### 3. 性能优化

- 使用 CSS Tree Shaking
- 按需加载组件样式
- 生产环境压缩 CSS
- 使用 CSS Modules 避免样式冲突

### 4. 兼容性考虑

- 确保 Less/Sass loader 版本与 webpack 兼容
- 使用 autoprefixer 处理浏览器前缀
- 考虑 IE 兼容性需求

## 🚀 当前项目配置

本项目已配置了以下自动导入方案：

1. **antd 样式自动导入**：使用 `babel-plugin-import`
2. **组件同名 CSS 自动导入**：使用自定义 Babel 插件
3. **Less 文件支持**：配置了 less-loader

### 使用方法

```javascript
// 自动导入 antd 样式
import { Button, Card } from 'antd';

// 自动导入同名 CSS（如果存在 ComponentName.css）
const ComponentName = () => <div className="component">Content</div>;
```

### 测试验证

启动开发服务器：
```bash
npm start
```

检查编译后的代码是否自动包含了对应的 CSS 导入语句。 