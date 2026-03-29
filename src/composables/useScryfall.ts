import type { ScryfallCard } from '../types'

export const CACHE_NAME = 'inalla-sim-v1'
const USER_AGENT = 'VoidcasterSim/1.0 (https://github.com/voidcaster)'

const queue: Array<() => Promise<void>> = []
let running = false

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function processQueue() {
  if (running) return
  running = true
  while (queue.length > 0) {
    const task = queue.shift()!
    await task()
    await delay(75)
  }
  running = false
}

export async function fetchFromScryfallOrCache(cardName: string): Promise<ScryfallCard> {
  const cache = await caches.open(CACHE_NAME)
  const metaKey = `scryfall-meta-${cardName}`

  const cached = await cache.match(metaKey)
  if (cached) return cached.json() as Promise<ScryfallCard>

  const res = await fetch(
    `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`,
    {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
    }
  )
  if (!res.ok) throw new Error(`Scryfall fetch failed for "${cardName}": ${res.status}`)
  const data: ScryfallCard = await res.json()

  await cache.put(
    metaKey,
    new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    })
  )

  return data
}

function enqueue(cardName: string): Promise<ScryfallCard> {
  return new Promise((resolve, reject) => {
    queue.push(async () => {
      try {
        const data = await fetchFromScryfallOrCache(cardName)
        resolve(data)
      } catch (e) {
        reject(e)
      }
    })
    processQueue()
  })
}

async function getCardImage(imageUrl: string): Promise<string> {
  const cache = await caches.open(CACHE_NAME)

  const cached = await cache.match(imageUrl)
  if (cached) {
    const blob = await cached.blob()
    return URL.createObjectURL(blob)
  }

  const res = await fetch(imageUrl)
  await cache.put(imageUrl, res.clone())
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

function getArtCropUrl(card: ScryfallCard): string | null {
  if (card.image_uris?.art_crop) return card.image_uris.art_crop
  if (card.card_faces?.[0]?.image_uris?.art_crop) return card.card_faces[0].image_uris.art_crop
  return null
}

function getNormalUrl(card: ScryfallCard): string | null {
  if (card.image_uris?.normal) return card.image_uris.normal
  if (card.card_faces?.[0]?.image_uris?.normal) return card.card_faces[0].image_uris.normal
  return null
}

export function useScryfall() {
  return {
    enqueue,
    getCardImage,
    getArtCropUrl,
    getNormalUrl,
  }
}
