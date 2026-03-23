import { createClient } from './supabase/client'
import type { ActiveGame, Player, Round, RoundScore } from '@/store/gameStore'
import type { SavedMatch } from '@/store/historyStore'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapPlayer(p: Record<string, unknown>): Player {
  return {
    id: p.id as string,
    name: p.name as string,
    color: p.color as string,
    textColor: p.text_color as string,
    position: p.position as number,
  }
}

function mapScore(s: Record<string, unknown>): RoundScore {
  return {
    playerId: s.player_id as string,
    score: s.score as number,
    isWinner: s.is_winner as boolean,
    penalties: s.penalties as number,
  }
}

function mapRound(r: Record<string, unknown>, scores: Record<string, unknown>[]): Round {
  return {
    id: r.id as string,
    roundNumber: r.round_number as number,
    createdAt: r.created_at as string,
    scores: scores.filter(s => s.round_id === r.id).map(mapScore),
  }
}

// ─── Match CRUD ───────────────────────────────────────────────────────────────

export async function createMatch(name: string, userId: string, penaltyRules: number[] = []) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('matches')
    .insert({ name, user_id: userId, status: 'active', penalty_rules: penaltyRules })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createPlayers(
  matchId: string,
  players: Omit<Player, 'id'>[]
) {
  const supabase = createClient()
  const rows = players.map(p => ({
    match_id: matchId,
    name: p.name,
    color: p.color,
    text_color: p.textColor,
    position: p.position,
  }))
  const { data, error } = await supabase
    .from('players')
    .insert(rows)
    .select()
  if (error) throw error
  return (data as Record<string, unknown>[]).map(mapPlayer)
}

export async function createRound(matchId: string, roundNumber: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('rounds')
    .insert({ match_id: matchId, round_number: roundNumber })
    .select()
    .single()
  if (error) throw error
  return data as Record<string, unknown>
}

export async function saveRoundScores(
  roundId: string,
  scores: RoundScore[]
) {
  const supabase = createClient()
  const rows = scores.map(s => ({
    round_id: roundId,
    player_id: s.playerId,
    score: s.score,
    is_winner: s.isWinner,
    penalties: s.penalties,
  }))
  const { error } = await supabase.from('round_scores').insert(rows)
  if (error) throw error
}

export async function updateRoundScores(
  roundId: string,
  scores: RoundScore[]
) {
  const supabase = createClient()
  // Delete existing scores for this round then re-insert
  const { error: delError } = await supabase
    .from('round_scores')
    .delete()
    .eq('round_id', roundId)
  if (delError) throw delError
  await saveRoundScores(roundId, scores)
}

export async function finishMatch(matchId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('matches')
    .update({ status: 'finished', finished_at: new Date().toISOString() })
    .eq('id', matchId)
  if (error) throw error
}

export async function deleteMatch(matchId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId)
  if (error) throw error
}

// ─── Query: active game ───────────────────────────────────────────────────────

export async function getActiveMatch(userId: string): Promise<ActiveGame | null> {
  const supabase = createClient()

  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (!match) return null

  const [{ data: players }, { data: rounds }] = await Promise.all([
    supabase.from('players').select('*').eq('match_id', match.id).order('position'),
    supabase.from('rounds').select('*').eq('match_id', match.id).order('round_number'),
  ])

  const roundIds = (rounds ?? []).map((r: Record<string, unknown>) => r.id as string)
  const { data: scores } = roundIds.length
    ? await supabase.from('round_scores').select('*').in('round_id', roundIds)
    : { data: [] }

  return {
    id: match.id as string,
    matchName: match.name as string,
    status: 'active',
    createdAt: match.created_at as string,
    penaltyRules: (match.penalty_rules as number[]) ?? [],
    players: (players ?? []).map(p => mapPlayer(p as Record<string, unknown>)),
    rounds: (rounds ?? []).map(r =>
      mapRound(r as Record<string, unknown>, (scores ?? []) as Record<string, unknown>[])
    ),
  }
}

// ─── Query: user match list ───────────────────────────────────────────────────

export async function getUserMatches(userId: string): Promise<SavedMatch[]> {
  const supabase = createClient()

  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'finished')
    .order('finished_at', { ascending: false })

  if (error || !matches?.length) return []

  const matchIds = matches.map((m: Record<string, unknown>) => m.id as string)

  const [{ data: players }, { data: rounds }] = await Promise.all([
    supabase.from('players').select('*').in('match_id', matchIds).order('position'),
    supabase.from('rounds').select('*').in('match_id', matchIds).order('round_number'),
  ])

  const roundIds = (rounds ?? []).map((r: Record<string, unknown>) => r.id as string)
  const { data: scores } = roundIds.length
    ? await supabase.from('round_scores').select('*').in('round_id', roundIds)
    : { data: [] }

  return matches.map((m: Record<string, unknown>) => {
    const matchPlayers = (players ?? [])
      .filter((p: Record<string, unknown>) => p.match_id === m.id)
      .map(p => mapPlayer(p as Record<string, unknown>))

    const matchRounds = (rounds ?? [])
      .filter((r: Record<string, unknown>) => r.match_id === m.id)
      .map(r => mapRound(r as Record<string, unknown>, (scores ?? []) as Record<string, unknown>[]))

    return {
      id: m.id as string,
      matchName: m.name as string,
      status: 'finished' as const,
      createdAt: m.created_at as string,
      finishedAt: m.finished_at as string,
      penaltyRules: (m.penalty_rules as number[]) ?? [],
      players: matchPlayers,
      rounds: matchRounds,
    }
  })
}

// ─── Query: single match detail ───────────────────────────────────────────────

export async function getMatchDetail(matchId: string): Promise<SavedMatch | null> {
  const supabase = createClient()

  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .maybeSingle()

  if (!match) return null

  const [{ data: players }, { data: rounds }] = await Promise.all([
    supabase.from('players').select('*').eq('match_id', matchId).order('position'),
    supabase.from('rounds').select('*').eq('match_id', matchId).order('round_number'),
  ])

  const roundIds = (rounds ?? []).map((r: Record<string, unknown>) => r.id as string)
  const { data: scores } = roundIds.length
    ? await supabase.from('round_scores').select('*').in('round_id', roundIds)
    : { data: [] }

  return {
    id: match.id as string,
    matchName: match.name as string,
    status: match.status as 'finished',
    createdAt: match.created_at as string,
    finishedAt: match.finished_at as string,
    penaltyRules: (match.penalty_rules as number[]) ?? [],
    players: (players ?? []).map(p => mapPlayer(p as Record<string, unknown>)),
    rounds: (rounds ?? []).map(r =>
      mapRound(r as Record<string, unknown>, (scores ?? []) as Record<string, unknown>[])
    ),
  }
}
