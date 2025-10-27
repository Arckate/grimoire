import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Layer, Path, Stage } from "react-konva";

export interface Paths {
	name: string;
	d: string;
	colors: string[];
	x: number;
	y: number;
}

interface HeroBannerBgProps {
	paths: Paths[];
	density?: number;
	scale?: number;
	width?: string;
	height?: string;
}

const HeroBannerBg: React.FC = ({
	paths,
	density = 20,
	scale = 0.6,
	width = "100%",
	height = "100%",
}: HeroBannerBgProps) => {
	const containerRef = useRef(null);
	const [size, setSize] = useState({ width: 0, height: 0 });

	const getItems = (innerSize: { width: number; height: number }) => {
		const canvasArea = innerSize.width * innerSize.height;
		const confettiSizeX =
			paths.reduce<number>((acc, { x }) => {
				return acc + x;
			}, 0) * scale;
		const confettiSizeY =
			paths.reduce<number>((acc, { y }) => {
				return acc + y;
			}, 0) * scale;
		const confettiArea = confettiSizeX * confettiSizeY;
		const count = Math.ceil((canvasArea / confettiArea) * density);

		return Array.from({ length: count }, () => {
			const { d, colors } = paths[Math.floor(Math.random() * paths.length)];
			const randomColor = colors[Math.floor(Math.random() * colors.length)];
			const rotation = Math.random() * 360;
			const x = Math.random() * innerSize.width;
			const y = Math.random() * innerSize.height;

			return { d, fill: randomColor, x, y, rotation };
		});
	};

	useEffect(() => {
		function updateSize() {
			if (containerRef.current) {
				setSize({
					width: containerRef.current.offsetWidth,
					height: containerRef.current.offsetHeight,
				});
			}
		}
		updateSize();
		window.addEventListener("resize", updateSize);
		return () => window.removeEventListener("resize", updateSize);
	}, []);

	return (
		<div ref={containerRef} style={{ width, height }}>
			{Boolean(size.width) && Boolean(size.height) && (
				<Stage width={size.width} height={size.height}>
					<Layer>
						{getItems(size).map((item) => (
							<Path
								key={crypto.randomUUID()}
								data={item.d}
								fill={item.fill}
								x={item.x}
								y={item.y}
								scaleX={scale}
								scaleY={scale}
								rotation={item.rotation}
								opacity={1}
							/>
						))}
					</Layer>
				</Stage>
			)}
		</div>
	);
};

export default HeroBannerBg;
