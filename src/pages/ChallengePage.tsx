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

  useEffect(() => {
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
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center min-h-[60vh] items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

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

  const difficultyDisplay =
    challenge.difficultyFilter?.length > 0
      ? challenge.difficultyFilter.join(", ")
      : "Any";

  return (
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

export default ChallengePage;
