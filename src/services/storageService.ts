import type { User, Brand, Branch, Quotation, Receipt, SystemSettings, DashboardMetrics, BranchPerformance } from '../types';

const BRANDS_KEY = 'byd_denza_brands';
const BRANCHES_KEY = 'byd_denza_branches';
const USERS_KEY = 'byd_users';
const QUOTATIONS_KEY = 'byd_quotations';
const RECEIPTS_KEY = 'byd_receipts';
const SETTINGS_KEY = 'byd_settings';
const CURRENT_USER_KEY = 'byd_current_user';

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'brand-byd',
    brand_code: 'BYD',
    brand_name: 'BYD Cambodia',
    logo_type: 'byd',
    logo_url: '',
    service_center_name: 'BYD SALES & SERVICE CENTER',
    local_company_name: 'មិនអាចយកប្រកាសជាចំណាយឬប្រកាសពន្ធ',
    address: 'No. 888 Monivong Blvd, Tonle Bassac, Chamkarmon, Phnom Penh, Cambodia',
    telephone: '+855 23 888 999 / +855 12 999 888',
    email: 'service.byd@automotive.com.kh',
    document_prefix: 'BYD',
    receipt_prefix: 'BYD60M',
    status: 'Active',
    created_at: '2026-01-01',
    updated_at: '2026-01-01'
  },
  {
    id: 'brand-denza',
    brand_code: 'DENZA',
    brand_name: 'DENZA',
    logo_type: 'denza',
    logo_url: '',
    service_center_name: 'DENZA EXECUTIVE SERVICE CENTER',
    local_company_name: 'មជ្ឈមណ្ឌលសេវាកម្មរថយន្តអគ្គិសនីដេនហ្សា',
    address: 'No. 100 Hun Sen Blvd, Chak Angre Krom, Phnom Penh, Cambodia',
    telephone: '+855 23 999 777',
    email: 'care@denza.com.kh',
    document_prefix: 'DENZA',
    receipt_prefix: 'DENZA60M',
    status: 'Active',
    created_at: '2026-01-01',
    updated_at: '2026-01-01'
  }
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'b-byd-6a',
    brand_id: 'brand-byd',
    supported_brand_ids: ['brand-byd', 'brand-denza'],
    is_dual_brand: true,
    branch_code: '6A',
    branch_name: 'BYD Chroy Changva 6A',
    service_center_name: 'BYD & DENZA Dual-Brand Service Center 6A',
    address: 'Lot No. 52, National Road 6A, Chroy Changva, Phnom Penh',
    telephone: '+855 17 555 811',
    email: 'byd.6a@automotive.com.kh',
    status: 'Active',
    created_at: '2026-01-01',
    updated_at: '2026-01-01'
  },
  {
    id: 'b-byd-cm',
    brand_id: 'brand-byd',
    supported_brand_ids: ['brand-byd'],
    is_dual_brand: false,
    branch_code: 'CM',
    branch_name: 'BYD City Mall Service Center',
    service_center_name: 'BYD City Mall Service Hub',
    address: 'Monireth Blvd, Steung Meanchey, Phnom Penh',
    telephone: '+855 23 888 111',
    email: 'byd.citymall@automotive.com.kh',
    status: 'Active',
    created_at: '2026-01-01',
    updated_at: '2026-01-01'
  },
  {
    id: 'b-byd-sr',
    brand_id: 'brand-byd',
    supported_brand_ids: ['brand-byd'],
    is_dual_brand: false,
    branch_code: 'SR',
    branch_name: 'BYD Siem Reap Center',
    service_center_name: 'BYD Siem Reap Service Center',
    address: 'National Road 6, Svay Dangkum, Siem Reap',
    telephone: '+855 63 965 432',
    email: 'byd.siemreap@automotive.com.kh',
    status: 'Active',
    created_at: '2026-01-01',
    updated_at: '2026-01-01'
  },
  {
    id: 'b-denza-pp',
    brand_id: 'brand-denza',
    supported_brand_ids: ['brand-denza', 'brand-byd'],
    is_dual_brand: true,
    branch_code: 'PP',
    branch_name: 'DENZA Phnom Penh Flagship',
    service_center_name: 'DENZA Executive Care Hub Phnom Penh',
    address: 'No. 100 Hun Sen Blvd, Phnom Penh',
    telephone: '+855 23 999 777',
    email: 'denza.pp@automotive.com.kh',
    status: 'Active',
    created_at: '2026-01-01',
    updated_at: '2026-01-01'
  },
  {
    id: 'b-denza-sr',
    brand_id: 'brand-denza',
    supported_brand_ids: ['brand-denza'],
    is_dual_brand: false,
    branch_code: 'SR',
    branch_name: 'DENZA Siem Reap Lounge & Service',
    service_center_name: 'DENZA Siem Reap Executive Center',
    address: 'Airport Road, Siem Reap',
    telephone: '+855 63 888 666',
    email: 'denza.sr@automotive.com.kh',
    status: 'Active',
    created_at: '2026-01-01',
    updated_at: '2026-01-01'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'u-1',
    name: 'Huot Phanit',
    email: 'huot.phanit@byd.com',
    password: 'password123',
    role: 'Service Advisor',
    brand_id: 'brand-byd',
    branch_id: 'b-byd-sr',
    branch: 'BYD Siem Reap',
    assigned_brand_ids: ['brand-byd'],
    active_brand_id: 'brand-byd',
    status: 'Active',
    created_date: '2026-01-15',
    default_brand_id: 'brand-byd',
    default_branch_id: 'b-byd-sr',
    default_sa: 'Huot Phanit'
  },
  {
    id: 'u-2',
    name: 'Vannak Ouk',
    email: 'bm.byd6a@byd.com',
    password: 'password123',
    role: 'Service Advisor',
    brand_id: 'brand-byd',
    branch_id: 'b-byd-6a',
    branch: 'BYD Chroy Changva 6A',
    assigned_brand_ids: ['brand-byd', 'brand-denza'],
    active_brand_id: 'brand-byd',
    status: 'Active',
    created_date: '2026-02-01',
    default_brand_id: 'brand-byd',
    default_branch_id: 'b-byd-6a',
    default_sa: 'Vannak Ouk'
  },
  {
    id: 'u-3',
    name: 'Admin System',
    email: 'admin@byd.com',
    password: 'password123',
    role: 'Admin',
    brand_id: 'brand-byd',
    branch_id: 'b-byd-sr',
    branch: 'BYD Siem Reap',
    assigned_brand_ids: ['brand-byd', 'brand-denza'],
    active_brand_id: 'brand-byd',
    status: 'Active',
    created_date: '2026-01-01'
  }
];

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'q-101',
    quotation_no: 'BYD-QT2608-001',
    brand_id: 'brand-byd',
    branch_id: 'b-byd-sr',
    brand_name: 'BYD Cambodia',
    branch_name: 'BYD Siem Reap',
    customer_name: 'Chan Ponlok',
    phone: '+855 12 111 222',
    plate_no: '2BX-1234',
    vehicle_model: 'BYD SEAL',
    color: 'Atlantis Grey',
    vin: 'LC0BYDSEAL2026001',
    mileage: 10500,
    battery: 'SoC 90%',
    description: 'Brake pad replacement and battery diagnostic',
    repair_recommendation: 'Replace front brake pads',
    fee_items: [
      { id: 'qf-1', description: 'BYD SEAL Front Brake Pads', quantity: 1, unit_price: 1250, amount: 1250 }
    ],
    subtotal: 1250,
    vat: 0,
    total_amount: 1250,
    status: 'Quotation',
    created_by: 'u-1',
    created_by_name: 'Huot Phanit',
    created_date: '2026-08-21'
  },
  {
    id: 'q-102',
    quotation_no: 'BYD-QT2608-002',
    brand_id: 'brand-byd',
    branch_id: 'b-byd-sr',
    brand_name: 'BYD Cambodia',
    branch_name: 'BYD Siem Reap',
    customer_name: 'Lonh Sreymom',
    phone: '+855 12 333 444',
    plate_no: '2BC-5678',
    vehicle_model: 'BYD ATTO 3',
    color: 'Skiing White',
    vin: 'LC0BYDATTO2026002',
    mileage: 15000,
    battery: 'SoC 85%',
    description: '15,000 km Scheduled Service',
    repair_recommendation: 'Cabin air filter and AC check',
    fee_items: [
      { id: 'qf-2', description: 'Scheduled EV Service & Filter', quantity: 1, unit_price: 980, amount: 980 }
    ],
    subtotal: 980,
    vat: 0,
    total_amount: 980,
    status: 'Pending',
    created_by: 'u-1',
    created_by_name: 'Huot Phanit',
    created_date: '2026-08-20'
  },
  {
    id: 'q-103',
    quotation_no: 'BYD-QT2608-003',
    brand_id: 'brand-byd',
    branch_id: 'b-byd-sr',
    brand_name: 'BYD Cambodia',
    branch_name: 'BYD Siem Reap',
    customer_name: 'Try Chenda',
    phone: '+855 12 555 666',
    plate_no: '2BK-9012',
    vehicle_model: 'BYD SEALION 6',
    color: 'Cosmos Black',
    vin: 'LC0BYDSEALION003',
    mileage: 8000,
    battery: 'SoC 95%',
    description: 'Tire replacement and alignment',
    repair_recommendation: 'Four wheel balancing & alignment',
    fee_items: [
      { id: 'qf-3', description: 'Tire Service & Alignment Package', quantity: 1, unit_price: 750, amount: 750 }
    ],
    subtotal: 750,
    vat: 0,
    total_amount: 750,
    status: 'Quotation',
    created_by: 'u-1',
    created_by_name: 'Huot Phanit',
    created_date: '2026-08-20'
  },
  {
    id: 'q-104',
    quotation_no: 'BYD-QT2608-004',
    brand_id: 'brand-byd',
    branch_id: 'b-byd-sr',
    brand_name: 'BYD Cambodia',
    branch_name: 'BYD Siem Reap',
    customer_name: 'Thun Chenda',
    phone: '+855 12 777 888',
    plate_no: '2BJ-3456',
    vehicle_model: 'BYD DOLPHIN',
    color: 'Coral Pink',
    vin: 'LC0BYDDOLPHIN004',
    mileage: 22000,
    battery: 'SoC 80%',
    description: 'General Inspection',
    repair_recommendation: 'Software update & 12V Battery test',
    fee_items: [
      { id: 'qf-4', description: 'EV Diagnostics & Battery Test', quantity: 1, unit_price: 420, amount: 420 }
    ],
    subtotal: 420,
    vat: 0,
    total_amount: 420,
    status: 'Expired',
    created_by: 'u-1',
    created_by_name: 'Huot Phanit',
    created_date: '2026-08-19'
  }
];

