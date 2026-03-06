
import { useGameStore } from './engine/gameStore';
import { MainMenu } from './components/MainMenu';
import { GameLayout } from './components/GameLayout';

function App() {
  const { currentStory } = useGameStore();

  return (
    <>
      {currentStory ? <GameLayout /> : <MainMenu />}
    </>
  );
}

export default App;
