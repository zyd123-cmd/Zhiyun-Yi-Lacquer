(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["subcontentpkg/hottopic/article0/article0"],{

/***/ 100:
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/project/Zhiyun-Yi-Lacquer/subcontentpkg/hottopic/article0/article0.vue?vue&type=script&lang=js& ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni, wx) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _regenerator = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/regenerator */ 48));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ 50));
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ 18));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ 11));
var _vuex = __webpack_require__(/*! vuex */ 38);
var _cloud = __webpack_require__(/*! @/utils/cloud */ 52);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var AiAssistant = function AiAssistant() {
  Promise.all(/*! require.ensure | components/ai-assistant/ai-assistant */[__webpack_require__.e("common/vendor"), __webpack_require__.e("components/ai-assistant/ai-assistant")]).then((function () {
    return resolve(__webpack_require__(/*! @/components/ai-assistant/ai-assistant.vue */ 156));
  }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
};
var ARTICLE_DETAIL_CACHE_PREFIX = 'articleDetailCacheV2:';
var ARTICLE_COMMENT_CACHE_PREFIX = 'articleCommentCacheV2:';
var ARTICLE_CACHE_EXPIRE_MS = 5 * 60 * 1000;
var ARTICLE_IMAGE_FALLBACK = '/static/logo.png';
var _default = {
  components: {
    AiAssistant: AiAssistant
  },
  data: function data() {
    return {
      articleId: '',
      article: {},
      contentList: [],
      imageList: [],
      articleBlocks: [],
      isFavorite: false,
      isLiked: false,
      likeCount: 0,
      isReady: false,
      commentList: [],
      commentTreeData: [],
      commentInput: '',
      activeReplyCommentId: '',
      activeReplyNickName: '',
      commentLoading: false,
      commentSubmitting: false,
      isCommentInputFocused: false,
      commentLikeLoadingMap: {},
      lastCommentInputLogAt: 0
    };
  },
  computed: _objectSpread(_objectSpread(_objectSpread({}, (0, _vuex.mapState)('m_article', ['favoriteArticles', 'likedArticles'])), (0, _vuex.mapState)('m_user', ['isLoggedIn', 'userId'])), {}, {
    // 中文注释：统一把正文段落和图片交替组合，保证文章展示顺序和数据库内容一致。
    alternatedContent: function alternatedContent() {
      var mixedContent = [];
      var maxLength = Math.max(this.contentList.length, this.imageList.length);
      for (var index = 0; index < maxLength; index += 1) {
        if (index < this.contentList.length) {
          mixedContent.push({
            type: 'text',
            content: this.contentList[index]
          });
        }
        if (index < this.imageList.length) {
          mixedContent.push({
            type: 'image',
            imageSrc: this.imageList[index]
          });
        }
      }
      return mixedContent;
    },
    // 中文注释：统一控制文章点赞图标颜色，点赞后立即给用户明确反馈。
    likeIconColor: function likeIconColor() {
      return this.isLiked ? '#dd524d' : '#666666';
    },
    // 中文注释：统一计算评论总数，根评论与回复都计入总评论数。
    commentTotalCount: function commentTotalCount() {
      return this.commentList.length;
    },
    // 中文注释：统一计算评论输入长度，用于限制评论长度并实时提示用户。
    commentInputLength: function commentInputLength() {
      return this.commentInput.length;
    },
    // 中文注释：统一控制评论提交按钮文案，回复评论时给用户更清晰的动作提示。
    commentActionButtonText: function commentActionButtonText() {
      return this.activeReplyCommentId ? '回复评论' : '发表评论';
    },
    // 中文注释：统一控制评论输入框占位文案，帮助用户明确当前输入是在发评论还是回复评论。
    commentPlaceholder: function commentPlaceholder() {
      return this.activeReplyCommentId ? "\u56DE\u590D ".concat(this.activeReplyNickName || '这条评论') : '说点什么，让更多人看到你的想法';
    },
    // 中文注释：统一把平铺评论整理成“根评论 + 回复列表”的结构，方便页面直接渲染。
    commentTree: function commentTree() {
      var commentNodeMap = {};
      var rootCommentList = [];
      this.commentList.forEach(function (comment) {
        commentNodeMap[comment._id] = _objectSpread(_objectSpread({}, comment), {}, {
          replies: []
        });
      });
      Object.keys(commentNodeMap).forEach(function (commentId) {
        var currentComment = commentNodeMap[commentId];
        var rootCommentId = currentComment.rootCommentId || currentComment.parentCommentId;
        if (!currentComment.parentCommentId) {
          rootCommentList.push(currentComment);
          return;
        }
        if (rootCommentId && commentNodeMap[rootCommentId]) {
          commentNodeMap[rootCommentId].replies.push(currentComment);
          return;
        }
        rootCommentList.push(currentComment);
      });
      rootCommentList.sort(function (currentComment, nextComment) {
        return nextComment.createdAt - currentComment.createdAt;
      });
      rootCommentList.forEach(function (rootComment) {
        rootComment.replies.sort(function (currentReply, nextReply) {
          return currentReply.createdAt - nextReply.createdAt;
        });
      });
      return rootCommentList;
    }
  }),
  watch: {
    contentList: function contentList() {
      this.rebuildArticleBlocks();
    },
    imageList: function imageList() {
      this.rebuildArticleBlocks();
    },
    commentList: function commentList() {
      this.rebuildCommentTree();
      if (this.articleId) {
        this.writePageCache(this.getCommentCacheKey(), this.commentList);
      }
    },
    favoriteArticles: {
      handler: function handler() {
        this.syncFavoriteState();
      }
    },
    likedArticles: {
      handler: function handler() {
        this.syncLikeState();
      }
    }
  },
  onLoad: function onLoad(options) {
    console.log('文章详情页面：页面加载完成，开始解析文章 id', options || {});
    this.articleId = options && options.id ? options.id : '';
    console.log('文章详情页面：文章 id 解析完成', this.articleId);
    if (this.articleId) {
      console.log('文章详情页面：已拿到文章 id，准备同时加载文章详情和评论列表');
      this.restoreArticleCache();
      this.restoreCommentCache();
      this.loadArticle();
      this.loadComments();
    } else {
      console.log('文章详情页面：未拿到文章 id，当前无法加载文章详情');
    }
  },
  methods: _objectSpread(_objectSpread({}, (0, _vuex.mapMutations)('m_article', ['toggleFavoriteArticle', 'toggleLikedArticle'])), {}, {
    // 中文注释：统一返回文章集合候选名，便于在不同历史集合结构之间自动兼容。
    getArticleCollectionNames: function getArticleCollectionNames() {
      console.log('文章详情页面：开始获取文章集合候选列表');
      var collectionNameList = [_cloud.COLLECTIONS.ARTICLES].concat((0, _toConsumableArray2.default)(_cloud.COLLECTION_FALLBACKS.ARTICLES));
      console.log('文章详情页面：文章集合候选列表获取完成', collectionNameList);
      return collectionNameList;
    },
    // 中文注释：统一生成文章详情缓存键，避免不同文章的缓存互相覆盖。
    getArticleCacheKey: function getArticleCacheKey() {
      var cacheKey = "".concat(ARTICLE_DETAIL_CACHE_PREFIX).concat(this.articleId);
      console.log('文章详情页面：开始生成文章详情缓存键', cacheKey);
      return cacheKey;
    },
    // 中文注释：统一生成文章评论缓存键，避免不同文章的评论缓存互相覆盖。
    getCommentCacheKey: function getCommentCacheKey() {
      var cacheKey = "".concat(ARTICLE_COMMENT_CACHE_PREFIX).concat(this.articleId);
      console.log('文章详情页面：开始生成文章评论缓存键', cacheKey);
      return cacheKey;
    },
    // 中文注释：统一读取详情页本地缓存，并自动处理过期缓存。
    readPageCache: function readPageCache(cacheKey) {
      console.log('文章详情页面：开始读取页面缓存', cacheKey);
      try {
        var cacheText = uni.getStorageSync(cacheKey);
        if (!cacheText) {
          console.log('文章详情页面：当前缓存不存在，直接返回空值', cacheKey);
          return null;
        }
        var cacheData = JSON.parse(cacheText);
        if (!cacheData || !cacheData.timestamp) {
          console.log('文章详情页面：当前缓存结构无效，直接忽略缓存', cacheKey);
          return null;
        }
        if (Date.now() - Number(cacheData.timestamp) > ARTICLE_CACHE_EXPIRE_MS) {
          console.log('文章详情页面：当前缓存已过期，直接忽略缓存', {
            cacheKey: cacheKey,
            timestamp: cacheData.timestamp
          });
          return null;
        }
        console.log('文章详情页面：页面缓存读取成功', cacheKey);
        return cacheData.payload;
      } catch (error) {
        console.error('文章详情页面：页面缓存读取失败', error);
        return null;
      }
    },
    // 中文注释：统一写入详情页本地缓存，用于返回文章页时优先秒开旧数据。
    writePageCache: function writePageCache(cacheKey, payload) {
      console.log('文章详情页面：开始写入页面缓存', {
        cacheKey: cacheKey,
        payload: payload
      });
      try {
        uni.setStorageSync(cacheKey, JSON.stringify({
          timestamp: Date.now(),
          payload: payload
        }));
        console.log('文章详情页面：页面缓存写入完成', cacheKey);
      } catch (error) {
        console.error('文章详情页面：页面缓存写入失败', error);
      }
    },
    // 中文注释：优先恢复文章详情缓存，让用户再次进入文章页时先看到已有内容。
    restoreArticleCache: function restoreArticleCache() {
      console.log('文章详情页面：开始尝试恢复文章详情缓存');
      var cachedArticle = this.readPageCache(this.getArticleCacheKey());
      if (!cachedArticle || !cachedArticle._id) {
        console.log('文章详情页面：当前没有可用的文章详情缓存，无需恢复');
        return;
      }
      this.applyArticleData(cachedArticle);
      console.log('文章详情页面：文章详情缓存恢复流程已触发');
    },
    // 中文注释：优先恢复评论缓存，让评论区尽快显示，后台再静默刷新最新评论。
    restoreCommentCache: function restoreCommentCache() {
      var _this = this;
      console.log('文章详情页面：开始尝试恢复文章评论缓存');
      var cachedCommentList = this.readPageCache(this.getCommentCacheKey());
      if (!Array.isArray(cachedCommentList) || !cachedCommentList.length) {
        console.log('文章详情页面：当前没有可用的文章评论缓存，无需恢复');
        return;
      }
      this.applyCommentList(cachedCommentList.map(function (comment) {
        return _this.normalizeComment(comment);
      }));
      console.log('文章详情页面：文章评论缓存恢复完成', this.commentList.length);
    },
    // 中文注释：统一生成收藏所需的文章信息，避免收藏逻辑到处拼接结构。
    getFavoritePayload: function getFavoritePayload() {
      console.log('文章详情页面：开始组装收藏文章所需数据');
      var favoritePayload = {
        id: this.article._id,
        imagesrc: this.article.imagesrc,
        title: this.article.title,
        pagesrc: this.article.pagesrc || "/subcontentpkg/hottopic/article0/article0?id=".concat(this.article._id)
      };
      console.log('文章详情页面：收藏文章所需数据组装完成', favoritePayload);
      return favoritePayload;
    },
    // 中文注释：统一把评论对象规范成前端展示需要的结构，保证接口返回与本地更新都能复用同一套结构。
    normalizeComment: function normalizeComment(comment) {
      var createdAt = Number(comment && comment.createdAt || 0);
      var commentUserId = comment && comment.userId || '';
      var isDeleted = Boolean(comment && comment.isDeleted);
      var isOwner = Boolean(comment && comment.isOwner) || Boolean(this.userId && commentUserId && this.userId === commentUserId);
      var canDelete = !isDeleted && (Boolean(comment && comment.canDelete) || isOwner);
      return {
        _id: comment && comment._id || '',
        articleId: comment && comment.articleId || this.articleId,
        userId: commentUserId,
        nickName: comment && comment.nickName || '微信用户',
        avatarUrl: comment && comment.avatarUrl || '',
        content: comment && comment.content || '',
        parentCommentId: comment && comment.parentCommentId || '',
        rootCommentId: comment && comment.rootCommentId || '',
        replyToCommentId: comment && comment.replyToCommentId || '',
        replyToUserId: comment && comment.replyToUserId || '',
        replyToNickName: comment && comment.replyToNickName || '',
        likeCount: Number(comment && comment.likeCount || 0),
        replyCount: Number(comment && comment.replyCount || 0),
        createdAt: createdAt,
        updatedAt: Number(comment && comment.updatedAt || 0),
        createdAtText: this.formatCommentTime(createdAt),
        isLiked: Boolean(comment && comment.isLiked),
        isOwner: isOwner,
        canDelete: canDelete,
        isDeleted: isDeleted,
        status: comment && comment.status || 'active'
      };
    },
    // 中文注释：统一格式化评论时间，方便在评论区稳定显示。
    formatCommentTime: function formatCommentTime(timestamp) {
      if (!timestamp) {
        return '刚刚';
      }
      var date = new Date(Number(timestamp));
      var year = date.getFullYear();
      var month = String(date.getMonth() + 1).padStart(2, '0');
      var day = String(date.getDate()).padStart(2, '0');
      var hour = String(date.getHours()).padStart(2, '0');
      var minute = String(date.getMinutes()).padStart(2, '0');
      return "".concat(year, "-").concat(month, "-").concat(day, " ").concat(hour, ":").concat(minute);
    },
    // 中文注释：统一计算评论头像地址，评论用户没有头像时回退到默认头像。
    getCommentAvatar: function getCommentAvatar(comment) {
      return comment && comment.avatarUrl || '/static/myicon/user.png';
    },
    // 中文注释：统一控制评论点赞图标颜色，评论被点赞后直接高亮。
    getCommentLikeColor: function getCommentLikeColor(comment) {
      return comment && comment.isLiked ? '#dd524d' : '#999999';
    },
    // 中文注释：同步文章收藏状态，保证 Vuex 变化后详情页图标状态立即跟上。
    syncFavoriteState: function syncFavoriteState() {
      var _this2 = this;
      console.log('文章详情页面：开始同步文章收藏状态');
      if (!this.article || !this.article._id) {
        console.log('文章详情页面：当前尚未拿到文章详情，收藏状态直接重置为未收藏');
        this.isFavorite = false;
        return;
      }
      this.isFavorite = this.favoriteArticles.some(function (item) {
        return item.id === _this2.article._id;
      });
      console.log('文章详情页面：文章收藏状态同步完成', this.isFavorite);
    },
    // 中文注释：同步文章点赞状态，保证本地点赞记录变化后详情页按钮及时刷新。
    syncLikeState: function syncLikeState() {
      var _this3 = this;
      console.log('文章详情页面：开始同步文章点赞状态');
      if (!this.article || !this.article._id) {
        console.log('文章详情页面：当前尚未拿到文章详情，点赞状态直接重置为未点赞');
        this.isLiked = false;
        return;
      }
      this.isLiked = this.likedArticles.some(function (item) {
        return item.id === _this3.article._id;
      });
      console.log('文章详情页面：文章点赞状态同步完成', this.isLiked);
    },
    // 中文注释：预览文章图片，方便用户查看大图。
    previewImage: function previewImage(currentImage) {
      console.log('文章详情页面：开始预览文章图片', currentImage);
      uni.previewImage({
        urls: this.imageList,
        current: currentImage
      });
    },
    // 中文注释：统一弹出图片操作菜单，后续如果要扩展保存图片等能力也便于继续追加。
    openImageActions: function openImageActions(currentImage) {
      var _this4 = this;
      console.log('文章详情页面：开始打开图片操作菜单', currentImage);
      wx.showActionSheet({
        itemList: ['查看图片'],
        success: function success(_ref) {
          var tapIndex = _ref.tapIndex;
          console.log('文章详情页面：图片操作菜单点击完成', tapIndex);
          if (tapIndex === 0) {
            _this4.previewImage(currentImage);
          }
        }
      });
    },
    // 中文注释：数据库直连读取文章详情，作为云函数异常时的兜底方案。
    loadArticleFromDatabase: function loadArticleFromDatabase() {
      var _this5 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
        var db, res;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.log('文章详情页面：开始从数据库直连读取文章详情');
                db = wx.cloud.database();
                _context.next = 4;
                return (0, _cloud.runCollectionWithFallback)(_this5.getArticleCollectionNames(), function (collectionName) {
                  return db.collection(collectionName).doc(_this5.articleId).get();
                }, {
                  fallbackWhenEmpty: true
                });
              case 4:
                res = _context.sent;
                console.log('文章详情页面：数据库直连读取文章详情完成', res && res.data ? res.data._id : '');
                return _context.abrupt("return", res.data || {});
              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    },
    // 中文注释：统一把文章详情应用到页面状态，避免不同加载入口重复维护一套赋值逻辑。
    applyArticleData: function applyArticleData(articleData) {
      console.log('文章详情页面：开始把文章详情应用到页面状态', articleData || {});
      var normalizedArticle = articleData && articleData._id ? articleData : _objectSpread(_objectSpread({}, articleData), {}, {
        _id: this.articleId
      });
      this.article = normalizedArticle;
      this.contentList = Array.isArray(normalizedArticle.content) ? normalizedArticle.content : [];
      this.imageList = Array.isArray(normalizedArticle.imagesrc) ? normalizedArticle.imagesrc : [];
      this.rebuildArticleBlocks();
      this.likeCount = Number(normalizedArticle.handup || 0);
      this.syncFavoriteState();
      this.syncLikeState();
      this.isReady = true;
      console.log('文章详情页面：文章详情应用完成', {
        articleId: this.article._id,
        likeCount: this.likeCount,
        contentCount: this.contentList.length,
        imageCount: this.imageList.length
      });
    },
    // 中文注释：加载文章详情，优先走云函数，失败后自动回退到数据库直连。
    loadArticle: function loadArticle() {
      var _this6 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2() {
        var articleData, res;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                console.log('文章详情页面：开始加载文章详情');
                uni.showLoading({
                  title: '加载中',
                  mask: true
                });
                _context2.prev = 2;
                articleData = null;
                _context2.prev = 4;
                console.log('文章详情页面：开始通过云函数加载文章详情');
                _context2.next = 8;
                return (0, _cloud.callCloudFunctionWithFallback)([_cloud.CLOUD_FUNCTIONS.GET_ARTICLE_DETAIL].concat((0, _toConsumableArray2.default)(_cloud.CLOUD_FUNCTION_FALLBACKS.GET_ARTICLE_DETAIL)), {
                  id: _this6.articleId
                }, {
                  fallbackWhenEmpty: true
                });
              case 8:
                res = _context2.sent;
                articleData = (0, _cloud.extractResultData)(res) || {};
                console.log('文章详情页面：通过云函数加载文章详情完成', articleData && articleData._id);
                _context2.next = 19;
                break;
              case 13:
                _context2.prev = 13;
                _context2.t0 = _context2["catch"](4);
                console.warn('文章详情页面：文章详情云函数不可用，准备回退数据库直连', _context2.t0);
                _context2.next = 18;
                return _this6.loadArticleFromDatabase();
              case 18:
                articleData = _context2.sent;
              case 19:
                _this6.writePageCache(_this6.getArticleCacheKey(), articleData || {});
                _this6.applyArticleData(articleData || {});
                _context2.next = 27;
                break;
              case 23:
                _context2.prev = 23;
                _context2.t1 = _context2["catch"](2);
                console.error('文章详情页面：文章详情加载失败', _context2.t1);
                uni.showToast({
                  title: '内容加载失败',
                  icon: 'none'
                });
              case 27:
                _context2.prev = 27;
                console.log('文章详情页面：文章详情加载流程结束，准备关闭加载框');
                uni.hideLoading();
                return _context2.finish(27);
              case 31:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[2, 23, 27, 31], [4, 13]]);
      }))();
    },
    // 中文注释：加载当前文章下的评论列表，并把接口返回的扁平列表标准化为前端统一结构。
    loadComments: function loadComments() {
      var _this7 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3() {
        var res, result, commentList;
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                console.log('文章详情页面：开始加载文章评论列表');
                _this7.commentLoading = true;
                console.log('文章详情页面：评论加载状态已切换为加载中');
                _context3.prev = 3;
                _context3.next = 6;
                return wx.cloud.callFunction({
                  name: _cloud.CLOUD_FUNCTIONS.GET_ARTICLE_COMMENTS,
                  data: {
                    articleId: _this7.articleId,
                    pageSize: 120
                  }
                });
              case 6:
                res = _context3.sent;
                result = res && res.result ? res.result : {};
                console.log('文章详情页面：文章评论云函数返回结果', result);
                if (result.success) {
                  _context3.next = 11;
                  break;
                }
                throw new Error(result.message || '获取评论失败');
              case 11:
                commentList = result.data && Array.isArray(result.data.list) ? result.data.list : [];
                _this7.applyCommentList(commentList.map(function (comment) {
                  return _this7.normalizeComment(comment);
                }));
                _this7.writePageCache(_this7.getCommentCacheKey(), commentList);
                console.log('文章详情页面：文章评论列表同步完成', _this7.commentList.length);
                _context3.next = 21;
                break;
              case 17:
                _context3.prev = 17;
                _context3.t0 = _context3["catch"](3);
                console.error('文章详情页面：文章评论列表加载失败', _context3.t0);
                uni.showToast({
                  title: _context3.t0.message || '评论加载失败',
                  icon: 'none'
                });
              case 21:
                _context3.prev = 21;
                _this7.commentLoading = false;
                console.log('文章详情页面：评论加载流程结束，评论加载状态已重置');
                return _context3.finish(21);
              case 25:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, null, [[3, 17, 21, 25]]);
      }))();
    },
    // 中文注释：统一校验当前操作是否已登录，未登录时引导用户前往“我的”页面完成登录。
    ensureLoggedIn: function ensureLoggedIn() {
      var _this8 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4() {
        var _yield$uni$showModal, confirm;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                console.log('文章详情页面：开始校验当前用户是否已登录');
                if (!_this8.isLoggedIn) {
                  _context4.next = 4;
                  break;
                }
                console.log('文章详情页面：当前用户已登录，允许继续执行操作');
                return _context4.abrupt("return", true);
              case 4:
                console.log('文章详情页面：当前用户未登录，准备弹出登录提示框');
                _context4.next = 7;
                return uni.showModal({
                  title: '提示',
                  content: '请先登录后再继续操作'
                });
              case 7:
                _yield$uni$showModal = _context4.sent;
                confirm = _yield$uni$showModal.confirm;
                console.log('文章详情页面：登录提示框返回结果', confirm);
                if (confirm) {
                  console.log('文章详情页面：用户选择前往登录页');
                  uni.reLaunch({
                    url: '/pages/my/my'
                  });
                }
                return _context4.abrupt("return", false);
              case 12:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }))();
    },
    // 中文注释：切换文章收藏状态，收藏前先校验登录态。
    toggleFavorite: function toggleFavorite() {
      var _this9 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5() {
        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                console.log('文章详情页面：开始切换文章收藏状态');
                _context5.next = 3;
                return _this9.ensureLoggedIn();
              case 3:
                if (_context5.sent) {
                  _context5.next = 6;
                  break;
                }
                console.log('文章详情页面：收藏操作被登录校验拦截');
                return _context5.abrupt("return");
              case 6:
                _this9.toggleFavoriteArticle(_this9.getFavoritePayload());
                _this9.syncFavoriteState();
                console.log('文章详情页面：文章收藏状态切换完成', _this9.isFavorite);
              case 9:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }))();
    },
    // 中文注释：通过云函数或数据库直连持久化文章点赞数变化。
    persistLikeChange: function persistLikeChange(delta) {
      var _this10 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee6() {
        var functionNames, db, command;
        return _regenerator.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                console.log('文章详情页面：开始持久化文章点赞变化', delta);
                functionNames = [_cloud.CLOUD_FUNCTIONS.UPDATE_ARTICLE_LIKES].concat((0, _toConsumableArray2.default)(_cloud.CLOUD_FUNCTION_FALLBACKS.UPDATE_ARTICLE_LIKES));
                _context6.prev = 2;
                _context6.next = 5;
                return (0, _cloud.callCloudFunctionWithFallback)(functionNames, {
                  id: _this10.article._id,
                  delta: delta,
                  handupcolor: delta > 0 ? '#dd524d' : '#666666'
                });
              case 5:
                console.log('文章详情页面：通过云函数持久化文章点赞变化完成');
                return _context6.abrupt("return");
              case 9:
                _context6.prev = 9;
                _context6.t0 = _context6["catch"](2);
                console.warn('文章详情页面：文章点赞云函数不可用，准备回退数据库直连', _context6.t0);
              case 12:
                db = wx.cloud.database();
                command = db.command;
                _context6.next = 16;
                return (0, _cloud.runCollectionWithFallback)(_this10.getArticleCollectionNames(), function (collectionName) {
                  return db.collection(collectionName).doc(_this10.article._id).update({
                    data: {
                      handup: command.inc(delta)
                    }
                  });
                });
              case 16:
                console.log('文章详情页面：通过数据库直连持久化文章点赞变化完成');
              case 17:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, null, [[2, 9]]);
      }))();
    },
    // 中文注释：切换文章点赞状态，先本地乐观更新，再异步持久化到云端。
    toggleLike: function toggleLike() {
      var _this11 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee7() {
        var delta;
        return _regenerator.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                console.log('文章详情页面：开始切换文章点赞状态');
                _context7.next = 3;
                return _this11.ensureLoggedIn();
              case 3:
                if (_context7.sent) {
                  _context7.next = 6;
                  break;
                }
                console.log('文章详情页面：文章点赞操作被登录校验拦截');
                return _context7.abrupt("return");
              case 6:
                delta = _this11.isLiked ? -1 : 1;
                _this11.toggleLikedArticle({
                  id: _this11.article._id
                });
                _this11.syncLikeState();
                _this11.likeCount = Math.max(0, _this11.likeCount + delta);
                _this11.writePageCache(_this11.getArticleCacheKey(), _objectSpread(_objectSpread({}, _this11.article), {}, {
                  handup: _this11.likeCount
                }));
                console.log('文章详情页面：文章点赞本地状态已完成乐观更新', {
                  isLiked: _this11.isLiked,
                  likeCount: _this11.likeCount
                });
                _context7.prev = 12;
                _context7.next = 15;
                return _this11.persistLikeChange(delta);
              case 15:
                _context7.next = 25;
                break;
              case 17:
                _context7.prev = 17;
                _context7.t0 = _context7["catch"](12);
                console.error('文章详情页面：文章点赞持久化失败，准备回滚本地状态', _context7.t0);
                _this11.toggleLikedArticle({
                  id: _this11.article._id
                });
                _this11.syncLikeState();
                _this11.likeCount = Math.max(0, _this11.likeCount - delta);
                _this11.writePageCache(_this11.getArticleCacheKey(), _objectSpread(_objectSpread({}, _this11.article), {}, {
                  handup: _this11.likeCount
                }));
                uni.showToast({
                  title: '点赞失败',
                  icon: 'none'
                });
              case 25:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, null, [[12, 17]]);
      }))();
    },
    // 中文注释：实时同步评论输入内容，保证提交时拿到的是最新草稿。
    handleCommentInput: function handleCommentInput(event) {
      console.log('文章详情页面：收到评论输入事件', event || {});
      this.commentInput = event && event.detail ? String(event.detail.value || '') : '';
      if (Date.now() - this.lastCommentInputLogAt > 500) {
        console.log('文章详情页：评论输入内容已同步，当前输入长度', this.commentInput.length);
        this.lastCommentInputLogAt = Date.now();
      }
      console.log('文章详情页面：评论输入内容同步完成', this.commentInput);
    },
    // 中文注释：评论输入框失焦时同步焦点状态，避免回复场景反复抢焦点。
    handleCommentInputBlur: function handleCommentInputBlur() {
      console.log('文章详情页面：评论输入框失焦，准备重置焦点状态');
      this.isCommentInputFocused = false;
      console.log('文章详情页面：评论输入框焦点状态已重置');
    },
    // 中文注释：开始回复指定评论，记录目标评论信息并把焦点切到输入框。
    startReply: function startReply(comment) {
      var _this12 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee8() {
        return _regenerator.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                console.log('文章详情页面：开始进入回复评论流程', comment || {});
                if (!(comment && comment.isDeleted)) {
                  _context8.next = 5;
                  break;
                }
                console.log('文章详情页面：当前评论已删除，阻止继续回复');
                uni.showToast({
                  title: '已删除评论暂不支持回复',
                  icon: 'none'
                });
                return _context8.abrupt("return");
              case 5:
                _context8.next = 7;
                return _this12.ensureLoggedIn();
              case 7:
                if (_context8.sent) {
                  _context8.next = 10;
                  break;
                }
                console.log('文章详情页面：回复评论操作被登录校验拦截');
                return _context8.abrupt("return");
              case 10:
                _this12.activeReplyCommentId = comment && comment._id ? comment._id : '';
                _this12.activeReplyNickName = comment && comment.nickName ? comment.nickName : '这条评论';
                _this12.isCommentInputFocused = true;
                console.log('文章详情页面：回复评论目标设置完成', {
                  activeReplyCommentId: _this12.activeReplyCommentId,
                  activeReplyNickName: _this12.activeReplyNickName
                });
              case 14:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      }))();
    },
    // 中文注释：取消当前回复状态，恢复成普通发表评论模式。
    cancelReply: function cancelReply() {
      console.log('文章详情页面：开始取消当前回复状态');
      this.activeReplyCommentId = '';
      this.activeReplyNickName = '';
      this.isCommentInputFocused = false;
      console.log('文章详情页面：当前回复状态已取消');
    },
    // 中文注释：统一重置评论输入区状态，评论成功后和取消回复时都复用这套逻辑。
    resetCommentEditor: function resetCommentEditor() {
      console.log('文章详情页面：开始重置评论输入区状态');
      this.commentInput = '';
      this.activeReplyCommentId = '';
      this.activeReplyNickName = '';
      this.isCommentInputFocused = false;
      console.log('文章详情页面：评论输入区状态重置完成');
    },
    // 中文注释：把新创建的评论写入本地评论列表，并在回复场景下同步更新父评论的回复数。
    appendCommentToList: function appendCommentToList(comment) {
      console.log('文章详情页面：开始把新评论追加到本地评论列表', comment || {});
      var normalizedComment = this.normalizeComment(comment);
      this.commentList = [].concat((0, _toConsumableArray2.default)(this.commentList), [normalizedComment]);
      if (normalizedComment.parentCommentId) {
        console.log('文章详情页面：当前为回复评论，准备同步增加父评论回复数', normalizedComment.parentCommentId);
        this.commentList = this.commentList.map(function (currentComment) {
          if (currentComment._id !== normalizedComment.parentCommentId) {
            return currentComment;
          }
          return _objectSpread(_objectSpread({}, currentComment), {}, {
            replyCount: Number(currentComment.replyCount || 0) + 1
          });
        });
      }
      console.log('文章详情页面：新评论已追加到本地评论列表', this.commentList.length);
    },
    // 中文注释：统一按评论 id 更新本地评论列表中的指定评论，便于点赞和回复数等局部刷新。
    updateCommentInList: function updateCommentInList(commentId, updater) {
      var _this13 = this;
      console.log('文章详情页面：开始更新本地评论列表中的指定评论', commentId);
      this.commentList = this.commentList.map(function (currentComment) {
        if (currentComment._id !== commentId) {
          return currentComment;
        }
        var nextComment = typeof updater === 'function' ? updater(currentComment) : _objectSpread(_objectSpread({}, currentComment), updater);
        return _this13.normalizeComment(nextComment);
      });
      console.log('文章详情页面：本地评论列表指定评论更新完成', commentId);
    },
    // 中文注释：把删除评论后的结果同步到本地评论列表，兼容软删除和硬删除两种场景。
    applyCommentDeleteResult: function applyCommentDeleteResult(deleteResult) {
      var _this14 = this;
      console.log('文章详情页面：开始把删除评论结果同步到本地评论列表', deleteResult || {});
      if (!deleteResult || !deleteResult.commentId) {
        console.log('文章详情页面：删除评论结果缺少评论 id，本次不做本地同步');
        return;
      }
      if (deleteResult.deleteMode === 'hard') {
        console.log('文章详情页面：当前为硬删除，准备直接从本地评论列表移除评论');
        this.commentList = this.commentList.filter(function (comment) {
          return comment._id !== deleteResult.commentId;
        });
        if (deleteResult.parentCommentId) {
          console.log('文章详情页面：当前删除的是回复评论，准备同步扣减父评论回复数', deleteResult.parentCommentId);
          this.commentList = this.commentList.map(function (comment) {
            if (comment._id !== deleteResult.parentCommentId) {
              return comment;
            }
            return _this14.normalizeComment(_objectSpread(_objectSpread({}, comment), {}, {
              replyCount: Math.max(0, Number(comment.replyCount || 0) - 1)
            }));
          });
        }
        console.log('文章详情页面：硬删除评论的本地同步完成', this.commentList.length);
        return;
      }
      console.log('文章详情页面：当前为软删除，准备把评论更新为已删除占位状态');
      this.updateCommentInList(deleteResult.commentId, function (comment) {
        return _objectSpread(_objectSpread({}, comment), {}, {
          content: '该评论已删除',
          likeCount: 0,
          isLiked: false,
          canDelete: false,
          isDeleted: true,
          status: 'deleted'
        });
      });
      console.log('文章详情页面：软删除评论的本地同步完成', deleteResult.commentId);
    },
    // 中文注释：删除当前用户自己的评论，成功后同步更新本地评论列表。
    deleteComment: function deleteComment(comment) {
      var _this15 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee9() {
        var _yield$uni$showModal2, confirm, res, result;
        return _regenerator.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                console.log('文章详情页面：开始删除评论流程', comment || {});
                _context9.next = 3;
                return _this15.ensureLoggedIn();
              case 3:
                if (_context9.sent) {
                  _context9.next = 6;
                  break;
                }
                console.log('文章详情页面：删除评论操作被登录校验拦截');
                return _context9.abrupt("return");
              case 6:
                if (!(!comment || !comment._id)) {
                  _context9.next = 9;
                  break;
                }
                console.log('文章详情页面：当前评论缺少评论 id，无法删除');
                return _context9.abrupt("return");
              case 9:
                if (comment.canDelete) {
                  _context9.next = 13;
                  break;
                }
                console.log('文章详情页面：当前评论不允许删除，直接结束流程');
                uni.showToast({
                  title: '只能删除自己的评论',
                  icon: 'none'
                });
                return _context9.abrupt("return");
              case 13:
                _context9.next = 15;
                return uni.showModal({
                  title: '提示',
                  content: '确认删除这条评论吗？'
                });
              case 15:
                _yield$uni$showModal2 = _context9.sent;
                confirm = _yield$uni$showModal2.confirm;
                console.log('文章详情页面：删除评论确认框返回结果', confirm);
                if (confirm) {
                  _context9.next = 21;
                  break;
                }
                console.log('文章详情页面：用户取消了删除评论操作');
                return _context9.abrupt("return");
              case 21:
                _context9.prev = 21;
                _context9.next = 24;
                return wx.cloud.callFunction({
                  name: _cloud.CLOUD_FUNCTIONS.DELETE_ARTICLE_COMMENT,
                  data: {
                    commentId: comment._id
                  }
                });
              case 24:
                res = _context9.sent;
                result = res && res.result ? res.result : {};
                console.log('文章详情页面：删除评论云函数返回结果', result);
                if (!(!result.success || !result.data)) {
                  _context9.next = 29;
                  break;
                }
                throw new Error(result.message || '评论删除失败');
              case 29:
                _this15.applyCommentDeleteResult(result.data);
                if (_this15.activeReplyCommentId === comment._id) {
                  console.log('文章详情页面：当前正在回复的评论已被删除，准备重置回复状态');
                  _this15.cancelReply();
                }
                uni.showToast({
                  title: result.message || '评论删除成功',
                  icon: 'success'
                });
                _context9.next = 38;
                break;
              case 34:
                _context9.prev = 34;
                _context9.t0 = _context9["catch"](21);
                console.error('文章详情页面：删除评论失败', _context9.t0);
                uni.showToast({
                  title: _context9.t0.message || '评论删除失败',
                  icon: 'none'
                });
              case 38:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, null, [[21, 34]]);
      }))();
    },
    // 中文注释：提交评论或回复评论，成功后直接把新评论写回本地列表，避免整页重新加载。
    submitComment: function submitComment() {
      var _this16 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee10() {
        var trimmedContent, res, result;
        return _regenerator.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                console.log('文章详情页面：开始提交评论', {
                  articleId: _this16.articleId,
                  activeReplyCommentId: _this16.activeReplyCommentId,
                  commentInput: _this16.commentInput
                });
                _context10.next = 3;
                return _this16.ensureLoggedIn();
              case 3:
                if (_context10.sent) {
                  _context10.next = 6;
                  break;
                }
                console.log('文章详情页面：评论提交操作被登录校验拦截');
                return _context10.abrupt("return");
              case 6:
                if (!_this16.commentSubmitting) {
                  _context10.next = 9;
                  break;
                }
                console.log('文章详情页面：当前已有评论提交任务在执行，直接忽略本次提交');
                return _context10.abrupt("return");
              case 9:
                trimmedContent = _this16.commentInput.trim();
                if (trimmedContent) {
                  _context10.next = 14;
                  break;
                }
                console.log('文章详情页面：评论内容为空，阻止提交');
                uni.showToast({
                  title: '评论内容不能为空',
                  icon: 'none'
                });
                return _context10.abrupt("return");
              case 14:
                _this16.commentSubmitting = true;
                console.log('文章详情页面：评论提交状态已切换为提交中');
                _context10.prev = 16;
                _context10.next = 19;
                return wx.cloud.callFunction({
                  name: _cloud.CLOUD_FUNCTIONS.CREATE_ARTICLE_COMMENT,
                  data: {
                    articleId: _this16.articleId,
                    parentCommentId: _this16.activeReplyCommentId,
                    content: trimmedContent
                  }
                });
              case 19:
                res = _context10.sent;
                result = res && res.result ? res.result : {};
                console.log('文章详情页面：创建评论云函数返回结果', result);
                if (!(!result.success || !result.data || !result.data._id)) {
                  _context10.next = 24;
                  break;
                }
                throw new Error(result.message || '评论提交失败');
              case 24:
                _this16.appendCommentToList(result.data);
                _this16.resetCommentEditor();
                console.log('文章详情页面：评论提交成功，准备提示用户');
                uni.showToast({
                  title: result.message || '评论成功',
                  icon: 'success'
                });
                _context10.next = 34;
                break;
              case 30:
                _context10.prev = 30;
                _context10.t0 = _context10["catch"](16);
                console.error('文章详情页面：评论提交失败', _context10.t0);
                uni.showToast({
                  title: _context10.t0.message || '评论提交失败',
                  icon: 'none'
                });
              case 34:
                _context10.prev = 34;
                _this16.commentSubmitting = false;
                console.log('文章详情页面：评论提交流程结束，评论提交状态已重置');
                return _context10.finish(34);
              case 38:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, null, [[16, 30, 34, 38]]);
      }))();
    },
    // 中文注释：切换评论点赞状态，先做本地乐观更新，再把结果同步到云端。
    toggleCommentLike: function toggleCommentLike(comment) {
      var _this17 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee11() {
        var previousLikeStatus, previousLikeCount, delta, res, result;
        return _regenerator.default.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                console.log('文章详情页面：开始切换评论点赞状态', comment || {});
                if (!(comment && comment.isDeleted)) {
                  _context11.next = 5;
                  break;
                }
                console.log('文章详情页面：当前评论已删除，阻止继续点赞');
                uni.showToast({
                  title: '已删除评论不能点赞',
                  icon: 'none'
                });
                return _context11.abrupt("return");
              case 5:
                _context11.next = 7;
                return _this17.ensureLoggedIn();
              case 7:
                if (_context11.sent) {
                  _context11.next = 10;
                  break;
                }
                console.log('文章详情页面：评论点赞操作被登录校验拦截');
                return _context11.abrupt("return");
              case 10:
                if (!(!comment || !comment._id)) {
                  _context11.next = 13;
                  break;
                }
                console.log('文章详情页面：当前评论缺少评论 id，无法执行点赞');
                return _context11.abrupt("return");
              case 13:
                if (!_this17.commentLikeLoadingMap[comment._id]) {
                  _context11.next = 16;
                  break;
                }
                console.log('文章详情页面：当前评论点赞任务仍在执行，忽略重复点击', comment._id);
                return _context11.abrupt("return");
              case 16:
                _this17.$set(_this17.commentLikeLoadingMap, comment._id, true);
                console.log('文章详情页面：评论点赞任务已加锁', comment._id);
                previousLikeStatus = Boolean(comment.isLiked);
                previousLikeCount = Number(comment.likeCount || 0);
                delta = previousLikeStatus ? -1 : 1;
                _this17.updateCommentInList(comment._id, function (currentComment) {
                  return _objectSpread(_objectSpread({}, currentComment), {}, {
                    isLiked: !currentComment.isLiked,
                    likeCount: Math.max(0, Number(currentComment.likeCount || 0) + delta)
                  });
                });
                console.log('文章详情页面：评论点赞本地状态已完成乐观更新', {
                  commentId: comment._id,
                  previousLikeStatus: previousLikeStatus,
                  previousLikeCount: previousLikeCount
                });
                _context11.prev = 23;
                _context11.next = 26;
                return wx.cloud.callFunction({
                  name: _cloud.CLOUD_FUNCTIONS.TOGGLE_ARTICLE_COMMENT_LIKE,
                  data: {
                    commentId: comment._id
                  }
                });
              case 26:
                res = _context11.sent;
                result = res && res.result ? res.result : {};
                console.log('文章详情页面：评论点赞云函数返回结果', result);
                if (!(!result.success || !result.data)) {
                  _context11.next = 31;
                  break;
                }
                throw new Error(result.message || '评论点赞失败');
              case 31:
                _this17.updateCommentInList(comment._id, function (currentComment) {
                  return _objectSpread(_objectSpread({}, currentComment), {}, {
                    isLiked: Boolean(result.data.isLiked),
                    likeCount: Math.max(0, Number(result.data.likeCount || 0))
                  });
                });
                console.log('文章详情页面：评论点赞云端结果已同步到本地', comment._id);
                _context11.next = 40;
                break;
              case 35:
                _context11.prev = 35;
                _context11.t0 = _context11["catch"](23);
                console.error('文章详情页面：评论点赞失败，准备回滚本地状态', _context11.t0);
                _this17.updateCommentInList(comment._id, function (currentComment) {
                  return _objectSpread(_objectSpread({}, currentComment), {}, {
                    isLiked: previousLikeStatus,
                    likeCount: Math.max(0, previousLikeCount)
                  });
                });
                uni.showToast({
                  title: _context11.t0.message || '评论点赞失败',
                  icon: 'none'
                });
              case 40:
                _context11.prev = 40;
                _this17.$delete(_this17.commentLikeLoadingMap, comment._id);
                console.log('文章详情页面：评论点赞任务已解锁', comment._id);
                return _context11.finish(40);
              case 44:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, null, [[23, 35, 40, 44]]);
      }))();
    },
    // 中文注释：统一把正文段落和图片交替结果同步到页面数据，避免评论区状态变化时重复重算正文。
    rebuildArticleBlocks: function rebuildArticleBlocks() {
      console.log('文章详情页：开始重建正文内容块缓存');
      this.articleBlocks = this.alternatedContent;
      console.log('文章详情页：正文内容块缓存重建完成', this.articleBlocks.length);
    },
    // 中文注释：统一把评论树结构同步到页面数据，避免输入评论时整棵评论树在渲染阶段反复重算。
    rebuildCommentTree: function rebuildCommentTree() {
      console.log('文章详情页：开始重建评论树缓存');
      this.commentTreeData = this.commentTree;
      console.log('文章详情页：评论树缓存重建完成', this.commentTreeData.length);
    },
    // 中文注释：统一设置评论列表并立即刷新评论树缓存，减少评论相关操作后的重复渲染。
    applyCommentList: function applyCommentList(nextCommentList) {
      console.log('文章详情页：开始同步评论列表和评论树缓存', {
        nextLength: Array.isArray(nextCommentList) ? nextCommentList.length : 0
      });
      this.commentList = Array.isArray(nextCommentList) ? nextCommentList : [];
      this.rebuildCommentTree();
      console.log('文章详情页：评论列表和评论树缓存同步完成', {
        commentCount: this.commentList.length,
        rootCount: this.commentTreeData.length
      });
    }
  })
};
exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"]))

