import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, FileText, AlertCircle, CheckCircle, ArrowLeft, Loader2, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import api from '../../lib/api';
import { getStatusBadgeClass } from '../../lib/utils';
import { SectionHeader } from '../../components/ui/StatCard';

const SAMPLE_CSV = `Title,PatentNumber,ApplicationNumber,Status,Type,FilingDate,GrantDate,ExpiryDate,Country,IPCCodes,CPCCodes,Abstract,Description,Domain,SubDomain,Keywords,TRL,IsListed,AskingPrice,RoyaltyRate,LicenseType,IsExclusive
"AI-Powered Predictive Maintenance System","US10234567","16/123456","Granted","Utility","2020-05-12","2022-08-15","2040-05-12","USA","G06F 17/00","G06N 3/08","A predictive maintenance system that uses machine learning...","Detailed description...","Artificial Intelligence","Machine Learning","Predictive Maintenance, IoT, Neural Networks","6","true","500000","5.5","Exclusive","true"
"Novel Synthetic Pathway for Biomaterial","EP2345678","EP19123456","Pending","Utility","2021-11-20","","","Europe","C12N 15/00","","A new biological synthesis method for sustainable materials...","","Biotechnology","Synthetic Biology","Biomaterial, Sustainable","4","false","","","","false"`;

