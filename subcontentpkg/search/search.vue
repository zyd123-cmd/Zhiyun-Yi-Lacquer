<template>
  <view class="mainview">
    <view class="search-box">
      <!-- 使用 uni-ui 提供的搜索组件 -->
      <uni-search-bar @input="input" :radius="100" cancelButton="none"></uni-search-bar>
    </view>
      <!-- 搜索结果显示 -->
    <view class="sugg-list" v-if="searchResults.length !== 0">
      <view class="sugg-item" v-for="(item) in searchResults" :key=" item._id" @click="gotoDetail(item)">
        <view class="goods-name">{{item.title}}</view>
        <uni-icons type="arrowright" size="16"></uni-icons>
      </view>
    </view>
    <!-- 搜索历史 -->
    <view class="history-box" v-else>
      <!-- 标题区域 -->
      <view class="history-title">
        <text>搜索历史</text>
        <uni-icons type="trash" size="17" @click="cleanHistory"></uni-icons>
      </view>
      <!-- 列表区域 -->
    <view class="history-list">
      <uni-tag :text="item" v-for="(item, i) in historys" :key="i"></uni-tag>
    </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        timer: null,
        kw: '',
        searchResults: [],
        historyList: [],

      };
    },
    computed: {
      historys() {
        // 注意：由于数组是引用类型，所以不要直接基于原数组调用 reverse 方法，以免修改原数组中元素的顺序
        // 而是应该新建一个内存无关的数组，再进行 reverse 反转
        return [...this.historyList].reverse()
      }
    },
    onLoad() {
      this.historyList = JSON.parse(uni.getStorageSync('kw') || '[]')
    },
    methods: {
      input(e) {
        // 清除 timer 对应的延时器
        console.log(e),
          clearTimeout(this.timer)
        // 重新启动一个延时器，并把 timerId 赋值给 this.timer
        this.timer = setTimeout(() => {
          // 如果 500 毫秒内，没有触发新的输入事件，则为搜索关键词赋值
          this.kw = e
          console.log(this.kw)
          this.getSearchList()
        }, 500)
      },
      // 根据搜索关键词，搜索商品建议列表
      async getSearchList() {
        console.log(this.kw)
        // 判断关键词是否为空
        if (this.kw === '') {
          this.searchResults = []
          return
        }
        this.saveSearchHistory(),
        this.SearchDatabase()
      },
      SearchDatabase() {
        // 输出当前搜索关键词
        console.log(this.kw);

        // 获取云数据库的引用
        const db = wx.cloud.database();

        // 创建一个正则表达式，用于匹配不区分大小写的搜索关键词
        const regex = new RegExp(this.kw, 'i');

        // 定义要搜索的集合名称数组
        const collections = ['model'];

        // 初始化搜索结果数组
        let searchResults = [];

        // 初始化一个计数器，用于跟踪已经完成的查询数量
        let completedQueries = 0;

        // 对每个集合执行查询操作
        collections.forEach(collectionName => {
          // 从云数据库中获取指定集合的引用
          const query = db.collection(collectionName).where({
            $or: [
              // 在 'title' 字段中匹配正则表达式
              {
                title: regex
              },
              // 在 'article' 字段中匹配正则表达式
              {
                article: regex
              }
            ]
          });

          // 执行查询，并处理查询结果
          query.get({
            success: (res) => {
              // 将当前集合的查询结果添加到搜索结果数组中
              searchResults = searchResults.concat(res.data);
              // 增加已完成的查询计数
              completedQueries += 1;
              // 输出当前集合的查询结果
              console.log(`Results from ${collectionName}:`, res.data);

              // 检查是否所有集合的查询都已成功完成
              if (completedQueries === collections.length) {
                // 所有查询都完成后，将搜索结果数组赋值给组件的 searchResults 属性
                this.searchResults = searchResults;
                // 输出最终的搜索结果
                console.log('All collections searched, updated searchResults:', this.searchResults);
              }
            },
            // 处理查询失败的情况
            fail: (err) => {
              // 输出错误信息
              console.error(`SearchDatabase error in ${collectionName}:`, err);
            }
          });
        });
      },
     // 跳转函数
// 跳转函数
gotoDetail(item) {
  if (item && typeof item === 'object' && item.pagesrc) {
    uni.navigateTo({
      // 指定详情页面的 URL 地址，
      url: item.pagesrc
    });
  } else {
    console.error('Invalid item or item.pagesrc is missing:', item);
  }
},
// 保存搜索关键词为历史记录
saveSearchHistory() {
  // this.historyList.push(this.kw)

  // 1. 将 Array 数组转化为 Set 对象
  const set = new Set(this.historyList)
  // 2. 调用 Set 对象的 delete 方法，移除对应的元素
  set.delete(this.kw)
  // 3. 调用 Set 对象的 add 方法，向 Set 中添加元素
  set.add(this.kw)
  // 4. 将 Set 对象转化为 Array 数组
  this.historyList = Array.from(set)
    uni.setStorageSync('kw', JSON.stringify(this.historyList))
},
// 清空搜索历史记录
cleanHistory() {
  // 清空 data 中保存的搜索历史
  this.historyList = []
  // 清空本地存储中记录的搜索历史
  uni.setStorageSync('kw', '[]')
},
  }
  }
</script>

<style>
  /* 搜索栏 */
  .search-box {
    position: sticky;
    top: 0;
    z-index: 999;
  }

  /* 搜索数据 */
  .sugg-list {
    padding: 0 5px;
  }

  .sugg-item {
    font-size: 12px;
    padding: 13px 0;
    border-bottom: 1px solid #efefef;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .goods-name {
    // 文字不允许换行（单行文本）
    white-space: nowrap;
    // 溢出部分隐藏
    overflow: hidden;
    // 文本溢出后，使用 ... 代替
    text-overflow: ellipsis;
    margin-right: 3px;
  }
  /* 搜索历史 */
  .history-box {
    padding: 0 5px;
  }
  .history-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    font-size: 13px;
    border-bottom: 1px solid #efefef;
  }
  .history-list {
    display: flex;
    flex-wrap: wrap;
  }
  .uni-tag {
    margin-top: 5px;
    margin-right: 5px;
  }
</style>