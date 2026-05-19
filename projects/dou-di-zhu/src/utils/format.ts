import type { Card, CardKind, Rank } from '../types';

const KIND_LABEL: Record<CardKind, string> = {
  single: '单',
  pair: '对',
  triple: '三张',
  'triple-single': '三带一',
  'triple-pair': '三带二',
  straight: '顺子',
  'pair-straight': '连对',
  plane: '飞机',
  'plane-single': '飞机带单',
  'plane-pair': '飞机带对',
  'four-two-single': '四带二（单）',
  'four-two-pair': '四带二（对）',
  bomb: '炸弹',
  rocket: '王炸',
};

export function kindLabel(kind: CardKind): string {
  return KIND_LABEL[kind];
}

const RANK_LABEL: Record<Rank, string> = {
  '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
  'J': 'J', 'Q': 'Q', 'K': 'K', 'A': 'A', '2': '2',
  'BJ': '小', 'RJ': '大',
};

export function rankLabel(card: Card): string {
  return RANK_LABEL[card.rank];
}

export function cardsToText(cards: Card[]): string {
  return cards.map(c => `${c.suit === 'JOKER' ? '' : c.suit}${rankLabel(c)}`).join(' ');
}
