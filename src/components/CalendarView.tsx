/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock, 
  User, 
  DollarSign, 
  CheckCircle, 
  Info,
  List as ListIcon
} from 'lucide-react';
import { AppData, formatVND, formatDateVN, EVENT_TYPE_LABELS, STATUS_LABELS } from '../dataStore';
import { Invitation } from '../types';
import { CardItem, TabBar } from './M3Widgets';
import { getPastelTheme, MATERIAL_THEME_CLASSES } from '../theme/materialTheme';

interface CalendarViewProps {
  data: AppData;
  onViewInvitation: (inv: Invitation) => void;
}

export default function CalendarView({ data, onViewInvitation }: CalendarViewProps) {
  const { invitations, contacts } = data;

  // View States
  const [calendarMode, setCalendarMode] = useState<'month' | 'week' | 'list'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);

  // Handle Month Navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Helper: Get list of events on a specific YYYY-MM-DD date string
  const getEventsOnDate = (dateStr: string): Invitation[] => {
    return invitations.filter(inv => inv.eventDate === dateStr);
  };

  // 1. MONTH MODE CELLS GENERATION
  const generateMonthCells = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Day of week index for first day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
    // Convert to Vietnamese style where Monday is starting or keep standard
    let startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
    // Adjust so Mon=0, Tue=1, ..., Sun=6
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const totalDays = lastDayOfMonth.getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const cells: { date: Date; dateStr: string; isCurrentMonth: boolean; isToday: boolean }[] = [];

    // Prior Month Overlapping Days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      cells.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: isSameDay(d, new Date())
      });
    }

    // Current Month Days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      cells.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        isCurrentMonth: true,
        isToday: isSameDay(d, new Date())
      });
    }

    // Next Month Overlapping Days
    const remaining = 42 - cells.length; // Keep grid strictly 6 rows (42 cells)
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      cells.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: isSameDay(d, new Date())
      });
    }

    return cells;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // SELECTED DAY DETAILS
  const selectedDayEvents = getEventsOnDate(selectedDateStr);

  // flat list of upcoming events sorted by date
  const allUpcomingEvents = [...invitations]
    .filter(inv => inv.status !== 'completed')
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate));

  return (
    <div className="space-y-4 pb-20 select-none px-1 animate-fadeIn">
      {/* Calendar Header with Mode Toggles */}
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Lịch Sự Kiện</h2>
          
          <TabBar
            tabs={[
              { id: 'month', label: 'Lịch Tháng' },
              { id: 'list', label: 'Tất cả' }
            ]}
            activeTab={calendarMode}
            onTabChange={(id) => setCalendarMode(id as any)}
          />
        </div>

        {calendarMode === 'month' && (
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Tháng {currentDate.getMonth() + 1} / {currentDate.getFullYear()}
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-[10px] bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold rounded-md transition-all cursor-pointer"
              >
                Hôm nay
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MONTH GRID RENDER */}
      {calendarMode === 'month' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-850">
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
            <span className="text-rose-500">CN</span>
          </div>

          {/* Month Day Cells */}
          <div className="grid grid-cols-7 gap-y-3 gap-x-1">
            {generateMonthCells().map((cell, idx) => {
              const dayEvents = getEventsOnDate(cell.dateStr);
              const isSelected = selectedDateStr === cell.dateStr;
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`aspect-square rounded-full flex flex-col items-center justify-center relative cursor-pointer text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900 scale-110 shadow-sm'
                      : cell.isToday
                      ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                      : cell.isCurrentMonth
                      ? 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                      : 'text-slate-300 dark:text-slate-650'
                  }`}
                >
                  <span>{cell.date.getDate()}</span>
                  
                  {/* Event Indicator Dots */}
                  {hasEvents && (
                    <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                      isSelected 
                        ? 'bg-rose-400' 
                        : 'bg-rose-500'
                    }`}></span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {calendarMode === 'month' && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
            Sự kiện ngày {selectedDateStr.split('-').reverse().join('/')} ({selectedDayEvents.length})
          </h3>

          {selectedDayEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedDayEvents.map((inv, index) => {
                const contact = contacts.find(c => c.id === inv.contactId);
                return (
                  <CardItem
                    key={inv.id}
                    index={index}
                    icon={<CalendarIcon className="w-5 h-5 animate-pulse" />}
                    title={inv.eventName}
                    description={`${EVENT_TYPE_LABELS[inv.eventType]} • ${inv.location} • Mức mừng: ${formatVND(inv.expectedAmount)}`}
                    dateStr={`${inv.eventTime} - ${formatDateVN(inv.eventDate)}`}
                    status={inv.status}
                    onActionClick={() => onViewInvitation(inv)}
                  />
                );
              })}
            </div>
          ) : (
            <div className={`p-6 text-center ${getPastelTheme(1).bg} ${getPastelTheme(1).border} border ${MATERIAL_THEME_CLASSES.card} ${MATERIAL_THEME_CLASSES.subtleShadow} text-xs text-slate-400 font-medium`}>
              Không có thiệp mời hoặc sự kiện nào trong ngày này.
            </div>
          )}
        </div>
      )}

      {/* FLAT EVENT TIMELINE LIST MODE */}
      {calendarMode === 'list' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Danh sách sự kiện sắp diễn ra ({allUpcomingEvents.length})
            </h3>
          </div>

          {allUpcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {allUpcomingEvents.map((inv, index) => {
                const contact = contacts.find(c => c.id === inv.contactId);
                return (
                  <CardItem
                    key={inv.id}
                    index={index}
                    icon={<CalendarIcon className="w-5 h-5 animate-bounce" />}
                    title={inv.eventName}
                    description={`${EVENT_TYPE_LABELS[inv.eventType]} • ${inv.location} • Thờig gian: ${inv.eventTime}`}
                    dateStr={formatDateVN(inv.eventDate)}
                    status={inv.status}
                    onActionClick={() => onViewInvitation(inv)}
                  />
                );
              })}
            </div>
          ) : (
            <div className={`p-12 text-center ${getPastelTheme(4).bg} ${getPastelTheme(4).border} border ${MATERIAL_THEME_CLASSES.card} ${MATERIAL_THEME_CLASSES.subtleShadow}`}>
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium">Không có sự kiện sắp tới nào.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
