# WelcomeMsgForm 组件使用说明

## 功能概述

WelcomeMsgForm 是一个支持外部数据初始化的欢迎语表单组件，支持以下功能：
- 文本内容编辑（支持富文本编辑器）
- 图片上传
- 文件上传
- 网页链接分享
- 小程序分享
- 外部数据初始化表单

## 基本使用

```jsx
import WelcomeMsgForm from './components/WelcomeMsgForm';

function App() {
  const [formMethods, setFormMethods] = useState(null);

  const handleFormReady = (methods) => {
    setFormMethods(methods);
    console.log('表单已准备就绪，可以使用以下方法：', methods);
  };

  const handleFormSubmit = (formData) => {
    console.log('表单提交数据：', formData);
  };

  return (
    <WelcomeMsgForm 
      onFormReady={handleFormReady}
      sendWelcomeMsg={null} // 可以传入JSON字符串进行初始化
    />
  );
}
```

## 外部数据初始化

### 1. 通过 sendWelcomeMsg 属性初始化

```jsx
const externalData = JSON.stringify({
  "text": { 
    "content": "<p>欢迎加入我们的团队！</p>" 
  },
  "attachments": [
    {
      "msgtype": "image",
      "image": { 
        "lfsPath": "/path/to/welcome-image.jpg" 
      }
    },
    {
      "msgtype": "link",
      "link": {
        "title": "公司官网",
        "desc": "了解更多关于我们的信息",
        "url": "https://company.com",
        "picurl": "/path/to/company-logo.jpg"
      }
    }
  ]
});

<WelcomeMsgForm 
  sendWelcomeMsg={externalData}
  onFormReady={handleFormReady}
/>
```

### 2. 通过表单方法动态设置数据

```jsx
const handleFormReady = (methods) => {
  setFormMethods(methods);
  
  // 可以随时调用这些方法
  // methods.setFormData(data) - 设置表单数据
  // methods.getFormData() - 获取表单数据
  // methods.resetForm() - 重置表单
  // methods.parseAndSetFormData(jsonString) - 解析JSON并设置表单
};

// 在某个事件中设置表单数据
const handleLoadExternalData = () => {
  if (formMethods) {
    const newData = {
      textContent: '<p>新的欢迎语内容</p>',
      imageUpload: [],
      fileUpload: [],
      webPages: [{
        linkUrl: 'https://example.com',
        pageTitle: '示例网页',
        pageDescription: '这是一个示例网页描述',
        shareImage: []
      }],
      miniPrograms: []
    };
    
    formMethods.setFormData(newData);
  }
};
```

## 数据格式说明

### 输入数据格式（sendWelcomeMsg）

```json
{
  "text": {
    "content": "<p>HTML格式的文本内容</p>"
  },
  "attachments": [
    {
      "msgtype": "image",
      "image": {
        "lfsPath": "/服务器上的图片路径"
      }
    },
    {
      "msgtype": "file", 
      "file": {
        "lfsPath": "/服务器上的文件路径"
      }
    },
    {
      "msgtype": "link",
      "link": {
        "title": "网页标题",
        "desc": "网页描述", 
        "url": "网页链接",
        "picurl": "分享图片路径"
      }
    },
    {
      "msgtype": "miniprogram",
      "miniprogram": {
        "title": "小程序标题",
        "appid": "小程序appid",
        "page": "小程序页面路径", 
        "lfsPath": "封面图片路径"
      }
    }
  ]
}
```

### 表单内部数据格式

```javascript
{
  textContent: '<p>HTML格式的文本内容</p>',
  imageUpload: [
    {
      uid: 'image-0',
      name: 'image-0', 
      status: 'done',
      url: '/path/to/image.jpg',
      response: {
        data: {
          url: '/path/to/image.jpg'
        }
      }
    }
  ],
  fileUpload: [
    // 文件上传格式类似图片
  ],
  webPages: [
    {
      linkUrl: 'https://example.com',
      pageTitle: '网页标题',
      pageDescription: '网页描述',
      shareImage: [
        // 图片格式数组
      ]
    }
  ],
  miniPrograms: [
    {
      title: '小程序标题',
      appid: '小程序appid', 
      pagePath: '小程序页面路径',
      coverImage: [
        // 图片格式数组
      ]
    }
  ]
}
```

## 方法说明

### formMethods.setFormData(data)
- **功能**: 设置表单数据
- **参数**: `data` - 表单数据对象或JSON字符串
- **返回**: `boolean` - 设置是否成功

### formMethods.getFormData()
- **功能**: 获取当前表单数据
- **返回**: `object` - 当前表单的所有字段值

### formMethods.resetForm()
- **功能**: 重置表单到初始状态
- **说明**: 清空所有字段、重置上传列表、清除错误状态

### formMethods.parseAndSetFormData(jsonString)
- **功能**: 解析JSON字符串并设置表单数据
- **参数**: `jsonString` - JSON格式的字符串
- **返回**: `boolean` - 解析和设置是否成功

## 注意事项

1. **文件上传**: 组件会自动处理文件上传，外部数据中的文件路径会被转换为Upload组件需要的格式

2. **数据验证**: 设置外部数据时，请确保数据格式正确，错误的数据格式会在控制台输出错误信息

3. **异步初始化**: 如果需要异步加载数据，建议在数据加载完成后再调用设置方法

4. **编辑器依赖**: 文本内容的设置依赖于编辑器API，确保编辑器已经初始化完成

## 完整示例

```jsx
import React, { useState, useEffect } from 'react';
import WelcomeMsgForm from './components/WelcomeMsgForm';

function WelcomeMsgPage() {
  const [formMethods, setFormMethods] = useState(null);
  const [externalData, setExternalData] = useState(null);

  // 模拟从后端获取数据
  useEffect(() => {
    const fetchData = async () => {
      // 模拟API调用
      const data = {
        text: { content: '<p>欢迎语模板</p>' },
        attachments: [
          {
            msgtype: 'image',
            image: { lfsPath: '/uploads/welcome.jpg' }
          }
        ]
      };
      setExternalData(JSON.stringify(data));
    };

    fetchData();
  }, []);

  const handleFormReady = (methods) => {
    setFormMethods(methods);
    console.log('表单方法已准备:', methods);
  };

  const handleSave = () => {
    if (formMethods) {
      const currentData = formMethods.getFormData();
      console.log('当前表单数据:', currentData);
      // 保存逻辑
    }
  };

  const handleReset = () => {
    if (formMethods) {
      formMethods.resetForm();
    }
  };

  return (
    <div>
      <h1>欢迎语设置</h1>
      <div style={{ marginBottom: 16 }}>
        <button onClick={handleSave}>保存</button>
        <button onClick={handleReset}>重置</button>
      </div>
      
      <WelcomeMsgForm 
        sendWelcomeMsg={externalData}
        onFormReady={handleFormReady}
      />
    </div>
  );
}

export default WelcomeMsgPage;
``` 