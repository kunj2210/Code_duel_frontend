// Types for the LeetCode Challenge Tracker

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  leetcodeUsername: string;
}

export interface Challenge {
  id: string;
  name: string;
  dailyTarget: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'any';
  penaltyAmount: number;
  startDate: string;
  endDate: string;
  createdBy: string;
  members: ChallengeMember[];
  isActive: boolean;
}

export interface ChallengeMember {
  userId: string;
  userName: string;
  avatar?: string;
  status: 'completed' | 'failed' | 'pending';
  streak: number;
  totalPenalty: number;
  dailyProgress: DailyProgress[];
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

// ============================================================================
// GAMIFICATION TYPES
// ============================================================================

export type AchievementCategory =
  | 'streak'
  | 'problem_solving'
  | 'challenge'
  | 'difficulty'
  | 'social'
  | 'special';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  tier: AchievementTier;
  points: number;
  requirement: number;
  unlockedAt?: string;
  progress?: number;
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
  progress: number;
}

export type UserTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface TierInfo {
  tier: UserTier;
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface UserTierProgress {
  currentTier: UserTier;
  totalPoints: number;
  currentTierInfo: TierInfo;
  nextTierInfo: TierInfo | null;
  pointsToNextTier: number;
  progressPercentage: number;
}

export interface GamificationStats {
  totalPoints: number;
  currentTier: UserTier;
  achievementsUnlocked: number;
  totalAchievements: number;
  recentAchievements: Achievement[];
  nextAchievements: Achievement[];
}
