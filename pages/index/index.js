// pages/index/index.js
const app = getApp()

// 每颗珠子的高度（包括间距）- 使用 px 单位
const BEAD_SIZE = 100 / 2 // rpx 转 px（rpx / 2）
const BEAD_MARGIN = 20 / 2
const BEAD_HEIGHT = BEAD_SIZE + BEAD_MARGIN // 60px

// 实际渲染的珠子数量
const RENDER_COUNT = 9

// 飘字动画持续时间
const POPUP_DURATION = 1000

Page({
  data: {
    merit: 0,
    visibleBeads: [],
    translateY: 0,
    meritAnimating: false,
    soundEnabled: true,
    useTransition: false,
    meritPopups: []  // 飘字动画数组
  },

  audioContext: null,
  touchStartY: 0,
  completedCount: 0,  // 已完成的珠子数量
  popupId: 0,         // 飘字唯一ID

  onLoad() {
    this.loadMerit()
    this.loadSettings()
    this.initBeads()
    this.initAudio()
  },

  onShow() {
    this.loadSettings()
  },

  onUnload() {
    if (this.audioContext) {
      this.audioContext.destroy()
    }
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

  initBeads() {
    const visibleBeads = []
    for (let i = 0; i < RENDER_COUNT; i++) {
      visibleBeads.push({
        id: i,
        isActive: i === 4
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

  // 触摸开始
  onTouchStart(e) {
    if (e.touches.length > 0) {
      this.touchStartY = e.touches[0].clientY
      this.completedCount = 0
      this.setData({
        useTransition: false
      })
    }
  },

  // 触摸移动 - 连续跟手动画
  onTouchMove(e) {
    if (e.touches.length === 0) return

    const currentY = e.touches[0].clientY
    const totalDelta = currentY - this.touchStartY

    // 计算当前位置（取余实现循环效果）
    const remainder = totalDelta % BEAD_HEIGHT
    this.setData({
      translateY: remainder
    })

    // 计算已完成的珠子数量（取绝对值后向下取整）
    const newCompletedCount = Math.floor(Math.abs(totalDelta) / BEAD_HEIGHT)

    // 如果完成数量增加，触发完成事件
    if (newCompletedCount > this.completedCount) {
      const diff = newCompletedCount - this.completedCount
      for (let i = 0; i < diff; i++) {
        this.onBeadComplete()
      }
      this.completedCount = newCompletedCount
    }
  },

  // 完成一颗珠子
  onBeadComplete() {
    // 播放音效
    this.playClickSound()

    // 功德+1
    this.setData({
      merit: this.data.merit + 1,
      meritAnimating: true
    })

    this.saveMerit()

    // 显示飘字动画
    this.showMeritPopup()

    // 更新珠子显示
    this.beadIndex = (this.beadIndex || 0) + 1
    this.updateBeads()

    // 移除动画类
    setTimeout(() => {
      this.setData({ meritAnimating: false })
    }, 300)
  },

  // 显示功德+1飘字
  showMeritPopup() {
    const popupId = this.popupId++
    const popups = this.data.meritPopups.concat({ id: popupId })

    this.setData({ meritPopups: popups })

    // 动画结束后移除
    setTimeout(() => {
      this.removeMeritPopup(popupId)
    }, POPUP_DURATION)
  },

  // 移除飘字
  removeMeritPopup(popupId) {
    const popups = this.data.meritPopups.filter(p => p.id !== popupId)
    this.setData({ meritPopups: popups })
  },

  // 更新珠子显示
  updateBeads() {
    const visibleBeads = []
    for (let i = 0; i < RENDER_COUNT; i++) {
      visibleBeads.push({
        id: this.beadIndex - 4 + i,
        isActive: i === 4
      })
    }
    this.setData({ visibleBeads })
  },

  // 触摸结束
  onTouchEnd(e) {
    // 启用过渡动画，平滑回到基准位置
    this.setData({
      useTransition: true,
      translateY: 0
    })

    // 动画结束后禁用过渡
    setTimeout(() => {
      this.setData({ useTransition: false })
    }, 300)
  },

  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  }
})
