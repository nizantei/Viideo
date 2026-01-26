import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { MixerState, MixerAction } from '../types';

const initialState: MixerState = {
  deckA: { videoId: null, isPlaying: false, isLoading: false },
  deckB: { videoId: null, isPlaying: false, isLoading: false },
  crossfader: 0.5,
  zoom: 1.0,
  panX: 0,
  library: {
    isOpen: false,
    targetDeck: null,
    selectedFolder: 'all',
  },
  isInteractionEnabled: false,
};

function mixerReducer(state: MixerState, action: MixerAction): MixerState {
  switch (action.type) {
    case 'SET_DECK_VIDEO': {
      const deckKey = action.deck === 'A' ? 'deckA' : 'deckB';
      return {
        ...state,
        [deckKey]: { ...state[deckKey], videoId: action.videoId },
      };
    }
    case 'SET_DECK_PLAYING': {
      const deckKey = action.deck === 'A' ? 'deckA' : 'deckB';
      return {
        ...state,
        [deckKey]: { ...state[deckKey], isPlaying: action.isPlaying },
      };
    }
    case 'SET_DECK_LOADING': {
      const deckKey = action.deck === 'A' ? 'deckA' : 'deckB';
      return {
        ...state,
        [deckKey]: { ...state[deckKey], isLoading: action.isLoading },
      };
    }
    case 'SET_CROSSFADER':
      return { ...state, crossfader: action.value };
    case 'SET_ZOOM':
      return { ...state, zoom: action.value };
    case 'SET_PAN_X':
      return { ...state, panX: action.value };
    case 'OPEN_LIBRARY':
      return {
        ...state,
        library: { ...state.library, isOpen: true, targetDeck: action.targetDeck },
      };
    case 'CLOSE_LIBRARY':
      return {
        ...state,
        library: { ...state.library, isOpen: false, targetDeck: null },
      };
    case 'SET_SELECTED_FOLDER':
      return {
        ...state,
        library: { ...state.library, selectedFolder: action.folder },
      };
    case 'ENABLE_INTERACTION':
      return { ...state, isInteractionEnabled: true };
    default:
      return state;
  }
}

interface MixerContextValue {
  state: MixerState;
  dispatch: React.Dispatch<MixerAction>;
}

const MixerContext = createContext<MixerContextValue | null>(null);

export function MixerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mixerReducer, initialState);

  return (
    <MixerContext.Provider value={{ state, dispatch }}>
      {children}
    </MixerContext.Provider>
  );
}

export function useMixer() {
  const context = useContext(MixerContext);
  if (!context) {
    throw new Error('useMixer must be used within a MixerProvider');
  }
  return context;
}
