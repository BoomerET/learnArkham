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
  backimagesrc?: string
}

function getCardImageUrl(card: ArkhamCard, side: 'front' | 'back' = 'front') {
  if (side === 'back') {
    if (card.backimagesrc) {
      return `https://arkhamdb.com${card.backimagesrc}`
    }

    return `https://assets.arkham.build/optimized/${card.code}b.jpg`
  }

  if (card.imagesrc) {
    return `https://arkhamdb.com${card.imagesrc}`
  }

  return `https://assets.arkham.build/optimized/${card.code}.jpg`
}

function getZoomClass(card: ArkhamCard) {
  if (
    card.type_name === 'Agenda' ||
    card.type_name === 'Act' ||
    card.type_name === 'Scenario' ||
    card.type_name === 'Location'
  ) {
    return 'zoom-landscape'
  }

  if (card.type_name === 'Investigator') {
    return 'zoom-investigator'
  }

  return 'zoom-portrait'
}

function App() {
  const [cards, setCards] = useState<ArkhamCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [randomCard, setRandomCard] = useState<ArkhamCard | null>(null)
  const [hoveredCard, setHoveredCard] = useState<ArkhamCard | null>(null)
  const [shiftHeld, setShiftHeld] = useState(false)
  const [showBack, setShowBack] = useState(false)
  const [packFilter, setPackFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [encounterFilter, setEncounterFilter] = useState('')
  const [hideText, setHideText] = useState(false)


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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Shift') {
        setShiftHeld(true)
      }

      if (event.shiftKey && event.key.toLowerCase() === 'f') {
        setShowBack((current) => !current)
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.key === 'Shift') {
        setShiftHeld(false)
        setShowBack(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const packOptions = Array.from(
    new Set(cards.map((card) => card.pack_name).filter(Boolean))
  ).sort()

  const typeOptions = Array.from(
    new Set(cards.map((card) => card.type_name).filter(Boolean))
  ).sort()

  const encounterOptions = Array.from(
    new Set(cards.map((card) => card.encounter_name).filter(Boolean))
  ).sort()

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

    const matchesSearch = searchableText.includes(search)
    const matchesPack = !packFilter || card.pack_name === packFilter
    const matchesType = !typeFilter || card.type_name === typeFilter
    const matchesEncounter =
      !encounterFilter || card.encounter_name === encounterFilter

    return (
      matchesSearch &&
      matchesPack &&
      matchesType &&
      matchesEncounter
    )
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
          <div className="filters">
            <select
              value={packFilter}
              onChange={(event) => setPackFilter(event.target.value)}
            >
              <option value="">All packs</option>
              {packOptions.map((pack) => (
                <option key={pack} value={pack}>
                  {pack}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="">All types</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={encounterFilter}
              onChange={(event) => setEncounterFilter(event.target.value)}
            >
              <option value="">All encounter sets</option>
              {encounterOptions.map((encounter) => (
                <option key={encounter} value={encounter}>
                  {encounter}
                </option>
              ))}
            </select>
          </div>

          <input
            type="search"
            placeholder="Search by name, text, type, or pack..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <button onClick={pickRandomCard}>
            Study Random Card
          </button>
          <button onClick={() => setHideText((current) => !current)}>
            {hideText ? 'Show Card Text' : 'Hide Card Text'}
          </button>
          {randomCard && (
            <div
              className="random-card"
              onMouseEnter={() => setHoveredCard(randomCard)}
              onMouseLeave={() => {
                setHoveredCard(null)
                setShowBack(false)
              }}
            >
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
              {!hideText && randomCard.text && (
                <div
                  className="card-text"
                  dangerouslySetInnerHTML={{ __html: randomCard.text }}
                />
              )}
            </div>
          )}
          <p>Showing {filteredCards.length} matching cards.</p>

          <div className="card-grid">
            {filteredCards.slice(0, 50).map((card) => (
              <div
                className="card"
                key={card.code}
                onMouseEnter={() => setHoveredCard(card)}
                onMouseLeave={() => {
                  setHoveredCard(null)
                  setShowBack(false)
                }}
              >
                {card.imagesrc && (
                  <img
                    src={getCardImageUrl(card)}
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
                {!hideText && card.text && (
                  <div className="card-text" dangerouslySetInnerHTML={{ __html: card.text }} />
                )}
              </div>
            ))}
          </div>
        </>
      )}
      {hoveredCard && shiftHeld && (
        <div className="zoom-card">
          <img
            className={getZoomClass(hoveredCard)}
            src={getCardImageUrl(
              hoveredCard,
              showBack ? 'back' : 'front'
            )}
            alt={hoveredCard.name}
          />

          <p>Hold Shift + press F to flip</p>
        </div>
      )}
    </main>
  )
}

export default App

