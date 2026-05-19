import { useState } from 'react';
import { useSettings, type Theme } from '../state/SettingsContext';
import type { Difficulty } from '../core/ai';
import { ENDGAMES, type Endgame } from '../core/endgames';
import { useGame } from '../state/GameContext';
import { deleteCustomEndgame, listCustomEndgames } from '../utils/storage';
import { EndgameEditor } from './EndgameEditor';
import styles from './SettingsView.module.css';

interface Props {
  onClose: () => void;
}

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '简单',
  normal: '普通',
  hard: '困难',
};

const THEME_LABEL: Record<Theme, string> = {
  classic: '经典绿桌',
  dark: '暗夜',
  rosewood: '红木',
};

export function SettingsView({ onClose }: Props) {
  const { settings, update } = useSettings();
  const { dispatch } = useGame();
  const [showEditor, setShowEditor] = useState(false);
  const [customList, setCustomList] = useState<Endgame[]>(() => listCustomEndgames());

  const startEndgame = (eg: Endgame) => {
    dispatch({ type: 'START_ENDGAME', endgame: eg });
    onClose();
  };

  const removeCustom = (id: string) => {
    deleteCustomEndgame(id);
    setCustomList(listCustomEndgames());
  };

  if (showEditor) {
    return (
      <EndgameEditor
        onSaved={eg => {
          setCustomList(listCustomEndgames());
          setShowEditor(false);
          startEndgame(eg);
        }}
        onCancel={() => setShowEditor(false)}
      />
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.section}>
        <span className={styles.label}>AI 难度</span>
        <div className={styles.options}>
          {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => (
            <button
              key={d}
              className={`${styles.opt} ${settings.difficulty === d ? styles.active : ''}`}
              onClick={() => update({ difficulty: d })}
            >
              {DIFFICULTY_LABEL[d]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.label}>主题</span>
        <div className={styles.options}>
          {(['classic', 'dark', 'rosewood'] as Theme[]).map(t => (
            <button
              key={t}
              className={`${styles.opt} ${settings.theme === t ? styles.active : ''}`}
              onClick={() => update({ theme: t })}
            >
              {THEME_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.label}>音效</span>
        <div className={styles.options}>
          <button
            className={`${styles.opt} ${settings.soundEnabled ? styles.active : ''}`}
            onClick={() => update({ soundEnabled: !settings.soundEnabled })}
          >
            {settings.soundEnabled ? '已开启' : '已关闭'}
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.label}>残局训练（点击立即开始）</span>
          <button className={styles.smallBtn} onClick={() => setShowEditor(true)}>+ 自定义</button>
        </div>
        <div className={styles.endgameList}>
          {ENDGAMES.map(eg => (
            <button
              key={eg.id}
              className={styles.endgame}
              onClick={() => startEndgame(eg)}
            >
              <div className={styles.title}>{eg.title}</div>
              <div className={styles.desc}>{eg.description}</div>
            </button>
          ))}
          {customList.map(eg => (
            <div key={eg.id} className={styles.endgameRow}>
              <button className={styles.endgame} onClick={() => startEndgame(eg)}>
                <div className={styles.title}>
                  <span className={styles.tag}>自定义</span>
                  {eg.title}
                </div>
                <div className={styles.desc}>
                  {eg.description}（地主 {seatLabel(eg.landlord)}｜底分 {eg.basePoint}）
                </div>
              </button>
              <button
                className={styles.deleteBtn}
                title="删除该残局"
                onClick={() => removeCustom(eg.id)}
              >
                ×
              </button>
            </div>
          ))}
          {customList.length === 0 && (
            <div className={styles.emptyHint}>还没有自定义残局，点上方"+ 自定义"创建一个。</div>
          )}
        </div>
      </div>
    </div>
  );
}

function seatLabel(s: 0 | 1 | 2): string {
  return s === 0 ? '我' : s === 1 ? '右' : '左';
}
