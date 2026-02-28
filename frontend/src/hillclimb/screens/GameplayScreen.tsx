import { useRef, useEffect, useState } from 'react';
import { useFixedTimestep } from '../engine/useFixedTimestep';
import { createVehicle, updateVehicle, spawnVehicleOnTerrain, type Vehicle } from '../engine/vehicle';
import { createTerrain, sampleTerrain, type Terrain } from '../engine/terrain';
import { createFuelSystem, updateFuel, refuelVehicle, type FuelSystem } from '../engine/fuel';
import { checkFailures, type FailureState } from '../engine/failures';
import { updateScoring, type ScoringState } from '../engine/scoring';
import { detectStunts, type StuntState } from '../engine/stunts';
import { createPickups, updatePickups, checkPickupCollisions, type PickupSystem } from '../engine/pickups';
import { createHazards, updateHazards, checkHazardCollisions, type HazardSystem } from '../engine/hazards';
import { renderFrame } from '../engine/renderer';
import { getInputState, type InputState } from '../engine/input';
import { getVehicleById, type VehicleId } from '../progression/vehicles';
import { getStageById, type StageId } from '../stages/stages';
import { applyUpgrades } from '../progression/upgrades';
import Hud from '../ui/Hud';
import DriveControls from '../ui/DriveControls';

interface GameplayScreenProps {
  vehicleId: VehicleId;
  stageId: StageId;
  upgradeLevels: Record<string, number>;
  onRunEnd: (distance: number, coins: number, stuntPoints: number, reason: string) => void;
}

export default function GameplayScreen({ vehicleId, stageId, upgradeLevels, onRunEnd }: GameplayScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  
  // Game state refs
  const vehicleRef = useRef<Vehicle | null>(null);
  const terrainRef = useRef<Terrain | null>(null);
  const fuelRef = useRef<FuelSystem | null>(null);
  const failureRef = useRef<FailureState | null>(null);
  const scoringRef = useRef<ScoringState | null>(null);
  const stuntRef = useRef<StuntState | null>(null);
  const pickupsRef = useRef<PickupSystem | null>(null);
  const hazardsRef = useRef<HazardSystem | null>(null);
  const inputRef = useRef<InputState>({ throttle: 0, brake: 0 });

  // Initialize game
  useEffect(() => {
    const vehicleConfig = getVehicleById(vehicleId);
    const stage = getStageById(stageId);
    
    // Apply upgrades to vehicle stats
    const upgradedStats = applyUpgrades(vehicleConfig.baseStats, upgradeLevels);
    
    const vehicle = createVehicle(upgradedStats);
    const terrain = createTerrain(stage.terrainConfig);
    
    // Spawn vehicle on terrain at start position
    spawnVehicleOnTerrain(vehicle, terrain, 10);
    
    vehicleRef.current = vehicle;
    terrainRef.current = terrain;
    fuelRef.current = createFuelSystem(upgradedStats.maxFuel);
    failureRef.current = { isFlipped: false, flipTimer: 0, hasCrashed: false };
    scoringRef.current = { distance: 0, coins: 0, stuntPoints: 0 };
    stuntRef.current = { isAirborne: false, airTime: 0, rotations: 0 };
    pickupsRef.current = createPickups();
    hazardsRef.current = createHazards(stage.hazardConfig);
  }, [vehicleId, stageId, upgradeLevels]);

  // Fixed timestep game loop
  const step = (dt: number) => {
    if (!isRunning || !vehicleRef.current || !terrainRef.current || !fuelRef.current) return;

    const vehicle = vehicleRef.current;
    const terrain = terrainRef.current;
    const fuel = fuelRef.current;
    const failure = failureRef.current!;
    const scoring = scoringRef.current!;
    const stunt = stuntRef.current!;
    const pickups = pickupsRef.current!;
    const hazards = hazardsRef.current!;
    const input = inputRef.current;
    const stage = getStageById(stageId);

    // Update vehicle physics
    updateVehicle(vehicle, input, terrain, stage.gravity, dt);

    // Update fuel
    updateFuel(fuel, dt);

    // Check pickup collisions
    const pickedUpFuel = checkPickupCollisions(pickups, vehicle, scoring);
    if (pickedUpFuel > 0) {
      refuelVehicle(fuel, pickedUpFuel);
    }

    // Update pickups and hazards (pass terrain for pickup positioning)
    updatePickups(pickups, vehicle.position.x, terrain);
    updateHazards(hazards, vehicle.position.x);

    // Check hazard collisions
    const hazardImpact = checkHazardCollisions(hazards, vehicle);
    if (hazardImpact) {
      failure.hasCrashed = true;
    }

    // Detect stunts
    detectStunts(stunt, vehicle, dt);

    // Update scoring
    updateScoring(scoring, vehicle, stunt, dt);

    // Check failure conditions
    checkFailures(failure, vehicle, fuel, dt);

    // Check for run end
    if (fuel.current <= 0) {
      endRun('Out of Fuel');
    } else if (failure.hasCrashed) {
      endRun('Crashed');
    } else if (failure.isFlipped && failure.flipTimer > 3) {
      endRun('Flipped');
    }
  };

  useFixedTimestep(step, 1 / 60);

  // Render loop
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const render = () => {
      if (vehicleRef.current && terrainRef.current && pickupsRef.current && hazardsRef.current) {
        const stage = getStageById(stageId);
        renderFrame(
          ctx,
          canvas.width,
          canvas.height,
          vehicleRef.current,
          terrainRef.current,
          pickupsRef.current,
          hazardsRef.current,
          stage
        );
      }
      animationId = requestAnimationFrame(render);
    };
    
    render();
    return () => cancelAnimationFrame(animationId);
  }, [stageId]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const endRun = (reason: string) => {
    if (!isRunning) return;
    setIsRunning(false);
    
    // Reset input state
    inputRef.current = { throttle: 0, brake: 0 };
    
    const scoring = scoringRef.current!;
    onRunEnd(
      Math.floor(scoring.distance),
      scoring.coins,
      scoring.stuntPoints,
      reason
    );
  };

  const handleThrottle = (pressed: boolean) => {
    inputRef.current.throttle = pressed ? 1 : 0;
  };

  const handleBrake = (pressed: boolean) => {
    inputRef.current.brake = pressed ? 1 : 0;
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        inputRef.current.throttle = 1;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        inputRef.current.brake = 1;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        inputRef.current.throttle = 0;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        inputRef.current.brake = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Safety: reset input on unmount and visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        inputRef.current = { throttle: 0, brake: 0 };
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      inputRef.current = { throttle: 0, brake: 0 };
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="hillclimb-gameplay">
      <canvas ref={canvasRef} className="hillclimb-canvas" />
      
      {isRunning && fuelRef.current && scoringRef.current && (
        <>
          <Hud
            distance={Math.floor(scoringRef.current.distance)}
            coins={scoringRef.current.coins}
            fuel={fuelRef.current.current}
            maxFuel={fuelRef.current.max}
          />
          <DriveControls
            onThrottle={handleThrottle}
            onBrake={handleBrake}
          />
        </>
      )}
    </div>
  );
}
