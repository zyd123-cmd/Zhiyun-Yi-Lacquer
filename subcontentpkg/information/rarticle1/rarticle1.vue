<template>
  <view class="article-container" v-if="isDataLoaded">
	  <!-- ai组件 -->
	 <aifunction></aifunction>
    <view class="article-header">
      <text class="article-title">{{information.title}}</text>
      <text class="article-source">{{information.author}}</text>
    </view>
 <view class="article-content">
    <view v-for="(item, index) in alternatedContent" :key="index">
      <text class="article-content-text" v-if="item.type === 'text'">{{ item.content }}</text>
      <view class="article-imageview" v-else>
        <image :src="item.imageSrc" class="article-image" mode="widthFix" @click="dealimage" :data-index="index"></image>
      </view>
    </view>
  </view>
    <!-- 依次添加其他段落 -->
    <view class="example-body"
      style="display: flex; align-items: center; justify-content: flex-end; margin-right: 20rpx;margin-top: 20rpx;margin-bottom: 20rpx;">
      <view class="fav-btn-container" style="margin: 0 20rpx;">
        <uni-fav :checked="collection" style="size: 100rpx;" class="favBtn" @click="oncontent"
          bg-color-checked="#dd524d" />
      </view>
      <view class="handup-container" @click="onhand">
        <uni-icons type="hand-up-filled" size="30rpx" :color="handupcolor" />
        <text style="font-size: 24rpx; margin-left: 10rpx; color: #666666; text-align: center;">
          点赞{{displayHandup}}
        </text>
      </view>
    </view>
  </view>

</template>

