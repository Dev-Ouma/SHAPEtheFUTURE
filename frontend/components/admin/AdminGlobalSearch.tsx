"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, X, Command, User, FileText, GraduationCap, Building2, Briefcase, Globe, Download, Users, Layers } from 'lucide-react';
import { getApi } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { useAdminMenu } from '@/context/AdminMenuContext';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  link: string;
  isMenu?: boolean;
}

const TypeIcon = ({ type, isMenu }: { type: string, isMenu?: boolean }) => {
  if (isMenu) return <Layers size={14} className="text-slate-400" />;
  switch (type) {
    case 'Staff': return <User size={14} className="text-blue-500" />;
    case 'Publication': return <FileText size={14} className="text-teal-500" />;
    case 'Program': return <GraduationCap size={14} className="text-purple-500" />;
    case 'School': return <Building2 size={14} className="text-amber-500" />;
    case 'Department': return <Building2 size={14} className="text-slate-500" />;
    case 'Page': return <Globe size={14} className="text-emerald-500" />;
    case 'News': return <Globe size={14} className="text-orange-500" />;
    case 'Career': return <Briefcase size={14} className="text-rose-500" />;
    case 'Download': return <Download size={14} className="text-indigo-500" />;
    case 'Peer Learner': return <Users size={14} className="text-cyan-500" />;
    default: return <Search size={14} className="text-slate-400" />;
  }
};

export default function AdminGlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  const { menuSections } = useAdminMenu();

  // Flatten menu items (including nested Service Desk children) for local search
  const allMenuItems = (Array.isArray(menuSections) ? menuSections : []).flatMap((section) => {
    const flatten = (items: any[], parentLabel?: string): any[] =>
      (Array.isArray(items) ? items : []).flatMap((item: any) => {
        if (Array.isArray(item?.children) && item.children.length) {
          return flatten(item.children, item.label);
        }
        if (!item?.href) return [];
        return [{
          id: item.href,
          title: item.label,
          subtitle: parentLabel ? `${section.title} · ${parentLabel}` : `Jump to ${section.title}`,
          type: "Navigation",
          link: item.href,
          isMenu: true,
        }];
      });
    return flatten(section?.items || []);
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      setIsOpen(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        // Local menu search
        const filteredMenus = allMenuItems.filter(item => 
          item.title.toLowerCase().includes(debouncedQuery.toLowerCase())
        );

        // API search
        const apiData = await getApi(`/search/admin?q=${encodeURIComponent(debouncedQuery)}`);
        
        // Combine (Menus first)
        setResults([...filteredMenus, ...apiData]);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Omnisearch fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0) {
        handleNavigate(results[selectedIndex].link);
      }
    }
  };

  const handleNavigate = (link: string) => {
    router.push(link);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className="relative w-full max-w-xl group" ref={dropdownRef}>
      <div className="flex items-center bg-slate-50 border border-slate-200 group-focus-within:border-[#037b90] group-focus-within:bg-white transition-all px-4 py-3">
        {loading ? (
          <Loader2 size={18} className="text-[#037b90] animate-spin" />
        ) : (
          <Search size={18} className="text-slate-400 group-focus-within:text-[#037b90]" />
        )}
        <input 
          ref={inputRef}
          type="text" 
          value={query}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Global Admin Search..." 
          className="bg-transparent border-none focus:ring-0 text-xs font-bold uppercase tracking-widest ml-3 w-full outline-none placeholder:text-slate-300"
        />
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] text-slate-400 font-bold ml-2">
          <Command size={10} />
          <span>K</span>
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search Results</span>
            <span className="text-[10px] font-black text-[#037b90]">{results.length} Matches</span>
          </div>
          
          <div className="max-h-[70vh] overflow-y-auto">
            {results.map((result, idx) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleNavigate(result.link)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full text-left px-5 py-4 flex items-center gap-4 border-b border-slate-50 last:border-0 transition-all ${idx === selectedIndex ? 'bg-slate-100 border-l-4 border-l-[#037b90] pl-4' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
              >
                <div className="w-8 h-8 rounded bg-white flex items-center justify-center shadow-sm">
                  <TypeIcon type={result.type} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-primary-darker truncate uppercase tracking-tight">{result.title}</span>
                    <span className="text-[9px] font-bold text-[#037b90] bg-[#037b90]/5 px-2 py-0.5 rounded-full uppercase tracking-tighter shrink-0">{result.type}</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 truncate mt-0.5">{result.subtitle}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 bg-slate-50 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest border-t border-slate-100">
            Use arrows to navigate • Enter to select
          </div>
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 shadow-xl z-50 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Search size={24} className="text-slate-200" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary-darker mb-1">No matches found</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Try refining your search query</p>
        </div>
      )}
    </div>
  );
}
