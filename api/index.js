import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import { connectDB } from '../server/db.js';
import {
  BrandModel,
  BranchModel,
  UserModel,
  QuotationModel,
  ReceiptModel,
  SettingsModel
} from '../server/models/index.js';

dotenv.config();

const app = express();

// High-performance gzip/deflate compression for API responses > 1KB
app.use(compression({ threshold: 1024 }));
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Normalize URL in case of Vercel serverless rewrite
app.use((req, res, next) => {
  if (req.originalUrl && req.url !== req.originalUrl) {
    req.url = req.originalUrl;
  }
  next();
});

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    await seedInitialDataIfNeeded();
    next();
  } catch (err) {
    console.error('Database connection failed:', err);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

// Seed Initial Data Helper with single-flight concurrency lock
let isSeeded = false;
let seedPromise = null;
async function seedInitialDataIfNeeded() {
  if (isSeeded) return;
  if (!seedPromise) {
    seedPromise = (async () => {
      try {
        const brandCount = await BrandModel.estimatedDocumentCount();
        if (brandCount === 0) {
      console.log('Seeding initial MongoDB data...');
      await BrandModel.insertMany([
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
      ]);

      await BranchModel.insertMany([
        {
          id: 'b-byd-6a',
          brand_id: 'brand-byd',
          supported_brand_ids: ['brand-byd', 'brand-denza'],
          is_dual_brand: true,
          branch_code: '6A',
          branch_name: 'BYD Chroy Changva 6A',
          service_center_name: 'BYD & DENZA Sales & Service Center 6A',
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
      ]);

      await UserModel.insertMany([
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
      ]);

      await SettingsModel.create({
        center_name: 'BYD SALES & SERVICE CENTER',
        branch_name: 'Chroy Changva 6A Branch',
        address: 'Lot No. 52, National Road 6A, Chroy Changva, Phnom Penh, Cambodia',
        phone: '+855 17 555 811 / +855 23 888 999',
        email: 'service.6a@automotive.com.kh',
        vat_rate: 0,
        currency_symbol: '$',
        quotation_prefix: 'BYD-QT',
        receipt_prefix: 'BYD60M',
        terms_conditions: 'This quotation is valid for 14 days from date of issue.',
        header_logo_type: 'byd',
        header_logo_url: '',
        byd_logo_url: '',
        denza_logo_url: '',
        receipt_header_english_title: 'BYD SALES & SERVICE CENTER',
        receipt_header_khmer_title: 'មិនអាចយកប្រកាសជាចំណាយឬប្រកាសពន្ធ',
        quotation_header_english_title: 'BYD SALES & SERVICE CENTER',
        quotation_header_khmer_title: 'មិនអាចយកប្រកាសជាចំណាយឬប្រកាសពន្ធ',
        quotation_deposit_term: 'កក់ប្រាក់ 30% ពេលព្រមព្រៀង',
        quotation_payment_term: 'ទូទាត់ប្រាក់ 70% ពេលទទួលបានសេវាកម្ម',
        quotation_bank_details: 'ABA Bank: 000 111 222 (BYD Cambodia)',
        quotation_expiration_term: 'សម្រង់តម្លៃនេះមានសុពលភាព 14 ថ្ងៃ',
        quotation_terms: 'សូមពិនិត្យព័ត៌មានលម្អិតមុនពេលធ្វើការអនុម័ត',
        telegram_bot_token: '',
        telegram_chat_id: '',
        telegram_reminder_enabled: false
      });
      console.log('Seeding completed.');
      }
      isSeeded = true;
    } catch (err) {
      console.error('Error seeding initial data:', err);
    } finally {
      seedPromise = null;
    }
  })();
  }
  return seedPromise;
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'MongoDB Connected' });
});

