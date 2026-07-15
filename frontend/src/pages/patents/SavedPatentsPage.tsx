import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PatentCard } from '../../components/patents/PatentCard';
import { useFetch } from '../../hooks/useApi';

export const SavedPatentsPage: React.FC = () => {
  // Using the public feed endpoint for mock data since we don't have a /api/patents/saved endpoint in this phase.
  const { data: response, loading } = useFetch<any>('/patents?limit=6');
  const savedPatents = response || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Bookmark className="text-accent" /> Saved Patents
          </h1>
          <p className="text-sm text-text-muted mt-1">Manage and review intellectual property you have bookmarked.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" placeholder="Search saved..." className="input pl-9 text-sm" />
          </div>
          <button className="btn-secondary px-3"><Filter size={16} /></button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-surface border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : savedPatents.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mb-4">
            <Bookmark size={24} className="text-navy-300" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">No saved patents yet</h3>
          <p className="text-sm text-text-muted max-w-sm mb-6">Explore the marketplace and bookmark interesting patents to build your portfolio.</p>
          <Link to="/marketplace" className="btn-primary">Browse Marketplace</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedPatents.map((patent: any, i: number) => (
            <motion.div
              key={patent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <PatentCard patent={patent} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
