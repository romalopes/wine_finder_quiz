import { useMemo, useState } from 'react';

const tasteParameters = [
  {
    id: 'acidity',
    label: 'Acidity',
    low: 'Soft',
    high: 'Sharp',
    help: 'How bright, fresh, or mouth-watering the wine feels.',
  },
  {
    id: 'body',
    label: 'Body',
    low: 'Light',
    high: 'Full',
    help: 'The weight and richness of the wine on your palate.',
  },
  {
    id: 'tannin',
    label: 'Tannin',
    low: 'Silky',
    high: 'Grippy',
    help: 'The drying texture, common in red wines.',
  },
  {
    id: 'sweetness',
    label: 'Sweetness',
    low: 'Dry',
    high: 'Sweet',
    help: 'How much sugar or ripe sweetness you perceive.',
  },
  {
    id: 'alcohol',
    label: 'Alcohol warmth',
    low: 'Cool',
    high: 'Warm',
    help: 'The heat or weight from alcohol.',
  },
  {
    id: 'fruit',
    label: 'Fruit intensity',
    low: 'Subtle',
    high: 'Expressive',
    help: 'How strongly fruit aromas and flavors stand out.',
  },
];

const wineProfiles = [
  {
    id: 'pinot-noir',
    name: 'Pinot Noir',
    color: 'Red',
    grapes: ['Pinot Noir'],
    regions: ['Burgundy', 'Oregon', 'New Zealand'],
    notes: ['cherry', 'raspberry', 'earth', 'violet'],
    serving: 'Great with roast chicken, mushrooms, salmon, and charcuterie.',
    parameters: {
      acidity: 4,
      body: 2,
      tannin: 2,
      sweetness: 1,
      alcohol: 2,
      fruit: 3,
    },
  },
  {
    id: 'cabernet-sauvignon',
    name: 'Cabernet Sauvignon',
    color: 'Red',
    grapes: ['Cabernet Sauvignon'],
    regions: ['Bordeaux', 'Napa Valley', 'Coonawarra'],
    notes: ['blackcurrant', 'cedar', 'graphite', 'mint'],
    serving: 'Built for steak, lamb, hard cheeses, and richer sauces.',
    parameters: {
      acidity: 3,
      body: 5,
      tannin: 5,
      sweetness: 1,
      alcohol: 4,
      fruit: 4,
    },
  },
  {
    id: 'merlot',
    name: 'Merlot',
    color: 'Red',
    grapes: ['Merlot'],
    regions: ['Right Bank Bordeaux', 'Washington State', 'Chile'],
    notes: ['plum', 'black cherry', 'cocoa', 'bay leaf'],
    serving: 'Easy with burgers, roast pork, tomato pasta, and soft cheeses.',
    parameters: {
      acidity: 3,
      body: 4,
      tannin: 3,
      sweetness: 1,
      alcohol: 3,
      fruit: 4,
    },
  },
  {
    id: 'syrah-shiraz',
    name: 'Syrah / Shiraz',
    color: 'Red',
    grapes: ['Syrah', 'Shiraz'],
    regions: ['Northern Rhone', 'Barossa Valley', 'McLaren Vale'],
    notes: ['blackberry', 'pepper', 'smoke', 'olive'],
    serving: 'Strong match for barbecue, grilled vegetables, lamb, and spices.',
    parameters: {
      acidity: 3,
      body: 5,
      tannin: 4,
      sweetness: 1,
      alcohol: 4,
      fruit: 5,
    },
  },
  {
    id: 'sangiovese',
    name: 'Sangiovese',
    color: 'Red',
    grapes: ['Sangiovese'],
    regions: ['Chianti', 'Brunello di Montalcino', 'Tuscany'],
    notes: ['red cherry', 'tomato leaf', 'dried herbs', 'leather'],
    serving: 'A natural partner for pizza, pasta, ragù, and grilled meats.',
    parameters: {
      acidity: 5,
      body: 3,
      tannin: 4,
      sweetness: 1,
      alcohol: 3,
      fruit: 3,
    },
  },
  {
    id: 'chardonnay',
    name: 'Chardonnay',
    color: 'White',
    grapes: ['Chardonnay'],
    regions: ['Burgundy', 'California', 'Margaret River'],
    notes: ['apple', 'citrus', 'butter', 'vanilla'],
    serving: 'Works with roast chicken, creamy sauces, seafood, and corn.',
    parameters: {
      acidity: 3,
      body: 4,
      tannin: 1,
      sweetness: 1,
      alcohol: 3,
      fruit: 3,
    },
  },
  {
    id: 'sauvignon-blanc',
    name: 'Sauvignon Blanc',
    color: 'White',
    grapes: ['Sauvignon Blanc'],
    regions: ['Marlborough', 'Loire Valley', 'Adelaide Hills'],
    notes: ['lime', 'passionfruit', 'grass', 'gooseberry'],
    serving: 'Bright with goat cheese, salads, prawns, herbs, and citrus.',
    parameters: {
      acidity: 5,
      body: 2,
      tannin: 1,
      sweetness: 1,
      alcohol: 2,
      fruit: 4,
    },
  },
  {
    id: 'riesling',
    name: 'Riesling',
    color: 'White',
    grapes: ['Riesling'],
    regions: ['Mosel', 'Clare Valley', 'Alsace'],
    notes: ['lime', 'green apple', 'jasmine', 'petrol'],
    serving: 'Excellent with spicy food, pork, seafood, and salty snacks.',
    parameters: {
      acidity: 5,
      body: 2,
      tannin: 1,
      sweetness: 3,
      alcohol: 2,
      fruit: 4,
    },
  },
  {
    id: 'prosecco',
    name: 'Prosecco',
    color: 'Sparkling',
    grapes: ['Glera'],
    regions: ['Veneto', 'Friuli'],
    notes: ['pear', 'apple blossom', 'melon', 'lemon'],
    serving: 'Pour with brunch, fried snacks, fresh fruit, and aperitivo plates.',
    parameters: {
      acidity: 4,
      body: 1,
      tannin: 1,
      sweetness: 2,
      alcohol: 1,
      fruit: 4,
    },
  },
  {
    id: 'rose',
    name: 'Dry Rose',
    color: 'Rose',
    grapes: ['Grenache', 'Cinsault', 'Syrah'],
    regions: ['Provence', 'Bandol', 'South Australia'],
    notes: ['strawberry', 'watermelon', 'citrus', 'white flowers'],
    serving: 'Flexible with seafood, picnic food, grilled chicken, and mezze.',
    parameters: {
      acidity: 4,
      body: 2,
      tannin: 1,
      sweetness: 1,
      alcohol: 2,
      fruit: 3,
    },
  },
];

