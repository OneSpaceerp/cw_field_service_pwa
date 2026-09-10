<template>
	<ion-page>
		<ion-header :translucent="true">
			<ion-toolbar class="px-2">
				<ion-buttons slot="start">
					<slot name="start-actions" />
				</ion-buttons>
				<ion-title class="font-bold text-slate-900 text-base">
					<slot name="title">{{ title }}</slot>
				</ion-title>
				<ion-buttons slot="end">
					<slot name="end-actions" />
				</ion-buttons>
			</ion-toolbar>
		</ion-header>

		<ion-content :fullscreen="true" class="ion-padding pb-24">
			<ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
				<ion-refresher-content />
			</ion-refresher>
			<div class="max-w-xl mx-auto py-2">
				<slot />
			</div>
		</ion-content>
	</ion-page>
</template>

<script setup>
import {
	IonPage,
	IonHeader,
	IonToolbar,
	IonTitle,
	IonContent,
	IonButtons,
	IonRefresher,
	IonRefresherContent,
} from "@ionic/vue";

const props = defineProps({
	title: { type: String, default: "" },
	onRefresh: { type: Function, default: null },
});

async function handleRefresh(event) {
	if (props.onRefresh) {
		await props.onRefresh();
	}
	event.target.complete();
}
</script>
