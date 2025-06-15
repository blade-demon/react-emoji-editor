import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Button,
  Drawer,
  Tag,
  Alert,
  Divider,
  Space,
  message,
} from "antd";
// import WecomTagListModel from "../../models/WecomTagListModel";
import getWecomTagListData from "../mock/get-wecom-tag-list.json";
import "./index.less";

const WeComLabel = ({ corpId, selectedTagIds, onLabelTagSelected }) => {
  const [open, setOpen] = useState(false);
  const [groupList, setGroupList] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]); // 用于保存选中的标签

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  const onConfirm = () => {
    setOpen(false);
    if (Array.isArray(selectedTags) && selectedTags.length > 0) {
      onLabelTagSelected(selectedTags?.map((item) => item.id)?.join(","));
    }
  };

  const resetTags = () => {
    setSelectedTags([]);
  };

  const handleTagClick = (tag) => {
    const isSelected = selectedTags.some((t) => t.id === tag.id);

    if (isSelected) {
      // 如果已选中，则移除
      setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      // 否则添加
      setSelectedTags([...selectedTags, tag]);
    }

    // console.log("selectedTags", selectedTags);
  };

  useEffect(() => {
    // WecomTagListModel.execute(
    //   {
    //     corpId,
    //   },
    //   (res) => {
    //     if (+res.res_code === 0) {
    //       if (!Array.isArray(res.data.groupList)) {
    //         // 标签数据为空
    //         // console.log("标签数据为空");
    //       } else {

    const res = getWecomTagListData;
    res.data.groupList.sort((a, b) => a.order - b.order);
    res.data.groupList.forEach((group) => {
      group.tagList.sort((a, b) => a.order - b.order);
    });
    setGroupList(res.data.groupList);
    //       }
    //     } else {
    //       message.error(res.res_msg);
    //     }
    //   }
    // );
  }, []);

  useEffect(() => {
    // 如果传入选中的标签Id，那么直接从数据中筛选出选中的标签
    if (Array.isArray(selectedTagIds?.split(","))) {
      const allTags = [];
      groupList.forEach((group) => {
        group.tagList.forEach((t) => {
          allTags.push(t);
        });
      });
      // console.log("allTags", allTags);
      const selectedTags = [];
      selectedTagIds?.split(",").forEach((tagId) => {
        allTags.forEach((t) => {
          if (t.id === tagId) {
            selectedTags.push(t);
          }
        });
      });
      // console.log("selectedTags", selectedTags);
      setSelectedTags(selectedTags);
    }
  }, [groupList, selectedTagIds]);

  return (
    <>
      <Row justify="space-between" align="middle">
        <Col span={20}>
          <div className="selected-tags">
            {Array.isArray(selectedTags) &&
              selectedTags.length > 0 &&
              selectedTags.map((tag) => {
                return (
                  <Tag
                    color="blue"
                    key={tag.id}
                    style={{ marginBottom: "10px" }}
                  >
                    {tag.name}
                  </Tag>
                );
              })}
          </div>
        </Col>
        <Col span={4} style={{ textAlign: "right" }}>
          <Button type="secondary" onClick={showDrawer}>
            编辑
          </Button>
        </Col>
      </Row>
      <Drawer
        title="添加企微标签"
        closable={{ "aria-label": "Close Button" }}
        onClose={onClose}
        open={open}
        width={400}
      >
        <Alert
          message="没有想要的标签？请通知企微管理员SUNJIEYUN848至企微后台添加标签"
          type="info"
        />

        {Array.isArray(groupList) &&
          groupList.map((group) => (
            <Row key={group.id} align="middle" justify="start">
              <Divider orientation="left">{group.name}</Divider>
              {group.tagList.map((tag) => (
                <Tag
                  className="code-tag"
                  CheckableTag
                  key={tag.id}
                  color={
                    selectedTags.some((t) => t.id === tag.id) ? "blue" : ""
                  }
                  onClick={() => handleTagClick(tag)}
                >
                  {tag.name}
                </Tag>
              ))}
            </Row>
          ))}

        <Space style={{ marginTop: "20px" }}>
          <Button
            type="default"
            autoInsertSpace={false}
            onClick={() => {
              resetTags();
              onClose();
            }}
          >
            取消
          </Button>
          <Button type="default" autoInsertSpace onClick={resetTags}>
            重置
          </Button>
          <Button type="primary" autoInsertSpace onClick={onConfirm}>
            确定
          </Button>
        </Space>
      </Drawer>
    </>
  );
};
export default WeComLabel;
