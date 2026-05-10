import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'id' | 'ms' | 'ar' | 'hi' | 'sw' | 'tl';
export type Currency = 'USD' | 'IDR' | 'MYR' | 'SAR' | 'INR' | 'NGN' | 'KES' | 'PHP';

interface LocalizationState {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    subscribers: "Subscribers",
    sessions: "Live Tunnels",
    provision: "Provision",
    search: "Search ID/IP...",
    username: "Username / Login",
    password: "Password (Secret)",
    fullName: "Full Customer Name",
    address: "Installation Address",
    phone: "Contact Phone",
    cid: "Internal Account ID",
    profile: "Service Profile",
    limits: "Limit Queue",
    expiry: "Expiry Date & Time",
    notes: "Administrative Notes",
    commit: "Write Configuration to Core Database",
    established: "ESTABLISHED",
    operational: "OPERATIONAL",
    suspended: "SUSPENDED",
    testAuth: "Trigger Auth",
    terminate: "Terminate Session",
    status: "Status",
    bandwidth: "Bandwidth Profile",
    accountNumber: "Account Number",
    clear: "Clear (No Expiry)",
    success: "Operation Successful",
    error: "Error Occurred"
  },
  id: {
    dashboard: "Dasbor",
    subscribers: "Pelanggan",
    sessions: "Sesi Aktif",
    provision: "Tambahkan",
    search: "Cari ID/IP...",
    username: "Nama Pengguna",
    password: "Kata Sandi",
    fullName: "Nama Lengkap Pelanggan",
    address: "Alamat Instalasi",
    phone: "Telepon Kontak",
    cid: "ID Akun Internal",
    profile: "Profil Layanan",
    limits: "Batas Kecepatan",
    expiry: "Tanggal & Waktu Kedaluwarsa",
    notes: "Catatan Administratif",
    commit: "Simpan Konfigurasi ke Database Utama",
    established: "TERHUBUNG",
    operational: "OPERASIONAL",
    suspended: "DITANGGUHKAN",
    testAuth: "Tes Otentikasi",
    terminate: "Putuskan Sesi",
    status: "Status",
    bandwidth: "Profil Bandwidth",
    accountNumber: "Nomor Akun",
    clear: "Hapus (Tanpa Batas)",
    success: "Operasi Berhasil",
    error: "Terjadi Kesalahan"
  },
  ms: {
    dashboard: "Papan Pemuka",
    subscribers: "Pelanggan",
    sessions: "Sesi Aktif",
    provision: "Tambah",
    search: "Cari ID/IP...",
    username: "Nama Pengguna",
    password: "Kata Laluan",
    fullName: "Nama Penuh Pelanggan",
    address: "Alamat Pemasangan",
    phone: "Telefon Hubungan",
    cid: "ID Akaun Dalaman",
    profile: "Profil Perkhidmatan",
    limits: "Had Kelajuan",
    expiry: "Tarikh & Masa Tamat",
    notes: "Nota Pentadbiran",
    commit: "Simpan Konfigurasi ke Pangkalan Data Koa",
    established: "TERBINA",
    operational: "OPERASI",
    suspended: "DIGANTUNG",
    testAuth: "Uji Sah",
    terminate: "Tamatkan Sesi",
    status: "Status",
    bandwidth: "Profil Jalur Lebar",
    accountNumber: "Nombor Akaun",
    clear: "Kosongkan (Tiada Tamat)",
    success: "Operasi Berjaya",
    error: "Ralat Berlaku"
  },
  ar: {
    dashboard: "لوحة القيادة",
    subscribers: "المشتركون",
    sessions: "الجلسات النشطة",
    provision: "تزويد",
    search: "بحث ID/IP...",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    fullName: "اسم العميل بالكامل",
    address: "عنوان التركيب",
    phone: "هاتف الاتصال",
    cid: "معرف الحساب الداخلي",
    profile: "ملف الخدمة",
    limits: "حدود السرعة",
    expiry: "تاريخ ووقت الانتهاء",
    notes: "ملاحظات إدارية",
    commit: "كتابة الإعدادات إلى قاعدة البيانات",
    established: "متصل",
    operational: "يعمل",
    suspended: "معلق",
    testAuth: "اختبار المصادقة",
    terminate: "إنهاء الجلسة",
    status: "الحالة",
    bandwidth: "ملف النطاق الترددي",
    accountNumber: "رقم الحساب",
    clear: "مسح (بدون انتهاء)",
    success: "نجحت العملية",
    error: "حدث خطأ"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    subscribers: "ग्राहक",
    sessions: "सक्रिय सत्र",
    provision: "प्रावधान",
    search: "खोज ID/IP...",
    username: "उपयोगकर्ता नाम",
    password: "पासवर्ड",
    fullName: "ग्राहक का पूरा नाम",
    address: "स्थापना का पता",
    phone: "संपर्क फोन",
    cid: "आंतरिक खाता आईडी",
    profile: "सेवा प्रोफ़ाइल",
    limits: "सीमा कतार",
    expiry: "समाप्ति तिथि और समय",
    notes: "प्रशासनिक नोट्स",
    commit: "कोर डेटाबेस में कॉन्फ़िगरेशन लिखें",
    established: "स्थापित",
    operational: "परिचालन",
    suspended: "निलंबित",
    testAuth: "प्रमाणन ट्रिगर",
    terminate: "सत्र समाप्त करें",
    status: "स्थिति",
    bandwidth: "बैंडविड्थ प्रोफाइल",
    accountNumber: "खाता संख्या",
    clear: "साफ़ करें (कोई समाप्ति नहीं)",
    success: "ऑपरेशन सफल",
    error: "त्रुटि हुई"
  },
  sw: {
    dashboard: "Dashibodi",
    subscribers: "Wasajili",
    sessions: "Vifungu Hai",
    provision: "Andaa",
    search: "Tafuta ID/IP...",
    username: "Jina la Mtumiaji",
    password: "Nenosiri",
    fullName: "Jina Kamili la Mteja",
    address: "Anwani ya Usakinishaji",
    phone: "Simu ya Mawasiliano",
    cid: "Kitambulisho cha Akaunti",
    profile: "Wasifu wa Huduma",
    limits: "Foleni ya Kikomo",
    expiry: "Tarehe na Wakati wa Kumalizika",
    notes: "Maelezo ya Utawala",
    commit: "Andika Usanidi kwenye Hifadhidata",
    established: "IMEANZISHWA",
    operational: "INAFANYA KAZI",
    suspended: "IMESIMAMISHWA",
    testAuth: "Jaribu Uthibitishaji",
    terminate: "Sitisha Kipindi",
    status: "Hali",
    bandwidth: "Wasifu wa Bandwidth",
    accountNumber: "Nambari ya Akaunti",
    clear: "Futa (Hakuna Mwisho)",
    success: "Operesheni Imefanikiwa",
    error: "Hitilafu Imekuja"
  },
  tl: {
    dashboard: "Dashboard",
    subscribers: "Mga Subscriber",
    sessions: "Aktibong Sesyon",
    provision: "Magdagdag",
    search: "Maghanap ng ID/IP...",
    username: "Username / Login",
    password: "Password (Secret)",
    fullName: "Buong Pangalan ng Customer",
    address: "Address ng Instalasyon",
    phone: "Numero ng Telepono",
    cid: "Internal Account ID",
    profile: "Profile ng Serbisyo",
    limits: "Limitasyon sa Bilis",
    expiry: "Petsa at Oras ng Pag-expire",
    notes: "Administrative Notes",
    commit: "I-save ang Configuration sa Core Database",
    established: "NAKABUKAS",
    operational: "GUMAGANA",
    suspended: "SUPENDIDO",
    testAuth: "Subukan ang Auth",
    terminate: "Tapusin ang Sesyon",
    status: "Katayuan",
    bandwidth: "Bandwidth Profile",
    accountNumber: "Numero ng Account",
    clear: "I-clear (Walang Expiry)",
    success: "Tagumpay ang Operasyon",
    error: "May Naganap na Error"
  }
};

const LocalizationContext = createContext<LocalizationState | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'en');
  const [currency, setCurrency] = useState<Currency>(() => (localStorage.getItem('curr') as Currency) || 'USD');

  useEffect(() => {
    localStorage.setItem('lang', language);
    localStorage.setItem('curr', currency);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, currency]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LocalizationContext.Provider value={{ 
      language, 
      currency, 
      setLanguage, 
      setCurrency, 
      t, 
      isRTL: language === 'ar' 
    }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) throw new Error('useLocalization must be used within LocalizationProvider');
  return context;
};