export const INITIAL_RECEIPTS: Receipt[] = [
  {
    id: 'r-101',
    receipt_no: 'BYD-SR2608-001',
    brand_id: 'brand-byd',
    branch_id: 'b-byd-sr',
    brand_name: 'BYD Cambodia',
    branch_name: 'BYD Siem Reap',
    quotation_id: 'q-101',
    customer_name: 'Sokunthy CHENG',
    phone: '+855 12 999 111',
    plate_no: '2BX-1234',
    battery: 'SoC 92%',
    vehicle_model: 'BYD SEAL',
    color: 'Atlantis Grey',
    mileage: 10500,
    vin: 'LC0BYDSEAL2026001',
    buy_time: '2025-02-10',
    description: 'Scheduled Service & Diagnostic',
    fee_items: [
      { id: 'rf-101', description: 'Service Labor & Inspection', sap_no: 'BYD-101', quantity: 1, unit_price: 350, stock_yes_no: 'YES', warranty_yes_no: 'YES', amount: 350 }
    ],
    subtotal: 350,
    vat: 0,
    total_amount: 350,
    sa_name: 'Huot Phanit',
    in_time: '08:00 AM',
    out_time: '04:00 PM',
    is_owner: true,
    is_sender: false,
    warehouse_keeper: 'Mengly Ly',
    estimated_repaired_date: '2026-08-21',
    service_reminder: 'Next service at 20,000 km',
    old_parts_action: 'Take away',
    repair_confirm_customer: 'Sokunthy CHENG',
    status: 'Completed',
    created_by: 'u-1',
    created_by_name: 'Huot Phanit',
    created_date: '2026-08-21'
  },
  {
    id: 'r-102',
    receipt_no: 'BYD-SR2608-002',
    brand_id: 'brand-byd',
    branch_id: 'b-byd-sr',
    brand_name: 'BYD Cambodia',
    branch_name: 'BYD Siem Reap',
    customer_name: 'Oun Sopheaktra',
    phone: '+855 12 999 222',
    plate_no: '2BC-5678',
    battery: 'SoC 88%',
    vehicle_model: 'BYD ATTO 3',
    color: 'Skiing White',
    mileage: 15000,
    vin: 'LC0BYDATTO2026002',
    buy_time: '2025-03-15',
    description: 'Regular EV Maintenance',
    fee_items: [
      { id: 'rf-102', description: 'HEPA Filter & Brake Fluid Flush', sap_no: 'BYD-102', quantity: 1, unit_price: 280, stock_yes_no: 'YES', warranty_yes_no: 'YES', amount: 280 }
    ],
    subtotal: 280,
    vat: 0,
    total_amount: 280,
    sa_name: 'Huot Phanit',
    in_time: '09:00 AM',
    out_time: '05:00 PM',
    is_owner: true,
    is_sender: false,
    warehouse_keeper: 'Mengly Ly',
    estimated_repaired_date: '2026-08-21',
    service_reminder: 'Next service at 25,000 km',
    old_parts_action: 'Give up',
    repair_confirm_customer: 'Oun Sopheaktra',
    status: 'Completed',
    created_by: 'u-1',
    created_by_name: 'Huot Phanit',
    created_date: '2026-08-21'
  },
  {
    id: 'r-103',
    receipt_no: 'BYD-SR2608-003',
    brand_id: 'brand-byd',
    branch_id: 'b-byd-sr',
    brand_name: 'BYD Cambodia',
    branch_name: 'BYD Siem Reap',
    customer_name: 'Vireak Sophearet',
    phone: '+855 12 999 333',
    plate_no: '2BK-9012',
    battery: 'SoC 95%',
    vehicle_model: 'BYD SEALION 6',
    color: 'Cosmos Black',
    mileage: 8000,
    vin: 'LC0BYDSEALION003',
    buy_time: '2025-06-01',
    description: 'Suspension Check & Diagnostics',
    fee_items: [
      { id: 'rf-103', description: 'Suspension Tuning & System Check', sap_no: 'BYD-103', quantity: 1, unit_price: 450, stock_yes_no: 'YES', warranty_yes_no: 'YES', amount: 450 }
    ],
    subtotal: 450,
    vat: 0,
    total_amount: 450,
    sa_name: 'Huot Phanit',
    in_time: '10:00 AM',
    out_time: '04:30 PM',
    is_owner: true,
    is_sender: false,
    warehouse_keeper: 'Mengly Ly',
    estimated_repaired_date: '2026-08-20',
    service_reminder: 'Next service at 18,000 km',
    old_parts_action: 'Take away',
    repair_confirm_customer: 'Vireak Sophearet',
    status: 'Pending',
    created_by: 'u-1',
    created_by_name: 'Huot Phanit',
    created_date: '2026-08-20'
  },
  {
    id: 'r-104',
    receipt_no: 'BYD-SR2608-004',
    brand_id: 'brand-byd',
    branch_id: 'b-byd-sr',
    brand_name: 'BYD Cambodia',
    branch_name: 'BYD Siem Reap',
    customer_name: 'Leng Vichera',
    phone: '+855 12 999 444',
    plate_no: '2BJ-3456',
    battery: 'SoC 80%',
    vehicle_model: 'BYD DOLPHIN',
    color: 'Coral Pink',
    mileage: 22000,
    vin: 'LC0BYDDOLPHIN004',
    buy_time: '2024-12-12',
    description: 'Wheel Alignment & Tire Rotation',
    fee_items: [
      { id: 'rf-104', description: 'Wheel Alignment Service', sap_no: 'BYD-104', quantity: 1, unit_price: 150, stock_yes_no: 'YES', warranty_yes_no: 'YES', amount: 150 }
    ],
    subtotal: 150,
    vat: 0,
    total_amount: 150,
    sa_name: 'Huot Phanit',
    in_time: '01:00 PM',
    out_time: '05:00 PM',
    is_owner: true,
    is_sender: false,
    warehouse_keeper: 'Mengly Ly',
    estimated_repaired_date: '2026-08-20',
    service_reminder: 'Next service at 30,000 km',
    old_parts_action: 'Give up',
    repair_confirm_customer: 'Leng Vichera',
    status: 'Completed',
    created_by: 'u-1',
    created_by_name: 'Huot Phanit',
    created_date: '2026-08-20'
  },
  {
    id: 'r-105',
    receipt_no: 'BYD-SR2608-005',
    brand_id: 'brand-byd',
    branch_id: 'b-byd-sr',
    brand_name: 'BYD Cambodia',
    branch_name: 'BYD Siem Reap',
    customer_name: 'Phat Sophanna',
    phone: '+855 12 999 555',
    plate_no: '2BZ-7890',
    battery: 'SoC 87%',
    vehicle_model: 'BYD TANG EV',
    color: 'Emperor Red',
    mileage: 31000,
    vin: 'LC0BYDTANG005',
    buy_time: '2024-08-20',
    description: 'HV Battery & Motor Cooling Inspection',
    fee_items: [
      { id: 'rf-105', description: 'Coolant Flush & HV System Test', sap_no: 'BYD-105', quantity: 1, unit_price: 620, stock_yes_no: 'YES', warranty_yes_no: 'YES', amount: 620 }
    ],
    subtotal: 620,
    vat: 0,
    total_amount: 620,
    sa_name: 'Huot Phanit',
    in_time: '08:30 AM',
    out_time: '04:30 PM',
    is_owner: true,
    is_sender: false,
    warehouse_keeper: 'Mengly Ly',
    estimated_repaired_date: '2026-08-19',
    service_reminder: 'Next service at 40,000 km',
    old_parts_action: 'Take away',
    repair_confirm_customer: 'Phat Sophanna',
    status: 'Pending',
    created_by: 'u-1',
    created_by_name: 'Huot Phanit',
    created_date: '2026-08-19'
  }
];


