
import { Header } from "@/components/Header";
import { ElectionCard } from "@/components/ElectionCard";
import { useEffect, useState } from "react";
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

const Index = () => {
  const [elections, setElections] = useState<Election[]>([]);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div
            className="mb-8 animate-enter"
            style={{ "--delay": "0.1s" } as any}
          >
            <h1 className="text-4xl font-bold mb-2">Welcome to VoteChain</h1>
            <p className="text-muted-foreground text-lg">
              Secure, transparent, and accessible voting platform
            </p>
          </div>

          <div className="space-y-6">
            {elections.map((election: Election, index: number) => (
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
