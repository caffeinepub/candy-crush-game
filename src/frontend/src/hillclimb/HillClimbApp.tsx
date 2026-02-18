import { useState, useEffect } from 'react';
import MainMenuScreen from './screens/MainMenuScreen';
import GameplayScreen from './screens/GameplayScreen';
import ResultsScreen from './screens/ResultsScreen';
import GarageScreen from './screens/GarageScreen';
import StageSelectScreen from './screens/StageSelectScreen';
import DailyChallengeScreen from './screens/DailyChallengeScreen';
import PhotoGalleryScreen from './screens/PhotoGalleryScreen';
import { loadGameState, saveGameState } from './progression/storage';
import type { GameState } from './progression/storage';
import type { VehicleId } from './progression/vehicles';
import type { StageId } from './stages/stages';

export type Screen = 
  | { type: 'menu' }
  | { type: 'garage' }
  | { type: 'stageSelect' }
  | { type: 'dailyChallenge' }
  | { type: 'photoGallery' }
  | { type: 'gameplay'; vehicleId: VehicleId; stageId: StageId }
  | { type: 'results'; distance: number; coins: number; stuntPoints: number; reason: string };

export default function HillClimbApp() {
  const [screen, setScreen] = useState<Screen>({ type: 'menu' });
  const [gameState, setGameState] = useState<GameState>(loadGameState());
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleId>('hillClimber');
  const [selectedStage, setSelectedStage] = useState<StageId>('canyon');

  // Persist game state whenever it changes
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const handleStartRun = () => {
    setScreen({ type: 'stageSelect' });
  };

  const handleStageSelected = (stageId: StageId) => {
    setSelectedStage(stageId);
    setScreen({ type: 'gameplay', vehicleId: selectedVehicle, stageId });
  };

  const handleRunEnd = (distance: number, coins: number, stuntPoints: number, reason: string) => {
    // Award coins
    setGameState(prev => ({
      ...prev,
      coinBalance: prev.coinBalance + coins
    }));
    setScreen({ type: 'results', distance, coins, stuntPoints, reason });
  };

  const handleBackToMenu = () => {
    setScreen({ type: 'menu' });
  };

  const handleOpenGarage = () => {
    setScreen({ type: 'garage' });
  };

  const handleOpenDailyChallenge = () => {
    setScreen({ type: 'dailyChallenge' });
  };

  const handleOpenPhotoGallery = () => {
    setScreen({ type: 'photoGallery' });
  };

  const handleVehicleSelected = (vehicleId: VehicleId) => {
    setSelectedVehicle(vehicleId);
  };

  const handleVehicleUnlocked = (vehicleId: VehicleId, cost: number) => {
    setGameState(prev => ({
      ...prev,
      coinBalance: prev.coinBalance - cost,
      unlockedVehicles: [...prev.unlockedVehicles, vehicleId]
    }));
  };

  const handleUpgradePurchased = (upgradeType: string, cost: number) => {
    setGameState(prev => ({
      ...prev,
      coinBalance: prev.coinBalance - cost,
      upgradeLevels: {
        ...prev.upgradeLevels,
        [upgradeType]: (prev.upgradeLevels[upgradeType] || 0) + 1
      }
    }));
  };

  const handleDailyClaimed = (reward: number, dateKey: string) => {
    setGameState(prev => ({
      ...prev,
      coinBalance: prev.coinBalance + reward,
      dailyClaimHistory: [...prev.dailyClaimHistory, dateKey]
    }));
  };

  const handlePhotoUnlocked = (photoId: string, cost: number) => {
    setGameState(prev => ({
      ...prev,
      coinBalance: prev.coinBalance - cost,
      unlockedPhotos: [...prev.unlockedPhotos, photoId]
    }));
  };

  const handleCloudSyncUpdate = (newState: GameState) => {
    setGameState(newState);
  };

  return (
    <>
      {screen.type === 'menu' && (
        <MainMenuScreen
          onStartRun={handleStartRun}
          onOpenGarage={handleOpenGarage}
          onOpenDailyChallenge={handleOpenDailyChallenge}
          onOpenPhotoGallery={handleOpenPhotoGallery}
        />
      )}
      {screen.type === 'garage' && (
        <GarageScreen
          gameState={gameState}
          selectedVehicle={selectedVehicle}
          onVehicleSelected={handleVehicleSelected}
          onVehicleUnlocked={handleVehicleUnlocked}
          onUpgradePurchased={handleUpgradePurchased}
          onBack={handleBackToMenu}
          onCloudSyncUpdate={handleCloudSyncUpdate}
        />
      )}
      {screen.type === 'stageSelect' && (
        <StageSelectScreen
          onStageSelected={handleStageSelected}
          onBack={handleBackToMenu}
        />
      )}
      {screen.type === 'dailyChallenge' && (
        <DailyChallengeScreen
          gameState={gameState}
          onDailyClaimed={handleDailyClaimed}
          onBack={handleBackToMenu}
        />
      )}
      {screen.type === 'photoGallery' && (
        <PhotoGalleryScreen
          unlockedPhotos={gameState.unlockedPhotos}
          coinBalance={gameState.coinBalance}
          onPhotoUnlocked={handlePhotoUnlocked}
          onBack={handleBackToMenu}
        />
      )}
      {screen.type === 'gameplay' && (
        <GameplayScreen
          vehicleId={screen.vehicleId}
          stageId={screen.stageId}
          upgradeLevels={gameState.upgradeLevels}
          onRunEnd={handleRunEnd}
        />
      )}
      {screen.type === 'results' && (
        <ResultsScreen
          distance={screen.distance}
          coinsEarned={screen.coins}
          stuntPoints={screen.stuntPoints}
          totalCoins={gameState.coinBalance}
          reason={screen.reason}
          onPlayAgain={() => setScreen({ type: 'stageSelect' })}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </>
  );
}
