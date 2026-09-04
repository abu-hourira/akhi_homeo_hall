// Preloaded Homeopathic Remedies Database for Akhi Homeo Hall (আঁখি হোমিও হল)
const DEFAULT_REMEDIES = [
  { id: 'rem_1', name: 'Aconitum Napellus (Aconite)', banglaName: 'একোনাইট নেপেলাস', potencies: ['Q', '30C', '200C', '1M'], category: 'Dilution', rack: 'A-01', indication: 'হঠাৎ তীব্র জ্বর, ভয়, অস্থিরতা, ঠান্ডা বাতাসে কাশি', stock: 12 },
  { id: 'rem_2', name: 'Arnica Montana', banglaName: 'আর্নিকা মন্টানা', potencies: ['Q', '30C', '200C', '1M', '10M'], category: 'Mother Tincture / Dilution', rack: 'A-02', indication: 'আঘাত লাগা, থেঁতলে যাওয়া ব্যথা, পেশীর ক্লান্তি, রক্ত জমাট', stock: 25 },
  { id: 'rem_3', name: 'Arsenicum Album', banglaName: 'আর্সেনিক অ্যালবাম', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'A-03', indication: 'ফুড পয়জনিং, ডায়রিয়া, জ্বালাকর পেটব্যথা, ঘনঘন অল্প পানি পিপাসা', stock: 18 },
  { id: 'rem_4', name: 'Belladonna', banglaName: 'বেলাডোনা', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'B-01', indication: 'উচ্চ জ্বর, লালচে মুখমণ্ডল, গলাব্যথা, টনসিলাইটিস, তীব্র মাথাব্যথা', stock: 15 },
  { id: 'rem_5', name: 'Bryonia Alba', banglaName: 'ব্রায়োনিয়া অ্যালবা', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'B-02', indication: 'নড়াচড়ায় বৃদ্ধি, শুষ্ক কাশি, অতিরিক্ত পানি পিপাসা, কোষ্ঠকাঠিন্য', stock: 14 },
  { id: 'rem_6', name: 'Calcarea Carbonica', banglaName: 'ক্যালকেরিয়া কার্ব', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'C-01', indication: 'স্থূলতা, মাথায় ঘাম, ঠান্ডা লাগার প্রবণতা, শিশুদের দেরিতে হাঁটা ও দাঁত ওঠা', stock: 10 },
  { id: 'rem_7', name: 'Calcarea Phosphorica', banglaName: 'ক্যালকেরিয়া ফস', potencies: ['6X', '12X', '30X', '200X'], category: 'Biochemic', rack: 'BIO-01', indication: 'হাড়ের দুর্বলতা, ক্যালসিয়াম ঘাটতি, রক্তস্বল্পতা, রিকেট', stock: 30 },
  { id: 'rem_8', name: 'Cantharis', banglaName: 'ক্যান্থারিস', potencies: ['Q', '30C', '200C'], category: 'Dilution / MT', rack: 'C-02', indication: 'প্রস্রাবে প্রচণ্ড জ্বালাপোড়া, ইউরিনারি ইনফেকশন (UTI), আগুনে পোড়া ঘা', stock: 8 },
  { id: 'rem_9', name: 'Carbo Vegetabilis', banglaName: 'কার্বো ভেজ', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'C-03', indication: 'পেটে গ্যাস, পেট ফাঁপা, শীতল শরীর কিন্তু মুক্ত বাতাস চায়, বদহজম', stock: 16 },
  { id: 'rem_10', name: 'Chamomilla', banglaName: 'ক্যামোমিলা', potencies: ['30C', '200C'], category: 'Dilution', rack: 'C-04', indication: 'শিশুদের দাঁত ওঠার সময়ের খিটখিটে মেজাজ ও ডায়রিয়া, অসহ্য ব্যথা', stock: 11 },
  { id: 'rem_11', name: 'Cinchona Officinalis (China)', banglaName: 'চায়না অফিসিনালিস', potencies: ['Q', '30C', '200C'], category: 'Dilution / MT', rack: 'C-05', indication: 'অতিরিক্ত রক্তক্ষরণ বা তরল ক্ষয়ের পর দুর্বলতা, ম্যালেরিয়া জ্বর, গ্যাস', stock: 20 },
  { id: 'rem_12', name: 'Dulcamara', banglaName: 'ডালকামারা', potencies: ['30C', '200C'], category: 'Dilution', rack: 'D-01', indication: 'বৃষ্টি বা স্যাঁতসেঁতে আবহাওয়ায় রোগবৃদ্ধি, বাতব্যথা, ঠান্ডা লাগা', stock: 9 },
  { id: 'rem_13', name: 'Ferrum Phosphoricum', banglaName: 'ফেরাম ফস', potencies: ['6X', '12X', '30X'], category: 'Biochemic', rack: 'BIO-02', indication: 'জ্বরের প্রথম পর্যায়, রক্তস্বল্পতা (Anemia), প্রদাহ, দুর্বলতা', stock: 22 },
  { id: 'rem_14', name: 'Gelsemium', banglaName: 'জেলসিমিয়াম', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'G-01', indication: 'মাথাঘোরা, তন্দ্রাচ্ছন্নতা, ভীতি বা পরীক্ষার পূর্বে বুক ধড়ফড় ও ডায়রিয়া', stock: 14 },
  { id: 'rem_15', name: 'Hepar Sulphuris Calcareum', banglaName: 'হিপার সালফ', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'H-01', indication: 'ফোঁড়া, পুঁজ সৃষ্টি, ঠান্ডায় অতি সংবেদনশীলতা, গলায় কাঁটা ফোটার মত ব্যথা', stock: 12 },
  { id: 'rem_16', name: 'Hypericum Perforatum', banglaName: 'হাইপেরিকাম', potencies: ['Q', '30C', '200C', '1M'], category: 'Dilution / MT', rack: 'H-02', indication: 'স্নায়ু বা নার্ভে আঘাত (যেমন আঙ্গুল চাপা পড়া, সুচ ফোটা), স্পাইনাল ইনজুরি', stock: 15 },
  { id: 'rem_17', name: 'Ignatia Amara', banglaName: 'ইগনেশিয়া', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'I-01', indication: 'শোক, দুঃখ, মানসিক আঘাত, হিস্ট্রিয়া, ঘন ঘন দীর্ঘশ্বাস ফেলা', stock: 10 },
  { id: 'rem_18', name: 'Kali Bichromicum', banglaName: 'কালি বাইক্রমিকাম', potencies: ['30C', '200C'], category: 'Dilution', rack: 'K-01', indication: 'সাইনাসাইটিস, আঠালো ঘন কফ ও সর্দি, পেটের আলসার', stock: 8 },
  { id: 'rem_19', name: 'Kali Muriaticum', banglaName: 'কালি মিউর', potencies: ['6X', '12X'], category: 'Biochemic', rack: 'BIO-03', indication: 'জিহ্বায় সাদা প্রলেপ, কানের সংক্রমণ, চর্মরোগ, খুশকি', stock: 19 },
  { id: 'rem_20', name: 'Lachesis Mutus', banglaName: 'ল্যাকেসিস', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'L-01', indication: 'বামদিকের সমস্যা, গলায় টাইট পোশাক অপছন্দ, মেনোপজের জটিলতা, হিংসুটে ভাব', stock: 7 },
  { id: 'rem_21', name: 'Lycopodium Clavatum', banglaName: 'লাইকোপোডিয়াম', potencies: ['30C', '200C', '1M', '10M'], category: 'Dilution', rack: 'L-02', indication: 'বিকাল ৪টা-৮টায় বৃদ্ধি, পেটের নিচের অংশে গ্যাস, লিভার ও প্রস্রাবের রোগ', stock: 18 },
  { id: 'rem_22', name: 'Magnesia Phosphorica', banglaName: 'ম্যাগনেশিয়া ফস', potencies: ['6X', '12X', '30X'], category: 'Biochemic', rack: 'BIO-04', indication: 'মাসিক বা পেটের তীব্র খিঁচুনিযুক্ত ব্যথা (গরম সেকে উপশম), সায়াটিকা', stock: 24 },
  { id: 'rem_23', name: 'Natrum Muriaticum', banglaName: 'ন্যাট্রাম মিউর', potencies: ['30C', '200C', '1M', '6X', '12X'], category: 'Dilution / Biochemic', rack: 'N-01', indication: 'লবণ খাওয়ার তীব্র ইচ্ছা, মানসিক হতাশা, রোদে মাথাব্যথা, একজিমা', stock: 17 },
  { id: 'rem_24', name: 'Natrum Sulphuricum', banglaName: 'ন্যাট্রাম সালফ', potencies: ['6X', '12X', '30C', '200C'], category: 'Dilution / Biochemic', rack: 'BIO-05', indication: 'স্যাঁতসেঁতে আবহাওয়ায় হাঁপানি/অ্যাজমা, লিভারের সমস্যা, পিত্তবমি', stock: 15 },
  { id: 'rem_25', name: 'Nux Vomica', banglaName: 'নাক্স ভমিকা', potencies: ['30C', '200C', '1M', '10M'], category: 'Dilution', rack: 'N-02', indication: 'অতিরিক্ত ধূমপান/মশলাযুক্ত খাবারে বদহজম, কোষ্ঠকাঠিন্য, রাগ, অনিদ্রা', stock: 35 },
  { id: 'rem_26', name: 'Phosphorus', banglaName: 'ফসফরাস', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'P-01', indication: 'ঠান্ডা পানীয়র ইচ্ছা, রক্তক্ষরণের প্রবণতা, ফুসফুসের সংক্রমণ, উদ্বেগ', stock: 14 },
  { id: 'rem_27', name: 'Pulsatilla Nigricans', banglaName: 'পালসেটিলা', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'P-02', indication: 'পিপাসাহীনতা, পরিবর্তনশীল লক্ষণ, নরম মেজাজ, মুক্ত বাতাসে উপশম, অনিয়মিত মাসিক', stock: 22 },
  { id: 'rem_28', name: 'Rhus Toxicodendron', banglaName: 'রাস টক্স', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'R-01', indication: 'প্রথম নড়াচড়ায় কষ্ট কিন্তু অনবরত চললে উপশম, বাতব্যথা, ভিজে জ্বর', stock: 26 },
  { id: 'rem_29', name: 'Ruta Graveolens', banglaName: 'রুটা গ্র্যাভিওলেন্স', potencies: ['Q', '30C', '200C'], category: 'Dilution / MT', rack: 'R-02', indication: 'টেন্ডন, লিগামেন্ট ও চোখের স্নায়ুর চাপ/ব্যথা, মচকানো চোট', stock: 13 },
  { id: 'rem_30', name: 'Sepia Officinalis', banglaName: 'সিপিয়া', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'S-01', indication: 'জরায়ু ও হরমোনজনিত সমস্যা, মুখে মেছতা/দাগ, পরিবারের প্রতি অনীহা', stock: 10 },
  { id: 'rem_31', name: 'Silicea (Silica)', banglaName: 'সাইলেসিয়া', potencies: ['6X', '12X', '30C', '200C', '1M'], category: 'Dilution / Biochemic', rack: 'S-02', indication: 'পুঁজ দূরীকরণ, ফোড়া পাকানো ও ফাটানো, অতিরিক্ত পায়ে ঘাম, দুর্বল নখ', stock: 16 },
  { id: 'rem_32', name: 'Spongia Tosta', banglaName: 'স্পঞ্জিয়া টোস্টা', potencies: ['30C', '200C'], category: 'Dilution', rack: 'S-03', indication: 'কাঠ চেরার মত শুকনো খুশখুশে কাশি (Croup), শ্বাসনালীতে সাঁসাঁ শব্দ', stock: 9 },
  { id: 'rem_33', name: 'Sulphur', banglaName: 'সালফার', potencies: ['30C', '200C', '1M', '10M'], category: 'Dilution', rack: 'S-04', indication: 'চুলকানি ও চর্মরোগ (গোসলে বাড়ে), মাথায় ও তালুতে জ্বালাপোড়া, সকালের ক্ষুধা', stock: 28 },
  { id: 'rem_34', name: 'Syzygium Jambolanum', banglaName: 'সাইজিজিয়াম জাম্বোলানাম', potencies: ['Q'], category: 'Mother Tincture', rack: 'MT-01', indication: 'ডায়াবেটিস নিয়ন্ত্রণ, রক্তে গ্লুকোজ হ্রাস, অতিরিক্ত প্রস্রাবের বেগ', stock: 20 },
  { id: 'rem_35', name: 'Thuja Occidentalis', banglaName: 'থুজা অক্সিডেন্টালিস', potencies: ['Q', '30C', '200C', '1M', '10M'], category: 'Dilution / MT', rack: 'T-01', indication: 'আঁচিল (Warts), টিউমার, পলিপ, টিকাদানের কুফল, চর্মের অস্বাভাবিক বৃদ্ধি', stock: 32 },
  { id: 'rem_36', name: 'Crataegus Oxyacantha', banglaName: 'ক্র্যাটেগাস অক্সি', potencies: ['Q'], category: 'Mother Tincture', rack: 'MT-02', indication: 'হার্টের টনিক, রক্তচাপ ও বুক ধড়ফড় নিয়ন্ত্রণ, হৃদযন্ত্রের শক্তি বৃদ্ধি', stock: 15 },
  { id: 'rem_37', name: 'Passiflora Incarnata', banglaName: 'প্যাসিফ্লোরা ইনকারনাটা', potencies: ['Q'], category: 'Mother Tincture', rack: 'MT-03', indication: 'অনিদ্রা (Insomnia), মানসিক অস্থিরতা, অতিরিক্ত চিন্তা দূরীকরণ', stock: 18 },
  { id: 'rem_38', name: 'Berberis Vulgaris', banglaName: 'বারবারিস ভালগারিস', potencies: ['Q', '30C', '200C'], category: 'Mother Tincture / Dilution', rack: 'MT-04', indication: 'কিডনি স্টোন (Kidney Stone), মূত্রনালীর তীব্র ব্যথা, পিঠের নিচের ব্যথা', stock: 24 },
  { id: 'rem_39', name: 'Ocimum Sanctum (Tulsi)', banglaName: 'অসিমাম স্যাঙ্কটাম (তুলসী)', potencies: ['Q'], category: 'Mother Tincture', rack: 'MT-05', indication: 'সর্দি, কাশি, ফ্লু ও সাধারণ ভাইরাল জ্বর', stock: 16 },
  { id: 'rem_40', name: 'Ashwagandha (Withania Somnifera)', banglaName: 'অশ্বগন্ধা', potencies: ['Q'], category: 'Mother Tincture', rack: 'MT-06', indication: 'শারীরিক ও স্নায়বিক দুর্বলতা, শুক্রতারল্য, জীবনীশক্তি বৃদ্ধি', stock: 22 }
];

