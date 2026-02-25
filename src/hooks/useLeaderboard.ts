import { useQuery } from "@tanstack/react-query";
import { fetchGlobalLeaderboard } from "@/services/duelService";

// ============================================================================
// Leaderboard React Query Hook
// Replaces Leaderboard.tsx's loadLeaderboard() with a cached query.
// ============================================================================

/** Query keys for cache management */
export const leaderboardKeys = {
    global: ["leaderboard", "global"] as const,
};

/**
 * Fetch global leaderboard with extended cache.
 * Leaderboard data changes less frequently than other duel data.
 */
export const useGlobalLeaderboard = () => {
    return useQuery({
        queryKey: leaderboardKeys.global,
        queryFn: fetchGlobalLeaderboard,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
