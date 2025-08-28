const cloud = require('wx-server-sdk');

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // 使用当前云环境
});

// 获取数据库引用
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const skipCount = Number(event.listlength) || 0;

  // 构建基础查询
  let query = db.collection('content')
    .field({
    _id: true,
    title: true,
    imagesrc: true,
    pagesrc: true
    })
    .skip(skipCount) // 跳过的记录数
    .limit(7) // 限制返回的记录数

  // 如果传入了id，则添加查询条件来筛选特定userid的记录
  if (event.id) {
    query = query.where({
      userid: event.id // 根据传入的id来查询特定的记录
    });
  }

  // 执行查询并返回结果
  return await query.get();
};
