
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ElectionCard } from "@/components/ElectionCard";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Election {
  id: string;
  title: string;
  description: string;
  start_date: string;
  participant_count: number;
  status: 'upcoming' | 'active' | 'ended';
  candidates: Array<{ id: string; name: string }>;
}

const Dashboard = () => {
  const { profile, loading } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [electionLoading, setElectionLoading] = useState(true);

  useEffect(() => {
    const fetchElections = async () => {
      const { data, error } = await supabase
        .from("elections")
        .select(`
          *,
          candidates (
            id,
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Ensure the data matches the Election interface
        const typedElections = data.map(election => ({
          ...election,
          status: election.status as 'upcoming' | 'active' | 'ended'
        })) as Election[];
        
        setElections(typedElections);
      }
      setElectionLoading(false);
    };

    fetchElections();

    const channel = supabase
      .channel("elections")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "elections" },
        () => {
          fetchElections();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {profile?.full_name}</p>
                <p><span className="font-medium">Role:</span> {profile?.role}</p>
                {profile?.voter_id && (
                  <p><span className="font-medium">Voter ID:</span> {profile.voter_id}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Available Elections</h2>
            {electionLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {elections.map((election) => (
                  <ElectionCard
                    key={election.id}
                    id={election.id}
                    title={election.title}
                    description={election.description}
                    date={new Date(election.start_date).toLocaleDateString()}
                    participants={election.participant_count}
                    status={election.status}
                    candidates={election.candidates}
                  />
                ))}
                {elections.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No elections available at the moment.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
