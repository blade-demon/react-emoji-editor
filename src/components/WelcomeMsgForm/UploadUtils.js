import { message } from "antd";

// 默认配置限制条件
const MAX_SIZE = 512 * 1024; // 512KB
const MAX_LONG_SIDE = 1440; // 长边最大值
const MAX_SHORT_SIDE = 1080; // 短边最大值
const SUPPORTED_FORMATS = ["image/jpeg", "image/jpg", "image/png"]; // 支持的 MIME 类型

/**
 * 检查上传图片的属性是否符合规范
 *
 * 此函数通过检查文件类型、大小和尺寸来验证上传的图片是否符合指定的格式和大小限制
 * 它使用Promise来处理异步操作，并在验证失败时提供用户友好的错误消息
 *
 * @param {File} file - 用户上传的文件对象
 * @param {Array} formats - 支持的图片格式，默认为["image/jpeg", "image/png"]
 * @param {Number} maxSize - 最大文件大小，默认为512*1024（即512KB）
 * @param {Number} maxLongSize - 图片最大长边尺寸，默认为1440
 * @param {Number} maxShortSize - 图片最大短边尺寸，默认为1080
 * @returns {Promise} - 返回一个Promise对象，用于处理验证结果
 */
const checkUploadImageProps = (
  file,
  formats = SUPPORTED_FORMATS,
  maxSize = MAX_SIZE,
  maxLongSize = MAX_LONG_SIDE,
  maxShortSize = MAX_SHORT_SIDE
) => {
  return new Promise((resolve, reject) => {
    // 1. 检查文件类型
    const isValidFormat =
      formats.includes(file.type) || /\.(jpe?g|png)$/i.test(file.name);
    if (!isValidFormat) {
      message.warning("仅支持 JPG/PNG 格式");
      reject(false);
      return;
    }

    // 2. 检查文件大小
    if (file.size > maxSize) {
      message.warning(`图片大小需小于 ${maxSize / 1024}KB`);
      reject(false);
      return;
    }

    // 3. 检查图片尺寸（长边 ≤1440px，短边 ≤1080px）
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = new Image();
      image.onload = () => {
        const { naturalWidth: width, naturalHeight: height } = image;
        const [longSide, shortSide] =
          width >= height ? [width, height] : [height, width];

        if (longSide > maxLongSize || shortSide > maxShortSize) {
          message.warning(`尺寸需小于 ${maxLongSize}x${maxShortSize} 像素`);
          reject(false);
        } else {
          resolve(true); // 校验通过
        }
        URL.revokeObjectURL(image.src); // 释放内存
      };
      image.onerror = () => {
        message.error("无法读取图片尺寸");
        reject(false);
      };
      image.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * 检查上传文件的属性是否符合规范
 *
 * 单个文件不超过5M，仅支持.pdf格式
 * 它使用Promise来处理异步操作，并在验证失败时提供用户友好的错误消息
 *
 * @param {File} file - 用户上传的文件对象
 * @param {Array} formats - 支持的文件格式，默认为[".pdf"]
 * @param {Number} maxSize - 允许的最大文件大小，默认为512*1024（即512KB
 */
const checkUploadFileProps = (file, formats) => {
  return new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) {
      message.warning("文件大小不能超过5M");
      reject(false);
      return;
    }

    if (!formats.includes(file.type)) {
      message.warning("仅支持.pdf格式");
      reject(false);
      return;
    }

    resolve(true);
  });
};

/**
 * 异步函数用于预览图片
 * 此函数通过接收一个文件对象，来读取图片数据并打开一个新的窗口显示图片
 * @param {Object} file - 包含图片信息的文件对象
 */
const imagePreview = async (file) => {
  let src = file.url;
  if (!src) {
    src = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file.originFileObj);
      reader.onload = () => resolve(reader.result);
    });
  }
  const image = new Image();
  image.src = src;
  const imgWindow = window.open(src);
  imgWindow?.document.write(image.outerHTML);
};

/**
 * 自定义上传组件的每个文件项的渲染函数
 *
 * @param {React.ReactNode} originNode - 原始节点，用于显示文件信息
 * @param {object} file - 当前文件对象，包含文件的详细信息
 * @param {Array} fileList - 文件列表，包含所有上传的文件信息
 * @param {object} actions - 操作对象，包含重新上传等方法
 * @returns {React.ReactNode} - 返回自定义的文件项节点
 */
const uploadItemRender = (originNode, file, fileList, actions) => {
  const isFailed = file.status === "error";

  return (
    <div
      style={{
        border: isFailed ? "1px solid red" : "1px solid #e8e8e8",
        padding: "8px",
        marginBottom: "8px",
        borderRadius: "4px",
      }}
    >
      {originNode}
      {isFailed && (
        <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
          {file.error || "上传失败"}
        </div>
      )}
      {isFailed && (
        <button
          onClick={() => {
            // 重新上传逻辑
            actions.reupload(file);
          }}
          style={{ marginLeft: "8px", fontSize: "12px" }}
        >
          重试
        </button>
      )}
    </div>
  );
};

// 提取错误处理为单独函数以提高代码复用性和可维护性
const handleUploadError = (error, file) => {
  if (error.response) {
    if (error.response.status === 400) {
      message.error(`参数错误：${error.response.data.message}`);
    } else if (error.response.status >= 500) {
      message.error("系统错误：上传失败！");
    } else {
      message.error("上传失败，请重试！");
    }
  } else {
    message.error("上传失败！");
  }
  throw error;
};

export {
  checkUploadImageProps,
  checkUploadFileProps,
  imagePreview,
  uploadItemRender,
  handleUploadError,
};