export const INITIAL_SETTINGS: SystemSettings = {
  center_name: 'BYD SALES & SERVICE CENTER',
  branch_name: 'Phnom Penh Main Headquarters',
  address: 'National Road 6, Svay Dangkum, Siem Reap',
  phone: '+855 63 965 432',
  email: 'service@byd-denza.com.kh',
  vat_rate: 0.10,
  currency_symbol: '$',
  quotation_prefix: 'BYD',
  receipt_prefix: 'BYD60M',
  terms_conditions: '1. All parts replaced carry BYD / DENZA official manufacturer warranty.\n2. Service quotations are valid for 14 calendar days from date of issue.\n3. Customer authorization is required prior to initiating any non-quoted repair work.',
  header_logo_type: 'byd',
  header_logo_url: '',
  receipt_header_english_title: 'BYD SALES & SERVICE CENTER',
  receipt_header_khmer_title: 'មិនអាចយកទៅប្រកាសពន្ធឬប្រកាសជាប់ពន្ធ',
  quotation_header_english_title: 'Huan Ya He Zhong (Cambodia) Trading Co., Ltd',
  quotation_header_khmer_title: 'ហ័ន យ៉ា ហ៊ឺ ​ ចុង (ខេមបូឌា) ត្រេឌីង ឯ.ក',
  quotation_deposit_term: '1. Will deposit 30% of full amount.',
  quotation_payment_term: '2. The remaining needs to be paid after the maintenance is completed.',
  quotation_bank_details: '3. ABA: HUAN YA HE ZHONG (CAMBODIA) TRADING CO LTD (002 886 771)',
  quotation_expiration_term: '4. This Quotation will Expire in 30 days and will renew this quote again.',
  quotation_terms: '1. Will deposit 30% of full amount.\n2. The remaining needs to be paid after the maintenance is completed.\n3. ABA: HUAN YA HE ZHONG (CAMBODIA) TRADING CO LTD (002 886 771)\n4. This Quotation will Expire in 30 days and will renew this quote again.',
  telegram_bot_token: '',
  telegram_chat_id: '',
  telegram_reminder_enabled: true
};

