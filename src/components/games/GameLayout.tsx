import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type GameLayoutProps = {
	children: ReactNode;
	hud: ReactNode;
	className?: string;
};

export function GameLayout({ children, hud, className }: GameLayoutProps) {
	return (
		<div className={cn("flex flex-col gap-3 w-full max-w-xl mx-auto p-4", className)}>
			{hud}
			<div className="relative rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden min-h-[360px] flex items-center justify-center p-4">
				{children}
			</div>
		</div>
	);
}

export default GameLayout;


