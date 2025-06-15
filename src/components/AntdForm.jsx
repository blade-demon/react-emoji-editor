import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  Input,
  Button,
  Space,
  Checkbox,
  message,
} from "antd";
import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import WeComLabel from "./WeComLabel";
import WelcomeMsgForm from "./WelcomeMsgForm";
import departmentMockData from "./mock/list-department-info.json";
import logoMockData from "./mock/get-logo-address.json";
import getEmployeeInfoData from "./mock/get-employee-info.json";
import "./index.less";

const { Option } = Select;

const corpid = "ww1234567890"; // getparams('corpid') ;
const CookieCorpId = "ww1234567890"; // Cookie.get('manage_corpid');
const inviteChannelCode = "1234567890"; // getparams('code');
const pageType = "add"; // getparams('type');

const ruleTypeEnum = [
  { id: "SINGLE", name: "固定单人二维码" },
  { id: "MULTIPLE", name: "多人二维码" },
  { id: "EUBIND", name: "根据管护关系定向分配" },
  { id: "INTERCEPTOR", name: "拦截弹窗(请经过法审后配置)" },
  { id: "ADDED", name: "添加范围内员工展示活码，未添加走后续配置策略" },
];
const validSixText = (rule, value, cb) => {
  if (!value || value.length !== 6) {
    cb("请输入6字亮点文案");
  }
  cb();
};

