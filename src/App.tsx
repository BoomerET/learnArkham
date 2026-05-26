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
  position?: number
  encounter_code?: string
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

          <div className="card-grid">
            {filteredCards.slice(0, 50).map((card) => (
              <div className="card" key={card.code}>
                {card.imagesrc && (
                  <img
                    src={`https://arkhamdb.com${card.imagesrc}`}
                    alt={card.name}
                  />
                )}

                <h2>{card.name}</h2>

                <p><strong>Type:</strong> {card.type_name || 'Unknown'}</p>
                <p><strong>Faction:</strong> {card.faction_name || 'None'}</p>
                <p><strong>Pack:</strong> {card.pack_name || 'Unknown'}</p>
                <p>
                  <strong>Card #:</strong> {card.position || 'Unknown'}
                </p>

                <p>
                  <strong>Code:</strong> {card.code}
                </p>

                {card.encounter_code && (
                  <p>
                    <strong>Encounter Set:</strong> {card.encounter_code}
                  </p>
                )}
                {card.text && (
                  <div className="card-text" dangerouslySetInnerHTML={{ __html: card.text }} />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}

export default App