// Sample Initial Patients for demonstration
const SAMPLE_PATIENTS = [
  {
    id: 'pat_1001',
    regNo: 'AHH-2026-001',
    name: 'মো: রফিকুল ইসলাম (Md. Rafiqul Islam)',
    age: '42',
    gender: 'পুরুষ (Male)',
    mobile: '01712-345678',
    address: 'মিরপুর-১০, ঢাকা (Mirpur, Dhaka)',
    bloodGroup: 'B+',
    chiefComplaint: 'দীর্ঘদিনের গ্যাস্ট্রিক ও অম্লরোগ, পেট ফাঁপা, খাবার পর অস্বস্তি।',
    symptoms: 'অতিরিক্ত রাত জাগা, মসলাযুক্ত খাওয়ার অভ্যাস, সকালে পায়খানা পরিষ্কার না হওয়া, সামান্য বিষয়ে রাগ।',
    modalities: 'অতিরিক্ত মানসিক চাপে বৃদ্ধি, মলত্যাগের পর সাময়িক উপশম।',
    prescriptions: [
      {
        date: '2026-09-02',
        medicines: [
          { name: 'Nux Vomica', potency: '200C', dosage: '৪ ফোঁটা করে দিনে ২ বার (সকালে খালি পেটে ও রাতে শোবার আগে)', days: '৭ দিন' },
          { name: 'Carbo Veg', potency: '30C', dosage: '৪ ফোঁটা করে দুপুরে খাবার পূর্বে', days: '৭ দিন' }
        ],
        advice: 'ভাজাপোড়া ও অতিরিক্ত চা-সিগারেট পরিহার করবেন। প্রচুর পানি পান করবেন।',
        totalFee: 350,
        paid: 350,
        due: 0,
        nextVisit: '2026-09-09'
      }
    ],
    notes: 'খুব ভালো ফলাফল পাওয়ার সম্ভাবনা রয়েছে। রোগীর মেজাজ খিটখিটে।'
  },
  {
    id: 'pat_1002',
    regNo: 'AHH-2026-002',
    name: 'মোসাম্মৎ পারভীন আক্তার (Mst. Parveen Akhter)',
    age: '28',
    gender: 'মহিলা (Female)',
    mobile: '01890-112233',
    address: 'উত্তরা সেক্টর ৭, ঢাকা',
    bloodGroup: 'O+',
    chiefComplaint: 'গলা ও ঘাড়ে ছোট ছোট আঁচিল (Warts), খুশকি ও চুল পড়া।',
    symptoms: 'দেহের একাধিক স্থানে মাংসাঙ্কুর/আঁচিল, শীতকাতরতা, গোসলে অনিচ্ছা।',
    modalities: 'স্যাঁতসেঁতে ঠান্ডা আবহাওয়ায় বাড়ে।',
    prescriptions: [
      {
        date: '2026-09-03',
        medicines: [
          { name: 'Thuja Occidentalis', potency: '1M', dosage: 'সপ্তাহে ১ মাত্রা (রবিবার সকালে খালি পেটে)', days: '১৪ দিন' },
          { name: 'Thuja Q (External)', potency: 'Q', dosage: 'তুলা দিয়ে আঁচিলে প্রতিদিন রাতে লাগানো', days: '১৪ দিন' }
        ],
        advice: 'আঁচিল নখ দিয়ে চুলকাবেন না বা কাটবেন না।',
        totalFee: 500,
        paid: 300,
        due: 200,
        nextVisit: '2026-09-17'
      }
    ],
    notes: 'বাকি ২০০ টাকা পরবর্তী ভিজিটে পরিশোধ করবেন।'
  }
];

