/**
 * Friends Page
 *
 * Manage friends and discover new users.
 */

import { useState } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { useLayout } from '@/hooks/useLayout';
import { useFriends } from '@/contexts/FriendsContext';
import { FriendsList } from '@/components/Friends/FriendsList';
import { UserBrowser } from '@/components/Friends/UserBrowser';
import { PageTransition } from '@/components/layout/PageTransition';
import '@/components/Friends/Friends.css';

type Tab = 'friends' | 'find';

export default function Friends() {
  const { contentPadding, isDesktop } = useLayout();
  const { friends } = useFriends();
  const [activeTab, setActiveTab] = useState<Tab>('friends');

  return (
    <PageTransition>
      <div
        style={{
          padding: contentPadding,
          maxWidth: isDesktop ? '600px' : undefined,
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div className="friends-header">
          <h1 className="page-title">
            <Users size={24} />
            Friends
          </h1>
        </div>

        {/* Tabs */}
        <div className="friends-tabs">
          <button
            className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            <Users size={16} />
            My Friends
            {friends.length > 0 && (
              <span className="tab-badge">{friends.length}</span>
            )}
          </button>

          <button
            className={`tab-button ${activeTab === 'find' ? 'active' : ''}`}
            onClick={() => setActiveTab('find')}
          >
            <UserPlus size={16} />
            Find Users
          </button>
        </div>

        {/* Tab Content */}
        <div className="friends-content">
          {activeTab === 'friends' ? (
            <FriendsList />
          ) : (
            <UserBrowser />
          )}
        </div>
      </div>
    </PageTransition>
  );
}
