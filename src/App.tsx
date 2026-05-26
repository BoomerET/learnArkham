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
  const [searchText, setSearchText] = useState('')

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

  const filteredCards = cards.filter((card) => {
  const search = searchText.toLowerCase()

  return (
    card.name.toLowerCase().includes(search) ||
    card.text?.toLowerCase().includes(search) ||
    card.type_name?.toLowerCase().includes(search) ||
    card.pack_name?.toLowerCase().includes(search)
  )
})

  return (
    <main>
      <h1>Arkham Card Trainer</h1>

      {loading && <p>Loading cards from ArkhamDB...</p>}

      {error && <p className="error">Error: {error}</p>}

      {!loading && !error && (
        <>
          <p>Loaded {cards.length} cards.</p>

<input
  type="search"
  placeholder="Search by name, text, type, or pack..."
  value={searchText}
  onChange={(event) => setSearchText(event.target.value)}
/>

<p>Showing {filteredCards.length} matching cards.</p>

<ul>
  {filteredCards.slice(0, 50).map((card) => (
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

