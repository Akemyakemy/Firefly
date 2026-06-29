import type { APIContext, GetStaticPaths } from "astro";
import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import * as fs from "node:fs";
import { removeFileExtension } from "@/utils/url-utils";

import { profileConfig } from "../../config/profileConfig";
import { siteConfig } from "../../config/siteConfig";

export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
	if (!siteConfig.post.generateOgImages) {
		return [];
	}

	const allPosts = await getCollection("posts");
	const publishedPosts = allPosts.filter((post) => !post.data.draft);

	return publishedPosts.map((post) => {
		const slug = removeFileExtension(post.id);
		return {
			params: { slug },
			props: { post },
		};
	});
};

function escapeHtml(value: unknown): string {
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function wrapText(text: string, maxChars: number, maxLines: number): string[] {
	const chars = Array.from(text.trim());
	const lines: string[] = [];
	let line = "";

	for (const char of chars) {
		if (line.length >= maxChars) {
			lines.push(line);
			line = char;
			if (lines.length === maxLines) break;
		} else {
			line += char;
		}
	}

	if (line && lines.length < maxLines) {
		lines.push(line);
	}

	if (chars.length > lines.join("").length && lines.length > 0) {
		lines[lines.length - 1] = `${lines[lines.length - 1].replace(/.{1,2}$/, "")}...`;
	}

	return lines;
}

function textLinesSvg(
	lines: string[],
	x: number,
	y: number,
	fontSize: number,
	lineHeight: number,
	weight: number,
	color: string,
): string {
	return lines
		.map(
			(line, index) =>
				`<text x="${x}" y="${y + index * lineHeight}" fill="${color}" font-size="${fontSize}" font-weight="${weight}">${escapeHtml(line)}</text>`,
		)
		.join("");
}

function readImageDataUrl(path: string): string {
	const buffer = fs.readFileSync(path);
	const ext = path.split(".").pop()?.toLowerCase();
	const mime =
		ext === "jpg" || ext === "jpeg"
			? "image/jpeg"
			: ext === "svg"
				? "image/svg+xml"
				: "image/png";
	return `data:${mime};base64,${buffer.toString("base64")}`;
}

function resolveLocalImage(path: string | undefined, fallback: string): string {
	if (!path) return readImageDataUrl(fallback);
	if (path.startsWith("http")) return path;

	const localPath = path.startsWith("/") ? `./public${path}` : `./src/${path}`;
	return readImageDataUrl(localPath);
}

export async function GET({
	props,
}: APIContext<{ post: CollectionEntry<"posts"> }>) {
	const { post } = props;

	const avatarHref = resolveLocalImage(profileConfig.avatar, "./public/favicon/favicon-dark-192.png");
	const iconHref = readImageDataUrl(
		siteConfig.favicon.length > 0
			? `./public${siteConfig.favicon[0].src}`
			: "./public/favicon/favicon-dark-192.png",
	);

	const hue = siteConfig.themeColor.hue;
	const primaryColor = `hsl(${hue}, 90%, 65%)`;
	const textColor = "hsl(0, 0%, 95%)";
	const subtleTextColor = `hsl(${hue}, 10%, 75%)`;
	const backgroundColor = `hsl(${hue}, 15%, 12%)`;

	const pubDate = post.data.published.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});

	const titleLines = wrapText(post.data.title, 14, 3);
	const descriptionLines = post.data.description
		? wrapText(post.data.description, 40, 2)
		: [];

	const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img">
  <defs>
    <clipPath id="avatarClip"><circle cx="90" cy="540" r="30"/></clipPath>
    <linearGradient id="accent" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="${backgroundColor}"/>
  <circle cx="1040" cy="86" r="210" fill="url(#accent)"/>
  <circle cx="122" cy="560" r="160" fill="${primaryColor}" opacity="0.12"/>
  <g font-family="'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
    <image href="${iconHref}" x="60" y="58" width="48" height="48" preserveAspectRatio="xMidYMid slice"/>
    <text x="128" y="94" fill="${subtleTextColor}" font-size="36" font-weight="600">${escapeHtml(siteConfig.title)}</text>
    <rect x="60" y="178" width="10" height="92" rx="5" fill="${primaryColor}"/>
    ${textLinesSvg(titleLines, 95, 210, 72, 86, 700, textColor)}
    ${
			descriptionLines.length > 0
				? textLinesSvg(descriptionLines, 95, 445, 32, 48, 400, subtleTextColor)
				: ""
		}
    <image href="${avatarHref}" x="60" y="510" width="60" height="60" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>
    <text x="140" y="548" fill="${textColor}" font-size="28" font-weight="600">${escapeHtml(profileConfig.name)}</text>
    <text x="1140" y="548" text-anchor="end" fill="${subtleTextColor}" font-size="28">${escapeHtml(pubDate)}</text>
  </g>
</svg>`;

	return new Response(svg, {
		headers: {
			"Content-Type": "image/svg+xml; charset=utf-8",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
}
