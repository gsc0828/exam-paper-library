# 期末试卷库（Exam Paper Library）

面向本校大学生的历年期末试卷查询系统。学生可按学院 / 学科 / 课程浏览历史试卷，按课程名、课程代码、教师、学年学期检索，在线预览与下载试卷，并在课程详情页查看该课程的全部历史试卷与高频考点分布。

## 功能列表

| 编号 | 功能 | 说明 |
|---|---|---|
| FR-01 | 试卷库浏览 | 按学院 → 学科 → 课程三级导航浏览历年试卷 |
| FR-02 | 多条件搜索 | 支持课程名称、课程代码、授课教师、学年学期组合检索 |
| FR-03 | 试卷在线预览 | 试卷详情页展示题目结构、分值分布与页数 |
| FR-04 | 试卷下载 | 支持按试卷下载，记录下载量 |
| FR-05 | 课程详情页 | 汇总该课程历年试卷、难度分布、教师列表 |
| FR-06 | 首页推荐 | 依据浏览量与下载量推荐热门试卷与热门课程 |
| FR-07 | 学院学科树 | 学院、学科、课程的层级数据展示 |
| FR-08 | 数据统计 | 试卷浏览量、下载量等展示字段 |

## 技术栈

- 前端：React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui + React Router + TanStack Query
- 后端：NestJS 10 + TypeScript + Drizzle ORM + PostgreSQL
- 校验：class-validator / class-transformer
- 图标：Lucide React

## 目录结构

```
exam-paper-library/
├── server/                 # NestJS 后端
│   ├── main.ts             # 服务入口
│   ├── app.module.ts       # 根模块
│   ├── database/schema.ts  # Drizzle 数据库结构
│   └── modules/
│       ├── college/        # 学院 / 学科接口
│       ├── course/         # 课程接口
│       └── exam-paper/     # 试卷接口
├── client/                 # React 前端
│   └── src/
│       ├── pages/          # 首页、试卷库、搜索、课程详情、试卷详情
│       ├── components/     # 卡片、布局、难度标签、UI 组件
│       └── api/            # 后端接口请求层
├── shared/api.interface.ts # 前后端共享类型
├── scripts/                # 开发与构建脚本
└── AGENTS.md               # 项目设计规范
```

## 运行方式

前置要求：Node.js >= 22、PostgreSQL。

```bash
npm install
npm run dev        # 前后端同时启动，前端默认 5173 端口
```

生产构建：

```bash
npm run build
```

## 示例数据

数据库预置：6 个学院、10 个学科、11 门课程、14 份试卷（覆盖 2021-2024 学年，含 easy / medium / hard 三档难度）。

## 说明

本项目由 AI 辅助生成（豆包应用构建），数据库表结构见 `server/database/schema.ts`。若要脱离托管平台在本地运行，需按该 schema 在本机 PostgreSQL 建表并导入示例数据。
