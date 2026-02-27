// Types for the LeetCode Challenge Tracker

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  avatar?: string;
  leetcodeUsername: string;
  createdAt?: string;
  // user may belong to multiple challenges; store full member records
  memberships?: ChallengeMember[];
  // challenges created/owned by this user
  ownedChallenges?: Challenge[];
}

export interface Challenge {
  id: string;
  name: string;
  dailyTarget: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'any';
  penaltyAmount?: number;
  startDate: string;
  endDate: string;
  createdBy: string;
  members: ChallengeMember[];
  isActive: boolean;
  difficultyFilter?: string[];
  status?: "ACTIVE" | "PENDING" | "COMPLETED" | "CANCELLED";
  minSubmissionsPerDay?: number;
}

export interface ChallengeMember {
  userId: string;
  userName: string;
  avatar?: string;
  status: 'completed' | 'failed' | 'pending';
  joinedAt: string;
}

export interface DailyProgress {
  date: string;
  solved: number;
  target: number;
  status: 'completed' | 'failed' | 'pending';
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  totalSolved: number;
  currentStreak: number;
  missedDays: number;
  penaltyAmount: number;
}

export interface Stats {
  todayStatus: 'completed' | 'failed' | 'pending';
  todaySolved: number;
  todayTarget: number;
  currentStreak: number;
  longestStreak: number;
  totalPenalties: number;
  activeChallenges: number;
  totalSolved: number;
}

export interface ActivityData {
  date: string;
  count: number;
}

export interface ChartData {
  date: string;
  solved: number;
  target: number;
}

export type RawData = {
  date?: string;
  displayDate?: string;
  solved?: number;
  passed?: number;
  submissions?: number;
  target?: number;
  dailyTarget?: number;
};

// LeetCode profile returned from the backend
export interface LeetCodeProfile {
  username: string;
  streak: number;
  totalActiveDays: number;
  activeYears: number[];
  // the calendar may come as a JSON string or object mapping dates to counts
  submissionCalendar: string | Record<string, number>;
}
