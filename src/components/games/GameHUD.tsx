import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

type GameHUDProps = {
	score: number;
	streak?: number;
	lives?: number;
	maxLives?: number;
	timeRemainingMs?: number;
	initialTimeMs?: number;
	className?: string;
	onPause?: () => void;
	onReset?: () => void;
};

export function GameHUD(props: GameHUDProps) {
	const {
		score,
		streak = 0,
		lives,
		maxLives = 3,
		timeRemainingMs,
		initialTimeMs,
		className,
		onPause,
		onReset,
	} = props;

	const timePercent = useMemo(() => {
		if (!timeRemainingMs || !initialTimeMs) return undefined;
		return Math.max(0, Math.min(100, (timeRemainingMs / initialTimeMs) * 100));
	}, [timeRemainingMs, initialTimeMs]);

	return (
		<div className={cn("flex items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-gray-100 shadow-lg", className)}>
			{/* Score section */}
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
						<span className="text-white text-sm font-bold">🏆</span>
					</div>
					<div>
						<div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Score</div>
						<div className="text-2xl font-black text-gray-800 tabular-nums">{score}</div>
					</div>
				</div>
				{typeof streak === "number" && streak > 1 ? (
					<div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
						<span className="text-sm font-bold">🔥</span>
						<span className="text-sm font-bold">x{streak}</span>
					</div>
				) : null}
			</div>

			{/* Center section - Lives and Timer */}
			<div className="flex items-center gap-4">
				{typeof lives === "number" ? (
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium text-gray-600">Lives</span>
						<div className="flex items-center gap-1">
							{Array.from({ length: maxLives }).map((_, index) => {
								const filled = index < (lives ?? 0);
								return (
									<span
										key={index}
										aria-label={filled ? "life" : "lost life"}
										className={cn(
											"inline-block h-4 w-4 rounded-full transition-all duration-300",
											filled 
												? "bg-gradient-to-br from-red-500 to-red-600 shadow-lg" 
												: "bg-gray-200"
										)}
									/>
								);
							})}
						</div>
					</div>
				) : null}
				{typeof timePercent === "number" ? (
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium text-gray-600">Time</span>
						<div className="w-24">
							<Progress value={timePercent} className="h-2" />
						</div>
					</div>
				) : null}
			</div>

			{/* Action buttons */}
			<div className="flex items-center gap-2">
				{onPause ? (
					<Button 
						size="sm" 
						variant="outline" 
						onClick={onPause}
						className="bg-white/60 hover:bg-white/80 border-gray-200 hover:border-gray-300 transition-all duration-200"
					>
						⏸️ Pause
					</Button>
				) : null}
				{onReset ? (
					<Button 
						size="sm" 
						variant="outline" 
						onClick={onReset}
						className="bg-white/60 hover:bg-white/80 border-gray-200 hover:border-gray-300 transition-all duration-200"
					>
						🔄 Reset
					</Button>
				) : null}
			</div>
		</div>
	);
}

export default GameHUD;


