const CACHE_KEY = 'vegosm_nodes'

export function loadNodes(durationMs) {
  const raw = localStorage.getItem(CACHE_KEY)
  if (!raw) return []

  const { timestamp, nodes } = JSON.parse(raw)
  if (Date.now() - timestamp > durationMs) {
    localStorage.removeItem(CACHE_KEY)
    return []
  }

  return nodes
}

export function saveNodes(newNodes) {
  const raw = localStorage.getItem(CACHE_KEY)
  const existing = raw ? JSON.parse(raw).nodes : []

  const knownIds = new Set(existing.map(n => n.id))
  const merged = [...existing, ...newNodes.filter(n => !knownIds.has(n.id))]

  localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), nodes: merged }))
}
