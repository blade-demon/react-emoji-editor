const nodePath = require("path");
const fs = require("fs");

module.exports = function (babel) {
  const { types: t } = babel;

  return {
    name: "auto-css-import",
    visitor: {
      Program(path, state) {
        const filename = state.filename;
        if (
          !filename ||
          (!filename.endsWith(".jsx") && !filename.endsWith(".js"))
        ) {
          return;
        }

        // 获取组件文件的目录和基础名称
        const dir = nodePath.dirname(filename);
        const baseName = nodePath.basename(
          filename,
          nodePath.extname(filename)
        );

        // 查找对应的 CSS 文件
        const cssFile = nodePath.join(dir, `${baseName}.css`);

        if (fs.existsSync(cssFile)) {
          // 检查是否已经导入了该 CSS 文件
          let hasImport = false;
          path.traverse({
            ImportDeclaration(importPath) {
              const source = importPath.node.source.value;
              if (
                source.endsWith(`${baseName}.css`) ||
                source === `./${baseName}.css`
              ) {
                hasImport = true;
              }
            },
          });

          // 如果没有导入，则添加导入语句
          if (!hasImport) {
            const importDeclaration = t.importDeclaration(
              [],
              t.stringLiteral(`./${baseName}.css`)
            );

            // 在第一个非导入语句前插入 CSS 导入
            let insertIndex = 0;
            for (let i = 0; i < path.node.body.length; i++) {
              if (!t.isImportDeclaration(path.node.body[i])) {
                insertIndex = i;
                break;
              }
              insertIndex = i + 1;
            }

            path.node.body.splice(insertIndex, 0, importDeclaration);
          }
        }
      },
    },
  };
};
