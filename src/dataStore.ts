/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Contact, 
  Invitation, 
  MoneyTransaction, 
  Reminder, 
  FamilyMember, 
  AppSettings,
  EventType,
  RelationshipType,
  InvitationStatus
} from './types';

// Vietnamese Labels
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: 'Đám cưới',
  engagement: 'Đám hỏi / Đính hôn',
  birthday: 'Sinh nhật',
  baby_shower: 'Đầy tháng / Thôi nôi',
  housewarming: 'Tân gia',
  memorial: 'Đám giỗ / Hiếu hỷ',
  other: 'Sự kiện khác'
};

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  family: 'Người thân',
  friend: 'Bạn bè',
  colleague: 'Đồng nghiệp',
  neighbor: 'Hàng xóm',
  partner: 'Đối tác',
  other: 'Mối quan hệ khác'
};

export const STATUS_LABELS: Record<InvitationStatus, string> = {
  pending: 'Chưa xác nhận',
  attending: 'Sẽ tham dự',
  declined: 'Không tham dự',
  completed: 'Đã đi mừng'
};

// Initial Family Members
export const DEFAULT_FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'fm_husband', name: 'Chồng', role: 'husband', avatarColor: 'bg-blue-500' },
  { id: 'fm_wife', name: 'Vợ', role: 'wife', avatarColor: 'bg-rose-500' },
  { id: 'fm_parents', name: 'Bố mẹ', role: 'parent', avatarColor: 'bg-amber-500' },
  { id: 'fm_family', name: 'Cả gia đình', role: 'other', avatarColor: 'bg-emerald-500' }
];

// Initial Mock Contacts
const MOCK_CONTACTS: Contact[] = [
  { id: 'c1', fullName: 'Nguyễn Văn Nam', phone: '0912345678', address: '12 Láng Hạ, Đống Đa, Hà Nội', relationship: 'friend', note: 'Bạn thân thời đại học Bách Khoa' },
  { id: 'c2', fullName: 'Trần Thị Mai', phone: '0987654321', address: 'Tòa nhà Keangnam, Cầu Giấy, Hà Nội', relationship: 'colleague', note: 'Trưởng phòng marketing công ty cũ' },
  { id: 'c3', fullName: 'Lê Hoàng Anh', phone: '0901112223', address: 'Số 45 Ngõ 192 Lê Trọng Tấn, Hà Nội', relationship: 'neighbor', note: 'Hàng xóm tổ dân phố số 5' },
  { id: 'c4', fullName: 'Phạm Minh Đức', phone: '0933445566', address: 'Khu đô thị Vinhomes Ocean Park, Gia Lâm', relationship: 'friend', note: 'Bạn thân cấp 3' },
  { id: 'c5', fullName: 'Bùi Quốc Tuấn', phone: '0944556677', address: '88 Láng Hạ, Đống Đa, Hà Nội', relationship: 'partner', note: 'Đối tác dự án phần mềm' },
  { id: 'c6', fullName: 'Vũ Minh Hương', phone: '0977889900', address: 'Phường Hàng Bông, Hoàn Kiếm, Hà Nội', relationship: 'family', note: 'Chị họ bên ngoại' },
  { id: 'c7', fullName: 'Nguyễn Thị Lan', phone: '0966554433', address: '15 Tạ Quang Bửu, Hai Bà Trưng, Hà Nội', relationship: 'friend', note: 'Bạn đại học của Vợ' },
  { id: 'c8', fullName: 'Trịnh Xuân Bách', phone: '0911223344', address: 'Chung cư Goldmark City, Từ Liêm, Hà Nội', relationship: 'colleague', note: 'Đồng nghiệp cùng nhóm' },
  { id: 'c9', fullName: 'Đặng Hồng Nhung', phone: '0922334455', address: 'Phố Huế, Hai Bà Trưng, Hà Nội', relationship: 'family', note: 'Em họ bên nội' },
  { id: 'c10', fullName: 'Hoàng Văn Thắng', phone: '0955667788', address: 'Văn Phú, Hà Đông, Hà Nội', relationship: 'partner', note: 'Đại lý phân phối vật liệu' }
];

