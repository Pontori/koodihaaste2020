<template>
	<v-row>
		<!-- sikahieno tausta -->
		<iframe
			width="100%"
			height="100%"
			frameborder="0"
			scrolling="no"
			marginheight="0"
			marginwidth="0"
			src="https://www.openstreetmap.org/export/embed.html?bbox=23.750209808349613%2C61.49457700282331%2C23.77123832702637%2C61.5009049888985&amp;layer=mapnik"
			style="border:0;position:fixed;pointer-events:none;transform: scale(1.1);"
		></iframe>

		<v-col sm="12" md="6" lg="4" xl="3">
			<v-card class="mx-5 my-5" style="">
				<v-card-title
					class="headline font-weight-regular primary white--text"
				>
					Reittihaku
				</v-card-title>
				<v-card-text class="mt-5">
					<v-autocomplete
						v-model="origin"
						:items="routesData.pysakit"
						:label="`Mistä?`"
						prepend-icon="mdi-map-marker-outline"
					></v-autocomplete>
					<v-btn icon @click="swapOriginAndDestination()">
						<v-icon>mdi-swap-vertical-variant</v-icon>
					</v-btn>
					<v-autocomplete
						v-model="destination"
						:items="routesData.pysakit"
						:label="`Mihin?`"
						prepend-icon="mdi-map-marker-outline"
					></v-autocomplete>
				</v-card-text>
				<v-card-text
					class="py-0"
					v-if="generatedRouteInfo && generatedRouteInfo.finalRoute"
				>
					<v-timeline align-top dense>
						<v-timeline-item
							v-for="l in generatedRouteInfo.finalRoute"
							:key="l.node"
							fill-dot
							:color="
								`${l.displayColor}${
									l.type == 'idle' ? ' lighten-4' : ''
								}`
							"
							:small="l.type == 'idle'"
						>
							<template v-slot:icon>
								<span style="color:#000;">{{ l.node }}</span>
							</template>
							<div>
								<strong v-if="l.type == 'start'">
									Hyppää kyytiin linjalle {{ l.line }} pysäkillä
									{{ l.node }}
								</strong>
								<strong v-if="l.type == 'switch'">
									Vaihto linjalle {{ l.line }} pysäkillä
									{{ l.node }}
								</strong>
								<strong v-if="l.type == 'end'">
									Pois kyydistä pysäkillä {{ l.node }}
								</strong>
								<br v-if="l.type != 'idle'" />
								<small v-if="l.type != 'start'">
									Kokonaismatka-aika: {{ l.cumulativeTime }} min
								</small>
							</div>
						</v-timeline-item>
					</v-timeline>
				</v-card-text>
			</v-card>
		</v-col>
	</v-row>
</template>

<script>
import json from "../../reittiopas.json";
import _ from "lodash";
export default {
	data() {
		return {
			routesData: json,
			origin: null,
			destination: null,
			lineColors: {
				keltainen: "yellow",
				punainen: "red",
				sininen: "blue",
				vihreä: "green"
			}
		};
	},
	computed: {
		generatedRouteInfo() {
			if (this.origin && this.destination) {
				const route = this.getRoute(this.origin, this.destination);
				const routeLines = this.getRouteLines(route.route);

				let cumulativeTime = 0;
				let lastNode = null;

				const finalRoute = route.route.map((l, i) => {
					let road = this.routesData.tiet
						.filter(
							t =>
								(t.mista == lastNode && t.mihin == l) ||
								(t.mihin == lastNode && t.mista == l)
						)
						.shift();

					if (road) {
						cumulativeTime += road.kesto;
					}

					let obj = {
						node: l,
						line: routeLines[l],
						displayColor: this.lineColors[routeLines[l]],
						road: road,
						cumulativeTime
					};

					if (i < route.route.length) {
						let nextRouteLine = routeLines[route.route[i + 1]];
						if (nextRouteLine && routeLines[l] != nextRouteLine) {
							obj.type = "switch";
							obj.line = nextRouteLine;
							obj.displayColor = this.lineColors[nextRouteLine];
						}
					}

					if (i == 0) {
						obj.type = "start";
					} else if (i == route.route.length - 1) {
						obj.type = "end";
					} else if (!obj.type) {
						obj.type = "idle";
					}
					lastNode = l;
					return obj;
				});

				return {
					finalRoute
				};
			}
			return null;
		}
	},
	methods: {
		swapOriginAndDestination() {
			let temp = this.origin;
			this.origin = this.destination;
			this.destination = temp;
		},
		nodeLines(node) {
			const lines = this.routesData.lines;
			return Object.keys(lines).reduce((nodeLines, line) => {
				if (lines[line].indexOf(node) >= 0) {
					nodeLines.push(line);
				}
				return nodeLines;
			}, []);
		},
		nodeNeighbours(node) {
			return this.routesData.tiet.filter(
				t => t.mista == node || t.mihin == node
			);
		},
		getRoute(from, to) {
			// https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm
			let nodesCost = {};
			let nodesPrevious = {};

			this.routesData.pysakit.forEach(p => {
				if (p == from) {
					nodesCost[p] = 0;
				} else {
					nodesCost[p] = Infinity;
				}
				nodesPrevious[p] = null;
			});

			let visitedNodes = [];
			let unvisitedNodes = [...this.routesData.pysakit];

			while (unvisitedNodes.length > 0) {
				unvisitedNodes = unvisitedNodes.sort(
					(a, b) => nodesCost[b] - nodesCost[a]
				);

				let currentNode = unvisitedNodes.pop();
				visitedNodes.push(currentNode);

				if (currentNode == to) {
					let minutes = nodesCost[currentNode];

					let finalPath = [];
					while (currentNode != from) {
						finalPath.push(currentNode);
						currentNode = nodesPrevious[currentNode];
					}
					finalPath.push(from);

					return {
						route: finalPath.reverse(),
						minutes: minutes
					};
				}

				this.nodeNeighbours(currentNode).forEach(nv => {
					let nextNode = nv.mista;
					if (nextNode == currentNode) {
						nextNode = nv.mihin;
					}

					if (visitedNodes.indexOf(nextNode) >= 0) {
						return;
					}

					let alt = nodesCost[currentNode] + nv.kesto;
					if (alt < nodesCost[nextNode]) {
						nodesCost[nextNode] = alt;
						nodesPrevious[nextNode] = currentNode;
					}
				});
			}

			return null;
		},
		getRouteLines(route) {
			let routeLines = {};

			route.forEach((n, i) => {
				if (!routeLines[n]) {
					let lastIndex = route.length;

					let getIntersectingLines = (route, startIndex, endIndex) => {
						let arrays = [];
						for (let index = startIndex; index < endIndex; index++) {
							arrays.push(this.nodeLines(route[index]));
						}
						let intersection = _.intersection(...arrays);
						return intersection;
					};

					let intersection = null;

					do {
						intersection = getIntersectingLines(route, i, lastIndex);
						if (intersection.length >= 0) {
							for (let ii = i; ii < lastIndex; ii++) {
								const node = route[ii];
								routeLines[node] = intersection[0];
							}
						}
						lastIndex = lastIndex - 1;
					} while (intersection.length == 0);
				}
			});

			return routeLines;
		}
	}
};
</script>
