// app.js
App({
  // 可用的珠子皮肤列表
  beadSkins: [
    {
      id: 'sandalwood',
      name: '檀木',
      icon: '🪵',
      colors: {
        primary: '#8B5A2B',
        secondary: '#A0522D',
        highlight: '#D2B48C',
        shadow: '#5D3A1A'
      }
    },
    {
      id: 'bodhi',
      name: '菩提',
      icon: '🟤',
      colors: {
        primary: '#C4A35A',
        secondary: '#D4B896',
        highlight: '#F5E6C8',
        shadow: '#8B7355'
      }
    },
    {
      id: 'crystal',
      name: '水晶',
      icon: '💎',
      colors: {
        primary: '#B8D4E3',
        secondary: '#E8F4F8',
        highlight: '#FFFFFF',
        shadow: '#7FB3D3'
      }
    },
    {
      id: 'agate',
      name: '玛瑙',
      icon: '🔴',
      colors: {
        primary: '#8B3A3A',
        secondary: '#B85050',
        highlight: '#D4A5A5',
        shadow: '#5C2828'
      }
    },
    {
      id: 'jade',
      name: '翡翠',
      icon: '🟢',
      colors: {
        primary: '#5B8A5B',
        secondary: '#7CB97C',
        highlight: '#A8D8A8',
        shadow: '#3D5C3D'
      }
    }
  ],

  onLaunch() {
    // 初始化全局数据
    this.globalData = {
      userInfo: null,
      settings: {
        soundEnabled: true,
        beadSkin: 'sandalwood' // 默认檀木
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
  },

  // 获取当前皮肤配置
  getCurrentSkin() {
    const skinId = this.globalData.settings.beadSkin || 'sandalwood'
    return this.beadSkins.find(s => s.id === skinId) || this.beadSkins[0]
  }
})
