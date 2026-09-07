import type { User, Brand, Branch, Quotation, Receipt, SystemSettings } from '../types';

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
    brand_name: 'BYD Auto Cambodia',
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
    brand_name: 'DENZA Luxury Electric Mobility',
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
    branch_code: '6A',
    branch_name: 'BYD Chroy Changva 6A',
    service_center_name: 'BYD Sales & Service Center 6A',
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
    brand_name: 'BYD Auto Cambodia',
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
    brand_name: 'BYD Auto Cambodia',
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
    brand_name: 'BYD Auto Cambodia',
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
    brand_name: 'BYD Auto Cambodia',
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
    brand_name: 'BYD Auto Cambodia',
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
    brand_name: 'BYD Auto Cambodia',
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
    brand_name: 'BYD Auto Cambodia',
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
    brand_name: 'BYD Auto Cambodia',
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
    brand_name: 'BYD Auto Cambodia',
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

  // BRANCHES
  static async fetchBranches(): Promise<Branch[]> {
    try {
      const res = await fetch('/api/branches');
      if (res.ok) {
        const data: Branch[] = await res.json();
        if (data && data.length > 0) {
          localStorage.setItem(BRANCHES_KEY, JSON.stringify(data));
          return data;
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
    return JSON.parse(data);
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
  static async fetchUsers(): Promise<User[]> {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data: User[] = await res.json();
        if (data && data.length > 0) {
          localStorage.setItem(USERS_KEY, JSON.stringify(data));
          return data;
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
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
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
          localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch quotations from MongoDB API:', err);
    }
    return this.getQuotations();
  }

  static getQuotations(): Quotation[] {
    const data = localStorage.getItem(QUOTATIONS_KEY);
    if (!data) {
      localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(INITIAL_QUOTATIONS));
      return INITIAL_QUOTATIONS;
    }
    return JSON.parse(data);
  }

  static async saveQuotations(quotations: Quotation[]): Promise<void> {
    localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(quotations));
    try {
      await fetch('/api/quotations/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotations)
      });
    } catch (err) {
      console.warn('MongoDB sync error (quotations bulk):', err);
    }
  }

  static async saveQuotation(quotation: Quotation): Promise<void> {
    const existing = this.getQuotations();
    const index = existing.findIndex(q => q.id === quotation.id);
    if (index >= 0) {
      existing[index] = quotation;
    } else {
      existing.unshift(quotation);
    }
    localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(existing));
    try {
      await fetch(`/api/quotations/${quotation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotation)
      });
    } catch (err) {
      console.warn(`MongoDB sync error (quotation ${quotation.id}):`, err);
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
  static async fetchReceipts(): Promise<Receipt[]> {
    try {
      const res = await fetch('/api/receipts');
      if (res.ok) {
        const data: Receipt[] = await res.json();
        if (data && Array.isArray(data)) {
          localStorage.setItem(RECEIPTS_KEY, JSON.stringify(data));
          return data;
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
      localStorage.setItem(RECEIPTS_KEY, JSON.stringify(INITIAL_RECEIPTS));
      return INITIAL_RECEIPTS;
    }
    return JSON.parse(data);
  }

  static async saveReceipts(receipts: Receipt[]): Promise<void> {
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
    try {
      await fetch('/api/receipts/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receipts)
      });
    } catch (err) {
      console.warn('MongoDB sync error (receipts bulk):', err);
    }
  }

  static async saveReceipt(receipt: Receipt): Promise<void> {
    const existing = this.getReceipts();
    const index = existing.findIndex(r => r.id === receipt.id);
    if (index >= 0) {
      existing[index] = receipt;
    } else {
      existing.unshift(receipt);
    }
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(existing));
    try {
      await fetch(`/api/receipts/${receipt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receipt)
      });
    } catch (err) {
      console.warn(`MongoDB sync error (receipt ${receipt.id}):`, err);
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
        localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(resQ.value));
      }
      if (resR.status === 'fulfilled' && resR.value && Array.isArray(resR.value)) {
        localStorage.setItem(RECEIPTS_KEY, JSON.stringify(resR.value));
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
      return JSON.parse(data);
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

  // DOCUMENT NUMBER GENERATION
  static generateQuotationNo(brand_id?: string, _branch_id?: string): string {
    const quotations = this.getQuotations();
    const brands = this.getBrands();
    const selectedBrand = brands.find(b => b.id === brand_id) || brands[0];
    const prefixStr = selectedBrand?.brand_code || 'BYD';

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `${prefixStr}-Q-${todayStr}-`;
    const nextSequence = Math.max(
      0,
      ...quotations
        .filter(q => q.quotation_no.startsWith(prefix))
        .map(q => Number(q.quotation_no.slice(prefix.length)))
        .filter(Number.isFinite)
    ) + 1;
    return `${prefix}${String(nextSequence).padStart(3, '0')}`;
  }

  static generateReceiptNo(brand_id?: string, _branch_id?: string): string {
    const receipts = this.getReceipts();
    const brands = this.getBrands();
    const selectedBrand = brands.find(b => b.id === brand_id) || brands[0];
    const receiptPrefix = selectedBrand?.receipt_prefix || 'BYD60M';

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `${receiptPrefix}${todayStr}-`;
    const nextSequence = Math.max(
      0,
      ...receipts
        .filter(r => r.receipt_no.startsWith(prefix))
        .map(r => Number(r.receipt_no.slice(prefix.length)))
        .filter(Number.isFinite)
    ) + 1;
    return `${prefix}${String(nextSequence).padStart(3, '0')}`;
  }
}
