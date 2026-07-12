/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { 
  Settings, 
  Moon, 
  Sun, 
  Lock, 
  Unlock, 
  Users, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Share2, 
  Plus, 
  Trash2, 
  Save, 
  Key, 
  Check, 
  RefreshCw,
  Copy,
  Info,
  Laptop
} from 'lucide-react';
import { 
  AppData, 
  saveAppData, 
  loadAppData, 
  exportToCSV, 
  importContactsFromCSV, 
  formatVND, 
  formatDateVN,
  EVENT_TYPE_LABELS, 
  RELATIONSHIP_LABELS 
} from '../dataStore';
import { FamilyMember, AppSettings } from '../types';
import PinLockScreen from './PinLockScreen';

interface SettingsViewProps {
  data: AppData;
  onDataChange: (newData: AppData) => void;
  onToggleTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export default function SettingsView({ data, onDataChange, onToggleTheme }: SettingsViewProps) {
  const { settings, familyMembers, contacts, invitations, transactions } = data;

  const [activeFamilyMember, setActiveFamilyMember] = useState<string>(settings.selectedFamilyMemberId || '');
  const [pinSetupOpen, setPinSetupOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'husband' | 'wife' | 'parent' | 'sibling' | 'other'>('other');
  const [newMemberColor, setNewMemberColor] = useState('bg-purple-500');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const csvInputRef = useRef<HTMLInputElement | null>(null);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetUnderstand, setResetUnderstand] = useState(false);

  const handleResetAllData = () => {
    const freshData: AppData = {
      contacts: [],
      invitations: [],
      transactions: [],
      reminders: [],
      familyMembers: [
        { id: 'fm_husband', name: 'Chồng', role: 'husband', avatarColor: 'bg-blue-500' },
        { id: 'fm_wife', name: 'Vợ', role: 'wife', avatarColor: 'bg-rose-500' },
        { id: 'fm_parents', name: 'Bố mẹ', role: 'parent', avatarColor: 'bg-amber-500' },
        { id: 'fm_family', name: 'Cả gia đình', role: 'other', avatarColor: 'bg-emerald-500' }
      ],
      settings: {
        theme: settings.theme,
        isPinEnabled: false,
        familyModeEnabled: true,
        selectedFamilyMemberId: 'fm_husband'
      }
    };
    
    saveAppData(freshData);
    onDataChange(freshData);
    setShowResetConfirm(false);
    setResetUnderstand(false);
    alert('Đã xóa toàn bộ dữ liệu và khôi phục ứng dụng về trạng thái ban đầu thành công!');
  };

  // Toggle Theme
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    const updatedSettings: AppSettings = { ...settings, theme };
    const nextData = { ...data, settings: updatedSettings };
    saveAppData(nextData);
    onDataChange(nextData);
    onToggleTheme(theme);
  };

  // Family Mode toggler
  const handleToggleFamilyMode = () => {
    const updatedSettings: AppSettings = { ...settings, familyModeEnabled: !settings.familyModeEnabled };
    const nextData = { ...data, settings: updatedSettings };
    saveAppData(nextData);
    onDataChange(nextData);
  };

  // Add Family Member
  const handleAddFamilyMember = () => {
    if (!newMemberName.trim()) return;

    const newFm: FamilyMember = {
      id: `fm_${Date.now()}`,
      name: newMemberName.trim(),
      role: newMemberRole,
      avatarColor: newMemberColor
    };

    const nextData = {
      ...data,
      familyMembers: [...familyMembers, newFm]
    };
    saveAppData(nextData);
    onDataChange(nextData);
    
    setNewMemberName('');
    setNewMemberColor('bg-purple-500');
  };

  // Delete Family Member
  const handleDeleteFamilyMember = (id: string) => {
    if (familyMembers.length <= 1) {
      alert('Phải giữ lại ít nhất một thành viên trong gia đình.');
      return;
    }
    const updatedFm = familyMembers.filter(fm => fm.id !== id);
    const nextData = { ...data, familyMembers: updatedFm };
    saveAppData(nextData);
    onDataChange(nextData);
  };

  // PIN security controller
  const handleTogglePin = () => {
    if (settings.isPinEnabled) {
      // Turn off PIN
      const updatedSettings: AppSettings = { ...settings, isPinEnabled: false, pinCode: undefined };
      const nextData = { ...data, settings: updatedSettings };
      saveAppData(nextData);
      onDataChange(nextData);
      alert('Đã tắt khóa mã PIN.');
    } else {
      // Turn on PIN -> open pin screen
      setPinSetupOpen(true);
    }
  };