// Sample Initial Daily Transactions
const SAMPLE_TRANSACTIONS = [
  {
    id: 'txn_1',
    date: '2026-09-04',
    type: 'sale', // 'sale', 'expense'
    category: 'ঔষধ বিক্রয় (Medicine Sale)',
    patientName: 'মো: রফিকুল ইসলাম',
    mobile: '01712-345678',
    amount: 350,
    paid: 350,
    due: 0,
    note: 'Nux Vomica 200C ও Carbo Veg 30C'
  },
  {
    id: 'txn_2',
    date: '2026-09-04',
    type: 'sale',
    category: 'ফি ও ঔষধ (Consultation & Med)',
    patientName: 'মোসাম্মৎ পারভীন আক্তার',
    mobile: '01890-112233',
    amount: 500,
    paid: 300,
    due: 200,
    note: 'Thuja 1M + Thuja Q এক্সটারনাল (২০০ টাকা বাকি)'
  },
  {
    id: 'txn_3',
    date: '2026-09-04',
    type: 'expense',
    category: 'দোকান খরচ (Shop Expense)',
    patientName: '-',
    mobile: '-',
    amount: 120,
    paid: 120,
    due: 0,
    note: 'তুলা, খালি শিশি ও ড্রপার ক্রয়'
  }
];
