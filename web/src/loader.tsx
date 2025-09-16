export function Loader() {
	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
			<div className="flex flex-col items-center">
				{/* Spinner */}
				<div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
				{/* Text */}
				<p className="mt-4 text-white text-lg font-medium">Loading...</p>
			</div>
		</div>
	);
}
