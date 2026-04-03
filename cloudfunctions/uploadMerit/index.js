const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { woodfishMerit, rosaryMerit } = event
  const { OPENID } = cloud.getWXContext()

  // 输入校验：必须是非负整数
  if (!isNonNegInt(woodfishMerit) || !isNonNegInt(rosaryMerit)) {
    return { code: 400, msg: '参数错误：必须是非负整数' }
  }

  const now = new Date()
  const userCollection = db.collection('users')

  try {
    const { data } = await userCollection.where({ _openid: OPENID }).get()

    if (data.length > 0) {
      // 更新已有记录 - 直接用本地值覆盖（支持重置为0）
      await userCollection.doc(data[0]._id).update({
        data: {
          woodfishMerit,
          rosaryMerit,
          updatedAt: now
        }
      })
    } else {
      // 创建新记录
      await userCollection.add({
        data: {
          _openid: OPENID,
          nickName: '修行者',
          avatarUrl: '',
          woodfishMerit,
          rosaryMerit,
          createdAt: now,
          updatedAt: now
        }
      })
    }

    return { code: 0, msg: 'ok' }
  } catch (e) {
    console.error('uploadMerit error', e)
    return { code: 500, msg: '服务器错误' }
  }
}

function isNonNegInt(v) {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0
}