// Initial Mock Invitations
const MOCK_INVITATIONS: Invitation[] = [
  {
    id: 'inv1',
    contactId: 'c1',
    eventType: 'wedding',
    eventName: 'Nam & Thảo (Đám cưới Nam)',
    eventDate: '2026-07-15',
    eventTime: '11:00',
    location: 'Nhà hàng tiệc cưới Trống Đồng Palace, 22 Thành Công, Ba Đình',
    mapUrl: 'https://maps.google.com/?q=Trống+Đồng+Palace+Thành+Công',
    expectedAmount: 500000,
    attendeeCount: 1,
    status: 'attending',
    note: 'Mừng phong bì 500k. Có xe cơ quan đưa đón.',
    recipientFamilyMemberId: 'fm_husband',
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-07-01T10:00:00Z'
  },
  {
    id: 'inv2',
    contactId: 'c2',
    eventType: 'wedding',
    eventName: 'Mai & Đức',
    eventDate: '2026-07-18',
    eventTime: '17:30',
    location: 'Khách sạn Melia, 44B Lý Thường Kiệt, Hoàn Kiếm',
    mapUrl: 'https://maps.google.com/?q=Melia+Hotel+Hanoi',
    expectedAmount: 1000000,
    attendeeCount: 2,
    status: 'attending',
    note: 'Đi cùng vợ. Sếp cũ nên mừng 1 triệu.',
    recipientFamilyMemberId: 'fm_family',
    createdAt: '2026-07-02T11:00:00Z',
    updatedAt: '2026-07-02T11:00:00Z'
  },
  {
    id: 'inv3',
    contactId: 'c3',
    eventType: 'housewarming',
    eventName: 'Tân gia nhà anh Lê Hoàng Anh',
    eventDate: '2026-07-20',
    eventTime: '18:00',
    location: 'Số 45 Ngõ 192 Lê Trọng Tấn, Thanh Xuân, Hà Nội',
    mapUrl: '',
    expectedAmount: 500000,
    attendeeCount: 1,
    status: 'pending',
    note: 'Mừng tân gia nhà hàng xóm mới chuyển đến',
    recipientFamilyMemberId: 'fm_husband',
    createdAt: '2026-07-03T09:00:00Z',
    updatedAt: '2026-07-03T09:00:00Z'
  },
  {
    id: 'inv4',
    contactId: 'c4',
    eventType: 'birthday',
    eventName: 'Sinh nhật con Phạm Minh Đức (Bé Sushi)',
    eventDate: '2026-07-12',
    eventTime: '19:00',
    location: 'Quán ăn ngon, Vinhomes Ocean Park, Gia Lâm',
    mapUrl: '',
    expectedAmount: 500000,
    attendeeCount: 1,
    status: 'completed', // đã đi mừng
    note: 'Đã mua đồ chơi cho bé và mừng phong bì 500k',
    recipientFamilyMemberId: 'fm_husband',
    createdAt: '2026-07-04T15:00:00Z',
    updatedAt: '2026-07-04T15:00:00Z'
  },
  {
    id: 'inv5',
    contactId: 'c5',
    eventType: 'baby_shower',
    eventName: 'Đầy tháng bé Bon (Con anh Tuấn)',
    eventDate: '2026-07-25',
    eventTime: '11:30',
    location: 'Nhà hàng Sen Tây Hồ, Tây Hồ, Hà Nội',
    mapUrl: 'https://maps.google.com/?q=Sen+Tây+Hồ',
    expectedAmount: 500000,
    attendeeCount: 1,
    status: 'pending',
    note: 'Anh Tuấn đối tác lớn, chuẩn bị quà hoặc phong bì chu đáo.',
    recipientFamilyMemberId: 'fm_husband',
    createdAt: '2026-07-05T08:30:00Z',
    updatedAt: '2026-07-05T08:30:00Z'
  },
  {
    id: 'inv6',
    contactId: 'c8',
    eventType: 'housewarming',
    eventName: 'Tân gia căn hộ chung cư anh Bách',
    eventDate: '2026-07-30',
    eventTime: '10:30',
    location: 'Căn hộ 1205, Tòa R3 Goldmark City, Cầu Giấy',
    mapUrl: '',
    expectedAmount: 500000,
    attendeeCount: 1,
    status: 'pending',
    note: 'Mua tặng bộ ấm chén trà hoặc phong bì 500k',
    recipientFamilyMemberId: 'fm_husband',
    createdAt: '2026-07-06T10:00:00Z',
    updatedAt: '2026-07-06T10:00:00Z'
  }
];

