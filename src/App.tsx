import { useState } from 'react';
import { GameProvider } from './app/GameProvider';
import { MainMenu } from './app/screens/MainMenu';
import { CoreGame } from './app/screens/CoreGame';
import { RapidAlignmentTest } from './app/screens/RapidAlignmentTest';
import { AbitabOperations } from './app/screens/AbitabOperations';
import { FinalJudgment } from './app/screens/FinalJudgment';
import type { Screen } from './app/types';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('MainMenu');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'MainMenu':
        return <MainMenu onNavigate={setCurrentScreen} />;
      case 'CoreGame':
        return <CoreGame onNavigate={setCurrentScreen} />;
      case 'RapidAlignmentTest':
        return <RapidAlignmentTest onNavigate={setCurrentScreen} />;
      case 'AbitabOperations':
        return <AbitabOperations onNavigate={setCurrentScreen} />;
      case 'FinalJudgment':
        return <FinalJudgment onNavigate={setCurrentScreen} />;
      default:
        return <MainMenu onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <GameProvider>
      <div className="app">{renderScreen()}</div>
    </GameProvider>
  );
}

export default App;
