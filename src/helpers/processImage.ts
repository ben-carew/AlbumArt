import { createCanvas, Image } from "canvas";
// import { Canvas, Image } from "skia-canvas";
import { gauss } from "./Blur";

async function createCanvasNode(src?: typeof Image | any): Promise<any> {
	const canvas = createCanvas(src ? src.width : 0, src ? src.height : 0);
	const ctx = canvas.getContext("2d");

	if (src) {
		canvas.width = src.width;
		canvas.height = src.height;
		ctx.drawImage(src, 0, 0);
	}

	return canvas;
}

export async function process(
	image: Image,
	w: number,
	h: number,
	blurPx: number = 24,
	blurOpacity: number = 80,
	shadowSize: number = 32,
	centerScale: number = 0.8,
): Promise<Blob> {
	const canvas = await createCanvasNode();
	const canvasCtx = canvas.getContext("2d");
	canvas.width = w;
	canvas.height = h;

	// turn source image into workable canvas
	const srcCanvas = await createCanvasNode(image);

	// bg
	const bg = await createCanvasNode(srcCanvas);

	// bgCtx.filter = `blur(${blurPx}px) opacity(${blurOpacity}%)`;
	gauss(bg, blurPx);
	const bgCtx = bg.getContext("2d");
	bgCtx.drawImage(bg, 0, 0);

	// fg
	const fgShadow = createCanvas(
		srcCanvas.width + shadowSize * 2,
		srcCanvas.height + shadowSize * 2,
	);
	const fgShadowCtx = fgShadow.getContext("2d");

	fgShadowCtx.shadowBlur = shadowSize;
	fgShadowCtx.shadowColor = "black";

	fgShadowCtx.drawImage(srcCanvas, shadowSize, shadowSize);

	// overlay
	if (w / h > 1) {
		// landscape
		// calculate fg centering shift
		const fgXshift = (canvas.width - centerScale * canvas.height) / 2;
		const fgYshift = (canvas.height - centerScale * canvas.height) / 2;

		canvasCtx.drawImage(
			bg,
			0,
			-(canvas.height / 4),
			canvas.width,
			canvas.width,
		);
		canvasCtx.drawImage(
			fgShadow,
			fgXshift,
			fgYshift,
			canvas.height * centerScale,
			canvas.height * centerScale,
		);
	} else {
		// portrait
		const fgXshift = (canvas.width - centerScale * canvas.width) / 2;
		const fgYshift = (canvas.height - centerScale * canvas.width) / 2;

		canvasCtx.drawImage(
			bg,
			-(canvas.width / 2.5),
			0,
			canvas.height,
			canvas.height,
		);
		canvasCtx.drawImage(
			fgShadow,
			fgXshift,
			fgYshift,
			canvas.width * centerScale,
			canvas.width * centerScale,
		);
	}

	return canvas;
}
