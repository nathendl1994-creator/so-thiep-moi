/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieIcon, 
  BarChart2, 
  Award, 
  AlertTriangle, 
  Calendar,
  Users,
  Award as CrownIcon,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { AppData, formatVND, EVENT_TYPE_LABELS, RELATIONSHIP_LABELS } from '../dataStore';
import { EventType, RelationshipType, MoneyTransaction } from '../types';

interface StatisticsViewProps {
  data: AppData;
}

export default function StatisticsView({ data }: StatisticsViewProps) {
  const { transactions, contacts, invitations } = data;
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // 1. Core aggregates
  const givenTx = transactions.filter(t => t.transactionType === 'given');
  const receivedTx = transactions.filter(t => t.transactionType === 'received');

  const totalGiven = givenTx.reduce((sum, t) => sum + t.amount, 0);
  const totalReceived = receivedTx.reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalReceived - totalGiven;

  const totalEventsAttended = invitations.filter(inv => inv.status === 'completed').length;
  const totalPendingInvitations = invitations.filter(inv => inv.status === 'pending').length;

  // 2. Monthly Stats for a selected year
  const monthlyData = React.useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      name: `T${i + 1}`,
      given: 0,
      received: 0
    }));

    transactions.forEach(t => {
      const date = new Date(t.transactionDate);
      if (date.getFullYear() === selectedYear) {
        const monthIdx = date.getMonth();
        if (t.transactionType === 'given') {
          months[monthIdx].given += t.amount;
        } else {
          months[monthIdx].received += t.amount;
        }
      }
    });

    return months;
  }, [transactions, selectedYear]);

  // Find max value for scaling monthly charts
  const maxMonthlyValue = Math.max(
    ...monthlyData.map(m => Math.max(m.given, m.received)),
    1000000 // default minimum scale to prevent division by zero
  );

  // 3. Stats by Event Type (Spending / Given)
  const statsByEventType = React.useMemo(() => {
    const map: Record<EventType, number> = {
      wedding: 0,
      engagement: 0,
      birthday: 0,
      baby_shower: 0,
      housewarming: 0,
      memorial: 0,
      other: 0
    };

    givenTx.forEach(t => {
      // Find matching invitation to find eventType, or guess from notes
      let type: EventType = 'other';
      if (t.invitationId) {
        const inv = invitations.find(i => i.id === t.invitationId);
        if (inv) type = inv.eventType;
      } else {
        // Guess from notes
        const note = t.note.toLowerCase();
        if (note.includes('cưới') || note.includes('hỷ')) type = 'wedding';
        else if (note.includes('hỏi')) type = 'engagement';
        else if (note.includes('sinh nhật')) type = 'birthday';
        else if (note.includes('đầy tháng') || note.includes('thôi nôi')) type = 'baby_shower';
        else if (note.includes('gia') || note.includes('nhà mới')) type = 'housewarming';
        else if (note.includes('giỗ')) type = 'memorial';
      }
      map[type] += t.amount;
    });

    return Object.entries(map)
      .map(([key, val]) => ({
        type: key as EventType,
        label: EVENT_TYPE_LABELS[key as EventType],
        amount: val,
        percentage: totalGiven > 0 ? (val / totalGiven) * 100 : 0
      }))
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [givenTx, invitations, totalGiven]);

  // 4. Stats by Relationship (Spending / Given)
  const statsByRelationship = React.useMemo(() => {
    const map: Record<RelationshipType, number> = {
      family: 0,
      friend: 0,
      colleague: 0,
      neighbor: 0,
      partner: 0,
      other: 0
    };

    givenTx.forEach(t => {
      const contact = contacts.find(c => c.id === t.contactId);
      const rel = contact?.relationship || 'other';
      map[rel] += t.amount;
    });

    return Object.entries(map)
      .map(([key, val]) => ({
        relationship: key as RelationshipType,
        label: RELATIONSHIP_LABELS[key as RelationshipType],
        amount: val,
        percentage: totalGiven > 0 ? (val / totalGiven) * 100 : 0
      }))
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [givenTx, contacts, totalGiven]);

  // 5. Top Givers (Nhận tiền mừng nhiều nhất)
  const topGivers = React.useMemo(() => {
    const map: Record<string, { name: string; amount: number; count: number; relation: string }> = {};

    receivedTx.forEach(t => {
      const contact = contacts.find(c => c.id === t.contactId);
      const name = contact?.fullName || 'Không rõ';
      const relation = contact ? RELATIONSHIP_LABELS[contact.relationship] : 'Khác';

      if (!map[t.contactId]) {
        map[t.contactId] = { name, amount: 0, count: 0, relation };
      }
      map[t.contactId].amount += t.amount;
      map[t.contactId].count += 1;
    });

    return Object.values(map)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Top 5
  }, [receivedTx, contacts]);

  // 6. Outstanding Returns (Từng mừng mình nhưng mình chưa mừng lại)
  const outstandingGifts = React.useMemo(() => {
    const warnings: { name: string; amount: number; event: string; date: string }[] = [];

    receivedTx.forEach(rx => {
      const contact = contacts.find(c => c.id === rx.contactId);
      if (contact) {
        // Xem mình có giao dịch đi mừng cho người này chưa
        const hasGiven = givenTx.find(gx => gx.contactId === rx.contactId);
        if (!hasGiven) {
          warnings.push({
            name: contact.fullName,
            amount: rx.amount,
            event: rx.note.split(' (Sự kiện: ')[1]?.replace(')', '') || 'Sự kiện gia đình',
            date: rx.transactionDate
          });
        }
      }
    });

    return warnings;
  }, [receivedTx, givenTx, contacts]);

  return (
    <div className="space-y-6 pb-20 select-none">
      <div className="flex justify-between items-center bg-slate-50/20 dark:bg-slate-950/20 backdrop-blur-xs sticky top-0 py-3 z-10">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Báo Cáo Thống Kê</h2>
        
        {/* Year Selector */}
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="p-2.5 bg-blue-50/50 dark:bg-blue-950/35 border border-blue-200/50 dark:border-blue-900/40 rounded-xl text-xs font-black text-blue-900 dark:text-blue-300 focus:outline-hidden cursor-pointer shadow-xs"
          >
            <option value={2026}>Năm 2026</option>
            <option value={2025}>Năm 2025</option>
            <option value={2024}>Năm 2024</option>
          </select>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 gap-4">
        {/* Balance Card */}
        <div className="col-span-2 p-6 bg-blue-100/40 dark:bg-blue-950/20 text-slate-800 dark:text-slate-100 rounded-2xl border border-blue-200/60 dark:border-blue-900/40 shadow-xs">
          <span className="text-[10px] text-blue-500 dark:text-blue-400 font-bold uppercase tracking-wider block">Tổng chênh lệch thu chi</span>
          <h3 className="text-2xl font-black mt-1 text-slate-900 dark:text-slate-50">
            {netBalance >= 0 ? '+' : ''}{formatVND(netBalance)}
          </h3>
          
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-blue-200/60 dark:border-blue-900/30 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <div>
              <span>Tổng nhận (+): </span>
              <strong className="text-emerald-600 dark:text-emerald-400 block text-sm mt-0.5 font-black">{formatVND(totalReceived)}</strong>
            </div>
            <div>
              <span>Tổng chi (-): </span>
              <strong className="text-rose-600 dark:text-rose-450 block text-sm mt-0.5 font-black">{formatVND(totalGiven)}</strong>
            </div>
          </div>
        </div>

        {/* Counts indicators */}
        <div className="p-5 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-200/50 dark:border-purple-900/30 shadow-xs">
          <span className="text-[10px] text-purple-500 dark:text-purple-400 font-bold block uppercase tracking-wider">Đã đi đám (Hoàn thành)</span>
          <strong className="text-xl font-black text-purple-900 dark:text-purple-300 block mt-1">{totalEventsAttended} sự kiện</strong>
        </div>

        <div className="p-5 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/50 dark:border-amber-900/30 shadow-xs">
          <span className="text-[10px] text-amber-600 dark:text-amber-450 font-bold block uppercase tracking-wider">Thiệp chờ phản hồi</span>
          <strong className="text-xl font-black text-amber-700 dark:text-amber-300 block mt-1">{totalPendingInvitations} thiệp</strong>
        </div>
      </div>

      {/* MONTHLY BAR CHART */}
      <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-6 rounded-2xl border border-indigo-200/50 dark:border-indigo-900/30 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-indigo-500" />
            Biến động tiền mừng năm {selectedYear}
          </h3>
          
          <div className="flex gap-3 text-[10px] font-bold">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-450">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs"></span> Nhận
            </span>
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-450">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs"></span> Chi (Mừng)
            </span>
          </div>
        </div>

        {/* Custom HTML/SVG Bar Chart */}
        <div className="h-52 flex items-end justify-between gap-1.5 pt-4 border-b border-indigo-200/30 dark:border-indigo-900/20 pb-1">
          {monthlyData.map((m) => {
            const receivedHeight = (m.received / maxMonthlyValue) * 100;
            const givenHeight = (m.given / maxMonthlyValue) * 100;

            return (
              <div key={m.month} className="flex-1 flex flex-col items-center h-full group relative">
                {/* Tooltip on Hover */}
                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[9px] p-2 rounded-xl pointer-events-none transition-all z-20 shadow-md w-28 text-center border border-slate-800">
                  <p className="font-bold text-slate-400 font-display">Tháng {m.month}</p>
                  <p className="text-emerald-400">Nhận: {formatVND(m.received)}</p>
                  <p className="text-rose-400">Mừng: {formatVND(m.given)}</p>
                </div>

                {/* Bars side-by-side */}
                <div className="w-full flex items-end justify-center gap-[3px] h-full">
                  {/* Received Bar */}
                  <div 
                    style={{ height: `${Math.max(receivedHeight, m.received > 0 ? 3 : 0)}%` }} 
                    className="w-[8px] bg-emerald-500 rounded-t-xs hover:opacity-90 transition-all duration-300 shadow-xs"
                  ></div>
                  {/* Given Bar */}
                  <div 
                    style={{ height: `${Math.max(givenHeight, m.given > 0 ? 3 : 0)}%` }} 
                    className="w-[8px] bg-rose-500 rounded-t-xs hover:opacity-90 transition-all duration-300 shadow-xs"
                  ></div>
                </div>

                {/* Label */}
                <span className="text-[10px] text-slate-450 dark:text-slate-405 mt-2.5 font-bold">{m.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* BREAKDOWN PIE BARS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spending by Event Type */}
        <div className="bg-pink-50/50 dark:bg-pink-950/20 p-6 rounded-2xl border border-pink-200/50 dark:border-pink-900/30 shadow-xs space-y-4">
          <h3 className="text-xs font-black text-pink-600 dark:text-pink-400 uppercase tracking-widest flex items-center gap-1.5">
            <PieIcon className="w-4 h-4 text-pink-500" />
            Chi tiêu theo loại sự kiện
          </h3>

          {statsByEventType.length > 0 ? (
            <div className="space-y-3">
              {statsByEventType.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className="text-pink-600 dark:text-pink-400 font-bold">{formatVND(item.amount)} ({item.percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-pink-150/40 dark:bg-pink-950/30 h-1.5 rounded-full overflow-hidden border border-pink-200/20 dark:border-pink-900/20">
                    <div 
                      style={{ width: `${item.percentage}%` }}
                      className="bg-pink-500 h-full rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4 font-semibold">Chưa có giao dịch chi đi mừng nào để xếp hạng.</p>
          )}
        </div>

        {/* Spending by Relationship */}
        <div className="bg-teal-50/50 dark:bg-teal-950/20 p-6 rounded-2xl border border-teal-200/50 dark:border-teal-900/30 shadow-xs space-y-4">
          <h3 className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
            <Users className="w-4 h-4 text-teal-500" />
            Chi tiêu theo mối quan hệ
          </h3>

          {statsByRelationship.length > 0 ? (
            <div className="space-y-3">
              {statsByRelationship.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className="text-teal-600 dark:text-teal-400 font-bold">{formatVND(item.amount)} ({item.percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-teal-150/40 dark:bg-teal-950/30 h-1.5 rounded-full overflow-hidden border border-teal-200/20 dark:border-teal-900/20">
                    <div 
                      style={{ width: `${item.percentage}%` }}
                      className="bg-teal-500 h-full rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4 font-semibold">Chưa có dữ liệu mối quan hệ tương ứng.</p>
          )}
        </div>
      </div>

      {/* TOP GIVERS LEADERBOARD */}
      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-200/50 dark:border-emerald-900/30 shadow-xs space-y-4">
        <h3 className="text-xs font-black text-emerald-600 dark:text-emerald-450 uppercase tracking-widest flex items-center gap-1.5">
          <Award className="w-4 h-4 text-emerald-500" />
          Những người đã mừng nhiều nhất (Top khách quý)
        </h3>

        {topGivers.length > 0 ? (
          <div className="divide-y divide-emerald-200/40 dark:divide-emerald-900/30">
            {topGivers.map((giver, idx) => {
              const badges = ['🥇', '🥈', '🥉', '🎖️', '🎖️'];
              return (
                <div key={idx} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{badges[idx]}</span>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-100 font-extrabold">{giver.name}</strong>
                      <span className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold block">{giver.relation} • {giver.count} lần mừng</span>
                    </div>
                  </div>
                  <strong className="text-slate-800 dark:text-slate-100 font-black">{formatVND(giver.amount)}</strong>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4 font-semibold">Chưa có ghi chép khách mừng cho gia đình.</p>
        )}
      </div>

      {/* LIST OF OUTSTANDING RETURNS */}
      {outstandingGifts.length > 0 && (
        <div className="bg-rose-50/50 dark:bg-rose-950/20 p-6 rounded-2xl border border-rose-200/50 dark:border-rose-900/30 shadow-xs space-y-4">
          <h3 className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Các khoản chưa mừng lại ({outstandingGifts.length})
          </h3>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {outstandingGifts.map((item, idx) => (
              <div 
                key={idx}
                className="p-3.5 bg-white/40 dark:bg-slate-900/40 rounded-xl border border-rose-200/40 dark:border-rose-900/40 flex justify-between items-center text-xs shadow-xs"
              >
                <div>
                  <strong className="text-slate-800 dark:text-slate-100 font-extrabold">{item.name}</strong>
                  <span className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold block">Từng mừng cho: {item.event} ({item.date.split('-').reverse().join('/')})</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-rose-600 dark:text-rose-400 block">{formatVND(item.amount)}</span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-sm font-bold">Cần lưu ý</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
