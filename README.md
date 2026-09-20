# JLPT-READ

手机上也能用的日语阅读器：点日文就能朗读。

## N2 语法朗读（首页）

按《TRY！新日语能力考试N2 语法必备》公开的 **14 课课次** 做成阅读页：

- 日文例文点一下朗读，再点一次停止
- 可隐藏中文、调节字号
- 底部切换「N2语法 / 长难句 / N3句型」
- 可添加到手机主屏幕（PWA）

仓库里没有 Windows 路径 `f:\何芳芳\japanese\N2-PLUS\TRY！新日语能力考试N2 语法必备.pdf`，所以没有整书扫描原文。句型和释义按该课次整理，例句为阅读练习重写。长难句来自已上传的 `content/pdfs/N2长难句补弱.pdf`。

## N3

`/n3` 仍是原来的 123 条 N3 语条练习。

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

## 数据

```bash
npm run catalog
```

会生成 `content/generated/n3-123.json` 与 `n2-try.json`。

## 技术

Next.js、TypeScript、Tailwind、浏览器 SpeechSynthesis（日语）。
