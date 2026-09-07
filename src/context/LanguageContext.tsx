import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'km';

export interface Translations {
  // Common Navigation
  dashboard: string;
  quotations: string;
  receipts: string;
  createReceipt: string;
  createQuotation: string;
  reports: string;
  management: string;
  brands: string;
  branches: string;
  users: string;
  settings: string;
  logout: string;

  // Header & User Selector
  activeRole: string;
  switchUser: string;
  language: string;

  // Receipt Form Section Headings
  receiptInformation: string;
  customerVehicle: string;
  serviceRequest: string;
  repairFee: string;
  additionalDetails: string;
  completeDelivery: string;

  // Form Fields
  receiptNo: string;
  brand: string;
  branch: string;
  saName: string;
  inTime: string;
  outTime: string;
  customerName: string;
  phone: string;
  plateNo: string;
  vehicleModel: string;
  color: string;
  batteryCondition: string;
  mileage: string;
  vinNumber: string;
  buyTime: string;
  serviceDescription: string;
  
  // Fee Table
  sparePart: string;
  sapNo: string;
  quantity: string;
  price: string;
  stock: string;
  warranty: string;
  subtotal: string;
  vat: string;
  totalAmount: string;

  // Staff & Roles
  technician: string;
  finishedDate: string;
  qaInspector: string;
  assManager: string;
  warehouseKeeper: string;
  deliveryDate: string;
  deliveryPerson: string;
  accountingStatus: string;
  customerConfirm: string;

  // Actions
  saveDraft: string;
  previewA4: string;
  saveGenerate: string;
  resetForm: string;
  print: string;
  downloadPdf: string;
  autoFilledProfile: string;
}