const AntdForm = (props) => {
  const { userInfo } = props;
  const [form] = Form.useForm();
  const [isNeedLogin, setIsNeedLogin] = useState(true); // 1需要 0不要
  const [departmentEnable, setDepartmentEnable] = useState(true);
  const [departmentList, setDepartmentList] = useState([]);
  const [logoList, setLogoList] = useState([
    { id: "logo.png", name: "陆金所" },
  ]);
  const [userSystemList, setUserSystemList] = useState([
    { id: "all", name: "全员" },
    { id: "tag", name: "陆基金标签系统" },
  ]);
  const [employeeList, setEmployeeList] = useState([]);
  const [centerConfigList, setCenterConfigList] = useState([]);
  const [detailData, setDetailData] = useState({});
  const [otherRuleType, setOtherRuleType] = useState("");

  useEffect(() => {
    fetchData();
    fetchDepartment();
    fetchEmplyoee();
    fetchLogo();
    // FetchSubCenterList();
  }, []);

  const fetchData = () => {
    // 无论有没有inviteChannelCode，都设置基本的初始值
    form.setFieldsValue({
      inviteChannelCode: inviteChannelCode || "待生成",
      corpId: corpid,
      codeName: "",
      logoAddress: "",
      departmentIds: [],
      inviteRules: [{}],
      managerDoc: "您好，我是您的陆基金专属服务经理",
      introDoc1: "业务问题解答",
      introDoc2: "业务办理助理",
      introDoc3: "专属权益提醒",
      introDoc4: "海量优惠活动",
      friendWords: "您已添加过服务经理",
    });

    if (!inviteChannelCode) {
      return;
    }
    // CodeDetailModel.execute(
    //   {
    //     corpId: corpid,
    //     inviteChannelCode,
    //   },
    //   (res) => {
    //     if (+res.res_code === 0) {
    //       const { departmentIds = "[]" } = res.data;
    // setDetailData(res.data);
    // const inviteWelcomeMessage = res.data.inviteWelcomeMessage
    //   ? JSON.parse(res.data.inviteWelcomeMessage || "{}")
    //   : null;
    // const inviteRules = res.data.inviteRules
    //   .splice(0, res.data.inviteRules.length - 1)
    //   .map((e) => {
    //     e.system = e.tagId ? "tag" : "all";
    //     e.inviterList = e.inviterList ? e.inviterList.split(",") : [];
    //     if (e.displayMessage) {
    //       e.displayMessage = JSON.parse(e.displayMessage);
    //     }
    //     return e;
    //   });
    // const lastOtherRule = res.data.inviteRules[res.data.inviteRules.length - 1];

    // form.setFieldsValue({
    //   ...res.data,
    //   ...inviteWelcomeMessage,
    //   inviteChannelCode: pageType === "copy" ? "待生成" : inviteChannelCode,
    //   otherRule: {
    //     ...lastOtherRule,
    //     // addTags: lastOtherRule.addTags,
    //     // sendWelcomeMsg: lastOtherRule.sendWelcomeMsg,
    //     displayMessage: lastOtherRule.displayMessage
    //       ? JSON.parse(lastOtherRule.displayMessage)
    //       : "",
    //   },
    //   departmentIds: JSON.parse(departmentIds).map((e) => +e) || [],
    //   inviteRules,
    //   remember: !!JSON.parse(departmentIds).length > 0 || false,
    //   isNeedLogin: +res.data.isNeedLogin === 1,
    //   introDoc1:
    //     inviteWelcomeMessage && inviteWelcomeMessage.introDoc
    //       ? inviteWelcomeMessage.introDoc[0]
    //       : "",
    //   introDoc2:
    //     inviteWelcomeMessage && inviteWelcomeMessage.introDoc
    //       ? inviteWelcomeMessage.introDoc[1]
    //       : "",
    //   introDoc3:
    //     inviteWelcomeMessage && inviteWelcomeMessage.introDoc
    //       ? inviteWelcomeMessage.introDoc[2]
    //       : "",
    //   introDoc4:
    //     inviteWelcomeMessage && inviteWelcomeMessage.introDoc
    //       ? inviteWelcomeMessage.introDoc[3]
    //       : "",
    // });
    // setDepartmentEnable(!!JSON.parse(departmentIds).length > 0 || false);
    // setIsNeedLogin(+res.data.isNeedLogin === 1);
    // setOtherRuleType(lastOtherRule.ruleType);
    //     } else {
    //       message.error(res.res_msg);
    //     }
    //   }
    // );
  };

  const fetchDepartment = () => {
    // DepartmentListModel.execute(
    //   {
    //     corpId: corpid,
    //   },
    //   (res) => {
    //     if (+res.res_code === 0) {
    setDepartmentList(
      departmentMockData.data.departmentInfoList.filter(
        (dept) => dept.departmentName
      )
    );
    //     } else {
    //       setDepartmentList([]);
    //     }
    //   }
    // );
  };

  const fetchEmplyoee = () => {
    // EmployeeListModel.execute(
    //   {
    //     corpId: corpid,
    //   },
    //   (res) => {
    //     if (+res.res_code === 0) {
    setEmployeeList(getEmployeeInfoData.data);
    //     } else {
    //       setDepartmentList([]);
    //     }
    //   }
    // );
  };

  const fetchLogo = () => {
    // LogoListModel.execute({}, (res) => {
    //   if (+res.res_code === 0) {
    //     const list = Object.keys(res.data).map((key) => ({
    //       id: res.data[key],
    //       name: key,
    //     }));
    const list = Object.keys(logoMockData.data).map((key) => ({
      id: logoMockData.data[key],
      name: key,
    }));
    setLogoList(list || []);
    //   } else {
    //     setLogoList([]);
    //   }
    // });
  };

  const onValuesChange = (curVal, allVal) => {
    console.log("change---", curVal, allVal);
    form.setFieldsValue({
      ...allVal,
      inviteRules: isNeedLogin ? [...(allVal.inviteRules || [])] : [{}],
    });
  };

  const onFinish = (values) => {
    console.log("Success:", values);
    const ruleList = values.isNeedLogin
      ? values.inviteRules.map((e, i) => {
          return {
            tagId: e.system === "tag" ? e.tagId : "",
            ruleType: e.ruleType,
            ruleName: e.ruleType,
            inviteWords: e.ruleType,
            inviterList: Array.isArray(e.inviterList)
              ? e.inviterList.join(",")
              : e.inviterList,
            priorityLevel: i + 1,
            corpId: corpid,
            displayMessage:
              e.ruleType === "INTERCEPTOR"
                ? JSON.stringify(e.displayMessage)
                : "",
          };
        })
      : [];

    const otherRule = [
      {
        tagId: "",
        ruleType: values.otherRule.ruleType,
        ruleName: values.otherRule.ruleType,
        inviteWords: values.otherRule.ruleType,
        inviterList: Array.isArray(values.otherRule.inviterList)
          ? values.otherRule.inviterList.join(",")
          : values.otherRule.inviterList,
        priorityLevel: 9999,
        corpId: corpid,
        displayMessage: JSON.stringify(values.otherRule.displayMessage),
        addTags: form.getFieldValue("otherRule")?.selectedWeComTagIds,
        sendWelcomeMsg: form.getFieldValue("otherRule")?.sendWelcomeMsg,
      },
    ];
    const params = {
      codeName: values.codeName,
      departmentIds: values.remember ? values.departmentIds : [],
      isNeedLogin: values.isNeedLogin ? "1" : "0",
      inviteWelcomeMessage: JSON.stringify({
        logoAddress: values.logoAddress,
        managerDoc: values.managerDoc,
        introDoc: [
          values.introDoc1,
          values.introDoc2,
          values.introDoc3,
          values.introDoc4,
        ],
      }),
      codeConfiger: userInfo.userName,
      friendWords: values.friendWords,
      inviteRules: ruleList.concat(otherRule),
    };
    console.log(params);

    inviteChannelCode && pageType === "edit"
      ? handleUpdateCodeModel(params)
      : handleAddCodeModel(params);
  };

  const handleAddCodeModel = (params) => {
    AddCodeModel.execute(
      {
        inviteRuleReq: JSON.stringify(params),
      },
      (res) => {
        if (+res.res_code === 0) {
          handleModal(res.data);
        } else {
          message.error(res.res_msg);
        }
      }
    );
  };
  const handleUpdateCodeModel = (params) => {
    UpdateCodeModel.execute(
      {
        inviteRuleReq: JSON.stringify({
          id: detailData.id,
          ...params,
          inviteChannelCode,
        }),
      },
      (res) => {
        if (+res.res_code === 0) {
          handleModal(res.data);
        } else {
          message.error(res.res_msg);
        }
      }
    );
  };

  const handleModal = (inviteChannelCode) => {
    Modal.confirm({
      title: "",
      icon: null,
      content: `https://${corpid2Domain}/h5-wecom/wx/${
        corpid === CookieCorpId ? "general" : "invite"
      }?inviteChannelCode=${inviteChannelCode}&corpid=${corpid}`,
      onOk: () => {
        window.history.go(-1);
      },
    });
  };

  const FetchSubCenterList = () => {
    SubCenterList.execute(
      {
        corpId: corpid,
        parameterKey: "CimsSubCenters",
      },
      (res) => {
        if (+res.res_code === 0 && res.data) {
          const result = JSON.parse(res.data);
          setCenterConfigList(result || []);
        } else {
          setCenterConfigList([]);
        }
      }
    );
  };

  const handleWecomFormReady = (sendWelcomeMsg) => {
    // form.setFieldsValue({
    //   otherRule: {
    //     ...form.getFieldValue("otherRule"),
    //     ...sendWelcomeMsg,
    //   },
    // });
  };

  const handleLabelTagSelected = (selectedWeComTagIds) => {
    // form.setFieldsValue({
    //   otherRule: {
    //     ...form.getFieldValue("otherRule"),
    //     selectedWeComTagIds,
    //   },
    // });
  };

  return (
    <div className="page-code-config">
      <h2>
        加好友二维码活码配置（<span>*</span>为必填项）
      </h2>
      <Form
        className="config-form"
        name="config-form"
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 21 }}
        initialValues={{
          isNeedLogin: true,
          remember: true,
        }}
        onFinish={onFinish}
        onValuesChange={onValuesChange}
        autoComplete="off"
        form={form}
      >
        <Form.Item
          label="活码code"
          name="inviteChannelCode"
          rules={[{ required: true }]}
        >
          <Input disabled placeholder="请输入活码code" />
        </Form.Item>
        <Form.Item
          label="所属企微号"
          name="corpId"
          rules={[{ required: `${inviteChannelCode ? true : false}` }]}
        >
          <Input disabled placeholder="请输入所属企微号" />
        </Form.Item>
        <Form.Item
          name="isNeedLogin"
          valuePropName="checked"
          wrapperCol={{ span: 24 }}
        >
          <Checkbox
            onChange={(e) => {
              setIsNeedLogin(e.target.checked);
            }}
          >
            展示二维码之前需要用户登录（在展示二维码之前让用户登录可以进行身份识别，建议勾选。如果取消勾选，仅执行下方未命中以上情况兜底策略）
          </Checkbox>
        </Form.Item>
        <Form.Item
          name="remember"
          valuePropName="checked"
          wrapperCol={{ span: 24 }}
        >
          <Checkbox
            onChange={(e) => {
              setDepartmentEnable(e.target.checked);
            }}
          >
            如果用户打开链接时，已经添加过该企微号下方选择部门内的任一有效企微员工，则不经过下方配置的策略，直接展示已添加员工的二维码；若取消勾选，则无论用户是否加过企微好友，都先根据下方配置的策略进行判断。
          </Checkbox>
        </Form.Item>
        {departmentEnable && (
          <Form.Item
            label="部门范围(可多选)"
            name="departmentIds"
            rules={[{ required: true }]}
          >
            <Select mode="multiple" placeholder="请选择部门范围" allowClear>
              {departmentList &&
                departmentList.map((e) => (
                  <Option key={e.departmentId} value={e.departmentId}>
                    {e.departmentName}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        )}
        <Form.Item
          label="活码名称"
          name="codeName"
          rules={[{ required: true }]}
        >
          <Input placeholder="20个汉字以内" maxLength={20} />
        </Form.Item>
        <Form.Item
          label="二维码名片头部logo图片(宽高比3:2)"
          name="logoAddress"
          rules={[{ required: true }]}
        >
          <Select placeholder="请选择logo图片，若无请联系开发上传" allowClear>
            {logoList &&
              logoList.map((e) => (
                <Option key={e.id} value={e.id}>{`${e.name} ${e.id}`}</Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="二维码名片姓名下说明文案"
          name="managerDoc"
          rules={[{ required: true }]}
        >
          <Input placeholder="22个汉字以内" maxLength={22} />
        </Form.Item>
        <Form.Item
          label="左上6字亮点文案"
          name="introDoc1"
          rules={[{ required: true, message: "" }, { validator: validSixText }]}
        >
          <Input placeholder="6个汉字以内" maxLength={6} />
        </Form.Item>
        <Form.Item
          label="右上6字亮点文案"
          name="introDoc2"
          rules={[{ required: true, message: "" }, { validator: validSixText }]}
        >
          <Input placeholder="6个汉字以内" maxLength={6} />
        </Form.Item>
        <Form.Item
          label="左下6字亮点文案"
          name="introDoc3"
          rules={[{ required: true, message: "" }, { validator: validSixText }]}
        >
          <Input placeholder="6个汉字以内" maxLength={6} />
        </Form.Item>
        <Form.Item
          label="右下6字亮点文案"
          name="introDoc4"
          rules={[{ required: true, message: "" }, { validator: validSixText }]}
        >
          <Input placeholder="6个汉字以内" maxLength={6} />
        </Form.Item>
        <Form.Item
          label="已添加好友二维码下方展示文案"
          name="friendWords"
          rules={[{ required: true }]}
        >
          <Space align="baseline">
            <Form.Item name="friendWords">
              <Input placeholder="12个汉字以内" maxLength={12} />
            </Form.Item>
            <span>长按识别二维码立即沟通</span>
          </Space>
        </Form.Item>
        {isNeedLogin && (
          <>
            <Form.Item
              className="required"
              label="二维码展示规则配置（以下配置顺序即为优先级顺序）"
              labelCol={{ span: 24 }}
            ></Form.Item>
            <Form.Item
              shouldUpdate
              noStyle
              wrapperCol={{ span: 21, offset: 3 }}
            >
              <Form.List name="inviteRules" className="config-form-list">
                {(fields, { add, remove }) => {
                  return (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space
                          className="config-form-list-space"
                          key={key}
                          data-key={key}
                          direction="vertical"
                          size={0}
                        >
                          {/* Row 1: 操作按钮和主要表单项 */}
                          <div key={`first-row-${key}`} className="first-row">
                            <PlusCircleOutlined onClick={() => add()} />
                            <MinusCircleOutlined
                              onClick={() => {
                                if (
                                  form.getFieldValue(["inviteRules"]).length <=
                                  1
                                ) {
                                  message.error("至少保留一条配置");
                                  return;
                                }

                                debugger;
                                remove(name);
                              }}
                            />
                            <Form.Item
                              {...restField}
                              label="筛选用户"
                              name={[name, "system"]}
                              rules={[{ required: true }]}
                            >
                              <Select placeholder="请选择" allowClear>
                                {userSystemList &&
                                  userSystemList.map((e) => (
                                    <Option key={e.id} value={e.id}>
                                      {e.name}
                                    </Option>
                                  ))}
                              </Select>
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              label="ID(仅能输入一个)"
                              name={[name, "tagId"]}
                              rules={[
                                {
                                  min: 0,
                                  required:
                                    form.getFieldValue([
                                      "inviteRules",
                                      name,
                                      "system",
                                    ]) === "all"
                                      ? false
                                      : true,
                                  message: "标签无效,请检查后重新输入",
                                },
                              ]}
                            >
                              <Input
                                type="number"
                                disabled={
                                  form.getFieldValue([
                                    "inviteRules",
                                    name,
                                    "system",
                                  ]) === "all"
                                }
                                placeholder="仅能输入一个ID"
                              />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              label="选择二维码规则"
                              name={[name, "ruleType"]}
                              rules={[{ required: true }]}
                            >
                              <Select
                                placeholder="请选择二维码规则"
                                allowClear
                                onChange={(e) => {
                                  const rules =
                                    form.getFieldValue("inviteRules");
                                  const list = rules.map((e, i) => {
                                    if (+i === +name) {
                                      e.inviterList = undefined;
                                    }
                                    return e;
                                  });
                                  form.setFieldsValue({
                                    inviteRules: [...list],
                                  });
                                }}
                              >
                                {ruleTypeEnum.map((e) => (
                                  <Option key={e.id} value={e.id}>
                                    {e.name}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                            <Form.Item shouldUpdate noStyle>
                              {form.getFieldValue([
                                "inviteRules",
                                name,
                                "ruleType",
                              ]) !== "INTERCEPTOR" ? (
                                <Form.Item
                                  {...restField}
                                  label="具体规则"
                                  name={[name, "inviterList"]}
                                  rules={[
                                    {
                                      required:
                                        form.getFieldValue([
                                          "inviteRules",
                                          name,
                                          "ruleType",
                                        ]) === "EUBIND" &&
                                        !centerConfigList.length
                                          ? false
                                          : true,
                                    },
                                    {
                                      validator: (rule, value, cb) => {
                                        if (
                                          form.getFieldValue([
                                            "inviteRules",
                                            name,
                                            "ruleType",
                                          ]) === "MULTIPLE" &&
                                          (!value || value.length < 2)
                                        ) {
                                          cb("请选择两个及以上");
                                        }
                                        cb();
                                      },
                                    },
                                  ]}
                                >
                                  <Select
                                    showSearch
                                    placeholder="请选择"
                                    allowClear
                                    filterOption={(input, option) =>
                                      option.children
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                    }
                                    mode={
                                      form.getFieldValue([
                                        "inviteRules",
                                        name,
                                        "ruleType",
                                      ]) === "MULTIPLE"
                                        ? "multiple"
                                        : "single"
                                    }
                                    disabled={
                                      form.getFieldValue([
                                        "inviteRules",
                                        name,
                                        "ruleType",
                                      ]) === "EUBIND" &&
                                      !centerConfigList.length
                                    }
                                  >
                                    {form.getFieldValue([
                                      "inviteRules",
                                      name,
                                      "ruleType",
                                    ]) === "EUBIND"
                                      ? centerConfigList.map((e) => (
                                          <Option key={e.code} value={e.code}>
                                            {e.name}
                                          </Option>
                                        ))
                                      : employeeList &&
                                        employeeList.map((e) => (
                                          <Option
                                            key={e.userId}
                                            value={e.userId}
                                          >
                                            {e.userName}
                                          </Option>
                                        ))}
                                  </Select>
                                </Form.Item>
                              ) : (
                                <div className="modal-config">
                                  <Form.Item noStyle>
                                    <Form.Item
                                      {...restField}
                                      label="弹窗标题"
                                      name={[name, "displayMessage", "title"]}
                                      rules={[{ required: true }]}
                                    >
                                      <Input
                                        maxLength={10}
                                        placeholder="10个汉字以内"
                                      />
                                    </Form.Item>
                                    <Form.Item
                                      {...restField}
                                      label="弹窗内容"
                                      name={[name, "displayMessage", "content"]}
                                      rules={[{ required: true }]}
                                    >
                                      <Input
                                        maxLength={100}
                                        placeholder="100个汉字以内"
                                      />
                                    </Form.Item>
                                    <Form.Item
                                      {...restField}
                                      label="按钮文案"
                                      name={[name, "displayMessage", "button"]}
                                      rules={[{ required: true }]}
                                    >
                                      <Input
                                        maxLength={10}
                                        placeholder="10个汉字以内"
                                      />
                                    </Form.Item>
                                    <Form.Item
                                      {...restField}
                                      label="跳转链接"
                                      name={[name, "displayMessage", "url"]}
                                      rules={[
                                        {
                                          required: true,
                                          pattern: /^http[s]?:\/\/.*/,
                                          message: "请输入有效链接",
                                        },
                                      ]}
                                    >
                                      <Input placeholder="请确保微信环境内可访问" />
                                    </Form.Item>
                                  </Form.Item>
                                </div>
                              )}
                            </Form.Item>
                          </div>

                          {/* Row 2: 添加企微标签 */}
                          <Form.Item
                            key={`wecom-label-${key}`}
                            label="添加企微标签"
                            name={[name, "selectedWeComTagIds"]}
                            rules={[{ required: false }]}
                          >
                            <WeComLabel
                              corpId={corpid}
                              // TODO：新增则传入口，待传入接口下发的初始数据
                              // selectedTagIds={}
                              onLabelTagSelected={handleLabelTagSelected}
                            />
                          </Form.Item>

                          {/* Row 3: 添加欢迎语 */}
                          <Form.Item
                            key={`welcome-msg-${key}`}
                            label="添加欢迎语"
                            name={[name, "sendWelcomeMsg"]}
                          >
                            <WelcomeMsgForm
                              onFormReady={handleWecomFormReady}
                            />
                          </Form.Item>
                        </Space>
                      ))}
                    </>
                  );
                }}
              </Form.List>
            </Form.Item>
          </>
        )}
        <Form.Item
          className="required"
          style={{ marginTop: 20 }}
          label="未命中以上情况兜底策略"
        >
          <Space align="baseline" className="other-rules-space">
            <Form.Item
              noStyle
              label=""
              name={["otherRule", "ruleType"]}
              rules={[{ required: true }]}
            >
              <Select
                placeholder="请选择二维码规则"
                allowClear
                onChange={(e) => {
                  setOtherRuleType(e);
                  form.setFieldsValue({
                    otherRule: {
                      ...form.getFieldValue("otherRule"),
                      inviterList: [],
                    },
                  });
                }}
              >
                {ruleTypeEnum.map((e) => (
                  <Option
                    disabled={
                      !["SINGLE", "MULTIPLE", "INTERCEPTOR"].includes(e.id)
                    }
                    key={e.id}
                    value={e.id}
                  >
                    {e.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item noStyle shouldUpdate label="">
              {otherRuleType !== "INTERCEPTOR" ? (
                <Form.Item
                  name={["otherRule", "inviterList"]}
                  rules={[
                    { required: true, message: "" },
                    {
                      validator: (rule, value, cb) => {
                        if (!value) {
                          cb("请选择");
                        }
                        if (
                          otherRuleType === "MULTIPLE" &&
                          (!value || value.length < 2)
                        ) {
                          cb("请选择两个及以上");
                        }
                        cb();
                      },
                    },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder="请选择"
                    allowClear
                    mode={otherRuleType === "MULTIPLE" ? "multiple" : "single"}
                  >
                    {employeeList &&
                      employeeList.map((e) => (
                        <Option key={e.userId} value={e.userId}>
                          {e.userName}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              ) : (
                <div>
                  <Form.Item noStyle>
                    <Form.Item
                      label="弹窗标题"
                      name={["otherRule", "displayMessage", "title"]}
                      rules={[{ required: true }]}
                    >
                      <Input maxLength={10} placeholder="10个汉字以内" />
                    </Form.Item>
                    <Form.Item
                      label="弹窗内容"
                      name={["otherRule", "displayMessage", "content"]}
                      rules={[{ required: true }]}
                    >
                      <Input maxLength={100} placeholder="100个汉字以内" />
                    </Form.Item>
                    <Form.Item
                      label="按钮文案"
                      name={["otherRule", "displayMessage", "button"]}
                      rules={[{ required: true }]}
                    >
                      <Input maxLength={10} placeholder="10个汉字以内" />
                    </Form.Item>
                    <Form.Item
                      label="跳转链接"
                      name={["otherRule", "displayMessage", "url"]}
                      rules={[
                        {
                          required: true,
                          pattern: /^http[s]?:\/\/.*/,
                          message: "请输入有效链接",
                        },
                      ]}
                    >
                      <Input placeholder="请确保微信环境内可访问" />
                    </Form.Item>
                  </Form.Item>
                </div>
              )}
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item wrapperCol={{ span: 24 }}>
          <Button className="mr8" type="primary" htmlType="submit">
            {inviteChannelCode && pageType === "edit" ? "更新" : "生成"}{" "}
          </Button>
          <Button
            htmlType="button"
            onClick={() => {
              window.history.go(-1);
            }}
          >
            取消
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AntdForm;
