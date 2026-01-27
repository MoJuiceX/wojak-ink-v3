/**
 * Friends Lightbox Component
 *
 * Lightbox modal for viewing and managing friends.
 * Reuses FriendsList and UserBrowser components from the Friends feature.
 */

import { useState } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { Lightbox } from '@/components/ui/Lightbox';
import { FriendsList } from '@/components/Friends/FriendsList';
import { UserBrowser } from '@/components/Friends/UserBrowser';
import { useFriends } from '@/contexts/FriendsContext';

type FriendsTab = 'friends' | 'find';

interface FriendsLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  /** Which tab to show initially */
  initialTab?: FriendsTab;
}

export function FriendsLightbox({
  isOpen,
  onClose,
  initialTab = 'friends',
}: FriendsLightboxProps) {
  const [activeTab, setActiveTab] = useState<FriendsTab>(initialTab);
  const { friends } = useFriends();

  // Reset tab when opening with different initial tab
  const handleClose = () => {
    onClose();
    // Reset to friends tab after closing
    setTimeout(() => setActiveTab(initialTab), 300);
  };

  return (
    <Lightbox
      isOpen={isOpen}
      onClose={handleClose}
      title="Friends"
      size="lg"
    >
      {/* Tabs */}
      <div className="lightbox-tabs">
        <button
          type="button"
          className={`lightbox-tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          <Users size={16} />
          My Friends
          {friends.length > 0 && (
            <span className="tab-badge">{friends.length}</span>
          )}
        </button>

        <button
          type="button"
          className={`lightbox-tab ${activeTab === 'find' ? 'active' : ''}`}
          onClick={() => setActiveTab('find')}
        >
          <UserPlus size={16} />
          Find Users
        </button>
      </div>

      {/* Tab Content */}
      <div className="friends-lightbox-content">
        {activeTab === 'friends' ? (
          <FriendsList />
        ) : (
          <UserBrowser />
        )}
      </div>
    </Lightbox>
  );
}

export default FriendsLightbox;
