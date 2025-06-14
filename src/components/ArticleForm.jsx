import React, { useState, useRef, useEffect } from "react";
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
  Checkbox,
} from "antd";
import {
  SendOutlined,
  SaveOutlined,
  ClearOutlined,
  EyeOutlined,
  PlusOutlined,
  MinusOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import QuillEmojiEditor from "./QuillEmojiEditor";

const { Title, Text } = Typography;
const { Option } = Select;

const ArticleForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const editorRef = useRef(null);
  const [wechatContacts, setWechatContacts] = useState([
    { id: 1, name: "", qrCode: "", advanced: "" },
  ]);
  const [draftStatus, setDraftStatus] = useState(null); // 草稿状态

  // 检查是否有草稿
  const checkDraftStatus = () => {
    const draft = localStorage.getItem("articleDraft");
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        setDraftStatus({
          savedAt: draftData.savedAt,
          autoSaved: draftData.autoSaved || false,
        });
      } catch (error) {
        setDraftStatus(null);
      }
    } else {
      setDraftStatus(null);
    }
  };

  // 组件挂载时检查草稿状态
  useEffect(() => {
    checkDraftStatus();
  }, []);

  // 清除草稿
  const clearDraft = () => {
    localStorage.removeItem("articleDraft");
    setDraftStatus(null);
    message.success("草稿已清除！");
  };

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
        content: editorContent?.html ?? "",
        contentText: editorContent?.text ?? "",
        contentDelta: editorContent?.delta ?? null,
        wechatContacts: wechatContacts,
        publishedAt: new Date().toISOString(),
      };

      console.log("提交数据：", submitData);

      const result = await submitToServer(submitData);

      if (result.success) {
        message.success(result.message || "提交成功！");
        // 清空表单和微信联系人
        form.resetFields();
        editorRef.current?.clear();
        setWechatContacts([{ id: 1, name: "", qrCode: "", advanced: "" }]);
        // 清除草稿
        clearDraft();
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
    setPreviewContent(content?.html ?? "");
    setPreviewVisible(true);
  };

  const handleClear = () => {
    form.resetFields();
    editorRef.current?.clear();
    setWechatContacts([{ id: 1, name: "", qrCode: "", advanced: "" }]);
    clearDraft(); // 同时清除草稿
    message.info("表单已清空（包含微信联系人数据）");
  };

  const handleSaveDraft = async () => {
    try {
      const values = form.getFieldsValue(); // 使用 getFieldsValue 而不是 validateFields
      const editorContent = editorRef.current?.getContent();

      // 合并表单数据和状态数据，确保微信联系人数据完整
      const mergedWechatContacts = wechatContacts.map((contact) => {
        const formData = values.wechatContacts?.[contact.id] || {};
        return {
          ...contact,
          name: formData.name || contact.name || "",
          qrCode: formData.qrCode || contact.qrCode || "",
          advanced: formData.advanced || contact.advanced || "",
        };
      });

      const draftData = {
        ...values,
        content: editorContent?.html ?? "",
        wechatContacts: mergedWechatContacts,
        status: "draft",
        savedAt: new Date().toISOString(),
      };

      // 保存到本地存储作为草稿
      localStorage.setItem("articleDraft", JSON.stringify(draftData));
      setDraftStatus({ savedAt: draftData.savedAt, autoSaved: false });
      message.success("草稿已保存到本地（包含微信联系人数据）！");
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

        // 恢复表单字段
        form.setFieldsValue({
          title: draftData.title,
          category: draftData.category,
          tags: draftData.tags,
          summary: draftData.summary,
        });

        // 恢复编辑器内容
        if (draftData.content) {
          editorRef.current?.setContent(draftData.content);
        }

        // 恢复微信联系人数据
        if (
          draftData.wechatContacts &&
          Array.isArray(draftData.wechatContacts)
        ) {
          setWechatContacts(draftData.wechatContacts);

          // 同时恢复表单中的微信联系人字段值
          const wechatFormData = { wechatContacts: {} };
          draftData.wechatContacts.forEach((contact) => {
            wechatFormData.wechatContacts[contact.id] = {
              name: contact.name || "",
              qrCode: contact.qrCode || "",
              advanced: contact.advanced || "",
            };
          });
          form.setFieldsValue(wechatFormData);

          // 延迟确保表单字段正确设置
          setTimeout(() => {
            draftData.wechatContacts.forEach((contact) => {
              form.setFieldValue(
                ["wechatContacts", contact.id, "name"],
                contact.name || ""
              );
              form.setFieldValue(
                ["wechatContacts", contact.id, "qrCode"],
                contact.qrCode || ""
              );
              form.setFieldValue(
                ["wechatContacts", contact.id, "advanced"],
                contact.advanced || ""
              );
            });
          }, 100);
        }

        const saveType = draftData.autoSaved ? "自动保存" : "手动保存";
        message.success(
          `草稿已加载！（${saveType}时间：${new Date(
            draftData.savedAt
          ).toLocaleString()}）`
        );
      } else {
        message.info("暂无草稿");
      }
    } catch (error) {
      console.error("加载草稿失败：", error);
      message.error("加载草稿失败！");
    }
  };

  // 添加微信联系人
  const addWechatContact = () => {
    const newId = Math.max(...wechatContacts.map((c) => c.id)) + 1;
    setWechatContacts([
      ...wechatContacts,
      { id: newId, name: "", qrCode: "", advanced: "" },
    ]);
  };

  // 删除微信联系人
  const removeWechatContact = (id) => {
    if (wechatContacts.length > 1) {
      setWechatContacts(wechatContacts.filter((c) => c.id !== id));
    }
  };

  // 更新微信联系人信息
  const updateWechatContact = (id, field, value) => {
    const updatedContacts = wechatContacts.map((c) =>
      c.id === id ? { ...c, [field]: value } : c
    );
    setWechatContacts(updatedContacts);

    // 同步更新表单字段值
    form.setFieldValue(["wechatContacts", id, field], value);

    // 可选：自动保存草稿（防抖处理）
    clearTimeout(window.autoSaveTimer);
    window.autoSaveTimer = setTimeout(() => {
      handleAutoSaveDraft(updatedContacts);
    }, 2000); // 2秒后自动保存
  };

  // 自动保存草稿（不显示成功消息，避免打扰用户）
  const handleAutoSaveDraft = async (
    currentWechatContacts = wechatContacts
  ) => {
    try {
      const values = form.getFieldsValue();
      const editorContent = editorRef.current?.getContent();

      // 合并表单数据和状态数据，确保微信联系人数据完整
      const mergedWechatContacts = currentWechatContacts.map((contact) => {
        const formData = values.wechatContacts?.[contact.id] || {};
        return {
          ...contact,
          name: formData.name || contact.name || "",
          qrCode: formData.qrCode || contact.qrCode || "",
          advanced: formData.advanced || contact.advanced || "",
        };
      });

      const draftData = {
        ...values,
        content: editorContent?.html ?? "",
        wechatContacts: mergedWechatContacts,
        status: "draft",
        savedAt: new Date().toISOString(),
        autoSaved: true, // 标记为自动保存
      };

      localStorage.setItem("articleDraft", JSON.stringify(draftData));
      setDraftStatus({ savedAt: draftData.savedAt, autoSaved: true });
      console.log("草稿已自动保存", new Date().toLocaleString());
    } catch (error) {
      console.error("自动保存草稿失败：", error);
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

          {/* 新增：微信联系人管理区域 */}
          <Card
            title={
              <Space>
                <span>微信联系人管理</span>
                {draftStatus && (
                  <Tag
                    color={draftStatus.autoSaved ? "blue" : "green"}
                    size="small"
                  >
                    {draftStatus.autoSaved ? "自动保存" : "手动保存"}
                    {new Date(draftStatus.savedAt).toLocaleTimeString()}
                  </Tag>
                )}
              </Space>
            }
            size="small"
            className="wechat-contact-card"
            style={{ marginBottom: 24 }}
            extra={
              <Space>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={addWechatContact}
                >
                  添加
                </Button>
                <Button size="small">全部</Button>
                <Button type="primary" size="small" icon={<SearchOutlined />}>
                  高级搜索
                </Button>
                <Button size="small" icon={<EditOutlined />}>
                  编辑
                </Button>
                {draftStatus && (
                  <Button
                    size="small"
                    danger
                    type="text"
                    onClick={clearDraft}
                    title="清除草稿"
                  >
                    清除草稿
                  </Button>
                )}
              </Space>
            }
          >
            {wechatContacts.map((contact, index) => (
              <div key={contact.id} className="wechat-contact-row">
                <Row gutter={16} align="middle">
                  <Col xs={24} sm={1}>
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<MinusOutlined />}
                      onClick={() => removeWechatContact(contact.id)}
                      disabled={wechatContacts.length === 1}
                      className="wechat-remove-btn"
                    />
                  </Col>
                  <Col xs={24} sm={2}>
                    <div className="wechat-contact-label">标签{index + 1}:</div>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Form.Item
                      name={["wechatContacts", contact.id, "name"]}
                      style={{ margin: 0 }}
                    >
                      <Input
                        placeholder="添加微信输入一个人"
                        value={contact.name}
                        onChange={(e) =>
                          updateWechatContact(
                            contact.id,
                            "name",
                            e.target.value
                          )
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={2}>
                    <div className="wechat-contact-label">标签2:</div>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Form.Item
                      name={["wechatContacts", contact.id, "qrCode"]}
                      style={{ margin: 0 }}
                    >
                      <Select
                        placeholder="选择二维码"
                        value={contact.qrCode}
                        onChange={(value) =>
                          updateWechatContact(contact.id, "qrCode", value)
                        }
                      >
                        <Option value="personal">个人二维码</Option>
                        <Option value="group">群聊二维码</Option>
                        <Option value="business">商务二维码</Option>
                        <Option value="official">公众号二维码</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={2}>
                    <div className="wechat-contact-label">标签3:</div>
                  </Col>
                  <Col xs={24} sm={5}>
                    <Form.Item
                      name={["wechatContacts", contact.id, "advanced"]}
                      style={{ margin: 0 }}
                    >
                      <Input
                        placeholder="高级搜索"
                        suffix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            ))}
          </Card>

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
