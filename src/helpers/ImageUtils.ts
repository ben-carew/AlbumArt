import { process } from "./processImage"; // Adjust the path accordingly
import { loadImage } from "canvas";
import fetch from "node-fetch";
import * as fs from "fs";
import * as path from "path";

export async function generateWallpaper(
	albumArtPath: string, // Path to the album artwork image
	outputWidth: number,
	outputHeight: number,
	blurPx: number = 16,
	blurOpacity: number = 80,
	shadowSize: number = 32,
	centerScale: number = 0.8,
): Promise<Blob> {
	try {
		// Load the album artwork image
		const image = await loadImage(albumArtPath);

		// Process the image to generate the wallpaper
		const wallpaperCanvas = await process(
			image,
			outputWidth,
			outputHeight,
			blurPx,
			blurOpacity,
			shadowSize,
			centerScale,
		);

		return wallpaperCanvas;
	} catch (error) {
		console.error("Error generating wallpaper:", error);
		throw new Error("Failed to generate wallpaper");
	}
}

// Define the expected structure of the iTunes API response
interface ITunesAlbum {
	collectionId: number;
	artworkUrl100: string;
}

interface ITunesSearchResponse {
	results: ITunesAlbum[];
}

export async function getArt(albumName: string): Promise<string> {
	const itunesSearchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(albumName)}&entity=album&limit=1`;
	const response = await fetch(itunesSearchUrl);
	const data = (await response.json()) as ITunesSearchResponse;

	if (data.results.length === 0) {
		throw new Error("Album not found");
	}

	const album = data.results[0];
	const albumArtUrl = album.artworkUrl100.replace("100x100", "9999x9999");

	const albumArtResponse = await fetch(albumArtUrl);
	const albumArtarrayBuffer = await albumArtResponse.arrayBuffer();
	const albumArtBuffer = Buffer.from(albumArtarrayBuffer);
	const albumArtPath = path.resolve(".", `${album.collectionId}.png`);
	fs.writeFileSync(albumArtPath, albumArtBuffer);

	return albumArtPath;
}

export default getArt;
