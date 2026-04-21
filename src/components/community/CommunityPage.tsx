"use client";

import React, { useState, useEffect } from 'react';
import styles from './CommunityPage.module.css';
import { searchUsers, sendFriendRequest, getFriendRequests, respondToFriendRequest, getFriendsList, getFriendActivity, removeFriend, getMessages, sendMessage, markMessagesRead } from '@/services/supabaseService';
import { Search, UserPlus, Check, X, Users, Activity, Flame, Trophy, MessageCircle, UserMinus, Send, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'search' | 'requests'>('friends');
  
  // Chat State
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { userDoc } = useAuth();

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

  const handleUnfriend = async (friendId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar a este amigo?")) {
      await removeFriend(friendId);
      loadSocialData();
    }
  };

  const openChat = async (friend: any) => {
    setSelectedFriend(friend);
    const msgs = await getMessages(friend._id);
    setMessages(msgs);
    await markMessagesRead(friend._id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend) return;
    const msg = await sendMessage(selectedFriend._id, newMessage);
    setMessages([...messages, msg]);
    setNewMessage('');
  };

  // Polling para mensajes nuevos
  useEffect(() => {
    let interval: any;
    if (selectedFriend) {
      interval = setInterval(async () => {
        const msgs = await getMessages(selectedFriend._id);
        if (msgs.length !== messages.length) {
          setMessages(msgs);
          markMessagesRead(selectedFriend._id);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [selectedFriend, messages]);

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
                    <button onClick={() => openChat(friend)} className={styles.chatBtn}>
                      <MessageCircle size={18} />
                      Chat
                    </button>
                    <button onClick={() => handleUnfriend(friend._id)} className={styles.unfriendBtn} title="Eliminar Amigo">
                      <UserMinus size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat Overlay */}
      {selectedFriend && (
        <div className={styles.chatOverlay}>
          <div className={styles.chatWindow}>
            <header className={styles.chatHeader}>
              <button onClick={() => setSelectedFriend(null)} className={styles.backBtn}>
                <ArrowLeft size={20} />
              </button>
              <img src={selectedFriend.avatar_url} className={styles.chatAvatar} />
              <div className={styles.chatUser}>
                <h4 className={styles.chatName}>{selectedFriend.name}</h4>
                <p className={styles.chatStatus}>En línea</p>
              </div>
            </header>

            <div className={styles.messageList}>
              {messages.map((msg, i) => {
                const isMe = msg.sender === userDoc?._id || msg.sender === userDoc?.id;
                return (
                  <div key={msg._id || i} className={`${styles.messageWrapper} ${isMe ? styles.myMsgWrapper : ''}`}>
                    <div className={`${styles.message} ${isMe ? styles.myMsg : styles.friendMsg}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.chatInput}>
              <input 
                type="text" 
                placeholder="Escribe un mensaje..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage} className={styles.sendBtn}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
