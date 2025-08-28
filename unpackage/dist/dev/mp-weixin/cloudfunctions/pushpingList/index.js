const cloud = require('wx-server-sdk');

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // 使用当前云环境
});

// 获取数据库引用
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const { _id, add } = event; // 解构获取_id和add对象

  try {
    // 更新 'frienduser' 集合中对应_id的记录，将add对象添加到pingList数组中
    const updateRes = await db.collection('frienduser').doc(_id).update({
      data: {
        // 使用push操作符将add对象添加到pingList数组的末尾
        'pingList': db.command.push(add)
      }
    });

    // 检查是否有记录被更新
  if (updateRes.stats.updated === 1) {
      // 返回操作结果
      return {
        success: true,
        data: updateRes,
        message: '云函数更新pingList成功'
      };
    } else {
      // 如果没有记录被更新，则返回失败信息
      return {
        success: false,
        data: updateRes,
        message: '更新失败，未找到对应的记录'
      };
    }
  } catch (err) {
    // 处理更新过程中出现的错误
    return {
      success: false,
      error: err,
      message: '更新失败'
    };
  }
};
