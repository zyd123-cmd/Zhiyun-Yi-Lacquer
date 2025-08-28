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
  // 使用云数据库操作
  return await db.collection('story').doc(id).field({
    _id:true,
    videosrc: true,
    imagesrc: true,
    title: true,
    introduction:true,
    handup:true,
    pagesrc:true,
  }) .get();
};