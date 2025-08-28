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
  // event.avatarUrl: 用户上传的头像文件的fileID
  // event.nickName: 用户的昵称

  try {
    // 添加用户信息到 'user' 集合
    const res = await db.collection('frienduser').add({
      data: {
        userid:event.id,
        avatar: event.avatar,
        nickName: event.nickName,
        content:event.content,
        imagelist:event.imagelist,
        time: db.serverDate(),// 获取服务器当前时间戳
        pingList:[],
      }
    });

    // 返回操作结果
    return {
      success: true,
      data: res,
      message: '云函数用户数据上传成功'
    };
  } catch (err) {
    // 处理添加用户信息过程中出现的错误
    return {
      success: false,
      error: err,
      message: '注册失败'
    };
  }
};