// Initial Mock Transactions
const MOCK_TRANSACTIONS: MoneyTransaction[] = [
  // 1. Transaction cho sự kiện đã qua (inv4)
  {
    id: 't1',
    contactId: 'c4',
    invitationId: 'inv4',
    transactionType: 'given',
    amount: 500000,
    paymentMethod: 'cash',
    transactionDate: '2026-07-12',
    familyMemberId: 'fm_husband',
    fundType: 'personal',
    note: 'Mừng sinh nhật bé Sushi con bạn Đức',
    createdAt: '2026-07-12T12:00:00Z'
  },
  // 2. Một sự kiện khác đã mừng trong quá khứ (không có thiệp mới)
  {
    id: 't2',
    contactId: 'c9',
    transactionType: 'given',
    amount: 500000,
    paymentMethod: 'transfer',
    transactionDate: '2026-07-10',
    familyMemberId: 'fm_wife',
    fundType: 'personal',
    note: 'Chuyển khoản mừng đám hỏi em Hồng Nhung',
    createdAt: '2026-07-10T14:30:00Z'
  },
  // 3. Người khác mừng cho mình trong các sự kiện trước (Received)
  {
    id: 't3',
    contactId: 'c7', // Lan mừng cưới mình
    transactionType: 'received',
    amount: 1000000,
    paymentMethod: 'cash',
    transactionDate: '2025-11-20', // Đám cưới của mình cuối năm ngoái
    familyMemberId: 'fm_wife',
    fundType: 'family',
    note: 'Lan mừng đám cưới hai vợ chồng tại trung tâm tiệc cưới',
    createdAt: '2025-11-21T02:00:00Z'
  },
  {
    id: 't4',
    contactId: 'c10', // Thắng đối tác mừng thôi nôi con mình
    transactionType: 'received',
    amount: 1000000,
    paymentMethod: 'transfer',
    transactionDate: '2026-06-05',
    familyMemberId: 'fm_husband',
    fundType: 'family',
    note: 'Anh Thắng mừng đầy tháng bé Tin con mình',
    createdAt: '2026-06-05T09:15:00Z'
  },
  {
    id: 't5',
    contactId: 'c6', // Chị họ Hương mừng cưới
    transactionType: 'received',
    amount: 2000000,
    paymentMethod: 'cash',
    transactionDate: '2025-11-20',
    familyMemberId: 'fm_husband',
    fundType: 'family',
    note: 'Chị Hương mừng cưới vàng 1 chỉ hoặc tương đương phong bì 2tr',
    createdAt: '2025-11-21T03:00:00Z'
  }
];

// Initial Mock Reminders
const MOCK_REMINDERS: Reminder[] = [
  { id: 'rem1', invitationId: 'inv1', reminderTimeValue: 1, reminderTimeUnit: 'days', isCompleted: false, note: 'Chuẩn bị phong bì đi cưới Nam' },
  { id: 'rem2', invitationId: 'inv1', reminderTimeValue: 3, reminderTimeUnit: 'hours', isCompleted: false, note: 'Nhắc xuất phát đi đám cưới Nam' },
  { id: 'rem3', invitationId: 'inv2', reminderTimeValue: 1, reminderTimeUnit: 'days', isCompleted: false, note: 'Rút tiền mặt mừng đám cưới sếp cũ Mai' },
  { id: 'rem4', invitationId: 'inv3', reminderTimeValue: 3, reminderTimeUnit: 'days', isCompleted: false, note: 'Xác nhận xem có tham dự được tân gia anh Hoàng Anh không' }
];

