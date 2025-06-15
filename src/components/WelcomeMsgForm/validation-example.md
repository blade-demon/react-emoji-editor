# 分享图和封面图必填验证说明

## 功能概述

WelcomeMsgForm 组件现在支持强制要求上传分享图和封面图的验证功能，确保在提交表单前，所有网页项目都必须上传分享图，所有小程序项目都必须上传封面图。

## 验证规则

### 1. 网页分享图验证
- **必填验证**: 添加网页项目时，分享图为必填项
- **上传状态验证**: 确保图片上传成功（status === 'done'）
- **文件有效性验证**: 确保上传的文件有有效的URL地址

### 2. 小程序封面图验证
- **必填验证**: 添加小程序项目时，封面图为必填项
- **上传状态验证**: 确保图片上传成功（status === 'done'）
- **文件有效性验证**: 确保上传的文件有有效的URL地址

## 验证时机

### 1. 表单字段验证（实时验证）
- 当用户在字段间切换时触发
- 当用户删除已上传的图片时触发
- 提供即时的错误提示

### 2. 表单提交验证（最终验证）
- 在用户点击"确认"按钮时触发
- 检查所有网页和小程序项目的图片上传状态
- 如果有任何项目缺少图片，会阻止提交并显示错误消息

## 错误提示信息

### 字段级别错误提示
- "请上传分享图" - 当网页项目没有上传分享图时
- "请确保分享图上传成功" - 当分享图上传失败或正在上传时
- "请上传封面图" - 当小程序项目没有上传封面图时
- "请确保封面图上传成功" - 当封面图上传失败或正在上传时

### 提交级别错误提示
- "第X个网页项必须上传分享图" - 指明具体哪个网页项目缺少分享图
- "第X个网页项的分享图尚未上传成功" - 指明具体哪个网页项目的分享图上传失败
- "第X个小程序项必须上传封面图" - 指明具体哪个小程序项目缺少封面图
- "第X个小程序项的封面图尚未上传成功" - 指明具体哪个小程序项目的封面图上传失败

## 代码实现

### 表单字段验证规则
```javascript
// 网页分享图验证规则
rules={[
  {
    required: true,
    validator: (_, value) => {
      if (!value || value.length === 0) {
        return Promise.reject(new Error('请上传分享图'));
      }
      // 检查是否有上传成功的文件
      const hasValidFile = value.some(file => 
        file.status === 'done' && file.response?.data?.url
      );
      if (!hasValidFile) {
        return Promise.reject(new Error('请确保分享图上传成功'));
      }
      return Promise.resolve();
    },
  },
]}

// 小程序封面图验证规则
rules={[
  {
    required: true,
    validator: (_, value) => {
      if (!value || value.length === 0) {
        return Promise.reject(new Error('请上传封面图'));
      }
      // 检查是否有上传成功的文件
      const hasValidFile = value.some(file => 
        file.status === 'done' && file.response?.data?.url
      );
      if (!hasValidFile) {
        return Promise.reject(new Error('请确保封面图上传成功'));
      }
      return Promise.resolve();
    },
  },
]}
```

### 提交时验证逻辑
```javascript
const onFinish = (values) => {
  const { webPages, miniPrograms } = values;

  // 验证网页分享图必须上传
  if (Array.isArray(webPages) && webPages.length > 0) {
    for (let i = 0; i < webPages.length; i++) {
      const webPage = webPages[i];
      if (!webPage.shareImage || webPage.shareImage.length === 0) {
        message.error(`第${i + 1}个网页项必须上传分享图`);
        return;
      }
      const hasValidShareImage = webPage.shareImage.some(
        file => file.status === 'done' && file.response?.data?.url
      );
      if (!hasValidShareImage) {
        message.error(`第${i + 1}个网页项的分享图尚未上传成功`);
        return;
      }
    }
  }

  // 验证小程序封面图必须上传
  if (Array.isArray(miniPrograms) && miniPrograms.length > 0) {
    for (let i = 0; i < miniPrograms.length; i++) {
      const miniProgram = miniPrograms[i];
      if (!miniProgram.coverImage || miniProgram.coverImage.length === 0) {
        message.error(`第${i + 1}个小程序项必须上传封面图`);
        return;
      }
      const hasValidCoverImage = miniProgram.coverImage.some(
        file => file.status === 'done' && file.response?.data?.url
      );
      if (!hasValidCoverImage) {
        message.error(`第${i + 1}个小程序项的封面图尚未上传成功`);
        return;
      }
    }
  }

  // 继续提交流程...
};
```

## 用户体验优化

### 1. 上传状态显示
- 显示上传进度
- 显示上传成功/失败状态
- 提供预览功能
- 提供删除功能

### 2. 实时反馈
- 字段级别的实时验证
- 清晰的错误提示
- 成功状态的视觉反馈

### 3. 防止误操作
- 上传失败时阻止表单提交
- 明确指出具体哪个项目有问题
- 提供重新上传的机会

## 注意事项

1. **文件格式限制**
   - 网页分享图：只支持 .jpg/.jpeg 格式，200x200像素，不超过512k
   - 小程序封面图：支持 .jpg/.jpeg/.png 格式，520x416像素，不超过512k

2. **上传状态检查**
   - 验证函数会检查文件的 `status` 字段是否为 'done'
   - 验证文件的 `response.data.url` 是否存在

3. **错误处理**
   - 上传失败的文件不会通过验证
   - 正在上传中的文件不会通过验证
   - 只有上传成功的文件才会通过验证

## 测试场景

### 正常流程
1. 添加网页/小程序项目
2. 填写必填字段
3. 上传分享图/封面图
4. 等待上传成功
5. 提交表单成功

### 异常流程
1. 添加网页/小程序项目但不上传图片 → 提交时显示错误
2. 上传图片但上传失败 → 提交时显示错误
3. 上传图片后删除 → 提交时显示错误
4. 上传图片正在进行中 → 提交时显示错误

通过这些验证规则，确保了用户在提交表单前必须完成所有必要的图片上传，提高了数据的完整性和质量。 