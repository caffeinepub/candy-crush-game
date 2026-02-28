import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Lock, Check } from 'lucide-react';
import { VEHICLES, type VehicleId } from '../progression/vehicles';
import { UPGRADES, canAffordUpgrade, getUpgradeCost } from '../progression/upgrades';
import type { GameState } from '../progression/storage';
import AuthAndSyncPanel from '../ui/AuthAndSyncPanel';
import { ASSETS } from '../assets';

interface GarageScreenProps {
  gameState: GameState;
  selectedVehicle: VehicleId;
  onVehicleSelected: (vehicleId: VehicleId) => void;
  onVehicleUnlocked: (vehicleId: VehicleId, cost: number) => void;
  onUpgradePurchased: (upgradeType: string, cost: number) => void;
  onBack: () => void;
  onCloudSyncUpdate: (newState: GameState) => void;
}

export default function GarageScreen({
  gameState,
  selectedVehicle,
  onVehicleSelected,
  onVehicleUnlocked,
  onUpgradePurchased,
  onBack,
  onCloudSyncUpdate
}: GarageScreenProps) {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'upgrades'>('vehicles');

  const isVehicleUnlocked = (vehicleId: VehicleId) => {
    return vehicleId === 'hillClimber' || gameState.unlockedVehicles.includes(vehicleId);
  };

  const handleUnlockVehicle = (vehicleId: VehicleId) => {
    const vehicle = VEHICLES.find(v => v.id === vehicleId);
    if (!vehicle || gameState.coinBalance < vehicle.unlockCost) return;
    onVehicleUnlocked(vehicleId, vehicle.unlockCost);
  };

  const handlePurchaseUpgrade = (upgradeType: string) => {
    const currentLevel = gameState.upgradeLevels[upgradeType] || 0;
    const cost = getUpgradeCost(upgradeType, currentLevel);
    if (!canAffordUpgrade(gameState.coinBalance, upgradeType, currentLevel)) return;
    onUpgradePurchased(upgradeType, cost);
  };

  return (
    <div className="hillclimb-garage">
      <div className="hillclimb-garage-header">
        <Button onClick={onBack} variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="hillclimb-garage-title">Garage</h1>
        <div className="hillclimb-garage-coins">
          <img src={ASSETS.coinIcon} alt="Coins" className="hillclimb-coin-icon" />
          <span>{gameState.coinBalance}</span>
        </div>
      </div>

      <div className="hillclimb-garage-content">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'vehicles' | 'upgrades')}>
          <TabsList className="hillclimb-garage-tabs">
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="upgrades">Upgrades</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles" className="hillclimb-garage-tab-content">
            <div className="hillclimb-vehicle-grid">
              {VEHICLES.map(vehicle => {
                const unlocked = isVehicleUnlocked(vehicle.id);
                const selected = vehicle.id === selectedVehicle;
                
                return (
                  <Card key={vehicle.id} className={`hillclimb-vehicle-card ${selected ? 'selected' : ''}`}>
                    <CardHeader>
                      <CardTitle className="hillclimb-vehicle-name">{vehicle.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="hillclimb-vehicle-preview">
                        {vehicle.id === 'hillClimber' && ASSETS.garageVehiclePreview ? (
                          <img 
                            src={ASSETS.garageVehiclePreview} 
                            alt={vehicle.name}
                            className="hillclimb-vehicle-preview-img"
                          />
                        ) : (
                          <div className="hillclimb-vehicle-placeholder" />
                        )}
                      </div>
                      <p className="hillclimb-vehicle-description">{vehicle.description}</p>
                      
                      {unlocked ? (
                        <Button
                          onClick={() => onVehicleSelected(vehicle.id)}
                          className="w-full"
                          variant={selected ? 'default' : 'outline'}
                        >
                          {selected ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Selected
                            </>
                          ) : (
                            'Select'
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleUnlockVehicle(vehicle.id)}
                          className="w-full"
                          disabled={gameState.coinBalance < vehicle.unlockCost}
                        >
                          <Lock className="mr-2 h-4 w-4" />
                          Unlock ({vehicle.unlockCost} coins)
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="upgrades" className="hillclimb-garage-tab-content">
            <div className="hillclimb-upgrade-grid">
              {Object.entries(UPGRADES).map(([type, upgrade]) => {
                const currentLevel = gameState.upgradeLevels[type] || 0;
                const cost = getUpgradeCost(type, currentLevel);
                const canAfford = canAffordUpgrade(gameState.coinBalance, type, currentLevel);
                const maxed = currentLevel >= upgrade.maxLevel;

                return (
                  <Card key={type} className="hillclimb-upgrade-card">
                    <CardHeader>
                      <CardTitle className="hillclimb-upgrade-name">{upgrade.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="hillclimb-upgrade-description">{upgrade.description}</p>
                      <div className="hillclimb-upgrade-level">
                        Level: {currentLevel} / {upgrade.maxLevel}
                      </div>
                      {!maxed && (
                        <Button
                          onClick={() => handlePurchaseUpgrade(type)}
                          className="w-full"
                          disabled={!canAfford}
                        >
                          Upgrade ({cost} coins)
                        </Button>
                      )}
                      {maxed && (
                        <div className="hillclimb-upgrade-maxed">MAX LEVEL</div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <AuthAndSyncPanel
          gameState={gameState}
          onCloudSyncUpdate={onCloudSyncUpdate}
        />
      </div>
    </div>
  );
}
