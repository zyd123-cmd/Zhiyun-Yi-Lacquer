<template>
  <view class="mainview" v-if="isDataLoaded">
	  <!-- ai组件 -->
<!-- 	 <aifunction></aifunction> -->
    <!-- 使用自定义的搜索组件 -->
    <my-search :radius="15" :bgcolor="'#e60527'" @click="gotoSearch"></my-search>
    <!-- 轮播图 -->
    <swiper :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000" :circular="true" class="banner">
      <swiper-item v-if="swipertab && swipertab.length > 0" v-for="(item, index) in swipertab" :key="index">
        <navigator :url="item.pagesrc" class="nbanner">
          <image :src="item.imagesrc" class="swiper-item-image"></image>
        </navigator>
      </swiper-item>
    </swiper>
    <!-- 导航栏 -->
    <view class="nav-list">
      <navigator class="nav-item" v-for="(item,index) in navlist" :key="item._id" :url="item.pagesrc">
        <image class="nav-item-image" :src="item.imagesrc"></image>
        <text class="nav-item-text">{{item.text}}</text>
      </navigator>
    </view>
    <!-- 滑动栏 -->
    <view class="scrollable-tabs">
      <scroll-view scroll-x="true" class="scroll-view">
        <view class="tab" v-for="(item, index) in tabs" :key="index" @click="clickTab(index)"
          :class="{ 'active': index === activeTab }">
          <view class="tab-icon-text">
            <text class="tabtext">{{ item }}</text>
            <image
              src="https://7a68-zhiyunyiqi-6gubyp7bd3a2e4ff-1327529386.tcb.qcloud.la/%E6%BB%91%E5%8A%A8%E6%A0%8F/%E6%BB%91%E5%8A%A8%E6%9D%A1.png?sign=c177ec65501e3b696fbe9cc22164d8e1&t=1721637168"
              class="tab-icon" v-show="index === activeTab"></image>
          </view>
        </view>
      </scroll-view>
    </view>
    <!-- 内容显示区域 -->
    <view class="content">
      <view v-for="(item, index) in tabs" :key="index" v-show="index === activeTab">
        <!-- 这里可以根据实际内容来定义每个视图的结构 -->
        <!-- 热点话题 -->
        <view v-if="index === 0">
          <!-- 热点话题 -->
          <navigator class="content-item" v-for="(item,index) in hottopic" :key="index" :url="item.pagesrc">
            <image class="content-image" :src="item.imagesrc" mode="aspectFill">
            </image>
            <text class="content-text">{{item.title}}</text>
          </navigator>
          <navigator class="moree" url="/subcontentpkg/sumcontent/sumcontent">
            <text class="more">查看更多</text>
          </navigator>
        </view>
        <view v-if="index === 1">
          <!-- 最新资讯 1-->
          <navigator class="content-item" v-for="(item,index) in information" :key="index" :url="item.pagesrc">
            <image class="content-image" :src="item.imagesrc" mode="aspectFill">
            </image>
            <text class="content-text">{{item.title}}</text>
          </navigator>
          <navigator class="moree" url="/subcontentpkg/sumcontent/sumcontent">
            <text class="more">查看更多</text>
          </navigator>
        </view>
        <view v-if="index === 2">    <!-- 精品推荐1-->
          <navigator class="content-item" v-for="(item,index) in recommend" :key="index" :url="item.pagesrc">
            <image class="content-image" :src="item.imagesrc" mode="aspectFill">
            </image>
            <text class="content-text">{{item.title}}</text>
          </navigator>
          <navigator class="moree" url="/subcontentpkg/sumcontent/sumcontent">
            <text class="more">查看更多</text>
          </navigator></view>
        <view v-if="index === 3">
          <!-- 活动公共 -->
<navigator class="content-item" v-for="(item,index) in announcement" :key="index" :url="item.pagesrc">
            <image class="content-image" :src="item.imagesrc" mode="aspectFill">
            </image>
            <text class="content-text">{{item.title}}</text>
          </navigator>
          <navigator class="moree" url="/subcontentpkg/sumcontent/sumcontent">
            <text class="more">查看更多</text>
          </navigator>
        </view>
        
      </view>
    </view>
  </view>
</template>


