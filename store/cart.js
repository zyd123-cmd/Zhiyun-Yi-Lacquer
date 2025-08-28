export default {
  // 为当前模块开启命名空间
  namespaced: true,

  // 模块的 state 数据
  state: () => ({
    cart: JSON.parse(uni.getStorageSync('cart') || '[]'),//文章收藏的
    handup: JSON.parse(uni.getStorageSync('handup') || '[]'),//文章点赞的
     storycart: JSON.parse(uni.getStorageSync('storycart') || '[]'),//视频收藏的
    storyhandup: JSON.parse(uni.getStorageSync('storyhandup') || '[]'),//点赞的
  }),

  // 模块的 mutations 方法
  mutations: {
    //保存文字收藏到本地
    saveToStorage(state) {
      uni.setStorageSync('cart', JSON.stringify(state.cart))
    },
    //保存文章点赞到本地
    saveToHandup(state) {
      uni.setStorageSync('handup', JSON.stringify(state.handup))
    },
    //保存视频点赞到本地
    saveTostoryhandup(state) {
      uni.setStorageSync('storyhandup', JSON.stringify(state. storyhandup))
    },
    //保存视频收藏到本地
    saveTostorycartStorage(state) {
      uni.setStorageSync('storycart', JSON.stringify(state.storycart))
    },
    //添加文章收藏赞到本地
    addToCart(state, content) {
      // 根据提交的Id，查询购物车中是否存在这件
      // 如果不存在，则 findResult 为 undefined；否则，为查找到的商品信息对象
      const findResult = state.cart.find((x) => x.id === content.id)

      if (!findResult) {
        console.log("没有这篇文章现在加入")
        // 如果购物车中没有这件商品，则直接 push
        state.cart.push(content)
      } else {
        state.cart = state.cart.filter(item => item.id !== content.id);
        console.log("已经收藏过了，从收藏列表中移除");
      }
      // 通过 commit 方法，调用 m_cart 命名空间下的 saveToStorage 方法
      this.commit('m_cart/saveToStorage')
    },
    //添加文章点赞赞到本地
    addToHandup(state, handid) {
      // 根据提交的Id，查询购物车中是否存在这件
      // 如果不存在，则 findResult 为 undefined；否则，为查找到的商品信息对象
      const findResult = state.handup.find((x) => x.id === handid.id)

      if (!findResult) {
        console.log("没有点赞这篇文章现在加入")
        // 如果购物车中没有这件商品，则直接 push
        state.handup.push(handid)
      } else {
        state.handup = state.handup.filter(item => item.id !== handid.id);
        console.log("已经点赞过了，从点赞列表中移除");
      }
      // 通过 commit 方法，调用 m_cart 命名空间下的 saveToStorage 方法
      this.commit('m_cart/saveTostoryhandup')
    },
   //添加视频点赞赞到本地
    addTostoryhandup(state, handid) {
      // 根据提交的Id，查询购物车中是否存在这件
      // 如果不存在，则 findResult 为 undefined；否则，为查找到的商品信息对象
      const findResult = state.storyhandup.find((x) => x.id === handid.id)
    
      if (!findResult) {
        console.log("没有点赞这个视频现在加入")
        // 如果购物车中没有这件商品，则直接 push
        state.storyhandup.push(handid)
      } else {
        state.storyhandup = state.storyhandup.filter(item => item.id !== handid.id);
        console.log("已经点赞过了这个视频，从点赞列表中移除");
      }
      // 通过 commit 方法，调用 m_cart 命名空间下的 saveToStorage 方法
      this.commit('m_cart/saveTostoryhandup')
    },
 //添加视频收藏赞到本地
 addTostoryCart(state, content) {
   // 根据提交的Id，查询购物车中是否存在这件
   // 如果不存在，则 findResult 为 undefined；否则，为查找到的商品信息对象
   const findResult = state.storycart.find((x) => x.id === content.id)
 
   if (!findResult) {
     console.log("没有这个视频现在加入")
     // 如果购物车中没有这件商品，则直接 push
     state.storycart.push(content)
   } else {
     state.storycart = state.storycart.filter(item => item.id !== content.id);
     console.log("已经收藏过了这个视频，从收藏列表中移除");
   }
   // 通过 commit 方法，调用 m_cart 命名空间下的 saveToStorage 方法
   this.commit('m_cart/saveTostorycartStorage')
 },

  },

  // 模块的 getters 属性
  getters: {},
}