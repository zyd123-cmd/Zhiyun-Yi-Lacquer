<template>
  <view class="yiquan-publish-page">
    <view class="publish-card">
      <view class="publish-card__header">
        <text class="publish-card__title">{{ isEditMode ? '修改彝圈动态' : '发布彝圈动态' }}</text>
        <text class="publish-card__tip">
          {{ isEditMode ? '修改完成后会重新进入管理员审核流程，审核通过后才会重新公开展示。' : '动态提交后需要管理员审核通过，审核通过后才会在彝圈公开展示。' }}
        </text>
      </view>

      <view v-if="isEditMode && editingReviewRemark" class="publish-card__review-tip">
        <text class="publish-card__review-title">上次驳回原因</text>
        <text class="publish-card__review-text">{{ editingReviewRemark }}</text>
      </view>

      <textarea
        class="publish-card__textarea"
        :value="content"
        maxlength="500"
        placeholder="分享此刻的漆艺见闻、生活感受或作品灵感"
        auto-height
        @input="handleContentInput"
      />

      <view class="publish-card__count">{{ contentLength }}/500</view>

      <view class="publish-image-grid">
        <view
          v-for="(imageItem, imageIndex) in imageList"
          :key="imageItem.localId"
          class="publish-image-grid__item"
        >
          <image
            class="publish-image-grid__image"
            :src="imageItem.previewUrl"
            mode="aspectFill"
            @click="previewImage(imageIndex)"
          />
          <view v-if="imageItem.isUploading" class="publish-image-grid__mask">
            <text class="publish-image-grid__mask-text">上传中</text>
          </view>
          <view class="publish-image-grid__remove" @click="removeImage(imageItem.localId)">×</view>
        </view>

        <view
          v-if="imageList.length < maxImageCount"
          class="publish-image-grid__add"
          @click="chooseImages"
        >
          <text class="publish-image-grid__add-icon">+</text>
          <text class="publish-image-grid__add-text">添加图片</text>
        </view>
      </view>

      <view class="publish-footer">
        <button class="publish-footer__button publish-footer__button--ghost" @click="goBack">
          取消
        </button>
        <button
          class="publish-footer__button publish-footer__button--primary"
          :disabled="isSubmitDisabled"
          :loading="isSubmitting"
          @click="submitPost"
        >
          {{ isEditMode ? '重新提交审核' : '提交审核' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { mapState } from 'vuex'
import { CLOUD_FUNCTIONS, resolveCloudFileSourceList } from '@/utils/cloud'
import { YIQUAN_EDITING_POST_KEY, YIQUAN_LATEST_SUBMITTED_POST_KEY } from '@/utils/yiquan'

const MAX_IMAGE_COUNT = 9

export default {
  computed: {
    ...mapState('m_user', ['isLoggedIn']),
    contentLength() {
      return this.content.length
    },
    uploadingImageCount() {
      return this.imageList.filter((imageItem) => imageItem.isUploading).length
    },
    uploadedImageFileIdList() {
      return this.imageList
        .map((imageItem) => imageItem.fileId)
        .filter((fileId) => typeof fileId === 'string' && fileId)
    },
    isSubmitDisabled() {
      return this.isSubmitting || this.uploadingImageCount > 0
    },
  },
  data() {
    return {
      maxImageCount: MAX_IMAGE_COUNT,
      content: '',
      imageList: [],
      isSubmitting: false,
      isEditMode: false,
      editingPostId: '',
      editingReviewRemark: '',
    }
  },
  onLoad(options) {
    console.log('彝圈发布页：页面加载完成，准备校验当前登录状态与编辑模式参数', options || {})

    if (!this.isLoggedIn) {
      console.log('彝圈发布页：当前用户尚未登录，准备提示并跳转到我的页面')
      uni.showToast({
        title: '请先登录后再发布动态',
        icon: 'none',
      })
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/my/my',
        })
      }, 300)
      return
    }

    this.initializePage(options || {})
  },
  methods: {
    // 中文注释：统一初始化发布页，兼容新建动态与修改驳回动态两种入口。
    async initializePage(options = {}) {
      console.log('彝圈发布页：开始初始化页面状态', options)

      if (options.mode !== 'edit') {
        console.log('彝圈发布页：当前为普通发布模式，无需恢复驳回动态草稿')
        return
      }

      this.isEditMode = true
      this.editingPostId = typeof options.postId === 'string' ? options.postId : ''
      console.log('彝圈发布页：已切换为驳回动态编辑模式', {
        isEditMode: this.isEditMode,
        editingPostId: this.editingPostId,
      })
      await this.restoreEditingDraft()
      console.log('彝圈发布页：驳回动态编辑模式初始化完成')
    },
    // 中文注释：统一恢复被驳回动态的本地编辑草稿，方便用户修改后重新提交审核。
    async restoreEditingDraft() {
      console.log('彝圈发布页：开始恢复驳回动态编辑草稿')
      const draftText = uni.getStorageSync(YIQUAN_EDITING_POST_KEY)

      if (!draftText) {
        console.log('彝圈发布页：未找到驳回动态编辑草稿，准备结束当前编辑流程')
        uni.showToast({
          title: '未找到待编辑的驳回动态',
          icon: 'none',
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 400)
        return
      }

      try {
        const draftPost = JSON.parse(draftText)
        console.log('彝圈发布页：驳回动态编辑草稿解析完成', draftPost)

        if (!draftPost || !draftPost._id) {
          console.log('彝圈发布页：驳回动态编辑草稿缺少动态 id，无法继续恢复')
          throw new Error('编辑草稿无效')
        }

        if (this.editingPostId && draftPost._id !== this.editingPostId) {
          console.log('彝圈发布页：草稿动态 id 与页面参数不一致，准备中止恢复流程', {
            editingPostId: this.editingPostId,
            draftPostId: draftPost._id,
          })
          throw new Error('编辑草稿与当前动态不匹配')
        }

        const imageFileIdList = Array.isArray(draftPost.imageList)
          ? draftPost.imageList.filter((fileId) => typeof fileId === 'string' && fileId)
          : []
        console.log('彝圈发布页：开始解析驳回动态原始图片预览地址', imageFileIdList)
        const previewUrlList = await resolveCloudFileSourceList(imageFileIdList)
        console.log('彝圈发布页：驳回动态原始图片预览地址解析完成', previewUrlList)

        this.editingPostId = draftPost._id
        this.editingReviewRemark = typeof draftPost.reviewRemark === 'string' ? draftPost.reviewRemark : ''
        this.content = typeof draftPost.content === 'string' ? draftPost.content : ''
        this.imageList = imageFileIdList.map((fileId, imageIndex) => ({
          localId: this.createLocalImageId(),
          previewUrl: previewUrlList[imageIndex] || fileId,
          tempFilePath: '',
          fileId,
          isUploading: false,
        }))
        console.log('彝圈发布页：驳回动态编辑草稿恢复完成', {
          editingPostId: this.editingPostId,
          content: this.content,
          imageList: this.imageList,
          editingReviewRemark: this.editingReviewRemark,
        })
      } catch (error) {
        console.error('彝圈发布页：恢复驳回动态编辑草稿失败', error)
        uni.showToast({
          title: error.message || '编辑草稿恢复失败',
          icon: 'none',
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 400)
      }
    },
    // 中文注释：统一处理正文输入，保证日志和页面状态同步。
    handleContentInput(event) {
      const nextValue = event && event.detail ? event.detail.value : ''
      console.log('彝圈发布页：收到正文输入事件，准备同步内容', nextValue)
      this.content = nextValue
      console.log('彝圈发布页：正文内容同步完成', this.content)
    },
    // 中文注释：统一生成本地图像临时标识，避免多个上传任务的状态串位。
    createLocalImageId() {
      const localId = `yiquan-image-${Date.now()}-${Math.random().toString(16).slice(2)}`
      console.log('彝圈发布页：生成本地图像临时标识完成', localId)
      return localId
    },
    // 中文注释：统一更新指定图片项，便于上传完成、失败和删除时精确同步状态。
    updateImageItem(localId, updater) {
      console.log('彝圈发布页：开始更新指定图片项状态', localId)
      this.imageList = this.imageList.map((imageItem) => {
        if (imageItem.localId !== localId) {
          return imageItem
        }

        const nextImageItem =
          typeof updater === 'function'
            ? updater(imageItem)
            : {
                ...imageItem,
                ...updater,
              }

        return nextImageItem
      })
      console.log('彝圈发布页：指定图片项状态更新完成', this.imageList)
    },
    // 中文注释：统一选择图片并触发上传，最多允许九宫格九张图。
    async chooseImages() {
      console.log('彝圈发布页：开始执行图片选择流程', {
        currentCount: this.imageList.length,
        maxImageCount: this.maxImageCount,
      })

      if (!this.isLoggedIn) {
        console.log('彝圈发布页：图片选择流程被登录校验拦截')
        uni.showToast({
          title: '请先登录后再上传图片',
          icon: 'none',
        })
        return
      }

      const remainCount = this.maxImageCount - this.imageList.length

      if (remainCount <= 0) {
        console.log('彝圈发布页：当前已达到最大图片数量限制')
        uni.showToast({
          title: '最多上传 9 张图片',
          icon: 'none',
        })
        return
      }

      try {
        const chooseResult = await uni.chooseImage({
          count: remainCount,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
        })
        console.log('彝圈发布页：图片选择完成', chooseResult)
        const tempFilePathList = Array.isArray(chooseResult.tempFilePaths) ? chooseResult.tempFilePaths : []

        if (!tempFilePathList.length) {
          console.log('彝圈发布页：本次未选择到任何图片，直接结束流程')
          return
        }

        const pendingImageList = tempFilePathList.map((tempFilePath) => ({
          localId: this.createLocalImageId(),
          previewUrl: tempFilePath,
          tempFilePath,
          fileId: '',
          isUploading: true,
        }))
        this.imageList = [...this.imageList, ...pendingImageList]
        console.log('彝圈发布页：待上传图片已写入本地列表，准备开始上传', this.imageList)

        await Promise.all(
          pendingImageList.map((imageItem) => this.uploadSingleImage(imageItem))
        )
        console.log('彝圈发布页：本次批量图片上传流程执行完成')
      } catch (error) {
        console.error('彝圈发布页：图片选择或上传流程失败', error)

        if (error && error.errMsg && error.errMsg.indexOf('cancel') !== -1) {
          console.log('彝圈发布页：用户主动取消了图片选择流程')
          return
        }

        uni.showToast({
          title: error.message || '图片上传失败，请稍后重试',
          icon: 'none',
        })
      }
    },
    // 中文注释：统一上传单张图片到云存储，上传完成后回填 fileID 供动态提交使用。
    async uploadSingleImage(imageItem) {
      console.log('彝圈发布页：开始上传单张图片', imageItem)
      const suffixMatch = /\.[^\\.]+$/.exec(imageItem.tempFilePath || '')
      const suffix = suffixMatch ? suffixMatch[0] : '.jpg'
      const cloudPath = `yiquan/post/${Date.now()}-${Math.random().toString(16).slice(2)}${suffix}`
      console.log('彝圈发布页：单张图片云存储路径生成完成', cloudPath)

      try {
        const uploadResult = await wx.cloud.uploadFile({
          cloudPath,
          filePath: imageItem.tempFilePath,
        })
        console.log('彝圈发布页：单张图片上传成功，准备回填 fileID', uploadResult)
        this.updateImageItem(imageItem.localId, {
          fileId: uploadResult.fileID || '',
          isUploading: false,
        })
        console.log('彝圈发布页：单张图片上传结果回填完成', imageItem.localId)
      } catch (error) {
        console.error('彝圈发布页：单张图片上传失败', error)
        this.imageList = this.imageList.filter((currentImage) => currentImage.localId !== imageItem.localId)
        console.log('彝圈发布页：上传失败的图片已从本地列表移除', imageItem.localId)
        throw error
      }
    },
    // 中文注释：统一删除已选择的图片，便于用户重新调整九宫格顺序和内容。
    removeImage(localId) {
      console.log('彝圈发布页：开始删除已选择图片', localId)
      this.imageList = this.imageList.filter((imageItem) => imageItem.localId !== localId)
      console.log('彝圈发布页：已选择图片删除完成', this.imageList)
    },
    // 中文注释：统一预览已选择图片，方便用户在提交前检查图片内容。
    previewImage(imageIndex) {
      console.log('彝圈发布页：开始预览已选择图片', imageIndex)
      const previewUrlList = this.imageList.map((imageItem) => imageItem.previewUrl)

      if (!previewUrlList.length) {
        console.log('彝圈发布页：当前没有可预览的图片，直接结束预览流程')
        return
      }

      uni.previewImage({
        current: previewUrlList[imageIndex] || previewUrlList[0],
        urls: previewUrlList,
      })
      console.log('彝圈发布页：图片预览指令已发出', previewUrlList)
    },
    // 中文注释：统一清理驳回动态编辑草稿，避免下次新建动态时误恢复旧数据。
    clearEditingDraftCache() {
      console.log('彝圈发布页：开始清理驳回动态编辑草稿缓存')
      uni.removeStorageSync(YIQUAN_EDITING_POST_KEY)
      console.log('彝圈发布页：驳回动态编辑草稿缓存清理完成')
    },
    // 中文注释：统一执行动态提交流程，兼容新建动态与驳回动态重新提审两种场景。
    async submitPost() {
      console.log('彝圈发布页：开始执行动态提交流程', {
        content: this.content,
        imageCount: this.imageList.length,
        uploadingImageCount: this.uploadingImageCount,
        isEditMode: this.isEditMode,
        editingPostId: this.editingPostId,
      })

      if (!this.isLoggedIn) {
        console.log('彝圈发布页：动态提交流程被登录校验拦截')
        uni.showToast({
          title: '请先登录后再发布动态',
          icon: 'none',
        })
        return
      }

      if (this.isSubmitting) {
        console.log('彝圈发布页：当前已有动态提交流程在执行，忽略本次重复提交')
        return
      }

      const trimmedContent = this.content.trim()

      if (!trimmedContent && !this.uploadedImageFileIdList.length) {
        console.log('彝圈发布页：正文和图片都为空，拦截提交流程')
        uni.showToast({
          title: '请填写内容或上传图片',
          icon: 'none',
        })
        return
      }

      if (this.uploadingImageCount > 0) {
        console.log('彝圈发布页：当前仍有图片上传中，阻止提交流程')
        uni.showToast({
          title: '图片仍在上传中，请稍后再提交',
          icon: 'none',
        })
        return
      }

      if (this.isEditMode && !this.editingPostId) {
        console.log('彝圈发布页：当前处于编辑模式但缺少动态 id，阻止提交流程')
        uni.showToast({
          title: '未找到需要重新提交的动态',
          icon: 'none',
        })
        return
      }

      this.isSubmitting = true
      console.log('彝圈发布页：动态提交流程已加锁')

      try {
        const functionName = this.isEditMode ? CLOUD_FUNCTIONS.UPDATE_YIQUAN_POST : CLOUD_FUNCTIONS.CREATE_YIQUAN_POST
        const requestData = {
          content: trimmedContent,
          imageList: this.uploadedImageFileIdList,
        }

        if (this.isEditMode) {
          requestData.postId = this.editingPostId
        }

        console.log('彝圈发布页：开始调用动态提交云函数', {
          functionName,
          requestData,
        })
        const response = await wx.cloud.callFunction({
          name: functionName,
          data: requestData,
        })
        const result = response && response.result ? response.result : {}
        console.log('彝圈发布页：动态提交云函数返回结果', result)

        if (!result.success) {
          throw new Error(result.message || '动态提交失败')
        }

        if (result.data && result.data._id) {
          console.log('彝圈发布页：开始缓存刚提交成功的动态数据', result.data)
          uni.setStorageSync(YIQUAN_LATEST_SUBMITTED_POST_KEY, JSON.stringify(result.data))
          console.log('彝圈发布页：刚提交成功的动态缓存完成')
        } else {
          console.log('彝圈发布页：云函数未返回动态主体数据，跳过本地桥接缓存')
        }

        if (this.isEditMode) {
          console.log('彝圈发布页：当前为驳回动态重新提审，准备清理编辑草稿缓存')
          this.clearEditingDraftCache()
        }

        uni.showToast({
          title: result.message || (this.isEditMode ? '动态已重新提交审核' : '动态已提交审核'),
          icon: 'success',
        })
        console.log('彝圈发布页：动态提交流程成功，准备返回彝圈首页')
        setTimeout(() => {
          uni.navigateBack()
        }, 500)
      } catch (error) {
        console.error('彝圈发布页：动态提交流程失败', error)
        uni.showToast({
          title: error.message || '动态提交失败，请稍后重试',
          icon: 'none',
        })
      } finally {
        this.isSubmitting = false
        console.log('彝圈发布页：动态提交流程结束，已释放提交锁')
      }
    },
    // 中文注释：统一处理取消按钮返回逻辑，避免页面层重复编写导航代码。
    goBack() {
      console.log('彝圈发布页：收到返回指令，准备关闭当前页面')
      uni.navigateBack()
    },
  },
}
</script>

<style lang="scss">
.yiquan-publish-page {
  min-height: 100vh;
  padding: 28rpx;
  box-sizing: border-box;
  background: linear-gradient(180deg, #f7f0ea 0%, #f4f4f4 100%);
}

.publish-card {
  padding: 32rpx;
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 18rpx 36rpx rgba(66, 35, 24, 0.08);
}

.publish-card__header {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.publish-card__title {
  font-size: 34rpx;
  font-weight: 700;
  color: #2f2723;
}

.publish-card__tip {
  font-size: 24rpx;
  line-height: 1.6;
  color: #8b7f76;
}

.publish-card__review-tip {
  margin-top: 24rpx;
  padding: 22rpx 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(180deg, #fff5e6 0%, #fffaf4 100%);
  border: 2rpx solid rgba(197, 105, 42, 0.12);
}

.publish-card__review-title {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: #8f1d22;
}

.publish-card__review-text {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: #7b5b41;
}

.publish-card__textarea {
  width: 100%;
  min-height: 260rpx;
  margin-top: 28rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  box-sizing: border-box;
  background: #f8f4ef;
  font-size: 30rpx;
  line-height: 1.7;
  color: #3a302b;
}

.publish-card__count {
  margin-top: 16rpx;
  text-align: right;
  font-size: 22rpx;
  color: #9a8c82;
}

.publish-image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-top: 28rpx;
}

.publish-image-grid__item,
.publish-image-grid__add {
  position: relative;
  height: 208rpx;
  border-radius: 22rpx;
  overflow: hidden;
  background: #f5efe8;
}

.publish-image-grid__image {
  width: 100%;
  height: 100%;
}

.publish-image-grid__mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(47, 39, 35, 0.45);
}

.publish-image-grid__mask-text {
  font-size: 24rpx;
  color: #ffffff;
}

.publish-image-grid__remove {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.56);
  color: #ffffff;
  font-size: 30rpx;
  line-height: 42rpx;
  text-align: center;
}

.publish-image-grid__add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #d0c2b6;
}

.publish-image-grid__add-icon {
  font-size: 54rpx;
  color: #8f1d22;
}

.publish-image-grid__add-text {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #7c6d63;
}

.publish-footer {
  display: flex;
  gap: 20rpx;
  margin-top: 36rpx;
}

.publish-footer__button {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 999rpx;
  font-size: 30rpx;
}

.publish-footer__button--ghost {
  background: #f1e9e2;
  color: #6c5c53;
}

.publish-footer__button--primary {
  background: linear-gradient(90deg, #8f1d22 0%, #c53f2b 100%);
  color: #ffffff;
}

.publish-footer__button[disabled] {
  opacity: 0.6;
}
</style>
