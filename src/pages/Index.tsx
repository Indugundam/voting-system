
import { Header } from "@/components/Header";
import { ElectionCard } from "@/components/ElectionCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface Election {
  id: string;
  title: string;
  description: string;
  start_date: string;
  participant_count: number;
  status: 'upcoming' | 'active' | 'ended';
  candidates: Array<{ id: string; name: string; image_url?: string }>;
}

const Index = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    };

    fetchElections();

    // Subscribe to real-time changes
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div
            className="mb-8 animate-enter"
            style={{ "--delay": "0.1s" } as any}
          >
            <h1 className="text-4xl font-bold mb-2">Elections</h1>
            <p className="text-muted-foreground text-lg">
              Secure, transparent, and accessible voting platform
            </p>
          </div>

          <Tabs defaultValue="active" className="w-full mb-8">
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
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {activeElections.map((election, index) => (
                    <div
                      key={election.id}
                      className="animate-enter"
                      style={{ "--delay": `${(index + 1) * 0.1}s` } as any}
                    >
                      <ElectionCard
                        id={election.id}
                        title={election.title}
                        description={election.description}
                        date={new Date(election.start_date).toLocaleDateString()}
                        participants={election.participant_count}
                        status={election.status}
                        candidates={election.candidates}
                      />
                    </div>
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
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {upcomingElections.map((election, index) => (
                    <div
                      key={election.id}
                      className="animate-enter"
                      style={{ "--delay": `${(index + 1) * 0.1}s` } as any}
                    >
                      <ElectionCard
                        id={election.id}
                        title={election.title}
                        description={election.description}
                        date={new Date(election.start_date).toLocaleDateString()}
                        participants={election.participant_count}
                        status={election.status}
                        candidates={election.candidates}
                      />
                    </div>
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
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {completedElections.map((election, index) => (
                    <div
                      key={election.id}
                      className="animate-enter"
                      style={{ "--delay": `${(index + 1) * 0.1}s` } as any}
                    >
                      <ElectionCard
                        id={election.id}
                        title={election.title}
                        description={election.description}
                        date={new Date(election.start_date).toLocaleDateString()}
                        participants={election.participant_count}
                        status={election.status}
                        candidates={election.candidates}
                      />
                    </div>
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
      </main>
    </div>
  );
};

export default Index;
