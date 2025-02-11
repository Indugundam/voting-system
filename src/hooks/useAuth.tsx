
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
  role: 'voter' | 'admin';
}

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
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success('Signed in successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const signUp = async (email: string, password: string, metadata?: SignUpMetadata) => {
    try {
      const { error } = await supabase.auth.signUp({
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
      if (error) throw error;
      toast.success('Check your email to verify your account');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
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
        .select('candidate_id, candidates(name)')
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