export interface AppData {
  contacts: Contact[];
  invitations: Invitation[];
  transactions: MoneyTransaction[];
  reminders: Reminder[];
  familyMembers: FamilyMember[];
  settings: AppSettings;
}

const STORAGE_KEY = 'so_thiep_moi_data_v1';

// Load Data from LocalStorage
export function loadAppData(): AppData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Ensure all arrays are present
      if (parsed.contacts && parsed.invitations && parsed.transactions) {
        return parsed as AppData;
      }
    } catch (e) {
      console.error('Error parsing app data from local storage, resetting to defaults.', e);
    }
  }

  // Fallback / Initial Setup
  const initialData: AppData = {
    contacts: MOCK_CONTACTS,
    invitations: MOCK_INVITATIONS,
    transactions: MOCK_TRANSACTIONS,
    reminders: MOCK_REMINDERS,
    familyMembers: DEFAULT_FAMILY_MEMBERS,
    settings: {
      theme: 'light',
      isPinEnabled: false,
      familyModeEnabled: true,
      selectedFamilyMemberId: 'fm_husband'
    }
  };
  saveAppData(initialData);
  return initialData;
}

// Save Data to LocalStorage
export function saveAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// SMART SEARCH & SUGGESTION ENGINE

/**
 * Find contact by name or phone, or create a temporary one
 */
export function getOrCreateContact(name: string, phone: string = '', relationship: RelationshipType = 'other'): { contact: Contact; isNew: boolean } {
  const data = loadAppData();
  const trimmedName = name.trim().toLowerCase();
  
  const existing = data.contacts.find(c => 
    c.fullName.toLowerCase() === trimmedName || 
    (phone && c.phone === phone)
  );

  if (existing) {
    return { contact: existing, isNew: false };
  }

  const newContact: Contact = {
    id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    fullName: name.trim(),
    phone: phone.trim(),
    address: '',
    relationship,
    note: 'Tự động tạo khi thêm thiệp'
  };

  data.contacts.push(newContact);
  saveAppData(data);
  return { contact: newContact, isNew: true };
}

/**
 * Suggest a wedding/gift amount based on past relationship history and guidelines
 */
