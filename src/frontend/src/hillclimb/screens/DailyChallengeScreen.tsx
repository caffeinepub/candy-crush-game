import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Trophy, Check } from 'lucide-react';
import { getDailyChallenge, isDailyChallengeCompleted, canClaimDaily } from '../daily/dailyChallenge';
import type { GameState } from '../progression/storage';
import { ASSETS } from '../assets';

interface DailyChallengeScreenProps {
  gameState: GameState;
  onDailyClaimed: (reward: number, dateKey: string) => void;
  onBack: () => void;
}

export default function DailyChallengeScreen({ gameState, onDailyClaimed, onBack }: DailyChallengeScreenProps) {
  const challenge = getDailyChallenge();
  const completed = isDailyChallengeCompleted(gameState);
  const canClaim = canClaimDaily(gameState);

  const handleClaim = () => {
    if (canClaim) {
      onDailyClaimed(challenge.reward, challenge.dateKey);
    }
  };

  return (
    <div className="hillclimb-daily">
      <div className="hillclimb-daily-header">
        <Button onClick={onBack} variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="hillclimb-daily-title">Daily Challenge</h1>
      </div>

      <div className="hillclimb-daily-content">
        <Card className="hillclimb-daily-card">
          <CardHeader>
            <CardTitle className="hillclimb-daily-challenge-title">
              <Trophy className="inline mr-2 h-5 w-5" />
              Today's Challenge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="hillclimb-daily-objective">
              <h3 className="hillclimb-daily-objective-title">{challenge.title}</h3>
              <p className="hillclimb-daily-objective-description">{challenge.description}</p>
            </div>

            <div className="hillclimb-daily-reward">
              <img src={ASSETS.coinIcon} alt="Reward" className="hillclimb-coin-icon" />
              <span className="hillclimb-daily-reward-amount">{challenge.reward} Coins</span>
            </div>

            {completed && !canClaim && (
              <div className="hillclimb-daily-claimed">
                <Check className="mr-2 h-5 w-5" />
                Already Claimed Today
              </div>
            )}

            {completed && canClaim && (
              <Button onClick={handleClaim} size="lg" className="w-full">
                Claim Reward
              </Button>
            )}

            {!completed && (
              <div className="hillclimb-daily-incomplete">
                Complete the challenge to claim your reward!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
