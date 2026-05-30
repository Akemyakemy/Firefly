<script lang="ts">
import { onMount } from "svelte";
import I18nKey from "@/i18n/i18nKey";
import { i18n } from "@/i18n/translation";

interface Post {
	id: string;
	data: {
		title: string;
		published: Date;
	};
}

export let sortedPosts: Post[] = [];

let container: HTMLElement;
let tooltip: HTMLElement;
let tooltipVisible = false;
let tooltipText = "";
let tooltipX = 0;
let tooltipY = 0;

const days = [
	I18nKey.heatmapSun,
	I18nKey.heatmapMon,
	I18nKey.heatmapTue,
	I18nKey.heatmapWed,
	I18nKey.heatmapThu,
	I18nKey.heatmapFri,
	I18nKey.heatmapSat,
];

const months = [
	I18nKey.heatmapJan,
	I18nKey.heatmapFeb,
	I18nKey.heatmapMar,
	I18nKey.heatmapApr,
	I18nKey.heatmapMay,
	I18nKey.heatmapJun,
	I18nKey.heatmapJul,
	I18nKey.heatmapAug,
	I18nKey.heatmapSep,
	I18nKey.heatmapOct,
	I18nKey.heatmapNov,
	I18nKey.heatmapDec,
];

let weeks: { date: Date; count: number }[][] = [];
let monthLabels: { name: string; weekIndex: number }[] = [];

function getContributionColor(count: number) {
	if (count === 0) return "bg-neutral-200 dark:bg-neutral-800";
	if (count === 1) return "bg-(--primary-light) opacity-40";
	if (count === 2) return "bg-(--primary-light) opacity-70";
	if (count >= 3) return "bg-(--primary)";
	return "bg-neutral-200 dark:bg-neutral-800";
}

function initHeatmap() {
	const now = new Date();
	const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
	// 调整到那个月的第一天所在的周日
	startDate.setDate(startDate.getDate() - startDate.getDay());

	const postCounts: Record<string, number> = {};
	for (const post of sortedPosts) {
		const dateStr = post.data.published.toISOString().split("T")[0];
		postCounts[dateStr] = (postCounts[dateStr] || 0) + 1;
	}

	const tempWeeks: { date: Date; count: number }[][] = [];
	const tempMonthLabels: { name: string; weekIndex: number }[] = [];
	let currentWeek: { date: Date; count: number }[] = [];
	const currentDate = new Date(startDate);

	let lastMonth = -1;

	while (currentDate <= now || currentWeek.length > 0) {
		const dateCopy = new Date(currentDate);
		const dateStr = dateCopy.toISOString().split("T")[0];
		
		if (currentDate.getMonth() !== lastMonth && currentWeek.length === 0) {
			tempMonthLabels.push({
				name: i18n(months[currentDate.getMonth()]),
				weekIndex: tempWeeks.length,
			});
			lastMonth = currentDate.getMonth();
		}

		currentWeek.push({
			date: dateCopy,
			count: postCounts[dateStr] || 0,
		});

		if (currentWeek.length === 7) {
			tempWeeks.push(currentWeek);
			currentWeek = [];
		}

		currentDate.setDate(currentDate.getDate() + 1);
		if (currentDate > now && currentWeek.length === 0) break;
		if (currentDate > now && currentWeek.length > 0) {
			while(currentWeek.length < 7) {
				currentWeek.push({ date: new Date(currentDate), count: -1 }); // 填充占位
				currentDate.setDate(currentDate.getDate() + 1);
			}
			tempWeeks.push(currentWeek);
			break;
		}
	}

	weeks = tempWeeks;
	monthLabels = tempMonthLabels;
}

function showTooltip(e: MouseEvent, count: number, date: Date) {
	if (count < 0) return;
	tooltipVisible = true;
	const dateStr = date.toLocaleDateString();
	tooltipText = i18n(I18nKey.heatmapPostOn)
		.replace("{count}", count.toString())
		.replace("{date}", dateStr);
	
	const rect = container.getBoundingClientRect();
	tooltipX = e.clientX - rect.left;
	tooltipY = e.clientY - rect.top - 40;
}

function hideTooltip() {
	tooltipVisible = false;
}

onMount(() => {
	initHeatmap();
});
</script>

<div class="card-base p-6 mb-6 relative overflow-hidden" bind:this={container}>
    <div class="text-lg font-bold mb-4 flex items-center gap-2">
        <div class="w-1 h-4 bg-(--primary) rounded-full"></div>
        {i18n(I18nKey.heatmapTitle)}
    </div>

    <div class="flex flex-col gap-1 overflow-x-auto no-scrollbar">
        <!-- Month labels -->
        <div class="flex h-5 text-[10px] text-neutral-400 relative mb-1">
            {#each monthLabels as label}
                <div class="absolute" style="left: {label.weekIndex * 14 + 30}px">
                    {label.name}
                </div>
            {/each}
        </div>

        <div class="flex gap-1">
            <!-- Day labels -->
            <div class="flex flex-col gap-1 pr-2">
                {#each days as day, i}
                    <div class="h-[10px] text-[10px] flex items-center text-neutral-400">
                        {i % 2 === 1 ? i18n(day) : ''}
                    </div>
                {/each}
            </div>

            <!-- Heatmap grid -->
            <div class="flex gap-1">
                {#each weeks as week}
                    <div class="flex flex-col gap-1">
                        {#each week as day}
                            {#if day.count >= 0}
                                <div
                                    class="w-[10px] h-[10px] rounded-[2px] {getContributionColor(day.count)} transition-all duration-300 hover:scale-125"
                                    on:mouseenter={(e) => showTooltip(e, day.count, day.date)}
                                    on:mouseleave={hideTooltip}
                                    role="gridcell"
                                    tabindex="-1"
                                ></div>
                            {:else}
                                <div class="w-[10px] h-[10px]"></div>
                            {/if}
                        {/each}
                    </div>
                {/each}
            </div>
        </div>

        <!-- Legend -->
        <div class="flex items-center justify-end gap-1 mt-4 text-[10px] text-neutral-400">
            <span>{i18n(I18nKey.heatmapLess)}</span>
            <div class="w-[10px] h-[10px] rounded-[2px] bg-neutral-200 dark:bg-neutral-800"></div>
            <div class="w-[10px] h-[10px] rounded-[2px] bg-(--primary-light) opacity-40"></div>
            <div class="w-[10px] h-[10px] rounded-[2px] bg-(--primary-light) opacity-70"></div>
            <div class="w-[10px] h-[10px] rounded-[2px] bg-(--primary)"></div>
            <span>{i18n(I18nKey.heatmapMore)}</span>
        </div>
    </div>

    {#if tooltipVisible}
        <div
            class="absolute z-[100] px-2 py-1 text-xs text-white bg-neutral-800 dark:bg-neutral-200 dark:text-neutral-800 rounded shadow-lg pointer-events-none whitespace-nowrap -translate-x-1/2"
            style="left: {tooltipX}px; top: {tooltipY}px"
        >
            {tooltipText}
            <div class="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-800 dark:bg-neutral-200 rotate-45"></div>
        </div>
    {/if}
</div>

<style>
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
