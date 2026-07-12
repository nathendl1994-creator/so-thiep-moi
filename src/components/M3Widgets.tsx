/**
 * Material Design 3 (Material You) Modular Reusable Widgets
 * Strictly follows the Senior UX/UI specifications.
 */

import React from 'react';
import { 
  Search, 
  Plus, 
  Camera, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Calendar, 
  MapPin, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { getPastelTheme, MATERIAL_THEME_CLASSES } from '../theme/materialTheme';

// 1. Avatar Widget
interface AvatarProps {
  name: string;
  colorClass?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Avatar({ name, colorClass = 'bg-rose-500', size = 'md', onClick }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-base'
  };
  
  const initials = name ? name.substring(0, 2).toUpperCase() : 'GD';

  return (
    <div 
      onClick={onClick}
      className={`rounded-full ${sizeClasses[size]} ${colorClass} text-white flex items-center justify-center font-bold shrink-0 cursor-pointer transition-transform duration-200 active:scale-90 hover:brightness-105 shadow-sm`}
    >
      {initials}
    </div>
  );
}

// 2. TopAppBar Widget
interface TopAppBarProps {
  title: string;
  subtitle?: string;
  onSearchClick?: () => void;
  avatarName: string;
  avatarColorClass: string;
  onAvatarClick?: () => void;
  logoElement?: React.ReactNode;
}

export function TopAppBar({ 
  title, 
  subtitle, 
  onSearchClick, 
  avatarName, 
  avatarColorClass, 
  onAvatarClick,
  logoElement 
}: TopAppBarProps) {
  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white/70 dark:bg-[#111112]/70 backdrop-blur-md border-b border-[#ECECEC] dark:border-[#222225] flex items-center justify-between px-6 select-none transition-all duration-300">
      <div className="flex items-center gap-3">
        {logoElement ? (
          logoElement
        ) : (
          <div className="w-9 h-9 bg-[#111111] dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center font-display font-extrabold shadow-sm">
            S
          </div>
        )}
        <div>
          <h1 className="text-base font-display font-bold tracking-tight text-[#111111] dark:text-white leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[10px] text-[#666666] dark:text-[#A0A0A5] font-mono tracking-wider uppercase leading-none">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {onSearchClick && (
          <button 
            onClick={onSearchClick}
            className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-200 flex items-center justify-center text-[#111111] dark:text-white cursor-pointer"
            title="Tìm kiếm"
          >
            <Search className="w-5 h-5" />
          </button>
        )}
        <Avatar name={avatarName} colorClass={avatarColorClass} onClick={onAvatarClick} />
      </div>
    </header>
  );
}

// 3. SearchBar Widget
interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export function SearchBar({ value, onChange, placeholder = 'Tìm kiếm thiệp mời...', onClear }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-3 text-sm bg-slate-100/75 dark:bg-white/5 border border-transparent focus:border-[#ECECEC] dark:focus:border-[#222225] focus:bg-white dark:focus:bg-black/30 rounded-[20px] transition-all duration-250 outline-hidden font-sans placeholder-slate-400 text-[#111111] dark:text-white"
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-[#111111] dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// 4. TabBar Widget
interface TabBarProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  const getTabPastelClass = (id: string, isActive: boolean) => {
    if (!isActive) {
      return 'bg-white/40 dark:bg-black/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-white/5 border border-slate-200/40 dark:border-white/5';
    }
    
    switch (id) {
      case 'all':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/50 font-bold shadow-xs';
      case 'pending':
        return 'bg-amber-100/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/30 font-bold shadow-xs';
      case 'attending':
        return 'bg-blue-100/90 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-900/30 font-bold shadow-xs';
      case 'completed':
        return 'bg-emerald-100/90 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/30 font-bold shadow-xs';
      case 'declined':
        return 'bg-rose-100/90 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 border border-rose-200 dark:border-rose-900/30 font-bold shadow-xs';
      default:
        return 'bg-blue-100/90 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-900/30 font-bold shadow-xs';
    }
  };

  return (
    <div className="w-full flex overflow-x-auto scrollbar-none gap-2 py-2 select-none">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-display font-medium tracking-wide transition-all duration-250 cursor-pointer whitespace-nowrap border ${getTabPastelClass(tab.id, isActive)}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// 5. StatusChip Widget
interface StatusChipProps {
  status: 'pending' | 'attending' | 'declined' | 'completed';
  labels?: Record<string, string>;
}

export function StatusChip({ status, labels }: StatusChipProps) {
  const defaultLabels = {
    pending: 'Chưa xem',
    attending: 'Sẽ tham dự',
    declined: 'Không đi',
    completed: 'Đã đi mừng'
  };

  const currentLabel = labels ? labels[status] : defaultLabels[status];

  const styles = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
    attending: 'bg-blue-100 text-blue-800 border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30',
    declined: 'bg-slate-100 text-slate-700 border-slate-200/60 dark:bg-slate-850 dark:text-slate-400 dark:border-slate-800',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border tracking-wide uppercase ${styles[status]}`}>
      {currentLabel}
    </span>
  );
}

// 6. CardItem Widget
interface CardItemProps {
  key?: React.Key;
  index: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  dateStr: string;
  status: 'pending' | 'attending' | 'declined' | 'completed';
  onActionClick?: () => void;
  actionIcon?: React.ReactNode;
}

export function CardItem({ 
  index, 
  icon, 
  title, 
  description, 
  dateStr, 
  status, 
  onActionClick,
  actionIcon
}: CardItemProps) {
  const theme = getPastelTheme(index);

  return (
    <div className={`p-4.5 ${theme.bg} ${theme.border} border ${MATERIAL_THEME_CLASSES.card} ${MATERIAL_THEME_CLASSES.subtleShadow} flex justify-between items-center gap-3 transition-all duration-300 hover:scale-[1.015] hover:shadow-md cursor-pointer group`}>
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-11 h-11 ${theme.iconBg} rounded-2xl flex items-center justify-center shrink-0 text-slate-800 dark:text-white transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`text-sm font-display font-bold tracking-tight ${theme.text} truncate`}>
              {title}
            </h4>
            <StatusChip status={status} />
          </div>
          <p className={`text-xs ${theme.subtext} font-medium line-clamp-1`}>
            {description}
          </p>
          <div className="flex items-center gap-1 text-[10px] opacity-75 font-mono">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{dateStr}</span>
          </div>
        </div>
      </div>

      {onActionClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onActionClick();
          }}
          className={`p-2.5 rounded-xl bg-white/55 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 text-slate-700 dark:text-slate-300 active:scale-95 transition-all duration-200 cursor-pointer`}
        >
          {actionIcon || <ArrowRight className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

// 7. FloatingActionButton Widget
interface FloatingActionButtonProps {
  onAddClick: () => void;
  onCameraClick?: () => void;
  addLabel?: string;
}

export function FloatingActionButton({ onAddClick, onCameraClick, addLabel = 'Tạo mới' }: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-3.5 select-none animate-slideUp">
      {onCameraClick && (
        <button
          onClick={onCameraClick}
          className="w-10 h-10 bg-white hover:bg-slate-100 dark:bg-[#1E1E24] dark:hover:bg-white/5 text-[#111111] dark:text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-[#ECECEC] dark:border-[#222225]"
          title="Mở Camera quét thiệp"
        >
          <Camera className="w-4.5 h-4.5 text-[#666666] dark:text-slate-300" />
        </button>
      )}

      <button
        onClick={onAddClick}
        className="h-13 pl-4 pr-5 bg-[#111111] hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black rounded-full flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer font-display font-semibold text-xs tracking-wider uppercase"
      >
        <Plus className="w-5 h-5 stroke-[2.5px]" />
        <span>{addLabel}</span>
      </button>
    </div>
  );
}

// 8. BottomSpacing Widget
export function BottomSpacing() {
  return <div className="h-28 w-full block shrink-0" />;
}

// 9. Loading Skeleton Widget
export function LoadingSkeleton() {
  return (
    <div className="space-y-4 w-full animate-pulse">
      {[1, 2, 3].map((n) => (
        <div key={n} className="p-4.5 bg-slate-100/60 dark:bg-white/5 rounded-[24px] border border-transparent flex justify-between items-center gap-3">
          <div className="flex items-center gap-3.5 w-full">
            <div className="w-11 h-11 bg-slate-200 dark:bg-white/10 rounded-2xl shrink-0" />
            <div className="space-y-2 w-2/3">
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded-md w-1/2" />
              <div className="h-3 bg-slate-200 dark:bg-white/10 rounded-md w-5/6" />
              <div className="h-2.5 bg-slate-200 dark:bg-white/10 rounded-md w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 10. Empty State Widget
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onActionClick?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onActionClick }: EmptyStateProps) {
  return (
    <div className="p-10 bg-slate-100/40 dark:bg-white/2 rounded-[24px] border border-dashed border-[#ECECEC] dark:border-[#222225] text-center max-w-sm mx-auto my-6 select-none">
      {icon && <div className="text-slate-350 dark:text-slate-600 flex justify-center mb-3">{icon}</div>}
      <h3 className="text-sm font-display font-bold text-[#111111] dark:text-white mb-1.5">{title}</h3>
      <p className="text-xs text-[#666666] dark:text-slate-400 font-sans leading-relaxed">{description}</p>
      {actionLabel && onActionClick && (
        <button
          onClick={onActionClick}
          className="mt-4 px-5 py-2.5 bg-[#111111] dark:bg-white text-white dark:text-black rounded-full text-xs font-display font-semibold hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// 11. Error State Widget
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Đã có lỗi xảy ra. Vui lòng thử lại.', onRetry }: ErrorStateProps) {
  return (
    <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-[24px] text-center select-none">
      <AlertTriangle className="w-9 h-9 text-red-500 mx-auto mb-2" />
      <p className="text-xs text-red-700 dark:text-red-450 font-sans font-medium mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-350 text-xs font-display font-bold rounded-full transition-all cursor-pointer"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}

// 12. Dialog Widget
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, children, footer }: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-[#1E1E24] rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-[#ECECEC] dark:border-[#222225] z-10 animate-scaleUp overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-display font-bold text-[#111111] dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-[#111111] dark:hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-sm text-slate-600 dark:text-slate-300 font-sans mb-5">
          {children}
        </div>

        {footer && (
          <div className="flex justify-end gap-2 pt-2 border-t border-[#ECECEC] dark:border-[#222225]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// 13. Bottom Sheet Widget
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-[#1E1E24] rounded-t-[28px] w-full max-w-lg p-6 shadow-2xl border-t border-[#ECECEC] dark:border-[#222225] z-10 animate-slideUp overflow-y-auto max-h-[85vh]">
        {/* Handle bar */}
        <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4" onClick={onClose} />
        
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-display font-bold text-[#111111] dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-[#111111] dark:hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// 14. SnackBar Widget
interface SnackBarProps {
  message: string;
  type?: 'success' | 'info' | 'warning';
  onClose: () => void;
}

export function SnackBar({ message, type = 'success', onClose }: SnackBarProps) {
  const bgStyles = {
    success: 'bg-[#1D5C00] text-white',
    info: 'bg-[#004B87] text-white',
    warning: 'bg-[#7A5E0A] text-white'
  };

  const icons = {
    success: <CheckCircle className="w-4.5 h-4.5" />,
    info: <Info className="w-4.5 h-4.5" />,
    warning: <AlertTriangle className="w-4.5 h-4.5" />
  };

  return (
    <div className={`fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-sm z-50 p-4 rounded-[20px] shadow-xl ${bgStyles[type]} flex items-center justify-between gap-3 animate-slideIn select-none`}>
      <div className="flex items-center gap-2.5">
        {icons[type]}
        <span className="text-xs font-sans font-medium">{message}</span>
      </div>
      <button 
        onClick={onClose}
        className="p-1 text-white/70 hover:text-white transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
