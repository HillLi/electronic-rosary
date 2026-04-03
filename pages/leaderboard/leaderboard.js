// pages/leaderboard/leaderboard.js
Page({
  data: {
    activeTab: 'woodfish',
    list: [],
    myRank: 0,
    myMerit: 0,
    myNickName: '修行者',
    myAvatarUrl: '',
    loading: true,
    error: false,
    statusBarHeight: 20
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 })
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
