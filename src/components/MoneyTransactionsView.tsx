/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  Image as ImageIcon, 
  DollarSign, 
  Calendar as CalendarIcon, 
  X, 
  Save, 
  User, 
  MapPin, 
  Check, 
  AlertCircle,
  Camera,
  Upload
} from 'lucide-react';
import { AppData, saveAppData, loadAppData, getOrCreateContact, formatVND, formatDateVN, EVENT_TYPE_LABELS, RELATIONSHIP_LABELS } from '../dataStore';
import { MoneyTransaction, TransactionType, PaymentMethod, FundType, RelationshipType, Contact } from '../types';

interface MoneyTransactionsViewProps {
  data: AppData;
  onDataChange: (newData: AppData) => void;
}

export default function MoneyTransactionsView({ data, onDataChange }: MoneyTransactionsViewProps) {
  const { transactions, contacts, familyMembers, invitations } = data;

  // Tab State
  const [activeTab, setActiveTab] = useState<TransactionType>('given'); // 'given' (Đi mừng), 'received' (Đã nhận)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<MoneyTransaction | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | 'all'>('all');
  const [filterMember, setFilterMember] = useState<string>('all');

  // Active pagination
  const [visibleCount, setVisibleCount] = useState(10);

  // Reset pagination when active tab/search/filters change
  useEffect(() => {
    setVisibleCount(10);
  }, [activeTab, searchTerm, filterMethod, filterMember]);

  // Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [contactRel, setContactRel] = useState<RelationshipType>('friend');
  const [amount, setAmount] = useState<number>(500000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [transactionDate, setTransactionDate] = useState('');
  const [familyMemberId, setFamilyMemberId] = useState('fm_husband');
  const [fundType, setFundType] = useState<FundType>('personal');
  const [note, setNote] = useState('');
  const [image, setImage] = useState<string | null>(null);
  
  // Specific fields for RECEIVED type
  const [receivedEventName, setReceivedEventName] = useState(''); // Sự kiện người dùng tổ chức
  const [isMungLai, setIsMungLai] = useState(false); // Đã mừng lại hay chưa
  const [mungLaiAmount, setMungLaiAmount] = useState<number>(0);
  const [mungLaiDate, setMungLaiDate] = useState('');

  // Local storage backup loading
  useEffect(() => {
    if (!transactionDate) {
      setTransactionDate(new Date().toISOString().split('T')[0]);
    }
  }, []);

  // Compute "Cảnh báo chưa mừng lại"
  // Lọc ra những người từng mừng cho người dùng (received) mà người dùng chưa có giao dịch đi mừng (given) cho họ
  const unreciprocatedGivers = React.useMemo(() => {
    const receivedTx = transactions.filter(t => t.transactionType === 'received');
    const givenTx = transactions.filter(t => t.transactionType === 'given');

    const warnings: { contact: Contact; receivedTx: MoneyTransaction; givenBackTx?: MoneyTransaction }[] = [];

    receivedTx.forEach(rx => {
      const contact = contacts.find(c => c.id === rx.contactId);
      if (contact) {
        // Tìm xem mình đã có đi mừng lại người này chưa
        const hasGivenBack = givenTx.find(gx => gx.contactId === rx.contactId);
        
        // Nếu chưa mừng lại
        if (!hasGivenBack) {
          warnings.push({
            contact,
            receivedTx: rx
          });
        }
      }
    });

    return warnings;
  }, [transactions, contacts]);

  // Form Actions
  const handleOpenAdd = () => {
    setEditingTx(null);
    setContactName('');
    setContactPhone('');
    setContactAddress('');
    setContactRel('friend');
    setAmount(500000);
    setPaymentMethod('cash');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setFamilyMemberId(familyMembers[0]?.id || 'fm_husband');
    setFundType('personal');
    setNote('');
    setImage(null);
    setReceivedEventName('Đám cưới của chúng tôi');
    setIsMungLai(false);
    setMungLaiAmount(0);
    setMungLaiDate('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (tx: MoneyTransaction) => {
    const contact = contacts.find(c => c.id === tx.contactId);
    setEditingTx(tx);
    setContactName(contact?.fullName || '');
    setContactPhone(contact?.phone || '');
    setContactAddress(contact?.address || '');
    setContactRel(contact?.relationship || 'friend');
    setAmount(tx.amount);
    setPaymentMethod(tx.paymentMethod);
    setTransactionDate(tx.transactionDate);
    setFamilyMemberId(tx.familyMemberId);
    setFundType(tx.fundType);
    setNote(tx.note);
    setImage(tx.image || null);

    // Extract notes if contains special tags or structure
    if (tx.transactionType === 'received') {
      // Look for custom metadata in notes or handle fields
      setReceivedEventName(tx.note.split(' (Sự kiện: ')[1]?.replace(')', '') || 'Sự kiện của tôi');
      // Check if we have subsequently given money to this contact in dataStore
      const hasGiven = transactions.find(t => t.contactId === tx.contactId && t.transactionType === 'given');
      if (hasGiven) {
        setIsMungLai(true);
        setMungLaiAmount(hasGiven.amount);
        setMungLaiDate(hasGiven.transactionDate);
      } else {
        setIsMungLai(false);
        setMungLaiAmount(0);
        setMungLaiDate('');
      }
    }
    
    setIsFormOpen(true);
  };

  // Upload/Camera Handler with compression (Max 1280px, quality 0.5, JPEG)
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
        setImage(compressed);
      } else {
        setImage(base64Str);
      }
    };
    img.onerror = () => {
      setImage(base64Str);
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

  // Save Transaction
  const handleSave = () => {
    if (!contactName.trim()) {
      alert('Vui lòng nhập Tên người giao dịch');
      return;
    }
    if (amount <= 0) {
      alert('Số tiền phải lớn hơn 0');
      return;
    }

    // 1. Get or create contact
    const { contact } = getOrCreateContact(contactName.trim(), contactPhone, contactRel);
    
    // Update contact address if provided
    const appData = loadAppData();
    if (contactAddress.trim()) {
      appData.contacts = appData.contacts.map(c => {
        if (c.id === contact.id) {
          return { ...c, address: contactAddress.trim() };
        }
        return c;
      });
    }

    // 2. Prepare notes
    let finalNote = note.trim();
    if (activeTab === 'received' && receivedEventName.trim()) {
      finalNote += ` (Sự kiện: ${receivedEventName.trim()})`;
    }

    if (editingTx) {
      // Edit
      const updatedTransactions = appData.transactions.map(t => {
        if (t.id === editingTx.id) {
          return {
            ...t,
            contactId: contact.id,
            amount,
            paymentMethod,
            transactionDate,
            familyMemberId,
            fundType,
            image: image || undefined,
            note: finalNote
          };
        }
        return t;
      });

      const nextData = {
        ...appData,
        transactions: updatedTransactions
      };
      saveAppData(nextData);
      onDataChange(nextData);
    } else {
      // Add
      const newTx: MoneyTransaction = {
        id: `t_${Date.now()}`,
        contactId: contact.id,
        transactionType: activeTab,
        amount,
        paymentMethod,
        transactionDate,
        familyMemberId,
        fundType,
        image: image || undefined,
        note: finalNote,
        createdAt: new Date().toISOString()
      };

      const nextData = {
        ...appData,
        transactions: [...appData.transactions, newTx]
      };
      saveAppData(nextData);
      onDataChange(nextData);
    }

    setIsFormOpen(false);
  };

  // Delete Transaction
  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa giao dịch tiền mừng này?')) {
      const appData = loadAppData();
      const updatedTransactions = appData.transactions.filter(t => t.id !== id);
      
      const nextData = {
        ...appData,
        transactions: updatedTransactions
      };
      saveAppData(nextData);
      onDataChange(nextData);
    }
  };

  // Filter lists based on Search, Method, Member
  const filteredTransactions = transactions
    .filter(t => {
      if (t.transactionType !== activeTab) return false;

      const contact = contacts.find(c => c.id === t.contactId);
      const matchesSearch = contact?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            contact?.phone.includes(searchTerm) ||
                            t.note.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMethod = filterMethod === 'all' || t.paymentMethod === filterMethod;
      const matchesMember = filterMember === 'all' || t.familyMemberId === filterMember;

      return matchesSearch && matchesMethod && matchesMember;
    })
    .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate)); // Mới nhất lên đầu

  return (
    <div className="space-y-4 pb-20 select-none">
      {!isFormOpen ? (
        <>
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100/65 dark:bg-slate-950/35 p-1 rounded-full border border-slate-200/50 dark:border-white/5 backdrop-blur-md">
            <button
              onClick={() => {
                setActiveTab('given');
                setSearchTerm('');
              }}
              className={`py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                activeTab === 'given'
                  ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 border-rose-200 dark:border-rose-900/40 shadow-xs font-extrabold'
                  : 'bg-transparent border-transparent text-slate-500 dark:text-slate-450 hover:text-rose-750 dark:hover:text-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-950/10'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" /> Tiền đã đi mừng
            </button>
            <button
              onClick={() => {
                setActiveTab('received');
                setSearchTerm('');
              }}
              className={`py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                activeTab === 'received'
                  ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40 shadow-xs font-extrabold'
                  : 'bg-transparent border-transparent text-slate-500 dark:text-slate-450 hover:text-emerald-750 dark:hover:text-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" /> Tiền đã nhận
            </button>
          </div>

          {/* Social Reciprocity Warnings Box (Only on 'received' tab) */}
          {activeTab === 'received' && unreciprocatedGivers.length > 0 && (
            <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/60 rounded-3xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 justify-center">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
                <span className="text-center">Cảnh báo xã giao: Chưa mừng lại ({unreciprocatedGivers.length})</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold text-center">
                Những người sau đây đã từng mừng tiền sự kiện cho bạn, nhưng bạn chưa có ghi nhận đã đi mừng lại họ. Hãy lưu ý khi họ có tiệc mừng!
              </p>
              <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                {unreciprocatedGivers.map(({ contact, receivedTx }) => (
                  <div 
                    key={receivedTx.id}
                    onClick={() => {
                      setSearchTerm(contact.fullName);
                    }}
                    className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-amber-400 transition-all text-xs"
                  >
                    <div>
                      <strong className="text-slate-800 dark:text-slate-100 font-black">{contact.fullName}</strong>
                      <span className="text-[10px] text-slate-400 block font-semibold">Từng mừng: {receivedTx.note.replace(' (Sự kiện: ', ' vào ').replace(')', '')}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-amber-600 dark:text-amber-400">{formatVND(receivedTx.amount)}</span>
                      <span className="text-[9px] text-slate-400 block font-semibold">{formatDateVN(receivedTx.transactionDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Header Action Row */}
          <div className="flex justify-between items-center mt-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Sổ Sách Giao Dịch
            </h2>
            <button
              onClick={handleOpenAdd}
              className={`px-4 py-2 text-white font-semibold text-xs rounded-full flex items-center gap-1 cursor-pointer transition-all shadow-sm ${
                activeTab === 'given' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              <Plus className="w-4 h-4" /> Ghi khoản mới
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm người mừng, ghi chú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-xs rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 text-slate-700 dark:text-slate-200 font-medium"
            />
          </div>

          {/* Micro Filter Panel */}
          <div className="flex gap-2 text-xs">
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value as PaymentMethod | 'all')}
              className="flex-1 p-2.5 px-4 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-300 focus:outline-hidden text-xs font-semibold text-center cursor-pointer"
            >
              <option value="all">Mọi hình thức</option>
              <option value="cash">Tiền mặt</option>
              <option value="transfer">Chuyển khoản</option>
            </select>
            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className="flex-1 p-2.5 px-4 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-300 focus:outline-hidden text-xs font-semibold text-center cursor-pointer"
            >
              <option value="all">Mọi thành viên đi</option>
              {familyMembers.map(fm => (
                <option key={fm.id} value={fm.id}>{fm.name}</option>
              ))}
            </select>
          </div>

          {/* Transactions List */}
          {filteredTransactions.length > 0 ? (
            <div className="space-y-3">
              {filteredTransactions.slice(0, visibleCount).map(tx => {
                const contact = contacts.find(c => c.id === tx.contactId);
                const familyMember = familyMembers.find(f => f.id === tx.familyMemberId);
                return (
                  <div
                    key={tx.id}
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex justify-between items-start gap-4 hover:border-rose-400 dark:hover:border-rose-900 shadow-sm transition-all"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`p-1 rounded-full ${
                          tx.transactionType === 'given'
                            ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600'
                            : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600'
                        }`}>
                          {tx.transactionType === 'given' ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-2.5 py-0.5 rounded-full font-semibold">
                          {tx.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {familyMember?.name || 'Gia đình'} ({tx.fundType === 'personal' ? 'Cá nhân' : 'Quỹ chung'})
                        </span>
                      </div>
                      
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {contact?.fullName || 'Người liên quan'}
                      </h4>
                      
                      {contact?.phone && (
                        <p className="text-[11px] text-slate-400 font-medium">SĐT: {contact.phone}</p>
                      )}

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 bg-slate-50/50 dark:bg-slate-950/40 p-2.5 rounded-2xl font-medium">
                        {tx.note}
                      </p>

                      <p className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                        <CalendarIcon className="w-3 h-3 text-slate-300" />
                        Giao dịch ngày: {formatDateVN(tx.transactionDate)}
                      </p>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-2">
                      <span className={`text-base font-black ${
                        tx.transactionType === 'given' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {tx.transactionType === 'given' ? '-' : '+'}{formatVND(tx.amount)}
                      </span>

                      {tx.image && (
                        <img
                          src={tx.image}
                          alt="Chứng từ"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="w-12 h-12 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs"
                          onClick={() => {
                            // simple modal-like zoom
                            alert('Bấm vào chứng từ để xem kích thước lớn.');
                          }}
                        />
                      )}

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(tx)}
                          className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-full cursor-pointer transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 hover:bg-rose-100 rounded-full cursor-pointer transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Pagination controls */}
              {filteredTransactions.length > visibleCount && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setVisibleCount(prev => prev + 10)}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-full transition-all cursor-pointer shadow-xs border border-slate-200/50 dark:border-white/5"
                  >
                    Xem thêm giao dịch ({filteredTransactions.length - visibleCount} khoản khác)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
              <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-semibold text-center">Chưa có giao dịch nào được ghi chép.</p>
            </div>
          )}
        </>
      ) : (
        /* TRANSACTION ADD/EDIT FORM */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span className={`w-1 h-4 rounded-full ${activeTab === 'given' ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
              {editingTx ? 'Cập Nhật Giao Dịch' : `Thêm Giao Dịch ${activeTab === 'given' ? 'Đi Mừng' : 'Đã Nhận'}`}
            </h3>
            <button
              onClick={() => setIsFormOpen(false)}
              className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-full hover:bg-slate-150 dark:hover:bg-slate-700 text-slate-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3.5 text-sm">
            {/* Tên người mừng/nhận */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Họ và tên người {activeTab === 'given' ? 'nhận' : 'mừng'} *
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn Nam"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-250 focus:outline-hidden focus:border-rose-500 transition-all"
              />
            </div>

            {/* Thông tin phụ của Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Số điện thoại</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="0912..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-250 focus:outline-hidden focus:border-rose-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Mối quan hệ</label>
                <select
                  value={contactRel}
                  onChange={(e) => setContactRel(e.target.value as RelationshipType)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-250 focus:outline-hidden focus:border-rose-500 transition-all"
                >
                  {Object.entries(RELATIONSHIP_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Địa chỉ (Tùy chọn)</label>
              <input
                type="text"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                placeholder="Số nhà, đường, quận, thành phố..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-250 focus:outline-hidden focus:border-rose-500 transition-all"
              />
            </div>

            {/* Trường đặc biệt cho SỰ KIỆN GIA ĐÌNH khi nhận tiền */}
            {activeTab === 'received' && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Sự kiện bạn tổ chức nhận tiền</label>
                <input
                  type="text"
                  value={receivedEventName}
                  onChange={(e) => setReceivedEventName(e.target.value)}
                  placeholder="Ví dụ: Đám cưới chúng tôi, Đầy tháng bé Tin..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-250 focus:outline-hidden focus:border-rose-500 transition-all"
                />
              </div>
            )}

            {/* Số tiền & Hình thức */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Số tiền (VND) *</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    step="50000"
                    className="w-full p-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-250 focus:outline-hidden focus:border-rose-500 transition-all"
                  />
                  <span className="absolute right-3.5 top-3.5 text-[10px] text-slate-400 font-bold uppercase">VNĐ</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Hình thức thanh toán</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-250 focus:outline-hidden focus:border-rose-500 transition-all"
                >
                  <option value="cash">Tiền mặt</option>
                  <option value="transfer">Chuyển khoản</option>
                </select>
              </div>
            </div>

            {/* Thành viên gia đình & Quỹ */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Người đại diện thực hiện</label>
                <select
                  value={familyMemberId}
                  onChange={(e) => setFamilyMemberId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-250 focus:outline-hidden focus:border-rose-500 transition-all"
                >
                  {familyMembers.map(fm => (
                    <option key={fm.id} value={fm.id}>{fm.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Thuộc quỹ</label>
                <select
                  value={fundType}
                  onChange={(e) => setFundType(e.target.value as FundType)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-250 focus:outline-hidden focus:border-rose-500 transition-all"
                >
                  <option value="personal">Quỹ cá nhân</option>
                  <option value="family">Quỹ chung gia đình</option>
                </select>
              </div>
            </div>

            {/* Ngày giao dịch */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Ngày giao dịch *</label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-250 focus:outline-hidden focus:border-rose-500 transition-all"
              />
            </div>

            {/* Ảnh chụp phong bì / Giao dịch */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Ảnh chụp phong bì / Hóa đơn chuyển khoản (Tùy chọn)
              </label>
              <div className="flex gap-3">
                <label className="flex-1 py-4 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-350 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer text-center transition-all">
                  <Upload className="w-4 h-4 text-slate-400" /> Tải lên ảnh chứng từ
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {image && (
                <div className="relative inline-block mt-3">
                  <img
                    src={image}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-24 h-24 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-all cursor-pointer shadow-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Ghi chú</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Gửi mừng hộ chị hai, chuyển khoản qua ngân hàng..."
                rows={2}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-250 focus:outline-hidden focus:border-rose-500 transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-5">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-full text-xs transition-all cursor-pointer text-center"
              >
                Hủy bỏ
              </button>
              
              <button
                type="button"
                onClick={handleSave}
                className={`flex-1 py-3 text-white font-bold rounded-full text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-98 ${
                  activeTab === 'given' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                <Save className="w-4 h-4" /> Lưu khoản mừng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
