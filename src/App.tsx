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
  encounter_name?: string
  real_name?: string
  subname?: string
}

function App() {
  const [cards, setCards] = useState<ArkhamCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [randomCard, setRandomCard] = useState<ArkhamCard | null>(null)

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

    const searchableText = [
      card.name,
      card.real_name,
      card.subname,
      card.text,
      card.type_name,
      card.faction_name,
      card.pack_name,
      card.encounter_code,
      card.encounter_name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchableText.includes(search)
  })

  function pickRandomCard() {
    if (filteredCards.length === 0) {
      return
    }

    const randomIndex = Math.floor(
      Math.random() * filteredCards.length
    )

    setRandomCard(filteredCards[randomIndex])
  }

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
          <button onClick={pickRandomCard}>
            Study Random Card
          </button>
          {randomCard && (
            <div className="random-card">
              <h2>Study Card</h2>

              {randomCard.imagesrc && (
                <img
                  src={`https://arkhamdb.com${randomCard.imagesrc}`}
                  alt={randomCard.name}
                />
              )}

              <h3>{randomCard.name}</h3>

              <p>
                <strong>Type:</strong> {randomCard.type_name}
              </p>

              <p>
                <strong>Pack:</strong> {randomCard.pack_name}
              </p>
            </div>
          )}
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
                    <strong>Encounter Set:</strong>{' '}
                    {card.encounter_name || card.encounter_code}
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

