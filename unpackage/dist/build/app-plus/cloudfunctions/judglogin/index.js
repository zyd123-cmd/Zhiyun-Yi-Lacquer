const cloud = require('wx-server-sdk');

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // 使用当前云环境
});

// 获取数据库引用
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const id = event.id;

  // 检查id是否为有效字符串或数字
  if (typeof id !== 'string' && typeof id !== 'number') {
    return false; // 如果id无效，则直接返回false
  }

  // 将id转换为字符串
  const stringId = String(id);

  try {
    // 使用云数据库操作
    const res = await db.collection('user').doc(stringId).field({
      avatarUrl: true,
      nickName: true,
      backimage: true,
    }).get();

    // 检查查询结果是否为空 返回布尔值
    return res.data && Object.keys(res.data).length > 0;
  } catch (error) {
    // 如果查询出错，返回false
    return false;
  }
};
