// ============================================================================
// LEADERBOARD UI & SAFE TABLE RENDERING
// Safely renders leaderboard rows with textContent (zero innerHTML injection)
// and handles online/offline/loading telemetry states.
// ============================================================================

import { getOrGeneratePlayerId, getPlayerName } from './storage.js';
import { fetchLeaderboardData } from './supabase.js';

// Render leaderboard rows safely using textContent to prevent XSS
export function renderLeaderboardTable(containerEl, result, currentPlayerId) {
  if (!containerEl) return;
  containerEl.textContent = ''; // Clear container safely

  if (result.status === 'loading') {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'lb-status lb-loading';
    loadingDiv.textContent = 'CONNECTING TO STARBASE COMM...';
    containerEl.appendChild(loadingDiv);
    return;
  }

  if (result.status === 'offline') {
    const offlineDiv = document.createElement('div');
    offlineDiv.className = 'lb-status lb-offline';
    offlineDiv.textContent = 'LEADERBOARD OFFLINE';
    const subDiv = document.createElement('div');
    subDiv.className = 'lb-offline-sub';
    subDiv.textContent = 'Telemetry stored locally';
    containerEl.appendChild(offlineDiv);
    containerEl.appendChild(subDiv);
    return;
  }

  const entries = result.data || [];
  if (entries.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'lb-status';
    emptyDiv.textContent = 'NO FLIGHT RECORDS YET — BE THE FIRST!';
    containerEl.appendChild(emptyDiv);
    return;
  }

  const listEl = document.createElement('div');
  listEl.className = 'lb-list';

  let foundCurrentInList = false;
  const myName = getPlayerName();

  entries.forEach((entry, index) => {
    const rank = index + 1;
    const isCurrentPlayer = (entry.player_id && entry.player_id === currentPlayerId) ||
                            (entry.name && entry.name === myName);
    if (isCurrentPlayer) foundCurrentInList = true;

    const rowEl = document.createElement('div');
    rowEl.className = 'lb-row' + (isCurrentPlayer ? ' lb-row-current' : '') + (rank <= 3 ? ` lb-rank-${rank}` : '');

    const rankSpan = document.createElement('span');
    rankSpan.className = 'lb-rank';
    rankSpan.textContent = rank === 1 ? '🥇 #1' : rank === 2 ? '🥈 #2' : rank === 3 ? '🥉 #3' : `#${rank}`;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'lb-name';
    nameSpan.textContent = entry.name || 'ANONYMOUS'; // Safely escaped via textContent

    if (isCurrentPlayer) {
      const youBadge = document.createElement('span');
      youBadge.className = 'lb-you-badge';
      youBadge.textContent = 'YOU';
      nameSpan.appendChild(youBadge);
    }

    const scoreSpan = document.createElement('span');
    scoreSpan.className = 'lb-score';
    scoreSpan.textContent = (entry.score !== undefined ? entry.score : 0).toString();

    rowEl.appendChild(rankSpan);
    rowEl.appendChild(nameSpan);
    rowEl.appendChild(scoreSpan);
    listEl.appendChild(rowEl);
  });

  containerEl.appendChild(listEl);

  // If player is not in top 10, render their personal best below the list
  if (!foundCurrentInList && result.playerEntry && result.playerEntry.score > 0) {
    const dividerEl = document.createElement('div');
    dividerEl.className = 'lb-divider';
    containerEl.appendChild(dividerEl);

    const ownRowEl = document.createElement('div');
    ownRowEl.className = 'lb-row lb-row-current lb-row-own';

    const rankSpan = document.createElement('span');
    rankSpan.className = 'lb-rank';
    rankSpan.textContent = 'YOU';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'lb-name';
    nameSpan.textContent = result.playerEntry.name || myName || 'YOU';

    const youBadge = document.createElement('span');
    youBadge.className = 'lb-you-badge';
    youBadge.textContent = 'BEST';
    nameSpan.appendChild(youBadge);

    const scoreSpan = document.createElement('span');
    scoreSpan.className = 'lb-score';
    scoreSpan.textContent = result.playerEntry.score.toString();

    ownRowEl.appendChild(rankSpan);
    ownRowEl.appendChild(nameSpan);
    ownRowEl.appendChild(scoreSpan);
    containerEl.appendChild(ownRowEl);
  }
}

// Load leaderboard into any container element with loading state
export async function loadLeaderboardView(containerEl) {
  if (!containerEl) return;
  renderLeaderboardTable(containerEl, { status: 'loading' });
  const result = await fetchLeaderboardData();
  const myId = getOrGeneratePlayerId();
  renderLeaderboardTable(containerEl, result, myId);
}

// Refresh active leaderboards
export function refreshLeaderboards() {
  const modalContent = document.getElementById('leaderboard-modal-content');
  const goContent = document.getElementById('gameover-leaderboard-content');
  if (document.getElementById('leaderboard-modal')?.classList.contains('active')) {
    loadLeaderboardView(modalContent);
  }
  if (document.getElementById('gameover-leaderboard-panel')?.classList.contains('active')) {
    loadLeaderboardView(goContent);
  }
}
