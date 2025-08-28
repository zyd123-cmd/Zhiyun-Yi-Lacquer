const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // 使用当前云环境
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
 

  const id = event.id;
  const handupcolor = event.handupcolor;
  let handupUpdate = null;

  // 根据handupcolor的值设置handup的更新操作
  if (handupcolor === "#dd524d") {
    handupUpdate = _.inc(1);
  } else if (handupcolor === "#666666") {
    handupUpdate = _.inc(-1);
  }

  // 如果handupUpdate不为null，则执行更新操作
  if (handupUpdate) {
    try {
      const result = await db.collection('story').doc(id).update({
        data: {
          handup: handupUpdate
        }
      });
      
      console.log("Update result:", result); // 添加日志
      return result;
    } catch (error) {
      console.error("Error updating document:", error); // 添加错误日志
      throw error;
    }
  } else {
    // 如果handupcolor的值不是预期的，返回错误或适当的结果
    throw new Error("Invalid handupcolor value");
  }
};
