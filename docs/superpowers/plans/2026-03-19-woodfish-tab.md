# 木鱼Tab功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在电子念珠小程序中新增木鱼页面，与念珠页面并列，通过底部TabBar导航切换。

**Architecture:** 新建独立木鱼页面，复用现有的禅意檀香主题样式和音效设置，功德独立存储。修改app.json添加tabBar配置。

**Tech Stack:** 微信小程序原生开发（WXML/WXSS/JS）

---

## 文件结构

| 文件 | 操作 | 说明 |
|------|------|------|
| `pages/woodfish/woodfish.js` | 创建 | 木鱼页面逻辑 |
| `pages/woodfish/woodfish.wxml` | 创建 | 木鱼页面模板 |
| `pages/woodfish/woodfish.wxss` | 创建 | 木鱼页面样式 |
| `pages/woodfish/woodfish.json` | 创建 | 木鱼页面配置 |
| `app.json` | 修改 | 添加页面路径和tabBar配置 |
| `assets/images/woodfish.png` | 占位 | 木鱼图片（用户提供） |
| `assets/sounds/woodfish.mp3` | 占位 | 敲击音效（用户提供） |
| `assets/images/tabBar/*.png` | 占位 | TabBar图标（用户提供） |

---

### Task 1: 创建木鱼页面配置文件

**Files:**
- Create: `pages/woodfish/woodfish.json`

- [ ] **Step 1: 创建页面配置文件**

```json
{
  "usingComponents": {},
  "navigationBarTitleText": "木鱼"
}
```

---

### Task 2: 创建木鱼页面样式文件

**Files:**
- Create: `pages/woodfish/woodfish.wxss`

- [ ] **Step 1: 创建样式文件**

复用念珠页面的禅意檀香主题，包含：容器样式、功德计数器、飘字动画、分享按钮、木鱼图片区域。

```css
/* pages/woodfish/woodfish.wxss - 禅意檀香主题 */

/* ========================================
   主容器 - 禅意氛围背景
   ======================================== */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100vh;
  padding: 40rpx 0;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

/* 檀香烟雾氛围层 */
.container::before {
  content: '';
  position: absolute;
  top: -20%;
  left: -10%;
  right: -10%;
  bottom: -20%;
  background:
    radial-gradient(ellipse 80% 50% at 20% 30%, rgba(139, 90, 43, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 80% 70%, rgba(139, 90, 43, 0.02) 0%, transparent 50%),
    radial-gradient(ellipse 100% 60% at 50% 100%, rgba(184, 134, 11, 0.02) 0%, transparent 40%);
  pointer-events: none;
  z-index: 0;
}

/* ========================================
   功德计数器 - 优雅排版
   ======================================== */
.merit-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 80rpx;
  position: relative;
  z-index: 10;
}

.merit-label {
  font-size: 28rpx;
  letter-spacing: 16rpx;
  color: var(--text-muted, #8B7355);
  margin-bottom: 8rpx;
  text-indent: 16rpx;
}

.merit-value {
  font-size: 96rpx;
  font-weight: 300;
  color: var(--primary-dark, #3D2314);
  text-shadow:
    0 2rpx 4rpx rgba(60, 35, 20, 0.1),
    0 4rpx 12rpx rgba(60, 35, 20, 0.05);
  line-height: 1.2;
  position: relative;
}

/* 功德数字下方装饰线 */
.merit-value::after {
  content: '';
  position: absolute;
  bottom: -16rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 2rpx;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--accent-gold, #B8860B) 50%,
    transparent 100%
  );
  opacity: 0.4;
}

/* 功德数字呼吸动画 */
.merit-value.bounce {
  animation: meritPulse 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes meritPulse {
  0% { transform: scale(1); }
  40% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

/* ========================================
   木鱼区域 - 核心交互区
   ======================================== */
.woodfish-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  position: relative;
  z-index: 5;
}

.woodfish-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.woodfish-img {
  width: 400rpx;
  height: 400rpx;
}

/* ========================================
   底部按钮区域
   ======================================== */
.bottom-btns {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 48rpx;
  position: relative;
  z-index: 10;
}

/* 分享按钮 */
.share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 48rpx;
  background: linear-gradient(135deg,
    rgba(184, 134, 11, 0.12) 0%,
    rgba(184, 134, 11, 0.06) 100%
  );
  border-radius: 48rpx;
  border: 1rpx solid rgba(184, 134, 11, 0.2);
  position: relative;
  overflow: hidden;
}

.share-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 48rpx;
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.2) 0%,
    transparent 50%
  );
  pointer-events: none;
}

.share-btn::after {
  border: none;
}

.share-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.share-text {
  font-size: 26rpx;
  letter-spacing: 4rpx;
  color: var(--accent-gold, #B8860B);
  text-indent: 4rpx;
}

/* ========================================
   功德+1 飘字 - 优雅升起
   ======================================== */
.merit-popup {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-top: -20rpx;
  margin-left: -55rpx;
  font-size: 32rpx;
  font-weight: 400;
  letter-spacing: 2rpx;
  color: var(--accent-gold, #B8860B);
  text-shadow:
    0 0 12rpx rgba(218, 165, 32, 0.5),
    0 2rpx 4rpx rgba(30, 15, 5, 0.1);
  white-space: nowrap;
  pointer-events: none;
  z-index: 9999;
  animation: meritRise 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes meritRise {
  0% {
    opacity: 0;
    transform: translateY(40rpx) scale(0.7);
  }
  15% {
    opacity: 1;
    transform: translateY(10rpx) scale(1.05);
  }
  30% {
    transform: translateY(0) scale(1);
  }
  70% {
    opacity: 0.9;
    transform: translateY(-60rpx) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-100rpx) scale(0.9);
  }
}

/* ========================================
   檀香烟雾粒子 - 禅意氛围
   ======================================== */
.incense-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 6rpx;
  height: 6rpx;
  background: radial-gradient(circle,
    rgba(184, 134, 11, 0.15) 0%,
    rgba(184, 134, 11, 0.05) 50%,
    transparent 100%
  );
  border-radius: 50%;
  animation: floatUp 8s ease-in-out infinite;
}

.particle-1 {
  left: 15%;
  bottom: 20%;
  animation-delay: 0s;
  animation-duration: 10s;
}

.particle-2 {
  left: 30%;
  bottom: 15%;
  animation-delay: 1.5s;
  animation-duration: 12s;
  width: 4rpx;
  height: 4rpx;
}

.particle-3 {
  left: 50%;
  bottom: 25%;
  animation-delay: 3s;
  animation-duration: 9s;
}

.particle-4 {
  left: 70%;
  bottom: 18%;
  animation-delay: 4.5s;
  animation-duration: 11s;
  width: 5rpx;
  height: 5rpx;
}

.particle-5 {
  left: 85%;
  bottom: 22%;
  animation-delay: 6s;
  animation-duration: 13s;
  width: 4rpx;
  height: 4rpx;
}

@keyframes floatUp {
  0% {
    transform: translateY(0) translateX(0) scale(0.5);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  50% {
    transform: translateY(-300rpx) translateX(20rpx) scale(1);
    opacity: 0.4;
  }
  90% {
    opacity: 0.1;
  }
  100% {
    transform: translateY(-600rpx) translateX(-10rpx) scale(0.3);
    opacity: 0;
  }
}
```

