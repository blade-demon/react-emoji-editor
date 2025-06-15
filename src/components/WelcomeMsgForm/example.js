import React, { useState, useEffect } from "react";
import { Button, Space, message } from "antd";
import WelcomeMsgForm from "./index";

// 使用示例组件
const WelcomeMsgExample = () => {
  const [formMethods, setFormMethods] = useState(null);
  const [externalData, setExternalData] = useState(null);

  // 模拟外部数据
  const mockExternalData = {
    text: {
      content: "<p>欢迎加入我们的团队！这里是一个示例欢迎语。</p>",
    },
    attachments: [
      {
        msgtype: "image",
        image: {
          lfsPath: "/path/to/welcome-image.jpg",
        },
      },
      {
        msgtype: "link",
        link: {
          title: "公司官网",
          desc: "了解更多关于我们公司的信息",
          url: "https://company.com",
          picurl: "/path/to/company-logo.jpg",
        },
      },
      {
        msgtype: "miniprogram",
        miniprogram: {
          title: "公司小程序",
          appid: "wx1234567890abcdef",
          page: "pages/index/index",
          lfsPath: "/path/to/miniprogram-cover.jpg",
        },
      },
    ],
  };

  // 表单准备就绪的回调
  const handleFormReady = (methods) => {
    setFormMethods(methods);
    console.log("表单方法已准备就绪:", methods);
    message.success("表单初始化完成！");
  };

  // 加载示例数据
  const loadSampleData = () => {
    const jsonString = JSON.stringify(mockExternalData);
    setExternalData(jsonString);
    message.info("示例数据已加载");
  };

  // 通过方法设置数据
  const setDataByMethod = () => {
    if (formMethods) {
      const success = formMethods.setFormData(JSON.stringify(mockExternalData));
      if (success) {
        message.success("通过方法设置数据成功");
      } else {
        message.error("设置数据失败");
      }
    } else {
      message.warning("表单还未准备就绪");
    }
  };

  // 获取当前表单数据
  const getCurrentData = () => {
    if (formMethods) {
      const currentData = formMethods.getFormData();
      console.log("当前表单数据:", currentData);
      message.info("当前数据已打印到控制台");
    } else {
      message.warning("表单还未准备就绪");
    }
  };

  // 重置表单
  const resetFormData = () => {
    if (formMethods) {
      formMethods.resetForm();
      message.success("表单已重置");
    } else {
      message.warning("表单还未准备就绪");
    }
  };

  // 清除外部数据
  const clearExternalData = () => {
    setExternalData(null);
    message.info("外部数据已清除");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>WelcomeMsgForm 外部数据初始化示例</h2>

      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#f5f5f5",
        }}
      >
        <h3>操作按钮：</h3>
        <Space wrap>
          <Button type="primary" onClick={loadSampleData}>
            加载示例数据（通过属性）
          </Button>
          <Button onClick={setDataByMethod}>设置数据（通过方法）</Button>
          <Button onClick={getCurrentData}>获取当前数据</Button>
          <Button onClick={resetFormData}>重置表单</Button>
          <Button onClick={clearExternalData}>清除外部数据</Button>
        </Space>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>当前外部数据：</h3>
        <pre
          style={{ background: "#f0f0f0", padding: "10px", fontSize: "12px" }}
        >
          {externalData ? externalData : "暂无外部数据"}
        </pre>
      </div>

      <WelcomeMsgForm
        sendWelcomeMsg={externalData}
        onFormReady={handleFormReady}
      />
    </div>
  );
};

export default WelcomeMsgExample;

/*
使用说明：

1. 通过 sendWelcomeMsg 属性初始化：
   - 传入JSON字符串格式的数据
   - 组件会自动解析并设置表单字段

2. 通过 onFormReady 回调获取操作方法：
   - getFormData() - 获取当前表单数据
   - setFormData(data) - 设置表单数据（支持对象或JSON字符串）
   - resetForm() - 重置表单
   - initializeFormWithData(jsonString) - 直接解析JSON并初始化

3. 数据格式要求：
   {
     "text": {
       "content": "<p>HTML格式的文本内容</p>"
     },
     "attachments": [
       {
         "msgtype": "image",
         "image": { "lfsPath": "/服务器文件路径" }
       },
       {
         "msgtype": "file", 
         "file": { "lfsPath": "/服务器文件路径" }
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
*/