export class StorageService {
  // BRANDS
  static async fetchBrands(): Promise<Brand[]> {
    try {
      const res = await fetch('/api/brands');
      if (res.ok) {
        const data: Brand[] = await res.json();
        if (data && data.length > 0) {
          localStorage.setItem(BRANDS_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch brands from MongoDB API:', err);
    }
    return this.getBrands();
  }

  static getBrands(): Brand[] {
    const data = localStorage.getItem(BRANDS_KEY);
    if (!data) {
      localStorage.setItem(BRANDS_KEY, JSON.stringify(INITIAL_BRANDS));
      return INITIAL_BRANDS;
    }
    const brands: Brand[] = JSON.parse(data);
    let updated = false;
    brands.forEach(b => {
      if (b.brand_code === 'BYD') {
        if (!b.local_company_name || b.local_company_name.includes('ចំនាយ')) {
          b.local_company_name = 'មិនមែនជាប្រកាសជាប់ពន្ធ/ប្រកាសពន្ធ';
          updated = true;
        }
        if (b.address.includes('Lot No. 52')) {
          b.address = 'No. 888 Monivong Blvd, Tonle Bassac, Chamkarmon, Phnom Penh, Cambodia';
          updated = true;
        }
        if (b.telephone.includes('017 555 811')) {
          b.telephone = '+855 23 888 999 / +855 12 999 888';
          updated = true;
        }
      }
    });
    if (updated) {
      localStorage.setItem(BRANDS_KEY, JSON.stringify(brands));
    }
    return brands;
  }

  static async saveBrands(brands: Brand[]): Promise<void> {
    localStorage.setItem(BRANDS_KEY, JSON.stringify(brands));
    try {
      await fetch('/api/brands/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brands)
      });
    } catch (err) {
      console.warn('MongoDB sync error (brands bulk):', err);
    }
  }

  static async saveBrand(brand: Brand): Promise<void> {
    const brands = this.getBrands();
    const existingIndex = brands.findIndex(b => b.id === brand.id);
    if (existingIndex >= 0) {
      brands[existingIndex] = brand;
    } else {
      brands.push(brand);
    }
    localStorage.setItem(BRANDS_KEY, JSON.stringify(brands));
    try {
      await fetch(`/api/brands/${brand.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brand)
      });
    } catch (err) {
      console.warn(`MongoDB sync error (brand ${brand.id}):`, err);
    }
  }

  static async deleteBrand(id: string): Promise<void> {
    const brands = this.getBrands().filter(b => b.id !== id);
    localStorage.setItem(BRANDS_KEY, JSON.stringify(brands));
    try {
      await fetch(`/api/brands/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn(`MongoDB delete error (brand ${id}):`, err);
    }
  }

  // Helper to ensure all branches have supported_brand_ids populated (auto-upgrade legacy cached records)
  static ensureBranchSupportedBrands(rawBranches: Branch[]): Branch[] {
    return rawBranches.map(br => {
      const isDual = Boolean(
        br.is_dual_brand ||
        br.branch_code === '6A' ||
        br.id === 'b-byd-6a' ||
        br.id === 'b-denza-pp' ||
        (br.branch_name && br.branch_name.toLowerCase().includes('6a'))
      );
      const defaultSupported = isDual ? ['brand-byd', 'brand-denza'] : (br.brand_id ? [br.brand_id] : ['brand-byd']);

      if (br.supported_brand_ids && br.supported_brand_ids.length > 0) {
        if (isDual && br.supported_brand_ids.length < 2) {
          return { ...br, is_dual_brand: true, supported_brand_ids: ['brand-byd', 'brand-denza'] };
        }
        return { ...br, is_dual_brand: br.is_dual_brand ?? (br.supported_brand_ids.length > 1) };
      }

      return {
        ...br,
        is_dual_brand: isDual,
        supported_brand_ids: defaultSupported
      };
    });
  }

  // BRANCHES
  static async fetchBranches(): Promise<Branch[]> {
    try {
      const res = await fetch('/api/branches');
      if (res.ok) {
        const data: Branch[] = await res.json();
        if (data && data.length > 0) {
          const upgraded = this.ensureBranchSupportedBrands(data);
          localStorage.setItem(BRANCHES_KEY, JSON.stringify(upgraded));
          return upgraded;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch branches from MongoDB API:', err);
    }
    return this.getBranches();
  }

  static getBranches(): Branch[] {
    const data = localStorage.getItem(BRANCHES_KEY);
    if (!data) {
      localStorage.setItem(BRANCHES_KEY, JSON.stringify(INITIAL_BRANCHES));
      return INITIAL_BRANCHES;
    }
    try {
      const parsed: Branch[] = JSON.parse(data);
      const upgraded = this.ensureBranchSupportedBrands(parsed);
      const needsUpdate = parsed.some((b, i) => !b.supported_brand_ids || b.supported_brand_ids.length < (upgraded[i]?.supported_brand_ids?.length || 0));
      if (needsUpdate) {
        localStorage.setItem(BRANCHES_KEY, JSON.stringify(upgraded));
      }
      return upgraded;
    } catch {
      return INITIAL_BRANCHES;
    }
  }

  static async saveBranches(branches: Branch[]): Promise<void> {
    localStorage.setItem(BRANCHES_KEY, JSON.stringify(branches));
    try {
      await fetch('/api/branches/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branches)
      });
    } catch (err) {
      console.warn('MongoDB sync error (branches bulk):', err);
    }
  }

  static async saveBranch(branch: Branch): Promise<void> {
    const branches = this.getBranches();
    const existingIndex = branches.findIndex(b => b.id === branch.id);
    if (existingIndex >= 0) {
      branches[existingIndex] = branch;
    } else {
      branches.push(branch);
    }
    localStorage.setItem(BRANCHES_KEY, JSON.stringify(branches));
    try {
      await fetch(`/api/branches/${branch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branch)
      });
    } catch (err) {
      console.warn(`MongoDB sync error (branch ${branch.id}):`, err);
    }
  }

  static async deleteBranch(id: string): Promise<void> {
    const branches = this.getBranches().filter(b => b.id !== id);
    localStorage.setItem(BRANCHES_KEY, JSON.stringify(branches));
    try {
      await fetch(`/api/branches/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn(`MongoDB delete error (branch ${id}):`, err);
    }
  }

  static getBranchesByBrand(brand_id: string): Branch[] {
    const branches = this.getBranches();
    if (!brand_id || brand_id === 'all') return branches;
    return branches.filter(b => b.brand_id === brand_id);
  }

  // USERS
  static normalizeUser(user: User): User {
    let assigned = user.assigned_brand_ids;
    if (!assigned || assigned.length === 0) {
      if (user.role === 'Admin') {
        assigned = ['brand-byd', 'brand-denza'];
      } else if (user.branch_id === 'b-byd-6a' || user.branch_id === 'b-denza-pp') {
        assigned = ['brand-byd', 'brand-denza'];
      } else {
        assigned = [user.brand_id || 'brand-byd'];
      }
    }
    const activeBrand = user.active_brand_id || user.default_brand_id || user.brand_id || assigned[0] || 'brand-byd';
    return {
      ...user,
      assigned_brand_ids: assigned,
      active_brand_id: activeBrand
    };
  }

  static async fetchUsers(): Promise<User[]> {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data: User[] = await res.json();
        if (data && data.length > 0) {
          const normalized = data.map(u => this.normalizeUser(u));
          localStorage.setItem(USERS_KEY, JSON.stringify(normalized));
          return normalized;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch users from MongoDB API:', err);
    }
    return this.getUsers();
  }

  static getUsers(): User[] {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
      const normalized = INITIAL_USERS.map(u => this.normalizeUser(u));
      localStorage.setItem(USERS_KEY, JSON.stringify(normalized));
      return normalized;
    }
    try {
      const parsed: User[] = JSON.parse(data);
      return parsed.map(u => this.normalizeUser(u));
    } catch {
      const normalized = INITIAL_USERS.map(u => this.normalizeUser(u));
      localStorage.setItem(USERS_KEY, JSON.stringify(normalized));
      return normalized;
    }
  }

  static async saveUsers(users: User[]): Promise<void> {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    try {
      await fetch('/api/users/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(users)
      });
    } catch (err) {
      console.warn('MongoDB sync error (users bulk):', err);
    }
  }

  static async saveUser(user: User): Promise<void> {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
    } catch (err) {
      console.warn(`MongoDB sync error (user ${user.id}):`, err);
    }
  }

  static async deleteUser(id: string): Promise<void> {
    const users = this.getUsers().filter(u => u.id !== id);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn(`MongoDB delete error (user ${id}):`, err);
    }
  }

  // QUOTATIONS
  static async fetchQuotations(): Promise<Quotation[]> {
    try {
      const res = await fetch('/api/quotations');
      if (res.ok) {
        const data: Quotation[] = await res.json();
        if (data && Array.isArray(data)) {
          const normalized = data.map(q => this.normalizeQuotation(q));
          localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(normalized));
          return normalized;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch quotations from MongoDB API:', err);
    }
    return this.getQuotations();
  }

  static normalizeQuotation(quotation: Quotation): Quotation {
    if (!quotation) return quotation;
    return {
      ...quotation,
      subtotal: Number(quotation.subtotal) || 0,
      vat: Number(quotation.vat) || 0,
      total_amount: Number(quotation.total_amount) || 0,
      mileage: Number(quotation.mileage) || 0,
      fee_items: Array.isArray(quotation.fee_items)
        ? quotation.fee_items.map((item, idx) => ({
            ...item,
            id: item?.id || `item-${idx}`,
            description: item?.description || '',
            quantity: Number(item?.quantity) || 0,
            unit_price: Number(item?.unit_price) || 0,
            amount: Number(item?.amount) || 0,
            sap_no: item?.sap_no || '',
            paint_check: item?.paint_check || '',
            image_url: item?.image_url || ''
          }))
        : []
    };
  }

  static getQuotations(): Quotation[] {
    const data = localStorage.getItem(QUOTATIONS_KEY);
    if (!data) {
      const normalized = INITIAL_QUOTATIONS.map(q => this.normalizeQuotation(q));
      localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(normalized));
      return normalized;
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.map(q => this.normalizeQuotation(q));
      }
      return [];
    } catch {
      return [];
    }
  }

