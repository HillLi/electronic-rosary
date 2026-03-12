# 电子念珠

一款禅意风格的微信小程序，通过滑动屏幕模拟拨动念珠，记录修行功德。

## 功能特性

- **滑动念珠** - 上下滑动屏幕模拟拨动念珠，9颗珠子循环显示
- **功德计数** - 实时记录功德数量，支持弹跳动画和飘字效果
- **音效反馈** - 拨动珠子时播放木鱼/珠子碰撞音效（可开关）
- **数据持久化** - 功德数据本地存储，关闭小程序不会丢失
- **禅意主题** - 檀香木质风格的精美 UI 设计

## 项目结构

```
electronic-rosary/
├── app.js                 # 全局应用逻辑
├── app.json               # 小程序配置
├── app.wxss               # 全局样式
├── package.json           # 项目依赖
├── jest.config.js         # 测试配置
├── assets/
│   └── sounds/            # 音效文件目录
├── docs/
│   └── REQUIREMENTS.md    # 需求文档
├── pages/
│   ├── index/             # 主页面
│   └── settings/          # 设置页面
└── tests/
    ├── merit.test.js      # 单元测试
    └── index.e2e.test.js  # E2E 测试
```

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd electronic-rosary
```

### 2. 安装依赖

```bash
npm install
```

### 3. 添加音效文件

在 `assets/sounds/` 目录下添加 `bead-click.mp3` 音效文件：

- 建议使用木鱼或珠子碰撞声
- 文件大小控制在 50KB 以内
- 时长建议 0.3-0.5 秒

### 4. 导入微信开发者工具

1. 打开微信开发者工具
2. 选择「导入项目」
3. 选择项目目录
4. 填写 AppID（可使用测试号）

## 运行测试

### 单元测试

```bash
npm test
```

### E2E 测试

1. 确保微信开发者工具已开启服务端口（设置 -> 安全 -> 服务端口）
2. 确保微信开发者工具已登录
3. 运行测试：

```bash
npm run test:e2e
```

## 技术栈

- 微信小程序原生框架
- CSS3 动画与渐变
- Jest 测试框架
- miniprogram-automator（E2E 测试）

## 代码规范

项目使用 ESLint + Prettier 进行代码规范管理：

```bash
# 检查代码规范
npm run lint

# 自动修复
npm run lint:fix
```

## 扩展功能（规划中）

- [ ] 每日统计和历史记录
- [ ] 成就系统（108颗、1000颗里程碑）
- [ ] 念珠样式/背景自定义
- [ ] 分享功德海报
- [ ] 云同步功能

## 许可证

MIT License
