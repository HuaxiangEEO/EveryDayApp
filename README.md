# EveryDayApp

每日编程实践项目集合 - 使用AI辅助开发的各种有趣项目

## 项目结构

本项目采用monorepo结构，包含多个独立的子项目：

```
EveryDayApp/
├── projects/
│   ├── interview-questions/  # 操作系统面试题库
│   ├── chinese-chess/        # 中国象棋对战游戏
│   ├── cloud-storage/        # PC端网盘文件管理
│   └── draw-guess/           # 你画我猜游戏
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

### 3. PC端网盘文件管理 📁

**位置**: `projects/cloud-storage/`

基于 Flutter 开发的桌面端网盘文件管理应用，支持本地/云端文件浏览、上传、下载、新建文件夹等操作。

**功能特性**:
- 📂 本地与云端文件浏览
- ⬆️ 文件上传、下载
- 📁 新建文件夹
- 🪟 Windows 桌面应用（window_manager）
- 🎨 Material 3 深色主题

**快速开始**:
```bash
cd projects/cloud-storage
flutter pub get
flutter run -d windows
```

### 4. 你画我猜游戏 🎨

**位置**: `projects/draw-guess/`

基于 React + TypeScript + Vite 开发的你画我猜小游戏，支持画画、猜词、多轮得分。

**功能特性**:
- 🎨 画布绘制（鼠标/触控）
- 📝 随机题目（动物、物品、食物、动作、人物、自然、建筑等分类）
- ✅ 猜词判定（模糊匹配）
- 🏆 多轮计分
- 📱 响应式布局

**快速开始**:
```bash
cd projects/draw-guess
npm install
npm run dev
```

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

# 运行网盘文件管理（需先 cd projects/cloud-storage && flutter pub get）
npm run dev:cloud

# 运行你画我猜
npm run dev:draw
```

### 构建特定子项目

```bash
# 构建面试题库
npm run build:interview

# 构建象棋游戏
npm run build:chess

# 构建网盘文件管理（Windows）
npm run build:cloud

# 构建你画我猜
npm run build:draw
```

## 技术栈

- **Web 项目**（interview-questions、chinese-chess、draw-guess）: React 18、TypeScript、Vite、CSS3
- **桌面项目**（cloud-storage）: Flutter、Dart、Material 3

## 项目规划

查看 `ideas.md` 了解项目想法和开发计划。

## 开发规范

1. 每个子项目独立运行，互不干扰
2. 共享的配置和工具放在根目录
3. 子项目使用独立的 package.json/pubspec.yaml 和构建配置
4. Web 项目统一 React + TypeScript，桌面项目使用 Flutter


## 贡献

欢迎提交Issue和Pull Request！
