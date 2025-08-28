const cloud = require('wx-server-sdk');

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // 使用当前云环境
});

// 获取数据库引用
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  // event 参数预期包含以下信息
  // event.backimage: 用户上传的头像文件的fileID
  // event.id: 要更新的用户的记录ID

  try {
    // 根据ID更新用户信息到 'user' 集合
    const res = await db.collection('user').doc(event.id).update({
      data: {
        nickName: event.nickName
      }
    });

    // 返回操作结果
    return {
      success: true,
      data: res,
      message: '云函数用户数据更新成功'
    };
  } catch (err) {
    // 处理更新用户信息过程中出现的错误
    return {
      success: false,
      error: err,
      message: '更新失败'
    };
  }
};
