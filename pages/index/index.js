// pages/index/index.js
const app = getApp()

// 每颗珠子的高度（包括间距）- 使用 px 单位
// bead-wrapper height: 100rpx, margin: -3rpx 0，实际占用 97rpx
// rpx 转 px：97 / 2 = 48.5px
const BEAD_HEIGHT = 48.5

// 可见珠子数量（10颗可见 + 1颗顶部预览 = 渲染11颗）
const RENDER_COUNT = 10

// 飘字动画持续时间
const POPUP_DURATION = 1000

Page({
  data: {
    merit: 0,
    visibleBeads: [],
    meritAnimating: false,
    soundEnabled: true,
    meritPopups: [],
    showSkinPicker: false,
    beadSkins: [],
    currentSkin: null
  },

  audioContext: null,
  countedBeads: new Set(),
  popupId: 0,
  timeouts: [],

  onLoad() {
    this.loadMerit()
    this.loadSettings()
    this.initBeads()
    this.initAudio()
  },

  onShow() {
    this.loadSettings()
    this.loadSkinData()
  },

  onHide() {
    app.flushMeritUpload()
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
    const self = this
    const id = setTimeout(() => {
      if (self.timeouts) {
        const index = self.timeouts.indexOf(id)
        if (index > -1) {
          self.timeouts.splice(index, 1)
        }
      }
      callback()
    }, delay)
    if (this.timeouts) {
      this.timeouts.push(id)
    }
    return id
  },

  loadMerit() {
    try {
      const merit = wx.getStorageSync('merit')
      if (merit) {
        this.setData({ merit: parseInt(merit, 10) })
      }
    } catch (e) {
      console.error('加载功德失败', e)
    }
  },

  saveMerit() {
    try {
      wx.setStorageSync('merit', this.data.merit)
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

  // 加载皮肤数据
  loadSkinData() {
    const currentSkin = app.getCurrentSkin()
    this.setData({
      beadSkins: app.beadSkins,
      currentSkin: currentSkin
    })
  },

  // 打开换肤弹窗
  openSkinPicker() {
    this.setData({ showSkinPicker: true })
  },

  // 关闭换肤弹窗
  closeSkinPicker() {
    this.setData({ showSkinPicker: false })
  },

  // 切换皮肤
  selectSkin(e) {
    const skinId = e.currentTarget.dataset.skinId
    const skin = app.beadSkins.find(s => s.id === skinId)
    if (skin) {
      app.saveSettings({ beadSkin: skinId })
      this.setData({
        currentSkin: skin,
        showSkinPicker: false
      })
    }
  },

  initBeads() {
    const visibleBeads = []
    // 渲染10颗珠子：顶部1颗预览 + 9颗可见
    for (let i = 0; i < RENDER_COUNT + 1; i++) {
      visibleBeads.push({
        id: i - 5,
        isActive: i === 5 // 第6颗珠子是中间激活位置
      })
    }
    this.setData({ visibleBeads })
  },

  initAudio() {
    this.audioContext = wx.createInnerAudioContext()
    this.audioContext.src = '/assets/sounds/bead-click.mp3'
  },

  playClickSound() {
    if (!this.data.soundEnabled || !this.audioContext) return
    this.audioContext.stop()
    this.audioContext.play()
  },

  // WXS回调：触摸开始时重置状态
  onTouchStartReset() {
    this.countedBeads = new Set()
  },

  // WXS回调：珠子切换
  onBeadChange(e) {
    const beadIndex = e.beadIndex
    this.updateBeads(beadIndex)

    if (!this.countedBeads.has(beadIndex)) {
      this.countedBeads.add(beadIndex)
      this.addMerit(1)
    }
  },

  // WXS回调：触摸结束重置
  onTouchEndReset() {
    this.addTimeout(() => {
      this.initBeads()
    }, 350)
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

  // 更新珠子显示
  updateBeads(beadIndex = 0) {
    const visibleBeads = []
    // 渲染10颗珠子：顶部1颗预览 + 9颗可见
    // 预览珠子在顶部上方，向下滑动时会显示
    for (let i = 0; i < RENDER_COUNT + 1; i++) {
      visibleBeads.push({
        id: beadIndex - 5 + i,
        isActive: i === 5 // 第6颗珠子是中间激活位置
      })
    }
    this.setData({ visibleBeads })
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
    app.debouncedUploadMerit()

    // 显示飘字动画
    this.showMeritPopup(count)

    // 移除动画类
    this.addTimeout(() => {
      this.setData({ meritAnimating: false })
    }, 300)
  },

  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  goToLeaderboard() {
    app.flushMeritUpload()
    wx.navigateTo({ url: '/pages/leaderboard/leaderboard' })
  },

  // 重置功德
  resetMerit() {
    wx.showModal({
      title: '重置功德',
      content: '确定要将功德归零吗？',
      confirmText: '确定',
      confirmColor: '#8B4513',
      success: (res) => {
        if (res.confirm) {
          this.setData({ merit: 0 })
          this.saveMerit()
          wx.showToast({
            title: '已重置',
            icon: 'success',
            duration: 1500
          })
        }
      }
    })
  },

  // 分享给好友
  onShareAppMessage() {
    return {
      title: '一起来积累功德吧！我已经积累了 ' + this.data.merit + ' 点功德',
      path: '/pages/index/index',
      imageUrl: '/assets/images/share-cover.png'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '电子念珠 - 随时随地积累功德',
      query: '',
      imageUrl: '/assets/images/share-cover.png'
    }
  }
})
