<template>
	<v-app>
		<v-app-bar app color="primary" dark>
			<div class="d-flex align-center">
				<v-toolbar-title>Pontsun reittiopas</v-toolbar-title>
			</div>

			<v-spacer></v-spacer>
		</v-app-bar>

		<v-content>
			<v-container fluid class="fill-height">
				<router-view class="fill-height"></router-view>
			</v-container>
		</v-content>
	</v-app>
</template>

<script>
export default {
	name: "App"
};
</script>
