"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search as SearchIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) setSearchQuery('');
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-4 bg-slate-50 border transition-all text-left outline-none ${
          isOpen ? 'border-primary ring-2 ring-primary/10' : 'border-transparent hover:bg-slate-100'
        } ${error ? 'border-red-500' : ''}`}
      >
        <span className={`text-[11px] font-bold uppercase tracking-widest ${selectedOption ? 'text-primary-darker' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-primary-darker/60 backdrop-blur-sm z-[999] cursor-pointer"
            />
            
            {/* Immersive Options Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-white shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] z-[1000] overflow-hidden"
            >
              <div className="bg-primary-darker p-8 text-white">
                <div className="flex items-center justify-between mb-8">
                  <div>
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Institutional Choice</h4>
                     <h3 className="text-xl font-black uppercase tracking-tighter font-serif italic">{label || "Select Option"}</h3>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="w-12 h-12 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                     <X size={20} />
                  </button>
                </div>

                <div className="relative group">
                   <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                   <input 
                     autoFocus
                     type="text"
                     placeholder="Search options..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 p-5 pl-14 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-primary focus:bg-white/10 transition-all placeholder:text-white/20"
                   />
                </div>
              </div>

              <div className="p-4 max-h-[50vh] overflow-y-auto no-scrollbar bg-white">
                <div className="grid grid-cols-1 gap-1">
                  {filteredOptions.map((option, idx) => {
                    const isSelected = value === option.value;
                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        onClick={() => {
                          onChange(option.value);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left p-6 transition-all border-l-4 flex items-center justify-between group ${
                          isSelected 
                            ? "bg-slate-50 border-primary" 
                            : "border-transparent hover:bg-slate-50 hover:border-slate-200"
                        }`}
                      >
                        <div>
                          <p className={`text-[11px] font-black uppercase tracking-widest ${isSelected ? 'text-primary' : 'text-slate-400 group-hover:text-primary-darker'}`}>
                            {option.label}
                          </p>
                          {isSelected && <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Current Selection</p>}
                        </div>
                        {isSelected && (
                          <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_12px_rgba(3,123,144,0.5)]" />
                        )}
                      </motion.button>
                    );
                  })}
                  
                  {filteredOptions.length === 0 && (
                    <div className="py-20 text-center space-y-4">
                       <div className="w-16 h-16 bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto rounded-full text-slate-200">
                          <SearchIcon size={24} />
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">No matching classifications found</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
                 <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Open University of Kenya • Academic Management</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {error && <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest ml-1">{error}</p>}
    </div>
  );
};

export default CustomSelect;
