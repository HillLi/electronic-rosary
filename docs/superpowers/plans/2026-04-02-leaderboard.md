# 排行榜功能 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a global leaderboard page showing top 100 users by woodfish and rosary merit, using WeChat Cloud Development.

**Architecture:** Two cloud functions (`uploadMerit` for syncing local merit to cloud, `getLeaderboard` for querying rankings) backed by a single `users` cloud database collection. The `app.js` provides a debounced upload method called from both main pages. A new `pages/leaderboard/leaderboard` page displays the rankings with woodfish/rosary tabs.

**Tech Stack:** WeChat Cloud Development (云数据库 + 云函数), WXML/WXSS/JS (mini-program)

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `cloudfunctions/uploadMerit/index.js` | Cloud function: sync local merit to cloud `users` collection |
| `cloudfunctions/uploadMerit/package.json` | Cloud function dependencies |
| `cloudfunctions/uploadMerit/config.json` | Cloud function config (timeout, etc.) |
| `cloudfunctions/getLeaderboard/index.js` | Cloud function: query top N users + my rank |
| `cloudfunctions/getLeaderboard/package.json` | Cloud function dependencies |
| `cloudfunctions/getLeaderboard/config.json` | Cloud function config |
| `pages/leaderboard/leaderboard.js` | Leaderboard page logic |
| `pages/leaderboard/leaderboard.wxml` | Leaderboard page template |
| `pages/leaderboard/leaderboard.wxss` | Leaderboard page styles |
| `pages/leaderboard/leaderboard.json` | Leaderboard page config |

### Modified Files

| File | Change |
|------|--------|
| `app.js` | Add `wx.cloud.init()`, add `debouncedUploadMerit()` and `flushMeritUpload()` |
| `app.json` | Register `pages/leaderboard/leaderboard` |
| `project.config.json` | Add `cloudfunctionRoot: "cloudfunctions/"` |
| `pages/woodfish/woodfish.js` | Call `debouncedUploadMerit` on merit change, `flushMeritUpload` on `onHide` |
| `pages/woodfish/woodfish.wxml` | Add leaderboard button (🏆) in side-btns |
| `pages/woodfish/woodfish.wxss` | Style for leaderboard button |
| `pages/index/index.js` | Call `debouncedUploadMerit` on merit change, `flushMeritUpload` on `onHide` |
| `pages/index/index.wxml` | Add leaderboard button (🏆) in side-btns |
| `pages/index/index.wxss` | Style for leaderboard button |

---

### Task 1: Initialize Cloud Development

**Files:**
- Modify: `app.js`
- Modify: `app.json`
- Modify: `project.config.json`

- [ ] **Step 1: Add cloud function root to project.config.json**

Add `"cloudfunctionRoot": "cloudfunctions/"` to the top level of `project.config.json`.

In `d:\wrok\wkspace\wx-program\electronic-rosary\project.config.json`, add after `"appid"`:

```json
"cloudfunctionRoot": "cloudfunctions/",
```

- [ ] **Step 2: Register leaderboard page in app.json**

In `d:\wrok\wkspace\wx-program\electronic-rosary\app.json`, add `"pages/leaderboard/leaderboard"` to the `pages` array:

```json
"pages": [
  "pages/woodfish/woodfish",
  "pages/index/index",
  "pages/settings/settings",
  "pages/leaderboard/leaderboard"
],
```

- [ ] **Step 3: Add wx.cloud.init() and upload methods to app.js**

In `d:\wrok\wkspace\wx-program\electronic-rosary\app.js`, add cloud init and merit upload methods.

Add inside `onLaunch()`, after `this.loadSettings()`:

```javascript
if (wx.cloud) {
  wx.cloud.init({
    env: 'your-env-id',
    traceUser: true
  })
}
```

Add these new methods to the App object (after `getCurrentSkin()`):

```javascript
// 排行榜相关 - 防抖上报
uploadTimer: null,
isUploading: false,

debouncedUploadMerit() {
  if (this.uploadTimer) clearTimeout(this.uploadTimer)
  this.uploadTimer = setTimeout(() => {
    this.flushMeritUpload()
  }, 10000)
},

flushMeritUpload() {
  if (this.isUploading) return
  if (!wx.cloud) return

  this.isUploading = true
  const woodfishMerit = parseInt(wx.getStorageSync('merit_woodfish') || '0', 10)
  const rosaryMerit = parseInt(wx.getStorageSync('merit') || '0', 10)

  wx.cloud.callFunction({
    name: 'uploadMerit',
    data: { woodfishMerit, rosaryMerit },
    complete: () => {
      this.isUploading = false
    }
  })
},
```

