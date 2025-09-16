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
		<div className={cn("flex items-center justify-between gap-3 p-3 rounded-xl bg-background/60 border", className)}>
			<div className="flex items-center gap-3">
				<div className="text-sm font-medium">Score</div>
				<div className="text-xl font-semibold tabular-nums">{score}</div>
				{typeof streak === "number" && streak > 1 ? (
					<div className="text-sm text-muted-foreground">x{streak} combo</div>
				) : null}
			</div>
			<div className="flex items-center gap-3">
				{typeof lives === "number" ? (
					<div className="flex items-center gap-1">
						{Array.from({ length: maxLives }).map((_, index) => {
							const filled = index < (lives ?? 0);
							return (
								<span
									key={index}
									aria-label={filled ? "life" : "lost life"}
									className={cn(
										"inline-block h-3 w-3 rounded-full",
										filled ? "bg-emerald-500" : "bg-muted"
									)}
								/>
							);
						})}
					</div>
				) : null}
				{typeof timePercent === "number" ? (
					<div className="w-32">
						<Progress value={timePercent} />
					</div>
				) : null}
			</div>
			<div className="flex items-center gap-2">
				{onPause ? (
					<Button size="sm" variant="outline" onClick={onPause}>
						Pause
					</Button>
				) : null}
				{onReset ? (
					<Button size="sm" variant="ghost" onClick={onReset}>
						Reset
					</Button>
				) : null}
			</div>
		</div>
	);
}

export default GameHUD;


