
import { useGameStore } from './engine/gameStore';
import { MainMenu } from './components/MainMenu';
import { GameLayout } from './components/GameLayout';
import { StoryEditor } from './components/StoryEditor/StoryEditor';

function App() {
  const { currentStory, inMenu } = useGameStore();

  const isEditorMode = window.location.pathname === '/editor';

  if (isEditorMode) {
    return <StoryEditor />;
  }

  return (
    <>
      {!currentStory || inMenu ? <MainMenu /> : <GameLayout />}
    </>
  );
}

export default App;