const australianWineTests = [
  {
    id: 'penfolds-bin-389',
    name: 'Penfolds Bin 389 Cabernet Shiraz',
    region: 'South Australia',
    color: 'Red',
    prompt: 'Classic Australian cabernet shiraz: dark fruit, structure, oak spice, and generous weight.',
    parameters: {
      acidity: 3,
      body: 5,
      tannin: 4,
      sweetness: 1,
      alcohol: 4,
      fruit: 5,
    },
  },
  {
    id: 'henschke-hill-of-grace',
    name: 'Henschke Hill of Grace Shiraz',
    region: 'Eden Valley, South Australia',
    color: 'Red',
    prompt: 'A powerful but detailed old-vine shiraz style with spice, dark berries, and firm structure.',
    parameters: {
      acidity: 3,
      body: 5,
      tannin: 4,
      sweetness: 1,
      alcohol: 4,
      fruit: 4,
    },
  },
  {
    id: 'leeuwin-estate-art-series',
    name: 'Leeuwin Estate Art Series Chardonnay',
    region: 'Margaret River, Western Australia',
    color: 'White',
    prompt: 'Premium Margaret River chardonnay: citrus, stone fruit, creamy texture, and polished oak.',
    parameters: {
      acidity: 4,
      body: 4,
      tannin: 1,
      sweetness: 1,
      alcohol: 3,
      fruit: 4,
    },
  },
  {
    id: 'grosset-polish-hill',
    name: 'Grosset Polish Hill Riesling',
    region: 'Clare Valley, South Australia',
    color: 'White',
    prompt: 'Dry Clare Valley riesling: lime, floral lift, high acidity, and a lean mineral feel.',
    parameters: {
      acidity: 5,
      body: 1,
      tannin: 1,
      sweetness: 1,
      alcohol: 2,
      fruit: 3,
    },
  },
];

const initialTaste = tasteParameters.reduce((taste, parameter) => {
  return {
    ...taste,
    [parameter.id]: 3,
  };
}, {});

function calculateMatch(profile, selectedTaste) {
  const totalDistance = tasteParameters.reduce((total, parameter) => {
    return total + Math.abs(profile.parameters[parameter.id] - selectedTaste[parameter.id]);
  }, 0);

  const maxDistance = tasteParameters.length * 4;

  return Math.round((1 - totalDistance / maxDistance) * 100);
}

function Home() {
  const [selectedTaste, setSelectedTaste] = useState(initialTaste);
  const [selectedColor, setSelectedColor] = useState('All');
  const [testWineId, setTestWineId] = useState(australianWineTests[0].id);
  const [testTaste, setTestTaste] = useState(initialTaste);
  const [hasSubmittedTest, setHasSubmittedTest] = useState(false);

  const colorOptions = ['All', ...new Set(wineProfiles.map((profile) => profile.color))];
  const testWine = australianWineTests.find((wine) => wine.id === testWineId);
  const testScore = testWine ? calculateMatch(testWine, testTaste) : 0;

  const matches = useMemo(() => {
    return wineProfiles
      .filter((profile) => selectedColor === 'All' || profile.color === selectedColor)
      .map((profile) => ({
        ...profile,
        score: calculateMatch(profile, selectedTaste),
      }))
      .sort((first, second) => second.score - first.score)
      .slice(0, 4);
  }, [selectedTaste, selectedColor]);

  const bestMatch = matches[0];

  function handleTasteChange(parameterId, value) {
    setSelectedTaste((currentTaste) => ({
      ...currentTaste,
      [parameterId]: Number(value),
    }));
  }

  function handleTestTasteChange(parameterId, value) {
    setTestTaste((currentTaste) => ({
      ...currentTaste,
      [parameterId]: Number(value),
    }));
    setHasSubmittedTest(false);
  }

  function handleTestWineChange(value) {
    setTestWineId(value);
    setTestTaste(initialTaste);
    setHasSubmittedTest(false);
  }

  function resetTaste() {
    setSelectedTaste(initialTaste);
    setSelectedColor('All');
  }

  function resetTest() {
    setTestTaste(initialTaste);
    setHasSubmittedTest(false);
  }

  return (
    <main className="wine-app">
      <section className="wine-hero" aria-labelledby="wine-hero-title">
        <div className="wine-hero__content">
          <p className="wine-kicker">Wine finder</p>
          <h1 id="wine-hero-title">Identify a wine from how it tastes.</h1>
          <p>
            Tune the main tasting parameters and get likely wine styles, grapes,
            flavor clues, and food matches. The profile data is structured so it
            can later come from a database or API.
          </p>
        </div>

        <div className="wine-result-highlight" aria-live="polite">
          <span>Best match</span>
          <strong>{bestMatch?.name}</strong>
          <p>{bestMatch?.score}% profile fit</p>
        </div>
      </section>

      <section className="wine-workspace" aria-label="Wine identification controls and matches">
        <form className="wine-panel wine-controls">
          <div className="section-heading">
            <p>Parameters</p>
            <h2>Describe the glass</h2>
          </div>

          <fieldset className="wine-segmented">
            <legend>Wine color</legend>
            <div>
              {colorOptions.map((color) => (
                <button
                  className={selectedColor === color ? 'active' : ''}
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  type="button"
                >
                  {color}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="wine-sliders">
            {tasteParameters.map((parameter) => (
              <label className="wine-slider" key={parameter.id}>
                <span className="wine-slider__top">
                  <strong>{parameter.label}</strong>
                  <output>{selectedTaste[parameter.id]}</output>
                </span>
                <input
                  aria-describedby={`${parameter.id}-help`}
                  max="5"
                  min="1"
                  onChange={(event) => handleTasteChange(parameter.id, event.target.value)}
                  type="range"
                  value={selectedTaste[parameter.id]}
                />
                <span className="wine-slider__scale">
                  <small>{parameter.low}</small>
                  <small>{parameter.high}</small>
                </span>
                <em id={`${parameter.id}-help`}>{parameter.help}</em>
              </label>
            ))}
          </div>

          <button className="wine-reset" onClick={resetTaste} type="button">
            Reset profile
          </button>
        </form>

        <section className="wine-panel wine-matches" aria-labelledby="matches-title">
          <div className="section-heading">
            <p>Suggestions</p>
            <h2 id="matches-title">Most likely styles</h2>
          </div>

          <div className="wine-match-list">
            {matches.map((match) => (
              <article className="wine-match" key={match.id}>
                <div className="wine-match__header">
                  <div>
                    <span>{match.color}</span>
                    <h3>{match.name}</h3>
                  </div>
                  <strong>{match.score}%</strong>
                </div>

                <div className="wine-meter" aria-label={`${match.score}% match`}>
                  <span style={{ width: `${match.score}%` }} />
                </div>

                <dl>
                  <div>
                    <dt>Grapes</dt>
                    <dd>{match.grapes.join(', ')}</dd>
                  </div>
                  <div>
                    <dt>Regions</dt>
                    <dd>{match.regions.join(', ')}</dd>
                  </div>
                  <div>
                    <dt>Clues</dt>
                    <dd>{match.notes.join(', ')}</dd>
                  </div>
                </dl>

                <p>{match.serving}</p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="wine-panel wine-test" aria-labelledby="wine-test-title">
        <div className="section-heading">
          <p>Tasting test</p>
          <h2 id="wine-test-title">Score your read of an Australian wine</h2>
        </div>

        <div className="wine-test__intro">
          <label>
            <span>Choose a wine</span>
            <select
              onChange={(event) => handleTestWineChange(event.target.value)}
              value={testWineId}
            >
              {australianWineTests.map((wine) => (
                <option key={wine.id} value={wine.id}>
                  {wine.name}
                </option>
              ))}
            </select>
          </label>

          <article className="wine-test-card">
            <span>{testWine.color} - {testWine.region}</span>
            <h3>{testWine.name}</h3>
            <p>{testWine.prompt}</p>
          </article>
        </div>

        <div className="wine-test__grid">
          <div className="wine-sliders">
            {tasteParameters.map((parameter) => (
              <label className="wine-slider" key={parameter.id}>
                <span className="wine-slider__top">
                  <strong>{parameter.label}</strong>
                  <output>{testTaste[parameter.id]}</output>
                </span>
                <input
                  max="5"
                  min="1"
                  onChange={(event) => handleTestTasteChange(parameter.id, event.target.value)}
                  type="range"
                  value={testTaste[parameter.id]}
                />
                <span className="wine-slider__scale">
                  <small>{parameter.low}</small>
                  <small>{parameter.high}</small>
                </span>
              </label>
            ))}
          </div>

          <aside className="wine-test-result" aria-live="polite">
            <span>Your accuracy</span>
            <strong>{hasSubmittedTest ? `${testScore}%` : '--'}</strong>
            <p>
              {hasSubmittedTest
                ? 'This compares your parameter set with the stored profile for the selected wine.'
                : 'Fill the sliders, then submit your tasting profile.'}
            </p>

            {hasSubmittedTest && (
              <dl>
                {tasteParameters.map((parameter) => (
                  <div key={parameter.id}>
                    <dt>{parameter.label}</dt>
                    <dd>
                      You {testTaste[parameter.id]} / Target {testWine.parameters[parameter.id]}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="wine-test-actions">
              <button onClick={() => setHasSubmittedTest(true)} type="button">
                Check accuracy
              </button>
              <button onClick={resetTest} type="button">
                Try again
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default Home;