  static async saveQuotations(quotations: Quotation[]): Promise<void> {
    const clean = quotations.map(q => this.normalizeQuotation(q));
    localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(clean));
    try {
      await fetch('/api/quotations/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clean)
      });
    } catch (err) {
      console.warn('MongoDB sync error (quotations bulk):', err);
    }
  }

  static async saveQuotation(quotation: Quotation): Promise<void> {
    const clean = this.normalizeQuotation(quotation);
    const existing = this.getQuotations();
    const index = existing.findIndex(q => q.id === clean.id);
    if (index >= 0) {
      existing[index] = clean;
    } else {
      existing.unshift(clean);
    }
    localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(existing));
    try {
      await fetch(`/api/quotations/${clean.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clean)
      });
    } catch (err) {
      console.warn(`MongoDB sync error (quotation ${clean.id}):`, err);
    }
  }

  static async deleteQuotation(id: string): Promise<void> {
    const quotations = this.getQuotations().filter(q => q.id !== id);
    localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(quotations));
    try {
      await fetch(`/api/quotations/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn(`MongoDB delete error (quotation ${id}):`, err);
    }
  }

  // RECEIPTS
  static normalizeReceipt(receipt: Receipt): Receipt {
    if (!receipt) return receipt;
    return {
      ...receipt,
      subtotal: Number(receipt.subtotal) || 0,
      vat: Number(receipt.vat) || 0,
      total_amount: Number(receipt.total_amount) || 0,
      mileage: Number(receipt.mileage) || 0,
      fee_items: Array.isArray(receipt.fee_items)
        ? receipt.fee_items.map((item, idx) => ({
            ...item,
            id: item?.id || `item-${idx}`,
            description: item?.description || '',
            quantity: Number(item?.quantity) || 0,
            unit_price: Number(item?.unit_price) || 0,
            amount: Number(item?.amount) || 0,
            sap_no: item?.sap_no || '',
            stock_yes_no: item?.stock_yes_no || 'YES',
            warranty_yes_no: item?.warranty_yes_no || 'YES'
          }))
        : []
    };
  }

  static async fetchReceipts(): Promise<Receipt[]> {
    try {
      const res = await fetch('/api/receipts');
      if (res.ok) {
        const data: Receipt[] = await res.json();
        if (data && Array.isArray(data)) {
          const normalized = data.map(r => this.normalizeReceipt(r));
          localStorage.setItem(RECEIPTS_KEY, JSON.stringify(normalized));
          return normalized;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch receipts from MongoDB API:', err);
    }
    return this.getReceipts();
  }

  static getReceipts(): Receipt[] {
    const data = localStorage.getItem(RECEIPTS_KEY);
    if (!data) {
      const normalized = INITIAL_RECEIPTS.map(r => this.normalizeReceipt(r));
      localStorage.setItem(RECEIPTS_KEY, JSON.stringify(normalized));
      return normalized;
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.map(r => this.normalizeReceipt(r));
      }
      return [];
    } catch {
      return [];
    }
  }

  static async saveReceipts(receipts: Receipt[]): Promise<void> {
    const clean = receipts.map(r => this.normalizeReceipt(r));
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(clean));
    try {
      await fetch('/api/receipts/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clean)
      });
    } catch (err) {
      console.warn('MongoDB sync error (receipts bulk):', err);
    }
  }

  static async saveReceipt(receipt: Receipt): Promise<void> {
    const clean = this.normalizeReceipt(receipt);
    const existing = this.getReceipts();
    const index = existing.findIndex(r => r.id === clean.id);
    if (index >= 0) {
      existing[index] = clean;
    } else {
      existing.unshift(clean);
    }
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(existing));
    try {
      await fetch(`/api/receipts/${clean.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clean)
      });
    } catch (err) {
      console.warn(`MongoDB sync error (receipt ${clean.id}):`, err);
    }
  }

  static async deleteReceipt(id: string): Promise<void> {
    const receipts = this.getReceipts().filter(r => r.id !== id);
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
    try {
      await fetch(`/api/receipts/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn(`MongoDB delete error (receipt ${id}):`, err);
    }
  }

  // SETTINGS
  static async fetchSettings(): Promise<SystemSettings> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data: SystemSettings = await res.json();
        if (data) {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch settings from MongoDB API:', err);
    }
    return this.getSettings();
  }

  static getSettings(): SystemSettings {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    const settings: SystemSettings = JSON.parse(data);
    let updated = false;
    if (!settings.quotation_deposit_term) {
      settings.quotation_deposit_term = '1. Will deposit 30% of full amount.';
      updated = true;
    }
    if (!settings.quotation_payment_term) {
      settings.quotation_payment_term = '2. The remaining needs to be paid after the maintenance is completed.';
      updated = true;
    }
    if (!settings.quotation_bank_details) {
      settings.quotation_bank_details = '3. ABA: HUAN YA HE ZHONG (CAMBODIA) TRADING CO LTD (002 886 771)';
      updated = true;
    }
    if (!settings.quotation_expiration_term) {
      settings.quotation_expiration_term = '4. This Quotation will Expire in 30 days and will renew this quote again.';
      updated = true;
    }
    if (!settings.quotation_terms) {
      settings.quotation_terms = `${settings.quotation_deposit_term}\n${settings.quotation_payment_term}\n${settings.quotation_bank_details}\n${settings.quotation_expiration_term}`;
      updated = true;
    }
    if (updated) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
    return settings;
  }

  static async saveSettings(settings: SystemSettings): Promise<void> {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
    } catch (err) {
      console.warn('MongoDB sync error (settings):', err);
    }
  }

  // MONGODB FULL REFRESH SYNC
  static async syncFromMongoDB(): Promise<boolean> {
    try {
      const [resB, resBr, resU, resQ, resR, resS] = await Promise.allSettled([
        fetch('/api/brands').then(r => r.ok ? r.json() : null),
        fetch('/api/branches').then(r => r.ok ? r.json() : null),
        fetch('/api/users').then(r => r.ok ? r.json() : null),
        fetch('/api/quotations').then(r => r.ok ? r.json() : null),
        fetch('/api/receipts').then(r => r.ok ? r.json() : null),
        fetch('/api/settings').then(r => r.ok ? r.json() : null)
      ]);

      if (resB.status === 'fulfilled' && resB.value && Array.isArray(resB.value) && resB.value.length > 0) {
        localStorage.setItem(BRANDS_KEY, JSON.stringify(resB.value));
      }
      if (resBr.status === 'fulfilled' && resBr.value && Array.isArray(resBr.value) && resBr.value.length > 0) {
        localStorage.setItem(BRANCHES_KEY, JSON.stringify(resBr.value));
      }
      if (resU.status === 'fulfilled' && resU.value && Array.isArray(resU.value) && resU.value.length > 0) {
        localStorage.setItem(USERS_KEY, JSON.stringify(resU.value));
      }
      if (resQ.status === 'fulfilled' && resQ.value && Array.isArray(resQ.value)) {
        const normalized = resQ.value.map((q: Quotation) => this.normalizeQuotation(q));
        localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(normalized));
      }
      if (resR.status === 'fulfilled' && resR.value && Array.isArray(resR.value)) {
        const normalized = resR.value.map((r: Receipt) => this.normalizeReceipt(r));
        localStorage.setItem(RECEIPTS_KEY, JSON.stringify(normalized));
      }
      if (resS.status === 'fulfilled' && resS.value) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(resS.value));
      }
      return true;
    } catch (err) {
      console.warn('Could not sync with MongoDB backend:', err);
      return false;
    }
  }

  // CURRENT USER
  static getCurrentUser(): User | null {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (!data) {
      return null;
    }
    try {
      const parsed: User = JSON.parse(data);
      return this.normalizeUser(parsed);
    } catch {
      return null;
    }
  }

  static setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }

  // DOCUMENT NUMBER GENERATION (Strict Prefix & Numbering Isolation)
  static generateQuotationNo(brand_id?: string, _branch_id?: string): string {
    const quotations = this.getQuotations();
    const brands = this.getBrands();
    const selectedBrand = brands.find(b => b.id === brand_id) || brands[0];
    const brandCode = selectedBrand?.brand_code || 'BYD';

    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const prefix = `${brandCode}-QT${yy}${mm}-`;

    // Strictly isolate sequence: only evaluate quotations matching this specific brand prefix
    const matchingQuotations = quotations.filter(q => q.quotation_no && q.quotation_no.startsWith(prefix));
    const sequences = matchingQuotations.map(q => {
      const numPart = q.quotation_no.slice(prefix.length);
      const val = parseInt(numPart, 10);
      return isNaN(val) ? 0 : val;
    });

    const nextSequence = (sequences.length > 0 ? Math.max(0, ...sequences) : 0) + 1;
    return `${prefix}${String(nextSequence).padStart(3, '0')}`;
  }

  static generateReceiptNo(brand_id?: string, _branch_id?: string): string {
    const receipts = this.getReceipts();
    const brands = this.getBrands();
    const selectedBrand = brands.find(b => b.id === brand_id) || brands[0];
    const receiptPrefix = selectedBrand?.receipt_prefix || (selectedBrand?.brand_code === 'DENZA' ? 'DENZA60M' : 'BYD60M');

    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const prefix = `${receiptPrefix}${yy}${mm}-`;

    // Strictly isolate sequence: only evaluate receipts matching this specific receipt prefix
    const matchingReceipts = receipts.filter(r => r.receipt_no && r.receipt_no.startsWith(prefix));
    const sequences = matchingReceipts.map(r => {
      const numPart = r.receipt_no.slice(prefix.length);
      const val = parseInt(numPart, 10);
      return isNaN(val) ? 0 : val;
    });

    const nextSequence = (sequences.length > 0 ? Math.max(0, ...sequences) : 0) + 1;
    return `${prefix}${String(nextSequence).padStart(3, '0')}`;
  }

  // DYNAMIC CUSTOMER & VEHICLE AGGREGATION
  static getCustomerVehicles() {
    const receipts = this.getReceipts();
    const quotations = this.getQuotations();
    const map = new Map<string, any>();

    const initialList = [
      {
        id: 'cv-1',
        customerId: 'CUST-2026-001',
        name: 'Sokunthy CHENG',
        phone: '+855 12 999 111',
        vehicleModel: 'BYD SEAL AWD Performance',
        plateNumber: '2BX-1234',
        color: 'Atlantis Grey',
        status: 'In Service',
        lastService: '2026-08-21',
        branch: 'BYD Siem Reap',
        vin: 'LC0BYDSEAL2026001',
        mileage: 10500,
        battery: 'SoC 92%'
      },
      {
        id: 'cv-2',
        customerId: 'CUST-2026-002',
        name: 'Oun Sopheaktra',
        phone: '+855 12 999 222',
        vehicleModel: 'BYD ATTO 3 Extended Range',
        plateNumber: '2BC-5678',
        color: 'Skiing White',
        status: 'Active',
        lastService: '2026-08-21',
        branch: 'BYD Siem Reap',
        vin: 'LC0BYDATTO2026002',
        mileage: 15000,
        battery: 'SoC 88%'
      },
      {
        id: 'cv-3',
        customerId: 'CUST-2026-003',
        name: 'Vireak Sophearet',
        phone: '+855 12 999 333',
        vehicleModel: 'BYD SEALION 6 DM-i',
        plateNumber: '2BK-9012',
        color: 'Cosmos Black',
        status: 'In Service',
        lastService: '2026-08-20',
        branch: 'BYD Phnom Penh',
        vin: 'LC0BYDSEALION003',
        mileage: 8000,
        battery: 'SoC 95%'
      },
      {
        id: 'cv-4',
        customerId: 'CUST-2026-004',
        name: 'Leng Vichera',
        phone: '+855 12 999 444',
        vehicleModel: 'BYD DOLPHIN Extended Range',
        plateNumber: '2BJ-3456',
        color: 'Coral Pink',
        status: 'Active',
        lastService: '2026-08-20',
        branch: 'BYD Chroy Changva 6A',
        vin: 'LC0BYDDOLPHIN004',
        mileage: 22000,
        battery: 'SoC 80%'
      },
      {
        id: 'cv-5',
        customerId: 'CUST-2026-005',
        name: 'Phat Sophanna',
        phone: '+855 12 999 555',
        vehicleModel: 'BYD TANG EV Flagship',
        plateNumber: '2BZ-7890',
        color: 'Emperor Red',
        status: 'In Service',
        lastService: '2026-08-19',
        branch: 'BYD Siem Reap',
        vin: 'LC0BYDTANG005',
        mileage: 31000,
        battery: 'SoC 87%'
      }
    ];

    initialList.forEach(c => {
      const key = (c.plateNumber || c.name).toLowerCase().trim();
      map.set(key, { ...c, history: [] });
    });

    quotations.forEach(q => {
      if (!q.customer_name) return;
      const key = (q.plate_no || q.customer_name).toLowerCase().trim();
      let record = map.get(key);
      if (!record) {
        record = {
          id: `cv-q-${q.id}`,
          customerId: `CUST-${(q.quotation_no || '').slice(-6)}`,
          name: q.customer_name,
          phone: q.phone || '',
          vehicleModel: q.vehicle_model || 'BYD Vehicle',
          plateNumber: q.plate_no || 'N/A',
          color: q.color || '',
          status: q.status === 'Pending' ? 'In Service' : 'Active',
          lastService: q.created_date || new Date().toISOString().slice(0, 10),
          branch: q.branch_name || 'BYD Service Center',
          vin: q.vin || '',
          mileage: q.mileage || 0,
          battery: q.battery || '',
          history: []
        };
        map.set(key, record);
      }
      record.history.push({
        type: 'Quotation',
        no: q.quotation_no,
        date: q.created_date,
        amount: q.total_amount,
        description: q.description || q.repair_recommendation || 'Service Quotation',
        status: q.status
      });
      if (q.created_date && q.created_date > record.lastService) {
        record.lastService = q.created_date;
      }
    });

    receipts.forEach(r => {
      if (!r.customer_name) return;
      const key = (r.plate_no || r.customer_name).toLowerCase().trim();
      let record = map.get(key);
      if (!record) {
        record = {
          id: `cv-r-${r.id}`,
          customerId: `CUST-${(r.receipt_no || '').slice(-6)}`,
          name: r.customer_name,
          phone: r.phone || '',
          vehicleModel: r.vehicle_model || 'BYD Vehicle',
          plateNumber: r.plate_no || 'N/A',
          color: r.color || '',
          status: r.status === 'Pending' ? 'In Service' : 'Active',
          lastService: r.created_date || new Date().toISOString().slice(0, 10),
          branch: r.branch_name || 'BYD Service Center',
          vin: r.vin || '',
          mileage: r.mileage || 0,
          battery: r.battery || '',
          history: []
        };
        map.set(key, record);
      }
      if (r.status === 'Pending') {
        record.status = 'In Service';
      }
      if (r.mileage && r.mileage > (record.mileage || 0)) {
        record.mileage = r.mileage;
      }
      record.history.push({
        type: 'Receipt',
        no: r.receipt_no,
        date: r.created_date,
        amount: r.total_amount,
        description: r.description || 'Service Maintenance',
        status: r.status
      });
      if (r.created_date && r.created_date > record.lastService) {
        record.lastService = r.created_date;
      }
    });

    return Array.from(map.values());
  }

  // DYNAMIC DASHBOARD ANALYTICS & METRICS
  static getDashboardMetrics(): DashboardMetrics {
    const quotations = this.getQuotations();
    const receipts = this.getReceipts();
    const todayStr = new Date().toISOString().slice(0, 10);
    const thisMonthStr = new Date().toISOString().slice(0, 7);

    const todayQuotations = quotations.filter(q => q.created_date?.startsWith(todayStr)).length;
    const thisMonthQuotations = quotations.filter(q => q.created_date?.startsWith(thisMonthStr)).length;
    const todayReceipts = receipts.filter(r => r.created_date?.startsWith(todayStr)).length;
    const thisMonthReceipts = receipts.filter(r => r.created_date?.startsWith(thisMonthStr)).length;

    const totalQuotationAmount = quotations.reduce((acc, q) => acc + (Number(q.total_amount) || 0), 0);
    const totalReceiptAmount = receipts.reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0);

    return {
      totalQuotations: quotations.length,
      todayQuotations,
      thisMonthQuotations,
      totalReceipts: receipts.length,
      todayReceipts,
      thisMonthReceipts,
      totalQuotationAmount,
      totalReceiptAmount
    };
  }

  static getBranchPerformance(): BranchPerformance[] {
    const receipts = this.getReceipts();
    const branches = this.getBranches();

    return branches.map(branch => {
      const branchReceipts = receipts.filter(r => r.branch_id === branch.id || r.branch_name === branch.branch_name);
      const amount = branchReceipts.reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0);
      return {
        brand_name: branch.service_center_name || branch.branch_name,
        branch_id: branch.id,
        branch_name: branch.branch_name,
        quotations: 0,
        receipts: branchReceipts.length,
        amount
      };
    });
  }
}