export function getSuggestedAmount(
  contactId: string, 
  eventType: EventType, 
  attendeeCount: number = 1
): {
  suggested: number;
  reason: string;
  history: { received: number; given: number; lastDate?: string } | null;
} {
  const data = loadAppData();
  
  // Calculate historical interactions
  const contactTransactions = data.transactions.filter(t => t.contactId === contactId);
  const receivedList = contactTransactions.filter(t => t.transactionType === 'received');
  const givenList = contactTransactions.filter(t => t.transactionType === 'given');

  const totalReceived = receivedList.reduce((sum, t) => sum + t.amount, 0);
  const totalGiven = givenList.reduce((sum, t) => sum + t.amount, 0);

  // Find latest interaction date
  let lastDate: string | undefined = undefined;
  if (contactTransactions.length > 0) {
    const dates = contactTransactions.map(t => t.transactionDate).sort();
    lastDate = dates[dates.length - 1];
  }

  const history = contactTransactions.length > 0 ? {
    received: totalReceived,
    given: totalGiven,
    lastDate
  } : null;

  // Contact info
  const contact = data.contacts.find(c => c.id === contactId);
  const rel = contact?.relationship || 'other';

  // Base suggestions in VNĐ based on Vietnamese custom
  let baseAmount = 300000; // Default Standard

  // 1. Adjust by Relationship
  if (rel === 'family') {
    baseAmount = 1000000; // Người thân thường mừng nhiều hơn
  } else if (rel === 'friend' || rel === 'colleague') {
    if (eventType === 'wedding') baseAmount = 500000;
    else baseAmount = 300000;
  } else if (rel === 'partner') {
    baseAmount = 1000000;
  } else {
    baseAmount = 300000;
  }

  // 2. Adjust by Event Type
  if (eventType === 'wedding') {
    baseAmount = Math.max(baseAmount, 500000); // Đám cưới tối thiểu 500k thường lệ ở phố
  } else if (eventType === 'housewarming') {
    baseAmount = Math.max(baseAmount, 500000);
  }

  // 3. Multiplier for Attendees
  const scale = attendeeCount > 1 ? (1 + (attendeeCount - 1) * 0.6) : 1;
  let finalSuggested = baseAmount * scale;

  // Round to nearest 100,000 or 50,000 VND
  finalSuggested = Math.ceil(finalSuggested / 100000) * 100000;

  // 4. Overrule with exact counter-mừng history!
  // Nếu họ từng mừng mình bao nhiêu, mình ít nhất phải mừng lại bấy nhiêu (hoặc nhiều hơn)
  if (receivedList.length > 0) {
    const maxReceivedAmount = Math.max(...receivedList.map(t => t.amount));
    // Nếu đi nhiều người hơn, phải nhân lên, còn đi 1 người thì ít nhất bằng khoản họ mừng mình
    const minMungLai = maxReceivedAmount * (attendeeCount > 1 ? 1.5 : 1);
    if (minMungLai > finalSuggested) {
      return {
        suggested: Math.ceil(minMungLai / 100000) * 100000,
        reason: `Họ từng mừng bạn ${formatVND(maxReceivedAmount)}. Bạn nên mừng lại tương đương hoặc nhiều hơn dựa trên số người đi cùng.`,
        history
      };
    } else {
      return {
        suggested: finalSuggested,
        reason: `Họ từng mừng bạn ${formatVND(maxReceivedAmount)}. Mức gợi ý ${formatVND(finalSuggested)} là phù hợp để gắn kết tình cảm.`,
        history
      };
    }
  }

  // If no history, suggest based on relationship and events
  let reason = `Mức mừng chuẩn cho ${RELATIONSHIP_LABELS[rel].toLowerCase()} đi ${EVENT_TYPE_LABELS[eventType].toLowerCase()} (${attendeeCount} người).`;
  return {
    suggested: finalSuggested,
    reason,
    history
  };
}

// CURRENCY FORMATTER
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
    .format(amount)
    .replace('₫', '₫');
}

