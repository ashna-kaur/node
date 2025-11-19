import React, { useState, useEffect } from 'react';
import { Camera, Calendar, MapPin, Users, LogOut, Bell, MessageCircle, Shield, Plus } from 'lucide-react';
import io from 'socket.io-client';

useEffect(() => {
  if (user) {
    const socket = io('http://localhost:3000');
    
    socket.on('newNotification', (notification) => {
      setNotifications(prev => [...prev, notification]);
    });

    return () => socket.disconnect();
  }
}, [user]);
const EventHubApp = () => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' });
  const [eventForm, setEventForm] = useState({
    title: '', description: '', date: '', location: '', capacity: '', category: 'Technology'
  });
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    if (user) {
      setEvents([
        {
          _id: '1',
          title: 'React Meetup Milano',
          description: 'Incontro mensile per sviluppatori React. Discuteremo delle ultime novità e best practices.',
          date: '2024-12-20T18:00:00',
          location: 'Milano, Via Torino 5',
          capacity: 50,
          attendees: ['user2'],
          category: 'Technology',
          creator: { username: 'Mario Rossi' }
        },
        {
          _id: '2',
          title: 'Concerto Jazz',
          description: 'Serata di jazz dal vivo con la band "Blue Notes". Ingresso gratuito.',
          date: '2024-12-25T21:00:00',
          location: 'Roma, Auditorium',
          capacity: 200,
          attendees: [],
          category: 'Music',
          creator: { username: 'Laura Bianchi' }
        },
        {
          _id: '3',
          title: 'Torneo Calcetto',
          description: 'Torneo amatoriale di calcetto a 5. Premi per i vincitori!',
          date: '2024-12-30T15:00:00',
          location: 'Torino, Centro Sportivo',
          capacity: 30,
          attendees: ['user1', 'user2', 'user3'],
          category: 'Sports',
          creator: { username: 'Giuseppe Verdi' }
        }
      ]);
    }
  }, [user]);

  const handleLogin = () => {
    if (loginForm.email && loginForm.password) {
      setUser({ 
        id: '123', 
        username: loginForm.email.split('@')[0],
        email: loginForm.email,
        role: loginForm.email.includes('admin') ? 'admin' : 'user'
      });
      setCurrentView('events');
      setLoginForm({ email: '', password: '' });
    }
  };

  const handleRegister = () => {
    if (registerForm.username && registerForm.email && registerForm.password) {
      alert('Registrazione simulata! Ora puoi fare il login.');
      setCurrentView('login');
      setRegisterForm({ username: '', email: '', password: '' });
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
    setSelectedEvent(null);
  };

  const handleCreateEvent = () => {
    if (eventForm.title && eventForm.description && eventForm.date && eventForm.location && eventForm.capacity) {
      const newEvent = {
        _id: Date.now().toString(),
        ...eventForm,
        attendees: [],
        creator: { username: user.username }
      };
      setEvents([...events, newEvent]);
      setCurrentView('events');
      setEventForm({ title: '', description: '', date: '', location: '', capacity: '', category: 'Technology' });
      alert('Evento creato con successo!');
    }
  };

  const handleRegisterForEvent = (eventId) => {
    setEvents(events.map(e => {
      if (e._id === eventId && !e.attendees.includes(user.id)) {
        return { ...e, attendees: [...e.attendees, user.id] };
      }
      return e;
    }));
    alert('Iscrizione confermata!');
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessages([...messages, {
        _id: Date.now().toString(),
        content: messageInput,
        sender: { username: user.username },
        createdAt: new Date().toISOString()
      }]);
      setMessageInput('');
    }
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(e => e._id !== eventId));
    alert('Evento eliminato!');
  };

  // Login/Register View
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 transform hover:scale-105 transition-transform duration-300">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
              <Camera className="w-16 h-16 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">EventHub</h1>
            <p className="text-gray-600">La tua piattaforma per eventi</p>
          </div>

          {currentView === 'login' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">💡 Usa "admin@test.com" per accesso admin</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleLogin}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold shadow-lg hover:shadow-xl"
              >
                Accedi
              </button>
              <button
                onClick={() => setCurrentView('register')}
                className="w-full text-purple-600 py-3 rounded-lg hover:bg-purple-50 transition"
              >
                Non hai un account? Registrati
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleRegister}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                Registrati
              </button>
              <button
                onClick={() => setCurrentView('login')}
                className="w-full text-purple-600 py-3 rounded-lg hover:bg-purple-50 transition"
              >
                Hai già un account? Accedi
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Camera className="w-8 h-8 text-purple-600" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">EventHub</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentView('events')}
              className={`px-4 py-2 rounded-lg transition font-medium ${currentView === 'events' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Eventi
            </button>
            <button
              onClick={() => setCurrentView('create')}
              className={`px-4 py-2 rounded-lg transition font-medium flex items-center space-x-2 ${currentView === 'create' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Plus className="w-4 h-4" />
              <span>Crea</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-4 py-2 rounded-lg transition font-medium flex items-center space-x-2 ${currentView === 'admin' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </button>
            )}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{user.username}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Events List */}
        {currentView === 'events' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Eventi Disponibili</h2>
              <p className="text-gray-600">Scopri e partecipa agli eventi più interessanti</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <div key={event._id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="h-48 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 relative">
                    <div className="absolute top-4 right-4">
                      <span className="text-xs font-semibold text-white bg-black bg-opacity-30 backdrop-blur-sm px-3 py-1 rounded-full">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                        <span>{new Date(event.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-purple-500" />
                        <span>{event.attendees.length}/{event.capacity} partecipanti</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRegisterForEvent(event._id)}
                        disabled={event.attendees.includes(user.id)}
                        className={`flex-1 py-2 rounded-lg font-semibold transition ${
                          event.attendees.includes(user.id)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {event.attendees.includes(user.id) ? '✓ Iscritto' : 'Iscriviti'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setCurrentView('chat');
                        }}
                        className="p-2 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Event */}
        {currentView === 'create' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Crea Nuovo Evento</h2>
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titolo</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Es. Meetup React Milano"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Descrivi il tuo evento..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data e Ora</label>
                  <input
                    type="datetime-local"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capienza</label>
                  <input
                    type="number"
                    value={eventForm.capacity}
                    onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Luogo</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Milano, Via Roma 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <select
                  value={eventForm.category}
                  onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Technology">Technology</option>
                  <option value="Music">Music</option>
                  <option value="Sports">Sports</option>
                  <option value="Art">Art</option>
                  <option value="Food">Food</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button
                onClick={handleCreateEvent}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                Crea Evento
              </button>
            </div>
          </div>
        )}

        {/* Chat View */}
        {currentView === 'chat' && selectedEvent && (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setCurrentView('events')}
              className="mb-4 text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Torna agli eventi
            </button>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                <h3 className="text-2xl font-bold">{selectedEvent.title}</h3>
                <p className="text-purple-100 text-sm mt-1">Chat dell'evento • {messages.length} messaggi</p>
              </div>
              <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-20">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Nessun messaggio ancora. Inizia la conversazione!</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg._id} className={`flex ${msg.sender.username === user.username ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-3 rounded-2xl ${msg.sender.username === user.username ? 'bg-purple-600 text-white' : 'bg-white text-gray-800 shadow-md'}`}>
                        <p className="text-xs font-semibold mb-1 opacity-75">{msg.sender.username}</p>
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t p-4 bg-white flex space-x-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Scrivi un messaggio..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold shadow-lg hover:shadow-xl"
                >
                  Invia
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Panel */}
        {currentView === 'admin' && isAdmin && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Pannello Amministratore</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-2 opacity-90">Totale Eventi</h3>
                <p className="text-5xl font-bold">{events.length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-2 opacity-90">Utenti Attivi</h3>
                <p className="text-5xl font-bold">127</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-2 opacity-90">Eventi Oggi</h3>
                <p className="text-5xl font-bold">5</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Gestione Eventi</h3>
              <div className="space-y-4">
                {events.map(event => (
                  <div key={event._id} className="flex items-center justify-between border-b pb-4 hover:bg-gray-50 p-4 rounded-lg transition">
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg">{event.title}</h4>
                      <p className="text-sm text-gray-600">Creato da: <span className="font-semibold">{event.creator.username}</span></p>
                      <p className="text-xs text-gray-500 mt-1">{event.attendees.length} partecipanti • {event.category}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteEvent(event._id)}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold shadow-lg hover:shadow-xl"
                    >
                      Elimina
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventHubApp;