/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Clock, 
  Phone, 
  Camera, 
  Upload, 
  Trash2, 
  Edit, 
  Plus, 
  Save, 
  X, 
  Info, 
  Link as LinkIcon, 
  Check, 
  RefreshCw,
  Users,
  Briefcase,
  AlertCircle,
  Wand2,
  Sparkles,
  Home,
  Gift,
  Smile,
  BookOpen,
  HeartHandshake,
  Trash,
  Eye
} from 'lucide-react';
import { AppData, saveAppData, loadAppData, getOrCreateContact, getSuggestedAmount, formatVND, EVENT_TYPE_LABELS, RELATIONSHIP_LABELS, STATUS_LABELS, formatDateVN } from '../dataStore';
import { Invitation, EventType, RelationshipType, InvitationStatus, Contact, MoneyTransaction } from '../types';
import { TabBar, FloatingActionButton, CardItem, StatusChip } from './M3Widgets';
import { getPastelTheme, MATERIAL_THEME_CLASSES } from '../theme/materialTheme';

const getCardBgStyle = (index: number) => {
  const styles = [
    {
      bg: 'backdrop-blur-md bg-[#F9F5F2]/65 dark:bg-[#1E1B18]/65 border-white/20 dark:border-white/5 shadow-xs',
      textColor: 'text-[#5C4D3C] dark:text-[#EAE2DB]',
      subColor: 'text-[#8E7D6A] dark:text-[#A89684]',
      iconBg: 'bg-[#F2ECE6]/80 dark:bg-[#2A231C]/80'
    },
    {
      bg: 'backdrop-blur-md bg-[#F4F0F6]/65 dark:bg-[#19171C]/65 border-white/20 dark:border-white/5 shadow-xs',
      textColor: 'text-[#4D3C5C] dark:text-[#E3DCE7]',
      subColor: 'text-[#7D6A8E] dark:text-[#A090B0]',
      iconBg: 'bg-[#ECE4F0]/80 dark:bg-[#231C29]/80'
    },
    {
      bg: 'backdrop-blur-md bg-[#F6F5EE]/65 dark:bg-[#1B1B17]/65 border-white/20 dark:border-white/5 shadow-xs',
      textColor: 'text-[#4D4D38] dark:text-[#E6E4D6]',
      subColor: 'text-[#7D7D62] dark:text-[#A0A085]',
      iconBg: 'bg-[#EEECE0]/80 dark:bg-[#23231C]/80'
    },
    {
      bg: 'backdrop-blur-md bg-[#FDF3F3]/65 dark:bg-[#1E1717]/65 border-white/20 dark:border-white/5 shadow-xs',
      textColor: 'text-[#5E3838] dark:text-[#F2DFDF]',
      subColor: 'text-[#8F6262] dark:text-[#B08585]',
      iconBg: 'bg-[#F7E5E5]/80 dark:bg-[#2A1C1C]/80'
    }
  ];
  return styles[index % styles.length];
};

const formatPrettyDateVN = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10);
    const year = parts[0];
    return `${day} tháng ${month}, ${year}`;
  }
  return dateStr;
};

const NotebookLMLogo = () => (
  <svg className="w-5 h-5 text-slate-800 dark:text-slate-100 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M4 18a4 4 0 0 1 4-4h12M4 10a4 4 0 0 1 4-4h12M4 22V4c0-1.1.9-2 2-2h14v20H6c-1.1 0-2-.9-2-2z" />
  </svg>
);

interface InvitationsViewProps {
  data: AppData;
  onDataChange: (newData: AppData) => void;
  quickAddType?: string;
  onClearQuickAddType?: () => void;
  selectedInvitation?: Invitation | null;
  onClearSelectedInvitation?: () => void;
}

