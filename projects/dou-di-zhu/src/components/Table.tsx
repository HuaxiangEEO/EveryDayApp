import { useEffect, useMemo, useRef, useState } from 'react';
import type { Card } from '../types';
import { useGame } from '../state/GameContext';
import { useAITurn } from '../hooks/useAITurn';
import { sortHand } from '../core/deck';
import { Hand } from './Hand';
import { PlayerSeat } from './PlayerSeat';
import { PlayedArea } from './PlayedArea';
import { BidPanel } from './BidPanel';
import { ActionBar } from './ActionBar';
import { ScorePanel } from './ScorePanel';
import { RecordPanel } from './RecordPanel';
import { Modal } from './Modal';
import { SettingsView } from './SettingsView';
import { StatsView } from './StatsView';
import { SavedGamesList } from './SavedGamesList';
import { ReplayView } from './ReplayView';
import { accumulateStats, appendSavedGame, type SavedGame } from '../utils/storage';
import { playSound } from '../utils/sound';
import { useSettings } from '../state/SettingsContext';
import styles from './Table.module.css';

export function Table() {
  const { state, dispatch } = useGame();
  const { settings } = useSettings();
  useAITurn();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [compact, setCompact] = useState<boolean>(window.innerWidth < 720);
  const [openModal, setOpenModal] = useState<null | 'settings' | 'stats' | 'savedGames' | 'replay'>(null);
  const [replayGame, setReplayGame] = useState<SavedGame | null>(null);
  const lastSavedId = useRef<string | null>(null);
  const lastHistoryLen = useRef<number>(0);
  const lastPhase = useRef<string>(state.phase);

  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < 720);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // 阶段切换或对手出牌后清空选择
  useEffect(() => {
    setSelected(new Set());
  }, [state.phase, state.currentTurn]);

  // 结算后自动保存对局到 localStorage（每局只保存一次）
  useEffect(() => {
    if (state.phase !== 'settled') {
      lastSavedId.current = null;
      return;
    }
    if (!state.result || !state.initialHands || state.landlord === null) return;
    const id = `${Date.now()}-${state.history.length}`;
    if (lastSavedId.current === id) return;
    lastSavedId.current = id;

    const game: SavedGame = {
      id,
      ts: Date.now(),
      initialHands: state.initialHands,
      bottom: state.bottom,
      landlord: state.landlord,
      basePoint: state.basePoint,
      history: state.history,
      result: state.result,
    };
    appendSavedGame(game);
    accumulateStats(game, 0);
  }, [state.phase, state.result, state.initialHands, state.bottom, state.landlord, state.basePoint, state.history]);

  // 音效：监听 history 增量与阶段切换
  useEffect(() => {
    if (!settings.soundEnabled) {
      lastHistoryLen.current = state.history.length;
      lastPhase.current = state.phase;
      return;
    }
    const prevLen = lastHistoryLen.current;
    if (state.history.length > prevLen) {
      const newMoves = state.history.slice(prevLen);
      for (const m of newMoves) {
        if (m.kind === 'pass') {
          playSound('pass');
        } else if (m.type.kind === 'rocket') {
          playSound('rocket');
        } else if (m.type.kind === 'bomb') {
          playSound('bomb');
        } else {
          playSound('play');
        }
      }
    }
    if (state.phase === 'settled' && lastPhase.current !== 'settled' && state.result) {
      const playerWin =
        (state.result.winnerSide === 'landlord' && state.landlord === 0) ||
        (state.result.winnerSide === 'farmer' && state.landlord !== 0);
      playSound(playerWin ? 'win' : 'lose');
    }
    lastHistoryLen.current = state.history.length;
    lastPhase.current = state.phase;
  }, [state.history, state.phase, state.result, state.landlord, settings.soundEnabled]);

  const myHand = state.hands[0];
  const myHandSorted = useMemo(() => sortHand(myHand), [myHand]);

  const toggle = (card: Card) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(card.id)) next.delete(card.id);
      else next.add(card.id);
      return next;
    });
  };

  const selectedCards = useMemo(
    () => myHand.filter(c => selected.has(c.id)),
    [myHand, selected],
  );

  const seatLastPlayCards = (seat: 0 | 1 | 2) => {
    if (state.lastPlay && state.lastPlay.by === seat) return state.lastPlay.cards;
    return [];
  };

  const seatPassed = (seat: 0 | 1 | 2) => {
    if (state.phase !== 'playing') return false;
    for (let i = state.history.length - 1; i >= 0; i--) {
      const m = state.history[i];
      if (m.by === seat) return m.kind === 'pass';
    }
    return false;
  };

  const seatBid = (seat: 0 | 1 | 2): number | null => {
    if (state.phase !== 'bidding') return null;
    for (let i = state.bidLog.length - 1; i >= 0; i--) {
      if (state.bidLog[i].by === seat) return state.bidLog[i].bid;
    }
    return null;
  };

  const phaseLabel = (() => {
    switch (state.phase) {
      case 'dealing': return '发牌中';
      case 'bidding': return '叫地主';
      case 'playing': return '出牌中';
      case 'settled': return '已结束';
    }
  })();

  return (
    <div className={styles.table}>
      <div className={styles.topBar}>
        <div className={styles.title}>斗 地 主</div>
        <div className={styles.meta}>
          <span className={styles.metaPill}>阶段：{phaseLabel}</span>
          <span className={styles.metaPill}>底分：{state.basePoint}</span>
          <span className={styles.metaPill}>倍数：×{state.multiplier}</span>
          <button className={styles.btn} onClick={() => dispatch({ type: 'START_GAME' })}>
            重新开局
          </button>
          <button className={styles.btn} onClick={() => setOpenModal('settings')}>设置</button>
          <button className={styles.btn} onClick={() => setOpenModal('savedGames')}>复盘</button>
          <button className={styles.btn} onClick={() => setOpenModal('stats')}>统计</button>
        </div>
      </div>

      <div className={styles.middle}>
        <div className={styles.left}>
          <PlayerSeat
            player={state.players[2]}
            cardCount={state.hands[2].length}
            active={
              (state.phase === 'bidding' && state.bidTurn === 2) ||
              (state.phase === 'playing' && state.currentTurn === 2)
            }
            lastPlayCards={seatLastPlayCards(2)}
            bid={seatBid(2)}
            passed={seatPassed(2)}
            emoji="🤖"
          />
        </div>

        <div className={styles.center}>
          {state.phase === 'bidding' ? (
            <PlayedArea
              lastPlay={null}
              bottom={state.bottom}
              showBottom
            />
          ) : (
            <PlayedArea
              lastPlay={
                state.lastPlay
                  ? {
                      cards: state.lastPlay.cards,
                      type: state.lastPlay.type,
                      bySeatName: state.players[state.lastPlay.by].name,
                    }
                  : null
              }
              bottom={state.bottom}
              showBottom={state.phase === 'playing' && state.history.length === 0 && state.bottom.length > 0}
            />
          )}
          {state.phase === 'bidding' && <BidPanel />}
        </div>

        <div className={styles.right}>
          <PlayerSeat
            player={state.players[1]}
            cardCount={state.hands[1].length}
            active={
              (state.phase === 'bidding' && state.bidTurn === 1) ||
              (state.phase === 'playing' && state.currentTurn === 1)
            }
            lastPlayCards={seatLastPlayCards(1)}
            bid={seatBid(1)}
            passed={seatPassed(1)}
            emoji="🤖"
          />
        </div>
      </div>

      <div className={styles.recordRow}>
        {(state.phase === 'playing' || state.phase === 'settled') && <RecordPanel />}
      </div>

      <div className={styles.actionRow}>
        {state.phase === 'playing' && (
          <ActionBar
            selected={selectedCards}
            onPlaySuccess={() => setSelected(new Set())}
            onHint={(cards) => setSelected(new Set(cards.map(c => c.id)))}
          />
        )}
      </div>

      <div className={styles.bottomRow}>
        <PlayerSeat
          player={state.players[0]}
          cardCount={state.hands[0].length}
          active={
            (state.phase === 'bidding' && state.bidTurn === 0) ||
            (state.phase === 'playing' && state.currentTurn === 0)
          }
          bid={seatBid(0)}
          passed={seatPassed(0)}
          emoji="🧑"
        />
        <Hand cards={myHandSorted} selectedIds={selected} onToggle={toggle} compact={compact} />
      </div>

      <ScorePanel />

      <Modal open={openModal === 'settings'} title="设置 / 残局" onClose={() => setOpenModal(null)}>
        <SettingsView onClose={() => setOpenModal(null)} />
      </Modal>

      <Modal open={openModal === 'stats'} title="统计" onClose={() => setOpenModal(null)}>
        <StatsView />
      </Modal>

      <Modal
        open={openModal === 'savedGames'}
        title="复盘 · 我的对局"
        onClose={() => setOpenModal(null)}
      >
        <SavedGamesList
          onPick={(g) => {
            setReplayGame(g);
            setOpenModal('replay');
          }}
        />
      </Modal>

      <Modal
        open={openModal === 'replay' && replayGame !== null}
        title={`复盘 · ${replayGame ? new Date(replayGame.ts).toLocaleString() : ''}`}
        onClose={() => {
          setOpenModal('savedGames');
          setReplayGame(null);
        }}
      >
        {replayGame && <ReplayView game={replayGame} />}
      </Modal>
    </div>
  );
}
