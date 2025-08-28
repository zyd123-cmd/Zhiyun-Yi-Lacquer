const cloud = require('wx-server-sdk');

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // 使用当前云环境
});

// 获取数据库引用
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const id = event.id; // 获取从客户端传递过来的id
  try {
    // 使用云数据库操作
    const result = await db.collection('frienduser').doc(id).remove();
    console.log('删除记录的结果:', result);
    return {
      success: true,
      data: result,
      message: '记录删除成功'
    };
  } catch (e) {
    console.error('删除记录出错:', e);
    return {
      success: false,
      error: e,
      message: '记录删除失败'
    };
  }
};
