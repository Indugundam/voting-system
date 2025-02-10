
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
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
