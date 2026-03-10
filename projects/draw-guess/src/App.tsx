import { useState, useCallback } from 'react'
import DrawCanvas, { type Stroke } from './components/DrawCanvas'
import { getRandomWord, WORD_CATEGORIES } from './data/words'

type CatType = (typeof WORD_CATEGORIES)[number]
import './App.css'

type Phase = 'lobby' | 'drawing' | 'guessing' | 'result'

function normalizeAnswer(s: string): string {
  return s.replace(/\s/g, '').toLowerCase()
}

function matchAnswer(guess: string, answer: string): boolean {
  const g = normalizeAnswer(guess)
  const a = normalizeAnswer(answer)
  return g === a || g.includes(a) || a.includes(g)
}

export default function App() {
  const [phase, setPhase] = useState<Phase>('lobby')
  const [word, setWord] = useState('')
  const [category, setCategory] = useState<CatType | ''>('')
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [guess, setGuess] = useState('')
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(0)
  const [lastCorrect, setLastCorrect] = useState(false)

  const startRound = useCallback(() => {
    const cat = WORD_CATEGORIES[Math.floor(Math.random() * WORD_CATEGORIES.length)]
    setCategory(cat)
    setWord(getRandomWord(cat))
    setStrokes([])
    setGuess('')
    setPhase('drawing')
    setRound((r) => r + 1)
  }, [])

  const finishDrawing = useCallback(() => {
    setPhase('guessing')
  }, [])

  const submitGuess = useCallback(() => {
    const correct = matchAnswer(guess, word)
    setLastCorrect(correct)
    if (correct) setScore((s) => s + 10)
    setPhase('result')
  }, [guess, word])

  const nextRound = useCallback(() => {
    startRound()
  }, [startRound])

  const resetGame = useCallback(() => {
    setPhase('lobby')
    setWord('')
    setCategory('')
    setStrokes([])
    setGuess('')
    setScore(0)
    setRound(0)
  }, [])

  return (
    <div className="dg-app">
      <header className="dg-header">
        <h1 className="dg-title">你画我猜</h1>
        <p className="dg-subtitle">Draw & Guess</p>
        {phase !== 'lobby' && (
          <div className="dg-score">
            第 {round} 轮 · 得分 <strong>{score}</strong>
          </div>
        )}
      </header>

      <main className="dg-main">
        {phase === 'lobby' && (
          <div className="dg-lobby">
            <div className="dg-lobby-card">
              <h2>开始游戏</h2>
              <p>选择题目后开始画画，猜对即可得分！</p>
              <button type="button" className="dg-btn dg-btn-primary" onClick={startRound}>
                开始
              </button>
            </div>
          </div>
        )}

        {phase === 'drawing' && (
          <div className="dg-game">
            <div className="dg-word-card">
              <span className="dg-word-label">题目</span>
              <span className="dg-word">{word}</span>
              {category && <span className="dg-category">{category}</span>}
            </div>
            <DrawCanvas strokes={strokes} onStrokesChange={setStrokes} />
            <button type="button" className="dg-btn dg-btn-primary" onClick={finishDrawing}>
              画好了
            </button>
          </div>
        )}

        {phase === 'guessing' && (
          <div className="dg-game">
            <div className="dg-canvas-preview">
              <DrawCanvas strokes={strokes} onStrokesChange={() => {}} disabled />
            </div>
            <div className="dg-guess-area">
              <input
                type="text"
                className="dg-input"
                placeholder="输入你的答案…"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitGuess()}
                autoFocus
              />
              <button type="button" className="dg-btn dg-btn-primary" onClick={submitGuess}>
                提交
              </button>
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="dg-game">
            <div className={`dg-result-card ${lastCorrect ? 'correct' : 'wrong'}`}>
              <span className="dg-result-emoji">{lastCorrect ? '🎉' : '😅'}</span>
              <h2>{lastCorrect ? '猜对了！' : '没猜对'}</h2>
              <p>答案是：<strong>{word}</strong></p>
            </div>
            <div className="dg-result-actions">
              <button type="button" className="dg-btn dg-btn-primary" onClick={nextRound}>
                下一轮
              </button>
              <button type="button" className="dg-btn dg-btn-ghost" onClick={resetGame}>
                重新开始
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
