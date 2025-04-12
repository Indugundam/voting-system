import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

interface SignUpMetadata {
  fullName: string;
  voterId?: string;
  role?: 'voter' | 'admin';
}

interface Profile {
  id: string;
  full_name: string;
  voter_id: string | null;
  role: 'voter' | 'admin' | 'candidate';
  created_at: string;
  updated_at: string;
}

// Function to add demo elections if none exist
const addDemoElectionsIfNeeded = async () => {
  // Check if there are any elections
  const { data: existingElections } = await supabase
    .from('elections')
    .select('id')
    .limit(1);

  if (existingElections && existingElections.length === 0) {
    // Add some demo elections
    const now = new Date();
    
    // Active election (today)
    const activeElection = {
      title: 'City Council Election 2025',
      description: 'Vote for your preferred candidate for the city council position.',
      start_date: now.toISOString(),
      end_date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      participant_count: 156,
      status: 'active',
    };
    
    // Upcoming election (in 5 days)
    const upcomingElection = {
      title: 'School Board Decision 2025',
      description: 'Vote on important decisions for the local school district.',
      start_date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      participant_count: 89,
      status: 'upcoming',
    };
    
    // Ended election (5 days ago)
    const endedElection = {
      title: 'Community Center Funding 2025',
      description: 'Decide how to allocate funds for the new community center.',
      start_date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      participant_count: 203,
      status: 'ended',
    };
    
    // Insert the elections
    await supabase.from('elections').insert([activeElection, upcomingElection, endedElection]);
    
    // Add candidates for each election
    const { data: elections } = await supabase.from('elections').select('id');
    
    if (elections && elections.length > 0) {
      const candidateImages = [
        'https://images.unsplash.com/photo-1560250097-0b93528c311a', // Professional man
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2', // Professional woman
        'https://images.unsplash.com/photo-1556157382-97eda2f9e2bf', // Another professional man
        'https://images.unsplash.com/photo-1580489944761-15a19d654956', // Another professional woman
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', // Young professional man
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91', // Mature woman
        'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce', // Middle-aged man
        'https://images.unsplash.com/photo-1517841905240-472988babdf9', // Young woman
      ];
      
      // Shuffle the images 
      const shuffledImages = [...candidateImages].sort(() => 0.5 - Math.random());
      
      const candidates = [
        { name: 'Alex Johnson', election_id: elections[0].id, image_url: shuffledImages[0] },
        { name: 'Maria Garcia', election_id: elections[0].id, image_url: shuffledImages[1] },
        { name: 'David Lee', election_id: elections[0].id, image_url: shuffledImages[2] },
        { name: 'Sarah Miller', election_id: elections[1].id, image_url: shuffledImages[3] },
        { name: 'James Wilson', election_id: elections[1].id, image_url: shuffledImages[4] },
        { name: 'Emma Brown', election_id: elections[2].id, image_url: shuffledImages[5] },
        { name: 'Robert Taylor', election_id: elections[2].id, image_url: shuffledImages[6] },
        { name: 'Jennifer Davis', election_id: elections[2].id, image_url: shuffledImages[7] },
      ];
      
      await supabase.from('candidates').insert(candidates);
      
      // Add some results for the ended election
      const results = [
        { election_id: elections[2].id, candidate_name: 'Emma Brown', votes: 87, image_url: shuffledImages[5] },
        { election_id: elections[2].id, candidate_name: 'Robert Taylor', votes: 65, image_url: shuffledImages[6] },
        { election_id: elections[2].id, candidate_name: 'Jennifer Davis', votes: 51, image_url: shuffledImages[7] },
      ];
      
      await supabase.from('election_results').insert(results);
    }
  }
};

