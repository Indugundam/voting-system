
import { Calendar, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { useVotes } from "@/hooks/useAuth";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ElectionCardProps {
  title: string;
  description: string;
  date: string;
  participants: number;
  status: "upcoming" | "active" | "ended";
  id: string;
  candidates?: Array<{ id: string; name: string }>;
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
  const { castVote } = useVotes();
  const { user } = useAuth();

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
            onClick={() => status === "active" && setShowVoteDialog(true)}
          >
            {status === "active"
              ? "Vote Now"
              : status === "upcoming"
              ? "View Details"
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
    </>
  );
}
