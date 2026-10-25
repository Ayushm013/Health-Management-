import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  CheckCheck,
  Search,
  Sparkles,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { Message } from '../../types/index.js';

export const MessagingView: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Array<{ id: string; name: string; role: string; unreadCount: number; lastMessage: string }>>([]);
  const [activeContactId, setActiveContactId] = useState<string>('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await api.getMessages();
      setMessages(res.messages || []);
      setContacts(res.contacts || []);

      // If contacts exist, pick the first
      if (res.contacts.length > 0 && !activeContactId) {
        setActiveContactId(res.contacts[0].id);
      } else if (res.contacts.length === 0) {
        // Fallback default contact: if user is patient, default to Dr. Chen; if user is doctor, default to Elena
        if (user?.role === 'patient') {
          setActiveContactId('usr_doc_1');
        } else if (user?.role === 'doctor') {
          setActiveContactId('usr_pat_1');
        }
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeContactId) return;

    setSending(true);
    try {
      await api.sendMessage(activeContactId, text.trim());
      setText('');
      await loadMessages();
    } catch (err: any) {
      alert(err.message || 'Unable to deliver message.');
    } finally {
      setSending(false);
    }
  };

  // Filter messages between current user and activeContactId
  const thread = messages.filter(
    m => (m.senderId === user?.id && m.receiverId === activeContactId) ||
         (m.senderId === activeContactId && m.receiverId === user?.id)
  );

  const activeContact = contacts.find(c => c.id === activeContactId) || {
    id: activeContactId,
    name: user?.role === 'patient' ? 'Dr. Sarah Chen, MD' : 'Elena Rostova',
    role: user?.role === 'patient' ? 'doctor' : 'patient',
    unreadCount: 0,
    lastMessage: ''
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Secure Medical Messages
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Confidential doctor-patient clinical messaging channel
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
        
        {/* Left: Contacts List (Col 4) */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-3.5 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-700">Conversations</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {/* If no contacts yet, show available clinical contact */}
            {contacts.length === 0 ? (
              <button
                onClick={() => setActiveContactId(user?.role === 'patient' ? 'usr_doc_1' : 'usr_pat_1')}
                className="w-full text-left p-3.5 flex items-start gap-3 hover:bg-white transition-colors bg-white font-medium"
              >
                <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.role === 'patient' ? 'SC' : 'ER'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {user?.role === 'patient' ? 'Dr. Sarah Chen, MD' : 'Elena Rostova'}
                  </p>
                  <p className="text-[11px] text-teal-700 font-medium">
                    {user?.role === 'patient' ? 'Cardiologist' : 'Active Patient'}
                  </p>
                </div>
              </button>
            ) : (
              contacts.map((c) => {
                const isActive = activeContactId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveContactId(c.id)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                      isActive ? 'bg-white border-l-4 border-l-teal-600 shadow-2xs' : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 truncate">{c.name}</p>
                        <span className="text-[10px] text-slate-400 capitalize">{c.role}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {c.lastMessage || 'Click to view conversation'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message Thread (Col 8) */}
        <div className="md:col-span-8 flex flex-col bg-white">
          
          {/* Thread Header */}
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                {activeContact.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{activeContact.name}</p>
                <p className="text-[10px] text-teal-700 capitalize font-medium">{activeContact.role} Contact</p>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>HIPAA Compliant Session</span>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
            {thread.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-medium text-slate-600">No prior messages with this provider</p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Send a question regarding your recent consultation, medication regimen, or lab result.
                </p>
              </div>
            ) : (
              thread.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs ${
                        isMe
                          ? 'bg-teal-600 text-white rounded-br-xs'
                          : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      <p className="leading-relaxed">{msg.message}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-mono">
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-teal-600" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex items-center gap-2 bg-slate-50/50">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message to clinician..."
              className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-teal-600"
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="p-2.5 text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl transition-colors shadow-2xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
