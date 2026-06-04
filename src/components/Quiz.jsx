import { useState } from 'react';
import {
  australianWineTests,
  calculateMatch,
  initialTaste,
  tasteParameters,
} from '../data/wineData';

function Quiz() {
  const [testWineId, setTestWineId] = useState(australianWineTests[0].id);
  const [testTaste, setTestTaste] = useState(initialTaste);
  const [hasSubmittedTest, setHasSubmittedTest] = useState(false);

  const testWine = australianWineTests.find((wine) => wine.id === testWineId);
  const testScore = testWine ? calculateMatch(testWine, testTaste) : 0;

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

  function resetTest() {
    setTestTaste(initialTaste);
    setHasSubmittedTest(false);
  }

  return (
    <main className="wine-app quiz-page">
      <section className="quiz-hero" aria-labelledby="quiz-title">
        <p className="wine-kicker">Tasting quiz</p>
        <h1 id="quiz-title">Score your read of an Australian wine.</h1>
        <p>
          Pick a wine, set the tasting parameters as you would describe it, then
          compare your profile with the stored target values.
        </p>
      </section>

      <section className="wine-panel wine-test" aria-labelledby="wine-test-title">
        <div className="section-heading">
          <p>Training mode</p>
          <h2 id="wine-test-title">Australian wine examples</h2>
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

export default Quiz;
