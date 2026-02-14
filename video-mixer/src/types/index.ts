import { BlendMode } from '../services/blendModes';

export interface Video {
  id: string;
  title: string;
  folder: string;
  hlsUrl: string;
  thumbnailUrl: string;
}

export interface Folder {
  id: string;
  name: string;
}

export interface SwingingState {
  enabled: boolean;
  speed: number;
  position: number;
  isPaused: boolean;
}

export interface MiniState {
  videoId: string | null;
  thumbnailUrl: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  opacity: number;
  zoom: number;
  panX: number;
  panY: number;
  swinging: SwingingState;
  blendMode: BlendMode;
}

export interface GroupState {
  opacity: number;
}

export interface EditModeState {
  active: boolean;
  targetMini: 0 | 1 | 2 | 3 | null;
}

export interface LibraryState {
  isOpen: boolean;
  targetMini: 0 | 1 | 2 | 3 | null;
  selectedFolder: string;
}

export interface BlendModeSelectorState {
  isOpen: boolean;
  targetMini: 0 | 1 | 2 | 3 | null;
}

export interface SettingsState {
  isOpen: boolean;
  autoSwinging: boolean;
  swingDuration: number;
}

export interface MixerState {
  minis: [MiniState, MiniState, MiniState, MiniState];
  groups: {
    left: GroupState;
    right: GroupState;
  };
  crossfader: number;
  canvasZoom: number;
  canvasPanX: number;
  canvasPanY: number;
  editMode: EditModeState;
  library: LibraryState;
  blendModeSelector: BlendModeSelectorState;
  settings: SettingsState;
  isInteractionEnabled: boolean;
  isFullScreenMode: boolean;
}

/** Serializable mix state for export/import */
export interface MixSnapshot {
  version: number;
  minis: Array<{
    videoId: string | null;
    thumbnailUrl: string | null;
    opacity: number;
    zoom: number;
    panX: number;
    panY: number;
    blendMode: string;
    swinging: SwingingState;
  }>;
  canvasZoom: number;
  canvasPanX: number;
  canvasPanY: number;
  autoSwinging: boolean;
  swingDuration: number;
}

export type MiniIndex = 0 | 1 | 2 | 3;

export type MixerAction =
  | { type: 'SET_MINI_VIDEO'; miniIndex: MiniIndex; videoId: string; thumbnailUrl: string }
  | { type: 'CLEAR_MINI_VIDEO'; miniIndex: MiniIndex }
  | { type: 'SET_MINI_PLAYING'; miniIndex: MiniIndex; isPlaying: boolean }
  | { type: 'SET_MINI_LOADING'; miniIndex: MiniIndex; isLoading: boolean }
  | { type: 'SET_MINI_OPACITY'; miniIndex: MiniIndex; opacity: number }
  | { type: 'SET_MINI_ZOOM'; miniIndex: MiniIndex; zoom: number }
  | { type: 'SET_MINI_PAN'; miniIndex: MiniIndex; panX: number; panY: number }
  | { type: 'UPDATE_MINI_SWINGING'; miniIndex: MiniIndex; swinging: Partial<SwingingState> }
  | { type: 'SET_MINI_BLEND_MODE'; miniIndex: MiniIndex; blendMode: BlendMode }
  | { type: 'ENTER_EDIT_MODE'; miniIndex: MiniIndex }
  | { type: 'EXIT_EDIT_MODE' }
  | { type: 'SWITCH_EDIT_TARGET'; miniIndex: MiniIndex }
  | { type: 'RESET_MINI_TRANSFORMS'; miniIndex: MiniIndex }
  | { type: 'OPEN_LIBRARY'; targetMini: MiniIndex }
  | { type: 'CLOSE_LIBRARY' }
  | { type: 'OPEN_BLEND_MODE_SELECTOR'; miniIndex: MiniIndex }
  | { type: 'CLOSE_BLEND_MODE_SELECTOR' }
  | { type: 'SET_SELECTED_FOLDER'; folder: string }
  | { type: 'SET_CANVAS_ZOOM'; zoom: number }
  | { type: 'SET_CANVAS_PAN'; panX: number; panY: number }
  | { type: 'RESET_CANVAS_ZOOM' }
  | { type: 'ENABLE_INTERACTION' }
  | { type: 'TOGGLE_FULLSCREEN_MODE' }
  | { type: 'EXIT_FULLSCREEN_MODE' }
  | { type: 'OPEN_SETTINGS' }
  | { type: 'CLOSE_SETTINGS' }
  | { type: 'TOGGLE_AUTO_SWINGING' }
  | { type: 'SET_SWING_DURATION'; duration: number }
  | { type: 'LOAD_MIX_STATE'; snapshot: MixSnapshot };
