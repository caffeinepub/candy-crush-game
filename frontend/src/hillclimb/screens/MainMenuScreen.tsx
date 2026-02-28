import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ASSETS } from '../assets';
import { Car, Trophy, Calendar, Image } from 'lucide-react';

interface MainMenuScreenProps {
  onStartRun: () => void;
  onOpenGarage: () => void;
  onOpenDailyChallenge: () => void;
  onOpenPhotoGallery: () => void;
}

export default function MainMenuScreen({ onStartRun, onOpenGarage, onOpenDailyChallenge, onOpenPhotoGallery }: MainMenuScreenProps) {
  return (
    <div className="hillclimb-menu">
      <div className="hillclimb-menu-content">
        <img src={ASSETS.logo} alt="Hill Climb Racing" className="hillclimb-menu-logo" />
        
        <Card className="hillclimb-menu-card">
          <div className="hillclimb-menu-tagline">
            Race uphill. Defy physics. Play offline.
          </div>
        </Card>

        <div className="hillclimb-menu-buttons">
          <Button onClick={onStartRun} size="lg" className="hillclimb-menu-primary-btn">
            <Car className="mr-2 h-5 w-5" />
            Start Run
          </Button>
          
          <div className="hillclimb-menu-secondary-buttons">
            <Button onClick={onOpenGarage} variant="outline" size="lg">
              <Trophy className="mr-2 h-4 w-4" />
              Garage
            </Button>
            <Button onClick={onOpenPhotoGallery} variant="outline" size="lg">
              <Image className="mr-2 h-4 w-4" />
              Gallery
            </Button>
          </div>
          
          <Button onClick={onOpenDailyChallenge} variant="outline" size="lg" className="w-full">
            <Calendar className="mr-2 h-4 w-4" />
            Daily Challenge
          </Button>
        </div>

        <footer className="hillclimb-footer">
          <p className="hillclimb-footer-text">
            © {new Date().getFullYear()} · Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hillclimb-footer-link"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
