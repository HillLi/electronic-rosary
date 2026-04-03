const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  const { type = 'woodfish', limit = 100 } = event
  const { OPENID } = cloud.getWXContext()

  // 参数校验
  if (type !== 'woodfish' && type !== 'rosary') {
    return { code: 400, msg: 'type 必须是 woodfish 或 rosary' }
  }
  const safeLimit = Math.min(Math.max(1, limit), 100)
  const field = type === 'woodfish' ? 'woodfishMerit' : 'rosaryMerit'

  const userCollection = db.collection('users')

  try {
    // 获取前N名
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

    // 获取当前用户数据和排名
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

      if (myMerit > 0) {
        // 统计功德比自己高的用户数 + 1 = 自己的排名
        const { total } = await userCollection
          .where({ [field]: _.gt(myMerit) })
          .count()
        myRank = total + 1
      } else {
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
