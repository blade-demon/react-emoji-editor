import React from "react";
import { Form, Select, Input, Space } from "antd";
import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";

const AntdForm = () => {
  return (
    <div>
      <Form.Item shouldUpdate noStyle wrapperCol={{ span: 21, offset: 3 }}>
        <Form.List name="inviteRules" className="config-form-list">
          {(fields, { add, remove }) => {
            return (
              <>
                {fields.map((field) => (
                  <div>
                    <Space
                      className="config-form-list-space"
                      key={field.key}
                      align="baseline"
                    >
                      <PlusCircleOutlined onClick={() => add()} />
                      <MinusCircleOutlined
                        onClick={() => {
                          if (form.getFieldValue(["inviteRules"]).length <= 1) {
                            message.error("至少保留一条配置");
                            return;
                          }
                          remove(field.name);
                        }}
                      />
                      <Form.Item
                        {...field}
                        label="筛选用户"
                        name={[field.name, "system"]}
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
                        {...field}
                        label="ID(仅能输入一个)"
                        name={[field.name, "tagId"]}
                        rules={[
                          {
                            min: 0,
                            required:
                              form.getFieldValue([
                                "inviteRules",
                                field.name,
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
                              field.name,
                              "system",
                            ]) === "all"
                          }
                          placeholder="仅能输入一个ID"
                        />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        label="选择二维码规则"
                        name={[field.name, "ruleType"]}
                        rules={[{ required: true }]}
                      >
                        <Select
                          placeholder="请选择二维码规则"
                          allowClear
                          onChange={(e) => {
                            const rules = form.getFieldValue("inviteRules");
                            const list = rules.map((e, i) => {
                              if (+i === +field.name) {
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
                          field.name,
                          "ruleType",
                        ]) !== "INTERCEPTOR" ? (
                          <Form.Item
                            {...field}
                            label="具体规则"
                            name={[field.name, "inviterList"]}
                            rules={[
                              {
                                required:
                                  form.getFieldValue([
                                    "inviteRules",
                                    field.name,
                                    "ruleType",
                                  ]) === "EUBIND" && !centerConfigList.length
                                    ? false
                                    : true,
                              },
                              {
                                validator: (rule, value, cb) => {
                                  if (
                                    form.getFieldValue([
                                      "inviteRules",
                                      field.name,
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
                                  field.name,
                                  "ruleType",
                                ]) === "MULTIPLE"
                                  ? "multiple"
                                  : "single"
                              }
                              disabled={
                                form.getFieldValue([
                                  "inviteRules",
                                  field.name,
                                  "ruleType",
                                ]) === "EUBIND" && !centerConfigList.length
                              }
                            >
                              {form.getFieldValue([
                                "inviteRules",
                                field.name,
                                "ruleType",
                              ]) === "EUBIND"
                                ? centerConfigList.map((e) => (
                                    <Option key={e.code} value={e.code}>
                                      {e.name}
                                    </Option>
                                  ))
                                : employeeList &&
                                  employeeList.map((e) => (
                                    <Option key={e.userId} value={e.userId}>
                                      {e.userName}
                                    </Option>
                                  ))}
                            </Select>
                          </Form.Item>
                        ) : (
                          <div className="modal-config">
                            <Form.Item noStyle>
                              <Form.Item
                                {...field}
                                label="弹窗标题"
                                name={[field.name, "displayMessage", "title"]}
                                rules={[{ required: true }]}
                              >
                                <Input
                                  maxLength={10}
                                  placeholder="10个汉字以内"
                                />
                              </Form.Item>
                              <Form.Item
                                {...field}
                                label="弹窗内容"
                                name={[field.name, "displayMessage", "content"]}
                                rules={[{ required: true }]}
                              >
                                <Input
                                  maxLength={100}
                                  placeholder="100个汉字以内"
                                />
                              </Form.Item>
                              <Form.Item
                                {...field}
                                label="按钮文案"
                                name={[field.name, "displayMessage", "button"]}
                                rules={[{ required: true }]}
                              >
                                <Input
                                  maxLength={10}
                                  placeholder="10个汉字以内"
                                />
                              </Form.Item>
                              <Form.Item
                                {...field}
                                label="跳转链接"
                                name={[field.name, "displayMessage", "url"]}
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

                      <div>
                        {/* Row 2: WeCom Tags */}
                        <Form.Item
                          {...field}
                          label="添加企微标签"
                          name={["otherRule", "selectedWeComTagIds"]}
                          rules={[{ required: false }]}
                        >
                          <WeComLabel
                            corpId={corpid}
                            // TODO：新增则传入口，待传入接口下发的初始数据
                            // selectedTagIds={}
                            onLabelTagSelected={handleLabelTagSelected}
                          />
                        </Form.Item>

                        {/* Row 3: Welcome Message */}
                        <Form.Item
                          {...field}
                          label="添加欢迎语"
                          name={["otherRule", "sendWelcomeMsg"]}
                        >
                          <WelcomeMsgForm onFormReady={handleWecomFormReady} />
                        </Form.Item>
                      </div>
                    </Space>
                  </div>
                ))}
              </>
            );
          }}
        </Form.List>
      </Form.Item>
    </div>
  );
};

export default AntdForm;
