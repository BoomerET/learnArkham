import { useEffect, useState } from 'react'
import './App.css'

type ArkhamCard = {
  code: string
  name: string
  type_name?: string
  faction_name?: string
  pack_name?: string
  text?: string
  imagesrc?: string
}

function App() {
  const [cards, setCards] = useState<ArkhamCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCards() {
      try {
        const response = await fetch(
          'https://arkhamdb.com/api/public/cards/?encounter=1'
        )

        if (!response.ok) {
          throw new Error(`ArkhamDB returned ${response.status}`)
        }

        const data = await response.json()
        setCards(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    loadCards()
  }, [])

  return (
    <main>
      <h1>Arkham Card Trainer</h1>

      {loading && <p>Loading cards from ArkhamDB...</p>}

      {error && <p className="error">Error: {error}</p>}

      {!loading && !error && (
        <>
          <p>Loaded {cards.length} cards.</p>

          <ul>
            {cards.slice(0, 20).map((card) => (
              <li key={card.code}>
                <strong>{card.name}</strong>
                {' — '}
                {card.type_name}
                {card.pack_name ? ` from ${card.pack_name}` : ''}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}

export default App