export default function InvitationsView({ 
  data, 
  onDataChange,
  quickAddType,
  onClearQuickAddType,
  selectedInvitation,
  onClearSelectedInvitation
}: InvitationsViewProps) {
  const { invitations, contacts, familyMembers, settings } = data;

  // UI state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInv, setEditingInv] = useState<Invitation | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<InvitationStatus | 'all'>('all');
  const [filterRel, setFilterRel] = useState<RelationshipType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'dateAsc' | 'dateDesc'>('dateAsc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Form states
  const [inviterName, setInviterName] = useState('');
  const [inviterPhone, setInviterPhone] = useState('');
  const [inviterRel, setInviterRel] = useState<RelationshipType>('friend');
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [expectedAmount, setExpectedAmount] = useState<number>(500000);
  const [attendeeCount, setAttendeeCount] = useState<number>(1);
  const [status, setStatus] = useState<InvitationStatus>('pending');
  const [note, setNote] = useState('');
  const [recipientId, setRecipientId] = useState('fm_husband');
  const [invitationImage, setInvitationImage] = useState<string | null>(null);

  // Suggested amount and history states
  const [historyAlert, setHistoryAlert] = useState<{
    received: number;
    given: number;
    lastDate?: string;
    suggested: number;
    reason: string;
    contactName: string;
  } | null>(null);

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Active pagination
  const [visibleCount, setVisibleCount] = useState(10);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Reset pagination when search/filters change
  useEffect(() => {
    setVisibleCount(10);
  }, [searchTerm, filterType, filterStatus, filterRel, sortBy]);

  // Trigger from Dashboard Quick-Add or View
  useEffect(() => {
    if (quickAddType) {
      handleOpenAddForm(quickAddType as EventType);
      if (onClearQuickAddType) onClearQuickAddType();
    }
  }, [quickAddType]);

  useEffect(() => {
    if (selectedInvitation) {
      handleOpenEditForm(selectedInvitation);
      if (onClearSelectedInvitation) onClearSelectedInvitation();
    }
  }, [selectedInvitation]);

  // Handle name autocomplete & dynamic suggests
  useEffect(() => {
    if (inviterName.trim().length >= 2) {
      const trimmed = inviterName.trim().toLowerCase();
      const matchedContact = contacts.find(c => c.fullName.toLowerCase() === trimmed);
      if (matchedContact) {
        // Exists, calculate suggestions
        const suggestResult = getSuggestedAmount(matchedContact.id, eventType, attendeeCount);
        setHistoryAlert({
          received: suggestResult.history?.received || 0,
          given: suggestResult.history?.given || 0,
          lastDate: suggestResult.history?.lastDate,
          suggested: suggestResult.suggested,
          reason: suggestResult.reason,
          contactName: matchedContact.fullName
        });
        setInviterPhone(matchedContact.phone);
        setInviterRel(matchedContact.relationship);
      } else {
        setHistoryAlert(null);
      }
    } else {
      setHistoryAlert(null);
    }
  }, [inviterName, eventType, attendeeCount]);

  // Form Opening Actions
  const handleOpenAddForm = (defaultType: EventType = 'wedding') => {
    setEditingInv(null);
    setInviterName('');
    setInviterPhone('');
    setInviterRel('friend');
    setEventType(defaultType);
    setEventName('');
    
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    setEventDate(today);
    setEventTime('11:30');
    setLocation('');
    setMapUrl('');
    setExpectedAmount(500000);
    setAttendeeCount(1);
    setStatus('pending');
    setNote('');
    setRecipientId(familyMembers[0]?.id || 'fm_husband');
    setInvitationImage(null);
    setHistoryAlert(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (inv: Invitation) => {
    const contact = contacts.find(c => c.id === inv.contactId);
    setEditingInv(inv);
    setInviterName(contact?.fullName || '');
    setInviterPhone(contact?.phone || '');
    setInviterRel(contact?.relationship || 'friend');
    setEventType(inv.eventType);
    setEventName(inv.eventName);
    setEventDate(inv.eventDate);
    setEventTime(inv.eventTime);
    setLocation(inv.location);
    setMapUrl(inv.mapUrl || '');
    setExpectedAmount(inv.expectedAmount);
    setAttendeeCount(inv.attendeeCount);
    setStatus(inv.status);
    setNote(inv.note);
    setRecipientId(inv.recipientFamilyMemberId || 'fm_husband');
    setInvitationImage(inv.invitationImage || null);
    setIsFormOpen(true);
  };

  // Image Upload / Camera handlers with quality & dimension compression (Max 1280px, under 200KB)
  const compressAndSetImage = (base64Str: string) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 1280;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.5);
        setInvitationImage(compressed);
      } else {
        setInvitationImage(base64Str);
      }
    };
    img.onerror = () => {
      setInvitationImage(base64Str);
    };
    img.src = base64Str;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        compressAndSetImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      alert('Không thể mở camera. Vui lòng cho phép ứng dụng truy cập camera hoặc tải ảnh lên từ thư viện.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const maxDim = 1280;
      let width = videoRef.current.videoWidth;
      let height = videoRef.current.videoHeight;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        setInvitationImage(dataUrl);
        stopCamera();
      }
    }
  };

  // Save / Submit Invitation
  const handleSave = () => {
    if (!inviterName.trim()) {
      alert('Vui lòng nhập Tên người mời');
      return;
    }
    if (!eventName.trim()) {
      alert('Vui lòng nhập Tên sự kiện (Ví dụ: Đám cưới Nam & Thảo)');
      return;
    }
    if (!eventDate) {
      alert('Vui lòng chọn Ngày diễn ra');
      return;
    }

    // 1. Get or create Contact
    const { contact } = getOrCreateContact(inviterName, inviterPhone, inviterRel);

    const appData = loadAppData();

    if (editingInv) {
      // Edit mode
      const updatedInvitations = appData.invitations.map(inv => {
        if (inv.id === editingInv.id) {
          return {
            ...inv,
            contactId: contact.id,
            eventType,
            eventName: eventName.trim(),
            eventDate,
            eventTime,
            location: location.trim(),
            mapUrl: mapUrl.trim(),
            expectedAmount,
            attendeeCount,
            status,
            invitationImage: invitationImage || undefined,
            note: note.trim(),
            recipientFamilyMemberId: recipientId,
            updatedAt: new Date().toISOString()
          };
        }
        return inv;
      });

      // Update Money transaction automatically if status changes to 'completed'
      let updatedTransactions = [...appData.transactions];
      const hasTransaction = appData.transactions.find(t => t.invitationId === editingInv.id);

      if (status === 'completed') {
        if (!hasTransaction) {
          // create new given transaction
          const newTx: MoneyTransaction = {
            id: `t_${Date.now()}`,
            contactId: contact.id,
            invitationId: editingInv.id,
            transactionType: 'given',
            amount: expectedAmount,
            paymentMethod: 'cash', // default
            transactionDate: eventDate,
            familyMemberId: recipientId,
            fundType: 'personal',
            note: `Đi mừng sự kiện: ${eventName}`,
            createdAt: new Date().toISOString()
          };
          updatedTransactions.push(newTx);
        } else {
          // Update amount
          updatedTransactions = updatedTransactions.map(t => {
            if (t.invitationId === editingInv.id) {
              return { ...t, amount: expectedAmount, transactionDate: eventDate, contactId: contact.id };
            }
            return t;
          });
        }
      } else {
        // If status is not completed but transaction exists, delete it or keep depending on business
        if (hasTransaction) {
          updatedTransactions = updatedTransactions.filter(t => t.invitationId !== editingInv.id);
        }
      }

      const nextData = {
        ...appData,
        invitations: updatedInvitations,
        transactions: updatedTransactions
      };
      saveAppData(nextData);
      onDataChange(nextData);
    } else {
      // Add mode
      const newInvId = `inv_${Date.now()}`;
      const newInv: Invitation = {
        id: newInvId,
        contactId: contact.id,
        eventType,
        eventName: eventName.trim(),
        eventDate,
        eventTime,
        location: location.trim(),
        mapUrl: mapUrl.trim(),
        expectedAmount,
        attendeeCount,
        status,
        invitationImage: invitationImage || undefined,
        note: note.trim(),
        recipientFamilyMemberId: recipientId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedInvitations = [...appData.invitations, newInv];
      const updatedTransactions = [...appData.transactions];

      if (status === 'completed') {
        const newTx: MoneyTransaction = {
          id: `t_${Date.now()}`,
          contactId: contact.id,
          invitationId: newInvId,
          transactionType: 'given',
          amount: expectedAmount,
          paymentMethod: 'cash',
          transactionDate: eventDate,
          familyMemberId: recipientId,
          fundType: 'personal',
          note: `Đi mừng sự kiện: ${eventName}`,
          createdAt: new Date().toISOString()
        };
        updatedTransactions.push(newTx);
      }

      // Add default notifications/reminders for this invitation
      const newReminders = [
        { id: `rem_${Date.now()}_1`, invitationId: newInvId, reminderTimeValue: 1, reminderTimeUnit: 'days' as const, isCompleted: false },
        { id: `rem_${Date.now()}_2`, invitationId: newInvId, reminderTimeValue: 3, reminderTimeUnit: 'hours' as const, isCompleted: false }
      ];

      const nextData = {
        ...appData,
        invitations: updatedInvitations,
        transactions: updatedTransactions,
        reminders: [...appData.reminders, ...newReminders]
      };
      saveAppData(nextData);
      onDataChange(nextData);
    }

    setIsFormOpen(false);
  };

  // Delete Invitation
  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa thiệp mời này? Mọi lịch nhắc và giao dịch liên quan sẽ bị xóa.')) {
      const appData = loadAppData();
      const updatedInvitations = appData.invitations.filter(i => i.id !== id);
      const updatedTransactions = appData.transactions.filter(t => t.invitationId !== id);
      const updatedReminders = appData.reminders.filter(r => r.invitationId !== id);

      const nextData = {
        ...appData,
        invitations: updatedInvitations,
        transactions: updatedTransactions,
        reminders: updatedReminders
      };
      saveAppData(nextData);
      onDataChange(nextData);
    }
  };

  // Filter & Search Logic
  const filteredInvitations = invitations
    .filter(inv => {
      const contact = contacts.find(c => c.id === inv.contactId);
      const nameMatch = contact?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const eventMatch = inv.eventName.toLowerCase().includes(searchTerm.toLowerCase());
      const locationMatch = inv.location.toLowerCase().includes(searchTerm.toLowerCase());
      const phoneMatch = contact?.phone.includes(searchTerm) || false;

      const matchesSearch = nameMatch || eventMatch || locationMatch || phoneMatch;
      const matchesType = filterType === 'all' || inv.eventType === filterType;
      const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
      
      let matchesRel = true;
      if (filterRel !== 'all') {
        matchesRel = contact?.relationship === filterRel;
      }

      return matchesSearch && matchesType && matchesStatus && matchesRel;
    })
    .sort((a, b) => {
      if (sortBy === 'dateAsc') {
        return a.eventDate.localeCompare(b.eventDate);
      } else {
        return b.eventDate.localeCompare(a.eventDate);
      }
    });

  return (
    <div className="space-y-4 pb-24 select-none px-1 animate-fadeIn">
      {!isFormOpen ? (
        <>
          {/* Main List Layout in customized premium Material Design 3 Style */}
          <div className="flex justify-between items-center bg-transparent pt-4 pb-1">
            <div>
              <span className="font-display font-extrabold text-xl tracking-tight text-[#111111] dark:text-white">
                Hộp thư thiệp mời
              </span>
              <p className="text-[10px] text-[#666666] dark:text-slate-400 font-medium">Đối chiếu mối quan hệ & tính toán tiền mừng chu đáo</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-slate-100 dark:bg-white/5 border border-[#ECECEC] dark:border-[#222225] px-2.5 py-0.5 rounded-full font-mono text-[9px] text-[#111111] dark:text-white tracking-wider font-extrabold select-none">
                M3 SECURE
              </span>
            </div>
          </div>

          {/* Styled Capsule Filters using our modular TabBar widget */}
          <TabBar
            tabs={[
              { id: 'all', label: 'Tất cả' },
              { id: 'pending', label: 'Chưa xem' },
              { id: 'attending', label: 'Sẽ tham dự' },
              { id: 'completed', label: 'Đã mừng' },
              { id: 'declined', label: 'Từ chối' }
            ]}
            activeTab={filterStatus}
            onTabChange={(id) => {
              setFilterStatus(id as InvitationStatus | 'all');
              if (id === 'all') {
                setSortBy('dateAsc');
              }
            }}
          />

          {/* Search Box + Advanced Filter Toggle */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên người mời, địa điểm, sự kiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-slate-100/70 dark:bg-slate-900 border-none shadow-xs text-slate-700 dark:text-slate-200 font-medium placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-700"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-2.5 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                showAdvancedFilters 
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
              title="Bộ lọc nâng cao"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Optional Advanced Filters Bar */}
          {showAdvancedFilters && (
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Loại sự kiện</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as EventType | 'all')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-hidden"
                  >
                    <option value="all">Tất cả sự kiện</option>
                    {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mối quan hệ</label>
                  <select
                    value={filterRel}
                    onChange={(e) => setFilterRel(e.target.value as RelationshipType | 'all')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-hidden"
                  >
                    <option value="all">Tất cả mối quan hệ</option>
                    {Object.entries(RELATIONSHIP_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Sắp xếp theo ngày</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'dateAsc' | 'dateDesc')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-hidden"
                  >
                    <option value="dateAsc">Ngày tăng dần (Gần nhất)</option>
                    <option value="dateDesc">Ngày giảm dần (Xa nhất)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Invitation Cards using modular CardItem */}
          {filteredInvitations.length > 0 ? (
            <div className="space-y-3.5">
              {filteredInvitations.slice(0, visibleCount).map((inv, index) => {
                const contact = contacts.find(c => c.id === inv.contactId);
                
                // Define representative icon
                let CardIcon = Gift;
                if (inv.eventType === 'wedding') CardIcon = HeartHandshake;
                else if (inv.eventType === 'birthday') CardIcon = Smile;
                else if (inv.eventType === 'housewarming') CardIcon = Home;
                else if (inv.eventType === 'engagement') CardIcon = Sparkles;
                else if (inv.eventType === 'baby_shower') CardIcon = Users;
                else if (inv.eventType === 'memorial') CardIcon = Briefcase;

                return (
                  <CardItem
                    key={inv.id}
                    index={index}
                    icon={inv.invitationImage ? (
                      <img
                        src={inv.invitationImage}
                        alt="Thiệp"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-11 h-11 object-cover rounded-2xl border border-white/40 shadow-xs"
                      />
                    ) : (
                      <CardIcon className="w-5 h-5" />
                    )}
                    title={inv.eventName}
                    description={`${contact?.fullName || 'Người mời'} • ${EVENT_TYPE_LABELS[inv.eventType]} • ${inv.location}`}
                    dateStr={`${inv.eventTime} - ${formatPrettyDateVN(inv.eventDate)}`}
                    status={inv.status}
                    onActionClick={() => handleOpenEditForm(inv)}
                  />
                );
              })}

              {/* Pagination controls */}
              {filteredInvitations.length > visibleCount && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setVisibleCount(prev => prev + 10)}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-full transition-all cursor-pointer shadow-xs border border-slate-200/50 dark:border-white/5"
                  >
                    Xem thêm thiệp mời ({filteredInvitations.length - visibleCount} thiệp khác)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#F6F5EE]/40 dark:bg-slate-900 rounded-[24px] border border-slate-200/60 dark:border-slate-800/60 shadow-xs">
              <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Chưa có thiệp mời nào thuộc danh mục này.</p>
            </div>
          )}

          {/* Reusable FloatingActionButton */}
          <FloatingActionButton
            onAddClick={() => handleOpenAddForm()}
            onCameraClick={() => {
              handleOpenAddForm();
              setTimeout(() => {
                startCamera();
              }, 150);
            }}
          />
        </>
      ) : (
        /* FORM VIEW (Create & Edit) */
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-rose-500 rounded-full"></span>
              {editingInv ? 'Cập Nhật Thiệp Mời' : 'Thêm Thiệp Mời Mới'}
            </h3>
            <button
              onClick={() => {
                stopCamera();
                setIsFormOpen(false);
              }}
              className="p-1.5 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 text-sm">
            {/* Người mời */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Tên người mời * (Gõ để tra lịch sử & gợi ý)
              </label>
              <input
                type="text"
                value={inviterName}
                onChange={(e) => setInviterName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn Nam"
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-rose-400 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={inviterPhone}
                  onChange={(e) => setInviterPhone(e.target.value)}
                  placeholder="0912..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Mối quan hệ</label>
                <select
                  value={inviterRel}
                  onChange={(e) => setInviterRel(e.target.value as RelationshipType)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden"
                >
                  {Object.entries(RELATIONSHIP_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Smart History Lookup Notification */}
            {historyAlert && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold">
                  <Info className="w-3.5 h-3.5" /> Lịch sử đối chiếu cho: {historyAlert.contactName}
                </div>
                <div className="text-slate-600 dark:text-slate-300 space-y-0.5">
                  <p>• Họ từng mừng bạn: <strong className="text-slate-800 dark:text-slate-100">{formatVND(historyAlert.received)}</strong> {historyAlert.lastDate ? `(Ngày gần nhất: ${historyAlert.lastDate})` : ''}</p>
                  <p>• Bạn từng mừng họ: <strong className="text-slate-800 dark:text-slate-100">{formatVND(historyAlert.given)}</strong></p>
                  <p className="mt-1 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 p-1.5 rounded-md font-medium">
                    💡 <strong>Gợi ý đi mừng:</strong> {historyAlert.reason}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setExpectedAmount(historyAlert.suggested)}
                  className="mt-1 text-xs px-2.5 py-1 bg-amber-200 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-semibold rounded-md hover:bg-amber-300 transition-all cursor-pointer"
                >
                  Áp dụng {formatVND(historyAlert.suggested)}
                </button>
              </div>
            )}

            {/* Loại sự kiện & Tên sự kiện */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Loại sự kiện</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden"
                >
                  {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Tên cô dâu chú rể / Sự kiện *</label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Ví dụ: Đám cưới Nam & Thảo"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Ngày & Giờ diễn ra */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Ngày diễn ra *</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Giờ diễn ra</label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Địa điểm & Link Google Maps */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Địa điểm tổ chức</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Nhà hàng, tư gia..."
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Đường dẫn Google Maps (Nếu có)</label>
              <input
                type="text"
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 focus:outline-hidden"
              />
            </div>

            {/* Tiền mừng & Số người đi */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Tiền mừng dự kiến (VND)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={expectedAmount}
                    onChange={(e) => setExpectedAmount(Number(e.target.value))}
                    step="50000"
                    placeholder="500000"
                    className="w-full p-2.5 pr-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 focus:outline-hidden"
                  />
                  <span className="absolute right-3 top-3 text-xs text-slate-400 font-bold">VNĐ</span>
                </div>
                {/* Shortcuts */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[200000, 300000, 500000, 1000000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setExpectedAmount(val)}
                      className={`px-2 py-1 text-[10px] font-semibold rounded-md border cursor-pointer ${
                        expectedAmount === val
                          ? 'bg-rose-500 border-rose-500 text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Số người tham dự</label>
                <input
                  type="number"
                  value={attendeeCount}
                  onChange={(e) => setAttendeeCount(Number(e.target.value))}
                  min="1"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Trạng thái & Người đi */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Trạng thái thiệp</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as InvitationStatus)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden"
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Thành viên đi mừng</label>
                <select
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden"
                >
                  {familyMembers.map(fm => (
                    <option key={fm.id} value={fm.id}>{fm.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Ghi chú</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Đi xe cơ quan, mua quà thêm..."
                rows={2}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 focus:outline-hidden"
              />
            </div>

            {/* Chụp / Chọn ảnh thiệp mời */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Ảnh chụp thiệp mời</label>
              
              {isCameraActive ? (
                <div className="space-y-2">
                  <div className="relative aspect-video w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                    <video ref={videoRef} className="w-full h-full object-cover" playInline muted></video>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-4 py-2 bg-rose-500 text-white font-semibold rounded-lg text-xs hover:bg-rose-600 transition-all cursor-pointer"
                    >
                      Bấm chụp ảnh
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg text-xs hover:bg-slate-600 transition-all cursor-pointer"
                    >
                      Tắt camera
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex-1 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Camera className="w-4 h-4" /> Chụp bằng camera
                    </button>
                    
                    <label className="flex-1 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center">
                      <Upload className="w-4 h-4" /> Chọn ảnh từ máy
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {invitationImage && (
                    <div className="relative inline-block mt-2">
                      <img
                        src={invitationImage}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-24 h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => setInvitationImage(null)}
                        className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-all cursor-pointer shadow-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 mt-4">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setIsFormOpen(false);
                }}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-98"
              >
                <Save className="w-4 h-4" /> Lưu thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
