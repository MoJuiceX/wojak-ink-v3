import { GameButton } from '@/components/ui/GameButton';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareImageUrl: string | null;
  onDownload: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  shareImageUrl,
  onDownload,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fo-share-modal-overlay" onClick={onClose}>
      <div className="fo-share-modal" onClick={(e) => e.stopPropagation()}>
        <button className="fo-share-modal-close" onClick={onClose}>x</button>
        <h3>Your Score Card</h3>
        {shareImageUrl ? (
          <img src={shareImageUrl} alt="Score" className="fo-share-preview" />
        ) : (
          <div className="fo-share-loading">
            <div className="fo-share-loading-spinner" />
            <span>Generating scorecard...</span>
          </div>
        )}
        <div className="fo-share-modal-buttons">
          <GameButton
            onClick={onDownload}
            variant="primary"
            size="md"
            disabled={!shareImageUrl}
          >
            {shareImageUrl ? 'Download Image' : 'Please wait...'}
          </GameButton>
        </div>
      </div>
    </div>
  );
};
