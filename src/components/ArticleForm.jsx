import React, { useState, useRef } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  message,
  Typography,
  Divider,
  Tag,
  Select,
  Row,
  Col,
} from "antd";
import {
  SendOutlined,
  SaveOutlined,
  ClearOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import axios from "axios";
import QuillEmojiEditor from "./QuillEmojiEditor";
import "./ArticleForm.css";

const { Title, Text } = Typography;
const { Option } = Select;

const ArticleForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const editorRef = useRef(null);

  // 模拟提交到服务器
  const submitToServer = async (data) => {
    try {
      // 这里可以替换为真实的服务器端点
      const response = await axios.post("/api/articles", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      // 模拟网络请求（因为没有真实服务器）
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            id: Date.now(),
            message: "文章提交成功！",
          });
        }, 1500);
      });
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      // 获取编辑器内容
      const editorContent = editorRef.current?.getContent();

      const submitData = {
        ...values,
        content: editorContent?.html || "",
        contentText: editorContent?.text || "",
        contentDelta: editorContent?.delta || null,
        publishedAt: new Date().toISOString(),
      };

      console.log("提交数据：", submitData);

      const result = await submitToServer(submitData);

      if (result.success) {
        message.success(result.message || "提交成功！");
        // 清空表单
        form.resetFields();
        editorRef.current?.clear();
      } else {
        message.error(result.message || "提交失败！");
      }
    } catch (error) {
      console.error("提交错误：", error);
      message.error("提交失败，请重试！");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    const content = editorRef.current?.getContent();
    setPreviewContent(content?.html || "");
    setPreviewVisible(true);
  };

  const handleClear = () => {
    form.resetFields();
    editorRef.current?.clear();
    message.info("表单已清空");
  };

  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields();
      const editorContent = editorRef.current?.getContent();

      const draftData = {
        ...values,
        content: editorContent?.html || "",
        status: "draft",
        savedAt: new Date().toISOString(),
      };

      // 保存到本地存储作为草稿
      localStorage.setItem("articleDraft", JSON.stringify(draftData));
      message.success("草稿已保存到本地！");
    } catch (error) {
      console.error("保存草稿失败：", error);
      message.error("保存草稿失败！");
    }
  };

  // 加载草稿
  const loadDraft = () => {
    try {
      const draft = localStorage.getItem("articleDraft");
      if (draft) {
        const draftData = JSON.parse(draft);
        form.setFieldsValue({
          title: draftData.title,
          category: draftData.category,
          tags: draftData.tags,
          summary: draftData.summary,
        });

        if (draftData.content) {
          editorRef.current?.setContent(draftData.content);
        }

        message.success("草稿已加载！");
      } else {
        message.info("暂无草稿");
      }
    } catch (error) {
      message.error("加载草稿失败！");
    }
  };

  return (
    <div className="article-form-container">
      <Card className="form-card">
        <div className="form-header">
          <Title level={2}>📝 创建新文章</Title>
          <Text type="secondary">使用富文本编辑器创建精美的文章内容</Text>
        </div>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="article-form"
          initialValues={{
            category: "technology",
            tags: [],
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item
                label="文章标题"
                name="title"
                rules={[
                  { required: true, message: "请输入文章标题!" },
                  { min: 5, message: "标题至少5个字符!" },
                  { max: 100, message: "标题不能超过100个字符!" },
                ]}
              >
                <Input
                  size="large"
                  placeholder="请输入一个吸引人的标题..."
                  showCount
                  maxLength={100}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="文章分类"
                name="category"
                rules={[{ required: true, message: "请选择文章分类!" }]}
              >
                <Select size="large" placeholder="选择分类">
                  <Option value="technology">🔧 技术</Option>
                  <Option value="lifestyle">🌟 生活</Option>
                  <Option value="business">💼 商业</Option>
                  <Option value="education">📚 教育</Option>
                  <Option value="entertainment">🎬 娱乐</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="文章标签" name="tags">
            <Select
              mode="tags"
              size="large"
              placeholder="添加标签（按回车键添加）"
              tokenSeparators={[","]}
              maxTagCount={5}
            >
              <Option value="react">React</Option>
              <Option value="javascript">JavaScript</Option>
              <Option value="frontend">前端</Option>
              <Option value="tutorial">教程</Option>
              <Option value="quilljs">QuillJS</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="文章摘要"
            name="summary"
            rules={[
              { required: true, message: "请输入文章摘要!" },
              { min: 20, message: "摘要至少20个字符!" },
              { max: 300, message: "摘要不能超过300个字符!" },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="简要描述文章内容..."
              showCount
              maxLength={300}
            />
          </Form.Item>

          <Form.Item
            label="文章内容"
            name="content"
            rules={[
              {
                validator: async (_, value) => {
                  const content = editorRef.current?.getContent();
                  if (!content || content.text.trim().length < 10) {
                    return Promise.reject(
                      new Error("文章内容至少需要10个字符!")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <QuillEmojiEditor
              ref={editorRef}
              height={400}
              placeholder="开始写作吧... 使用😀按钮添加表情符号让文章更生动！"
            />
          </Form.Item>

          <Divider />

          <div className="form-actions">
            <Space size="middle" wrap>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                icon={<SendOutlined />}
              >
                {loading ? "提交中..." : "发布文章"}
              </Button>

              <Button
                size="large"
                onClick={handleSaveDraft}
                icon={<SaveOutlined />}
              >
                保存草稿
              </Button>

              <Button size="large" onClick={loadDraft} type="dashed">
                加载草稿
              </Button>

              <Button
                size="large"
                onClick={handlePreview}
                icon={<EyeOutlined />}
              >
                预览
              </Button>

              <Button
                size="large"
                onClick={handleClear}
                icon={<ClearOutlined />}
                danger
              >
                清空
              </Button>
            </Space>
          </div>
        </Form>

        {/* 预览模态框 */}
        {previewVisible && (
          <div className="preview-modal">
            <div
              className="preview-overlay"
              onClick={() => setPreviewVisible(false)}
            />
            <div className="preview-content">
              <div className="preview-header">
                <Title level={3}>文章预览</Title>
                <Button onClick={() => setPreviewVisible(false)}>关闭</Button>
              </div>
              <div
                className="preview-body"
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ArticleForm;
