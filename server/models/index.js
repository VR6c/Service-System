import mongoose from 'mongoose';

const BrandSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    brand_code: { type: String, required: true },
    brand_name: { type: String, required: true },
    logo_type: { type: String, default: 'byd' },
    logo_url: { type: String, default: '' },
    service_center_name: { type: String, default: '' },
    local_company_name: { type: String, default: '' },
    address: { type: String, default: '' },
    telephone: { type: String, default: '' },
    email: { type: String, default: '' },
    document_prefix: { type: String, default: '' },
    receipt_prefix: { type: String, default: '' },
    status: { type: String, default: 'Active' },
    created_at: { type: String },
    updated_at: { type: String }
  },
  { timestamps: true, strict: false }
);

const BranchSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    brand_id: { type: String, required: true },
    supported_brand_ids: { type: [String], default: [] },
    is_dual_brand: { type: Boolean, default: false },
    branch_code: { type: String, required: true },
    branch_name: { type: String, required: true },
    service_center_name: { type: String, default: '' },
    address: { type: String, default: '' },
    telephone: { type: String, default: '' },
    email: { type: String, default: '' },
    status: { type: String, default: 'Active' },
    created_at: { type: String },
    updated_at: { type: String }
  },
  { timestamps: true, strict: false }
);

const UserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    role: { type: String, default: 'Service Advisor' },
    brand_id: { type: String },
    branch_id: { type: String },
    branch: { type: String, default: '' },
    assigned_brand_ids: { type: [String], default: [] },
    active_brand_id: { type: String },
    status: { type: String, default: 'Active' },
    created_date: { type: String },
    default_brand_id: { type: String },
    default_branch_id: { type: String },
    default_sa: { type: String }
  },
  { timestamps: true, strict: false }
);

const QuotationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    quotation_no: { type: String, required: true },
    brand_id: { type: String, default: '' },
    branch_id: { type: String, default: '' },
    brand_name: { type: String, default: '' },
    branch_name: { type: String, default: '' },
    customer_name: { type: String, default: '' },
    phone: { type: String, default: '' },
    plate_no: { type: String, default: '' },
    vehicle_model: { type: String, default: '' },
    color: { type: String, default: '' },
    vin: { type: String, default: '' },
    mileage: { type: Number, default: 0 },
    battery: { type: String, default: '' },
    description: { type: String, default: '' },
    repair_recommendation: { type: String, default: '' },
    after_sale: { type: String, default: '' },
    address: { type: String, default: '' },
    fuel_gauge: { type: String, default: '' },
    fee_items: { type: Array, default: [] },
    subtotal: { type: Number, default: 0 },
    vat: { type: Number, default: 0 },
    total_amount: { type: Number, default: 0 },
    status: { type: String, default: 'Draft' },
    created_by: { type: String, default: '' },
    created_by_name: { type: String, default: '' },
    created_date: { type: String, default: '' },
    remind_date: { type: String },
    updated_at: { type: String }
  },
  { timestamps: true, strict: false }
);

// Performance indexes for faster query filtering and sorting
QuotationSchema.index({ createdAt: -1 });
QuotationSchema.index({ quotation_no: 1 });
QuotationSchema.index({ plate_no: 1 });
QuotationSchema.index({ brand_id: 1, status: 1 });

const ReceiptSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    receipt_no: { type: String, required: true },
    brand_id: { type: String, default: '' },
    branch_id: { type: String, default: '' },
    brand_name: { type: String, default: '' },
    branch_name: { type: String, default: '' },
    quotation_id: { type: String },
    customer_name: { type: String, default: '' },
    phone: { type: String, default: '' },
    plate_no: { type: String, default: '' },
    battery: { type: String, default: '' },
    vehicle_model: { type: String, default: '' },
    color: { type: String, default: '' },
    mileage: { type: Number, default: 0 },
    vin: { type: String, default: '' },
    buy_time: { type: String, default: '' },
    description: { type: String, default: '' },
    fee_items: { type: Array, default: [] },
    subtotal: { type: Number, default: 0 },
    vat: { type: Number, default: 0 },
    total_amount: { type: Number, default: 0 },
    completion: { type: Object },
    status: { type: String, default: 'Pending' },
    created_by: { type: String, default: '' },
    created_by_name: { type: String, default: '' },
    created_date: { type: String, default: '' },
    remind_date: { type: String },
    sa_name: { type: String },
    in_time: { type: String },
    out_time: { type: String },
    estimated_repaired_date: { type: String },
    is_owner: { type: Boolean },
    is_sender: { type: Boolean },
    warehouse_keeper: { type: String },
    service_reminder: { type: String },
    old_parts_action: { type: String },
    repair_confirm_customer: { type: String },
    updated_at: { type: String }
  },
  { timestamps: true, strict: false }
);

ReceiptSchema.index({ createdAt: -1 });
ReceiptSchema.index({ receipt_no: 1 });
ReceiptSchema.index({ plate_no: 1 });
ReceiptSchema.index({ brand_id: 1, status: 1 });

const SettingsSchema = new mongoose.Schema(
  {
    center_name: { type: String, default: '' },
    branch_name: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    vat_rate: { type: Number, default: 0.1 },
    currency_symbol: { type: String, default: '$' },
    quotation_prefix: { type: String, default: 'QT' },
    receipt_prefix: { type: String, default: 'RC' },
    terms_conditions: { type: String, default: '' },
    header_logo_type: { type: String, default: 'byd' },
    header_logo_url: { type: String, default: '' },
    byd_logo_url: { type: String, default: '' },
    denza_logo_url: { type: String, default: '' },
    receipt_header_english_title: { type: String, default: '' },
    receipt_header_khmer_title: { type: String, default: '' },
    quotation_header_english_title: { type: String, default: '' },
    quotation_header_khmer_title: { type: String, default: '' },
    quotation_deposit_term: { type: String, default: '' },
    quotation_payment_term: { type: String, default: '' },
    quotation_bank_details: { type: String, default: '' },
    quotation_expiration_term: { type: String, default: '' },
    quotation_terms: { type: String, default: '' },
    telegram_bot_token: { type: String, default: '' },
    telegram_chat_id: { type: String, default: '' },
    telegram_reminder_enabled: { type: Boolean, default: false }
  },
  { timestamps: true, strict: false }
);

export const BrandModel = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
export const BranchModel = mongoose.models.Branch || mongoose.model('Branch', BranchSchema);
export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const QuotationModel = mongoose.models.Quotation || mongoose.model('Quotation', QuotationSchema);
export const ReceiptModel = mongoose.models.Receipt || mongoose.model('Receipt', ReceiptSchema);
export const SettingsModel = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