export const PatentBulkUploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'patent_upload_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== 'text/csv' && !selected.name.endsWith('.csv')) {
        setErrors(['Please upload a valid CSV file.']);
        return;
      }
      setFile(selected);
      setErrors([]);
      parseCSV(selected);
    }
  };

  const parseCSV = (csvFile: File) => {
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        // Basic validation
        const validationErrors: string[] = [];
        const validatedData = data.map((row, index) => {
          const rowNum = index + 2; // +2 for 1-based index and header row
          if (!row.Title) validationErrors.push(`Row ${rowNum}: Title is required.`);
          if (!row.Abstract) validationErrors.push(`Row ${rowNum}: Abstract is required.`);
          if (!row.Domain) validationErrors.push(`Row ${rowNum}: Domain is required.`);
          
          return {
            title: row.Title,
            patentNumber: row.PatentNumber || '',
            applicationNumber: row.ApplicationNumber || '',
            status: row.Status || 'Filed',
            type: row.Type || 'Utility',
            filingDate: row.FilingDate || null,
            grantDate: row.GrantDate || null,
            expiryDate: row.ExpiryDate || null,
            country: row.Country || 'USA',
            ipcCodes: row.IPCCodes ? row.IPCCodes.split(',').map((s: string) => s.trim()) : [],
            cpcCodes: row.CPCCodes ? row.CPCCodes.split(',').map((s: string) => s.trim()) : [],
            abstract: row.Abstract,
            description: row.Description || '',
            domain: row.Domain,
            subDomain: row.SubDomain || '',
            keywords: row.Keywords ? row.Keywords.split(',').map((s: string) => s.trim()) : [],
            trl: parseInt(row.TRL) || 1,
            isListed: row.IsListed?.toLowerCase() === 'true',
            askingPrice: parseFloat(row.AskingPrice) || null,
            royaltyRate: parseFloat(row.RoyaltyRate) || null,
            licenseType: row.LicenseType || null,
            isExclusive: row.IsExclusive?.toLowerCase() === 'true',
          };
        });

        if (validationErrors.length > 0) {
          setErrors(validationErrors.slice(0, 10)); // Show max 10 errors
        } else {
          setParsedData(validatedData);
          setErrors([]);
        }
      },
      error: (error: Error) => {
        setErrors([`Failed to parse CSV: ${error.message}`]);
      }
    });
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;
    setIsUploading(true);
    setErrors([]);
    
    try {
      const response = await api.post('/patents/bulk', { patents: parsedData });
      if (response.data.success) {
        setSuccessCount(response.data.data.count);
      }
    } catch (err: any) {
      console.error(err);
      setErrors([err.response?.data?.error || 'Failed to bulk upload patents.']);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setParsedData([]);
    setErrors([]);
    setSuccessCount(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/patents" className="btn-ghost mb-4 text-xs inline-flex gap-2">
        <ArrowLeft size={14} /> Back to Portfolio
      </Link>
      
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="page-title flex items-center gap-2">
          <Upload size={24} className="text-accent" />
          Bulk Patent Upload
        </h1>
        <p className="text-text-muted mt-2">Import multiple patents at once by uploading a formatted CSV file.</p>
      </motion.div>

      {successCount !== null ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card text-center py-12">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4 text-success">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">Upload Successful!</h2>
          <p className="text-text-muted mb-6">Successfully imported {successCount} patents into your portfolio.</p>
          <div className="flex justify-center gap-3">
            <button onClick={resetForm} className="btn-secondary">Upload More</button>
            <button onClick={() => navigate('/patents')} className="btn-primary">View Portfolio</button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <div className="card">
            <SectionHeader title="1. Download Template" subtitle="Use our template to ensure your data is formatted correctly." />
            <button onClick={handleDownloadSample} className="btn-secondary gap-2">
              <Download size={14} /> Download Sample CSV
            </button>
          </div>

          <div className="card">
            <SectionHeader title="2. Upload CSV File" subtitle="Upload your filled out CSV template." />
            
            {!file ? (
              <div 
                className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-accent/50 hover:bg-accent/5 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".csv"
                  onChange={handleFileChange}
                />
                <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4 text-accent">
                  <FileText size={24} />
                </div>
                <h3 className="font-semibold mb-1">Click to browse or drag and drop</h3>
                <p className="text-xs text-text-muted">CSV files only. Max 5MB.</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-navy-50 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <FileText size={24} className="text-accent" />
                  <div>
                    <div className="font-semibold text-sm">{file.name}</div>
                    <div className="text-xs text-text-muted">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <button onClick={resetForm} className="p-2 hover:bg-white rounded-md text-text-muted hover:text-danger transition-colors">
                  <X size={18} />
                </button>
              </div>
            )}

            {errors.length > 0 && (
              <div className="mt-4 p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger">
                <div className="flex items-center gap-2 font-semibold mb-2 text-sm">
                  <AlertCircle size={16} /> Validation Errors
                </div>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  {errors.map((err, i) => <li key={i}>{err}</li>)}
                  {errors.length === 10 && <li className="text-text-muted italic">...and more. Please fix above errors first.</li>}
                </ul>
              </div>
            )}
          </div>

          {parsedData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
              <SectionHeader title="3. Preview & Confirm" subtitle={`Ready to import ${parsedData.length} patents.`} />
              
              <div className="border border-border rounded-lg overflow-x-auto mb-6">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-navy-50 border-b border-border">
                    <tr>
                      <th className="p-3 font-semibold text-text-muted text-xs">Title</th>
                      <th className="p-3 font-semibold text-text-muted text-xs">Domain</th>
                      <th className="p-3 font-semibold text-text-muted text-xs">Status</th>
                      <th className="p-3 font-semibold text-text-muted text-xs">TRL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parsedData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-navy-50/50">
                        <td className="p-3 font-medium text-text-primary max-w-[200px] truncate">{row.title}</td>
                        <td className="p-3 text-text-muted">{row.domain}</td>
                        <td className="p-3"><span className={getStatusBadgeClass(row.status)}>{row.status}</span></td>
                        <td className="p-3 text-text-muted">TRL {row.trl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 5 && (
                  <div className="p-2 text-center text-xs text-text-muted bg-navy-50 border-t border-border">
                    And {parsedData.length - 5} more rows...
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={resetForm} className="btn-secondary" disabled={isUploading}>Cancel</button>
                <button onClick={handleUpload} disabled={isUploading} className="btn-primary gap-2">
                  {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {isUploading ? 'Importing...' : `Import ${parsedData.length} Patents`}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