/***/ }),

/***/ 101:
/*!******************************************************************************************************************!*\
  !*** D:/project/Zhiyun-Yi-Lacquer/subcontentpkg/hottopic/article0/article0.vue?vue&type=style&index=0&lang=css& ***!
  \******************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_article0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../editor/editTools/HBuilderX/plugins/uniapp-cli/node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!../../../../../editor/editTools/HBuilderX/plugins/uniapp-cli/node_modules/css-loader/dist/cjs.js??ref--6-oneOf-1-1!../../../../../editor/editTools/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!../../../../../editor/editTools/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-2!../../../../../editor/editTools/HBuilderX/plugins/uniapp-cli/node_modules/postcss-loader/src??ref--6-oneOf-1-3!../../../../../editor/editTools/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../editor/editTools/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./article0.vue?vue&type=style&index=0&lang=css& */ 102);
/* harmony import */ var _editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_article0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_article0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_article0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_article0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_article0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 102:
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--6-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-2!./node_modules/postcss-loader/src??ref--6-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/project/Zhiyun-Yi-Lacquer/subcontentpkg/hottopic/article0/article0.vue?vue&type=style&index=0&lang=css& ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ }),

/***/ 95:
/*!******************************************************************************************************!*\
  !*** D:/project/Zhiyun-Yi-Lacquer/main.js?{"page":"subcontentpkg%2Fhottopic%2Farticle0%2Farticle0"} ***!
  \******************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(wx, createPage) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
__webpack_require__(/*! uni-pages */ 30);
var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 25));
var _article = _interopRequireDefault(__webpack_require__(/*! ./subcontentpkg/hottopic/article0/article0.vue */ 96));
// @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__;
createPage(_article.default);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["createPage"]))

