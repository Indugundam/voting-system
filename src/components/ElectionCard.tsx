
import { Calendar, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";

interface ElectionCardProps {
  title: string;
  description: string;
  date: string;
  participants: number;
  status: "upcoming" | "active" | "ended";
}

export function ElectionCard({ title, description, date, participants, status }: ElectionCardProps) {
  return (
    <Card className="w-full transition-all duration-200 hover:shadow-lg animate-enter">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{title}</h3>
          <span className={`px-3 py-1 rounded-full text-sm ${
            status === "active" ? "bg-primary/10 text-primary" :
            status === "upcoming" ? "bg-blue-500/10 text-blue-500" :
            "bg-gray-500/10 text-gray-500"
          }`}>
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
        <Button className="w-full" variant={status === "active" ? "default" : "secondary"}>
          {status === "active" ? "Vote Now" : status === "upcoming" ? "View Details" : "View Results"}
        </Button>
      </CardFooter>
    </Card>
  );
}
