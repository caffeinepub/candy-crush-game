import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ASSETS } from '../assets';
import { Trophy, Coins, Zap, RotateCcw, Home } from 'lucide-react';

interface ResultsScreenProps {
  distance: number;
  coinsEarned: number;
  stuntPoints: number;
  totalCoins: number;
  reason: string;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export default function ResultsScreen({
  distance,
  coinsEarned,
  stuntPoints,
  totalCoins,
  reason,
  onPlayAgain,
  onBackToMenu
}: ResultsScreenProps) {
  return (
    <div className="hillclimb-results">
      <div className="hillclimb-results-content">
        <Card className="hillclimb-results-card">
          <CardHeader>
            <CardTitle className="hillclimb-results-title">Run Complete!</CardTitle>
            <p className="hillclimb-results-reason">{reason}</p>
          </CardHeader>
          
          <CardContent className="hillclimb-results-stats">
            <div className="hillclimb-stat">
              <Trophy className="hillclimb-stat-icon" />
              <div className="hillclimb-stat-content">
                <div className="hillclimb-stat-label">Distance</div>
                <div className="hillclimb-stat-value">{distance}m</div>
              </div>
            </div>

            <div className="hillclimb-stat">
              <img src={ASSETS.coinIcon} alt="Coins" className="hillclimb-stat-icon-img" />
              <div className="hillclimb-stat-content">
                <div className="hillclimb-stat-label">Coins Earned</div>
                <div className="hillclimb-stat-value">+{coinsEarned}</div>
              </div>
            </div>

            {stuntPoints > 0 && (
              <div className="hillclimb-stat">
                <Zap className="hillclimb-stat-icon" />
                <div className="hillclimb-stat-content">
                  <div className="hillclimb-stat-label">Stunt Points</div>
                  <div className="hillclimb-stat-value">{stuntPoints}</div>
                </div>
              </div>
            )}

            <div className="hillclimb-stat hillclimb-stat-total">
              <Coins className="hillclimb-stat-icon" />
              <div className="hillclimb-stat-content">
                <div className="hillclimb-stat-label">Total Coins</div>
                <div className="hillclimb-stat-value">{totalCoins}</div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="hillclimb-results-actions">
            <Button onClick={onPlayAgain} size="lg" className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              Play Again
            </Button>
            <Button onClick={onBackToMenu} variant="outline" size="lg" className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Menu
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