  const handleSetPinSuccess = (newPin: string) => {
    const updatedSettings: AppSettings = { ...settings, isPinEnabled: true, pinCode: newPin };
    const nextData = { ...data, settings: updatedSettings };
    saveAppData(nextData);
    onDataChange(nextData);
    setPinSetupOpen(false);
    alert('Đã kích hoạt mã PIN thành công!');
  };

  // Full Database backup export
  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `so_thiep_moi_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export full ZIP containing system data + CSV reports (For Infinity)
  const handleExportZIP = async () => {
    try {
      const zip = new JSZip();
      
      // 1. Raw AppData JSON
      const jsonContent = JSON.stringify(data, null, 2);
      zip.file("du_lieu_he_thong.json", jsonContent);

      // 2. CSV for Invitations
      const invitationsCsv = exportToCSV('invitations');
      zip.file("danh_sach_thiep_moi.csv", "\uFEFF" + invitationsCsv);

      // 3. CSV for Transactions
      const transactionsCsv = exportToCSV('transactions');
      zip.file("giao_dich_tien_mung.csv", "\uFEFF" + transactionsCsv);

      // 4. CSV for Contacts
      const contactsCsv = exportToCSV('contacts');
      zip.file("danh_ba_lien_he.csv", "\uFEFF" + contactsCsv);

      // 5. Readme guide
      const readmeText = `
BÁO CÁO SAO LƯU SỔ THIỆP MỜI & TIỀN MỪNG GIA ĐÌNH
===================================================
Thời gian xuất bản: ${new Date().toLocaleString('vi-VN')}
Ứng dụng tương thích: Sổ Thiệp Mời - Bản NotebookLM
Cung cấp định dạng ZIP thích hợp cho lưu trữ ngoại tuyến và Infinity.

Tệp tin đính kèm gồm có:
1. du_lieu_he_thong.json: Dùng để khôi phục nhanh hệ thống trong phần Cài đặt
2. danh_sach_thiep_moi.csv: Danh sách tất cả thiệp mời sự kiện
3. giao_dich_tien_mung.csv: Lịch sử nhận và đi tiền mừng sự kiện
4. danh_ba_lien_he.csv: Danh bạ thông tin người thân, bạn bè, đồng nghiệp

Trân trọng cảm ơn bạn đã sử dụng Sổ Thiệp Mời!
      `.trim();
      zip.file("HUONG_DAN_KHOI_PHUC.txt", readmeText);

      // Generate the zip file as a blob
      const content = await zip.generateAsync({ type: "blob" });
      
      // Trigger download
      const downloadAnchor = document.createElement('a');
      const url = URL.createObjectURL(content);
      downloadAnchor.setAttribute("href", url);
      downloadAnchor.setAttribute("download", `so_thiep_moi_infinity_${new Date().toISOString().split('T')[0]}.zip`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Lỗi khi nén xuất file ZIP: " + error);
    }
  };

  // Full Database restore import
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.contacts && parsed.invitations && parsed.transactions) {
            saveAppData(parsed);
            onDataChange(parsed);
            alert('Khôi phục dữ liệu sao lưu thành công!');
          } else {
            alert('File khôi phục không đúng định dạng Sổ Thiệp Mời.');
          }
        } catch (err) {
          alert('Lỗi khi khôi phục dữ liệu: ' + err);
        }
      };
      reader.readAsText(file);
    }
  };

  // EXCEL / CSV export trigger
  const handleExportCSV = (type: 'invitations' | 'transactions' | 'contacts') => {
    const csvContent = exportToCSV(type);
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const downloadAnchor = document.createElement('a');
    
    // Create a Blob with UTF-8 BOM to make Excel read Vietnamese correctly
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `danh_sach_${type}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // CSV Contacts importer
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const result = importContactsFromCSV(text);
        if (result.successCount > 0) {
          alert(`Đã nhập thành công ${result.successCount} danh bạ từ file CSV!`);
          onDataChange(loadAppData()); // reload state
        } else {
          alert(`Không nhập được danh bạ nào. Lỗi: ${result.errors.join(', ')}`);
        }
      };
      reader.readAsText(file);
    }
  };

  // Clipboard sharing message builder
  const handleShareClipboard = () => {
    const totalGiven = transactions.filter(t => t.transactionType === 'given').reduce((sum, t) => sum + t.amount, 0);
    const totalReceived = transactions.filter(t => t.transactionType === 'received').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalReceived - totalGiven;

    const shareText = `
📊 BÁO CÁO NHANH - SỔ THIỆP MỜI
----------------------------------
Thu chi tiền mừng tính đến: ${new Date().toLocaleDateString('vi-VN')}
- Tổng tiền đã mừng (Chi): ${formatVND(totalGiven)}
- Tổng tiền đã nhận (Thu): ${formatVND(totalReceived)}
- Cán cân tích lũy: ${netBalance >= 0 ? '+' : ''}${formatVND(netBalance)}
- Số thiệp mời sắp tới cần chuẩn bị: ${invitations.filter(i => i.status !== 'completed').length} đám.

Quản lý tiền mừng chu đáo với ứng dụng Sổ Thiệp Mời.
    `.trim();

    navigator.clipboard.writeText(shareText).then(() => {
      alert('Đã sao chép báo cáo thống kê vào bộ nhớ tạm! Bạn có thể dán để gửi qua Zalo, Messenger hoặc Email.');
    }).catch(err => {
      alert('Không thể sao chép tự động: ' + err);
    });
  };

  // Print PDF Layout Generator
  const handlePrintPDF = () => {
    const totalGiven = transactions.filter(t => t.transactionType === 'given').reduce((sum, t) => sum + t.amount, 0);
    const totalReceived = transactions.filter(t => t.transactionType === 'received').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalReceived - totalGiven;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Build a clean, styled HTML report
    const html = `
      <html>
        <head>
          <title>Báo cáo Sổ Thiệp Mời - PDF</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; padding: 40px; line-height: 1.5; }
            h1 { text-align: center; color: #e11d48; margin-bottom: 5px; }
            p.subtitle { text-align: center; color: #666; margin-top: 0; font-size: 14px; margin-bottom: 30px; }
            .stats-box { display: flex; justify-content: space-between; background: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 30px; }
            .stat-card { text-align: center; flex: 1; }
            .stat-card h3 { margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; }
            .stat-card p { margin: 5px 0 0 0; font-size: 20px; font-weight: bold; }
            .balance-plus { color: #10b981; }
            .balance-minus { color: #ef4444; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: bold; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <h1>SỔ THIỆP MỜI - BÁO CÁO TIỀN MỪNG</h1>
          <p className="subtitle">Ngày xuất bản: ${new Date().toLocaleDateString('vi-VN')} | Đơn vị: Việt Nam Đồng (VNĐ)</p>
          
          <div class="stats-box">
            <div class="stat-card">
              <h3>Tổng tiền đã đi mừng</h3>
              <p class="balance-minus">${formatVND(totalGiven)}</p>
            </div>
            <div class="stat-card">
              <h3>Tổng tiền đã nhận</h3>
              <p class="balance-plus">${formatVND(totalReceived)}</p>
            </div>
            <div class="stat-card">
              <h3>Chênh lệch chốt sổ</h3>
              <p class="${netBalance >= 0 ? 'balance-plus' : 'balance-minus'}">${formatVND(netBalance)}</p>
            </div>
          </div>

          <h2>1. Danh sách các sự kiện đi mừng gần đây</h2>
          <table>
            <thead>
              <tr>
                <th>Người nhận</th>
                <th>Sự kiện</th>
                <th>Ngày đi</th>
                <th>Hình thức</th>
                <th>Số tiền</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.filter(t => t.transactionType === 'given').map(t => {
                const contact = contacts.find(c => c.id === t.contactId);
                return `
                  <tr>
                    <td><strong>${contact?.fullName || 'Không rõ'}</strong></td>
                    <td>${t.note}</td>
                    <td>${formatDateVN(t.transactionDate)}</td>
                    <td>${t.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}</td>
                    <td><strong>${formatVND(t.amount)}</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            Báo cáo được trích xuất từ hệ thống quản lý gia đình Sổ Thiệp Mời.
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 pb-20 select-none">
      {/* Settings PIN Lock triggers */}
      {pinSetupOpen && (
        <PinLockScreen
          correctPin=""
          isSettingUp={true}
          onSetPin={handleSetPinSuccess}
          onCancel={() => setPinSetupOpen(false)}
          onSuccess={() => setPinSetupOpen(false)}
        />
      )}

      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mt-1">
        <Settings className="w-5 h-5 text-slate-500" />
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Cấu Hình Ứng Dụng</h2>
      </div>

      {/* THEME SELECTOR & PIN LOCK */}
      <div className="bg-teal-50/50 dark:bg-teal-950/20 p-6 rounded-2xl border border-teal-200/50 dark:border-teal-900/30 shadow-xs space-y-4 animate-in fade-in duration-300">
        <h3 className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">Hệ thống & Bảo mật</h3>
        
        {/* Theme select */}
        <div className="flex justify-between items-center text-xs">
          <div>
            <strong className="text-slate-700 dark:text-slate-300 block text-sm font-bold">Giao diện màu sắc</strong>
            <span className="text-slate-450 block mt-0.5 font-semibold">Lựa chọn tông màu sáng tối</span>
          </div>

          <div className="flex gap-1.5 p-1 bg-white/60 dark:bg-teal-950/45 border border-teal-200/40 dark:border-teal-900/40 rounded-xl">
            <button
              onClick={() => handleThemeChange('light')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer text-[11px] font-bold ${
                settings.theme === 'light' ? 'bg-teal-100/90 dark:bg-teal-900/60 text-teal-950 dark:text-teal-50 shadow-xs' : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Chế độ Sáng"
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Sáng</span>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer text-[11px] font-bold ${
                settings.theme === 'dark' ? 'bg-teal-100/90 dark:bg-teal-900/60 text-teal-950 dark:text-teal-50 shadow-xs' : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Chế độ Tối"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Tối</span>
            </button>
            <button
              onClick={() => handleThemeChange('system')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer text-[11px] font-bold ${
                settings.theme === 'system' || !settings.theme ? 'bg-teal-100/90 dark:bg-teal-900/60 text-teal-950 dark:text-teal-50 shadow-xs' : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Theo Hệ thống"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Tự động</span>
            </button>
          </div>
        </div>

        {/* PIN lock */}
        <div className="flex justify-between items-center text-xs pt-4 border-t border-teal-200/30 dark:border-teal-900/20">
          <div>
            <strong className="text-slate-700 dark:text-slate-300 block text-sm font-bold">Khóa bảo mật ứng dụng (PIN)</strong>
            <span className="text-slate-450 block mt-0.5 font-semibold">Nhập mã PIN khi khởi động sổ thiệp</span>
          </div>

          <button
            onClick={handleTogglePin}
            className={`py-2 px-4 rounded-xl font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer text-xs ${
              settings.isPinEnabled
                ? 'bg-teal-200/60 text-teal-900 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-300/40'
                : 'bg-white/50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300 border border-slate-200/40 dark:border-slate-700/40'
            }`}
          >
            {settings.isPinEnabled ? (
              <>
                <Lock className="w-4 h-4" /> Đã bật (Tắt)
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" /> Đang tắt (Bật)
              </>
            )}
          </button>
        </div>
      </div>

      {/* FAMILY MODE SETTINGS */}
      <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-6 rounded-2xl border border-indigo-200/50 dark:border-indigo-900/30 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-500" />
            Chế độ gia đình (Đồng quản lý)
          </h3>
          
          {/* Toggle family mode */}
          <button
            onClick={handleToggleFamilyMode}
            className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer border shadow-xs ${
              settings.familyModeEnabled
                ? 'bg-indigo-200/60 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300/45'
                : 'bg-white/50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200/40 dark:border-slate-700/40'
            }`}
          >
            {settings.familyModeEnabled ? 'KÍCH HOẠT' : 'CHƯA BẬT'}
          </button>
        </div>

        {settings.familyModeEnabled && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-400 font-semibold">
              Thiết lập các thành viên gia đình để ghi nhận quỹ tiền mừng riêng rẽ (ví dụ: Quỹ chồng, Quỹ vợ, v.v.).
            </p>

            {/* List members */}
            <div className="space-y-2">
              {familyMembers.map((fm) => (
                <div key={fm.id} className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-8 h-8 rounded-full ${fm.avatarColor} text-white flex items-center justify-center font-bold shadow-xs`}>
                      {fm.name[0]}
                    </span>
                    <div>
                      <strong className="text-slate-700 dark:text-slate-200 block text-sm font-extrabold">{fm.name}</strong>
                      <span className="text-[10px] text-slate-400 font-semibold">Vai trò: {fm.role === 'husband' ? 'Chồng' : fm.role === 'wife' ? 'Vợ' : fm.role === 'parent' ? 'Bố mẹ' : 'Khác'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteFamilyMember(fm.id)}
                    className="p-1.5 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/40 text-rose-500 rounded-lg cursor-pointer transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Form Add family member */}
            <div className="p-4.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
              <strong className="text-slate-600 dark:text-slate-300 block font-bold text-xs">Thêm thành viên mới</strong>
              
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Họ tên thành viên (Ví dụ: Chị cả)"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-250 focus:outline-hidden focus:border-rose-500 transition-all"
                />

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Vai trò</label>
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value as any)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-250 focus:outline-hidden focus:border-rose-500 transition-all"
                    >
                      <option value="husband">Chồng</option>
                      <option value="wife">Vợ</option>
                      <option value="parent">Bố mẹ</option>
                      <option value="sibling">Anh chị em</option>
                      <option value="other">Thành viên khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Màu đại diện</label>
                    <select
                      value={newMemberColor}
                      onChange={(e) => setNewMemberColor(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-250 focus:outline-hidden focus:border-rose-500 transition-all"
                    >
                      <option value="bg-purple-500">Tím mộng mơ</option>
                      <option value="bg-orange-500">Cam nhiệt huyết</option>
                      <option value="bg-emerald-500">Xanh lá tài lộc</option>
                      <option value="bg-blue-500">Xanh dương lịch lãm</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddFamilyMember}
                  className="w-full py-3 bg-rose-500 text-white font-black rounded-full hover:bg-rose-600 transition-all cursor-pointer text-xs"
                >
                  Thêm thành viên
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EXPORTS & DATA MANAGEMENT */}
      <div className="bg-sky-50/50 dark:bg-sky-950/20 p-6 rounded-2xl border border-sky-200/50 dark:border-sky-900/30 shadow-xs space-y-4 animate-in fade-in duration-300">
        <h3 className="text-xs font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-sky-500" />
          Nhập xuất & Lưu trữ dữ liệu
        </h3>

        <div className="space-y-3 text-xs">
          {/* CSV Download buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleExportCSV('invitations')}
              className="p-3.5 bg-white/60 dark:bg-sky-950/40 hover:bg-sky-100/60 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-sky-100 dark:border-sky-900/40 rounded-xl font-extrabold flex items-center justify-center gap-1.5 cursor-pointer text-center shadow-xs text-xs"
            >
              <Download className="w-4 h-4 text-emerald-500" /> Xuất Excel Thiệp mời
            </button>
            <button
              onClick={() => handleExportCSV('transactions')}
              className="p-3.5 bg-white/60 dark:bg-sky-950/40 hover:bg-sky-100/60 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-sky-100 dark:border-sky-900/40 rounded-xl font-extrabold flex items-center justify-center gap-1.5 cursor-pointer text-center shadow-xs text-xs"
            >
              <Download className="w-4 h-4 text-rose-500" /> Xuất Excel Giao dịch
            </button>
          </div>

          {/* Import Contacts CSV */}
          <div className="pt-1">
            <label className="p-4 w-full bg-white/40 dark:bg-sky-950/40 hover:bg-white/60 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-dashed border-sky-200/60 dark:border-sky-900/50 rounded-xl font-black flex items-center justify-center gap-2 cursor-pointer text-center shadow-xs text-xs">
              <Upload className="w-4 h-4 text-indigo-500" /> Nhập danh bạ từ file CSV/Excel
              <input
                type="file"
                accept=".csv"
                ref={csvInputRef}
                onChange={handleImportCSV}
                className="hidden"
              />
            </label>
            <span className="text-[10px] text-slate-455 block mt-2 px-1 font-semibold">
              • Chấp nhận file CSV chứa cột "Họ tên", "Số điện thoại", "Địa chỉ", "Mối quan hệ" để thêm hàng loạt.
            </span>
          </div>

          {/* PDF Report & Printer */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handlePrintPDF}
              className="p-3.5 bg-sky-900 dark:bg-sky-100 text-white dark:text-sky-900 hover:opacity-90 rounded-full font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-xs transition-all"
            >
              <FileText className="w-4 h-4 text-amber-500" /> Xuất báo cáo PDF / In sổ
            </button>
            <button
              type="button"
              onClick={handleShareClipboard}
              className="p-3.5 bg-amber-700 text-white hover:bg-amber-800 rounded-full font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-xs transition-all"
            >
              <Share2 className="w-4 h-4" /> Chia sẻ Zalo / SMS
            </button>
          </div>

          {/* Full Database Backup & Restore JSON */}
          <div className="pt-4 border-t border-sky-200/40 dark:border-sky-900/30 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex-1 py-3 px-3 bg-white/50 dark:bg-sky-950/30 text-slate-700 dark:text-slate-300 hover:bg-sky-100/40 dark:hover:bg-slate-750 font-bold rounded-full flex items-center justify-center gap-1.5 cursor-pointer text-xs transition-all border border-sky-200/30 dark:border-sky-900/30"
            >
              <Download className="w-3.5 h-3.5" /> Sao lưu JSON
            </button>

            <button
              type="button"
              onClick={handleExportZIP}
              className="flex-1 py-3 px-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-full flex items-center justify-center gap-1.5 cursor-pointer text-xs transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Xuất file ZIP (Infinity)
            </button>

            <label className="flex-1 py-3 px-3 bg-white/50 dark:bg-sky-950/30 text-slate-700 dark:text-slate-300 hover:bg-sky-100/40 dark:hover:bg-slate-750 font-bold rounded-full flex items-center justify-center gap-1.5 cursor-pointer text-center text-xs transition-all border border-sky-200/30 dark:border-sky-900/30">
              <Upload className="w-3.5 h-3.5" /> Khôi phục JSON
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* RESET APP DATA */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 p-6 rounded-2xl border border-rose-200/50 dark:border-rose-900/30 shadow-xs space-y-4 animate-in fade-in duration-300">
        <h3 className="text-xs font-black text-rose-600 dark:text-rose-450 uppercase tracking-widest flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4" />
          Khôi phục cài đặt gốc & Xóa sạch dữ liệu
        </h3>

        <div className="space-y-3 text-xs">
          <p className="text-slate-450 dark:text-slate-400 font-semibold leading-relaxed">
            Hành động này sẽ xóa vĩnh viễn toàn bộ danh bạ, thiệp mời, lịch sử tiền mừng, lời nhắc và mã PIN bảo mật của bạn. Ứng dụng sẽ được đặt lại về trạng thái trống ban đầu để bạn thiết lập lại từ đầu.
          </p>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-3 bg-rose-50 dark:bg-rose-950/10 hover:bg-rose-100 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-black rounded-full border border-rose-200/40 dark:border-rose-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs shadow-xs"
            >
              <Trash2 className="w-4 h-4" /> Xóa toàn bộ dữ liệu & Bắt đầu lại
            </button>
          ) : (
            <div className="p-4 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200/40 dark:border-rose-900/40 rounded-2xl space-y-4 animate-in fade-in duration-300">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-rose-100 dark:bg-rose-950/40 rounded-xl text-rose-600 dark:text-rose-450 mt-0.5">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <strong className="text-rose-700 dark:text-rose-400 block font-extrabold text-sm">
                    Xác nhận xóa vĩnh viễn?
                  </strong>
                  <span className="text-slate-400 block font-semibold text-[11px] leading-relaxed">
                    Toàn bộ dữ liệu của bạn sẽ bị mất hoàn toàn và KHÔNG THỂ KHÔI PHỤC LẠI. Bạn có chắc chắn muốn thực hiện?
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={resetUnderstand}
                  onChange={(e) => setResetUnderstand(e.target.checked)}
                  className="w-4 h-4 text-rose-600 border-slate-300 dark:border-slate-800 bg-transparent rounded-sm focus:ring-rose-500 cursor-pointer"
                />
                <span className="text-[11px] text-slate-400 font-bold">
                  Tôi hiểu và chấp nhận mất toàn bộ dữ liệu hiện có.
                </span>
              </label>

              <div className="flex gap-2.5">
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    setResetUnderstand(false);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 font-extrabold rounded-full cursor-pointer text-xs transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleResetAllData}
                  disabled={!resetUnderstand}
                  className={`flex-1 py-2.5 text-white font-black rounded-full cursor-pointer text-xs transition-all flex items-center justify-center gap-1.5 ${
                    resetUnderstand 
                      ? 'bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border-none'
                  }`}
                >
                  <Check className="w-4 h-4" /> Đồng ý xóa hết
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