// DATE FORMATTER (DD/MM/YYYY)
export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// EXPORT TO CSV
export function exportToCSV(type: 'invitations' | 'transactions' | 'contacts'): string {
  const data = loadAppData();
  let csvContent = '\uFEFF'; // UTF-8 BOM for Excel Vietnamese characters display
  
  if (type === 'invitations') {
    csvContent += 'ID,Người mời,Loại sự kiện,Tên sự kiện,Ngày diễn ra,Giờ,Địa điểm,Tiền dự kiến,Trạng thái,Ghi chú\n';
    data.invitations.forEach(inv => {
      const contact = data.contacts.find(c => c.id === inv.contactId);
      const row = [
        inv.id,
        contact?.fullName || 'Không rõ',
        EVENT_TYPE_LABELS[inv.eventType],
        inv.eventName,
        inv.eventDate,
        inv.eventTime,
        inv.location.replace(/"/g, '""'),
        inv.expectedAmount,
        STATUS_LABELS[inv.status],
        inv.note.replace(/"/g, '""')
      ].map(val => `"${val}"`).join(',');
      csvContent += row + '\n';
    });
  } else if (type === 'transactions') {
    csvContent += 'ID,Người liên quan,Loại giao dịch,Số tiền,Hình thức,Ngày giao dịch,Người đại diện,Quỹ,Ghi chú\n';
    data.transactions.forEach(t => {
      const contact = data.contacts.find(c => c.id === t.contactId);
      const familyMember = data.familyMembers.find(f => f.id === t.familyMemberId);
      const row = [
        t.id,
        contact?.fullName || 'Không rõ',
        t.transactionType === 'received' ? 'Nhận mừng' : 'Đi mừng',
        t.amount,
        t.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản',
        t.transactionDate,
        familyMember?.name || 'Không rõ',
        t.fundType === 'personal' ? 'Cá nhân' : 'Gia đình',
        t.note.replace(/"/g, '""')
      ].map(val => `"${val}"`).join(',');
      csvContent += row + '\n';
    });
  } else if (type === 'contacts') {
    csvContent += 'ID,Họ và tên,Số điện thoại,Địa chỉ,Mối quan hệ,Ghi chú\n';
    data.contacts.forEach(c => {
      const row = [
        c.id,
        c.fullName,
        c.phone,
        c.address.replace(/"/g, '""'),
        RELATIONSHIP_LABELS[c.relationship],
        c.note.replace(/"/g, '""')
      ].map(val => `"${val}"`).join(',');
      csvContent += row + '\n';
    });
  }

  return csvContent;
}

// IMPORT FROM CSV
export function importContactsFromCSV(csvText: string): { successCount: number; errors: string[] } {
  const data = loadAppData();
  const lines = csvText.split('\n');
  let successCount = 0;
  const errors: string[] = [];

  if (lines.length <= 1) {
    return { successCount: 0, errors: ['File CSV trống rỗng'] };
  }

  // Detect column indices based on header
  const headers = lines[0].replace('\uFEFF', '').split(',').map(h => h.trim().toLowerCase());
  const nameIdx = headers.findIndex(h => h.includes('tên') || h.includes('name'));
  const phoneIdx = headers.findIndex(h => h.includes('thoại') || h.includes('phone') || h.includes('sdt'));
  const addressIdx = headers.findIndex(h => h.includes('chỉ') || h.includes('address'));
  const relIdx = headers.findIndex(h => h.includes('hệ') || h.includes('relationship'));
  const noteIdx = headers.findIndex(h => h.includes('chú') || h.includes('note'));

  if (nameIdx === -1) {
    return { successCount: 0, errors: ['Không tìm thấy cột Họ tên ("fullName" hoặc "Tên") trong file CSV'] };
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Standard CSV parser parsing quotes
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    const cells = matches ? matches.map(cell => cell.replace(/^"|"$/g, '').trim()) : line.split(',');

    if (cells.length === 0 || !cells[nameIdx]) continue;

    const name = cells[nameIdx];
    const phone = phoneIdx !== -1 && cells[phoneIdx] ? cells[phoneIdx] : '';
    const address = addressIdx !== -1 && cells[addressIdx] ? cells[addressIdx] : '';
    const note = noteIdx !== -1 && cells[noteIdx] ? cells[noteIdx] : '';
    
    // Parse relationship
    let relationship: RelationshipType = 'other';
    if (relIdx !== -1 && cells[relIdx]) {
      const relVal = cells[relIdx].toLowerCase();
      if (relVal.includes('thân') || relVal.includes('family')) relationship = 'family';
      else if (relVal.includes('bạn') || relVal.includes('friend')) relationship = 'friend';
      else if (relVal.includes('nghiệp') || relVal.includes('colleague')) relationship = 'colleague';
      else if (relVal.includes('xóm') || relVal.includes('neighbor')) relationship = 'neighbor';
      else if (relVal.includes('tác') || relVal.includes('partner')) relationship = 'partner';
    }

    // Check duplicate name
    const dup = data.contacts.find(c => c.fullName.toLowerCase() === name.toLowerCase());
    if (dup) {
      continue; // Skip duplicate contacts
    }

    const newContact: Contact = {
      id: `c_csv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      fullName: name,
      phone,
      address,
      relationship,
      note: note || 'Nhập từ file CSV'
    };

    data.contacts.push(newContact);
    successCount++;
  }

  if (successCount > 0) {
    saveAppData(data);
  }

  return { successCount, errors };
}
