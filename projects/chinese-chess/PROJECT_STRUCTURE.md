# 项目结构说明

## 目录结构

```
projects/chinese-chess/
├── src/                          # 源代码目录
│   ├── components/               # UI组件
│   │   ├── ChessBoard.tsx       # 棋盘组件（9x10网格）
│   │   ├── ChessBoard.css       # 棋盘样式
│   │   ├── ChessPiece.tsx       # 棋子组件
│   │   ├── ChessPiece.css       # 棋子样式
│   │   ├── ReplayControls.tsx   # 复盘控制面板组件
│   │   ├── ReplayControls.css   # 复盘控制面板样式
│   │   ├── SavedGamesList.tsx   # 已保存棋局列表组件
│   │   └── SavedGamesList.css   # 列表样式
│   ├── hooks/                    # React Hooks
│   │   ├── useGameState.ts      # 游戏状态管理Hook
│   │   └── useReplay.ts         # 复盘状态管理Hook
│   ├── types/                    # TypeScript类型定义
│   │   └── chess.ts             # 象棋相关类型（Piece, Position, GameState等）
│   ├── utils/                    # 工具函数
│   │   ├── ai.ts                # AI算法（Minimax, Alpha-Beta剪枝）
│   │   ├── gameLogic.ts         # 游戏逻辑（将死检测、将军检测）
│   │   ├── gameStorage.ts       # 棋局保存/加载（localStorage）
│   │   ├── moveRules.ts         # 走棋规则（各棋子的走法）
│   │   └── debugChess.ts        # 调试工具（可选）
│   ├── App.tsx                  # 主应用组件
│   ├── App.css                  # 主应用样式
│   ├── main.tsx                 # 应用入口
│   └── index.css                # 全局样式
├── public/                       # 静态资源
│   └── vite.svg                 # Vite图标
├── DESIGN_REPLAY.md             # 复盘功能设计文档
├── README.md                    # 项目说明文档
├── PROJECT_STRUCTURE.md         # 项目结构说明（本文件）
├── package.json                 # 项目配置和依赖
├── tsconfig.json                # TypeScript配置
├── tsconfig.node.json           # Node环境TypeScript配置
├── vite.config.ts               # Vite构建配置
└── index.html                   # HTML入口文件
```

## 核心文件说明

### 组件层（components/）

#### ChessBoard.tsx
- **功能**：渲染9x10的中国象棋棋盘
- **特性**：
  - 网格线绘制
  - 九宫格斜线
  - 楚河汉界标识
  - 支持点击交互
  - 显示有效移动位置

#### ChessPiece.tsx
- **功能**：渲染单个棋子
- **特性**：
  - 响应式定位
  - 选中状态显示
  - 高亮显示（复盘/最近一步）
  - 点击交互

#### ReplayControls.tsx
- **功能**：复盘控制面板
- **特性**：
  - 前进/后退控制
  - 跳转到第一步/最后一步
  - 显示当前步数和走棋信息

#### SavedGamesList.tsx
- **功能**：已保存棋局列表
- **特性**：
  - 显示所有保存的棋局
  - 加载/删除操作
  - 根据游戏状态显示不同操作按钮

### Hooks层（hooks/）

#### useGameState.ts
- **功能**：管理整个游戏状态
- **职责**：
  - 棋盘状态管理
  - 走棋逻辑处理
  - AI自动走棋
  - 走棋记录
  - 保存/加载棋局

#### useReplay.ts
- **功能**：管理复盘状态
- **职责**：
  - 复盘模式切换
  - 根据步数计算棋盘状态
  - 复盘控制（前进/后退/跳转）

### 类型定义（types/）

#### chess.ts
- **类型**：
  - `PieceColor`: 棋子颜色（'red' | 'black'）
  - `PieceType`: 棋子类型
  - `Piece`: 棋子信息
  - `Position`: 棋盘位置
  - `BoardState`: 棋盘状态（Map）
  - `GameState`: 游戏状态
  - `MoveRecord`: 走棋记录
- **常量**：
  - `INITIAL_BOARD_LAYOUT`: 初始棋盘布局
- **工具函数**：
  - `positionToKey`: 位置转字符串键
  - `keyToPosition`: 字符串键转位置
  - `createInitialBoard`: 创建初始棋盘

### 工具层（utils/）

