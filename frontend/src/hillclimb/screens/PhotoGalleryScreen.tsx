import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Lock, X, Coins } from 'lucide-react';
import { ASSETS } from '../assets';

interface PhotoGalleryScreenProps {
  unlockedPhotos: string[];
  coinBalance: number;
  onPhotoUnlocked: (photoId: string, cost: number) => void;
  onBack: () => void;
}

interface GalleryPhoto {
  id: string;
  title: string;
  description: string;
  cost: number;
  imagePath: string;
}

const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'photo-1',
    title: 'Hill Climb Classic',
    description: 'The iconic red vehicle conquering the hills',
    cost: 0,
    imagePath: ASSETS.gallery.photo1
  },
  {
    id: 'photo-2',
    title: 'Race Car Glory',
    description: 'Speed and style on the track',
    cost: 500,
    imagePath: ASSETS.gallery.photo2
  },
  {
    id: 'photo-3',
    title: 'Monster Truck Power',
    description: 'Crushing obstacles with raw power',
    cost: 1000,
    imagePath: ASSETS.gallery.photo3
  },
  {
    id: 'photo-4',
    title: 'Off-Road Adventure',
    description: 'Exploring the toughest terrains',
    cost: 1500,
    imagePath: ASSETS.gallery.photo4
  }
];

export default function PhotoGalleryScreen({ unlockedPhotos, coinBalance, onPhotoUnlocked, onBack }: PhotoGalleryScreenProps) {
  const [viewingPhoto, setViewingPhoto] = useState<GalleryPhoto | null>(null);
  const [unlockingPhoto, setUnlockingPhoto] = useState<GalleryPhoto | null>(null);

  const isPhotoUnlocked = (photoId: string) => unlockedPhotos.includes(photoId);

  const handlePhotoClick = (photo: GalleryPhoto) => {
    if (isPhotoUnlocked(photo.id)) {
      setViewingPhoto(photo);
    } else {
      setUnlockingPhoto(photo);
    }
  };

  const handleUnlockConfirm = () => {
    if (unlockingPhoto && coinBalance >= unlockingPhoto.cost) {
      onPhotoUnlocked(unlockingPhoto.id, unlockingPhoto.cost);
      setUnlockingPhoto(null);
    }
  };

  const canAfford = (cost: number) => coinBalance >= cost;

  return (
    <div className="hillclimb-gallery">
      <div className="hillclimb-gallery-header">
        <Button onClick={onBack} variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="hillclimb-gallery-title">Photo Gallery</h1>
        <div className="hillclimb-gallery-coins">
          <img src={ASSETS.coinIcon} alt="Coins" className="hillclimb-coin-icon" />
          <span>{coinBalance}</span>
        </div>
      </div>

      <div className="hillclimb-gallery-content">
        <div className="hillclimb-gallery-grid">
          {GALLERY_PHOTOS.map((photo) => {
            const unlocked = isPhotoUnlocked(photo.id);
            return (
              <Card
                key={photo.id}
                className="hillclimb-gallery-card"
                onClick={() => handlePhotoClick(photo)}
              >
                <div className="hillclimb-gallery-photo-container">
                  <img
                    src={photo.imagePath}
                    alt={photo.title}
                    className={`hillclimb-gallery-photo ${!unlocked ? 'hillclimb-gallery-photo-locked' : ''}`}
                  />
                  {!unlocked && (
                    <div className="hillclimb-gallery-lock-overlay">
                      <Lock className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="hillclimb-gallery-photo-title">{photo.title}</CardTitle>
                  <CardDescription>{photo.description}</CardDescription>
                </CardHeader>
                {!unlocked && (
                  <CardFooter className="hillclimb-gallery-photo-footer">
                    <div className="hillclimb-gallery-cost">
                      <Coins className="h-4 w-4" />
                      <span>{photo.cost}</span>
                    </div>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Full-screen photo viewer */}
      <Dialog open={!!viewingPhoto} onOpenChange={() => setViewingPhoto(null)}>
        <DialogContent className="hillclimb-gallery-viewer">
          <Button
            onClick={() => setViewingPhoto(null)}
            variant="ghost"
            size="icon"
            className="hillclimb-gallery-viewer-close"
          >
            <X className="h-6 w-6" />
          </Button>
          {viewingPhoto && (
            <img
              src={viewingPhoto.imagePath}
              alt={viewingPhoto.title}
              className="hillclimb-gallery-viewer-image"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Unlock confirmation dialog */}
      <Dialog open={!!unlockingPhoto} onOpenChange={() => setUnlockingPhoto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Photo</DialogTitle>
            <DialogDescription>
              {unlockingPhoto && (
                <>
                  Do you want to unlock "{unlockingPhoto.title}" for {unlockingPhoto.cost} coins?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {unlockingPhoto && (
            <div className="hillclimb-gallery-unlock-preview">
              <img
                src={unlockingPhoto.imagePath}
                alt={unlockingPhoto.title}
                className="hillclimb-gallery-unlock-preview-image"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlockingPhoto(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUnlockConfirm}
              disabled={!unlockingPhoto || !canAfford(unlockingPhoto.cost)}
            >
              {unlockingPhoto && !canAfford(unlockingPhoto.cost) ? (
                <>Not Enough Coins</>
              ) : (
                <>
                  <Coins className="mr-2 h-4 w-4" />
                  Unlock
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