---

### Task 3: 创建木鱼页面模板文件

**Files:**
- Create: `pages/woodfish/woodfish.wxml`

- [ ] **Step 1: 创建模板文件**

```xml
<!--pages/woodfish/woodfish.wxml - 禅意檀香主题-->
<view class="container">
  <!-- 檀香烟雾粒子层 -->
  <view class="incense-particles">
    <view class="particle particle-1"></view>
    <view class="particle particle-2"></view>
    <view class="particle particle-3"></view>
    <view class="particle particle-4"></view>
    <view class="particle particle-5"></view>
  </view>

  <!-- 功德计数器 -->
  <view class="merit-container">
    <view class="merit-label">功德</view>
    <view class="merit-value {{meritAnimating ? 'bounce' : ''}}">{{merit}}</view>
  </view>

  <!-- 木鱼区域（包含木鱼和飘字） -->
  <view class="woodfish-area">
    <view class="woodfish-container" bindtap="onTapWoodfish">
      <image
        class="woodfish-img"
        src="/assets/images/woodfish.png"
        mode="aspectFit"
      />
    </view>

    <!-- 功德+1 飘字动画 -->
    <view
      wx:for="{{meritPopups}}"
      wx:key="id"
      class="merit-popup"
    >
      功德+{{item.count}}
    </view>
  </view>

  <!-- 底部分享按钮 -->
  <view class="bottom-btns">
    <button class="share-btn" open-type="share">
      <text class="share-icon">🙏</text>
      <text class="share-text">邀请好友</text>
    </button>
  </view>
</view>
```

---

### Task 4: 创建木鱼页面逻辑文件

**Files:**
- Create: `pages/woodfish/woodfish.js`

- [ ] **Step 1: 创建逻辑文件**

