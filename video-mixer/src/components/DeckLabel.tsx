import { useMixer } from '../context/MixerContext';
import styles from '../styles/DeckLabel.module.css';

interface DeckLabelProps {
  deck: 'A' | 'B';
}

export function DeckLabel({ deck }: DeckLabelProps) {
  const { state, dispatch } = useMixer();
  const deckState = deck === 'A' ? state.deckA : state.deckB;
  const isActive = deckState.videoId !== null;

  const deckClass = deck === 'A' ? styles.deckA : styles.deckB;
  const activeClass = isActive ? styles.active : styles.inactive;

  const handleClick = () => {
    if (!state.isInteractionEnabled) {
      dispatch({ type: 'ENABLE_INTERACTION' });
    }
    dispatch({ type: 'OPEN_LIBRARY', targetDeck: deck });
  };

  return (
    <button
      className={`${styles.label} ${deckClass} ${activeClass}`}
      onClick={handleClick}
    >
      DECK {deck}
    </button>
  );
}