// BRANDS
app.get('/api/brands', async (req, res) => {
  try {
    const brands = await BrandModel.find().lean();
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/brands', async (req, res) => {
  try {
    const brand = await BrandModel.create(req.body);
    res.json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/brands/bulk', async (req, res) => {
  try {
    await BrandModel.deleteMany({});
    const brands = await BrandModel.insertMany(req.body);
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/brands/:id', async (req, res) => {
  try {
    const brand = await BrandModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, upsert: true });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/brands/:id', async (req, res) => {
  try {
    await BrandModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BRANCHES
app.get('/api/branches', async (req, res) => {
  try {
    const branches = await BranchModel.find().lean();
    const upgraded = branches.map(b => {
      const isDual = b.is_dual_brand || b.branch_code === '6A' || b.id === 'b-byd-6a' || b.id === 'b-denza-pp' || (b.branch_name && b.branch_name.toLowerCase().includes('6a'));
      return {
        ...b,
        is_dual_brand: isDual,
        supported_brand_ids: (b.supported_brand_ids && b.supported_brand_ids.length > 0)
          ? b.supported_brand_ids
          : (isDual ? ['brand-byd', 'brand-denza'] : (b.brand_id ? [b.brand_id] : ['brand-byd']))
      };
    });
    res.json(upgraded);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/branches', async (req, res) => {
  try {
    const branch = await BranchModel.create(req.body);
    res.json(branch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/branches/bulk', async (req, res) => {
  try {
    await BranchModel.deleteMany({});
    const branches = await BranchModel.insertMany(req.body);
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/branches/:id', async (req, res) => {
  try {
    const branch = await BranchModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, upsert: true });
    res.json(branch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/branches/:id', async (req, res) => {
  try {
    await BranchModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// USERS
app.get('/api/users', async (req, res) => {
  try {
    const users = await UserModel.find().lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = await UserModel.create(req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/bulk', async (req, res) => {
  try {
    await UserModel.deleteMany({});
    const users = await UserModel.insertMany(req.body);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await UserModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, upsert: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await UserModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function cleanQuotationData(q) {
  if (!q || typeof q !== 'object') return q;
  return {
    ...q,
    subtotal: Number(q.subtotal) || 0,
    vat: Number(q.vat) || 0,
    total_amount: Number(q.total_amount) || 0,
    mileage: Number(q.mileage) || 0,
    fee_items: Array.isArray(q.fee_items)
      ? q.fee_items.map((item, idx) => ({
          ...item,
          id: item?.id || `item-${idx}`,
          quantity: Number(item?.quantity) || 0,
          unit_price: Number(item?.unit_price) || 0,
          amount: Number(item?.amount) || 0
        }))
      : []
  };
}

function cleanReceiptData(r) {
  if (!r || typeof r !== 'object') return r;
  return {
    ...r,
    subtotal: Number(r.subtotal) || 0,
    vat: Number(r.vat) || 0,
    total_amount: Number(r.total_amount) || 0,
    mileage: Number(r.mileage) || 0,
    fee_items: Array.isArray(r.fee_items)
      ? r.fee_items.map((item, idx) => ({
          ...item,
          id: item?.id || `item-${idx}`,
          quantity: Number(item?.quantity) || 0,
          unit_price: Number(item?.unit_price) || 0,
          amount: Number(item?.amount) || 0
        }))
      : []
  };
}

// QUOTATIONS
app.get('/api/quotations', async (req, res) => {
  try {
    const quotations = await QuotationModel.find().sort({ createdAt: -1 }).lean();
    res.json(quotations.map(cleanQuotationData));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/quotations', async (req, res) => {
  try {
    const cleaned = cleanQuotationData(req.body);
    const quotation = await QuotationModel.create(cleaned);
    res.json(cleanQuotationData(quotation.toObject ? quotation.toObject() : quotation));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/quotations/bulk', async (req, res) => {
  try {
    await QuotationModel.deleteMany({});
    const cleanedList = Array.isArray(req.body) ? req.body.map(cleanQuotationData) : [];
    const quotations = await QuotationModel.insertMany(cleanedList);
    res.json(quotations.map(q => cleanQuotationData(q.toObject ? q.toObject() : q)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/quotations/:id', async (req, res) => {
  try {
    const cleaned = cleanQuotationData(req.body);
    const quotation = await QuotationModel.findOneAndUpdate({ id: req.params.id }, cleaned, { new: true, upsert: true }).lean();
    res.json(cleanQuotationData(quotation));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/quotations/:id', async (req, res) => {
  try {
    await QuotationModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RECEIPTS
app.get('/api/receipts', async (req, res) => {
  try {
    const receipts = await ReceiptModel.find().sort({ createdAt: -1 }).lean();
    res.json(receipts.map(cleanReceiptData));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/receipts', async (req, res) => {
  try {
    const cleaned = cleanReceiptData(req.body);
    const receipt = await ReceiptModel.create(cleaned);
    res.json(cleanReceiptData(receipt.toObject ? receipt.toObject() : receipt));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/receipts/bulk', async (req, res) => {
  try {
    await ReceiptModel.deleteMany({});
    const cleanedList = Array.isArray(req.body) ? req.body.map(cleanReceiptData) : [];
    const receipts = await ReceiptModel.insertMany(cleanedList);
    res.json(receipts.map(r => cleanReceiptData(r.toObject ? r.toObject() : r)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/receipts/:id', async (req, res) => {
  try {
    const cleaned = cleanReceiptData(req.body);
    const receipt = await ReceiptModel.findOneAndUpdate({ id: req.params.id }, cleaned, { new: true, upsert: true }).lean();
    res.json(cleanReceiptData(receipt));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/receipts/:id', async (req, res) => {
  try {
    await ReceiptModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SETTINGS
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await SettingsModel.findOne().lean();
    if (!settings) {
      settings = await SettingsModel.create({
        center_name: 'BYD SALES & SERVICE CENTER',
        vat_rate: 0,
        currency_symbol: '$'
      });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    let settings = await SettingsModel.findOne();
    if (settings) {
      Object.assign(settings, req.body);
      await settings.save();
    } else {
      settings = await SettingsModel.create(req.body);
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;

// If run directly via node server (local development)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5055;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
