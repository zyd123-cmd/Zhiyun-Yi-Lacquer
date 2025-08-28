<template>
	<view style="display: flex;flex-direction: column;">
		<custom class="custon" :title="title" :url="url" :scale="'0.3 0.3 0.3'"></custom>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				url: "cloud://zhiyunyiqi-6gubyp7bd3a2e4ff.7a68-zhiyunyiqi-6gubyp7bd3a2e4ff-1327529386/3D建模/餐桌/餐桌.glb",
				title: "餐桌 AR平面识别"
			}
		},
		methods: {

		}
	}
</script>

<style>
	page {}
</style>