import React, { useCallback, useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Row,
  Col,
  Space,
  Drawer,
  Alert,
} from "antd";
import axios from "axios";
// import Loadable from "react-loadable";
import Editor from "../Editor";
// import checkSendWelcomeMsgModel from "../../models/CheckSendWelcomeMsgModel";
import {
  checkUploadImageProps,
  checkUploadFileProps,
  imagePreview,
  // uploadItemRender,
  handleUploadError,
} from "./UploadUtils";
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const WelcomeMsgForm = ({ onFormReady, sendWelcomeMsg }) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [editorApi, setEditorApi] = useState(null);
  const [numberOfAttachments, setNumberOfAttachments] = useState(0);
  const [paramCheckResult, setParamCheckResult] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState({});
  const [formInitValues, setFormInitValues] = useState({});

  // 新增状态：跟踪上传错误
  const [uploadErrors, setUploadErrors] = useState({
    webPages: {}, // 存储每个网页分享图的上传错误状态
    miniPrograms: {}, // 存储每个小程序封面图的上传错误状态
    images: false, // 图片上传错误状态
    files: false, // 文件上传错误状态
  });

  const getEmojiEditorContent = () => {
    let content = null;
    content = editorApi?.getContent();
    return content;
  };

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  // 检查是否有上传错误
  const hasUploadErrors = () => {
    // 检查图片和文件上传错误
    if (uploadErrors.images || uploadErrors.files) {
      return true;
    }

    // 检查网页分享图上传错误
    const webPageErrors = Object.values(uploadErrors.webPages);
    if (webPageErrors.some((error) => error)) {
      return true;
    }

    // 检查小程序封面图上传错误
    const miniProgramErrors = Object.values(uploadErrors.miniPrograms);
    if (miniProgramErrors.some((error) => error)) {
      return true;
    }

    return false;
  };

  const onFinish = (values) => {
    // 在提交前检查是否有上传错误
    if (hasUploadErrors()) {
      message.error("请先解决上传错误后再提交");
      return;
    }

    const { imageUpload, fileUpload, miniPrograms, webPages } = values;

    // 验证网页分享图必须上传
    if (Array.isArray(webPages) && webPages.length > 0) {
      for (let i = 0; i < webPages.length; i++) {
        const webPage = webPages[i];
        if (!webPage.shareImage || webPage.shareImage.length === 0) {
          message.error(`第${i + 1}个网页项必须上传分享图`);
          return;
        }
        // 检查是否有上传成功的文件
        const hasValidShareImage = webPage.shareImage.some(
          (file) => file.status === "done" && file.response?.data?.url
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
        // 检查是否有上传成功的文件
        const hasValidCoverImage = miniProgram.coverImage.some(
          (file) => file.status === "done" && file.response?.data?.url
        );
        if (!hasValidCoverImage) {
          message.error(`第${i + 1}个小程序项的封面图尚未上传成功`);
          return;
        }
      }
    }

    const params = {};
    const emojiContent = getEmojiEditorContent();

    if (emojiContent?.html?.replace(/<[^>]*>/g, "")?.length > 0) {
      params.text = {};
      params.text.content = emojiContent?.html;
    }

    if (
      Array.isArray(imageUpload) ||
      Array.isArray(fileUpload) ||
      Array.isArray(miniPrograms) ||
      Array.isArray(webPages)
    ) {
      params.attachments = [];

      if (Array.isArray(imageUpload)) {
        imageUpload.map((image) => {
          params.attachments.push({
            msgtype: "image",
            image: {
              lfsPath: image?.response?.data?.url,
            },
          });
        });
      }

      if (Array.isArray(fileUpload)) {
        fileUpload.map((file) => {
          params.attachments.push({
            msgtype: "file",
            file: {
              lfsPath: file?.response?.data?.url,
            },
          });
        });
      }

      if (Array.isArray(miniPrograms)) {
        miniPrograms.map((miniprogram) => {
          // console.log("miniprogram", miniprogram);
          const { pagePath, appid, title, coverImage } = miniprogram;
          params.attachments.push({
            msgtype: "miniprogram",
            miniprogram: {
              title,
              appid,
              page: pagePath,
              lfsPath:
                coverImage?.[0]?.response?.data?.url || coverImage?.[0]?.url,
              // coverImage ||
              // "/nfsc/lfdstaticprd/static/upload/20250613/17c8443b6a074170a04e8c76959b459d.jpg", // TODO 要修改成图片地址
            },
          });
        });
      }

      if (Array.isArray(webPages)) {
        webPages.map((webPage) => {
          const { linkUrl, pageDescription, pageTitle, shareImage } = webPage;
          params.attachments.push({
            msgtype: "link",
            link: {
              title: pageTitle,
              desc: pageDescription,
              url: linkUrl,
              picurl:
                shareImage?.[0]?.response?.data?.url || shareImage?.[0]?.url,
              // shareImage ||
              // "https://lfd-social.lujijincdn.com/lusocial/static/upload/20250613/17e9ed9b528042a3a85a41d9a0b3ebcd.jpg", // TODO 要修改成图片地址
            },
          });
        });
      }
    }

    const checkParam = { sendWelcomeMsg: JSON.stringify(params) };
    // checkSendWelcomeMsgModel.execute(
    //   checkParam,
    //   (res) => {
    //     if (res?.res_code === "0") {
    // 检查通过
    typeof onFormReady === "function" ? onFormReady(checkParam) : null;
    setWelcomeMsg(checkParam);
    setParamCheckResult(true);
    setOpen(false);
    // } else {
    //   message.error(res?.res_msg);
    // }
    // },
    // (err) => {
    //   console.log("err", err);
    // }
    // );
  };

  const handleEditorReady = useCallback((api) => {
    setEditorApi(api);
    console.log("Editor is ready!");
  }, []);

  const onReset = () => {
    setNumberOfAttachments(0);
    // 重置上传错误状态
    setUploadErrors({
      webPages: {},
      miniPrograms: {},
      images: false,
      files: false,
    });
    form.resetFields();
    setFormInitValues({});

    if (editorApi) {
      editorApi.setContent("");
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const customImageRequest = async (file, onSuccess, onError) => {
    try {
      try {
        const formData = new FormData();
        formData.append("file", file);
        // 发起上传请求
        const response = await axios.post(
          "/wb-wecom/file/upload/files",
          formData,
          {
            onUploadProgress: (progressEvent) => {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              console.log(`上传进度：${percent}%`);
            },
          }
        );

        if (+response.data.res_code === 0) {
          message.info("文件上传成功！");
          const fileUrl = response?.data?.data?.url;
          onSuccess(response?.data, file);
          return fileUrl;
        } else {
          message.error("文件上传失败！");
          throw new Error(`保存失败：${response.data.resultMsg}`);
        }
      } catch (error) {
        handleUploadError(error, file); // 统一错误处理
      }
    } catch (error) {
      onError(error, file);
    }
  };

  // 解析外部数据并初始化表单
  const initializeFormWithData = (welcomeMsgData) => {
    try {
      const { text, attachments = [] } = JSON.parse(welcomeMsgData);

      // 设置编辑器内容
      if (text?.content && editorApi) {
        editorApi.setContent(text.content);
      }

      const imageUpload = [];
      const fileUpload = [];
      const webPages = [];
      const miniPrograms = [];

      // 解析附件数据
      attachments.forEach((attachment, index) => {
        if (attachment.msgtype === "image") {
          imageUpload.push({
            uid: `image-${index}`,
            name: `image-${index}.jpg`,
            status: "done",
            url: attachment.image?.lfsPath,
            response: {
              data: {
                url: attachment.image?.lfsPath,
              },
            },
          });
        } else if (attachment.msgtype === "file") {
          fileUpload.push({
            uid: `file-${index}`,
            name: `file-${index}.pdf`,
            status: "done",
            url: attachment.file?.lfsPath,
            response: {
              data: {
                url: attachment.file?.lfsPath,
              },
            },
          });
        } else if (attachment.msgtype === "link") {
          const shareImage = attachment.link?.picurl
            ? [
                {
                  uid: `webpage-${index}`,
                  name: `webpage-${index}.jpg`,
                  status: "done",
                  url: attachment.link.picurl,
                  response: {
                    data: {
                      url: attachment.link.picurl,
                    },
                  },
                },
              ]
            : [];

          webPages.push({
            linkUrl: attachment.link?.url,
            pageTitle: attachment.link?.title,
            pageDescription: attachment.link?.desc,
            shareImage: shareImage,
          });
        } else if (attachment.msgtype === "miniprogram") {
          const coverImage = attachment.miniprogram?.lfsPath
            ? [
                {
                  uid: `miniprogram-${index}`,
                  name: `miniprogram-${index}.jpg`,
                  status: "done",
                  url: attachment.miniprogram.lfsPath,
                  response: {
                    data: {
                      url: attachment.miniprogram.lfsPath,
                    },
                  },
                },
              ]
            : [];

          miniPrograms.push({
            title: attachment.miniprogram?.title,
            appid: attachment.miniprogram?.appid,
            pagePath: attachment.miniprogram?.page,
            coverImage: coverImage,
          });
        }
      });

      // 设置表单字段值
      const formValues = {
        textContent: text?.content || "",
        imageUpload,
        fileUpload,
        webPages,
        miniPrograms,
      };

      // 更新附件数量
      setNumberOfAttachments(attachments.length);

      // 设置表单初始值和当前值
      setFormInitValues(formValues);
      form.setFieldsValue(formValues);

      console.log("表单数据初始化成功:", formValues);
      return true;
    } catch (error) {
      console.error("外部数据解析失败:", error);
      return false;
    }
  };

  // 获取当前表单数据
  const getFormData = () => {
    return form.getFieldsValue();
  };

  // 手动设置表单数据（可以是对象或JSON字符串）
  const setFormData = (data) => {
    if (typeof data === "string") {
      return initializeFormWithData(data);
    } else if (typeof data === "object" && data !== null) {
      setFormInitValues(data);
      form.setFieldsValue(data);
      return true;
    }
    return false;
  };

  // 重置表单
  const resetForm = () => {
    onReset();
  };

  // 将方法暴露给父组件
  useEffect(() => {
    if (typeof onFormReady === "function") {
      onFormReady({
        getFormData,
        setFormData,
        resetForm,
        initializeFormWithData,
      });
    }
  }, [form, editorApi]);

  // 监听外部数据变化
  useEffect(() => {
    if (sendWelcomeMsg && editorApi) {
      initializeFormWithData(sendWelcomeMsg);
    }
  }, [sendWelcomeMsg, editorApi]);

  return (
    <>
      <Row justify="space-between" align="middle">
        <Col span={21}>
          <div className="selected-tags">
            {paramCheckResult ? (
              <h5>
                {Object.keys(welcomeMsg).length > 0
                  ? JSON.stringify(welcomeMsg)
                  : ""}
              </h5>
            ) : sendWelcomeMsg ? (
              sendWelcomeMsg
            ) : null}
          </div>
        </Col>
        <Col span={3} style={{ textAlign: "right" }}>
          <Button type="secondary" onClick={showDrawer}>
            编辑
          </Button>
        </Col>
      </Row>

      <Drawer
        visible={open}
        title="添加欢迎语"
        closable={{ "aria-label": "Close Button" }}
        onClose={onClose}
        width={600}
        keyboard={false}
      >
        <h5>
          如果已经在企微管理端为相关成员配置了可用的欢迎语，则本配置不会生效
          已经开始的聊天的客户不能发送欢迎语
        </h5>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={formInitValues}
        >
          {/* Text Content */}
          <Form.Item name="textContent" label="文本内容">
            <Editor onEditorReady={handleEditorReady} />
          </Form.Item>

          {/* Image Upload */}
          <Form.Item label="图片">
            <Form.Item
              name="imageUpload"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              noStyle
            >
              <Upload
                name="imageUpload"
                listType="picture"
                multiple
                // fileList={imageList}
                onPreview={imagePreview}
                onRemove={(file) => {
                  if (file?.status !== "error") {
                    setNumberOfAttachments((preNumberOfAttachments) =>
                      preNumberOfAttachments - 1 > 0
                        ? preNumberOfAttachments - 1
                        : 0
                    );
                  } else {
                    // 移除失败的图片文件时，清除错误状态
                    setUploadErrors((prev) => ({ ...prev, images: false }));
                  }
                }}
                // itemRender={uploadItemRender}
                customRequest={async ({ file, onSuccess, onError }) => {
                  try {
                    // 检查附件个数
                    if (numberOfAttachments >= 9) {
                      message.error("最多上传9个附件");
                      throw new Error("最多上传9个附件");
                    }

                    // 验证图片格式和大小
                    await checkUploadImageProps(
                      file,
                      ["image/jpeg", "image/jpg", "image/png"],
                      512 * 1024,
                      1440,
                      1080
                    );

                    const imgUrl = await customImageRequest(
                      file,
                      onSuccess,
                      onError
                    );

                    if (imgUrl) {
                      if (numberOfAttachments < 9) {
                        setNumberOfAttachments((preNum) => preNum + 1);
                      }
                      // 上传成功，清除错误状态
                      setUploadErrors((prev) => ({ ...prev, images: false }));
                    }
                  } catch (error) {
                    // 设置图片上传错误状态
                    setUploadErrors((prev) => ({ ...prev, images: true }));
                    onError(error, file);
                  }
                }}
                showUploadList
                getValueFromEvent={(e) => {
                  // 返回自定义数据结构
                  if (Array.isArray(e)) {
                    return e;
                  }
                  return e && e.fileList ? e.fileList : [];
                }}
              >
                <Button icon={<UploadOutlined />}>图片上传</Button>
              </Upload>
            </Form.Item>
            <div style={{ color: "#888", fontSize: 12, marginTop: 8 }}>
              单张图片不超过512k，仅支持jpg/png格式，尺寸长边不超过1440px，短边不超过1080px
            </div>
          </Form.Item>

          {/* File Upload */}
          <Form.Item label="文件">
            <Form.Item
              name="fileUpload"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              noStyle
            >
              <Upload
                name="file"
                onRemove={(file) => {
                  if (file?.status !== "error") {
                    setNumberOfAttachments((preNumberOfAttachments) =>
                      preNumberOfAttachments - 1 > 0
                        ? preNumberOfAttachments - 1
                        : 0
                    );
                  } else {
                    // 移除失败的文件时，清除错误状态
                    setUploadErrors((prev) => ({ ...prev, files: false }));
                  }
                }}
                customRequest={async ({ file, onSuccess, onError }) => {
                  try {
                    // 检查附件个数
                    if (numberOfAttachments >= 9) {
                      message.error("最多上传9个附件");
                      throw new Error("最多上传9个附件");
                    }

                    // 验证图片格式和大小
                    await checkUploadFileProps(file, ["application/pdf"]);

                    const fileUrl = await customImageRequest(
                      file,
                      onSuccess,
                      onError
                    );

                    if (fileUrl) {
                      if (numberOfAttachments < 9) {
                        setNumberOfAttachments((preNum) => preNum + 1);
                      }
                      // 上传成功，清除错误状态
                      setUploadErrors((prev) => ({ ...prev, files: false }));
                    }
                  } catch (error) {
                    // 设置文件上传错误状态
                    setUploadErrors((prev) => ({ ...prev, files: true }));
                    onError(error, file);
                  }
                }}
              >
                <Button icon={<UploadOutlined />}>文件上传</Button>
              </Upload>
            </Form.Item>
            <div style={{ color: "#888", fontSize: 12, marginTop: 8 }}>
              单个文件不超过5M，仅支持.pdf格式
            </div>
          </Form.Item>

          {/* 网页 */}
          <Form.Item label="网页">
            <Form.List name="webPages">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <div
                      key={`webpage-${field.key}`}
                      style={{
                        border: "1px dashed #d9d9d9",
                        padding: "16px",
                        marginBottom: "16px",
                        position: "relative",
                      }}
                    >
                      <Form.Item
                        {...field}
                        name={[field.name, "linkUrl"]}
                        label="链接地址"
                        rules={[
                          {
                            required: true,
                            message: "请输入http或https开头的链接",
                          },
                        ]}
                      >
                        <Input placeholder="请输入http或https开头的链接" />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        name={[field.name, "pageTitle"]}
                        label="网页标题"
                        rules={[
                          {
                            required: true,
                            message: "请输入网页标题，不超过20字",
                          },
                        ]}
                      >
                        <Input
                          placeholder="请输入网页标题，限20字"
                          maxLength={20}
                        />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        name={[field.name, "pageDescription"]}
                        label="网页描述"
                        rules={[
                          { required: true, message: "网页描述不超过200字" },
                        ]}
                      >
                        <Input.TextArea
                          rows={2}
                          placeholder="网页描述，限200字"
                          maxLength={200}
                        />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        name={[field.name, "shareImage"]}
                        label="分享图"
                        valuePropName="fileList"
                        getValueFromEvent={(e) =>
                          Array.isArray(e) ? e : e && e.fileList
                        }
                        rules={[
                          {
                            required: true,
                            validator: (_, value) => {
                              if (!value || value.length === 0) {
                                return Promise.reject(
                                  new Error("请上传分享图")
                                );
                              }
                              // 检查是否有上传成功的文件
                              const hasValidFile = value.some(
                                (file) =>
                                  file.status === "done" &&
                                  file.response?.data?.url
                              );
                              if (!hasValidFile) {
                                return Promise.reject(
                                  new Error("请确保分享图上传成功")
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                        extra="不超过512k，图片尺寸：200*200像素， 只支持.jpg 格式"
                      >
                        <Upload
                          listType="picture"
                          maxCount={1}
                          showUploadList={{
                            showPreviewIcon: true,
                            showRemoveIcon: true,
                            showDownloadIcon: false,
                          }}
                          onRemove={(file) => {
                            // 删除分享图片时，清除该网页项的错误状态
                            setUploadErrors((prev) => ({
                              ...prev,
                              webPages: {
                                ...prev.webPages,
                                [field.key]: false,
                              },
                            }));
                            return true; // 允许删除
                          }}
                          customRequest={async ({
                            file,
                            onSuccess,
                            onError,
                          }) => {
                            try {
                              await checkUploadImageProps(
                                file,
                                ["image/jpg", "image/jpeg"],
                                512 * 1024,
                                200,
                                200
                              );

                              await customImageRequest(
                                file,
                                onSuccess,
                                onError
                              );
                              // 上传成功，清除该网页项的错误状态
                              setUploadErrors((prev) => ({
                                ...prev,
                                webPages: {
                                  ...prev.webPages,
                                  [field.key]: false,
                                },
                              }));
                            } catch (error) {
                              // 设置该网页项的上传错误状态
                              setUploadErrors((prev) => ({
                                ...prev,
                                webPages: {
                                  ...prev.webPages,
                                  [field.key]: true,
                                },
                              }));
                              onError(error, file);
                            }
                          }}
                        >
                          <Button>上传网页图</Button>
                        </Upload>
                      </Form.Item>

                      <Button
                        type="primary"
                        danger
                        onClick={() => {
                          setNumberOfAttachments((preNum) => preNum - 1);
                          // 清除该网页项的错误状态
                          setUploadErrors((prev) => {
                            const newWebPages = { ...prev.webPages };
                            delete newWebPages[field.key];
                            return { ...prev, webPages: newWebPages };
                          });
                          remove(field.name);
                        }}
                        style={{ position: "absolute", top: 16, right: 16 }}
                        icon={<DeleteOutlined />}
                      >
                        删除
                      </Button>
                    </div>
                  ))}

                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => {
                        if (numberOfAttachments < 9) {
                          setNumberOfAttachments((preNum) => preNum + 1);
                          add({
                            linkUrl: "",
                            pageTitle: "",
                            pageDescription: "",
                            shareImage: [],
                          });
                        } else {
                          message.error("最多上传9个附件");
                        }
                      }}
                      block
                      icon={<PlusOutlined />}
                    >
                      新增
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>

          {/* 小程序 */}
          <Form.Item label="小程序">
            <Form.List name="miniPrograms">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <div
                      key={`miniprogram-${field.key}`}
                      style={{
                        border: "1px dashed #d9d9d9",
                        padding: "16px",
                        marginBottom: "16px",
                        position: "relative",
                      }}
                    >
                      <Form.Item
                        {...field}
                        name={[field.name, "title"]}
                        label="消息标题"
                        rules={[{ required: true, message: "请输入消息标题" }]}
                      >
                        <Input
                          placeholder="请输入消息标题，消息标题不超过32字"
                          maxLength={20}
                        />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        name={[field.name, "appid"]}
                        label="appid"
                        rules={[
                          {
                            required: true,
                            message: "请输入合法appid",
                          },
                        ]}
                      >
                        <Input placeholder="请输入http或https开头的链接" />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        name={[field.name, "pagePath"]}
                        label="page路径"
                        rules={[{ required: true, message: "请输入page路径" }]}
                      >
                        <Input.TextArea
                          rows={2}
                          placeholder="网页描述，限30字"
                          maxLength={30}
                        />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        name={[field.name, "coverImage"]}
                        label="封面图"
                        valuePropName="fileList"
                        getValueFromEvent={(e) =>
                          Array.isArray(e) ? e : e && e.fileList
                        }
                        rules={[
                          {
                            required: true,
                            validator: (_, value) => {
                              if (!value || value.length === 0) {
                                return Promise.reject(
                                  new Error("请上传封面图")
                                );
                              }
                              // 检查是否有上传成功的文件
                              const hasValidFile = value.some(
                                (file) =>
                                  file.status === "done" &&
                                  file.response?.data?.url
                              );
                              if (!hasValidFile) {
                                return Promise.reject(
                                  new Error("请确保封面图上传成功")
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                        extra="不超过512k，封面图尺寸520*416像素， 只支持.jpg 格式"
                      >
                        <Upload
                          listType="picture"
                          maxCount={1}
                          showUploadList={{
                            showPreviewIcon: true,
                            showRemoveIcon: true,
                            showDownloadIcon: false,
                          }}
                          onRemove={(file) => {
                            // 删除封面图时，清除该小程序项的错误状态
                            setUploadErrors((prev) => ({
                              ...prev,
                              miniPrograms: {
                                ...prev.miniPrograms,
                                [field.key]: false,
                              },
                            }));
                            return true; // 允许删除
                          }}
                          customRequest={async ({
                            file,
                            onSuccess,
                            onError,
                          }) => {
                            try {
                              await checkUploadImageProps(
                                file,
                                ["image/jpeg", "image/jpg", "image/png"],
                                512 * 1024,
                                520,
                                416
                              );

                              await customImageRequest(
                                file,
                                onSuccess,
                                onError
                              );
                              // 上传成功，清除该小程序项的错误状态
                              setUploadErrors((prev) => ({
                                ...prev,
                                miniPrograms: {
                                  ...prev.miniPrograms,
                                  [field.key]: false,
                                },
                              }));
                            } catch (error) {
                              // 设置该小程序项的上传错误状态
                              setUploadErrors((prev) => ({
                                ...prev,
                                miniPrograms: {
                                  ...prev.miniPrograms,
                                  [field.key]: true,
                                },
                              }));
                              onError(error, file);
                            }
                          }}
                        >
                          <Button>上传封面图</Button>
                        </Upload>
                      </Form.Item>

                      <Button
                        type="primary"
                        danger
                        onClick={() => {
                          setNumberOfAttachments((preNum) => preNum - 1);
                          // 清除该小程序项的错误状态
                          setUploadErrors((prev) => {
                            const newMiniPrograms = { ...prev.miniPrograms };
                            delete newMiniPrograms[field.key];
                            return { ...prev, miniPrograms: newMiniPrograms };
                          });
                          remove(field.name);
                        }}
                        style={{ position: "absolute", top: 16, right: 16 }}
                        icon={<DeleteOutlined />}
                      >
                        删除
                      </Button>
                    </div>
                  ))}

                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => {
                        if (numberOfAttachments < 9) {
                          setNumberOfAttachments((preNum) => preNum + 1);
                          add({
                            title: "",
                            appid: "",
                            pagePath: "",
                            coverImage: [],
                          });
                        } else {
                          message.error("最多上传9个附件");
                        }
                      }}
                      block
                      icon={<PlusOutlined />}
                    >
                      新增
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>

          {/* 上传错误提示 */}
          {hasUploadErrors() && (
            <Form.Item>
              <Alert
                message="上传错误"
                description="请解决上传错误后再提交表单"
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
              />
            </Form.Item>
          )}

          {/* Action Buttons */}
          <Form.Item>
            <h4>
              已上传{" "}
              <em style={{ color: "red", fontSize: "14px" }}>
                {numberOfAttachments}
              </em>{" "}
              个材料，支持最多9个附件材料
            </h4>
            <Space>
              <Button onClick={onClose}>取消</Button>
              <Button onClick={onReset}>重置</Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={hasUploadErrors()}
              >
                确认
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default WelcomeMsgForm;
