# 排行榜功能设计文档

## 概述

为电子念珠小程序添加功德排行榜功能。第一版实现**全服排行**（木鱼/念珠分开），好友排行作为后续迭代。使用微信云开发作为后端。

## 技术选型

- **后端**：微信云开发（云数据库 + 云函数）
- **用户身份**：微信云开发自动注入 `_openid`，无需额外鉴权
- **数据同步**：防抖上报 + 页面切换时立即上报
- **排行榜范围**：全服前 100 名（第一版不含好友排行）

> **为什么第一版不做好友排行？**
> 微信好友排行需要开放数据域（独立子项目 + canvas 渲染），不能使用 WXML 模板，与云数据库是两套存储系统，复杂度极高。先做全服排行验证核心功能，后续再迭代。

## 数据模型

### 云数据库集合 `users`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `_id` | string | 自动 | 云数据库自动生成 |
| `_openid` | string | 自动 | 云函数中自动注入 |
| `nickName` | string | 是 | 用户昵称，默认"修行者" |
| `avatarUrl` | string | 是 | 头像URL，默认内置头像 |
| `woodfishMerit` | number | 是 | 木鱼功德数，默认 0 |
| `rosaryMerit` | number | 是 | 念珠功德数，默认 0 |
| `updatedAt` | date | 是 | 最后更新时间 |
| `createdAt` | date | 是 | 创建时间 |

### 安全规则

云数据库 `users` 集合权限设为"所有用户可读，仅创建者可写"：

```json
{
  "read": true,
  "write": "doc._openid == auth.openid"
}
```

## 云函数

### `uploadMerit`

上报本地功德到云端。

**输入：**
```json
{ "woodfishMerit": 100, "rosaryMerit": 50 }
```

**输入校验：**
- `woodfishMerit` 和 `rosaryMerit` 必须是非负整数
- 不合法输入直接返回错误，不写入数据库

**逻辑：**
1. 获取调用者 `_openid`（自动注入）
2. 校验输入参数（非负整数）
3. 查询 `users` 集合是否存在该 `_openid` 的记录
4. 存在 → 直接用本地值覆盖云端值（支持重置后同步为 0）
5. 不存在 → 创建新记录，`nickName` 默认"修行者"，`avatarUrl` 为空

> **覆盖策略**：直接使用本地值，不取较大值。这样功德重置（归零）也能同步到云端。

### `getLeaderboard`

获取全服排行榜数据。

**输入：**
```json
{ "type": "woodfish", "limit": 100 }
```

- `type`: `"woodfish"` 或 `"rosary"`
- `limit`: 返回条数，默认 100，上限 100（微信云数据库 `.limit()` 硬上限）

**逻辑：**
1. 使用管理员权限查询 `users` 集合
2. 按 `{ type === 'woodfish' ? 'woodfishMerit' : 'rosaryMerit' }` 降序 `orderBy`
3. `.limit(limit)` 取前 N 条
4. 计算当前用户排名：`count` 查询功德比自己高的记录数 + 1
5. 返回排名列表 + 当前用户排名

**输出：**
```json
{
  "list": [
    { "rank": 1, "nickName": "xxx", "avatarUrl": "xxx", "merit": 999 },
    ...
  ],
  "myRank": 42,
  "myMerit": 100,
  "myNickName": "xxx",
  "myAvatarUrl": "xxx"
}
```

**安全注意：**
- 云函数使用管理员权限读取，但返回数据中不包含 `_openid`
- 仅返回 `nickName`、`avatarUrl`、`merit`

## 错误处理

### 网络失败
- 上报失败：静默忽略，不影响本地功能。下次有网络时会自动重试
- 获取排行榜失败：显示错误提示"网络异常，请稍后重试"，提供重试按钮

### 云开发未初始化
- 检测 `wx.cloud` 是否存在，不存在则排行榜功能不可用（本地功能不受影响）

### 防抖上报期间的并发
- 使用 `isUploading` 标志位，防止重复上报
- `flushMeritUpload` 在上报进行中时跳过（数据已在上报中）

