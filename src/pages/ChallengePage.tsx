
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { challengeApi } from "../lib/api";

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Target,
  Users,
  Clock,
  Loader2,
  PlayCircle,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import ProgressChart from "@/components/dashboard/ProgressChart";
import InviteUserDialog from "@/components/challenge/InviteUserDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Challenge } from "@/types";
import { challengeApi, dashboardApi } from "@/lib/api";

const ChallengePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<{ userId: string; userName?: string; username?: string; totalPenalty?: number }[]>([]);
  const [chartData, setChartData] = useState<{ date: string; solved: number; target: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);


interface Challenge {
  id: string;
  name: string;
  description: string;
  minSubmissionsPerDay: number;
  difficultyFilter: string[] | null;
  uniqueProblemConstraint: boolean;
  penaltyAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  ownerId: string;
  createdAt: string;
}

export default function ChallengesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const difficulty = searchParams.get("difficulty") || "";
  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "newest";
  const search = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(search);

  const pageSize = 6;

  // ==============================
  // Load Data
  // ==============================
  useEffect(() => {

    const load = async () => {
      try {
        setLoading(true);
        const res = await challengeApi.getAll();
        setChallenges(res.success && res.data ? res.data : []);
      } catch (err) {
        console.error(err);
        setChallenges([]);
      } finally {
        setLoading(false);

    if (id) {
      loadChallengeData();
    }
  }, [id]);

  const loadChallengeData = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const challengeResponse = await challengeApi.getById(id);
      const leaderboardResponse = await dashboardApi.getChallengeLeaderboard(id);
      const progressResponse = await dashboardApi.getChallengeProgress(id);

      if (challengeResponse?.success && challengeResponse.data) {
        setChallenge(challengeResponse.data);

      }
    };


    load();
  }, []);

  // ==============================
  // Sync input when URL changes
  // ==============================
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // ==============================
  // Debounced search
  // ==============================
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      if (searchInput) {
        params.set("search", searchInput);
      } else {
        params.delete("search");
      }

      setSearchParams(params);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // ==============================
  // Difficulty rank helper
  // ==============================
  const getDifficultyRank = (c: Challenge) => {
    const order = { Easy: 1, Medium: 2, Hard: 3 };
    if (!c.difficultyFilter?.length) return 0;
    return Math.max(
      ...c.difficultyFilter.map(
        (d) => order[d as keyof typeof order] || 0
      )
    );
  };

  // ==============================
  // Filter + Stable Sort
  // ==============================
  const processed = useMemo(() => {
    let data = [...challenges];

    if (difficulty) {
      data = data.filter((c) =>
        c.difficultyFilter?.includes(difficulty)
      );

      if (leaderboardResponse?.success && leaderboardResponse.data) {
        setLeaderboard(leaderboardResponse.data);
      }

      if (progressResponse?.success && progressResponse.data) {
        setChartData(progressResponse.data);
      }
    } catch (error: unknown) {
      console.error("Failed to load challenge:", error);
      setHasError(true);
      toast({
        title: "Failed to load challenge",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinChallenge = async () => {
    if (!id) return;

    setIsJoining(true);
    try {
      const response = await challengeApi.join(id);

      if (response?.success) {
        toast({
          title: "Joined challenge!",
          description: "You have successfully joined the challenge.",
        });
        loadChallengeData();
      } else {
        throw new Error(response?.message || "Failed to join challenge");
      }
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      toast({
        title: "Failed to join challenge",
        description: err.response?.data?.message || err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleActivateChallenge = async () => {
    if (!id) return;

    setIsActivating(true);
    try {
      const response = await challengeApi.updateStatus(id, "ACTIVE");

      if (response?.success) {
        toast({
          title: "Challenge activated!",
          description: "Your challenge is now active and visible to all members.",
        });
        loadChallengeData();
      } else {
        throw new Error(response?.message || "Failed to activate challenge");
      }
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      toast({
        title: "Failed to activate challenge",
        description: err.response?.data?.message || err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);

    }

    if (status) {
      data = data.filter((c) => c.status === status);
    }


    if (search) {
      data = data.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    data.sort((a, b) => {
      switch (sort) {
        case "newest": {
          const diff =
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime();
          if (diff !== 0) return diff;
          return a.name.localeCompare(b.name);
        }
        case "oldest": {
          const diff =
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime();
          if (diff !== 0) return diff;
          return a.name.localeCompare(b.name);
        }
        case "difficulty": {
          const diff = getDifficultyRank(a) - getDifficultyRank(b);
          if (diff !== 0) return diff;
          return a.name.localeCompare(b.name);
        }
        case "endDate": {
          const diff =
            new Date(a.endDate).getTime() -
            new Date(b.endDate).getTime();
          if (diff !== 0) return diff;
          return a.name.localeCompare(b.name);
        }
        default:
          return 0;
      }
    });

    return data;
  }, [challenges, difficulty, status, sort, search]);

  // ==============================
  // Pagination
  // ==============================
  const totalPages = Math.ceil(processed.length / pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const paginated = processed.slice(
    (page - 1) * pageSize,
    page * pageSize

  if (hasError || !challenge) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Challenge not found</h2>
          <p className="text-muted-foreground mt-2">We couldn't load this challenge.</p>
          <Button asChild className="mt-4">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (new Date(challenge.endDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const totalDays = Math.max(
    1,
    Math.ceil(
      (new Date(challenge.endDate).getTime() -
        new Date(challenge.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const progress = Math.min(
    100,
    Math.max(0, Math.round(((totalDays - daysRemaining) / totalDays) * 100))
  );

  const isMember = leaderboard.some(
    (member) => member.userId === user?.id

  );

  // ==============================
  // Update URL
  // ==============================
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value) params.set(key, value);
    else params.delete(key);

    setSearchParams(params);
    setPage(1);
  };

  const resetFilters = () => {
    setSearchParams({});
    setSearchInput("");
    setPage(1);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (

    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Challenges</h1>

      <div className="flex flex-wrap gap-4">
        <select
          value={difficulty}
          onChange={(e) => updateParam("difficulty", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select
          value={status}
          onChange={(e) => updateParam("status", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Upcoming">Upcoming</option>
        </select>

        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="difficulty">Difficulty</option>
          <option value="endDate">End Date</option>
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          onClick={resetFilters}
          className="border px-4 py-2 rounded bg-gray-100"
        >
          Reset
        </button>
      </div>

      <div className="grid gap-4">
        {paginated.map((c) => (
          <div key={c.id} className="border p-4 rounded shadow-sm">
            <h2 className="font-semibold">{c.name}</h2>
            <p>Status: {c.status}</p>
            <p>
              Difficulty:{" "}
              {c.difficultyFilter?.join(", ") || "Any"}
            </p>
            <p>
              Ends: {new Date(c.endDate).toLocaleDateString()}
            </p>

    <Layout>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{challenge.name}</h1>
              <Badge variant="outline">
                {difficultyDisplay}
              </Badge>
              <Badge variant="outline">
                {challenge.status}
              </Badge>
            </div>

            <p className="text-muted-foreground">
              {challenge.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(challenge.startDate).toLocaleDateString()} -{" "}
                  {new Date(challenge.endDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{daysRemaining} days left</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {challenge.status === "PENDING" &&
              challenge.ownerId === user?.id && (
                <Button
                  className="gap-2"
                  onClick={handleActivateChallenge}
                  disabled={isActivating}
                >
                  {isActivating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="h-4 w-4" />
                  )}
                  Activate Challenge
                </Button>
              )}
            {challenge.visibility === "PRIVATE" && challenge.ownerId === user?.id && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setIsInviteDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4" />
                Invite Users
              </Button>
            )}

            {!isMember && challenge.visibility !== "PRIVATE" ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleJoinChallenge}
                disabled={isJoining}
              >
                {isJoining ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                Join Challenge
              </Button>
            ) : !isMember && (
              <Badge
                variant="outline"
                className="bg-success/10 text-success"
              >
                Already Joined
              </Badge>
            )}

          </div>
        ))}


        {processed.length === 0 && <p>No challenges found.</p>}
      </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Challenge Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.max(0, totalDays - daysRemaining)} of {totalDays} days
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length > 0 ? (
                  leaderboard.map((member, index) => (
                    <div
                      key={member.userId || `member-${index}`}
                      className="flex justify-between p-3 border rounded-lg mb-2"
                    >
                      <span>#{index + 1}</span>
                      <span>
                        {member.userName || member.username}
                      </span>
                      <span>
                        ${member.totalPenalty || 0}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No members yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <ProgressChart data={chartData} title="Team Progress" />
          </TabsContent>
        </Tabs>
      </div>

      {/* Invite Users Dialog */}
      <InviteUserDialog
        open={
          challenge.visibility === "PRIVATE" &&
          challenge.ownerId === user?.id &&
          isInviteDialogOpen
        }
        onOpenChange={setIsInviteDialogOpen}
        challengeId={challenge.id}
        challengeName={challenge.name}
        existingMemberIds={leaderboard.map((m) => m.userId)}
      />
    </Layout>
  );
};


      {totalPages > 1 && (
        <div className="flex gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="border px-3 py-1 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="border px-3 py-1 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}