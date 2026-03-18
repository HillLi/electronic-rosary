# 木鱼Tab功能设计

## 概述

在电子念珠小程序中新增"木鱼"功能，与现有"念珠"功能并列，通过底部TabBar导航切换。

## 文件结构

```
pages/
├── index/          # 念珠页面（现有，保持不变）
├── woodfish/       # 木鱼页面（新增）
│   ├── woodfish.js
│   ├── woodfish.wxml
│   ├── woodfish.wxss
│   └── woodfish.json
└── settings/       # 设置页面（现有，保持不变）

assets/
├── sounds/
│   ├── bead-click.mp3      # 现有
│   └── woodfish.mp3        # 新增（用户提供）
└── images/
    ├── woodfish.png        # 木鱼图片（用户提供）
    └── tabBar/             # TabBar 图标（用户提供）
        ├── rosary.png
        ├── rosary-active.png
        ├── woodfish.png
        └── woodfish-active.png
```

## TabBar 配置

修改 `app.json` 添加 tabBar 配置：

```json
{
  "tabBar": {
    "color": "#8B7355",
    "selectedColor": "#8B4513",
    "backgroundColor": "#F5E6D3",
    "borderStyle": "white",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "念珠",
        "iconPath": "assets/images/tabBar/rosary.png",
        "selectedIconPath": "assets/images/tabBar/rosary-active.png"
      },
      {
        "pagePath": "pages/woodfish/woodfish",
        "text": "木鱼",
        "iconPath": "assets/images/tabBar/woodfish.png",
        "selectedIconPath": "assets/images/tabBar/woodfish-active.png"
      }
    ]
  }
}
```

## 木鱼页面功能

### 交互流程

```
用户点击木鱼图片 → 播放敲击音效 → 功德+1 → 显示飘字动画
```

### 功能清单

| 功能 | 说明 |
|------|------|
| 木鱼显示 | 使用图片 `<image>` 组件显示木鱼 |
| 点击交互 | 点击木鱼区域触发敲击 |
| 音效 | 播放 `/assets/sounds/woodfish.mp3` |
| 功德计数 | 独立存储为 `merit_woodfish`，与念珠功德分开 |
| 飘字动画 | 显示"功德+1"向上飘动消失，复用念珠页面的动画样式 |
| 音效开关 | 复用全局 `soundEnabled` 设置 |

### 页面布局

```
┌─────────────────────┐
│    功德: 123        │  ← 功德计数器
├─────────────────────┤
│                     │
│                     │
│      [木鱼图片]      │  ← 可点击区域
│                     │
│                     │
│      功德+1         │  ← 飘字动画
├─────────────────────┤
│   [邀请好友]        │  ← 分享按钮（复用念珠页面样式）
└─────────────────────┘
```

### 数据存储

- 木鱼功德：`wx.setStorageSync('merit_woodfish', value)`
- 与念珠功德 `merit` 独立存储

### 样式风格

- 复用念珠页面的禅意檀香主题
- 背景色、字体、按钮样式保持一致
- 飘字动画效果复用

## 设置页面

- 音效开关对念珠和木鱼都生效（复用现有 `soundEnabled`）
- 暂不修改设置页面

## 所需素材（用户提供）

1. **木鱼图片** - `assets/images/woodfish.png`
   - 建议：透明背景PNG，适配小程序显示

2. **敲击音效** - `assets/sounds/woodfish.mp3`
   - 格式：MP3

3. **TabBar 图标** - 4张图片
   - `assets/images/tabBar/rosary.png` - 念珠图标（默认）
   - `assets/images/tabBar/rosary-active.png` - 念珠图标（选中）
   - `assets/images/tabBar/woodfish.png` - 木鱼图标（默认）
   - `assets/images/tabBar/woodfish-active.png` - 木鱼图标（选中）
   - 建议：81x81 像素，PNG格式

## 实现步骤

1. 创建 `pages/woodfish/` 页面文件
2. 修改 `app.json` 添加页面路径和 tabBar 配置
3. 实现木鱼页面逻辑（点击、音效、功德计数、飘字）
4. 添加素材文件（用户提供的图片和音效）
5. 测试功能