#### moveRules.ts
- **功能**：实现各棋子的走法规则
- **函数**：
  - `getKingMoves`: 将/帅的走法
  - `getAdvisorMoves`: 士/仕的走法
  - `getElephantMoves`: 象/相的走法
  - `getHorseMoves`: 马的走法
  - `getRookMoves`: 车的走法
  - `getCannonMoves`: 炮的走法
  - `getPawnMoves`: 兵/卒的走法
  - `getValidMoves`: 获取指定位置的所有有效走法

#### gameLogic.ts
- **功能**：游戏逻辑判断
- **函数**：
  - `hasPiece`: 检查位置是否有棋子
  - `isInCheck`: 检查是否被将军
  - `isCheckmate`: 检查是否被将死

#### ai.ts
- **功能**：AI走棋算法
- **算法**：
  - Minimax算法（2层搜索）
  - Alpha-Beta剪枝优化
  - 评估函数（棋子价值、位置价值、吃子等）
- **函数**：
  - `evaluateBoard`: 评估棋盘状态
  - `evaluateMove`: 评估走棋价值
  - `minimax`: Minimax搜索
  - `aiChooseMove`: AI选择走棋

#### gameStorage.ts
- **功能**：棋局保存和加载
- **存储**：使用localStorage
- **特性**：
  - 多棋局保存（按时间戳命名）
  - 保存列表管理
  - 兼容旧版本数据格式
- **函数**：
  - `saveGame`: 保存棋局（支持更新已有保存）
  - `loadGame`: 加载棋局
  - `getSavedGamesList`: 获取保存列表
  - `deleteSavedGame`: 删除指定棋局

## 数据流

### 游戏流程
```
用户点击棋子
  ↓
selectPosition (useGameState)
  ↓
makeMove (useGameState)
  ↓
记录走棋 (MoveRecord)
  ↓
更新棋盘状态
  ↓
检查将死
  ↓
切换玩家 / AI自动走棋
  ↓
保存棋局（游戏结束时）
```

### 复盘流程
```
用户点击"复盘"按钮
  ↓
startReplay (useReplay)
  ↓
进入复盘模式
  ↓
根据currentStep计算棋盘状态
  ↓
显示对应步数的棋盘
  ↓
用户操作控制按钮
  ↓
更新currentStep
  ↓
重新计算并显示棋盘状态
```

### 保存/加载流程
```
用户点击"保存棋局"
  ↓
saveGame (gameStorage)
  ↓
生成时间戳ID
  ↓
保存到localStorage
  ↓
更新保存列表

用户点击"加载"
  ↓
loadGame (gameStorage)
  ↓
从localStorage读取
  ↓
恢复GameState
  ↓
显示最终状态
```

## 状态管理

### GameState
```typescript
{
  board: BoardState,           // 棋盘状态
  currentPlayer: PieceColor,   // 当前玩家
  selectedPosition: Position,   // 选中的位置
  gameOver: boolean,           // 是否结束
  winner: PieceColor,          // 获胜方
  moves: MoveRecord[],         // 走棋记录
  currentStep: number,         // 当前步数
  startTime: number,           // 开始时间
  savedGameId: string          // 已保存的棋局ID
}
```

### ReplayState
```typescript
{
  isReplaying: boolean,        // 是否处于复盘模式
  currentStep: number          // 当前显示的步数
}
```

## 关键设计决策

1. **棋盘状态存储**：使用Map结构，key为位置字符串，value为棋子对象
2. **走棋记录**：数组存储，每步包含完整信息（起始、目标、棋子、被吃棋子等）
3. **复盘实现**：从初始状态开始，逐步应用每一步走棋来计算对应步数的棋盘状态
4. **多棋局保存**：使用时间戳作为唯一ID，支持更新已有保存
5. **AI算法**：Minimax + Alpha-Beta剪枝，2层搜索深度平衡性能和智能

## 扩展建议

1. **性能优化**：
   - 复盘时使用快照机制（每N步保存一个快照）
   - AI搜索深度可配置

2. **功能扩展**：
   - 自动播放功能
   - 中文记谱法显示
   - 导出/导入棋局（JSON文件）
   - 多局记录分析

3. **UI优化**：
   - 音效
   - 更丰富的动画效果
   - 走棋提示（箭头等）
