import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, CheckCircle, ChevronRight, ChevronLeft, Plus, X,
  AlertCircle, Loader2, Globe, Calendar, Hash, Tag, Cpu, Building2,
  FlaskConical, BookOpen, Paperclip, Image, Video, CloudUpload, Info
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ─── STEP CONFIG ────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Basic Info', icon: FileText },
  { id: 2, label: 'Technical Details', icon: Cpu },
  { id: 3, label: 'Inventors & Assignee', icon: Building2 },
  { id: 4, label: 'Commercial Details', icon: FlaskConical },
  { id: 5, label: 'Attachments', icon: Paperclip },
  { id: 6, label: 'Review & Submit', icon: CheckCircle },
];

const COUNTRIES = ['India', 'United States', 'European Union', 'China', 'Japan', 'South Korea', 'Australia', 'Canada', 'Germany', 'United Kingdom', 'France', 'Israel', 'Singapore'];
const PATENT_STATUSES = ['Filed', 'Pending', 'Granted', 'Licensed', 'Abandoned', 'Expired', 'Under Opposition'];
const TECH_DOMAINS = ['Artificial Intelligence', 'Biotechnology', 'Clean Technology', 'Materials Science', 'Semiconductor', 'Healthcare AI', 'Energy Storage', 'Cybersecurity', 'Robotics', 'Quantum Technology', 'Nanotechnology', 'Aerospace', 'Agriculture Technology', 'Construction Technology', 'Defense Technology', 'Financial Technology', 'Photonics', 'Telecommunications'];
const INDUSTRIES = ['Manufacturing', 'Healthcare', 'Energy', 'Agriculture', 'Defense', 'Information Technology', 'Automotive', 'Aerospace', 'Pharmaceuticals', 'Electronics', 'Food & Beverage', 'Construction', 'Finance', 'Education', 'Transportation'];
const TRL_DESCRIPTIONS = ['', 'Basic principles observed', 'Technology concept formulated', 'Experimental proof of concept', 'Technology validated in lab', 'Technology validated in relevant environment', 'Technology demonstrated in relevant environment', 'System prototype demonstrated', 'System complete and qualified', 'Actual system proven in operational environment'];
const IPC_CODES = ['A01 - Agriculture', 'A61 - Medical/Pharma', 'B01 - Physical/Chemical', 'B29 - Working of Plastics', 'B32 - Layered Products', 'C04 - Cement/Concrete', 'C07 - Organic Chemistry', 'C08 - Organic Polymers', 'C09 - Dyes/Paints', 'C10 - Petroleum/Fuel', 'C12 - Biochemistry', 'G01 - Measuring', 'G06 - Computing', 'G16 - ICT for Life Sciences', 'H01 - Basic Electrical', 'H04 - Electric Communication'];
const CR_OPTIONS = ['Concept', 'Prototype', 'Validated', 'Pilot', 'Market Ready', 'Commercial'];

interface FormData {
  patentNumber: string; title: string; country: string; status: string;
  filingDate: string; grantDate: string; expiryDate: string;
  ipcCode: string; cpcCode: string; abstract: string; description: string;
  claims: string; keywords: string; technologyDomain: string; industry: string[];
  trl: number; commercialReadiness: string; familySize: number;
  inventors: string[]; assignee: string; department: string;
  listingPrice: string; isListed: boolean; royaltyRate: string;
  valuationEstimate: string; files: File[];
}

const INIT: FormData = {
  patentNumber: '', title: '', country: 'India', status: 'Granted',
  filingDate: '', grantDate: '', expiryDate: '',
  ipcCode: '', cpcCode: '', abstract: '', description: '', claims: '',
  keywords: '', technologyDomain: '', industry: [],
  trl: 5, commercialReadiness: 'Validated', familySize: 1,
  inventors: [''], assignee: '', department: '',
  listingPrice: '', isListed: true, royaltyRate: '4',
  valuationEstimate: '', files: [],
};

const InputField: React.FC<{ label: string; required?: boolean; hint?: string; children: React.ReactNode }> = ({ label, required, hint, children }) => (
  <div>
    <label className="label">
      {label} {required && <span className="text-danger">*</span>}
    </label>
    {children}
    {hint && <p className="text-[11px] text-text-muted mt-1 flex items-center gap-1"><Info size={10} />{hint}</p>}
  </div>
);

