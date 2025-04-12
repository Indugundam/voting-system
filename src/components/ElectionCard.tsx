
import { Calendar, Users, Trophy, Award } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { useVotes } from "@/hooks/useAuth";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface ElectionCardProps {
  title: string;
  description: string;
  date: string;
  participants: number;
  status: "upcoming" | "active" | "ended";
  id: string;
  candidates?: Array<{ id: string; name: string; image_url?: string }>;
}

interface VoteResult {
  candidate_name: string;
  vote_count: number;
  image_url?: string;
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

  const { data: results, isLoading } = useQuery({
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
        vote_count: item.votes || 0,
        image_url: item.image_url
      })).sort((a, b) => b.vote_count - a.vote_count); // Sort by vote count, highest first
    },
    enabled: status === 'ended'
  });

  const handleVote = async (candidateId: string) => {
    if (!user) return;
    await castVote(id, candidateId, user.id);
    toast.success("Your vote has been cast successfully!");
    setShowVoteDialog(false);
  };

  // Find the winner if this is an ended election
  const winner = results && results.length > 0 ? results[0] : null;

  return (
    <>
      <Card className={`w-full transition-all duration-200 hover:shadow-lg animate-enter ${status === 'ended' && winner ? 'border-2 border-primary/50' : ''}`}>
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
          
          {status === "ended" && winner && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Winner: <span className="font-bold">{winner.candidate_name}</span></p>
                  <p className="text-xs text-muted-foreground">{winner.vote_count} votes</p>
                </div>
              </div>
              <Avatar className="h-10 w-10 border-2 border-primary">
                {winner.image_url ? (
                  <AvatarImage src={winner.image_url} alt={winner.candidate_name} />
                ) : (
                  <AvatarFallback>{winner.candidate_name.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
            </div>
          )}
          
          {status === "active" && (
            <div className="mt-4 p-2 bg-primary/5 rounded-lg">
              <p className="text-sm text-center font-semibold flex items-center justify-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Voting is now open!
              </p>
            </div>
          )}
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
                className="w-full justify-start p-4 h-auto"
                onClick={() => handleVote(candidate.id)}
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar>
                    {candidate.image_url ? (
                      <AvatarImage src={candidate.image_url} alt={candidate.name} />
                    ) : (
                      <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                  <span>{candidate.name}</span>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Election Results</DialogTitle>
            <DialogDescription>
              Final results for {title}
            </DialogDescription>
          </DialogHeader>
          
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-4 pt-4">
              {winner && (
                <div className="bg-primary/10 p-4 rounded-lg text-center mb-6 border border-primary/20">
                  <div className="flex justify-center mb-2">
                    <Avatar className="h-20 w-20 border-2 border-primary">
                      {winner.image_url ? (
                        <AvatarImage src={winner.image_url} alt={winner.candidate_name} />
                      ) : (
                        <AvatarFallback>{winner.candidate_name.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <h3 className="font-bold text-lg flex items-center justify-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    {winner.candidate_name}
                  </h3>
                  <p className="font-medium">{winner.vote_count} votes</p>
                  <div className="mt-2 flex justify-center">
                    <div className="px-3 py-1 bg-primary/20 rounded-full text-xs font-semibold">
                      Winner
                    </div>
                  </div>
                </div>
              )}
              
              {results?.slice(1).map((result, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {result.image_url ? (
                        <AvatarImage src={result.image_url} alt={result.candidate_name} />
                      ) : (
                        <AvatarFallback>{result.candidate_name.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="font-medium">{result.candidate_name}</span>
                  </div>
                  <span className="text-muted-foreground">{result.vote_count} votes</span>
                </div>
              ))}
              
              {(!results || results.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No results available</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
