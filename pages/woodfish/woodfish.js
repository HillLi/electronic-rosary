// pages/woodfish/woodfish.js
const app = getApp()

Page({
  data: {
    merit: 0,
    meritAnimating: false,
    soundEnabled: true,
    isKnocking: false,
    showRipple: false,
    meritPopups: []
  },

  audioContext: null,
  popupId: 0,
  timeouts: [],

  onLoad() {
    this.loadMerit()
    this.loadSettings()
    this.initAudio()
  },

  onShow() {
    this.loadSettings()
  },

  onUnload() {
    this.timeouts.forEach(id => clearTimeout(id))
    this.timeouts = []
    if (this.audioContext) {
      this.audioContext.destroy()
    }
  },

  addTimeout(callback, delay) {
    const id = setTimeout(() => {
      const index = this.timeouts.indexOf(id)
      if (index > -1) this.timeouts.splice(index, 1)
      callback()
    }, delay)
    this.timeouts.push(id)
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
    this.audioContext = wx.createInnerAudioContext()
    this.audioContext.src = '/assets/sounds/woodfish.mp3'
  },

  playClickSound() {
    if (!this.data.soundEnabled || !this.audioContext) return
    this.audioContext.stop()
    this.audioContext.play()
  },

  onTapWoodfish() {
    if (this.data.isKnocking) return

    this.playClickSound()

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
    }, 300)
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

  onShareAppMessage() {
    return {
      title: '一起来敲木鱼积累功德吧！',
      path: '/pages/woodfish/woodfish'
    }
  }
})
