const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  return {
    errCode: 0,
    errMsg: '',
    auth: JSON.stringify({
      x: 1 // 自定义安全规则（按需修改）
    })
  }
}