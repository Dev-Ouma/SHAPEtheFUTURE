"use client";
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  dark?: boolean;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select Option", 
  label,
  className = "",
  dark = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, flip: false, scrollY: 0, scrollX: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => 
    String(opt.value).toLowerCase() === String(value).toLowerCase()
  );
  
  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const newFlip = spaceBelow < 250 && spaceAbove > spaceBelow;
      
      const newTop = newFlip ? rect.top + window.scrollY : rect.bottom + window.scrollY;
      const newLeft = rect.left + window.scrollX;
      const newScrollY = window.scrollY;
      const newScrollX = window.scrollX;
      
      setCoords(prev => {
        if (
          prev.top === newTop && 
          prev.left === newLeft && 
          prev.width === rect.width && 
          prev.flip === newFlip &&
          prev.scrollY === newScrollY &&
          prev.scrollX === newScrollX
        ) {
          return prev;
        }
        return {
          top: newTop,
          left: newLeft,
          width: rect.width,
          flip: newFlip,
          scrollY: newScrollY,
          scrollX: newScrollX
        };
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both the button/container and the portalized menu
      const isOutsideContainer = containerRef.current && !containerRef.current.contains(event.target as Node);
      const isOutsideMenu = menuRef.current && !menuRef.current.contains(event.target as Node);
      
      if (isOutsideContainer && isOutsideMenu) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderDropdownMenu = () => {
    if (!isOpen) return null;

    const menu = (
      <div 
        ref={menuRef}
        className={`fixed z-[9999] rounded-xl shadow-lg overflow-hidden border transition-all animate-in fade-in duration-200 ${
          coords.flip ? 'mb-1 slide-in-from-bottom-1' : 'mt-1 slide-in-from-top-1'
        } ${
          dark 
            ? 'bg-primary-darker border-slate-700 shadow-black/50' 
            : 'bg-white border-slate-100 shadow-slate-200/20'
        }`}
        style={{ 
          ...(coords.flip 
            ? { bottom: window.innerHeight - (coords.top - coords.scrollY) } 
            : { top: coords.top - coords.scrollY }),
          left: coords.left - coords.scrollX, 
          width: coords.width 
        }}
      >
        {options.length > 8 && (
          <div className={`p-2 border-b ${dark ? 'border-slate-800' : 'border-slate-50'}`}>
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                autoFocus
                placeholder="Filter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 text-[12px] font-bold rounded-lg outline-none focus:ring-1 focus:ring-primary/20 ${
                  dark ? 'bg-primary-darker text-white' : 'bg-slate-50 text-primary-darker'
                }`}
              />
            </div>
          </div>
        )}
        
        <div 
          className="overflow-y-auto custom-scrollbar" 
          style={{ 
            maxHeight: coords.flip 
              ? `calc(min(16rem, ${(coords.top - coords.scrollY) - 16}px))`
              : `calc(min(16rem, 100vh - ${coords.top - coords.scrollY + 16}px))` 
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearch("");
                }}
                className={`w-full text-left px-4 py-3 text-[12px] font-bold uppercase tracking-widest transition-colors flex items-center gap-3 ${
                  option.value === value 
                    ? 'bg-primary-darker text-white' 
                    : (dark ? 'hover:bg-[#ff7f50] hover:text-white text-slate-400' : 'hover:bg-slate-50 text-slate-500')
                }`}
              >
                {option.icon}
                <span className="truncate">{option.label}</span>
              </button>
            ))
          ) : (
            <div className="p-6 text-center text-[11px] font-black uppercase tracking-widest text-slate-300">
              No results
            </div>
          )}
        </div>
      </div>
    );

    return createPortal(menu, document.body);
  };

  return (
    <div className={`space-y-1.5 flex-1 ${className}`} ref={containerRef}>
      {label && (
        <label className={`text-[11px] font-black uppercase tracking-widest ml-1 ${dark ? 'text-slate-500' : 'text-slate-300'}`}>
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full text-left p-4 rounded-xl font-bold text-[13px] transition-all flex items-center justify-between outline-none ring-primary/5 focus:ring-2 ${
            dark 
              ? 'bg-primary-darker text-white border-none' 
              : 'bg-slate-50 text-primary-darker border border-slate-200'
          } ${isOpen ? 'ring-2' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center gap-3 truncate">
            {selectedOption?.icon}
            <span className={selectedOption ? "truncate" : "text-slate-300 truncate"}>
              {selectedOption ? selectedOption.label : (value && value !== "" && value !== "all" ? `ID: ${String(value).substring(0,8)}...` : placeholder)}
            </span>
          </div>
          <ChevronDown 
            size={16} 
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${dark ? 'text-slate-700' : 'text-slate-300'}`} 
          />
        </button>

        {renderDropdownMenu()}
      </div>
    </div>
  );
};