> **Note:** Replace `'your-env-id'` with your actual cloud environment ID from the WeChat Cloud Development console.

- [ ] **Step 4: Commit**

```bash
git add app.js app.json project.config.json
git commit -m "feat(leaderboard): initialize cloud development and register leaderboard page"
```

---

### Task 2: Create uploadMerit Cloud Function

**Files:**
- Create: `cloudfunctions/uploadMerit/index.js`
- Create: `cloudfunctions/uploadMerit/package.json`
- Create: `cloudfunctions/uploadMerit/config.json`

- [ ] **Step 1: Create cloud function directory**

```bash
mkdir -p cloudfunctions/uploadMerit
```

- [ ] **Step 2: Write cloud function entry**

Create `d:\wrok\wkspace\wx-program\electronic-rosary\cloudfunctions\uploadMerit\index.js`:

```javascript
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { woodfishMerit, rosaryMerit } = event
  const { OPENID } = cloud.getWXContext()

  // Input validation
  if (!isNonNegInt(woodfishMerit) || !isNonNegInt(rosaryMerit)) {
    return { code: 400, msg: '参数错误：必须是非负整数' }
  }

  const now = new Date()
  const userCollection = db.collection('users')

  try {
    const { data } = await userCollection.where({ _openid: OPENID }).get()

    if (data.length > 0) {
      // Update existing record - use local value directly (supports reset to 0)
      await userCollection.doc(data[0]._id).update({
        data: {
          woodfishMerit,
          rosaryMerit,
          updatedAt: now
        }
      })
    } else {
      // Create new record
      await userCollection.add({
        data: {
          _openid: OPENID,
          nickName: '修行者',
          avatarUrl: '',
          woodfishMerit,
          rosaryMerit,
          createdAt: now,
          updatedAt: now
        }
      })
    }

    return { code: 0, msg: 'ok' }
  } catch (e) {
    console.error('uploadMerit error', e)
    return { code: 500, msg: '服务器错误' }
  }
}

function isNonNegInt(v) {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0
}
```

- [ ] **Step 3: Write package.json**

Create `d:\wrok\wkspace\wx-program\electronic-rosary\cloudfunctions\uploadMerit\package.json`:

