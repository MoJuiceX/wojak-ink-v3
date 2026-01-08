import { useState, useEffect, useMemo } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonInput,
  IonItem,
} from '@ionic/react';
import { arrowBack, lockClosed, refreshOutline, chevronUp, chevronDown } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './AdminStats.css';

const WORKER_API_URL = 'https://wojak-mobile-trade-fetcher.abitsolvesthis.workers.dev';
const ADMIN_PASSWORD_KEY = 'wojakAdminPassword';

interface FavoriteStatsData {
  totalSaves: number;
  savesByDate: Record<string, number>;
  attributes: Record<string, Record<string, number>>;
  combinations: Record<string, number>;
  lastUpdated: string | null;
}

type SortField = 'name' | 'count';
type SortDirection = 'asc' | 'desc';

const AdminStats: React.FC = () => {
  const history = useHistory();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<FavoriteStatsData | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('count');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Check for stored password on mount
  useEffect(() => {
    const storedPassword = localStorage.getItem(ADMIN_PASSWORD_KEY);
    if (storedPassword) {
      setPassword(storedPassword);
      fetchStats(storedPassword);
    }
  }, []);

  const fetchStats = async (pwd: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${WORKER_API_URL}/api/favorite-stats?password=${encodeURIComponent(pwd)}`);

      if (response.status === 401) {
        setError('Invalid password');
        setIsAuthenticated(false);
        localStorage.removeItem(ADMIN_PASSWORD_KEY);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
      setIsAuthenticated(true);
      localStorage.setItem(ADMIN_PASSWORD_KEY, pwd);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    if (password.trim()) {
      fetchStats(password.trim());
    }
  };

  const handleRefresh = () => {
    const storedPassword = localStorage.getItem(ADMIN_PASSWORD_KEY);
    if (storedPassword) {
      fetchStats(storedPassword);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setStats(null);
    setPassword('');
    localStorage.removeItem(ADMIN_PASSWORD_KEY);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'count' ? 'desc' : 'asc');
    }
  };

  // Get sorted attributes for current category
  const sortedAttributes = useMemo(() => {
    if (!stats?.attributes) return [];

    let entries: [string, number][] = [];

    if (activeCategory === 'all') {
      // Flatten all categories
      for (const [category, attrs] of Object.entries(stats.attributes)) {
        for (const [name, count] of Object.entries(attrs)) {
          entries.push([`${category}: ${name}`, count]);
        }
      }
    } else if (stats.attributes[activeCategory]) {
      entries = Object.entries(stats.attributes[activeCategory]);
    }

    // Sort
    entries.sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc'
          ? a[0].localeCompare(b[0])
          : b[0].localeCompare(a[0]);
      } else {
        return sortDirection === 'asc'
          ? a[1] - b[1]
          : b[1] - a[1];
      }
    });

    return entries;
  }, [stats, activeCategory, sortField, sortDirection]);

  // Get sorted combinations
  const sortedCombinations = useMemo(() => {
    if (!stats?.combinations) return [];
    return Object.entries(stats.combinations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
  }, [stats]);

  // Get daily saves for chart
  const dailySaves = useMemo(() => {
    if (!stats?.savesByDate) return [];
    return Object.entries(stats.savesByDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14); // Last 14 days
  }, [stats]);

  const categories = useMemo(() => {
    if (!stats?.attributes) return ['all'];
    return ['all', ...Object.keys(stats.attributes).sort()];
  }, [stats]);

  // Render login screen
  if (!isAuthenticated) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButton slot="start" fill="clear" onClick={() => history.goBack()}>
              <IonIcon icon={arrowBack} />
            </IonButton>
            <IonTitle>Admin Stats</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="admin-stats-content">
          <div className="admin-login">
            <IonIcon icon={lockClosed} className="login-icon" />
            <h2>Admin Access Required</h2>
            <p>Enter the admin password to view statistics</p>

            <IonItem className="password-input">
              <IonInput
                type="password"
                placeholder="Password"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value || '')}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </IonItem>

            {error && <p className="error-message">{error}</p>}

            <IonButton
              expand="block"
              onClick={handleLogin}
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? <IonSpinner name="crescent" /> : 'Login'}
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Render stats dashboard
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButton slot="start" fill="clear" onClick={() => history.goBack()}>
            <IonIcon icon={arrowBack} />
          </IonButton>
          <IonTitle>Favorite Stats</IonTitle>
          <IonButton slot="end" fill="clear" onClick={handleRefresh}>
            <IonIcon icon={refreshOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="admin-stats-content">
        {isLoading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Loading stats...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="stats-summary">
              <div className="stat-card">
                <span className="stat-value">{stats?.totalSaves || 0}</span>
                <span className="stat-label">Total Saves</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{Object.keys(stats?.savesByDate || {}).length}</span>
                <span className="stat-label">Active Days</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{Object.keys(stats?.combinations || {}).length}</span>
                <span className="stat-label">Unique Combos</span>
              </div>
            </div>

            {/* Daily Saves Chart */}
            {dailySaves.length > 0 && (
              <div className="stats-section">
                <h3>Daily Saves (Last 14 Days)</h3>
                <div className="daily-chart">
                  {dailySaves.map(([date, count]) => (
                    <div key={date} className="daily-bar-container">
                      <div
                        className="daily-bar"
                        style={{ height: `${Math.max(10, (count / Math.max(...dailySaves.map(d => d[1]))) * 100)}%` }}
                      >
                        <span className="bar-count">{count}</span>
                      </div>
                      <span className="bar-date">{date.slice(5)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Tabs */}
            <div className="stats-section">
              <h3>Attributes by Category</h3>
              <div className="category-tabs">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>

              {/* Attributes Table */}
              <div className="stats-table-container">
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th onClick={() => toggleSort('name')} className="sortable">
                        Attribute
                        {sortField === 'name' && (
                          <IonIcon icon={sortDirection === 'asc' ? chevronUp : chevronDown} />
                        )}
                      </th>
                      <th onClick={() => toggleSort('count')} className="sortable">
                        Count
                        {sortField === 'count' && (
                          <IonIcon icon={sortDirection === 'asc' ? chevronUp : chevronDown} />
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAttributes.map(([name, count]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td className="count-cell">{count}</td>
                      </tr>
                    ))}
                    {sortedAttributes.length === 0 && (
                      <tr>
                        <td colSpan={2} className="empty-cell">No data yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Combinations */}
            {sortedCombinations.length > 0 && (
              <div className="stats-section">
                <h3>Top Combinations</h3>
                <div className="stats-table-container">
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th>Combination</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedCombinations.map(([combo, count]) => (
                        <tr key={combo}>
                          <td>{combo}</td>
                          <td className="count-cell">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Last Updated */}
            <div className="stats-footer">
              <p>Last updated: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'Never'}</p>
              <IonButton fill="clear" size="small" onClick={handleLogout}>
                Logout
              </IonButton>
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AdminStats;
