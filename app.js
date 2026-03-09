// app.js
App({
  onLaunch() {
    // 初始化全局数据
    this.globalData = {
      userInfo: null,
      settings: {
        soundEnabled: true
      }
    }

    // 加载设置
    this.loadSettings()
  },

  loadSettings() {
    try {
      const settings = wx.getStorageSync('settings')
      if (settings) {
        this.globalData.settings = { ...this.globalData.settings, ...settings }
      }
    } catch (e) {
      console.error('加载设置失败', e)
    }
  },

  saveSettings(settings) {
    try {
      this.globalData.settings = { ...this.globalData.settings, ...settings }
      wx.setStorageSync('settings', this.globalData.settings)
    } catch (e) {
      console.error('保存设置失败', e)
    }
  }
})
