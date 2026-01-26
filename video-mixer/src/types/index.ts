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

export interface DeckState {
  videoId: string | null;
  isPlaying: boolean;
  isLoading: boolean;
}

export interface LibraryState {
  isOpen: boolean;
  targetDeck: 'A' | 'B' | null;
  selectedFolder: string;
}

export interface MixerState {
  deckA: DeckState;
  deckB: DeckState;
  crossfader: number;
  zoom: number;
  panX: number;
  library: LibraryState;
  isInteractionEnabled: boolean;
}

export type MixerAction =
  | { type: 'SET_DECK_VIDEO'; deck: 'A' | 'B'; videoId: string }
  | { type: 'SET_DECK_PLAYING'; deck: 'A' | 'B'; isPlaying: boolean }
  | { type: 'SET_DECK_LOADING'; deck: 'A' | 'B'; isLoading: boolean }
  | { type: 'SET_CROSSFADER'; value: number }
  | { type: 'SET_ZOOM'; value: number }
  | { type: 'SET_PAN_X'; value: number }
  | { type: 'OPEN_LIBRARY'; targetDeck: 'A' | 'B' }
  | { type: 'CLOSE_LIBRARY' }
  | { type: 'SET_SELECTED_FOLDER'; folder: string }
  | { type: 'ENABLE_INTERACTION' };
