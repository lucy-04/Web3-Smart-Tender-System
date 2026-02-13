/**
 * Convert a date input string (e.g. "2025-10-20T12:00") to Unix timestamp (seconds).
 */
export function dateToTimestamp(dateString) {
  return Math.floor(new Date(dateString).getTime() / 1000);
}

/**
 * Convert a unix timestamp (seconds, BigInt or Number) to a human-readable date string.
 */
export function timestampToDate(timestamp) {
  const ts = Number(timestamp);
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * Truncate an Ethereum address for display: 0x1234...abcd
 */
export function truncateAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Determine the current phase of a tender.
 * Returns: "Commit" | "Reveal" | "Evaluation" | "Completed"
 */
export function getTenderPhase(tender) {
  const now = Math.floor(Date.now() / 1000);
  const commit = Number(tender.commitDeadline);
  const reveal = Number(tender.revealDeadline);

  if (tender.winnerSelected) return 'Completed';
  if (now <= commit) return 'Commit';
  if (now <= reveal) return 'Reveal';
  return 'Evaluation';
}

/**
 * Get a color class for a phase badge.
 */
export function getPhaseColor(phase) {
  switch (phase) {
    case 'Commit': return 'bg-cyan-500/20 text-cyan-400';
    case 'Reveal': return 'bg-amber-500/20 text-amber-400';
    case 'Evaluation': return 'bg-purple-500/20 text-purple-400';
    case 'Completed': return 'bg-green-500/20 text-green-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
}

/**
 * Format wei to ETH string.
 */
export function formatEth(wei) {
  if (!wei) return '0';
  const eth = Number(wei) / 1e18;
  return eth.toLocaleString('en-US', { maximumFractionDigits: 6 });
}
