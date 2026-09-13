# JLPT-READ

N3 句型阅读练习。内容来自 [jp-grammar-n3](https://github.com/fangfang0930/jp-grammar-n3) 与《N3句型语法123条（极速版语条）》PDF。

## 能做什么

- 读 PDF 抽出的短篇（文字层 PDF 会自动入库）
- 浏览全部 123 条 N3 语条，先看日文例句再揭开译文
- 按顺序做例句练习，并朗读日文
- 本地记下已读进度（浏览器 localStorage）

原 PDF 是扫描件，没有文字层。123 条已按表格录入；带文字层的 PDF 放到 `content/pdfs/` 后刷新即可出现在「阅读篇章」。

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开 [http://127.0.0.1:4317](http://127.0.0.1:4317)。

生产模式：

```bash
npm run build
npm start
```

## 放入自己的 PDF

1. 把 `.pdf` 文件丢进 `content/pdfs/`（或把目录设到环境变量 `CONTENT_PDF_DIR`）。
2. 需要**可选中复制的文字层**，并使用 UTF-8／标准日文字体。扫描件无法直接抽字。
3. 重启或刷新开发服务器。首页「阅读篇章」会列出每一页正文。

仓库里已有：

- `content/pdfs/sample-n3-reading.pdf`：可抽取的日语短篇样例
- `content/pdfs/n3-123-yutiao.pdf`：用户上传的 123 条原件（扫描版）
- `content/generated/grammar-data.json` 与 `data.js`：完整 `GRAMMAR_DATA`（123 条）

## 技术

Next.js、TypeScript、Tailwind、shadcn/ui。PDF 文字层用 [unpdf](https://github.com/unjs/unpdf) / pdf.js。
