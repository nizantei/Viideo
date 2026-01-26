import { useMixer } from '../context/MixerContext';
import { folders } from '../data/videos';
import styles from '../styles/FolderList.module.css';

export function FolderList() {
  const { state, dispatch } = useMixer();

  const handleSelect = (folderId: string) => {
    dispatch({ type: 'SET_SELECTED_FOLDER', folder: folderId });
  };

  return (
    <div className={styles.list}>
      {folders.map((folder) => (
        <button
          key={folder.id}
          className={`${styles.folder} ${
            state.library.selectedFolder === folder.id ? styles.selected : ''
          }`}
          onClick={() => handleSelect(folder.id)}
        >
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          {folder.name}
        </button>
      ))}
    </div>
  );
}