<script>
  import {
    mapState,
    mapMutations
  } from 'vuex';

  export default {
    computed: {
      // 调用 mapState 方法，把 m_cart 模块中的 cart 数组映射到当前页面中，作为计算属性来使用
      // ...mapState('模块的名称', ['要映射的数据名称1', '要映射的数据名称2'])
      ...mapState('m_cart', ['cart', 'handup']),
      ...mapState('m_user', ['Tank']),
 alternatedContent() {
   const result = [];
   // 获取两个数组的长度
   const contentLength = this.content.length;
   const imageSrcLength = this.imagesrc.length;
 
   // 遍历较长的数组，确保所有元素都被添加
   const maxLength = Math.max(contentLength, imageSrcLength);
   for (let i = 0; i < maxLength; i++) {
     // 如果当前索引在 content 范围内，则添加文本
     if (i < contentLength) {
       result.push({
         type: 'text',
         content: this.content[i]
       });
     }
     // 如果当前索引在 imagesrc 范围内，则添加图片
     if (i < imageSrcLength) {
       result.push({
         type: 'image',
         imageSrc: this.imagesrc[i]
       });
     }
   }
   return result;
 }
    },
    data() {
      return {
        information: [],
        content:[],
        imagesrc:[],
        collection: false, //控制收藏按钮的状态
        handupcolor: "", //控制点赞按钮的状态
        displayHandup: 0, // 初始化显示的点赞数
        isDataLoaded: false, // 数据加载完成，允许显示内容
      }
    },
    onLoad() {
      this.getData();
    },
    methods: {
      // 把 m_cart 模块中的 addToCart 方法映射到当前页面使用
      ...mapMutations('m_cart', ['addToCart', 'addToHandup']),
      scanimage(e) {
           const imagelist = this.information.imagesrc;
          const index = e.currentTarget.dataset.index;
          console.log(e.currentTarget.dataset.index);
          uni.previewImage({
            urls: imagelist,
            current: imagelist[index]
          })
        },
        // 图片查看或者删除
        dealimage(e) {
          wx.showActionSheet({
              itemList: ['查看图片'],
              success: (res) => {
                console.log(res.tapIndex);
                if (res.tapIndex === 0) {
                  console.log("查看图片");
                  this.scanimage(e)
                }
            }
          })
      },
      // 云函数获取数据
      getData() {
        uni.showLoading({
            title: "加载中",
          }),
          wx.cloud.callFunction({
            name: "getimage",
            data: {
              id: "ef45322e6724d1fd11e5c5c366e49e79"
            }
          }).then(res => {
            this.information = res.result.data;
            this.content=res.result.data.content;
            this.imagesrc=res.result.data.imagesrc;
            console.log(res);
            this.displayHandup = this.information.handup;
            this.onhandcolor();
            this.setFavButtonState();
            this.isDataLoaded = true;
            uni.hideLoading();
          })
      },
      pushhandcolor(color) {
        wx.cloud.callFunction({
          name: "addHandup",
          data: {
            id: this.information._id,
            handupcolor: color,
          }
        }).then(res => {
          console.log("点赞后的数据为")
          console.log(res)
        })
        this.isDataLoaded = true; // 数据加载完成，允许显示内容
      },
      isItemInCart(informationId) {
        // 使用 some 方法来检查数组中是否至少有一个元素的 id 字段与 informationId 相等
        return this.cart.some(item => item.id === informationId);
      },
      isItemInHandup(informationId) {
        // 使用 some 方法来检查数组中是否至少有一个元素的 id 字段与 informationId 相等
        return this.handup.some(item => item.id === informationId);
      },
      // 调用此方法来检查当前热门话题的 id 是否在购物车中
      checkIfHotTopicInCart() {
        // 直接使用 this.information._id 作为参数调用修改后的 isItemInCart 方法
        return this.isItemInCart(this.information._id);
      },
      checkIfHotTopicInHandup() {
        // 直接使用 this.information._id 作为参数调用修改后的 isItemInCart 方法
        return this.isItemInHandup(this.information._id);
      },
      favClick() {
        this.collection = !this.collection;
        console.log(this.collection);
        this.$forceUpdate()
      },
      setFavButtonState() {
        if (this.checkIfHotTopicInCart()) {
          this.favClick();
        }
      },
      //收藏提交即按钮变色
      oncontent(e) {
        if (this.Tank) {
          // 定义content
          const content = {
            'id': this.information._id, // 商品的Id
            'imagesrc': this.information.imagesrc, // 商品的名称
            'title': this.information.title, // 商品的价格
            'pagesrc': this.information.pagesrc // 商品的数量
          };
          console.log(content);
          // 3. 通过 this 调用映射过来的 addToCart 方法，把商品信息对象存储到购物车中
          this.favClick();
          this.addToCart(content);
        } else {
          // 显示提示框
          uni.showModal({
            title: '提示',
            content: '请先登录',
            success: function(res) {
              if (res.confirm) {
                // 用户点击了确定
                console.log('用户点击确定');
                uni.reLaunch({
                  url: '/pages/my/my'
                });
              } else if (res.cancel) {
                // 用户点击了取消
                uni.showToast({
                  title: '您取消了登录',
                  icon: 'none',
                  duration: 500 // 持续时间，单位毫秒
                });
                console.log('用户点击取消');
              }
            }
          });

        }
      },
      onhand() {
        if (this.Tank) {
          console.log(this.information._id);
          const handid = {
            'id': this.information._id,
          };
          this.addToHandup(handid);
          this.handupcolor = this.handupcolor === "#666666" ? "#dd524d" : "#666666";
          if (this.handupcolor === "#666666") {
            this.displayHandup--;
          } else if (this.handupcolor === "#dd524d") {
            this.displayHandup++;
          }
          this.pushhandcolor(this.handupcolor);
        } else {
          // 显示提示框
          uni.showModal({
            title: '提示',
            content: '请先登录',
            success: function(res) {
              if (res.confirm) {
                // 用户点击了确定
                console.log('用户点击确定');
                uni.reLaunch({
                  url: '/pages/my/my'
                });
              } else if (res.cancel) {
                // 用户点击了取消
                uni.showToast({
                  title: '您取消了登录',
                  icon: 'none',
                  duration: 500 // 持续时间，单位毫秒
                });
                console.log('用户点击取消');
              }
            }
          });
        }
      },
      //页面加在查看原先是否点赞过
      onhandcolor() {
        if (this.checkIfHotTopicInHandup()) {
          this.handupcolor = "#dd524d";
        } else {
          this.handupcolor = "#666666";
        }
      },
    }
    //点赞提交即按钮变色
  }
</script>
<style>
  /* index.wxss */
  .article-container {
    padding: 20rpx;
  }

  .article-header {
    text-align: center;
    margin-bottom: 20rpx;
    display: grid;
  }

  .article-title {
    font-size: 36rpx;
    font-weight: bold;
  }

  .article-source {
    font-size: 24rpx;
    color: #666;
  }

  .article-content {
    font-size: 28rpx;
    line-height: 1.6;
  }

  .article-imageview {
    margin-top: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>