<template>
	<view class="container">
		<StatusBar background-color="blue" bar-style="light-content" />
		<web-view :source="{uri: 'https://client.dev.polymind.app'}" />
	</view>
</template>

<script>
	import { WebView } from 'react-native-webview';

	export default {
		components: {
			'web-view': WebView
		}
	}
</script>

<style>
	.container {
		background-color: white;
		flex: 1;
	}
</style>
