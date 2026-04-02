const FAVORITES_STORAGE_KEY = 'favoriteArticles'
const LIKED_ARTICLES_STORAGE_KEY = 'likedArticles'

export default {
  namespaced: true,

  state: () => ({
    favoriteArticles: JSON.parse(uni.getStorageSync(FAVORITES_STORAGE_KEY) || '[]'),
    likedArticles: JSON.parse(uni.getStorageSync(LIKED_ARTICLES_STORAGE_KEY) || '[]'),
  }),

  mutations: {
    persistFavorites(state) {
      uni.setStorageSync(FAVORITES_STORAGE_KEY, JSON.stringify(state.favoriteArticles))
    },
    persistLikedArticles(state) {
      uni.setStorageSync(LIKED_ARTICLES_STORAGE_KEY, JSON.stringify(state.likedArticles))
    },
    toggleFavoriteArticle(state, article) {
      const exists = state.favoriteArticles.some((item) => item.id === article.id)
      state.favoriteArticles = exists
        ? state.favoriteArticles.filter((item) => item.id !== article.id)
        : [...state.favoriteArticles, article]

      this.commit('m_article/persistFavorites')
    },
    toggleLikedArticle(state, articleId) {
      const exists = state.likedArticles.some((item) => item.id === articleId.id)
      state.likedArticles = exists
        ? state.likedArticles.filter((item) => item.id !== articleId.id)
        : [...state.likedArticles, articleId]

      this.commit('m_article/persistLikedArticles')
    },
  },
}
