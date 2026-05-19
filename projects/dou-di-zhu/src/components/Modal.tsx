import type { ReactNode } from 'react';
import styles from './Modal.module.css';

interface Props {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, open, onClose, children }: Props) {
  if (!open) return null;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          <button className={styles.close} onClick={onClose} aria-label="关闭">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
