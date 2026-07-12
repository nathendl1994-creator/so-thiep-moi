/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EventType = 
  | 'wedding'       // Đám cưới
  | 'engagement'    // Đám hỏi / Đính hôn
  | 'birthday'      // Sinh nhật
  | 'baby_shower'   // Đầy tháng / Thôi nôi
  | 'housewarming'  // Tân gia
  | 'memorial'      // Đám giỗ / Hiếu hỷ
  | 'other';        // Khác

export type RelationshipType =
  | 'family'        // Người thân
  | 'friend'        // Bạn bè
  | 'colleague'     // Đồng nghiệp
  | 'neighbor'      // Hàng xóm
  | 'partner'       // Đối tác
  | 'other';        // Khác

export type InvitationStatus =
  | 'pending'       // Chưa xác nhận
  | 'attending'     // Sẽ tham dự
  | 'declined'      // Không tham dự
  | 'completed';    // Đã đi mừng (đã xong)

export type TransactionType = 'received' | 'given';

export type PaymentMethod = 'cash' | 'transfer';

export type FundType = 'personal' | 'family';

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  relationship: RelationshipType;
  note: string;
}

export interface Invitation {
  id: string;
  contactId: string; // ID of the contact inviting
  eventType: EventType;
  eventName: string; // Tên cô dâu chú rể hoặc chủ sự kiện
  eventDate: string; // YYYY-MM-DD
  eventTime: string; // HH:MM
  location: string;
  mapUrl?: string;
  expectedAmount: number;
  attendeeCount: number;
  status: InvitationStatus;
  invitationImage?: string; // base64 or placeholder
  note: string;
  recipientFamilyMemberId?: string; // Ai là người nhận thiệp (Vợ, chồng, v.v.)
  createdAt: string;
  updatedAt: string;
}

export interface MoneyTransaction {
  id: string;
  contactId: string;
  invitationId?: string; // optional, references invitation
  transactionType: TransactionType; // 'received' (nhận) hoặc 'given' (đi mừng)
  amount: number;
  paymentMethod: PaymentMethod; // 'cash' (tiền mặt) hoặc 'transfer' (chuyển khoản)
  transactionDate: string; // YYYY-MM-DD
  familyMemberId: string; // Ai là người đi mừng / nhận tiền
  fundType: FundType; // Quỹ cá nhân hay quỹ gia đình
  image?: string; // base64 ảnh phong bì hoặc giao dịch chuyển khoản
  note: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  invitationId: string;
  reminderTimeValue: number; // số lượng (ví dụ: 7, 3, 1, 3)
  reminderTimeUnit: 'days' | 'hours'; // ngày hoặc giờ
  isCompleted: boolean;
  note?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: 'husband' | 'wife' | 'parent' | 'sibling' | 'other';
  avatarColor: string; // tailwind color class
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  pinCode?: string; // Mã PIN bảo mật
  isPinEnabled: boolean;
  familyModeEnabled: boolean;
  selectedFamilyMemberId?: string; // Thành viên hoạt động mặc định
}
