import { defineStore } from 'pinia'
import { useScryfall } from '../composables/useScryfall'
import { useGameStore } from './gameStore'

export const useScryfallStore = defineStore('scryfall', () => {
  const { enqueue, getCardImage, getArtCropUrl: getArtCropFromData, getNormalUrl } = useScryfall()

  /** Load metadata + full card image (for command zone, hand, battlefield). */
  async function loadCardData(instanceId: string, cardName: string) {
    const game = useGameStore()
    const card = game.allCards.find(c => c.instanceId === instanceId)
    if (!card) return

    try {
      const data = await enqueue(cardName)
      card.scryfallData = data
      const normalUrl = getNormalUrl(data)
      if (normalUrl) {
        card.normalImageUrl = await getCardImage(normalUrl)
      }
    } catch (e) {
      console.warn(`Failed to load card data for "${cardName}":`, e)
    } finally {
      card.isLoading = false
    }
  }

  /** Load metadata only — no image fetch. Used for library cards. */
  async function loadCardMetadata(instanceId: string, cardName: string) {
    const game = useGameStore()
    const card = game.allCards.find(c => c.instanceId === instanceId)
    if (!card) return

    try {
      const data = await enqueue(cardName)
      card.scryfallData = data
    } catch (e) {
      console.warn(`Failed to load metadata for "${cardName}":`, e)
    } finally {
      card.isLoading = false
    }
  }

  /** Load image for a card that already has Scryfall metadata loaded. */
  async function loadCardImage(instanceId: string) {
    const game = useGameStore()
    const card = game.allCards.find(c => c.instanceId === instanceId)
    if (!card?.scryfallData || card.normalImageUrl) return

    const normalUrl = getNormalUrl(card.scryfallData)
    if (!normalUrl) return

    try {
      card.normalImageUrl = await getCardImage(normalUrl)
    } catch (e) {
      console.warn(`Failed to load image for "${card.name}":`, e)
    }
  }

  /** Fetch art_crop URL for any card name (uses cache + queue). */
  async function getArtCropUrl(cardName: string): Promise<string | null> {
    try {
      const data = await enqueue(cardName)
      const artUrl = getArtCropFromData(data)
      if (!artUrl) return null
      return await getCardImage(artUrl)
    } catch {
      return null
    }
  }

  return { loadCardData, loadCardMetadata, loadCardImage, getArtCropUrl }
})
