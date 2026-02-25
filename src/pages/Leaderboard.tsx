import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Award, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Layout from '@/components/layout/Layout';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import { dashboardApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LeaderboardEntry } from '@/types';

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const timeframe = searchParams.get('timeframe') || 'all';
  const sort = searchParams.get('sort') || 'highestSolved';
  const minSolved = searchParams.get('minSolved') || '';
  const maxSolved = searchParams.get('maxSolved') || '';
  const minRank = searchParams.get('minRank') || '';
  const maxRank = searchParams.get('maxRank') || '';
  const search = searchParams.get('search') || '';

  const [page, setPage] = useState(1);
  const pageSize = 10;

  // ==============================
  // Load Data
  // ==============================
  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      try {
        const response = await dashboardApi.getGlobalLeaderboard();
        if (response.success && response.data) {
          setLeaderboardData(response.data);
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        toast({
          title: 'Error loading leaderboard',
          description: 'Could not fetch leaderboard.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  // ==============================
  // Debounced Search
  // ==============================
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      if (searchInput) params.set('search', searchInput);
      else params.delete('search');

      setSearchParams(params);
      setPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput, searchParams]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);

    setSearchParams(params);
    setPage(1);
  };

  // ==============================
  // GLOBAL SORT (for podium)
  // ==============================
  const globallySorted = useMemo(() => {
    const data = [...leaderboardData];

    data.sort((a, b) => {
      const diff = (b.totalSolved || 0) - (a.totalSolved || 0);
      if (diff !== 0) return diff;
      return (a.userName || '').localeCompare(b.userName || '');
    });

    return data;
  }, [leaderboardData]);

  const topThree = globallySorted.slice(0, 3);

  // ==============================
  // FILTER + SORT
  // ==============================
  const processedLeaderboard = useMemo(() => {
    let data = [...leaderboardData];

    // Timeframe filter
    if (timeframe !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (timeframe === 'monthly') cutoff.setMonth(now.getMonth() - 1);
      if (timeframe === 'weekly') cutoff.setDate(now.getDate() - 7);

      data = data.filter((e: any) =>
        e.updatedAt ? new Date(e.updatedAt) >= cutoff : true
      );
    }

    // Search
    if (search) {
      data = data.filter(e =>
        e.userName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Range filters
    if (minSolved) data = data.filter(e => (e.totalSolved || 0) >= Number(minSolved));
    if (maxSolved) data = data.filter(e => (e.totalSolved || 0) <= Number(maxSolved));

    // Sorting
    switch (sort) {
      case 'highestSolved':
        data.sort((a, b) => {
          const diff = (b.totalSolved || 0) - (a.totalSolved || 0);
          if (diff !== 0) return diff;
          return (a.userName || '').localeCompare(b.userName || '');
        });
        break;

      case 'lowestSolved':
        data.sort((a, b) => (a.totalSolved || 0) - (b.totalSolved || 0));
        break;

      case 'longestStreak':
        data.sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0));
        break;

      case 'leastPenalties':
        data.sort((a, b) => (a.penaltyAmount || 0) - (b.penaltyAmount || 0));
        break;
    }

    // Assign ranks
    data = data.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // Rank filter
    if (minRank) data = data.filter(e => e.rank >= Number(minRank));
    if (maxRank) data = data.filter(e => e.rank <= Number(maxRank));

    return data;
  }, [
    leaderboardData,
    timeframe,
    sort,
    minSolved,
    maxSolved,
    minRank,
    maxRank,
    search
  ]);

  // ==============================
  // PAGINATION
  // ==============================
  const totalPages = Math.ceil(processedLeaderboard.length / pageSize);

  const paginatedData = processedLeaderboard.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // ==============================
  // MEMOIZED STATS
  // ==============================
  const stats = useMemo(() => {
    return {
      totalSolved: processedLeaderboard.reduce((acc, e) => acc + (e.totalSolved || 0), 0),
      longestStreak:
        processedLeaderboard.length > 0
          ? Math.max(...processedLeaderboard.map(e => e.currentStreak || 0))
          : 0,
      totalPenalties:
        processedLeaderboard.reduce((acc, e) => acc + (e.penaltyAmount || 0), 0),
    };
  }, [processedLeaderboard]);

  // ==============================
  // UI
  // ==============================
  return (
    <Layout>
      <div className="space-y-8">

        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* FILTER CONTROLS */}
        <div className="flex flex-wrap gap-3 justify-center">
          <select
            value={timeframe}
            onChange={(e) => updateParam('timeframe', e.target.value)}
            className="border rounded p-2"
          >
            <option value="all">All Time</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>

          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="border rounded p-2"
          >
            <option value="highestSolved">Most Solved</option>
            <option value="lowestSolved">Least Solved</option>
            <option value="longestStreak">Longest Streak</option>
            <option value="leastPenalties">Least Penalties</option>
          </select>

          <input
            type="number"
            placeholder="Min Solved"
            value={minSolved}
            onChange={(e) => updateParam('minSolved', e.target.value)}
            className="border rounded p-2 w-28"
          />

          <input
            type="number"
            placeholder="Max Solved"
            value={maxSolved}
            onChange={(e) => updateParam('maxSolved', e.target.value)}
            className="border rounded p-2 w-28"
          />

          <input
            type="text"
            placeholder="Search username..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border rounded p-2"
          />

          <Button variant="outline" onClick={() => setSearchParams({})}>
            Reset Filters
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <LeaderboardTable
              entries={paginatedData}
              currentUserId={user?.id}
            />

            {/* Pagination */}
            <div className="flex justify-center gap-4">
              <Button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>

              <span className="flex items-center">
                Page {page} of {totalPages}
              </span>

              <Button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Leaderboard;