/***/ }),

/***/ 96:
/*!*********************************************************************************!*\
  !*** D:/project/Zhiyun-Yi-Lacquer/subcontentpkg/hottopic/article0/article0.vue ***!
  \*********************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _article0_vue_vue_type_template_id_e5254068___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./article0.vue?vue&type=template&id=e5254068& */ 97);
/* harmony import */ var _article0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./article0.vue?vue&type=script&lang=js& */ 99);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _article0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _article0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _article0_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./article0.vue?vue&type=style&index=0&lang=css& */ 101);
/* harmony import */ var _editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../editor/editTools/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/runtime/componentNormalizer.js */ 36);

var renderjs





/* normalize component */

var component = Object(_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _article0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _article0_vue_vue_type_template_id_e5254068___WEBPACK_IMPORTED_MODULE_0__["render"],
  _article0_vue_vue_type_template_id_e5254068___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  null,
  null,
  false,
  _article0_vue_vue_type_template_id_e5254068___WEBPACK_IMPORTED_MODULE_0__["components"],
  renderjs
)

component.options.__file = "subcontentpkg/hottopic/article0/article0.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 97:
/*!****************************************************************************************************************!*\
  !*** D:/project/Zhiyun-Yi-Lacquer/subcontentpkg/hottopic/article0/article0.vue?vue&type=template&id=e5254068& ***!
  \****************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_article0_vue_vue_type_template_id_e5254068___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../editor/editTools/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../editor/editTools/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!../../../../../editor/editTools/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!../../../../../editor/editTools/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!../../../../../editor/editTools/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../editor/editTools/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./article0.vue?vue&type=template&id=e5254068& */ 98);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_article0_vue_vue_type_template_id_e5254068___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_article0_vue_vue_type_template_id_e5254068___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return _editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_article0_vue_vue_type_template_id_e5254068___WEBPACK_IMPORTED_MODULE_0__["recyclableRender"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "components", function() { return _editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_article0_vue_vue_type_template_id_e5254068___WEBPACK_IMPORTED_MODULE_0__["components"]; });



