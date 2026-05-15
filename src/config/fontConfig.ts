// 字体配置
export const fontConfig = {
	// 是否启用自定义字体功能
	enable: true,
	// 是否预加载字体文件
	preload: true,
	// 当前选择的字体，支持多个字体组合
	selected: ["dingtalk-jinbuti"],

	// 字体列表
	// 推荐使用可靠的 CDN 服务商提供的字体链接，它天然做了按需分片加载，且性能较好
	//
	// 也可以使用本地字体文件，需自行进行字体子集化处理，否则会因为字体文件庞大增加带宽负担导致页面加载缓慢甚至无法加载
	// 如果进行字体子集化处理，会导致动态内容（如评论，Bangumi等）无法正确显示字体，因此不推荐使用本地字体文件
	fonts: {
		// 系统字体
		system: {
			id: "system",
			name: "系统字体",
			src: "", // 系统字体无需 src
			family:
				"system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
		},
		
		"dingtalk-jinbuti": {
			id: "dingtalk-jinbuti",
			name: "钉钉进步体",
			// 这是jsDelivr官方CDN链接，国内访问速度快
			src: "https://cdn.jsdelivr.net/npm/cn-fontsource-ding-talk-jin-bu-ti-regular@1.0.3/font.min.css",
			// 注意：font-family必须写这个英文名称才会生效
			family: "DingTalk JinBuTi",
			display: "swap",
		},


		// Google Fonts - Zen Maru Gothic
		"zen-maru-gothic": {
			id: "zen-maru-gothic",
			name: "Zen Maru Gothic",
			src: "https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@300;400;500;700;900&display=swap",
			family: "Zen Maru Gothic",
			display: "swap" as const,
		},

		// Google Fonts - Inter
		inter: {
			id: "inter",
			name: "Inter",
			src: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
			family: "Inter",
			display: "swap" as const,
		},

		// 小米字体 - MiSans Normal
		"misans-normal": {
			id: "misans-normal",
			name: "MiSans Normal",
			src: "https://unpkg.com/misans@4.1.0/lib/Normal/MiSans-Normal.min.css",
			family: "MiSans",
			weight: 400,
			display: "swap" as const,
		},

		// 小米字体 - MiSans Regular
		"misans-regular": {
			id: "misans-regular",
			name: "MiSans Regular",
			src: "https://unpkg.com/misans@4.1.0/lib/Normal/MiSans-Regular.min.css",
			family: "MiSans",
			weight: 500,
			display: "swap" as const,
		},

		// 小米字体 - MiSans Semibold
		"misans-semibold": {
			id: "misans-semibold",
			name: "MiSans Semibold",
			src: "https://unpkg.com/misans@4.1.0/lib/Normal/MiSans-Semibold.min.css",
			family: "MiSans",
			weight: 600,
			display: "swap" as const,
		},
	},

	// 全局字体回退
	fallback: [
		"system-ui",
		"-apple-system",
		"BlinkMacSystemFont",
		"Segoe UI",
		"Roboto",
		"sans-serif",
	],
};
