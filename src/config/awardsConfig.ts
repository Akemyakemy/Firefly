import type { AwardConfig } from "../types/config";

export const awardsConfig: AwardConfig = {
	title: "荣誉奖项",
	programmingAbility: {
		label: "XCPC程序设计能力",
		value: "Lv4",
		icon: "/assets/images/balloon/green.png",
	},
	awards: [
		{
			year: "2026",
			list: [
				{
					name: "南昌CCPC邀请赛",
					award: "金奖",
					icon: "/assets/images/medals/gold.png",
				},
				// {
				// 	name: "武汉ICPC邀请赛",
				// 	award: "铁奖",
				// 	icon: "/assets/images/medals/iron.png",
				// },
			],
		},
		{
			year: "2025",
			list: [
				// {
				// 	name: "哈尔滨CCPC区域赛",
				// 	award: "铁奖",
				// 	icon: "/assets/images/medals/iron.png",
				// },
				{
					name: "成都ICPC区域赛",
					award: "铜奖",
					icon: "/assets/images/medals/copper.png",
				},
				{
					name: "南昌CCPC邀请赛",
					award: "金奖",
					icon: "/assets/images/medals/gold.png",
				},
			],
		},
	],
};
