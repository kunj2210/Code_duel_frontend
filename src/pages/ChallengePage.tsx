import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Loader2,
  PlayCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import ProgressChart from "@/components/dashboard/ProgressChart";
import { mockChartData } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ✅ Centralized React Query hooks — single source of truth
import {
  useChallenge,
  useChallengeLeaderboard,
  useJoinChallenge,
  useActivateChallenge,
} from "@/hooks/useChallenges";

const ChallengePage: React.FC = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();

  // ✅ Cached queries — no manual useState/useEffect/loadChallengeData
  const { data: challenge, isLoading: challengeLoading } = useChallenge(id);
  const { data: leaderboard = [], isLoading: leaderboardLoading } =
    useChallengeLeaderboard(id);

  // ✅ Mutations with auto cache invalidation — no manual reload needed
  const joinMutation = useJoinChallenge();
  const activateMutation = useActivateChallenge();

  const isLoading = challengeLoading || leaderboardLoading;

  const handleJoinChallenge = async () => {
    if (!id) return;
    try {
      await joinMutation.mutateAsync(id);
      toast({
        title: "Joined challenge!",
        description: "You have successfully joined the challenge.",
      });
      // ✅ No need to manually reload — cache auto-invalidates
    } catch (error: any) {
      toast({
        title: "Failed to join challenge",
        description:
          error.response?.data?.message || error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleActivateChallenge = async () => {
    if (!id) return;
    try {
      await activateMutation.mutateAsync({ id, status: "ACTIVE" });
      toast({
        title: "Challenge activated!",
        description: "Your challenge is now active.",
      });
      // ✅ No need to manually reload — cache auto-invalidates
    } catch {
      toast({
        title: "Failed to activate challenge",
        description: "Please try again.",
        variant: "destructive",
      });
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

  if (!challenge) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Challenge not found</h2>
        </div>
      </Layout>
    );
  }

  const daysRemaining = Math.ceil(
    (new Date(challenge.endDate).getTime() - Date.now()) /
    (1000 * 60 * 60 * 24)
  );

  const totalDays = Math.ceil(
    (new Date(challenge.endDate).getTime() -
      new Date(challenge.startDate).getTime()) /
    (1000 * 60 * 60 * 24)
  );

  const progress = Math.round(
    ((totalDays - daysRemaining) / totalDays) * 100
  );

  /** ✅ membership check */
  const isMember = leaderboard.some(
    (member: any) => member.userId === user?.id
  );

  return (
    <Layout>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">{challenge.name}</h1>
            <p className="text-muted-foreground">{challenge.description}</p>
          </div>

          <div className="flex gap-2 items-center">
            {challenge.status === "PENDING" &&
              challenge.ownerId === user?.id && (
                <Button
                  onClick={handleActivateChallenge}
                  disabled={activateMutation.isPending}
                  className="gap-2 gradient-primary"
                >
                  {activateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="h-4 w-4" />
                  )}
                  Activate
                </Button>
              )}

            {!isMember && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleJoinChallenge}
                disabled={joinMutation.isPending}
                className="gap-2"
              >
                {joinMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                Join Challenge
              </Button>
            )}

            {isMember && (
              <Badge
                variant="outline"
                className="bg-success/10 text-success"
              >
                Already Joined
              </Badge>
            )}
          </div>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="p-4">
            <Progress value={progress} />
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
                {leaderboard.map((m: any, i: number) => (
                  <div key={m.userId} className="border p-2 rounded mb-2">
                    #{i + 1} {m.userName || m.username}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <ProgressChart data={mockChartData} title="Team Progress" />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ChallengePage;
