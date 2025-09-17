import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type GameLayoutProps = {
	children: ReactNode;
	hud: ReactNode;
	className?: string;
};

export function GameLayout({ children, hud, className }: GameLayoutProps) {
	return (
		<div className={cn("flex flex-col gap-4 w-full max-w-4xl mx-auto p-4 sm:p-6", className)}>
			{hud}
			<div className="relative rounded-3xl border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50 text-card-foreground shadow-2xl overflow-hidden min-h-[500px] flex items-center justify-center p-4 sm:p-6">
				{/* Background pattern */}
				<div className="absolute inset-0 opacity-5">
					<div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-200 via-blue-200 to-purple-200"></div>
					<div className="absolute top-10 right-10 w-32 h-32 bg-green-300 rounded-full blur-3xl"></div>
					<div className="absolute bottom-10 left-10 w-24 h-24 bg-blue-300 rounded-full blur-2xl"></div>
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-300 rounded-full blur-3xl"></div>
				</div>
				<div className="relative z-10 w-full">
					{children}
				</div>
			</div>
		</div>
	);
}

export default GameLayout;