/***/ }),

/***/ 98:
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/project/Zhiyun-Yi-Lacquer/subcontentpkg/hottopic/article0/article0.vue?vue&type=template&id=e5254068& ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return recyclableRender; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "components", function() { return components; });
var components
try {
  components = {
    aiAssistant: function () {
      return Promise.all(/*! import() | components/ai-assistant/ai-assistant */[__webpack_require__.e("common/vendor"), __webpack_require__.e("components/ai-assistant/ai-assistant")]).then(__webpack_require__.bind(null, /*! @/components/ai-assistant/ai-assistant.vue */ 156))
    },
    uniFav: function () {
      return Promise.all(/*! import() | uni_modules/uni-fav/components/uni-fav/uni-fav */[__webpack_require__.e("common/vendor"), __webpack_require__.e("uni_modules/uni-fav/components/uni-fav/uni-fav")]).then(__webpack_require__.bind(null, /*! @/uni_modules/uni-fav/components/uni-fav/uni-fav.vue */ 163))
    },
    uniIcons: function () {
      return Promise.all(/*! import() | uni_modules/uni-icons/components/uni-icons/uni-icons */[__webpack_require__.e("common/vendor"), __webpack_require__.e("uni_modules/uni-icons/components/uni-icons/uni-icons")]).then(__webpack_require__.bind(null, /*! @/uni_modules/uni-icons/components/uni-icons/uni-icons.vue */ 174))
    },
  }
} catch (e) {
  if (
    e.message.indexOf("Cannot find module") !== -1 &&
    e.message.indexOf(".vue") !== -1
  ) {
    console.error(e.message)
    console.error("1. 排查组件名称拼写是否正确")
    console.error(
      "2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"
    )
    console.error(
      "3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件"
    )
  } else {
    throw e
  }
}
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  var l1 =
    _vm.isReady && !_vm.commentLoading && !(_vm.commentTotalCount === 0)
      ? _vm.__map(_vm.commentTreeData, function (comment, __i0__) {
          var $orig = _vm.__get_orig(comment)
          var m0 = _vm.getCommentAvatar(comment)
          var m1 = !comment.isDeleted ? _vm.getCommentLikeColor(comment) : null
          var g0 = comment.replies.length
          var l0 =
            g0 > 0
              ? _vm.__map(comment.replies, function (reply, __i1__) {
                  var $orig = _vm.__get_orig(reply)
                  var m2 = _vm.getCommentAvatar(reply)
                  var m3 = !reply.isDeleted
                    ? _vm.getCommentLikeColor(reply)
                    : null
                  return {
                    $orig: $orig,
                    m2: m2,
                    m3: m3,
                  }
                })
              : null
          return {
            $orig: $orig,
            m0: m0,
            m1: m1,
            g0: g0,
            l0: l0,
          }
        })
      : null
  _vm.$mp.data = Object.assign(
    {},
    {
      $root: {
        l1: l1,
      },
    }
  )
}
var recyclableRender = false
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 99:
/*!**********************************************************************************************************!*\
  !*** D:/project/Zhiyun-Yi-Lacquer/subcontentpkg/hottopic/article0/article0.vue?vue&type=script&lang=js& ***!
  \**********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_article0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../editor/editTools/HBuilderX/plugins/uniapp-cli/node_modules/babel-loader/lib!../../../../../editor/editTools/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!../../../../../editor/editTools/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!../../../../../editor/editTools/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../editor/editTools/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./article0.vue?vue&type=script&lang=js& */ 100);
/* harmony import */ var _editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_article0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_article0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_article0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_article0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_editor_editTools_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_article0_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ })

},[[95,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/subcontentpkg/hottopic/article0/article0.js.map