```json
{
  "name": "uploadMerit",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 4: Write config.json**

Create `d:\wrok\wkspace\wx-program\electronic-rosary\cloudfunctions\uploadMerit\config.json`:

```json
{
  "timeout": 10
}
```

- [ ] **Step 5: Commit**

```bash
git add cloudfunctions/uploadMerit/
git commit -m "feat(leaderboard): add uploadMerit cloud function"
```

---

### Task 3: Create getLeaderboard Cloud Function

**Files:**
- Create: `cloudfunctions/getLeaderboard/index.js`
- Create: `cloudfunctions/getLeaderboard/package.json`
- Create: `cloudfunctions/getLeaderboard/config.json`

- [ ] **Step 1: Create cloud function directory**

```bash
mkdir -p cloudfunctions/getLeaderboard
```

- [ ] **Step 2: Write cloud function entry**

Create `d:\wrok\wkspace\wx-program\electronic-rosary\cloudfunctions\getLeaderboard\index.js`:

```javascript
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  const { type = 'woodfish', limit = 100 } = event
  const { OPENID } = cloud.getWXContext()

  // Validate inputs
  if (type !== 'woodfish' && type !== 'rosary') {
    return { code: 400, msg: 'type 必须是 woodfish 或 rosary' }
  }
  const safeLimit = Math.min(Math.max(1, limit), 100)
  const field = type === 'woodfish' ? 'woodfishMerit' : 'rosaryMerit'

  const userCollection = db.collection('users')

  try {
    // Get top N users
    const { data: topList } = await userCollection
      .field({ nickName: true, avatarUrl: true, [field]: true })
      .orderBy(field, 'desc')
      .limit(safeLimit)
      .get()

    const list = topList.map((u, i) => ({
      rank: i + 1,
      nickName: u.nickName || '修行者',
      avatarUrl: u.avatarUrl || '',
      merit: u[field] || 0
    }))

    // Get my data and rank
    const { data: myData } = await userCollection
      .where({ _openid: OPENID })
      .get()

    let myRank = 0
    let myMerit = 0
    let myNickName = '修行者'
    let myAvatarUrl = ''

    if (myData.length > 0) {
      myMerit = myData[0][field] || 0
      myNickName = myData[0].nickName || '修行者'
      myAvatarUrl = myData[0].avatarUrl || ''

      // Count users with higher merit + 1 = my rank
      if (myMerit > 0) {
        const { total } = await userCollection
          .where({ [field]: _.gt(myMerit) })
          .count()
        myRank = total + 1
      } else {
        // User has 0 merit, rank = total users
        const { total } = await userCollection.count()
        myRank = total
      }
    }

    return {
      code: 0,
      data: { list, myRank, myMerit, myNickName, myAvatarUrl }
    }
  } catch (e) {
    console.error('getLeaderboard error', e)
    return { code: 500, msg: '服务器错误' }
  }
}
```

- [ ] **Step 3: Write package.json**

Create `d:\wrok\wkspace\wx-program\electronic-rosary\cloudfunctions\getLeaderboard\package.json`:

```json
{
  "name": "getLeaderboard",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 4: Write config.json**

Create `d:\wrok\wkspace\wx-program\electronic-rosary\cloudfunctions\getLeaderboard\config.json`:

```json
{
  "timeout": 10
}
```

- [ ] **Step 5: Commit**

```bash
git add cloudfunctions/getLeaderboard/
git commit -m "feat(leaderboard): add getLeaderboard cloud function"
```

---

### Task 4: Add Upload Calls to Woodfish Page

**Files:**
- Modify: `pages/woodfish/woodfish.js`
- Modify: `pages/woodfish/woodfish.wxml`
- Modify: `pages/woodfish/woodfish.wxss`

- [ ] **Step 1: Add debounced upload call in onTapWoodfish and resetMerit**

In `pages/woodfish/woodfish.js`, inside `onTapWoodfish()`, add after `this.saveMerit()`:

```javascript
app.debouncedUploadMerit()
```

In `resetMerit()`, inside the `success` callback after `this.saveMerit()`, add:

```javascript
app.flushMeritUpload()
```

In `onHide()`, add after `this.stopAutoKnock()`:

```javascript
app.flushMeritUpload()
```

- [ ] **Step 2: Add leaderboard button to woodfish WXML**

In `pages/woodfish/woodfish.wxml`, inside the `.side-btns` view, add a new button item as the FIRST item in the list (before the auto button):

```xml
<view class="side-btn-item">
  <view class="side-btn leaderboard-btn" catchtap="goToLeaderboard">
    <text class="side-btn-icon">🏆</text>
  </view>
  <text class="side-btn-label">排行</text>
</view>
```

- [ ] **Step 3: Add goToLeaderboard method to woodfish JS**

In `pages/woodfish/woodfish.js`, add before `onShareAppMessage`:

```javascript
goToLeaderboard() {
  app.flushMeritUpload()
  wx.navigateTo({ url: '/pages/leaderboard/leaderboard' })
},
```

- [ ] **Step 4: Add leaderboard button style to woodfish WXSS**

In `pages/woodfish/woodfish.wxss`, add at the end of the side-btn styles section:

```css
/* 排行榜按钮 */
.side-btn.leaderboard-btn {
  background: linear-gradient(135deg,
    rgba(218, 165, 32, 0.15) 0%,
    rgba(255, 255, 255, 0.95) 100%
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add pages/woodfish/
git commit -m "feat(leaderboard): add upload calls and leaderboard button to woodfish page"
```

---

### Task 5: Add Upload Calls to Rosary (Index) Page

**Files:**
- Modify: `pages/index/index.js`
- Modify: `pages/index/index.wxml`
- Modify: `pages/index/index.wxss`

- [ ] **Step 1: Add debounced upload call in addMerit and resetMerit**

In `pages/index/index.js`, inside `addMerit()`, add after `this.saveMerit()`:

```javascript
app.debouncedUploadMerit()
```

In `resetMerit()`, inside the `success` callback after `this.saveMerit()`, add:

```javascript
app.flushMeritUpload()
```

Add `onHide` lifecycle method (if not present) after `onShow`:

```javascript
onHide() {
  app.flushMeritUpload()
},
```

- [ ] **Step 2: Add leaderboard button to index WXML**

In `pages/index/index.wxml`, inside the `.side-btns` view, add a new button item as the FIRST item (before the skin button):

```xml
<view class="side-btn-item">
  <view class="side-btn leaderboard-btn" catchtap="goToLeaderboard">
    <text class="side-btn-icon">🏆</text>
  </view>
  <text class="side-btn-label">排行</text>
</view>
```

- [ ] **Step 3: Add goToLeaderboard method to index JS**

In `pages/index/index.js`, add before `onShareAppMessage`:

```javascript
goToLeaderboard() {
  app.flushMeritUpload()
  wx.navigateTo({ url: '/pages/leaderboard/leaderboard' })
},
```

- [ ] **Step 4: Add leaderboard button style to index WXSS**

In `pages/index/index.wxss`, add after the existing `.side-btn.reset-btn` styles:

```css
/* 排行榜按钮 */
.side-btn.leaderboard-btn {
  background: linear-gradient(135deg,
    rgba(218, 165, 32, 0.15) 0%,
    rgba(255, 255, 255, 0.95) 100%
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add pages/index/
git commit -m "feat(leaderboard): add upload calls and leaderboard button to rosary page"
```

---

### Task 6: Create Leaderboard Page

**Files:**
- Create: `pages/leaderboard/leaderboard.js`
- Create: `pages/leaderboard/leaderboard.wxml`
- Create: `pages/leaderboard/leaderboard.wxss`
- Create: `pages/leaderboard/leaderboard.json`

- [ ] **Step 1: Create leaderboard page directory**

```bash
mkdir -p pages/leaderboard
```

- [ ] **Step 2: Write leaderboard.json**

Create `d:\wrok\wkspace\wx-program\electronic-rosary\pages\leaderboard\leaderboard.json`:

```json
{
  "usingComponents": {},
  "navigationStyle": "custom",
  "disableScroll": true
}
```

- [ ] **Step 3: Write leaderboard.js**

Create `d:\wrok\wkspace\wx-program\electronic-rosary\pages\leaderboard\leaderboard.js`:

```javascript
// pages/leaderboard/leaderboard.js
Page({
  data: {
    activeTab: 'woodfish', // 'woodfish' | 'rosary'
    list: [],
    myRank: 0,
    myMerit: 0,
    myNickName: '修行者',
    myAvatarUrl: '',
    loading: true,
    error: false
  },

  onLoad() {
    this.fetchLeaderboard()
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    if (tab === this.data.activeTab) return
    this.setData({ activeTab: tab, loading: true, error: false })
    this.fetchLeaderboard()
  },

  fetchLeaderboard() {
    if (!wx.cloud) {
      this.setData({ loading: false, error: true })
      return
    }

    wx.cloud.callFunction({
      name: 'getLeaderboard',
      data: {
        type: this.data.activeTab,
        limit: 100
      },
      success: (res) => {
        if (res.result && res.result.code === 0) {
          this.setData({
            list: res.result.data.list,
            myRank: res.result.data.myRank,
            myMerit: res.result.data.myMerit,
            myNickName: res.result.data.myNickName || '修行者',
            myAvatarUrl: res.result.data.myAvatarUrl || '',
            loading: false,
            error: false
          })
        } else {
          this.setData({ loading: false, error: true })
        }
      },
      fail: () => {
        this.setData({ loading: false, error: true })
      }
    })
  },

  onRetry() {
    this.setData({ loading: true, error: false })
    this.fetchLeaderboard()
  },

  goBack() {
    wx.navigateBack()
  },

  onShareAppMessage() {
    return {
      title: '功德排行榜，快来看看你的排名！',
      path: '/pages/woodfish/woodfish'
    }
  }
})
```

- [ ] **Step 4: Write leaderboard.wxml**

Create `d:\wrok\wkspace\wx-program\electronic-rosary\pages\leaderboard\leaderboard.wxml`:

```xml
<!--pages/leaderboard/leaderboard.wxml-->
<view class="container">
  <!-- 背景图片 -->
  <image class="background-image" src="/assets/images/background.png" mode="aspectFill" />

  <!-- 顶部导航 -->
  <view class="nav-bar">
    <view class="nav-back" bindtap="goBack">
      <text class="nav-back-icon">‹</text>
    </view>
    <text class="nav-title">功德排行榜</text>
    <view class="nav-placeholder"></view>
  </view>

  <!-- Tab 切换 -->
  <view class="tab-bar">
    <view
      class="tab {{activeTab === 'woodfish' ? 'active' : ''}}"
      data-tab="woodfish"
      bindtap="onTabChange"
    >
      木鱼排行
    </view>
    <view
      class="tab {{activeTab === 'rosary' ? 'active' : ''}}"
      data-tab="rosary"
      bindtap="onTabChange"
    >
      念珠排行
    </view>
  </view>

  <!-- 加载中 -->
  <view wx:if="{{loading}}" class="state-container">
    <view class="loading-spinner"></view>
    <text class="state-text">加载中...</text>
  </view>

  <!-- 错误状态 -->
  <view wx:elif="{{error}}" class="state-container">
    <text class="state-text">网络异常，请稍后重试</text>
    <view class="retry-btn" bindtap="onRetry">重试</view>
  </view>

  <!-- 排行榜列表 -->
  <view wx:else class="leaderboard-content">
    <!-- 列表 -->
    <scroll-view class="rank-list" scrollY>
      <view wx:if="{{list.length === 0}}" class="state-container">
        <text class="state-text">暂无数据</text>
      </view>

      <view
        wx:for="{{list}}"
        wx:key="rank"
        class="rank-item {{item.rank <= 3 ? 'rank-top-' + item.rank : ''}}"
      >
        <!-- 排名 -->
        <view class="rank-number">
          <text wx:if="{{item.rank === 1}}" class="rank-medal gold">🥇</text>
          <text wx:elif="{{item.rank === 2}}" class="rank-medal silver">🥈</text>
          <text wx:elif="{{item.rank === 3}}" class="rank-medal bronze">🥉</text>
          <text wx:else class="rank-text">{{item.rank}}</text>
        </view>

        <!-- 头像 -->
        <view class="rank-avatar">
          <image
            wx:if="{{item.avatarUrl}}"
            class="avatar-img"
            src="{{item.avatarUrl}}"
            mode="aspectFill"
          />
          <view wx:else class="avatar-default">
            <text class="avatar-icon">🧘</text>
          </view>
        </view>

        <!-- 昵称 -->
        <text class="rank-name">{{item.nickName}}</text>

        <!-- 功德数 -->
        <text class="rank-merit">{{item.merit}}</text>
      </view>
    </scroll-view>

    <!-- 当前用户（固定底部） -->
    <view wx:if="{{myRank > 0}}" class="my-rank-bar">
      <view class="rank-number">
        <text class="rank-text my">{{myRank}}</text>
      </view>
      <view class="rank-avatar">
        <image
          wx:if="{{myAvatarUrl}}"
          class="avatar-img"
          src="{{myAvatarUrl}}"
          mode="aspectFill"
        />
        <view wx:else class="avatar-default">
          <text class="avatar-icon">🧘</text>
        </view>
      </view>
      <text class="rank-name my-name">{{myNickName}}（我）</text>
      <text class="rank-merit my-merit">{{myMerit}}</text>
    </view>
  </view>
</view>
```

- [ ] **Step 5: Write leaderboard.wxss**

Create `d:\wrok\wkspace\wx-program\electronic-rosary\pages\leaderboard\leaderboard.wxss`:

```css
/* pages/leaderboard/leaderboard.wxss - 禅意檀香主题 */

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  padding-top: calc(40rpx + env(safe-area-inset-top));
  height: 120rpx;
  position: relative;
  z-index: 10;
}

.nav-back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back-icon {
  font-size: 48rpx;
  color: #3D2314;
  font-weight: 300;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 500;
  color: #3D2314;
  letter-spacing: 4rpx;
}

.nav-placeholder {
  width: 64rpx;
}

/* Tab 切换 */
.tab-bar {
  display: flex;
  margin: 0 48rpx 24rpx;
  background: rgba(139, 90, 43, 0.08);
  border-radius: 12rpx;
  overflow: hidden;
  position: relative;
  z-index: 10;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #8B7355;
  letter-spacing: 2rpx;
  transition: all 0.3s ease;
}

.tab.active {
  background: linear-gradient(135deg,
    rgba(184, 134, 11, 0.2) 0%,
    rgba(184, 134, 11, 0.1) 100%
  );
  color: #3D2314;
  font-weight: 600;
}

/* 状态容器 */
.state-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
}

.state-text {
  font-size: 28rpx;
  color: #8B7355;
  letter-spacing: 2rpx;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid rgba(184, 134, 11, 0.2);
  border-top-color: #B8860B;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 24rpx;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 24rpx;
  padding: 16rpx 48rpx;
  background: linear-gradient(135deg,
    rgba(184, 134, 11, 0.15) 0%,
    rgba(184, 134, 11, 0.08) 100%
  );
  border: 1rpx solid rgba(184, 134, 11, 0.3);
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #B8860B;
  letter-spacing: 2rpx;
}

/* 排行榜内容 */
.leaderboard-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
  overflow: hidden;
}

.rank-list {
  flex: 1;
  padding: 0 32rpx;
  padding-bottom: 20rpx;
}

/* 排行项 */
.rank-item {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  margin-bottom: 8rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12rpx;
  border: 1rpx solid rgba(139, 90, 43, 0.08);
}

.rank-item.rank-top-1 {
  background: linear-gradient(135deg,
    rgba(255, 215, 0, 0.15) 0%,
    rgba(255, 255, 255, 0.7) 100%
  );
  border-color: rgba(218, 165, 32, 0.2);
}

.rank-item.rank-top-2 {
  background: linear-gradient(135deg,
    rgba(192, 192, 192, 0.12) 0%,
    rgba(255, 255, 255, 0.7) 100%
  );
  border-color: rgba(192, 192, 192, 0.2);
}

.rank-item.rank-top-3 {
  background: linear-gradient(135deg,
    rgba(205, 127, 50, 0.12) 0%,
    rgba(255, 255, 255, 0.7) 100%
  );
  border-color: rgba(205, 127, 50, 0.2);
}

/* 排名数字 */
.rank-number {
  width: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-medal {
  font-size: 36rpx;
}

.rank-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #8B7355;
}

.rank-text.my {
  color: #B8860B;
  font-size: 30rpx;
}

/* 头像 */
.rank-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  margin: 0 20rpx;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.avatar-default {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #D2B48C 0%, #A0522D 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 32rpx;
}

/* 昵称 */
.rank-name {
  flex: 1;
  font-size: 28rpx;
  color: #3D2314;
  letter-spacing: 1rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-name.my-name {
  color: #B8860B;
  font-weight: 500;
}

/* 功德数 */
.rank-merit {
  font-size: 28rpx;
  font-weight: 600;
  color: #5C3A21;
  margin-left: 16rpx;
}

.rank-merit.my-merit {
  color: #B8860B;
}

/* 我的排名固定底部 */
.my-rank-bar {
  display: flex;
  align-items: center;
  padding: 24rpx 56rpx;
  margin: 0 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: linear-gradient(135deg,
    rgba(184, 134, 11, 0.1) 0%,
    rgba(255, 255, 255, 0.85) 100%
  );
  border-radius: 16rpx 16rpx 0 0;
  border: 1rpx solid rgba(184, 134, 11, 0.2);
  border-bottom: none;
  position: relative;
  z-index: 10;
}
```

- [ ] **Step 6: Commit**

```bash
git add pages/leaderboard/
git commit -m "feat(leaderboard): implement leaderboard page with woodfish/rosary tabs"
```

---

### Task 7: Deploy and Integration Test

**Files:** None (deployment and manual testing)

- [ ] **Step 1: Create cloud environment in WeChat Developer Tools**

1. Open the project in WeChat Developer Tools
2. Click "云开发" button in the toolbar
3. Create a new cloud environment (note the environment ID)
4. Update `app.js` `cloud.init({ env: 'your-env-id' })` with the actual environment ID

- [ ] **Step 2: Create `users` collection**

1. In the Cloud Development console, go to Database
2. Create collection named `users`
3. Set security rules to: all users can read, only creator can write

- [ ] **Step 3: Deploy cloud functions**

1. Right-click `cloudfunctions/uploadMerit` → "上传并部署：云端安装依赖"
2. Right-click `cloudfunctions/getLeaderboard` → "上传并部署：云端安装依赖"
3. Wait for both to show "部署成功"

- [ ] **Step 4: Manual test - uploadMerit**

1. Open the woodfish page
2. Tap the woodfish 5 times
3. Wait 10+ seconds for debounced upload
4. Check Cloud Database → `users` collection → verify a record exists with `woodfishMerit: 5`

- [ ] **Step 5: Manual test - leaderboard page**

1. Click the 🏆 button on the woodfish page
2. Verify the leaderboard page opens
3. Verify your user appears in the list with merit = 5
4. Switch to "念珠排行" tab
5. Verify it shows a different ranking (rosary merit, likely 0)

- [ ] **Step 6: Manual test - error handling**

1. Disconnect network in simulator
2. Navigate to leaderboard page
3. Verify error state shows with retry button
4. Reconnect and click retry
5. Verify data loads successfully

- [ ] **Step 7: Commit any fixes**

```bash
git add -A
git commit -m "fix(leaderboard): integration test fixes"
```

---

## Deployment Notes

After all tasks are complete:

1. Update `app.js` cloud environment ID to production environment
2. Set `users` collection security rules in production cloud environment
3. Deploy both cloud functions to production
4. Test on a real device