```javascript
// pages/woodfish/woodfish.js
const app = getApp()

// 飘字动画持续时间
const POPUP_DURATION = 1000

Page({
  data: {
    merit: 0,
    meritAnimating: false,
    soundEnabled: true,
    meritPopups: [] // 飘字动画数组
  },

  audioContext: null,
  popupId: 0, // 飘字唯一ID
  timeouts: [], // 存储所有 setTimeout ID

  onLoad() {
    this.loadMerit()
    this.loadSettings()
    this.initAudio()
  },

  onShow() {
    this.loadSettings()
  },

  onUnload() {
    // 清理所有定时器
    this.timeouts.forEach(id => clearTimeout(id))
    this.timeouts = []

    // 清理音频上下文
    if (this.audioContext) {
      this.audioContext.destroy()
    }
  },

  // 封装 setTimeout，便于统一清理
  addTimeout(callback, delay) {
    const id = setTimeout(() => {
      // 执行后从列表中移除
      const index = this.timeouts.indexOf(id)
      if (index > -1) {
        this.timeouts.splice(index, 1)
      }
      callback()
    }, delay)
    this.timeouts.push(id)
    return id
  },

  loadMerit() {
    try {
      const merit = wx.getStorageSync('merit_woodfish')
      if (merit) {
        this.setData({ merit: parseInt(merit, 10) })
      }
    } catch (e) {
      console.error('加载功德失败', e)
    }
  },

  saveMerit() {
    try {
      wx.setStorageSync('merit_woodfish', this.data.merit)
    } catch (e) {
      console.error('保存功德失败', e)
    }
  },

  loadSettings() {
    const settings = app.globalData.settings
    this.setData({
      soundEnabled: settings.soundEnabled !== false
    })
  },

  initAudio() {
    this.audioContext = wx.createInnerAudioContext()
    this.audioContext.src = '/assets/sounds/woodfish.mp3'
  },

  playClickSound() {
    if (!this.data.soundEnabled || !this.audioContext) return
    this.audioContext.stop()
    this.audioContext.play()
  },

  // 点击木鱼
  onTapWoodfish() {
    this.addMerit(1)
  },

  // 显示功德飘字
  showMeritPopup(count = 1) {
    const popupId = this.popupId++
    const popups = this.data.meritPopups.concat({ id: popupId, count })

    this.setData({ meritPopups: popups })

    // 动画结束后移除
    this.addTimeout(() => {
      this.removeMeritPopup(popupId)
    }, POPUP_DURATION)
  },

  // 移除飘字
  removeMeritPopup(popupId) {
    const popups = this.data.meritPopups.filter(p => p.id !== popupId)
    this.setData({ meritPopups: popups })
  },

  // 增加功德
  addMerit(count) {
    // 播放音效
    this.playClickSound()

    // 功德增加
    this.setData({
      merit: this.data.merit + count,
      meritAnimating: true
    })

    this.saveMerit()

    // 显示飘字动画
    this.showMeritPopup(count)

    // 移除动画类
    this.addTimeout(() => {
      this.setData({ meritAnimating: false })
    }, 300)
  },

  // 分享给好友
  onShareAppMessage() {
    return {
      title: '一起来敲木鱼积累功德吧！我已经积累了 ' + this.data.merit + ' 点功德',
      path: '/pages/woodfish/woodfish',
      imageUrl: '/assets/images/share-cover.png'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '电子木鱼 - 随时随地积累功德',
      query: '',
      imageUrl: '/assets/images/share-cover.png'
    }
  }
})
```

---

### Task 5: 修改app.json添加页面和tabBar配置

**Files:**
- Modify: `app.json`

- [ ] **Step 1: 修改app.json**

添加woodfish页面路径和tabBar配置：

```json
{
  "pages": ["pages/index/index", "pages/woodfish/woodfish", "pages/settings/settings"],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#8B4513",
    "navigationBarTitleText": "电子念珠",
    "navigationBarTextStyle": "white",
    "backgroundColor": "#F5E6D3"
  },
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
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json",
  "lazyCodeLoading": "requiredComponents"
}
```

---

### Task 6: 创建占位素材文件

**Files:**
- Create: `assets/images/woodfish.png` (占位)
- Create: `assets/sounds/woodfish.mp3` (占位)
- Create: `assets/images/tabBar/rosary.png` (占位)
- Create: `assets/images/tabBar/rosary-active.png` (占位)
- Create: `assets/images/tabBar/woodfish.png` (占位)
- Create: `assets/images/tabBar/woodfish-active.png` (占位)

- [ ] **Step 1: 创建占位目录结构**

```bash
mkdir -p assets/images/tabBar assets/sounds
```

- [ ] **Step 2: 创建占位图片（1x1透明PNG）**

使用base64编码的最小PNG占位符。用户后续替换为真实素材。

- [ ] **Step 3: 创建占位音频（空文件）**

用户后续替换为真实音效。

---

### Task 7: 提交代码

- [ ] **Step 1: 提交所有更改**

```bash
git add .
git commit -m "feat: 添加木鱼Tab页面

- 新增 woodfish 页面（js/wxml/wxss/json）
- 修改 app.json 添加 tabBar 配置
- 添加占位素材文件（待用户替换）"
```

---

## 用户后续操作

实现完成后，用户需要替换以下素材：

1. **木鱼图片**: `assets/images/woodfish.png`
2. **敲击音效**: `assets/sounds/woodfish.mp3`
3. **TabBar 图标**:
   - `assets/images/tabBar/rosary.png` (念珠默认)
   - `assets/images/tabBar/rosary-active.png` (念珠选中)
   - `assets/images/tabBar/woodfish.png` (木鱼默认)
   - `assets/images/tabBar/woodfish-active.png` (木鱼选中)
