export type UserRole = 'Admin' | 'Service Advisor';

export interface Brand {
  id: string;
  brand_code: string; // e.g. 'BYD' | 'DENZA'
  brand_name: string; // e.g. 'BYD' | 'DENZA'
  logo_type?: 'byd' | 'denza' | 'custom';
  logo_url?: string;
  service_center_name: string; // e.g. 'BYD SALES & SERVICE CENTER'
  local_company_name?: string; // e.g. 'មិនមែនជាប្រកាសជាចំនាយឬប្រកាសពន្ធ'
  address: string;
  telephone: string;
  email: string;
  document_prefix: string; // e.g. 'BYD' | 'DENZA'
  receipt_prefix: string; // e.g. 'BYD60M' | 'DENZA60M'
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  brand_id: string;
  supported_brand_ids?: string[]; // e.g. ['brand-byd', 'brand-denza']
  is_dual_brand?: boolean;
  branch_code: string; // e.g. '6A', 'CITYMALL', 'SR', 'PP'
  branch_name: string; // e.g. 'Chroy Changva 6A', 'Phnom Penh Flagship', 'Siem Reap Service Center'
  service_center_name?: string;
  address: string;
  telephone: string;
  email: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  brand_id?: string;
  branch_id?: string; // Exactly 1 branch for Service Advisor
  branch: string; // Display name e.g. "BYD 6A" or "DENZA Phnom Penh"
  assigned_brand_ids?: string[]; // Up to 2 brands for Service Advisor
  active_brand_id?: string; // Current active brand context
  status: 'Active' | 'Inactive';
  created_date: string;

  // Default Receipt Profile
  default_brand_id?: string;
  default_branch_id?: string;
  default_sa?: string;
}

export interface FeeItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  sap_no?: string;
  stock_yes_no?: 'YES' | 'NO';
  warranty_yes_no?: 'YES' | 'NO';
  image_url?: string;
  paint_check?: string;
}

export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Converted' | 'Cancelled' | 'Quotation' | 'Pending' | 'Expired';

export interface Quotation {
  id: string;
  quotation_no: string;
  brand_id: string;
  branch_id: string;
  brand_name?: string;
  branch_name?: string;
  customer_name: string;
  phone: string;
  plate_no: string;
  vehicle_model: string;
  color: string;
  vin: string;
  mileage: number;
  battery: string;
  description: string;
  repair_recommendation?: string;
  after_sale?: string;
  address?: string;
  fuel_gauge?: string;
  fee_items: FeeItem[];
  subtotal: number;
  vat: number; // 10%
  total_amount: number;
  status: QuotationStatus;
  created_by: string; // User ID
  created_by_name: string;
  created_date: string;
  remind_date?: string;
  updated_at?: string;
}

export type ReceiptStatus = 'Pending' | 'Completed' | 'Delivered' | 'Cancelled';

export interface CompletionSection {
  technician: string;
  finished_date: string;
  qa: string;
  ass_manager_confirm: string;
  delivery_date: string;
  delivery_person: string;
  accounting: string;
  customer_confirm: string;
}

export interface Receipt {
  id: string;
  receipt_no: string;
  brand_id: string;
  branch_id: string;
  brand_name?: string;
  branch_name?: string;
  quotation_id?: string;
  customer_name: string;
  phone: string;
  plate_no: string;
  battery: string;
  vehicle_model: string;
  color: string;
  mileage: number;
  vin: string;
  buy_time: string;
  description: string;
  fee_items: FeeItem[];
  subtotal: number;
  vat: number; // 10%
  total_amount: number;
  completion?: CompletionSection;
  status: ReceiptStatus;
  created_by: string; // User ID
  created_by_name: string;
  created_date: string;
  remind_date?: string;

  // Master Template Fields
  sa_name?: string;
  in_time?: string;
  out_time?: string;
  estimated_repaired_date?: string;
  is_owner?: boolean;
  is_sender?: boolean;
  warehouse_keeper?: string;
  service_reminder?: string;
  old_parts_action?: 'Take away' | 'Give up';
  repair_confirm_customer?: string;
  updated_at?: string;
}

export interface SystemSettings {
  center_name: string;
  branch_name: string;
  address: string;
  phone: string;
  email: string;
  vat_rate: number; // e.g., 0.10
  currency_symbol: string;
  quotation_prefix: string;
  receipt_prefix: string;
  terms_conditions: string;

  // Header Customization Fields for Receipts & Quotations
  header_logo_type?: 'byd' | 'denza' | 'custom';
  header_logo_url?: string;
  byd_logo_url?: string;
  denza_logo_url?: string;
  receipt_header_english_title?: string;
  receipt_header_khmer_title?: string;
  quotation_header_english_title?: string;
  quotation_header_khmer_title?: string;

  // Quotation Specific Terms & Conditions (4 Points + Bank Details)
  quotation_deposit_term?: string;
  quotation_payment_term?: string;
  quotation_bank_details?: string;
  quotation_expiration_term?: string;
  quotation_terms?: string;

  // Telegram Bot Settings
  telegram_bot_token?: string;
  telegram_chat_id?: string;
  telegram_reminder_enabled?: boolean;
}

export interface DashboardMetrics {
  totalQuotations: number;
  todayQuotations: number;
  thisMonthQuotations: number;
  totalReceipts: number;
  todayReceipts: number;
  thisMonthReceipts: number;
  totalQuotationAmount: number;
  totalReceiptAmount: number;
}

export interface BrandPerformance {
  brand_id: string;
  brand_name: string;
  quotations: number;
  receipts: number;
  total_amount: number;
}

export interface BranchPerformance {
  brand_name: string;
  branch_id: string;
  branch_name: string;
  quotations: number;
  receipts: number;
  amount: number;
}
