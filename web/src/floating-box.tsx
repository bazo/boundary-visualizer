import { useEffect, useRef, useState } from "react";

type FloatingBoxProps = {
	checked: boolean;
	onChange: (value: boolean) => void;
};

export function FloatingBox({ checked, onChange }: FloatingBoxProps) {
	const [position, setPosition] = useState<{ x: number; y: number }>({
		x: 20,
		y: 20,
	});
	const [dragging, setDragging] = useState(false);
	const offset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

	// load saved position
	useEffect(() => {
		const saved = localStorage.getItem("floating-box-pos");
		if (saved) setPosition(JSON.parse(saved));
	}, []);

	const onMouseDown = (e: React.MouseEvent) => {
		setDragging(true);
		offset.current = {
			x: e.clientX - position.x,
			y: e.clientY - position.y,
		};
	};

	const onMouseMove = (e: MouseEvent) => {
		if (!dragging) return;
		setPosition({
			x: e.clientX - offset.current.x,
			y: e.clientY - offset.current.y,
		});
	};

	const onMouseUp = () => {
		if (dragging) {
			localStorage.setItem("floating-box-pos", JSON.stringify(position));
		}
		setDragging(false);
	};

	useEffect(() => {
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
		return () => {
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		};
	});

	return (
		<div
			onMouseDown={onMouseDown}
			className="fixed z-50 bg-white border border-gray-300 shadow-xl rounded-lg p-3 cursor-move select-none"
			style={{
				left: position.x,
				top: position.y,
			}}
		>
			<label
				className="flex items-center space-x-2 cursor-pointer"
				onMouseDown={(e) => e.stopPropagation()} // aby checkbox nezapínal drag
			>
				<input
					type="checkbox"
					checked={checked}
					onChange={(e) => onChange(e.target.checked)}
				/>
				<span className="text-sm font-medium">Show Mainland Only</span>
			</label>
		</div>
	);
}
