// 中文注释：彝圈管理员动作模块统一封装审核、驳回和删除逻辑，避免 adminPortal 主入口继续膨胀。
module.exports = function createYiquanAdminActions(dependencies) {
  const {
    db,
    normalizeText,
    buildSuccess,
    buildFailure,
    assertAdminSession,
    removeCollectionDocumentsByField,
  } = dependencies

  const POST_COLLECTION_NAME = 'yiquan_posts'
  const COMMENT_COLLECTION_NAME = 'yiquan_post_comments'

  // 中文注释：统一转换动态状态文案，便于管理员页面直接展示状态标签。
  function getStatusText(status) {
    console.log('管理员彝圈模块：开始转换动态状态文案', status)
    const statusTextMap = {
      pending: '待审核',
      approved: '已通过',
      rejected: '已驳回',
      deleted: '已删除',
    }
    const statusText = statusTextMap[status] || '未知状态'
    console.log('管理员彝圈模块：动态状态文案转换完成', statusText)
    return statusText
  }

  // 中文注释：统一格式化管理员端动态返回结构，避免把 openid 等敏感字段回传到页面。
  function formatPostForAdmin(post) {
    console.log('管理员彝圈模块：开始格式化管理员端动态数据', post && post._id)
    const status = post.status || 'pending'
    const formattedPost = {
      _id: post._id,
      userId: post.userId || '',
      nickName: post.nickName || '微信用户',
      avatarUrl: post.avatarUrl || '',
      content: post.content || '',
      imageList: Array.isArray(post.imageList) ? post.imageList : [],
      status,
      statusText: getStatusText(status),
      reviewRemark: post.reviewRemark || '',
      reviewerId: post.reviewerId || '',
      commentCount: Number(post.commentCount || 0),
      createdAt: Number(post.createdAt || 0),
      updatedAt: Number(post.updatedAt || 0),
      reviewedAt: Number(post.reviewedAt || 0),
    }
    console.log('管理员彝圈模块：管理员端动态数据格式化完成', formattedPost)
    return formattedPost
  }

  // 中文注释：管理员查询全部彝圈动态，用于待审核、已通过和已驳回列表统一管理。
  async function listYiquanPosts(event) {
    console.log('管理员彝圈模块：开始查询彝圈动态列表', event || {})
    await assertAdminSession(event)
    const result = await db.collection(POST_COLLECTION_NAME).limit(300).get()
    const postList = (result.data || [])
      .filter((post) => post.status !== 'deleted')
      .sort((currentPost, nextPost) => Number(nextPost.createdAt || 0) - Number(currentPost.createdAt || 0))
      .map((post) => formatPostForAdmin(post))
    console.log('管理员彝圈模块：彝圈动态列表查询完成', postList.length)
    return buildSuccess(postList, '获取彝圈动态列表成功')
  }

  // 中文注释：管理员审核彝圈动态，只允许切换到通过或驳回两种业务状态。
  async function reviewYiquanPost(event) {
    console.log('管理员彝圈模块：开始审核彝圈动态', event || {})
    const { adminProfile } = await assertAdminSession(event)
    const postId = normalizeText(event.postId)
    const reviewStatus = normalizeText(event.reviewStatus)
    const reviewRemark = normalizeText(event.reviewRemark)

    if (!postId) {
      console.log('管理员彝圈模块：审核动态缺少动态 id')
      return buildFailure('缺少动态 id')
    }

    if (reviewStatus !== 'approved' && reviewStatus !== 'rejected') {
      console.log('管理员彝圈模块：审核动态状态非法', reviewStatus)
      return buildFailure('审核状态只能是通过或驳回')
    }

    const currentTime = Date.now()
    await db.collection(POST_COLLECTION_NAME).doc(postId).update({
      data: {
        status: reviewStatus,
        reviewRemark,
        reviewerId: adminProfile._id,
        reviewedAt: currentTime,
        updatedAt: currentTime,
      },
    })
    console.log('管理员彝圈模块：动态审核状态更新完成', {
      postId,
      reviewStatus,
    })

    const latestResult = await db.collection(POST_COLLECTION_NAME).doc(postId).get()
    const formattedPost = formatPostForAdmin(latestResult.data || {})
    return buildSuccess(formattedPost, reviewStatus === 'approved' ? '动态已通过审核' : '动态已驳回')
  }

  // 中文注释：管理员删除彝圈动态时同步清理评论，避免管理员端删除后用户端仍残留评论数据。
  async function deleteYiquanPost(event) {
    console.log('管理员彝圈模块：开始删除彝圈动态', event || {})
    await assertAdminSession(event)
    const postId = normalizeText(event.postId)

    if (!postId) {
      console.log('管理员彝圈模块：删除动态缺少动态 id')
      return buildFailure('缺少动态 id')
    }

    await db.collection(POST_COLLECTION_NAME).doc(postId).remove()
    console.log('管理员彝圈模块：彝圈动态主记录删除完成', postId)
    const removedCommentCount = await removeCollectionDocumentsByField(COMMENT_COLLECTION_NAME, 'postId', postId)
    console.log('管理员彝圈模块：彝圈动态评论清理完成', {
      postId,
      removedCommentCount,
    })
    return buildSuccess({
      postId,
      removedCommentCount,
    }, '彝圈动态删除成功')
  }

  return {
    deleteYiquanPost,
    listYiquanPosts,
    reviewYiquanPost,
  }
}