const translations: Record<Language, Translations> = {
  en: {
    dashboard: 'Dashboard',
    quotations: 'Quotations',
    receipts: 'Receipts',
    createReceipt: 'Create Receipt',
    createQuotation: 'Create Quotation',
    reports: 'Reports',
    management: 'Management',
    brands: 'Brands',
    branches: 'Branches',
    users: 'User Management',
    settings: 'Settings',
    logout: 'Logout',

    activeRole: 'Active Role',
    switchUser: 'Switch User',
    language: 'Language',

    receiptInformation: '1. Receipt Information',
    customerVehicle: '2. Customer & Vehicle Information',
    serviceRequest: '3. Service Request / Customer Complaints',
    repairFee: '4. Repair and Charge Fee',
    additionalDetails: '5. Additional Service Details',
    completeDelivery: '6. Complete & Delivery Signatures',

    receiptNo: 'Receipt No.',
    brand: 'Brand',
    branch: 'Branch',
    saName: 'Service Advisor (SA)',
    inTime: 'In Time',
    outTime: 'Out Time',
    customerName: 'Customer Name',
    phone: 'Phone Number',
    plateNo: 'Plate Number',
    vehicleModel: 'Vehicle Model',
    color: 'Color',
    batteryCondition: 'Battery Condition',
    mileage: 'Mileage (km)',
    vinNumber: 'VIN Number',
    buyTime: 'Buy Time',
    serviceDescription: 'Service Description / Customer Request',

    sparePart: 'Spare Part / Description',
    sapNo: 'SAP No.',
    quantity: 'Quantity',
    price: 'Price ($)',
    stock: 'Stock',
    warranty: 'Warranty',
    subtotal: 'Subtotal',
    vat: 'VAT (10%)',
    totalAmount: 'Total (USD)',

    technician: 'Technician',
    finishedDate: 'Finished Date',
    qaInspector: 'QA Inspector',
    assManager: 'ASS-Manager Confirm',
    warehouseKeeper: 'Warehouse Keeper',
    deliveryDate: 'Delivery Date',
    deliveryPerson: 'Delivery Person',
    accountingStatus: 'Accounting Status',
    customerConfirm: 'Delivery Confirm by Customer',

    saveDraft: 'Save Draft',
    previewA4: 'Preview A4 Receipt',
    saveGenerate: 'Save & Generate Receipt',
    resetForm: 'Reset Form',
    print: 'Print Document',
    downloadPdf: 'Download PDF',
    autoFilledProfile: '✓ Auto-filled from User Profile'
  },
  km: {
    dashboard: 'ផ្ទាំងបញ្ជា (Dashboard)',
    quotations: 'ប្រកាសតម្លៃ (Quotations)',
    receipts: 'បង្កាន់ដៃ (Receipts)',
    createReceipt: 'បង្កើតបង្កាន់ដៃ',
    createQuotation: 'បង្កើតប្រកាសតម្លៃ',
    reports: 'របាយការណ៍',
    management: 'ការគ្រប់គ្រង (Management)',
    brands: 'គ្រប់គ្រងម៉ាក (Brands)',
    branches: 'គ្រប់គ្រងសាខា (Branches)',
    users: 'គ្រប់គ្រងអ្នកប្រើប្រាស់',
    settings: 'ការកំណត់ (Settings)',
    logout: 'ចាកចេញ',

    activeRole: 'តួនាទីសកម្ម',
    switchUser: 'ផ្លាស់ប្តូរអ្នកប្រើប្រាស់',
    language: 'ភាសា (Language)',

    receiptInformation: '១. ព័ត៌មានបង្កាន់ដៃ',
    customerVehicle: '២. ព័ត៌មានអតិថិជន និងយានយន្ត',
    serviceRequest: '៣. ការស្នើសុំសេវាកម្ម / បណ្តឹងតវ៉ារបស់អតិថិជន',
    repairFee: '៤. តម្លៃជួសជុល និងសេវាកម្ម',
    additionalDetails: '៥. ព័ត៌មានសេវាកម្មបន្ថែម',
    completeDelivery: '៦. ការបញ្ចប់ និងហត្ថលេខាប្រគល់យានយន្ត',

    receiptNo: 'លេខបង្កាន់ដៃ',
    brand: 'ម៉ាករថយន្ត (Brand)',
    branch: 'សាខា (Branch)',
    saName: 'ទីប្រឹក្សាសេវាកម្ម (SA)',
    inTime: 'ម៉ោងចូល (In Time)',
    outTime: 'ម៉ោងចេញ (Out Time)',
    customerName: 'ឈ្មោះអតិថិជន',
    phone: 'លេខទូរស័ព្ទ',
    plateNo: 'ស្លាកលេខរថយន្ត',
    vehicleModel: 'ម៉ូដែលរថយន្ត',
    color: 'ពណ៌',
    batteryCondition: 'ស្ថានភាពអាគុយ (Battery)',
    mileage: 'ចម្ងាយចរ Mileage (km)',
    vinNumber: 'លេខ VIN',
    buyTime: 'កាលបរិច្ឆេទទិញ (Buy Time)',
    serviceDescription: 'ការស្នើសុំសេវាកម្ម / បណ្តឹងតវ៉ារបស់អតិថិជន',

    sparePart: 'គ្រឿងបន្លាស់ / បរិយាយសេវាកម្ម',
    sapNo: 'លេខ SAP No.',
    quantity: 'បរិមាណ (Qty)',
    price: 'តម្លៃ ($)',
    stock: 'ស្តុក (Stock)',
    warranty: 'ការធានា (Warranty)',
    subtotal: 'សរុបរង (Subtotal)',
    vat: 'ពន្ធ VAT (10%)',
    totalAmount: 'សរុបរួម (USD)',

    technician: 'ជាងបច្ចេកទេស (Technician)',
    finishedDate: 'កាលបរិច្ឆេទរួចរាល់',
    qaInspector: 'អ្នកពិនិត្យគុណភាព (QA)',
    assManager: 'ប្រធានអ្នកគ្រប់គ្រង (ASS-Manager)',
    warehouseKeeper: 'អ្នកឃ្លាំង (Warehouse)',
    deliveryDate: 'កាលបរិច្ឆេទប្រគល់',
    deliveryPerson: 'អ្នកប្រគល់រថយន្ត',
    accountingStatus: 'ស្ថានភាពគណនេយ្យ',
    customerConfirm: 'ការទទួលស្គាល់ពីអតិថិជន',

    saveDraft: 'រក្សាទុកព្រាង',
    previewA4: 'មើលគំរូបង្កាន់ដៃ A4',
    saveGenerate: 'រក្សាទុក & បង្កើតបង្កាន់ដៃ',
    resetForm: 'កំណត់ឡើងវិញ',
    print: 'បោះពុម្ព (Print)',
    downloadPdf: 'ទាញយក PDF',
    autoFilledProfile: '✓ បំពេញស្វ័យប្រវត្តិតាមប្រវត្តិរូប'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('byd_app_lang');
    return saved === 'km' ? 'km' : 'en';
  });

  useEffect(() => {
    document.documentElement.lang = language;
    if (language === 'km') {
      document.body.classList.add('lang-km');
    } else {
      document.body.classList.remove('lang-km');
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('byd_app_lang', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
