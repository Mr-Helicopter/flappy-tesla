// ============================================================================
// SUPABASE CLIENT & LEADERBOARD API
// Handles score submissions via RPC and fetching the global top 10 rankings.
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { getOrGeneratePlayerId, getPlayerName, getHighScore } from './storage.js';

let _supabaseClient = null;

export function getSupabaseClient() {
  if (_supabaseClient) return _supabaseClient;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'YOUR_SUPABASE_URL' || !SUPABASE_URL.startsWith('http')) {
    return null;
  }
  try {
    _supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    _supabaseClient = null;
  }
  return _supabaseClient;
}

// Submit player score via Supabase RPC
export async function submitScoreToSupabase(score) {
  if (score <= 0) return;
  const client = getSupabaseClient();
  if (!client) return;

  const p_id = getOrGeneratePlayerId();
  const p_name = getPlayerName() || 'PILOT';
  const p_score = Math.floor(score);

  try {
    const { error } = await client.rpc('submit_score', {
      p_id: p_id,
      p_name: p_name,
      p_score: p_score
    });
    if (error) {
      console.warn('Supabase submit_score notice:', error.message);
    }
  } catch (err) {
    console.warn('Offline / network error submitting score:', err);
  }
}

// Fetch top 10 global leaderboard scores
export async function fetchLeaderboardData() {
  const client = getSupabaseClient();
  if (!client) {
    return { status: 'offline', data: [] };
  }

  try {
    let { data, error } = await client
      .from('scores')
      .select('player_id, name, score')
      .order('score', { ascending: false })
      .limit(10);

    if (error) {
      // Fallback to name, score in case player_id column is restricted
      const fallback = await client
        .from('scores')
        .select('name, score')
        .order('score', { ascending: false })
        .limit(10);
      if (fallback.error) throw fallback.error;
      data = fallback.data;
    }

    const myId = getOrGeneratePlayerId();
    const myName = getPlayerName();
    let playerEntry = null;

    if (data && Array.isArray(data)) {
      playerEntry = data.find(d => (d.player_id && d.player_id === myId) || (d.name && d.name === myName));
    }

    // If current player is not in top 10, fetch or retrieve their own best
    if (!playerEntry) {
      if (myId) {
        try {
          const { data: ownData } = await client
            .from('scores')
            .select('player_id, name, score')
            .eq('player_id', myId)
            .maybeSingle();
          if (ownData && ownData.score > 0) {
            playerEntry = ownData;
          }
        } catch (e) {}
      }
      if (!playerEntry) {
        const localBest = getHighScore();
        if (localBest > 0) {
          playerEntry = { name: myName || 'YOU', score: localBest };
        }
      }
    }

    return {
      status: 'ok',
      data: data || [],
      playerEntry: playerEntry
    };
  } catch (err) {
    console.warn('Leaderboard fetch notice:', err);
    return { status: 'offline', data: [] };
  }
}