// Function to update election statuses based on dates
const updateElectionStatuses = async () => {
  const now = new Date().toISOString();
  
  // Update active elections that have ended
  await supabase
    .from('elections')
    .update({ status: 'ended' })
    .eq('status', 'active')
    .lt('end_date', now);
  
  // Update upcoming elections that should be active
  await supabase
    .from('elections')
    .update({ status: 'active' })
    .eq('status', 'upcoming')
    .lte('start_date', now);
    
  // Check if any elections are ending today and generate results
  const { data: endingElections } = await supabase
    .from('elections')
    .select('id')
    .eq('status', 'active')
    .lt('end_date', new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString()); // Within 24 hours
    
  if (endingElections && endingElections.length > 0) {
    for (const election of endingElections) {
      // Get candidates for this election
      const { data: candidates } = await supabase
        .from('candidates')
        .select('id, name, image_url')
        .eq('election_id', election.id);
      
      if (candidates && candidates.length > 0) {
        // Check if results already exist
        const { data: existingResults } = await supabase
          .from('election_results')
          .select('id')
          .eq('election_id', election.id);
          
        if (!existingResults || existingResults.length === 0) {
          // Generate random results for each candidate
          const results = candidates.map(candidate => ({
            election_id: election.id,
            candidate_name: candidate.name,
            image_url: candidate.image_url,
            votes: Math.floor(Math.random() * 100) + 20, // Random number between 20 and 119
          }));
          
          await supabase.from('election_results').insert(results);
        }
      }
    }
  }
  
  // Periodically add new elections (randomly, about 10% chance each day)
  if (Math.random() < 0.1) {
    const now = new Date();
    const startDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    const endDate = new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000); // 9 days from now
    
    const electionTitles = [
      'District Budget Allocation',
      'Parks and Recreation Vote',
      'Library Funding Decision',
      'Transportation Improvement Plan',
      'Healthcare Initiative Vote',
      'Education Reform Proposal',
      'Environmental Protection Measure'
    ];
    
    const randomIndex = Math.floor(Math.random() * electionTitles.length);
    
    const newElection = {
      title: `${electionTitles[randomIndex]} ${new Date().getFullYear()}`,
      description: 'A new election has been added to the platform. Check the details and prepare to cast your vote!',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      participant_count: Math.floor(Math.random() * 200) + 50, // Random between 50 and 249
      status: 'upcoming',
    };
    
    const { data: insertedElection } = await supabase
      .from('elections')
      .insert(newElection)
      .select();
    
    if (insertedElection && insertedElection.length > 0) {
      const candidateNames = [
        'Thomas Anderson',
        'Michael Johnson',
        'Linda Williams',
        'Patricia Davis',
        'Barbara Miller',
        'Elizabeth Wilson',
        'James Moore',
        'Richard Taylor'
      ];
      
      const candidateImages = [
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
        'https://images.unsplash.com/photo-1552058544-f2b08422138a'
      ];
      
      // Select 2-4 random candidates
      const numCandidates = Math.floor(Math.random() * 3) + 2; // 2-4 candidates
      const shuffled = [...candidateNames].sort(() => 0.5 - Math.random());
      const selectedCandidates = shuffled.slice(0, numCandidates);
      const shuffledImages = [...candidateImages].sort(() => 0.5 - Math.random());
      
      const candidates = selectedCandidates.map((name, index) => ({
        name,
        election_id: insertedElection[0].id,
        image_url: shuffledImages[index]
      }));
      
      await supabase.from('candidates').insert(candidates);
    }
  }
};

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
        navigate('/dashboard');
      } else {
        setProfile(null);
      }
    });

    // Initialize demo elections if needed
    addDemoElectionsIfNeeded();
    
    // Update election statuses initially and then every hour
    updateElectionStatuses();
    const intervalId = setInterval(updateElectionStatuses, 60 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(intervalId);
    };
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to fetch user profile');
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error(error.message);
        return { error };
      }
      
      toast.success('Signed in successfully');
      navigate('/dashboard');
      return { data };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: SignUpMetadata) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata?.fullName,
            voter_id: metadata?.voterId,
            role: metadata?.role || 'voter',
          },
        },
      });
      
      if (error) {
        return { error };
      }
      
      toast.success('Check your email to verify your account');
      return { data };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
      return;
    }
    navigate('/');
  };

  return {
    user,
    profile,
    loading,
    signInWithEmail,
    signUp,
    signOut,
  };
}

export function useVotes() {
  const castVote = async (electionId: string, candidateId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('votes')
        .insert([{ election_id: electionId, candidate_id: candidateId, user_id: userId }]);
      
      if (error) throw error;
      toast.success('Vote cast successfully');
    } catch (error) {
      toast.error('Failed to cast vote');
    }
  };

  const getResults = async (electionId: string) => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('candidate_id, candidates(name, image_url)')
        .eq('election_id', electionId);
      
      if (error) throw error;
      return data;
    } catch (error) {
      toast.error('Failed to fetch results');
      return [];
    }
  };

  return { castVote, getResults };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; isRead: boolean }[]>([]);
  
  useEffect(() => {
    // Generate some initial notifications about active elections
    const fetchActiveElections = async () => {
      const { data } = await supabase
        .from('elections')
        .select('id, title')
        .eq('status', 'active');
        
      if (data && data.length > 0) {
        const electionNotifications = data.map((election, index) => ({
          id: `notification-${index}`,
          title: 'Active Election',
          message: `"${election.title}" is now open for voting! Cast your vote now.`,
          isRead: false
        }));
        
        setNotifications(electionNotifications);
      }
    };
    
    fetchActiveElections();
    
    // Listen for changes in elections status
    const channel = supabase
      .channel('election-status-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'elections', filter: 'status=eq.active' },
        (payload) => {
          const newElection = payload.new as any;
          setNotifications(prev => [
            {
              id: `notification-${Date.now()}`,
              title: 'New Active Election',
              message: `"${newElection.title}" is now open for voting!`,
              isRead: false
            },
            ...prev
          ]);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };
  
  const getUnreadCount = () => {
    return notifications.filter(n => !n.isRead).length;
  };
  
  return { notifications, markAsRead, markAllAsRead, getUnreadCount };
}
