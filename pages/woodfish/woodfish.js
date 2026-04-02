// pages/woodfish/woodfish.js
const app = getApp()

Page({
  data: {
    merit: 0,
    meritAnimating: false,
    soundEnabled: true,
    isKnocking: false,
    showRipple: false,
    meritPopups: [],
    autoKnock: false
  },

  audioSrc: null,
  popupId: 0,
  timeouts: [],
  autoKnockTimer: null,

  onLoad() {
    this.loadMerit()
    this.loadSettings()
    this.initAudio()
  },

  onShow() {
    this.loadSettings()
  },

  onHide() {
    this.stopAutoKnock()
  },

  onUnload() {
    this.stopAutoKnock()
    this.timeouts.forEach(id => clearTimeout(id))
    this.timeouts = []
  },

  addTimeout(callback, delay) {
    const self = this
    const id = setTimeout(() => {
      if (self.timeouts) {
        const index = self.timeouts.indexOf(id)
        if (index > -1) self.timeouts.splice(index, 1)
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
      const merit = wx.getStorageSync('merit_woodfish')
      if (merit) this.setData({ merit: parseInt(merit, 10) })
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
    this.setData({ soundEnabled: settings.soundEnabled !== false })
  },

  initAudio() {
    // 音频预加载路径
    this.audioSrc = '/assets/sounds/woodfish.mp3'
  },

  playClickSound() {
    if (!this.data.soundEnabled) return
    const audio = wx.createInnerAudioContext()
    audio.src = this.audioSrc
    audio.onEnded(() => audio.destroy())
    audio.onError(() => audio.destroy())
    audio.play()
  },

  onTapWoodfish() {
    this.playClickSound()

    // 先重置动画状态，再立即设为激活，确保连续敲击时动画能重新触发
    this.setData({
      isKnocking: false,
      showRipple: false
    })

    this.setData({
      isKnocking: true,
      showRipple: true,
      merit: this.data.merit + 1,
      meritAnimating: true
    })

    this.saveMerit()
    this.showMeritPopup(1)

    this.addTimeout(() => {
      this.setData({
        isKnocking: false,
        showRipple: false,
        meritAnimating: false
      })
    }, 350)
  },

  showMeritPopup(count) {
    const popupId = this.popupId++
    const popups = this.data.meritPopups.concat({ id: popupId, count })
    this.setData({ meritPopups: popups })

    this.addTimeout(() => {
      this.removeMeritPopup(popupId)
    }, 1000)
  },

  removeMeritPopup(popupId) {
    const popups = this.data.meritPopups.filter(p => p.id !== popupId)
    this.setData({ meritPopups: popups })
  },

  goToSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' })
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

  toggleAutoKnock() {
    if (this.data.autoKnock) {
      this.stopAutoKnock()
    } else {
      this.startAutoKnock()
    }
  },

  startAutoKnock() {
    this.setData({ autoKnock: true })
    this.autoKnockTimer = setInterval(() => {
      this.onTapWoodfish()
    }, 500)
  },

  stopAutoKnock() {
    if (this.autoKnockTimer) {
      clearInterval(this.autoKnockTimer)
      this.autoKnockTimer = null
    }
    this.setData({ autoKnock: false })
  },

  onShareAppMessage() {
    return {
      title: '一起来敲木鱼积累功德吧！',
      path: '/pages/woodfish/woodfish'
    }
  }
})
