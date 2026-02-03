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
  isPlaying: boolean;
  isLoading: boolean;
  opacity: number;
  zoom: number;
  panX: number;
  panY: number;
  swinging: SwingingState;
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

export interface MixerState {
  minis: [MiniState, MiniState, MiniState, MiniState];
  groups: {
    left: GroupState;
    right: GroupState;
  };
  crossfader: number;
  editMode: EditModeState;
  library: LibraryState;
  isInteractionEnabled: boolean;
}

export type MiniIndex = 0 | 1 | 2 | 3;

export type MixerAction =
  | { type: 'SET_MINI_VIDEO'; miniIndex: MiniIndex; videoId: string }
  | { type: 'SET_MINI_PLAYING'; miniIndex: MiniIndex; isPlaying: boolean }
  | { type: 'SET_MINI_LOADING'; miniIndex: MiniIndex; isLoading: boolean }
  | { type: 'SET_MINI_OPACITY'; miniIndex: MiniIndex; opacity: number }
  | { type: 'SET_MINI_ZOOM'; miniIndex: MiniIndex; zoom: number }
  | { type: 'SET_MINI_PAN'; miniIndex: MiniIndex; panX: number; panY: number }
  | { type: 'UPDATE_MINI_SWINGING'; miniIndex: MiniIndex; swinging: Partial<SwingingState> }
  | { type: 'ENTER_EDIT_MODE'; miniIndex: MiniIndex }
  | { type: 'EXIT_EDIT_MODE' }
  | { type: 'SWITCH_EDIT_TARGET'; miniIndex: MiniIndex }
  | { type: 'RESET_MINI_TRANSFORMS'; miniIndex: MiniIndex }
  | { type: 'SET_CROSSFADER'; value: number }
  | { type: 'OPEN_LIBRARY'; targetMini: MiniIndex }
  | { type: 'CLOSE_LIBRARY' }
  | { type: 'SET_SELECTED_FOLDER'; folder: string }
  | { type: 'ENABLE_INTERACTION' };
