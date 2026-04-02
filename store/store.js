import Vue from 'vue'
import Vuex from 'vuex'
import articleModule from './article.js'
import userModule from './user.js'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    m_article: articleModule,
    m_user: userModule,
  },
})

export default store
