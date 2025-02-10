
import { Header } from "@/components/Header";
import { ElectionCard } from "@/components/ElectionCard";

const MOCK_ELECTIONS = [
  {
    title: "Board of Directors Election 2024",
    description: "Annual election for the Board of Directors positions. Cast your vote for the candidates who will lead our organization.",
    date: "Mar 15, 2024",
    participants: 256,
    status: "active" as const,
  },
  {
    title: "Budget Proposal Vote",
    description: "Vote on the proposed budget allocation for the upcoming fiscal year. Your input matters in shaping our financial future.",
    date: "Mar 20, 2024",
    participants: 124,
    status: "upcoming" as const,
  },
  {
    title: "Committee Representatives",
    description: "Selection of representatives for various committees. Help choose the right people for these important positions.",
    date: "Feb 28, 2024",
    participants: 189,
    status: "ended" as const,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-enter" style={{ "--delay": "0.1s" } as any}>
            <h1 className="text-4xl font-bold mb-2">Welcome to VoteChain</h1>
            <p className="text-muted-foreground text-lg">
              Secure, transparent, and accessible voting platform
            </p>
          </div>
          
          <div className="space-y-6">
            {MOCK_ELECTIONS.map((election, index) => (
              <div
                key={election.title}
                className="animate-enter"
                style={{ "--delay": `${(index + 1) * 0.1}s` } as any}
              >
                <ElectionCard {...election} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
