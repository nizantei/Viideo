import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { MixerState, MixerAction, MiniState } from '../types';
import { calculateGroupOpacity } from '../utils/opacity';

const initialMiniState: MiniState = {
  videoId: null,
  isPlaying: false,
  isLoading: false,
  opacity: 1.0,
  zoom: 1.0,
  panX: 0,
  panY: 0,
  swinging: {
    enabled: false,
    speed: 20,
    position: 0,
    isPaused: false,
  },
};

const initialState: MixerState = {
  minis: [
    { ...initialMiniState },
    { ...initialMiniState },
    { ...initialMiniState },
    { ...initialMiniState },
  ],
  groups: {
    left: { opacity: 0.5 },
    right: { opacity: 0.5 },
  },
  crossfader: 0.5,
  editMode: {
    active: false,
    targetMini: null,
  },
  library: {
    isOpen: false,
    targetMini: null,
    selectedFolder: 'all',
  },
  isInteractionEnabled: false,
};

function mixerReducer(state: MixerState, action: MixerAction): MixerState {
  switch (action.type) {
    case 'SET_MINI_VIDEO': {
      const newMinis = [...state.minis] as typeof state.minis;
      newMinis[action.miniIndex] = {
        ...newMinis[action.miniIndex],
        videoId: action.videoId,
        isPlaying: true,
      };
      return { ...state, minis: newMinis };
    }

    case 'SET_MINI_PLAYING': {
      const newMinis = [...state.minis] as typeof state.minis;
      newMinis[action.miniIndex] = {
        ...newMinis[action.miniIndex],
        isPlaying: action.isPlaying,
      };
      return { ...state, minis: newMinis };
    }

    case 'SET_MINI_LOADING': {
      const newMinis = [...state.minis] as typeof state.minis;
      newMinis[action.miniIndex] = {
        ...newMinis[action.miniIndex],
        isLoading: action.isLoading,
      };
      return { ...state, minis: newMinis };
    }

    case 'SET_MINI_OPACITY': {
      const newMinis = [...state.minis] as typeof state.minis;
      newMinis[action.miniIndex] = {
        ...newMinis[action.miniIndex],
        opacity: action.opacity,
      };
      return { ...state, minis: newMinis };
    }

    case 'SET_MINI_ZOOM': {
      const newMinis = [...state.minis] as typeof state.minis;
      newMinis[action.miniIndex] = {
        ...newMinis[action.miniIndex],
        zoom: action.zoom,
      };
      return { ...state, minis: newMinis };
    }

    case 'SET_MINI_PAN': {
      const newMinis = [...state.minis] as typeof state.minis;
      newMinis[action.miniIndex] = {
        ...newMinis[action.miniIndex],
        panX: action.panX,
        panY: action.panY,
      };
      return { ...state, minis: newMinis };
    }

    case 'UPDATE_MINI_SWINGING': {
      const newMinis = [...state.minis] as typeof state.minis;
      newMinis[action.miniIndex] = {
        ...newMinis[action.miniIndex],
        swinging: {
          ...newMinis[action.miniIndex].swinging,
          ...action.swinging,
        },
      };
      return { ...state, minis: newMinis };
    }

    case 'ENTER_EDIT_MODE': {
      return {
        ...state,
        editMode: {
          active: true,
          targetMini: action.miniIndex,
        },
      };
    }

    case 'EXIT_EDIT_MODE': {
      return {
        ...state,
        editMode: {
          active: false,
          targetMini: null,
        },
      };
    }

    case 'SWITCH_EDIT_TARGET': {
      return {
        ...state,
        editMode: {
          ...state.editMode,
          targetMini: action.miniIndex,
        },
      };
    }

    case 'RESET_MINI_TRANSFORMS': {
      const newMinis = [...state.minis] as typeof state.minis;
      newMinis[action.miniIndex] = {
        ...newMinis[action.miniIndex],
        zoom: 1.0,
        panX: 0,
        panY: 0,
        swinging: {
          enabled: false,
          speed: 20,
          position: 0,
          isPaused: false,
        },
      };
      return { ...state, minis: newMinis };
    }

    case 'SET_CROSSFADER': {
      return {
        ...state,
        crossfader: action.value,
        groups: {
          left: { opacity: calculateGroupOpacity(action.value, 'left') },
          right: { opacity: calculateGroupOpacity(action.value, 'right') },
        },
      };
    }

    case 'OPEN_LIBRARY': {
      return {
        ...state,
        library: { ...state.library, isOpen: true, targetMini: action.targetMini },
      };
    }

    case 'CLOSE_LIBRARY': {
      return {
        ...state,
        library: { ...state.library, isOpen: false, targetMini: null },
      };
    }

    case 'SET_SELECTED_FOLDER': {
      return {
        ...state,
        library: { ...state.library, selectedFolder: action.folder },
      };
    }

    case 'ENABLE_INTERACTION': {
      return { ...state, isInteractionEnabled: true };
    }

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
