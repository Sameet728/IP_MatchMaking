import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, FileText, Brain, Globe, Calendar, Hash, Tag, Cpu,
  Building2, Eye, Download, Share2, Star, Handshake, ChevronDown,
  ChevronUp, Users, BarChart3, Shield, ExternalLink, Clock, CheckCircle
} from 'lucide-react';
import { MOCK_PATENTS } from '../../data/mockData';
import { cn, formatCurrency, formatDate, getStatusBadgeClass } from '../../lib/utils';
import { ScoreRing, ProgressBar, SectionHeader } from '../../components/ui/StatCard';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const RADAR_KEYS = ['noveltyScore', 'commercialScore', 'marketFitScore', 'legalStrength', 'investmentReadiness', 'licensingReadiness'] as const;
const RADAR_LABELS: Record<string, string> = {
  noveltyScore: 'Novelty', commercialScore: 'Commercial', marketFitScore: 'Market',
  legalStrength: 'Strength', investmentReadiness: 'Investment', licensingReadiness: 'Licensing',
};

export const PatentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const patent = MOCK_PATENTS.find(p => p.id === id) || MOCK_PATENTS[0];
  const [showFullAbstract, setShowFullAbstract] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'commercial' | 'family'>('overview');

  const radarData = patent.aiReport ? RADAR_KEYS.map(k => ({
    subject: RADAR_LABELS[k], value: patent.aiReport![k],
  })) : [];

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'technical', label: 'Technical' },
    { id: 'commercial', label: 'Commercial' },
    { id: 'family', label: 'Patent Family' },
  ] as const;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
        <Link to="/patents" className="hover:text-accent flex items-center gap-1"><ArrowLeft size={12} /> Patents</Link>
        <span>/</span>
        <span className="text-text-primary">{patent.patentNumber}</span>
      </div>

      {/* Header card */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card mb-4">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <FileText size={20} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-lg font-bold text-text-primary leading-tight max-w-3xl">{patent.title}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className={cn('badge', getStatusBadgeClass(patent.status))}>{patent.status}</span>
                  <span className="text-xs text-text-muted flex items-center gap-1"><Building2 size={11} />{patent.assignee}</span>
                  <span className="text-xs text-text-muted flex items-center gap-1"><Globe size={11} />{patent.country}</span>
                  <span className="text-xs text-text-muted flex items-center gap-1"><Hash size={11} />{patent.patentNumber}</span>
                  <span className="text-xs text-text-muted flex items-center gap-1"><Calendar size={11} />Filed {formatDate(patent.filingDate)}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="btn-ghost p-2"><Star size={16} /></button>
                <button className="btn-ghost p-2"><Share2 size={16} /></button>
                <button className="btn-ghost p-2"><Download size={16} /></button>
                <Link to={`/ai-analysis/${patent.id}`} className="btn-secondary text-xs gap-1"><Brain size={13} /> AI Report</Link>
                <button className="btn-primary text-xs gap-1"><Handshake size={13} /> License Inquiry</button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-border">
          {[
            { label: 'TRL Level', value: `${patent.trl}/9`, color: patent.trl >= 7 ? 'text-success' : patent.trl >= 4 ? 'text-warning' : 'text-danger' },
            { label: 'Claims', value: patent.claims },
            { label: 'Family Size', value: patent.familySize },
            { label: 'Citations', value: patent.citations },
            { label: 'Views', value: patent.views.toLocaleString() },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className={cn('text-xl font-bold', (s as any).color || 'text-text-primary')}>{s.value}</div>
              <div className="text-[11px] text-text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left: Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="card p-0 overflow-hidden">
            <div className="flex border-b border-border">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={cn('px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px',
                    activeTab === t.id ? 'border-accent text-accent bg-accent/3' : 'border-transparent text-text-muted hover:text-text-primary')}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Abstract</h3>
                    <p className={cn('text-sm text-text-primary leading-relaxed', !showFullAbstract && 'line-clamp-4')}>{patent.abstract}</p>
                    <button onClick={() => setShowFullAbstract(!showFullAbstract)} className="text-xs text-accent mt-1 flex items-center gap-1 hover:underline">
                      {showFullAbstract ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read full abstract</>}
                    </button>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Keywords</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {patent.keywords.map(k => <span key={k} className="badge badge-neutral">{k}</span>)}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Target Industries</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {patent.industry.map(i => <span key={i} className="badge badge-accent">{i}</span>)}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Inventors</h3>
                    <div className="flex flex-wrap gap-2">
                      {patent.inventors.map(inv => (
                        <div key={inv} className="flex items-center gap-1.5 px-2.5 py-1 bg-navy-50 rounded-full border border-border">
                          <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-[9px] font-bold text-accent">
                            {inv.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="text-xs text-text-primary">{inv}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'technical' && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { label: 'IPC Code', value: patent.ipcCode },
                      { label: 'CPC Code', value: patent.cpcCode || 'Not assigned' },
                      { label: 'Technology Domain', value: patent.technologyDomain },
                      { label: 'Commercial Readiness', value: patent.commercialReadiness },
                      { label: 'Filing Date', value: formatDate(patent.filingDate) },
                      { label: 'Grant Date', value: patent.grantDate ? formatDate(patent.grantDate) : 'Pending' },
                      { label: 'Expiry Date', value: patent.expiryDate ? formatDate(patent.expiryDate) : '—' },
                      { label: 'Patent Family Size', value: `${patent.familySize} patents` },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-3 bg-navy-50 rounded-lg">
                        <div className="text-[11px] text-text-muted font-medium mb-0.5">{label}</div>
                        <div className="text-sm font-semibold text-text-primary">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Technology Readiness</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        {Array.from({ length: 9 }, (_, i) => i + 1).map(lvl => (
                          <div key={lvl} className="flex items-center gap-2 mb-1.5">
                            <div className={cn('w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0',
                              lvl <= patent.trl ? (patent.trl >= 7 ? 'bg-success text-white' : patent.trl >= 4 ? 'bg-warning text-white' : 'bg-danger text-white') : 'bg-navy-100 text-text-muted')}>
                              {lvl}
                            </div>
                            <div className={cn('text-xs', lvl <= patent.trl ? 'text-text-primary font-medium' : 'text-text-muted')}>
                              TRL {lvl}: {['Basic principles', 'Technology concept', 'Experimental proof', 'Lab validation', 'Relevant env. validation', 'Relevant env. demo', 'Prototype demo', 'Complete & qualified', 'Mission proven'][lvl - 1]}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'commercial' && (
                <div className="space-y-4">
                  {patent.listingPrice && (
                    <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                      <div className="text-xs text-success font-semibold mb-1">Listing Price</div>
                      <div className="text-2xl font-bold text-success">{formatCurrency(patent.listingPrice)}</div>
                      <div className="text-xs text-text-muted mt-1">Technology transfer / licensing price</div>
                    </div>
                  )}

                  {patent.aiReport && (
                    <>
                      <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                        <div className="text-xs text-accent font-semibold mb-1">AI Valuation Estimate</div>
                        <div className="grid grid-cols-3 gap-3 mt-2">
                          <div className="text-center">
                            <div className="text-lg font-bold text-danger">{formatCurrency(patent.aiReport.valuationEstimate.low)}</div>
                            <div className="text-[11px] text-text-muted">Conservative</div>
                          </div>
                          <div className="text-center border-x border-accent/20">
                            <div className="text-lg font-bold text-warning">{formatCurrency(patent.aiReport.valuationEstimate.mid)}</div>
                            <div className="text-[11px] text-text-muted">Mid-range</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-success">{formatCurrency(patent.aiReport.valuationEstimate.high)}</div>
                            <div className="text-[11px] text-text-muted">Optimistic</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Monetization Options</h3>
                        <div className="flex flex-wrap gap-2">
                          {patent.aiReport.monetizationOptions.map(opt => (
                            <span key={opt} className="badge badge-accent">{opt}</span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Government Schemes</h3>
                        <div className="space-y-2">
                          {patent.aiReport.governmentSchemes.map(scheme => (
                            <div key={scheme} className="flex items-center gap-2 text-xs text-text-primary">
                              <CheckCircle size={12} className="text-success shrink-0" /> {scheme}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'family' && (
                <div className="space-y-3">
                  <p className="text-xs text-text-muted">This patent is part of a family of {patent.familySize} related patents filed across multiple jurisdictions.</p>
                  {[
                    { country: patent.country, number: patent.patentNumber, status: patent.status, date: patent.filingDate, current: true },
                    { country: 'PCT', number: 'PCT/IN2023/' + patent.patentNumber.slice(-5), status: 'Pending', date: patent.filingDate },
                    { country: 'United States', number: 'US20230' + patent.patentNumber.slice(-5), status: 'Pending', date: patent.filingDate },
                    { country: 'European Union', number: 'EP23' + patent.patentNumber.slice(-5), status: 'Filed', date: patent.filingDate },
                  ].slice(0, patent.familySize).map((fp, i) => (
                    <div key={i} className={cn('flex items-center gap-3 p-3 rounded-lg border transition-all', fp.current ? 'border-accent bg-accent/5' : 'border-border hover:bg-navy-50')}>
                      <div className="w-8 h-8 rounded-md bg-navy-100 flex items-center justify-center text-xs font-bold text-text-muted">{fp.country.slice(0, 2).toUpperCase()}</div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-text-primary">{fp.country} {fp.current && <span className="badge badge-accent ml-1">This patent</span>}</div>
                        <div className="text-[11px] text-text-muted">{fp.number}</div>
                      </div>
                      <span className={cn('badge', getStatusBadgeClass(fp.status))}>{fp.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: AI Summary sidebar */}
        <div className="space-y-4">
          {patent.aiReport ? (
            <>
              {/* AI Score Overview */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card">
                <SectionHeader title="AI Score Overview" />
                <div className="flex justify-center mb-4">
                  <ScoreRing score={patent.aiReport.overallScore} size={90} label="Overall" />
                </div>
                <div className="space-y-2.5">
                  {RADAR_KEYS.map(k => (
                    <div key={k}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text-muted">{RADAR_LABELS[k]}</span>
                        <span className="font-semibold text-text-primary">{patent.aiReport![k]}</span>
                      </div>
                      <ProgressBar value={patent.aiReport![k]} />
                    </div>
                  ))}
                </div>
                <Link to={`/ai-analysis/${patent.id}`} className="btn-primary w-full text-xs mt-4 justify-center">
                  <Brain size={13} /> View Full AI Report
                </Link>
              </motion.div>

              {/* Top Buyers */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="card">
                <SectionHeader title="Top Potential Buyers" />
                <div className="space-y-3">
                  {patent.aiReport.potentialBuyers.map((buyer, i) => (
                    <div key={i} className="p-3 bg-navy-50 rounded-lg border border-border">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-semibold text-text-primary">{buyer.company}</span>
                        <span className="text-sm font-bold text-success">{buyer.matchScore}%</span>
                      </div>
                      <span className="text-[11px] text-text-muted">{buyer.industry}</span>
                      <ProgressBar value={buyer.matchScore} className="mt-2" color="#10B981" />
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Quick SDG */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="card">
                <SectionHeader title="SDG Mapping" />
                <div className="space-y-1.5">
                  {patent.aiReport.sdgMapping.map(sdg => (
                    <div key={sdg} className="flex items-center gap-2 text-xs text-text-primary">
                      <div className="w-2 h-2 rounded-full bg-success shrink-0" /> {sdg}
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          ) : (
            <div className="card text-center">
              <Brain size={28} className="text-text-muted mx-auto mb-3" />
              <p className="text-sm font-medium text-text-primary mb-1">No AI Report Yet</p>
              <p className="text-xs text-text-muted mb-3">Run AI analysis to get commercial intelligence</p>
              <button className="btn-primary text-xs w-full">Generate AI Report</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
