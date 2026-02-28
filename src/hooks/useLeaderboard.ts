import { useMemo } from 'react';
import { LeaderboardEntry } from '@/types';

type SortKey = 'rank' | 'totalSolved' | 'currentStreak' | 'penaltyAmount';

export const useLeaderboard = (
  data: LeaderboardEntry[],
  searchQuery: string,
  sortKey: SortKey,
  sortOrder: 'asc' | 'desc'
) => {
  const processedData = useMemo(() => {
    let filtered = data.filter((entry) =>
      entry.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    let sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortKey] ?? 0;
      const bValue = b[sortKey] ?? 0;

      return sortOrder === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    });

    return sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }, [data, searchQuery, sortKey, sortOrder]);

  return processedData;
};