import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send, Paperclip, Search, Phone, Video,
  CheckCheck, FileText, Handshake,
  ChevronRight, Circle, Shield, Calendar,
  Loader2
} from 'lucide-react';
import { cn, formatRelativeTime } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useApi';
import api from '../../lib/api';
import { useSocket } from '../../hooks/useSocket';
import { useAuthStore } from '../../store/authStore';

const STATUS_COLOR: Record<string, string> = {
  'NEGOTIATING': 'text-warning', 'NDA_SIGNED': 'text-accent',
  'TERM_SHEET': 'text-success', 'ACTIVE': 'text-success',
};

const QUICK_ACTIONS = [
  { icon: Shield, label: 'Send NDA', color: 'text-accent' },
  { icon: Handshake, label: 'Propose Terms', color: 'text-success' },
  { icon: Calendar, label: 'Schedule Call', color: 'text-warning' },
  { icon: FileText, label: 'Share Document', color: 'text-text-muted' },
];

export const MessagesPage: React.FC = () => {
  const { user } = useAuthStore();
  const { data: dealsResponse, loading: dealsLoading } = useFetch<any>('/api/deals?limit=50');
  const deals = dealsResponse?.data || [];

  const [activeDealId, setActiveDealId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  
  // Real-time messages state
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useSocket();

  // Set initial active deal
  useEffect(() => {
    if (deals.length > 0 && !activeDealId) {
      setActiveDealId(deals[0].id);
    }
  }, [deals, activeDealId]);

  // Fetch messages when active deal changes
  useEffect(() => {
    if (!activeDealId) return;
    
    setMessagesLoading(true);
    api.get(`/api/deals/${activeDealId}/messages`)
      .then(res => setMessages(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setMessagesLoading(false));

    // Socket: Join room
    if (socket && isConnected) {
      socket.emit('join_deal_room', activeDealId);
    }

    return () => {
      if (socket && isConnected) {
        socket.emit('leave_deal_room', activeDealId);
      }
    }
  }, [activeDealId, socket, isConnected]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (msg: any) => {
      if (msg.dealId === activeDealId) {
        setMessages(prev => [...prev, msg]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    };
    socket.on('new_message', handleNewMessage);
    return () => { socket.off('new_message', handleNewMessage); };
  }, [socket, activeDealId]);

  // Auto-scroll on initial load
  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [messagesLoading]);

  const activeDeal = deals.find((d: any) => d.id === activeDealId);

  const sendMessage = async () => {
    if (!input.trim() || !activeDealId) return;
    try {
      const payload = { content: input, type: 'TEXT' };
      setInput(''); // optimistic clear
      
      // We don't optimistically append to array because the socket event 'new_message' 
      // will arrive immediately and we don't want duplicates.
      await api.post(`/api/deals/${activeDealId}/messages`, payload);
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const filteredDeals = deals.filter((d: any) => 
    !search || 
    d.company.name.toLowerCase().includes(search.toLowerCase()) || 
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  if (dealsLoading) {
    return <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-background"><Loader2 className="animate-spin text-accent" size={32} /></div>;
  }

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-72 bg-surface border-r border-border flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-bold text-text-primary mb-3">Messages</h2>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deals..." className="input pl-8 text-sm py-1.5" />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {filteredDeals.length === 0 ? (
             <div className="p-4 text-center text-xs text-text-muted">No deals found.</div>
          ) : filteredDeals.map((deal: any) => (
            <button key={deal.id} onClick={() => setActiveDealId(deal.id)}
              className={cn('w-full text-left p-4 border-b border-border transition-all hover:bg-navy-50',
                activeDealId === deal.id ? 'bg-accent/5 border-l-2 border-l-accent' : '')}>
              <div className="flex items-start gap-3">
                <div className="relative">
                  {deal.company?.logo ? (
                     <img src={deal.company.logo} className="w-9 h-9 rounded-full shrink-0" alt="logo"/>
                  ) : (
                     <div className="w-9 h-9 rounded-full bg-navy-200 flex items-center justify-center text-xs font-bold text-navy-700 shrink-0">
                       {deal.company?.name?.slice(0, 2).toUpperCase() || 'CO'}
                     </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-text-primary truncate">{deal.company?.name || 'Unknown Company'}</span>
                  </div>
                  <div className="text-[11px] text-text-muted line-clamp-1 mb-1">{deal.title}</div>
                  <span className={cn('text-[10px] font-semibold', STATUS_COLOR[deal.status] || 'text-text-muted')}>{deal.status.replace('_', ' ')}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {!activeDeal ? (
         <div className="flex-1 flex items-center justify-center text-sm text-text-muted">Select a conversation to start messaging.</div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="bg-surface border-b border-border px-5 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text-primary">{activeDeal.company?.name}</span>
                <span className={cn('badge text-[10px]')}>{activeDeal.status.replace('_', ' ')}</span>
              </div>
              <div className="text-[11px] text-text-muted line-clamp-1">{activeDeal.title}</div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button className="btn-ghost p-2"><Phone size={14} /></button>
              <button className="btn-ghost p-2"><Video size={14} /></button>
              <Link to="/deals" className="btn-primary text-xs gap-1"><Handshake size={12} /> Deal Room</Link>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messagesLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin text-text-muted" size={24} /></div>
            ) : messages.length === 0 ? (
              <div className="text-center text-xs text-text-muted my-10">No messages yet. Send a message to start the negotiation!</div>
            ) : messages.map((msg, i) => {
              const isMe = msg.senderId === user?.id;
              const isSystem = msg.type === 'SYSTEM';

              if (isSystem) return (
                <div key={msg.id} className="flex justify-center">
                  <div className="px-4 py-1.5 bg-navy-100 rounded-full text-[11px] text-text-muted text-center max-w-sm">{msg.content}</div>
                </div>
              );

              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 }}
                  className={cn('flex gap-2', isMe ? 'flex-row-reverse' : 'flex-row')}>
                  {!isMe && (
                    <div className="w-7 h-7 rounded-full bg-navy-200 flex items-center justify-center text-[10px] font-bold text-navy-700 shrink-0">
                      {msg.sender?.name?.slice(0, 2).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className={cn('max-w-[72%] space-y-1', isMe ? 'items-end' : 'items-start', 'flex flex-col')}>
                    {!isMe && <span className="text-[10px] text-text-muted px-1">{msg.sender?.name}</span>}

                    {msg.type === 'TEXT' && (
                      <div className={cn('px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                        isMe ? 'bg-accent text-white rounded-tr-sm' : 'bg-white border border-border text-text-primary rounded-tl-sm shadow-sm')}>
                        {msg.content}
                      </div>
                    )}

                    {msg.type === 'DEAL_PROPOSAL' && msg.proposal && (
                      <div className={cn('rounded-2xl border overflow-hidden shadow-sm', isMe ? 'rounded-tr-sm' : 'rounded-tl-sm')}>
                        <div className="bg-accent px-4 py-2 flex items-center gap-2">
                          <Handshake size={14} className="text-white" />
                          <span className="text-xs font-bold text-white">Deal Proposal</span>
                        </div>
                        <div className="bg-white p-4">
                          <p className="text-xs font-bold text-text-primary mb-3">{msg.proposal.title || 'License Term Sheet'}</p>
                          <div className="grid grid-cols-3 gap-3 text-center">
                            {[
                              { label: 'Upfront', value: `$${(msg.proposal.amount / 1000000).toFixed(1)}M` },
                              { label: 'Royalty', value: `${msg.proposal.royalty}%` },
                              { label: 'Duration', value: `${msg.proposal.duration} yrs` },
                            ].map(d => (
                              <div key={d.label} className="p-2 bg-navy-50 rounded-lg">
                                <div className="text-base font-black text-accent">{d.value}</div>
                                <div className="text-[10px] text-text-muted">{d.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className={cn('flex items-center gap-1 px-1', isMe ? 'flex-row-reverse' : '')}>
                      <span className="text-[10px] text-text-muted">{new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && <CheckCheck size={11} className="text-accent" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="bg-surface border-t border-border p-4">
            <div className="flex gap-2 mb-3 overflow-x-auto">
              {QUICK_ACTIONS.map(action => (
                <button key={action.label}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-medium whitespace-nowrap hover:border-accent hover:text-accent transition-all', action.color)}>
                  <action.icon size={11} /> {action.label}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-2">
              <button className="btn-ghost p-2 shrink-0"><Paperclip size={16} /></button>
              <div className="flex-1 relative">
                <textarea
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                  className="input resize-none text-sm py-2.5 pr-12 min-h-[40px] max-h-24 leading-relaxed"
                  rows={1}
                />
              </div>
              <button onClick={sendMessage} disabled={!input.trim()}
                className="btn-primary p-2.5 rounded-xl shrink-0 disabled:opacity-40">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Right panel: Patent info */}
      {activeDeal && (
        <div className="w-64 bg-surface border-l border-border flex flex-col shrink-0 hidden xl:flex">
          <div className="p-4 border-b border-border">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Deal Information</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <div className="text-xs font-semibold text-text-primary leading-tight mb-1">{activeDeal.title}</div>
              <span className="badge badge-accent text-[10px]">{activeDeal.type.replace(/_/g, ' ')}</span>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Territory', value: activeDeal.territory?.join(', ') || 'Global' },
                { label: 'Upfront Fee', value: activeDeal.upfrontFee ? `$${(activeDeal.upfrontFee / 1000).toFixed(0)}k` : 'TBD' },
                { label: 'Royalty', value: activeDeal.royaltyRate ? `${activeDeal.royaltyRate}%` : 'TBD' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-text-muted">{label}</span>
                  <span className="font-semibold text-text-primary">{value}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-3 border-t border-border space-y-2">
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Patents Involved</p>
              {activeDeal.patents?.map((dp: any) => (
                <Link key={dp.patentId} to={`/patents/${dp.patentId}`} className="btn-secondary text-xs w-full justify-center truncate px-2">{dp.patent?.title}</Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