## 数据同步策略

### 上报时机
1. **防抖上报**：功德变化后 10 秒内无新变化，触发上报（定时器在每次功德增加时重置）
2. **页面切换**：`onHide` 时立即上报
3. **打开排行榜**：进入排行榜页前先上报一次

### 实现方式
在 `app.js` 中提供全局方法：

```javascript
debouncedUploadMerit() // 防抖上报，10秒延迟
flushMeritUpload()     // 立即上报（用于页面切换）
```

各页面在 `addMerit` 时调用 `debouncedUploadMerit()`，在 `onHide` 时调用 `flushMeritUpload()`。

### 本地存储作为唯一数据源
本地存储始终是功德的真实数据源。云端仅用于排行榜展示。即使云同步失败，本地功德不受影响。

## 前端设计

### 新增页面 `pages/leaderboard/leaderboard`

**页面结构：**
- 顶部 Tab：木鱼排行 | 念珠排行
- 列表区域：
  - 前三名：金银铜配色，突出显示
  - 其余排名：序号 + 头像 + 昵称 + 功德数
- 当前用户：高亮背景，固定在列表底部（显示自己的排名和功德）
- 加载中：骨架屏或 loading 动画
- 错误状态：提示文案 + 重试按钮
- 空状态：暂无数据的引导文案

**入口：**
- 木鱼页和念珠页各添加一个排行榜按钮（🏆图标）
- 点击后 `wx.navigateTo` 跳转到排行榜页

### 排行榜 Tab 按钮位置
放在两个页面右侧按钮组中（与设置、自动敲击等按钮并列）。

### 样式风格
- 延续现有禅意檀香主题
- 排行榜列表使用卡片式布局
- 前三名使用金银铜色标识
- 当前用户行使用淡金色背景高亮

## 需修改的文件

| 文件 | 修改内容 |
|------|----------|
| `app.js` | 添加 `wx.cloud.init()`、防抖上报方法、上报标志位 |
| `app.json` | 注册 `pages/leaderboard/leaderboard` |
| `project.config.json` | 添加 `cloudfunctionRoot: "cloudfunctions/"` |
| `pages/woodfish/woodfish.js` | 功德变化时调用防抖上报，`onHide` 调用立即上报 |
| `pages/woodfish/woodfish.wxml` | 添加排行榜入口按钮 |
| `pages/woodfish/woodfish.wxss` | 排行榜按钮样式 |
| `pages/index/index.js` | 功德变化时调用防抖上报，`onHide` 调用立即上报 |
| `pages/index/index.wxml` | 添加排行榜入口按钮 |
| `pages/index/index.wxss` | 排行榜按钮样式 |

## 新增文件

| 文件/目录 | 说明 |
|-----------|------|
| `cloudfunctions/uploadMerit/index.js` | 上报功德云函数 |
| `cloudfunctions/uploadMerit/package.json` | 云函数依赖 |
| `cloudfunctions/getLeaderboard/index.js` | 获取排行榜云函数 |
| `cloudfunctions/getLeaderboard/package.json` | 云函数依赖 |
| `pages/leaderboard/leaderboard.js` | 排行榜页面逻辑 |
| `pages/leaderboard/leaderboard.wxml` | 排行榜页面模板 |
| `pages/leaderboard/leaderboard.wxss` | 排行榜页面样式 |
| `pages/leaderboard/leaderboard.json` | 排行榜页面配置 |

## 实施顺序

1. 初始化云开发环境（`app.js` + `project.config.json`）
2. 创建云函数（`uploadMerit`、`getLeaderboard`）
3. 添加全局上报逻辑（`app.js`）
4. 改造现有页面添加上报调用和入口按钮
5. 实现排行榜页面
6. 集成测试

## 后续迭代（第一版不做）

- **好友排行**：需引入开放数据域 + `wx.setUserCloudStorage()` + canvas 渲染
- **用户资料编辑**：设置昵称和头像
- **排行榜缓存**：云函数定期聚合到缓存表，减少实时查询压力
