/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Mail, 
  Calendar, 
  BookOpen, 
  BarChart3, 
  Settings as SettingsIcon, 
  Plus, 
  Bell, 
  Info, 
  Check, 
  Sparkles,
  AlertTriangle,
  Clock,
  X
} from 'lucide-react';
import { loadAppData, saveAppData, AppData, formatVND } from './dataStore';
import { Invitation } from './types';
import DashboardView from './components/DashboardView';
import InvitationsView from './components/InvitationsView';
import MoneyTransactionsView from './components/MoneyTransactionsView';
import CalendarView from './components/CalendarView';
import StatisticsView from './components/StatisticsView';
import SettingsView from './components/SettingsView';
import PinLockScreen from './components/PinLockScreen';
import { motion, AnimatePresence } from 'motion/react';

const tabPastelStyles: Record<string, {
  activeLightBg: string;
  activeDarkBg: string;
  activeLightText: string;
  activeDarkText: string;
  activeIcon: string;
  activeBorderLight: string;
  activeBorderDark: string;
}> = {
  dashboard: {
    activeLightBg: 'bg-amber-100/90',
    activeDarkBg: 'dark:bg-amber-950/45',
    activeLightText: 'text-amber-900',
    activeDarkText: 'dark:text-amber-300',
    activeIcon: 'text-amber-600 dark:text-amber-400',
    activeBorderLight: 'border-amber-200/80',
    activeBorderDark: 'dark:border-amber-800/40'
  },
  invitations: {
    activeLightBg: 'bg-rose-100/90',
    activeDarkBg: 'dark:bg-rose-950/45',
    activeLightText: 'text-rose-900',
    activeDarkText: 'dark:text-rose-300',
    activeIcon: 'text-rose-600 dark:text-rose-400',
    activeBorderLight: 'border-rose-200/80',
    activeBorderDark: 'dark:border-rose-800/40'
  },
  calendar: {
    activeLightBg: 'bg-purple-100/90',
    activeDarkBg: 'dark:bg-purple-950/45',
    activeLightText: 'text-purple-900',
    activeDarkText: 'dark:text-purple-300',
    activeIcon: 'text-purple-600 dark:text-purple-400',
    activeBorderLight: 'border-purple-200/80',
    activeBorderDark: 'dark:border-purple-800/40'
  },
  transactions: {
    activeLightBg: 'bg-emerald-100/90',
    activeDarkBg: 'dark:bg-emerald-950/45',
    activeLightText: 'text-emerald-900',
    activeDarkText: 'dark:text-emerald-300',
    activeIcon: 'text-emerald-600 dark:text-emerald-400',
    activeBorderLight: 'border-emerald-200/80',
    activeBorderDark: 'dark:border-emerald-800/40'
  },
  statistics: {
    activeLightBg: 'bg-blue-100/90',
    activeDarkBg: 'dark:bg-blue-950/45',
    activeLightText: 'text-blue-900',
    activeDarkText: 'dark:text-blue-300',
    activeIcon: 'text-blue-600 dark:text-blue-400',
    activeBorderLight: 'border-blue-200/80',
    activeBorderDark: 'dark:border-blue-800/40'
  },
  settings: {
    activeLightBg: 'bg-teal-100/90',
    activeDarkBg: 'dark:bg-teal-950/45',
    activeLightText: 'text-teal-900',
    activeDarkText: 'dark:text-teal-300',
    activeIcon: 'text-teal-600 dark:text-teal-400',
    activeBorderLight: 'border-teal-200/80',
    activeBorderDark: 'dark:border-teal-800/40'
  }
};

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invitations' | 'calendar' | 'transactions' | 'statistics' | 'settings'>('dashboard');
  
  // Security
  const [isLocked, setIsLocked] = useState(false);
  
  // Navigation assistance
  const [quickAddType, setQuickAddType] = useState<string | undefined>(undefined);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);

  // Notifications state
  const [activeNotification, setActiveNotification] = useState<{
    id: string;
    title: string;
    body: string;
    type: 'alert' | 'info' | 'success';
  } | null>(null);

  // Load state on startup
  useEffect(() => {
    const appData = loadAppData();
    setData(appData);

    // Apply stored theme or system preference
    const theme = appData.settings.theme || 'system';
    const applyTheme = (themeValue: 'light' | 'dark' | 'system') => {
      if (themeValue === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (themeValue === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDarkSystem) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    applyTheme(theme);

    // Set lock screen if PIN is enabled
    if (appData.settings.isPinEnabled && appData.settings.pinCode) {
      setIsLocked(true);
    }

    // Dynamic smart notification alarm checking
    triggerLocalAlarmNotifications(appData);

    // Watch for system theme preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const currentTheme = loadAppData().settings.theme || 'system';
      if (currentTheme === 'system') {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // Sync state helpers
  const handleDataChange = (newData: AppData) => {
    setData(newData);
  };

  const handleToggleTheme = (theme: 'light' | 'dark' | 'system') => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDarkSystem) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  // Local alarms & prompt reminders
  const triggerLocalAlarmNotifications = (appData: AppData) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // 1. Check if any wedding/event is happening tomorrow
    const tomorrowEvents = appData.invitations.filter(
      inv => inv.eventDate === tomorrowStr && inv.status !== 'completed'
    );

    if (tomorrowEvents.length > 0) {
      const first = tomorrowEvents[0];
      setActiveNotification({
        id: `noti_tomorrow_${Date.now()}`,
        title: '🔔 Sắp diễn ra sự kiện ngày mai!',
        body: `Ngày mai bạn có "${first.eventName}" lúc ${first.eventTime} tại ${first.location}. Hãy chuẩn bị phong bì hoặc đi rút tiền mặt! Mức dự kiến: ${formatVND(first.expectedAmount)}.`,
        type: 'alert'
      });
      return;
    }

    // 2. Check if any wedding/event is happening today
    const todayEvents = appData.invitations.filter(
      inv => inv.eventDate === todayStr && inv.status !== 'completed'
    );

    if (todayEvents.length > 0) {
      const first = todayEvents[0];
      setActiveNotification({
        id: `noti_today_${Date.now()}`,
        title: '🌟 Sự kiện ngày hôm nay!',
        body: `Hôm nay diễn ra đám "${first.eventName}" lúc ${first.eventTime}. Địa điểm: ${first.location}. Chúc bạn có chuyến đi vui vẻ!`,
        type: 'success'
      });
      return;
    }

    // 3. Warning for outstanding givers
    const givenTx = appData.transactions.filter(t => t.transactionType === 'given');
    const receivedTx = appData.transactions.filter(t => t.transactionType === 'received');
    const unreciprocatedCount = receivedTx.filter(rx => !givenTx.some(gx => gx.contactId === rx.contactId)).length;

    if (unreciprocatedCount > 3) {
      setActiveNotification({
        id: `noti_unreciprocated_${Date.now()}`,
        title: '💡 Gợi ý đối chiếu xã giao',
        body: `Bạn đang có ${unreciprocatedCount} người từng đi mừng lễ gia đình bạn nhưng chưa có dịp đi mừng lại. Hãy vào mục "Thống kê" để kiểm tra sổ sách tránh bỏ lỡ!`,
        type: 'info'
      });
    }
  };

  // Quick navigate & action triggers
  const handleQuickAddInvitation = (eventType?: string) => {
    setQuickAddType(eventType || 'wedding');
    setActiveTab('invitations');
  };

  const handleViewInvitation = (inv: Invitation) => {
    setSelectedInvitation(inv);
    setActiveTab('invitations');
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500 text-sm">
        Đang khởi động Sổ Thiệp Mời...
      </div>
    );
  }

  // Under Locked Screen state
  if (isLocked) {
    return (
      <PinLockScreen
        correctPin={data.settings.pinCode || ''}
        onSuccess={() => setIsLocked(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-black dark:text-slate-100 font-sans transition-colors duration-200 relative overflow-x-hidden">
      {/* Premium Apple Liquid Glass backdrop mesh */}
      <div className="apple-liquid-bg">
        <div className="ambient-blob ambient-blob-1" />
        <div className="ambient-blob ambient-blob-2" />
        <div className="ambient-blob ambient-blob-3" />
      </div>

      {/* Dynamic Alarm Toast Notification Overlay */}
      {activeNotification && (
        <div className="fixed top-4 left-4 right-4 z-40 glass-modal p-4 rounded-2xl shadow-2xl flex gap-3 animate-slideIn max-w-sm mx-auto">
          <div className="p-1 bg-amber-500/10 text-amber-500 rounded-lg shrink-0 h-fit">
            <Bell className="w-5 h-5 animate-swing" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black text-black dark:text-slate-200">{activeNotification.title}</h4>
            <p className="text-[11px] text-slate-900 dark:text-slate-400 mt-1 leading-relaxed">{activeNotification.body}</p>
          </div>
          <button 
            onClick={() => setActiveNotification(null)}
            className="p-1 text-slate-500 hover:text-black dark:hover:text-slate-200 rounded-lg h-fit"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Responsive Grid Layout */}
      <div className="flex flex-row w-full min-h-screen md:h-screen md:overflow-hidden bg-transparent text-black dark:text-white">
        
        {/* Sidebar Navigation - Tablet/Desktop only */}
        <aside className="hidden md:flex w-64 glass-panel border-r border-slate-200/50 dark:border-white/5 flex-col shrink-0">
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center font-display font-extrabold shadow-sm">S</div>
              <div>
                <h1 className="text-base font-display font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Sổ Thiệp Mời</h1>
                <p className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider -mt-1">Văn hóa gia đình</p>
              </div>
            </div>
            
            <nav className="space-y-1.5 flex-1">
              {[
                { id: 'dashboard', label: 'Tổng quan', icon: Home },
                { id: 'invitations', label: 'Thiệp mời', icon: Mail, badge: data.invitations.filter(i => i.status === 'pending').length },
                { id: 'calendar', label: 'Lịch sự kiện', icon: Calendar },
                { id: 'transactions', label: 'Sổ tiền mừng', icon: BookOpen },
                { id: 'statistics', label: 'Thống kê', icon: BarChart3 },
                { id: 'settings', label: 'Cài đặt', icon: SettingsIcon }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const style = tabPastelStyles[tab.id] || tabPastelStyles.dashboard;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-display font-bold tracking-wide rounded-full transition-all duration-300 cursor-pointer relative ${
                      isActive
                        ? `${style.activeLightText} ${style.activeDarkText} font-extrabold`
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebarTab"
                        className={`absolute inset-0 border shadow-xs -z-10 rounded-full ${style.activeLightBg} ${style.activeDarkBg} ${style.activeBorderLight} ${style.activeBorderDark}`}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? style.activeIcon : 'opacity-75'}`} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge && tab.badge > 0 ? (
                      <span className="px-1.5 py-0.5 text-[8px] font-black bg-rose-500 text-white rounded-full z-10">
                        {tab.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>

            {/* Profile widget at bottom of sidebar */}
            <div className="mt-auto pt-4 border-t border-slate-200/50 dark:border-white/5">
              <div className="flex items-center gap-3 p-2.5 rounded-2xl glass-card">
                <div className={`w-8 h-8 rounded-full ${
                  (data.familyMembers.find(fm => fm.id === data.settings.selectedFamilyMemberId) || data.familyMembers[0] || { avatarColor: 'bg-rose-500' }).avatarColor
                } text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                  {(data.familyMembers.find(fm => fm.id === data.settings.selectedFamilyMemberId) || data.familyMembers[0] || { name: 'G' }).name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate font-display">
                    {(data.familyMembers.find(fm => fm.id === data.settings.selectedFamilyMemberId) || data.familyMembers[0] || { name: 'Gia đình Minh' }).name}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">
                    {data.settings.familyModeEnabled ? 'Quỹ gia đình' : 'Cá nhân'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen md:h-screen md:overflow-hidden relative bg-transparent">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <header className="md:hidden px-5 py-4 glass-panel sticky top-0 z-20 flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-sm">
                <Sparkles className="w-4.5 h-4.5 text-amber-500" />
              </div>
              <div>
                <h1 className="text-sm font-display font-black text-slate-900 dark:text-slate-50 uppercase tracking-wider">Sổ Thiệp Mời</h1>
                <span className="text-[9px] text-slate-450 block -mt-0.5 font-bold">GIA ĐÌNH VIỆT offline</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {data.settings.isPinEnabled && (
                <span className="p-1.5 bg-white/40 dark:bg-black/20 text-rose-500 rounded-lg text-xs font-bold flex items-center gap-0.5 border border-slate-200/50 dark:border-white/5">
                  🔒 PIN ON
                </span>
              )}
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" title="Dữ liệu lưu an toàn ngoại tuyến"></span>
            </div>
          </header>

          {/* Desktop Header Bar */}
          <header className="hidden md:flex h-16 glass-panel border-b border-slate-200/50 dark:border-white/5 items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">Trang quản lý</span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-sm text-slate-800 dark:text-slate-100 font-display font-extrabold tracking-tight">
                {activeTab === 'dashboard' ? 'Tổng quan' : activeTab === 'invitations' ? 'Danh sách thiệp mời' : activeTab === 'calendar' ? 'Lịch sự kiện' : activeTab === 'transactions' ? 'Sổ tiền mừng' : activeTab === 'statistics' ? 'Báo cáo thống kê' : 'Cấu hình ứng dụng'}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {data.settings.isPinEnabled && (
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-450 rounded-lg text-[9px] font-mono border border-amber-500/20">
                  🔒 BẢO MẬT ĐANG BẬT
                </span>
              )}

              <button
                onClick={() => handleQuickAddInvitation()}
                className="bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black px-5 py-2 rounded-full text-xs font-display font-bold shadow-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                + Thêm thiệp mời
              </button>
            </div>
          </header>

          {/* Dynamic Scrollable Body Area */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto pb-24 md:pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="w-full"
              >
                {activeTab === 'dashboard' && (
                  <DashboardView 
                    data={data} 
                    onNavigate={setActiveTab} 
                    onQuickAddInvitation={handleQuickAddInvitation}
                    onViewInvitation={handleViewInvitation}
                  />
                )}

                {activeTab === 'invitations' && (
                  <InvitationsView 
                    data={data} 
                    onDataChange={handleDataChange}
                    quickAddType={quickAddType}
                    onClearQuickAddType={() => setQuickAddType(undefined)}
                    selectedInvitation={selectedInvitation}
                    onClearSelectedInvitation={() => setSelectedInvitation(null)}
                  />
                )}

                {activeTab === 'calendar' && (
                  <CalendarView 
                    data={data}
                    onViewInvitation={handleViewInvitation}
                  />
                )}

                {activeTab === 'transactions' && (
                  <MoneyTransactionsView 
                    data={data} 
                    onDataChange={handleDataChange}
                  />
                )}

                {activeTab === 'statistics' && (
                  <StatisticsView 
                    data={data} 
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsView 
                    data={data} 
                    onDataChange={handleDataChange}
                    onToggleTheme={handleToggleTheme}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Mobile Floating Action button */}
          {activeTab !== 'invitations' && (
            <button
              onClick={() => handleQuickAddInvitation()}
              className="md:hidden fixed bottom-24 right-6 z-30 w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer animate-bounce"
              title="Thêm thiệp mới"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}

          {/* Mobile Bottom Navigation Bar (Hidden on Desktop) */}
          <nav className="md:hidden fixed bottom-4 left-4 right-4 z-30 glass-panel rounded-full px-2 py-1.5 flex justify-between items-center text-slate-400 border border-white/20 shadow-lg">
            {[
              { id: 'dashboard', label: 'Tổng quan', icon: Home },
              { id: 'invitations', label: 'Thiệp mời', icon: Mail },
              { id: 'calendar', label: 'Lịch', icon: Calendar },
              { id: 'transactions', label: 'Sổ tiền', icon: BookOpen },
              { id: 'statistics', label: 'Thống kê', icon: BarChart3 },
              { id: 'settings', label: 'Cài đặt', icon: SettingsIcon }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const style = tabPastelStyles[tab.id] || tabPastelStyles.dashboard;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex-1 py-2 rounded-full flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 relative ${
                    isActive 
                      ? `${style.activeLightText} ${style.activeDarkText} font-display font-extrabold scale-105` 
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeMobileTab"
                      className={`absolute inset-0 rounded-full border border-transparent/10 ${style.activeLightBg} ${style.activeDarkBg}`}
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}
                  <Icon className={`w-4 h-4 z-10 ${isActive ? `${style.activeIcon} stroke-[2.5px]` : 'stroke-[1.8px]'}`} />
                  <span className="text-[8px] uppercase tracking-wider font-display z-10">{tab.label}</span>
                </button>
              );
            })}
          </nav>

        </div>
      </div>
    </div>
  );
}
