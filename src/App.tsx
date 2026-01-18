import { useState } from 'react';
import { GameProvider } from './app/GameProvider';
import { BackgroundMusic } from './app/BackgroundMusic';
import { MainMenu } from './app/screens/MainMenu';
import { CoreGame } from './app/screens/CoreGame';
import { RapidAlignmentTest } from './app/screens/RapidAlignmentTest';
import { AbitabOperations } from './app/screens/AbitabOperations';
import { FinalJudgment } from './app/screens/FinalJudgment.tsx';
import type { Screen } from './app/types';
import { clearCertificateHash, readCertificateFromHash } from './utils/certCodec';
import './App.css';

const MUSIC_ENABLED_STORAGE_KEY = 'patilla_music_enabled';
const MUSIC_SRC = '/audio/marcha-peronista.mp3';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    return readCertificateFromHash(window.location.hash) ? 'FinalJudgment' : 'MainMenu';
  });

  const [musicEnabled, setMusicEnabled] = useState<boolean>(() => {
    const raw = window.localStorage.getItem(MUSIC_ENABLED_STORAGE_KEY);
    if (raw === null) return false;
    return raw === 'true';
  });

  const navigate = (screen: Screen) => {
    if (screen !== 'FinalJudgment' && readCertificateFromHash(window.location.hash)) {
      clearCertificateHash();
    }
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'MainMenu':
        return (
          <MainMenu
            onNavigate={navigate}
            musicEnabled={musicEnabled}
            onToggleMusic={() => {
              const next = !musicEnabled;
              setMusicEnabled(next);
              window.localStorage.setItem(MUSIC_ENABLED_STORAGE_KEY, String(next));
            }}
          />
        );
      case 'CoreGame':
        return <CoreGame onNavigate={navigate} />;
      case 'RapidAlignmentTest':
        return <RapidAlignmentTest onNavigate={navigate} />;
      case 'AbitabOperations':
        return <AbitabOperations onNavigate={navigate} />;
      case 'FinalJudgment':
        return <FinalJudgment onNavigate={navigate} />;
      default:
        return (
          <MainMenu
            onNavigate={navigate}
            musicEnabled={musicEnabled}
            onToggleMusic={() => {
              const next = !musicEnabled;
              setMusicEnabled(next);
              window.localStorage.setItem(MUSIC_ENABLED_STORAGE_KEY, String(next));
            }}
          />
        );
    }
  };

  return (
    <GameProvider>
      <div className="app">
        <BackgroundMusic enabled={musicEnabled} src={MUSIC_SRC} volume={0.2} />
        {renderScreen()}
      </div>
    </GameProvider>
  );
}

export default App;
