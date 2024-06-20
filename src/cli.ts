#!/usr/bin/env node

import { Command } from "commander";
import { generateWallpaper, getArt } from "./helpers/ImageUtils";
import * as fs from "fs";

const program = new Command();

program
  .version("1.0.0")
  .requiredOption("-a, --album <name>", "Name of the album")
  .parse(process.argv);

const options = program.opts();

async function main() {
  const albumName = options.album;
  const outputPath = "output.png";

  try {
    // Fetch the album art image
    const albumArtPath = await getArt(albumName);
    // console.log(albumArtPath);
    // Generate the wallpaper
    const outputWidth = 5120; // Example width, adjust as needed
    const outputHeight = 2880; // Example height, adjust as needed
    const wallpaperCanvas = await generateWallpaper(
      albumArtPath,
      outputWidth,
      outputHeight,
    );

    // Save the wallpaper to the specified file
    const imgBuffer = await wallpaperCanvas.toBuffer();
    fs.writeFileSync(outputPath, imgBuffer);

    console.log(`Wallpaper generated and saved to ${outputPath}`);
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

main();