export const PatentUploadPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INIT);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const set = (field: keyof FormData, value: unknown) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (step === 1) {
      if (!form.title) errs.title = 'Patent title is required';
      if (!form.patentNumber) errs.patentNumber = 'Patent number is required';
      if (!form.filingDate) errs.filingDate = 'Filing date is required';
    }
    if (step === 2) {
      if (!form.technologyDomain) errs.technologyDomain = 'Technology domain is required';
      if (!form.abstract) errs.abstract = 'Abstract is required';
    }
    if (step === 3) {
      if (!form.assignee) errs.assignee = 'Assignee is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validate()) setStep(s => Math.min(s + 1, 6)); };
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 2200));
    setSubmitting(false);
    setSubmitted(true);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    set('files', [...form.files, ...dropped]);
  }, [form.files]);

  const toggleIndustry = (ind: string) => {
    const curr = form.industry;
    set('industry', curr.includes(ind) ? curr.filter(i => i !== ind) : [...curr, ind]);
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-success" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Patent Submitted Successfully</h2>
          <p className="text-text-muted text-sm mb-2">"{form.title || 'Your patent'}" has been added to your portfolio.</p>
          <p className="text-text-muted text-sm mb-6">Our AI engine will analyze it within 2–5 minutes and generate a comprehensive commercial report.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/patents')} className="btn-secondary">View Portfolio</button>
            <button onClick={() => navigate('/ai-analysis')} className="btn-primary">View AI Analysis</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="page-title">Add New Patent</h1>
        <p className="text-text-muted text-sm mt-1">Complete all required fields to add your patent to the commercialization platform.</p>
      </motion.div>

      {/* Step progress */}
      <div className="card mb-6">
        <div className="flex items-center gap-0 overflow-x-auto">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <React.Fragment key={s.id}>
                <button onClick={() => done && setStep(s.id)}
                  className={cn('flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg transition-all min-w-fit',
                    active ? 'bg-accent/10' : done ? 'cursor-pointer hover:bg-navy-50' : 'opacity-50 cursor-default')}>
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center',
                    done ? 'bg-success text-white' : active ? 'bg-accent text-white' : 'bg-navy-100 text-text-muted')}>
                    {done ? <CheckCircle size={14} /> : <Icon size={14} />}
                  </div>
                  <span className={cn('text-[11px] font-medium whitespace-nowrap', active ? 'text-accent' : done ? 'text-success' : 'text-text-muted')}>{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={cn('flex-1 h-0.5 min-w-4 mx-1 rounded', done ? 'bg-success' : 'bg-navy-200')} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="mt-3 h-1.5 bg-navy-100 rounded-full overflow-hidden">
          <motion.div className="h-full bg-accent rounded-full"
            animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.4 }} />
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
          <div className="card">
            {/* STEP 1 - Basic Info */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="section-title border-b border-border pb-3 mb-5">Basic Patent Information</h2>

                <div className="grid sm:grid-cols-2 gap-5">
                  <InputField label="Patent Title" required>
                    <input className={cn('input', errors.title && 'border-danger')} value={form.title}
                      onChange={e => set('title', e.target.value)} placeholder="Enter full patent title" />
                    {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
                  </InputField>

                  <InputField label="Patent Number" required hint="e.g., IN202341012345 or US10234567B2">
                    <input className={cn('input', errors.patentNumber && 'border-danger')} value={form.patentNumber}
                      onChange={e => set('patentNumber', e.target.value.toUpperCase())} placeholder="IN202341012345" />
                    {errors.patentNumber && <p className="text-xs text-danger mt-1">{errors.patentNumber}</p>}
                  </InputField>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <InputField label="Country of Filing" required>
                    <select className="input" value={form.country} onChange={e => set('country', e.target.value)}>
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </InputField>

                  <InputField label="Patent Status" required>
                    <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                      {PATENT_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </InputField>
                </div>

                <div className="grid sm:grid-cols-3 gap-5">
                  <InputField label="Filing Date" required>
                    <input type="date" className={cn('input', errors.filingDate && 'border-danger')} value={form.filingDate}
                      onChange={e => set('filingDate', e.target.value)} />
                    {errors.filingDate && <p className="text-xs text-danger mt-1">{errors.filingDate}</p>}
                  </InputField>

                  <InputField label="Grant Date">
                    <input type="date" className="input" value={form.grantDate} onChange={e => set('grantDate', e.target.value)} disabled={form.status === 'Filed' || form.status === 'Pending'} />
                  </InputField>

                  <InputField label="Expiry Date">
                    <input type="date" className="input" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
                  </InputField>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <InputField label="IPC Classification Code" hint="International Patent Classification">
                    <select className="input" value={form.ipcCode} onChange={e => set('ipcCode', e.target.value)}>
                      <option value="">Select IPC code...</option>
                      {IPC_CODES.map(c => <option key={c} value={c.split(' - ')[0]}>{c}</option>)}
                    </select>
                  </InputField>

                  <InputField label="CPC Code (Optional)" hint="Cooperative Patent Classification">
                    <input className="input" value={form.cpcCode} onChange={e => set('cpcCode', e.target.value)} placeholder="e.g., G06N 3/04" />
                  </InputField>
                </div>

                <InputField label="Patent Family Size" hint="Number of related patents in this family">
                  <input type="number" min={1} max={50} className="input w-32" value={form.familySize}
                    onChange={e => set('familySize', parseInt(e.target.value) || 1)} />
                </InputField>
              </div>
            )}

            {/* STEP 2 - Technical Details */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="section-title border-b border-border pb-3 mb-5">Technical Details & Classification</h2>

                <div className="grid sm:grid-cols-2 gap-5">
                  <InputField label="Technology Domain" required>
                    <select className={cn('input', errors.technologyDomain && 'border-danger')} value={form.technologyDomain}
                      onChange={e => set('technologyDomain', e.target.value)}>
                      <option value="">Select domain...</option>
                      {TECH_DOMAINS.map(d => <option key={d}>{d}</option>)}
                    </select>
                    {errors.technologyDomain && <p className="text-xs text-danger mt-1">{errors.technologyDomain}</p>}
                  </InputField>

                  <InputField label="Commercial Readiness">
                    <select className="input" value={form.commercialReadiness} onChange={e => set('commercialReadiness', e.target.value)}>
                      {CR_OPTIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </InputField>
                </div>

                {/* TRL Slider */}
                <InputField label={`Technology Readiness Level (TRL ${form.trl})`} hint={TRL_DESCRIPTIONS[form.trl]}>
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-text-muted mb-1">
                      {Array.from({ length: 9 }, (_, i) => <span key={i + 1}>{i + 1}</span>)}
                    </div>
                    <input type="range" min={1} max={9} value={form.trl}
                      onChange={e => set('trl', parseInt(e.target.value))}
                      className="w-full accent-accent" />
                    <div className="flex justify-between text-[10px] text-text-muted mt-1">
                      <span className="text-danger">Basic Research</span>
                      <span className="text-warning">Development</span>
                      <span className="text-success">Commercial</span>
                    </div>
                  </div>
                </InputField>

                {/* Industry */}
                <InputField label="Target Industries" hint="Select all that apply">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {INDUSTRIES.map(ind => (
                      <button key={ind} type="button" onClick={() => toggleIndustry(ind)}
                        className={cn('px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                          form.industry.includes(ind) ? 'bg-accent text-white border-accent' : 'bg-white border-border text-text-muted hover:border-accent hover:text-accent')}>
                        {ind}
                      </button>
                    ))}
                  </div>
                </InputField>

                <InputField label="Abstract" required hint="200-400 words describing the invention">
                  <textarea rows={4} className={cn('input resize-none leading-relaxed', errors.abstract && 'border-danger')}
                    value={form.abstract} onChange={e => set('abstract', e.target.value)}
                    placeholder="Provide a comprehensive abstract of the invention, its novelty, and key claims..." />
                  <div className="flex justify-between mt-1">
                    {errors.abstract && <p className="text-xs text-danger">{errors.abstract}</p>}
                    <span className={cn('text-[11px] ml-auto', form.abstract.length > 400 ? 'text-warning' : 'text-text-muted')}>{form.abstract.length}/400</span>
                  </div>
                </InputField>

                <InputField label="Keywords" hint="Comma-separated keywords for searchability">
                  <input className="input" value={form.keywords} onChange={e => set('keywords', e.target.value)}
                    placeholder="AI, Machine Learning, Predictive Maintenance, Edge Computing..." />
                </InputField>
              </div>
            )}

            {/* STEP 3 - Inventors & Assignee */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="section-title border-b border-border pb-3 mb-5">Inventors & Ownership</h2>

                <InputField label="Assignee / Patent Owner" required>
                  <input className={cn('input', errors.assignee && 'border-danger')} value={form.assignee}
                    onChange={e => set('assignee', e.target.value)} placeholder="IIT Bombay / Company Name" />
                  {errors.assignee && <p className="text-xs text-danger mt-1">{errors.assignee}</p>}
                </InputField>

                <InputField label="Department (if University)" hint="e.g., Department of Electrical Engineering">
                  <input className="input" value={form.department} onChange={e => set('department', e.target.value)} placeholder="Department of Computer Science" />
                </InputField>

                {/* Inventors list */}
                <div>
                  <label className="label">Inventors <span className="text-danger">*</span></label>
                  <div className="space-y-2">
                    {form.inventors.map((inv, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input className="input flex-1" value={inv}
                          onChange={e => { const a = [...form.inventors]; a[idx] = e.target.value; set('inventors', a); }}
                          placeholder={`Inventor ${idx + 1} full name`} />
                        {form.inventors.length > 1 && (
                          <button type="button" onClick={() => set('inventors', form.inventors.filter((_, i) => i !== idx))}
                            className="btn-ghost p-2 text-danger"><X size={14} /></button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => set('inventors', [...form.inventors, ''])}
                    className="btn-ghost text-xs mt-2 gap-1"><Plus size={12} /> Add Inventor</button>
                </div>
              </div>
            )}

            {/* STEP 4 - Commercial Details */}
            {step === 4 && (
              <div className="space-y-5">
                <h2 className="section-title border-b border-border pb-3 mb-5">Commercial & Licensing Details</h2>

                <div className="flex items-center gap-3 p-4 bg-navy-50 rounded-lg border border-border">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm font-medium text-text-primary">List on Marketplace</span>
                    <span className="text-xs text-text-muted">Make this patent visible to potential licensees</span>
                  </div>
                  <button type="button" onClick={() => set('isListed', !form.isListed)}
                    className={cn('relative w-10 h-5.5 rounded-full transition-all', form.isListed ? 'bg-accent' : 'bg-navy-200')}
                    style={{ height: 22 }}>
                    <span className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm', form.isListed ? 'left-5' : 'left-0.5')} />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <InputField label="Asking / Listing Price (USD)" hint="Leave blank for negotiation-based pricing">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                      <input type="number" className="input pl-7" value={form.listingPrice}
                        onChange={e => set('listingPrice', e.target.value)} placeholder="5,000,000" />
                    </div>
                  </InputField>

                  <InputField label="Preferred Royalty Rate (%)" hint="Annual royalty on net sales">
                    <div className="relative">
                      <input type="number" step="0.5" min={0} max={25} className="input pr-8" value={form.royaltyRate}
                        onChange={e => set('royaltyRate', e.target.value)} placeholder="4.5" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">%</span>
                    </div>
                  </InputField>
                </div>

                <InputField label="Internal Valuation Estimate (USD)" hint="Your internal estimate of patent value">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                    <input type="number" className="input pl-7" value={form.valuationEstimate}
                      onChange={e => set('valuationEstimate', e.target.value)} placeholder="8,000,000" />
                  </div>
                </InputField>

                <InputField label="Detailed Description / Claims" hint="Full technical description and patent claims">
                  <textarea rows={5} className="input resize-none leading-relaxed" value={form.claims}
                    onChange={e => set('claims', e.target.value)}
                    placeholder="1. A system comprising...\n2. The system of claim 1, wherein..." />
                </InputField>
              </div>
            )}

            {/* STEP 5 - Attachments */}
            {step === 5 && (
              <div className="space-y-5">
                <h2 className="section-title border-b border-border pb-3 mb-5">Attachments & Supporting Documents</h2>

                {/* Drag & Drop zone */}
                <div onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
                  className={cn('border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer',
                    dragOver ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50 hover:bg-navy-50')}>
                  <CloudUpload size={32} className={cn('mx-auto mb-3', dragOver ? 'text-accent' : 'text-text-muted')} />
                  <p className="text-sm font-medium text-text-primary mb-1">Drag & drop files here</p>
                  <p className="text-xs text-text-muted mb-3">PDF, PNG, JPG, MP4, DOCX — up to 50MB each</p>
                  <label className="btn-secondary text-xs cursor-pointer">
                    Browse Files
                    <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.mp4,.docx" className="hidden"
                      onChange={e => e.target.files && set('files', [...form.files, ...Array.from(e.target.files)])} />
                  </label>
                </div>

                {form.files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{form.files.length} file(s) selected</p>
                    {form.files.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 bg-navy-50 rounded-lg border border-border">
                        {f.type.includes('pdf') ? <FileText size={14} className="text-danger shrink-0" />
                          : f.type.includes('image') ? <Image size={14} className="text-accent shrink-0" />
                            : <Video size={14} className="text-warning shrink-0" />}
                        <span className="text-xs text-text-primary flex-1 truncate">{f.name}</span>
                        <span className="text-[11px] text-text-muted shrink-0">{(f.size / 1024 / 1024).toFixed(1)}MB</span>
                        <button onClick={() => set('files', form.files.filter((_, j) => j !== i))} className="text-text-muted hover:text-danger transition-colors"><X size={13} /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Patent PDF', hint: 'Official patent document', icon: <FileText size={18} className="text-danger" /> },
                    { label: 'Technical Drawings', hint: 'Figures and schematics', icon: <Image size={18} className="text-accent" /> },
                    { label: 'Demo / Video', hint: 'Working prototype video', icon: <Video size={18} className="text-warning" /> },
                  ].map(t => (
                    <label key={t.label} className="flex flex-col items-center p-4 border border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-navy-50 transition-all text-center">
                      {t.icon}
                      <span className="text-xs font-medium mt-2 text-text-primary">{t.label}</span>
                      <span className="text-[11px] text-text-muted mt-0.5">{t.hint}</span>
                      <input type="file" className="hidden" onChange={e => e.target.files && set('files', [...form.files, ...Array.from(e.target.files)])} />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6 - Review */}
            {step === 6 && (
              <div className="space-y-6">
                <h2 className="section-title border-b border-border pb-3 mb-5">Review & Submit</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { section: 'Basic Info', items: [['Patent Number', form.patentNumber || '—'], ['Country', form.country], ['Status', form.status], ['Filing Date', form.filingDate || '—'], ['IPC Code', form.ipcCode || '—']] },
                    { section: 'Technical Details', items: [['Domain', form.technologyDomain || '—'], ['TRL Level', `${form.trl} — ${TRL_DESCRIPTIONS[form.trl]}`], ['Readiness', form.commercialReadiness], ['Industries', form.industry.join(', ') || '—']] },
                    { section: 'Ownership', items: [['Assignee', form.assignee || '—'], ['Department', form.department || '—'], ['Inventors', form.inventors.filter(Boolean).join(', ') || '—']] },
                    { section: 'Commercial', items: [['Listed', form.isListed ? 'Yes — Marketplace visible' : 'No — Private'], ['Asking Price', form.listingPrice ? `$${Number(form.listingPrice).toLocaleString()}` : 'Negotiable'], ['Royalty Rate', `${form.royaltyRate}%`]] },
                  ].map(({ section, items }) => (
                    <div key={section} className="p-4 bg-navy-50 rounded-lg border border-border">
                      <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">{section}</h3>
                      <dl className="space-y-2">
                        {items.map(([k, v]) => (
                          <div key={k} className="flex gap-2">
                            <dt className="text-xs text-text-muted w-28 shrink-0">{k}:</dt>
                            <dd className="text-xs font-medium text-text-primary flex-1">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>

                {/* Patent title preview */}
                <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                  <p className="text-xs font-semibold text-accent mb-1">Patent Title</p>
                  <p className="text-sm font-semibold text-text-primary">{form.title || 'No title provided'}</p>
                </div>

                {/* AI notification */}
                <div className="flex gap-3 p-4 bg-warning/5 rounded-lg border border-warning/20">
                  <AlertCircle size={16} className="text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-warning">AI Analysis Will Be Triggered</p>
                    <p className="text-xs text-text-muted mt-0.5">Once submitted, our AI engine will automatically analyze this patent and generate a comprehensive commercial intelligence report within 2–5 minutes.</p>
                  </div>
                </div>

                {form.files.length > 0 && (
                  <p className="text-xs text-text-muted">{form.files.length} file(s) ready to upload</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-4">
        <button onClick={handleBack} disabled={step === 1} className="btn-secondary gap-2 disabled:opacity-40">
          <ChevronLeft size={15} /> Back
        </button>
        <span className="text-xs text-text-muted">Step {step} of {STEPS.length}</span>
        {step < 6 ? (
          <button onClick={handleNext} className="btn-primary gap-2">
            Next <ChevronRight size={15} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary gap-2 min-w-32">
            {submitting ? <><Loader2 size={15} className="animate-spin" /> Submitting...</> : <><CheckCircle size={15} /> Submit Patent</>}
          </button>
        )}
      </div>
    </div>
  );
};
