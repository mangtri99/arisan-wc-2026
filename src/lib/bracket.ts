export function ownedTeamIds(players: { teamIds: string[] }[]): Set<string> {
  return new Set(players.flatMap((p) => p.teamIds))
}
