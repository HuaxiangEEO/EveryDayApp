# EveryDayApp

每日编程实践项目集合 - 使用AI辅助开发的各种有趣项目

## 项目结构

本项目采用monorepo结构，包含多个独立的子项目：

```
EveryDayApp/
├── projects/
│   ├── interview-questions/  # 操作系统面试题库
│   └── chinese-chess/        # 中国象棋对战游戏
├── package.json              # 根目录配置
└── README.md                # 项目说明
```

## 子项目列表

### 1. 操作系统面试题库 📚

**位置**: `projects/interview-questions/`

软件工程专业校招面试题库网站，主要围绕计算机操作系统知识展开。

**功能特性**:
- 📚 12道精选操作系统面试题
- 🔍 支持分类、难度、关键词筛选
- 💡 详细的题目答案和解析
- ⭐ 错题收藏功能
- 🎨 现代化的UI设计
- 📱 响应式布局，支持移动端

**快速开始**:
```bash
cd projects/interview-questions
npm install
npm run dev
```

**详细文档**: 查看 [README.md](projects/interview-questions/README.md)

### 2. 中国象棋对战游戏 🎮

**位置**: `projects/chinese-chess/`

基于React + TypeScript开发的中国象棋人机对战游戏，支持完整的复盘功能和多棋局管理。

**功能特性**:
- 🎮 完整的象棋规则实现（所有棋子走法、特殊规则）
- 🤖 人机对战模式（AI使用Minimax算法）
- 💾 多棋局保存和管理（按时间戳命名，最多50个）
- 📖 完整复盘功能（前进、后退、跳转）
- 🎨 美观的棋盘和棋子UI（最近一步高亮显示）
- 📱 响应式设计，支持移动端

**快速开始**:
```bash
cd projects/chinese-chess
npm install
npm run dev
```

**详细文档**: 查看 [README.md](projects/chinese-chess/README.md)

## 快速开始

### 安装所有子项目依赖

```bash
npm run install:all
```

### 运行特定子项目

```bash
# 运行面试题库
npm run dev:interview

# 运行象棋游戏
npm run dev:chess
```

### 构建特定子项目

```bash
# 构建面试题库
npm run build:interview

# 构建象棋游戏
npm run build:chess
```

## 技术栈

所有子项目统一使用：
- React 18
- TypeScript
- Vite
- CSS3

## 项目规划

查看 `ideas.md` 了解项目想法和开发计划。

## 开发规范

1. 每个子项目独立运行，互不干扰
2. 共享的配置和工具放在根目录
3. 子项目使用独立的package.json和构建配置
4. 代码风格保持一致（TypeScript + React）


## 贡献

欢迎提交Issue和Pull Request！
