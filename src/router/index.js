import Vue from "vue";
import VueRouter from "vue-router";
import RoutePlanner from "../views/RoutePlanner.vue";
import About from "../views/About.vue";

Vue.use(VueRouter);

const routes = [
	{
		path: "/",
		name: "Home",
		component: RoutePlanner
	},
	{
		path: "/about",
		name: "About",
		component: About
	}
];

const router = new VueRouter({
	mode: "history",
	base: process.env.BASE_URL,
	routes
});

export default router;
