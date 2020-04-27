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
				<v-card-text class="py-0" v-if="generatedRouteInfo">
					<v-timeline align-top dense>
						<v-timeline-item
							v-for="l in generatedRouteInfo"
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
								<span
									style="color:#000;cursor:pointer;"
									@click="showStopInfo(l.node)"
									>{{ l.node }}</span
								>
							</template>
							<div>
								<strong v-if="l.type == 'start'">
									Hyppää kyytiin linjalle
									<v-chip
										x-small
										:color="lineColors[l.line]"
										@click="showLineInfo(l.line)"
										>{{ l.line }}</v-chip
									>
									pysäkillä
									<v-chip
										x-small
										color="primary"
										@click="showStopInfo(l.node)"
										>{{ l.node }}</v-chip
									>
								</strong>
								<strong v-if="l.type == 'switch'">
									Vaihto linjalle
									<v-chip
										x-small
										:color="lineColors[l.line]"
										@click="showLineInfo(l.line)"
										>{{ l.line }}</v-chip
									>
									pysäkillä
									<v-chip
										x-small
										color="primary"
										@click="showStopInfo(l.node)"
										>{{ l.node }}</v-chip
									>
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
		<v-dialog v-model="viewLineInfoModalOpen" scrollable max-width="300px">
			<v-card>
				<v-card-title>Linja {{ viewLineInfo }}</v-card-title>
				<v-card-subtitle>pysähtyy seuraavilla pysäkeillä</v-card-subtitle>
				<v-divider></v-divider>
				<v-card-text style="height: 300px;">
					<v-list>
						<v-list-item
							v-for="stop in routesData.linjastot[viewLineInfo]"
							:key="stop"
						>
							<v-chip
								small
								color="primary"
								@click="showStopInfo(stop)"
								>{{ stop }}</v-chip
							>
							<v-chip
								x-small
								v-for="line in nodeLines(stop)"
								:key="line"
								:color="lineColors[line]"
								@click="showLineInfo(line)"
								class="ml-1"
								>{{ line }}</v-chip
							>
						</v-list-item>
					</v-list>
				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions>
					<v-btn
						color="blue darken-1"
						text
						@click="viewLineInfoModalOpen = false"
					>
						Sulje
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="viewStopInfoModalOpen" scrollable max-width="300px">
			<v-card>
				<v-card-title>Pysäkillä {{ viewStopInfo }}</v-card-title>
				<v-card-subtitle>pysähtyy seuraavat linjat </v-card-subtitle>
				<v-divider></v-divider>
				<v-card-text style="height: 300px;">
					<v-list>
						<v-list-item v-for="line in linesForViewedStop" :key="line">
							<v-chip
								small
								:color="lineColors[line]"
								@click="showLineInfo(line)"
								>{{ line }}</v-chip
							>
						</v-list-item>
					</v-list>
				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions>
					<v-btn
						color="blue darken-1"
						text
						@click="viewStopInfoModalOpen = false"
					>
						Sulje
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
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
			},
			viewLineInfo: null,
			viewLineInfoModalOpen: false,
			viewStopInfo: null,
			viewStopInfoModalOpen: false
		};
	},
	computed: {
		generatedRouteInfo() {
			return this.getRoute(this.origin, this.destination);
		},
		linesForViewedStop() {
			return this.nodeLines(this.viewStopInfo);
		}
	},
	methods: {
		showLineInfo(line) {
			this.viewLineInfo = line;
			this.viewLineInfoModalOpen = true;
			this.viewStopInfoModalOpen = false;
		},
		showStopInfo(stop) {
			this.viewStopInfo = stop;
			this.viewStopInfoModalOpen = true;
			this.viewLineInfoModalOpen = false;
		},
		swapOriginAndDestination() {
			let temp = this.origin;
			this.origin = this.destination;
			this.destination = temp;
		},
		nodeLines(node) {
			const lines = this.routesData.linjastot;
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
		getFastestRoute(from, to) {
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

			// luodaan lopullinen reitti niin, että vaihtoja on mahdollisimman vähän.
			// eli mennään samalla niin kauan kunnes on pakko vaihtaa
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
		},
		getRoute(origin, destination) {
			if (origin && destination) {
				const route = this.getFastestRoute(origin, destination);
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

					let wayPoint = {
						node: l,
						line: routeLines[l],
						displayColor: this.lineColors[routeLines[l]],
						road: road,
						cumulativeTime
					};

					if (i < route.route.length) {
						let nextRouteLine = routeLines[route.route[i + 1]];
						if (nextRouteLine && routeLines[l] != nextRouteLine) {
							wayPoint.type = "switch";
							wayPoint.line = nextRouteLine;
							wayPoint.displayColor = this.lineColors[nextRouteLine];
						}
					}

					if (i == 0) {
						wayPoint.type = "start";
					} else if (i == route.route.length - 1) {
						wayPoint.type = "end";
					} else if (!wayPoint.type) {
						wayPoint.type = "idle";
					}
					lastNode = l;
					return wayPoint;
				});

				return finalRoute;
			}
			return null;
		}
	}
};
</script>
