// pages/settings/settings.js
const app = getApp()

Page({
  data: {
    soundEnabled: true
  },

  onLoad() {
    this.loadSettings()
  },

  onShow() {
    this.loadSettings()
  },

  // 加载设置
  loadSettings() {
    const settings = app.globalData.settings
    this.setData({
      soundEnabled: settings.soundEnabled !== false
    })
  },

  // 切换音效开关
  toggleSound() {
    const soundEnabled = !this.data.soundEnabled
    this.setData({ soundEnabled })
    this.saveSettings()
  },

  // 保存设置
  saveSettings() {
    app.saveSettings({
      soundEnabled: this.data.soundEnabled
    })
  }
})