<script>
  import {
    mapMutations,
    mapState
  } from 'vuex'
  export default {
    computed: {
      // 调用 mapState 方法，把 m_cart 模块中的 cart 数组映射到当前页面中，作为计算属性来使用
      // ...mapState('模块的名称', ['要映射的数据名称1', '要映射的数据名称2'])
      ...mapState('m_user', ['userid',"Tank"]),
    
    },
    data() {
      return {
        title: 'Hello',
        tabs: [
          '精美彝漆',
          'A I彝漆',
          '精品推荐',
          '活动公告',
         
        ],
        activeTab: 0, // 当前激活的标签索引
        hottopic: [],
        information: [],
        swipertab: [],
        recommend:[],
        navlist: [{
            pagesrc: '/subpkg/3djs/3djs',
            imagesrc: '/static/导航图/3D展示.png',
            text: '3D展示'
            
          },
          {
            pagesrc: '/subpkg/arsum/arsum',
            imagesrc: '/static/导航图/AR识别.png',
            text: 'AR识别',
          },
          {
            pagesrc: '/subcontentpkg/sumcontent/sumcontent',
            imagesrc: '/static/导航图/图像.png',
            text: '漆器图像',
          },
          {
            pagesrc: '/subcontentpkg/officle/officle',
            imagesrc: '/static/导航图/官方动态 .png',
            text: '官方动态',
          },
        ],
        isDataLoaded: false,
        announcement:[{
          imagesrc:"/static/导航图/3D展示.png",
          title:"彝族漆器3D模型在线展示功能上线。",
          pagesrc:"/subpkg/3djs/3djs"
        },
        {
          imagesrc:"/static/导航图/AR识别.png",
          title:"彝族漆器3D模型AR平面识别功能上线，为获最佳体验，请在开放、光线充足的场所操作。",
          pagesrc:"/subpkg/arsum/arsum"
        },
        ]
      }
    },

    onLoad() {
      this.getData();
      console.log("判断登录");
      this.judglogin()
    },

    methods: {
        ...mapMutations('m_user', ['updateTank']),
      // 判断登录
      judglogin(){
        console.log("judglogin开始启动userid是");
        console.log(this.userid);
        wx.cloud.callFunction({
          name:"judglogin",
          data:{
            id:this.userid,
          }
        }).then(res=>{
          console.log("判断登录的返回值为",res.result);
          this.updateTank(res.result);
        })
      },
      clickTab(index) {
        this.activeTab = index; // 更新当前激活的标签
      },
      gotoSearch() {
        uni.navigateTo({
          url: '/subcontentpkg/search/search'
        })
      },
    async getSwiper() {
        const db = wx.cloud.database();
        const res = await db.collection('swiper')
          .field({
            _id: true,
            imagesrc: true,
            pagesrc: true
          })
          .orderBy('_id', 'asc')
          .get();
        this.swipertab = res.data;
        console.log("轮播图获取成功");
      },
      async getHottopic() {
        const db = wx.cloud.database();
        const res = await db.collection('model')
          .field({
            _id: true,
            title: true,
            imagesrc: true,
            pagesrc: true
          })
          .where({
            type: 'index1'
          })
          .orderBy('_id', 'asc')
          .limit(3)
          .get();
        this.hottopic = res.data;
        console.log("热点话题获取成功");
      },
      async getInformation() {
        const db = wx.cloud.database();
        const res = await db.collection('model')
          .field({
            _id: true,
            title: true,
            imagesrc: true,
            pagesrc: true
          })
          .where({
            type: 'index2'
          })
          .orderBy('_id', 'asc')
          .limit(3)
          .get();
        this.information = res.data;
        console.log("最新资讯获取成功");
      },
      async getrecommend() {
        const db = wx.cloud.database();
        const res = await db.collection('model')
          .field({
            _id: true,
            title: true,
            imagesrc: true,
            pagesrc: true
          })
          .where({
            type: 'index3'
          })
          .orderBy('_id', 'asc')
          .limit(3)
          .get();
        this.recommend = res.data;
        console.log("最新资讯获取成功");
      },
      async getData() {
        uni.showLoading({
          title: "加载中",
        });
        try {
          // 使用 await 等待所有数据获取方法完成
          await Promise.all([
            this.getSwiper(),
            this.getHottopic(),
            this.getInformation(),
            this.getrecommend()
          ]);
          // 所有数据加载完成后隐藏加载提示
          uni.hideLoading();
          // 标记数据加载完成
          this.isDataLoaded = true;
          console.log("都加载玩了");
        } catch (err) {
          // 如果有错误发生，隐藏加载提示并处理错误
          uni.hideLoading();
          console.error('数据加载失败:', err);
        }
      }

    }
  }
</script>

