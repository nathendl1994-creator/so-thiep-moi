/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Gift,
  HeartHandshake
} from 'lucide-react';
import { AppData, formatVND, EVENT_TYPE_LABELS, formatDateVN } from '../dataStore';
import { Invitation } from '../types';
import { getPastelTheme, MATERIAL_THEME_CLASSES } from '../theme/materialTheme';
import { CardItem } from './M3Widgets';

interface DashboardViewProps {
  data: AppData;
  onNavigate: (tab: 'dashboard' | 'invitations' | 'calendar' | 'transactions' | 'statistics' | 'settings') => void;
  onQuickAddInvitation: (eventType?: string) => void;
  onViewInvitation: (inv: Invitation) => void;
}

export default function DashboardView({ 
  data, 
  onNavigate, 
  onQuickAddInvitation,
  onViewInvitation
}: DashboardViewProps) {
  const { invitations, transactions, familyMembers, settings } = data;

  // 1. Calculate financial statistics
  const totalGiven = transactions
    .filter(t => t.transactionType === 'given')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReceived = transactions
    .filter(t => t.transactionType === 'received')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalReceived - totalGiven;

  // 2. Identify upcoming invitations
  const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const upcomingInvitations = invitations
    .filter(inv => inv.status !== 'completed' && inv.eventDate >= todayStr)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate));

  // 3. Filter invitations happening in the next 7 days
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  const sevenDaysLaterStr = sevenDaysLater.toISOString().split('T')[0];

  const next7DaysInvitations = upcomingInvitations.filter(
    inv => inv.eventDate >= todayStr && inv.eventDate <= sevenDaysLaterStr
  );

  // 4. Identify nearest event
  const nearestEvent = upcomingInvitations[0] || null;

  // 5. Total counts
  const pendingCount = invitations.filter(inv => inv.status === 'pending').length;

  // Pastel themes for layout cards
  const welcomeTheme = getPastelTheme(4); // Soft Corn/Gold
  const balanceTheme = getPastelTheme(2); // Soft Blue
  const receivedTheme = getPastelTheme(3); // Soft Green
  const givenTheme = getPastelTheme(5); // Soft Rose

  return (
    <div id="dashboard-view" className="space-y-6 pb-24 select-none px-1 animate-fadeIn">
      {/* App Header Welcome with custom M3 pastel styling */}
      <div className={`flex justify-between items-center p-6 ${welcomeTheme.bg} ${welcomeTheme.border} border ${MATERIAL_THEME_CLASSES.card} ${MATERIAL_THEME_CLASSES.subtleShadow}`}>
        <div>
          <h2 className={`text-xl font-display font-extrabold tracking-tight ${welcomeTheme.text} flex items-center gap-2`}>
            Chào gia đình! <span className="animate-bounce">👋</span>
          </h2>
          <p className={`text-xs ${welcomeTheme.subtext} font-medium mt-1`}>
            Quản lý ngày vui, sổ tiền mừng và kỷ niệm gia đình offline chu đáo.
          </p>
        </div>
        <button
          onClick={() => onQuickAddInvitation()}
          className="p-3 bg-[#111111] hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black rounded-full transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
          title="Thêm thiệp nhanh"
        >
          <Plus className="w-5 h-5 stroke-[2.5px]" />
        </button>
      </div>

      {/* Financial Bento Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Balance Card (Blue Pastel) */}
        <div className={`col-span-2 p-6 ${balanceTheme.bg} ${balanceTheme.border} border ${MATERIAL_THEME_CLASSES.card} ${MATERIAL_THEME_CLASSES.subtleShadow} flex flex-col justify-between min-h-[140px]`}>
          <div className="flex justify-between items-center mb-1">
            <span className={`text-xs font-mono font-bold ${balanceTheme.subtext} uppercase tracking-wider`}>Cán cân tiền mừng (Thu - Chi)</span>
            <span className={`text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full border tracking-wider ${
              netBalance >= 0 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400' 
                : 'bg-rose-100 text-rose-800 border-rose-200/50 dark:bg-rose-950/20 dark:text-rose-400'
            }`}>
              {netBalance >= 0 ? 'Dư tích lũy' : 'Thâm hụt'}
            </span>
          </div>
          <div className={`text-2xl font-display font-black tracking-tight ${netBalance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {netBalance >= 0 ? '+' : ''}{formatVND(netBalance)}
          </div>
          <p className={`text-[10px] ${balanceTheme.subtext} font-medium mt-2 font-sans`}>
            Dựa trên lịch sử đi mừng và các sự kiện gia đình đã tổ chức.
          </p>
        </div>

        {/* Received Card (Green Pastel) */}
        <div className={`p-5 ${receivedTheme.bg} ${receivedTheme.border} border ${MATERIAL_THEME_CLASSES.card} ${MATERIAL_THEME_CLASSES.subtleShadow}`}>
          <div className={`flex items-center gap-1.5 ${receivedTheme.subtext} text-[10px] font-mono font-bold mb-1 uppercase tracking-wider`}>
            <TrendingUp className="w-4 h-4 shrink-0" />
            Tổng Đã Nhận
          </div>
          <div className={`text-lg font-display font-black ${receivedTheme.text}`}>
            {formatVND(totalReceived)}
          </div>
        </div>

        {/* Given Card (Rose Pastel) */}
        <div className={`p-5 ${givenTheme.bg} ${givenTheme.border} border ${MATERIAL_THEME_CLASSES.card} ${MATERIAL_THEME_CLASSES.subtleShadow}`}>
          <div className={`flex items-center gap-1.5 ${givenTheme.subtext} text-[10px] font-mono font-bold mb-1 uppercase tracking-wider`}>
            <TrendingDown className="w-4 h-4 shrink-0" />
            Tổng Đã Đi
          </div>
          <div className={`text-lg font-display font-black ${givenTheme.text}`}>
            {formatVND(totalGiven)}
          </div>
        </div>
      </div>

      {/* Invitations Stats Pill Grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: 'invitations', label: 'Sắp diễn ra', count: upcomingInvitations.length, theme: getPastelTheme(1) },
          { id: 'invitations', label: 'Chưa xem', count: pendingCount, theme: getPastelTheme(4), isAlert: pendingCount > 0 },
          { id: 'calendar', label: 'Đã đi xong', count: invitations.filter(inv => inv.status === 'completed').length, theme: getPastelTheme(3) }
        ].map((item, index) => (
          <button 
            key={index}
            onClick={() => onNavigate(item.id as any)}
            className={`p-4 ${item.theme.bg} ${item.theme.border} border ${MATERIAL_THEME_CLASSES.card} ${MATERIAL_THEME_CLASSES.subtleShadow} cursor-pointer hover:scale-[1.03] transition-all duration-300 text-left group`}
          >
            <div className={`text-[9px] font-mono font-bold ${item.theme.subtext} uppercase tracking-wider`}>
              {item.label}
            </div>
            <div className={`text-xl font-display font-black mt-1 ${item.isAlert ? 'text-amber-600 dark:text-amber-400' : item.theme.text}`}>
              {item.count}
            </div>
          </button>
        ))}
      </div>

      {/* Nearest Event Card */}
      {nearestEvent ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-display font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-[#111111] dark:bg-white rounded-full"></span>
              Sự kiện sắp tới gần nhất
            </h3>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold uppercase tracking-widest animate-pulse">Sắp diễn ra</span>
          </div>

          <CardItem
            index={0}
            icon={<Gift className="w-5 h-5" />}
            title={nearestEvent.eventName}
            description={`${EVENT_TYPE_LABELS[nearestEvent.eventType]} • ${nearestEvent.location}`}
            dateStr={`${nearestEvent.eventTime} - ${formatDateVN(nearestEvent.eventDate)}`}
            status={nearestEvent.status}
            onActionClick={() => onViewInvitation(nearestEvent)}
          />
        </div>
      ) : (
        <div className={`p-8 ${getPastelTheme(4).bg} ${getPastelTheme(4).border} border ${MATERIAL_THEME_CLASSES.card} ${MATERIAL_THEME_CLASSES.subtleShadow} text-center`}>
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Chưa có thiệp mời sắp tới nào được lưu.</p>
          <button
            onClick={() => onQuickAddInvitation()}
            className="mt-3 text-xs px-5 py-2.5 bg-[#111111] hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black font-display font-semibold rounded-full transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm thiệp mời mới
          </button>
        </div>
      )}

      {/* 7-day Upcoming Reminders list using CardItem */}
      <div className="space-y-3">
        <h3 className="text-xs font-display font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-[#111111] dark:bg-white rounded-full"></span>
          Lịch sự kiện trong 7 ngày tới ({next7DaysInvitations.length})
        </h3>

        {next7DaysInvitations.length > 0 ? (
          <div className="space-y-3">
            {next7DaysInvitations.map((inv, idx) => {
              return (
                <CardItem
                  key={inv.id}
                  index={idx + 1}
                  icon={<Gift className="w-5 h-5" />}
                  title={inv.eventName}
                  description={`${EVENT_TYPE_LABELS[inv.eventType]} • Mức dự kiến: ${formatVND(inv.expectedAmount)}`}
                  dateStr={`${inv.eventTime} - ${formatDateVN(inv.eventDate)}`}
                  status={inv.status}
                  onActionClick={() => onViewInvitation(inv)}
                />
              );
            })}
          </div>
        ) : (
          <div className={`p-6 ${getPastelTheme(1).bg} ${getPastelTheme(1).border} border ${MATERIAL_THEME_CLASSES.card} ${MATERIAL_THEME_CLASSES.subtleShadow} text-center text-xs ${getPastelTheme(1).subtext} font-sans font-medium`}>
            Không có đám hoặc sự kiện gì diễn ra trong tuần tới. Thảnh thơi rồi!
          </div>
        )}
      </div>

      {/* Quick Category Action Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-display font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-[#111111] dark:bg-white rounded-full"></span>
          Tạo nhanh thiệp mời theo loại
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { type: 'wedding', label: 'Đám cưới', color: 'text-rose-500 dark:text-rose-450', theme: getPastelTheme(5) },
            { type: 'housewarming', label: 'Tân gia', color: 'text-amber-500 dark:text-amber-450', theme: getPastelTheme(0) },
            { type: 'birthday', label: 'Sinh nhật', color: 'text-blue-500 dark:text-blue-450', theme: getPastelTheme(2) }
          ].map((item, index) => (
            <button
              key={item.type}
              onClick={() => onQuickAddInvitation(item.type)}
              className={`p-4 ${item.theme.bg} ${item.theme.border} border ${MATERIAL_THEME_CLASSES.card} ${MATERIAL_THEME_CLASSES.subtleShadow} font-display font-bold text-xs flex flex-col items-center justify-center gap-2.5 hover:scale-[1.04] active:scale-95 transition-all duration-300 cursor-pointer group`}
            >
              <HeartHandshake className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform duration-300`} />
              <span className={item.theme.text}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
