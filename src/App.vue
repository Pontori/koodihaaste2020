<template>
	<v-app>
		<v-app-bar app color="primary" dark>
			<div class="d-flex align-center">
				<router-link to="/" v-slot="{ href, route, navigate }">
					<v-toolbar-title @click="navigate" style="cursor: pointer;"
						>Pontsun reittiopas</v-toolbar-title
					>
				</router-link>
			</div>

			<v-spacer></v-spacer>

			<router-link to="/about" v-slot="{ href, route, navigate }"
				><span @click="navigate" style="cursor: pointer;">
					?</span
				></router-link
			>
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
