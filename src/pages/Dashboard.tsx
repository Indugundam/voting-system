
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ElectionCard } from "@/components/ElectionCard";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Election {
  id: string;
  title: string;
  description: string;
  start_date: string;
  participant_count: number;
  status: 'upcoming' | 'active' | 'ended';
  candidates: Array<{ id: string; name: string; image_url?: string }>;
}

const Dashboard = () => {
  const { profile, loading } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [electionLoading, setElectionLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElections = async () => {
      const { data, error } = await supabase
        .from("elections")
        .select(`
          *,
          candidates (
            id,
            name,
            image_url
          )
        `)
        .order("start_date", { ascending: false });

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

  // Separate elections by status
  const activeElections = elections.filter(e => e.status === 'active');
  const upcomingElections = elections.filter(e => e.status === 'upcoming');
  const completedElections = elections.filter(e => e.status === 'ended');

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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Elections Dashboard</h2>
              <Button variant="outline" onClick={() => navigate('/elections')}>
                View All Elections <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="active" className="relative">
                  Active
                  {activeElections.length > 0 && (
                    <span className="absolute top-0 right-1 w-2 h-2 bg-primary rounded-full"></span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                {electionLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeElections.map((election) => (
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
                    {activeElections.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No active elections at the moment.
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="upcoming">
                {electionLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {upcomingElections.map((election) => (
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
                    {upcomingElections.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No upcoming elections scheduled.
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completed">
                {electionLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {completedElections.map((election) => (
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
                    {completedElections.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No completed elections.
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
