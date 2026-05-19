# 斗地主 · 单机对战 🃏

基于 React + TypeScript + Vite 开发的标准三人斗地主，玩家 vs 2 个 AI。
完整实现牌型识别、叫分、出牌、压制、结算与春天/反春倍数。

## 功能特性（v1.2）

- 🃏 完整 54 张牌（含大小王）
- 🎯 标准叫分制（1/2/3 分），起始叫分位置随机
- 🧠 完整牌型识别：单/对/三、三带一/二、顺子、连对、飞机（纯/带单/带对）、四带二、炸弹、王炸
- 🤖 AI 三档难度（简单 / 普通 / 困难），困难 AI 启用「前瞻一步」模拟评估
- 🔥 完整结算：底分 × 炸弹翻倍 × 春天/反春翻倍
- 📝 实时记牌器（各点数剩余张数 + 已用尽点数标记）
- 💾 自动保存最近 50 局到本地存储 + 复盘（前进/后退/跳转/进度条）
- 📊 统计面板（胜率、地主胜率、农民胜率、炸弹/王炸/春天次数）
- 🎮 残局训练：预设残局 + 自定义残局编辑器（点击牌循环归属，保存到本地）
- 🎨 三种主题：经典绿桌 / 暗夜 / 红木
- 💡 智能提示：用困难 AI 推荐最优出牌，重复点击循环候选
- ✨ 出牌动画 + Web Audio 合成音效（出牌 / 不要 / 炸弹 / 王炸 / 胜负）
- 🎵 音效开关（设置中关闭）
- 出牌校验、提示出牌、不要按钮、响应式布局

## 技术栈

- React 18 + TypeScript
- Vite 5
- CSS Modules（无运行时样式依赖）
- 状态管理：`useReducer` + `Context`

## 快速开始

```bash
cd projects/dou-di-zhu
npm install
npm run dev
```

构建生产包：

```bash
npm run build
npm run preview
```

## 目录结构

```
src/
├── App.tsx / main.tsx / vite-env.d.ts
├── types/index.ts             # 核心数据类型
├── core/                      # 纯函数游戏内核
│   ├── deck.ts                # 建牌、洗牌、发牌
│   ├── cardType.ts            # 牌型识别
│   ├── compare.ts             # 同型比较 + 炸弹压制
│   ├── enumerate.ts           # 出法枚举
│   ├── score.ts               # 倍数 + 春天 + 结算
│   ├── simulate.ts            # 轻量前瞻模拟（hard AI 评估）
│   ├── endgames.ts            # 残局训练预设
│   └── ai/{easy,normal,hard,index}.ts
├── state/
│   ├── gameReducer.ts         # 状态机（dealing→bidding→playing→settled）
│   ├── GameContext.tsx
│   └── SettingsContext.tsx    # 难度/主题（持久化）
├── hooks/useAITurn.ts         # AI 自动驱动
├── utils/
│   ├── format.ts              # 牌面 → 文本
│   ├── replay.ts              # 复盘帧重放
│   ├── sound.ts               # Web Audio 合成音效
│   └── storage.ts             # 多局存储 + 统计 + 自定义残局
├── components/
│   ├── Table.tsx              # 牌桌容器（顶部按钮 / 弹窗调度）
│   ├── Hand.tsx               # 手牌区
│   ├── CardView.tsx           # 单张牌
│   ├── PlayerSeat.tsx         # 三个座位
│   ├── PlayedArea.tsx         # 中央出牌区
│   ├── BidPanel.tsx           # 叫分面板
│   ├── ActionBar.tsx          # 出牌/不要/提示
│   ├── ScorePanel.tsx         # 结算弹窗
│   ├── RecordPanel.tsx        # 记牌器
│   ├── Modal.tsx              # 通用弹窗
│   ├── SettingsView.tsx       # 难度/主题/音效/残局
│   ├── EndgameEditor.tsx      # 自定义残局编辑器
│   ├── StatsView.tsx          # 统计
│   ├── SavedGamesList.tsx     # 多局列表
│   └── ReplayView.tsx         # 复盘视图
└── styles/global.css          # 全局变量 + 主题切换
```

## 玩法说明

### 叫分

- 系统随机选一家先叫分
- 每家依次只叫一次：可选择 `不叫 / 1 / 2 / 3`，新叫的必须 > 当前最高分
- 第一个叫到 3 分立即定地主；否则三家叫完取最高分者
- 三家全 0 → 流局重发

### 牌型与比较

| 牌型 | 形式 | 说明 |
|------|------|------|
| 单 | 任一张 | 大小：3<4<...<A<2<小王<大王 |
| 对 | 同点 2 张 | 不含王 |
| 三张 | 同点 3 张 | / |
| 三带一 / 三带二 | 3 + 1 / 3 + 2 | 带牌任意非主点 |
| 顺子 | 连续 ≥5 张 | 不含 2/王 |
| 连对 | 连续 ≥3 对 | 不含 2/王 |
| 飞机 | 连续 ≥2 个三张 | 可纯飞机 / 带相同数量单 / 带相同数量对 |
| 四带二 | 4 + 2 单 / 4 + 2 对 | / |
| 炸弹 | 同点 4 张 | 压制非炸弹任意牌型 |
| 王炸 | 大王 + 小王 | 压制一切 |

### 倍数

- 起始倍数 = 1 × 底分
- 每个炸弹 ×2，王炸 ×2
- 春天（农民未出过任何牌且地主胜）×2
- 反春（地主只出过一手且农民胜）×2

## 后续规划（v1.3+）

- 真正的多深度蒙特卡洛搜索（含对手手牌不确定时的 ISMCTS）
- 出牌时可视化卡牌从手牌位置飞入桌面（FLIP 动画）
- 联机对战 / 房间号 / WebSocket 服务
- 战绩同步至云端 + 跨设备复盘
- 移动端长按选牌、滑动出牌手势优化

## 开发笔记

- 整套游戏内核（`core/`）与 React 解耦，全部为纯函数，便于编写单元测试
- 困难 AI = 启发式评估（出净最少手数 + 角色协作）+「前瞻一步」模拟评估，对每个候选执行后让对手用最小可压制响应一轮，再评估剩余手数
- 智能提示直接调用 `rankCandidates`（hard AI 内部排序函数），重复点击会循环 Top 8 推荐
- 自定义残局保存到 `localStorage` 的 `dou-di-zhu:custom-endgames` 键（最多 30 个）
- 音效完全使用 Web Audio `OscillatorNode + GainNode` 合成，零外部音频资源
- 状态机保证非法动作不会改变状态，避免任何"卡死"情况