<style scoped>
  /* 轮播图样式 */
  .banner {
    width: 100%;
    /* 确保轮播图宽度为100% */
    height: 400rpx;
    /* 根据需要设置高度 */
  }

  .nbanner {
    width: 100%;
    /* 确保轮播图宽度为100% */
    height: 400rpx;
  }

  .swiper-item-image {
    width: 100%;
    /* 确保图片宽度填满容器 */
    height: 100%;
    /* 确保图片高度填满容器 */
    display: block;
    /* 确保图片填满容器并且没有额外的空间 */
  }

  /* 导航栏样式 */
  .nav-list {
    display: flex;
    /* 水平排列其子元素 */
    flex-wrap: wrap;
    /* 如果需要，允许子元素换行 */
    justify-content: space-around;
    /* 根据需要调整水平间距 */
    background-color: ghostwhite;
    border-radius: 30px;
    margin-top: 10rpx;
    margin-bottom: 10rpx;
  }

  .nav-item {
    display: flex;
    /* 确保nav-item也是一个Flexbox容器 */
    flex-direction: column;
    /* 子元素垂直排列 */
    align-items: center;
    /* 中心对齐子元素 */
    margin: 15rpx;
    /* 根据需要设置外边距 */
  }

  .nav-item-image {
    width: 100rpx;
    height: 100rpx;
  }

  .nav-item-text {
    white-space: nowrap;
    /* 防止文本换行 */
    overflow: hidden;
    /* 如果文本溢出，则隐藏溢出部分 */
    text-overflow: ellipsis;
    /* 文本溢出时显示省略号 */
    font-size: 20rpx;
  }

  /* tab滑动栏样式 */
  .scrollable-tabs {
    width: 100%;
    overflow: hidden;
    /* 隐藏溢出的内容 */
  }

  .scroll-view {
    white-space: nowrap;
    /* 防止内容自动换行 */
    /* 确保没有其他样式影响布局 */
    display: flex;
    flex-direction: row;
    /* 明确设置flex方向为水平 */
  }

  .tab {
    display: inline-block;
    /* 子元素水平排列 */
    padding: 20rpx 40rpx;
    /* 设置内边距 */
    /* border: 1px solid #ddd; */
    /* 添加边框，根据需要调整样式 */
    margin-right: 10rpx;
    /* 设置右边距，确保标签之间有一定的间隔 */
    transition: color 0.3s;
    /* 平滑过渡颜色变化 */
  }

  .tabtext {
    font-weight: bold;
  }

  .tab.active {
    color: #e60527;
    /* 激活标签的文字颜色 */
  }

  .tab-icon-text {
    display: grid;
    justify-content: space-around;
    align-items: center;
  }

  .tab-icon {
    height: 10rpx;
    width: 100%;
  }

  /* 内容样式 */
  .content {
    padding: 20rpx;
    border: 2px solid ghostwhite;
    /* 添加黑色边框 */

  }

  .content-item {
    margin-bottom: 2rpx;
  }

  .content-image {
    width: 200rpx;
    height: 200rpx;
    border-radius: 20rpx;
    margin-right: 10rpx;
    /* 添加图片和文字之间的间距 */
    /* 新增以下样式确保图片不会被挤压变形 */
    min-width: 200rpx;
    min-height: 200rpx;
    flex-shrink: 0;
    /* 防止图片在flex容器缩放时被挤压 */
  }

  .content-item {
    display: flex;
    /* 使用 Flexbox 布局 */
    align-items: flex-start;
    /* 将align-items设置为flex-start，防止文字挤压图片 */
    border: 1px solid ghostwhite;
    /* 添加灰色边框 */
    padding: 10rpx;
    /* 添加一些内边距 */
    border-radius: 5rpx;
    /* 如果需要，添加圆角 */
    /* 可以考虑设置flex-wrap: wrap; 来处理文字过多的情况 */
    flex-wrap: wrap;
  }

  /* 确保.content-text在flex容器中可以灵活布局 */
  .content-text {
    font-weight: 500;
    /* 加粗文字 */
    font-size: 30rpx;
    margin-top: 0rpx;
    margin-left: 0rpx;
    /* 调整左边距 */
    flex: 1;
    /* 允许text扩展以填满可用空间 */
  }

  .moree {
    display: flex;
    justify-content: center;
    /* 水平居中 */
    align-items: center;
    /* 垂直居中 */
  }

  .more {

    color: gray;
    /* 文字颜色设置为灰色 */
    font-size: 12px;
    /* 文字大小设置为12像素 */
  }
</style>