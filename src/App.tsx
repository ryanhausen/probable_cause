
import { useGameStore } from './engine/gameStore';
import { MainMenu } from './components/MainMenu';
import { GameLayout } from './components/GameLayout';
import { StoryEditor } from './components/StoryEditor/StoryEditor';

function App() {
  const { currentStory } = useGameStore();

  const isEditorMode = new URLSearchParams(window.location.search).get('editor') === 'true';

  if (isEditorMode) {
    return <StoryEditor />;
  }

  return (
    <>
      {currentStory ? <GameLayout /> : <MainMenu />}
    </>
  );
}

export default App;
