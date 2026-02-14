import React, { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from 'react';
import { MixerState, MixerAction, MiniState, MixSnapshot } from '../types';
import { BlendMode } from '../services/blendModes';

const STORAGE_KEY = 'viideo-mixer-state';

const initialMiniState: MiniState = {
  videoId: null,
  thumbnailUrl: null,
  isPlaying: false,
  isLoading: false,
  opacity: 0,
  zoom: 1.0,
  panX: 0,
  panY: 0,
  swinging: {
    enabled: false,
    speed: 20,
    position: 0.5,
    isPaused: false,
  },
  blendMode: BlendMode.NORMAL,
};

const initialState: MixerState = {
  minis: [
    { ...initialMiniState },
    { ...initialMiniState },
    { ...initialMiniState },
    { ...initialMiniState },
  ],
  groups: {
    left: { opacity: 1.0 },
    right: { opacity: 1.0 },
  },
  crossfader: 0.5,
  canvasZoom: 1.0,
  canvasPanX: 0,
  canvasPanY: 0,
  editMode: {
    active: false,
    targetMini: null,
  },
  library: {
    isOpen: false,
    targetMini: null,
    selectedFolder: 'all',
  },
  blendModeSelector: {
    isOpen: false,
    targetMini: null,
  },
  settings: {
    isOpen: false,
    autoSwinging: false,
    swingDuration: 8,
  },
  isInteractionEnabled: false,
  isFullScreenMode: false,
};

function applyMixSnapshot(state: MixerState, snapshot: MixSnapshot): MixerState {
  const newMinis = state.minis.map((_mini, i) => {
    const saved = snapshot.minis[i];
    if (!saved) return { ...initialMiniState };
    return {
      ...initialMiniState,
      videoId: saved.videoId,
      thumbnailUrl: saved.thumbnailUrl ?? null,
      isPlaying: saved.videoId !== null,
      isLoading: saved.videoId !== null,
      opacity: saved.opacity ?? 1.0,
      zoom: saved.zoom ?? 1.0,
      panX: saved.panX ?? 0,
      panY: saved.panY ?? 0,
      blendMode: (saved.blendMode as BlendMode) || BlendMode.NORMAL,
      swinging: saved.swinging ?? initialMiniState.swinging,
    };
  }) as [MiniState, MiniState, MiniState, MiniState];

  return {
    ...state,
    minis: newMinis,
    canvasZoom: snapshot.canvasZoom ?? 1.0,
    canvasPanX: snapshot.canvasPanX ?? 0,
    canvasPanY: snapshot.canvasPanY ?? 0,
    settings: {
      ...state.settings,
      isOpen: false,
      autoSwinging: snapshot.autoSwinging ?? state.settings.autoSwinging,
      swingDuration: snapshot.swingDuration ?? state.settings.swingDuration,
    },
  };
}

function mixerReducer(state: MixerState, action: MixerAction): MixerState {
  switch (action.type) {
    case 'SET_MINI_VIDEO': {
      const newMinis = [...state.minis] as typeof state.minis;
      newMinis[action.miniIndex] = {
        ...newMinis[action.miniIndex],
        videoId: action.videoId,
        thumbnailUrl: action.thumbnailUrl,
        isPlaying: true,
        // Reset swinging — auto-swing will re-enable if appropriate at load time
        swinging: { ...initialMiniState.swinging },
      };
      return { ...state, minis: newMinis };
    }

    case 'CLEAR_MINI_VIDEO': {
      const newMinis = [...state.minis] as typeof state.minis;
      newMinis[action.miniIndex] = { ...initialMiniState };
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

    case 'SET_MINI_BLEND_MODE': {
      const newMinis = [...state.minis] as typeof state.minis;
      newMinis[action.miniIndex] = {
        ...newMinis[action.miniIndex],
        blendMode: action.blendMode,
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
        // If blend mode panel is open, update its target to the new edit mini
        blendModeSelector: state.blendModeSelector.isOpen
          ? { isOpen: true, targetMini: action.miniIndex }
          : state.blendModeSelector,
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
        // If blend mode panel is open, update its target to the new edit mini
        blendModeSelector: state.blendModeSelector.isOpen
          ? { isOpen: true, targetMini: action.miniIndex }
          : state.blendModeSelector,
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
          position: 0.5,
          isPaused: false,
        },
      };
      return { ...state, minis: newMinis };
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

    case 'OPEN_BLEND_MODE_SELECTOR': {
      return {
        ...state,
        blendModeSelector: {
          isOpen: true,
          targetMini: action.miniIndex,
        },
      };
    }

    case 'CLOSE_BLEND_MODE_SELECTOR': {
      return {
        ...state,
        blendModeSelector: {
          isOpen: false,
          targetMini: null,
        },
      };
    }

    case 'SET_CANVAS_ZOOM': {
      return { ...state, canvasZoom: action.zoom };
    }

    case 'SET_CANVAS_PAN': {
      return { ...state, canvasPanX: action.panX, canvasPanY: action.panY };
    }

    case 'RESET_CANVAS_ZOOM': {
      return { ...state, canvasZoom: 1.0, canvasPanX: 0, canvasPanY: 0 };
    }

    case 'ENABLE_INTERACTION': {
      return { ...state, isInteractionEnabled: true };
    }

    case 'TOGGLE_FULLSCREEN_MODE': {
      return { ...state, isFullScreenMode: !state.isFullScreenMode };
    }

    case 'EXIT_FULLSCREEN_MODE': {
      return { ...state, isFullScreenMode: false };
    }

    case 'OPEN_SETTINGS': {
      return { ...state, settings: { ...state.settings, isOpen: true } };
    }

    case 'CLOSE_SETTINGS': {
      return { ...state, settings: { ...state.settings, isOpen: false } };
    }

    case 'TOGGLE_AUTO_SWINGING': {
      // Only affects future video loads — doesn't touch currently playing minis
      return {
        ...state,
        settings: { ...state.settings, autoSwinging: !state.settings.autoSwinging },
      };
    }

    case 'SET_SWING_DURATION': {
      return {
        ...state,
        settings: { ...state.settings, swingDuration: action.duration },
      };
    }

    case 'LOAD_MIX_STATE': {
      return applyMixSnapshot(state, action.snapshot);
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

function stateToSnapshot(state: MixerState): MixSnapshot {
  return {
    version: 1,
    minis: state.minis.map((m) => ({
      videoId: m.videoId,
      thumbnailUrl: m.thumbnailUrl,
      opacity: m.opacity,
      zoom: m.zoom,
      panX: m.panX,
      panY: m.panY,
      blendMode: m.blendMode,
      swinging: { ...m.swinging },
    })),
    canvasZoom: state.canvasZoom,
    canvasPanX: state.canvasPanX,
    canvasPanY: state.canvasPanY,
    autoSwinging: state.settings.autoSwinging,
    swingDuration: state.settings.swingDuration,
  };
}

function loadSavedState(): MixerState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const snapshot = JSON.parse(saved) as MixSnapshot;
      if (snapshot.minis && Array.isArray(snapshot.minis) && snapshot.minis.length === 4) {
        return applyMixSnapshot(initialState, snapshot);
      }
    }
  } catch {
    // Ignore corrupt data
  }
  return initialState;
}

export function MixerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mixerReducer, undefined, loadSavedState);
  const saveTimerRef = useRef<number>(0);

  // Save state to localStorage on changes (debounced to avoid thrashing during fader drags)
  useEffect(() => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      try {
        const snapshot = stateToSnapshot(state);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // Storage full or unavailable
      }
    }, 500);
  }, [state]);

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
