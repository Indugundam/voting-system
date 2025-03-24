
import { Calendar, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { useVotes } from "@/hooks/useAuth";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ElectionCardProps {
  title: string;
  description: string;
  date: string;
  participants: number;
  status: "upcoming" | "active" | "ended";
  id: string;
  candidates?: Array<{ id: string; name: string }>;
}

interface VoteResult {
  candidate_name: string;
  vote_count: number;
}

export function ElectionCard({
  title,
  description,
  date,
  participants,
  status,
  id,
  candidates = [],
}: ElectionCardProps) {
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const { castVote } = useVotes();
  const { user } = useAuth();

  const { data: results } = useQuery({
    queryKey: ['election-results', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('election_results')
        .select('*')
        .eq('election_id', id);
      
      if (error) throw error;
      
      // Transform the data to match VoteResult interface
      return (data || []).map((item: any) => ({
        candidate_name: item.candidate_name,
        vote_count: item.votes || 0
      })) as VoteResult[];
    },
    enabled: status === 'ended'
  });

  const handleVote = async (candidateId: string) => {
    if (!user) return;
    await castVote(id, candidateId, user.id);
    setShowVoteDialog(false);
  };

  return (
    <>
      <Card className="w-full transition-all duration-200 hover:shadow-lg animate-enter">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{title}</h3>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                status === "active"
                  ? "bg-primary/10 text-primary"
                  : status === "upcoming"
                  ? "bg-blue-500/10 text-blue-500"
                  : "bg-gray-500/10 text-gray-500"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{description}</p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {date}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {participants} participants
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            variant={status === "active" ? "default" : "secondary"}
            onClick={() => {
              if (status === "active") {
                setShowVoteDialog(true);
              } else if (status === "ended") {
                setShowResultsDialog(true);
              }
            }}
          >
            {status === "active"
              ? "Vote Now"
              : status === "upcoming"
              ? "Coming Soon"
              : "View Results"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showVoteDialog} onOpenChange={setShowVoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cast Your Vote</DialogTitle>
            <DialogDescription>
              Select a candidate to cast your vote for {title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {candidates.map((candidate) => (
              <Button
                key={candidate.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleVote(candidate.id)}
              >
                {candidate.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Election Results</DialogTitle>
            <DialogDescription>
              Final results for {title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {results?.map((result, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="font-medium">{result.candidate_name}</span>
                <span className="text-muted-foreground">{result.vote_count} votes</span>
              </div>
            ))}
            {!results || results.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No results available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
