"use client";

import React, { useState, useEffect } from 'react';
import styles from './CommunityPage.module.css';
import { searchUsers, sendFriendRequest, getFriendRequests, respondToFriendRequest, getFriendsList, getFriendActivity } from '@/services/supabaseService';
import { Search, UserPlus, Check, X, Users, Activity, Flame, Trophy } from 'lucide-react';

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'search' | 'requests'>('friends');

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    const [reqs, list] = await Promise.all([
      getFriendRequests(),
      getFriendsList()
    ]);
    setPendingRequests(reqs);
    
    // Cargar actividad de amigos
    const friendsWithActivity = await Promise.all(list.map(async (f: any) => {
      const activity = await getFriendActivity(f._id);
      return { ...f, activity };
    }));
    setFriends(friendsWithActivity);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    const results = await searchUsers(searchQuery);
    setSearchResults(results);
    setIsLoading(false);
  };

  const handleSendRequest = async (userId: string) => {
    await sendFriendRequest(userId);
    setSearchResults(searchResults.filter(u => u._id !== userId));
    alert("Solicitud enviada");
  };

  const handleRespond = async (requestId: string, status: 'accepted' | 'rejected') => {
    await respondToFriendRequest(requestId, status);
    loadSocialData();
  };

  return (
    <div className={styles.communityContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Comunidad</h1>
        <p className={styles.subtitle}>Conecta con otros atletas y sigue su progreso.</p>
      </header>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'friends' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          Mis Amigos
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'search' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Buscar
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'requests' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Solicitudes {pendingRequests.length > 0 && <span className={styles.badge}>{pendingRequests.length}</span>}
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'search' && (
          <div className={styles.searchSection}>
            <div className={styles.searchBar}>
              <input 
                type="text" 
                placeholder="Buscar por nombre o email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? '...' : <Search size={20} />}
              </button>
            </div>

            <div className={styles.resultsGrid}>
              {searchResults.map(user => (
                <div key={user._id} className={styles.userCard}>
                  <img src={user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} alt={user.name} className={styles.userAvatar} />
                  <div className={styles.userInfo}>
                    <h3 className={styles.userName}>{user.name}</h3>
                    <p className={styles.userGoal}>{user.goals || 'Sin objetivo definido'}</p>
                  </div>
                  <button onClick={() => handleSendRequest(user._id)} className={styles.addBtn}>
                    <UserPlus size={18} />
                  </button>
                </div>
              ))}
              {searchResults.length === 0 && !isLoading && searchQuery && <p className={styles.empty}>No se encontraron usuarios.</p>}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className={styles.requestsSection}>
            {pendingRequests.map(req => (
              <div key={req._id} className={styles.requestCard}>
                <div className={styles.requestUser}>
                  <img src={req.requester.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} alt="" className={styles.userAvatar} />
                  <div>
                    <h3 className={styles.userName}>{req.requester.name}</h3>
                    <p className={styles.userEmail}>{req.requester.email}</p>
                  </div>
                </div>
                <div className={styles.requestActions}>
                  <button onClick={() => handleRespond(req._id, 'rejected')} className={styles.rejectBtn}>
                    <X size={20} />
                  </button>
                  <button onClick={() => handleRespond(req._id, 'accepted')} className={styles.acceptBtn}>
                    <Check size={20} />
                  </button>
                </div>
              </div>
            ))}
            {pendingRequests.length === 0 && <p className={styles.empty}>No tienes solicitudes pendientes.</p>}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className={styles.friendsSection}>
            <div className={styles.friendsGrid}>
              {friends.map(friend => (
                <div key={friend._id} className={styles.friendCard}>
                  <div className={styles.friendHeader}>
                    <img src={friend.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} alt="" className={styles.friendAvatar} />
                    <div className={styles.friendMainInfo}>
                      <h3 className={styles.userName}>{friend.name}</h3>
                      <span className={`${styles.statusBadge} ${styles[friend.activity?.status]}`}>
                        {friend.activity?.status === 'perfect' ? '¡Cumpliendo!' : 'Activo'}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.activitySummary}>
                    <div className={styles.activityItem}>
                      <Activity size={14} className={styles.kcalIcon} />
                      <span>{Math.round(friend.activity?.calories || 0)} kcal hoy</span>
                    </div>
                    {friend.activity?.hasWorkout && (
                      <div className={styles.activityItem}>
                        <Flame size={14} className={styles.workoutIcon} />
                        <span>Entrenando hoy</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.friendFooter}>
                    <button className={styles.viewProfileBtn}>Ver Progreso</button>
                  </div>
                </div>
              ))}
              {friends.length === 0 && (
                <div className={styles.noFriends}>
                  <Users size={48} className={styles.noFriendsIcon} />
                  <p>Aún no tienes amigos.</p>
                  <button onClick={() => setActiveTab('search')} className={styles.btnPrimary}>Buscar personas</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
