import { useState } from 'react';
import { GameProvider } from './app/GameProvider';
import { MainMenu } from './app/screens/MainMenu';
import { CoreGame } from './app/screens/CoreGame';
import { RapidAlignmentTest } from './app/screens/RapidAlignmentTest';
import { AbitabOperations } from './app/screens/AbitabOperations';
import { FinalJudgment } from './app/screens/FinalJudgment.tsx';
import type { Screen } from './app/types';
import { clearCertificateHash, readCertificateFromHash } from './utils/certCodec';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    return readCertificateFromHash(window.location.hash) ? 'FinalJudgment' : 'MainMenu';
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
        return <MainMenu onNavigate={navigate} />;
      case 'CoreGame':
        return <CoreGame onNavigate={navigate} />;
      case 'RapidAlignmentTest':
        return <RapidAlignmentTest onNavigate={navigate} />;
      case 'AbitabOperations':
        return <AbitabOperations onNavigate={navigate} />;
      case 'FinalJudgment':
        return <FinalJudgment onNavigate={navigate} />;
      default:
        return <MainMenu onNavigate={navigate} />;
    }
  };

  return (
    <GameProvider>
      <div className="app">{renderScreen()}</div>
    </GameProvider>
  );
}

export default App;
