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
