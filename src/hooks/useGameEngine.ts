import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChallenges } from "./useChallenges";
import { toast } from "sonner";

export type GameEngineConfig = {
	initialLives?: number;
	initialScore?: number;
	comboWindowMs?: number;
	initialTimeMs?: number;
	autoStart?: boolean;
	gameType?: string;
	challengeId?: string;
};

export type GameEngineState = {
	score: number;
	streak: number;
	lives: number;
	maxLives: number;
	isRunning: boolean;
	startedAtMs?: number;
	initialTimeMs?: number;
	timeRemainingMs?: number;
};

export type GameEngineApi = GameEngineState & {
	start: () => void;
	pause: () => void;
	reset: () => void;
	addPoints: (points: number) => void;
	loseLife: (count?: number) => void;
	miss: () => void;
	saveGameScore: (finalScore: number) => Promise<void>;
};

export function useGameEngine(config: GameEngineConfig = {}): GameEngineApi {
	const {
		initialLives = 3,
		initialScore = 0,
		comboWindowMs = 4000,
		initialTimeMs,
		autoStart = true,
		gameType,
		challengeId,
	} = config;

	const { completeChallenge } = useChallenges();

	const [score, setScore] = useState<number>(initialScore);
	const [streak, setStreak] = useState<number>(0);
	const [lives, setLives] = useState<number>(initialLives);
	const [isRunning, setIsRunning] = useState<boolean>(false);
	const [startedAtMs, setStartedAtMs] = useState<number | undefined>(undefined);
	const [timeRemainingMs, setTimeRemainingMs] = useState<number | undefined>(initialTimeMs);

	const lastScoreAtRef = useRef<number | undefined>(undefined);
	const timerRef = useRef<number | undefined>(undefined);

	const maxLives = initialLives;

	const start = useCallback(() => {
		if (isRunning) return;
		setIsRunning(true);
		setStartedAtMs(Date.now());
	}, [isRunning]);

	const pause = useCallback(() => {
		setIsRunning(false);
	}, []);

	const reset = useCallback(() => {
		setScore(initialScore);
		setStreak(0);
		setLives(initialLives);
		setIsRunning(false);
		setStartedAtMs(undefined);
		setTimeRemainingMs(initialTimeMs);
		lastScoreAtRef.current = undefined;
	}, [initialLives, initialScore, initialTimeMs]);

	const addPoints = useCallback(
		(points: number) => {
			const now = Date.now();
			const withinCombo = lastScoreAtRef.current && now - lastScoreAtRef.current <= comboWindowMs;
			const newStreak = withinCombo ? streak + 1 : 1;
			const bonusMultiplier = Math.min(5, newStreak);
			setStreak(newStreak);
			setScore((prev) => prev + points * bonusMultiplier);
			lastScoreAtRef.current = now;
		},
		[comboWindowMs, streak]
	);

	const loseLife = useCallback((count: number = 1) => {
		setLives((prev) => Math.max(0, prev - count));
		setStreak(0);
	}, []);

	const miss = useCallback(() => {
		loseLife(1);
	}, [loseLife]);

	const saveGameScore = useCallback(async (finalScore: number) => {
		if (challengeId && gameType) {
			try {
				await completeChallenge(challengeId, finalScore);
				toast.success(`Game completed! +${finalScore} points saved!`);
			} catch (error) {
				console.error('Error saving game score:', error);
				toast.error('Failed to save score, but you still played great!');
			}
		}
	}, [challengeId, gameType, completeChallenge]);

	// countdown timer
	useEffect(() => {
		if (!initialTimeMs) return;
		if (!isRunning) {
			if (timerRef.current) {
				window.clearInterval(timerRef.current);
				timerRef.current = undefined;
			}
			return;
		}
		const startTime = Date.now();
		const initialRemaining = typeof timeRemainingMs === "number" ? timeRemainingMs : initialTimeMs;
		timerRef.current = window.setInterval(() => {
			const elapsed = Date.now() - startTime;
			const left = Math.max(0, initialRemaining - elapsed);
			setTimeRemainingMs(left);
			if (left <= 0) {
				setIsRunning(false);
				if (timerRef.current) {
					window.clearInterval(timerRef.current);
					timerRef.current = undefined;
				}
			}
		}, 100);
		return () => {
			if (timerRef.current) {
				window.clearInterval(timerRef.current);
				timerRef.current = undefined;
			}
		};
	}, [initialTimeMs, isRunning]);

	useEffect(() => {
		if (autoStart) start();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

		return useMemo(
		() => ({
			score,
			streak,
			lives,
			maxLives,
			isRunning,
			startedAtMs,
			initialTimeMs,
			timeRemainingMs,
			start,
			pause,
			reset,
			addPoints,
			loseLife,
			miss,
			saveGameScore,
		}),
		[
			score,
			streak,
			lives,
			maxLives,
			isRunning,
			startedAtMs,
			initialTimeMs,
			timeRemainingMs,
			start,
			pause,
			reset,
			addPoints,
			loseLife,
			miss,
			saveGameScore,
		]
	);
}

export default useGameEngine;


