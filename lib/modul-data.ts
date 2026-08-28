export interface NodeQuestion {
  question: string;
  options: { value: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

export interface ModulNode {
  id: number;
  bagianId: number; // 1, 2, 3, 4
  bagianTitle: string;
  title: string;
  type: 'bacaan' | 'kuis' | 'komitmen';
  pilar: 'Pengetahuan' | 'Kemauan' | 'Kemampuan';
  konsepInti: string;
  contoh: string;
  question?: NodeQuestion;
  xpReward: number;
  coinReward: number;
}

export const BAGIAN_INFO = [
  { id: 1, title: 'Mengenal Sampah', desc: 'Pondasi dasar pemilahan sampah di sekolah (Adiwiyata)' },
  { id: 2, title: 'Dampak Lingkungan', desc: 'Memahami ancaman nyata bagi bumi dan kesehatan kita' },
  { id: 3, title: 'Solusi & Aksi', desc: 'Prinsip 3R dan pentingnya pemilahan sejak dari sumber' },
  { id: 4, title: 'Gaya Hidup Hijau', desc: 'Bank Sampah, ekonomi sirkular, dan komitmen pribadi' },
  { id: 5, title: 'Pengolahan Sampah Kreatif', desc: 'Metode pengomposan, biokonversi maggot, dan daur ulang kreatif' },
  { id: 6, title: 'Gerakan Sekolah Adiwiyata', desc: 'Kantin sehat bebas plastik, audit sampah, dan duta lingkungan' },
  { id: 7, title: 'Aksi Komunitas & Masa Depan', desc: 'Ekonomi sirkular skala luas, inovasi teknologi, dan kolaborasi global' },
  { id: 8, title: 'Pengelolaan Sampah Khusus & B3', desc: 'Bahaya limbah elektronik, baterai, medis, dan drop box spesifik' },
  { id: 9, title: 'Konservasi Energi & Jejak Karbon', desc: 'Hubungan sampah dengan emisi karbon, energi bersih, dan gaya hidup hemat' },
  { id: 10, title: 'Duta & Inovator Lingkungan Global', desc: 'Kepemimpinan hijau, kampanye digital, dan ikrar agung kelestarian bumi' }
];

export const RANK_TIERS = [
  { name: 'Rookie', minXp: 0, maxXp: 39, color: 'text-slate-500 bg-slate-100 border-slate-300' },
  { name: 'Explorer', minXp: 40, maxXp: 79, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  { name: 'Guardian', minXp: 80, maxXp: 119, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { name: 'Warrior', minXp: 120, maxXp: 179, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { name: 'Champion', minXp: 180, maxXp: 239, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { name: 'Legend', minXp: 240, maxXp: 9999, color: 'text-amber-600 bg-amber-50 border-amber-200 animate-pulse' }
];

export function getRankTier(xp: number) {
  return RANK_TIERS.find(t => xp >= t.minXp && xp <= t.maxXp) || (xp >= 240 ? RANK_TIERS[5] : RANK_TIERS[0]);
}

export const MODUL_DATA: ModulNode[] = [
  // ===== BAGIAN 1 — MENGENAL SAMPAH =====
  {
    id: 1,
    bagianId: 1,
    bagianTitle: 'Mengenal Sampah',
    title: 'Apa itu Sampah & Klasifikasi UU',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'UU No. 18/2008 membagi sampah menjadi 3 kelompok: 1. Sampah rumah tangga (dari kegiatan sehari-hari di rumah tangga). 2. Sampah sejenis rumah tangga (dari fasilitas komersial, industri, atau fasilitas umum seperti sekolah dan pasar). 3. Sampah spesifik (membutuhkan penanganan khusus karena sifat/konsentrasinya seperti baterai bekas, lampu neon/LED pecah, obat kadaluarsa, sisa cat/tinner, atau elektronik kecil rusak). ThinkBin secara fisik menangani sampah rumah tangga dan sejenis rumah tangga yang dipilah menjadi Organik dan Anorganik di tong sekolah. Sampah spesifik sengaja tidak masuk ke tong ThinkBin agar tidak mencemari sampah daur ulang dan membahayakan petugas kebersihan.',
    contoh: 'Sisa makanan di kantin sekolah = sampah sejenis rumah tangga. Bungkus jajanan = sampah sejenis rumah tangga anorganik. Baterai jam tangan bekas yang menempel di kotak pensil siswa = sampah spesifik (harus dibawa pulang atau diserahkan ke drop-box limbah baterai khusus).',
    question: {
      question: 'Sampah dari kantin sekolah termasuk kategori apa menurut UU No. 18/2008?',
      options: [
        { value: 'A', text: 'Rumah tangga' },
        { value: 'B', text: 'Sejenis rumah tangga' },
        { value: 'C', text: 'Spesifik' },
        { value: 'D', text: 'Bukan termasuk ketiganya' }
      ],
      correctAnswer: 'B',
      explanation: 'Menurut UU No. 18/2008, sampah dari kawasan fasilitas umum seperti kantin sekolah diklasifikasikan sebagai sampah sejenis rumah tangga.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 2,
    bagianId: 1,
    bagianTitle: 'Mengenal Sampah',
    title: 'Sampah Organik (Mudah Membusuk)',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Sampah organik adalah sampah alami yang berasal dari sisa tumbuhan atau hewan, sehingga bisa membusuk dan hancur sendiri menjadi tanah atau pupuk kompos. Ada dua macam: organik basah (berair dan cepat busuk seperti sisa nasi, sayur, dan buah) serta organik kering (kering dan lebih lama membusuk seperti daun gugur dan ranting pohon).',
    contoh: 'Sisa sayuran dan kulit pisang = organik basah. Daun kering di halaman = organik kering.',
    question: {
      question: 'Sisa sayuran, potongan buah, dan sisa makanan yang berair termasuk jenis sampah apa?',
      options: [
        { value: 'A', text: 'Sampah botol kaca' },
        { value: 'B', text: 'Sampah plastik buatan' },
        { value: 'C', text: 'Sampah organik basah' },
        { value: 'D', text: 'Sampah organik kering' }
      ],
      correctAnswer: 'C',
      explanation: 'Sisa sayuran dan buah berkadar air tinggi sehingga digolongkan sebagai sampah organik basah.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 3,
    bagianId: 1,
    bagianTitle: 'Mengenal Sampah',
    title: 'Sampah Anorganik (Sulit Membusuk)',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Sampah anorganik adalah sampah buatan pabrik dari bahan non-alami yang sangat sulit membusuk di tanah. Contoh utamanya: botol plastik, kaca, kaleng logam, dan styrofoam. Ingat ya, wadah styrofoam tidak boleh dipakai untuk makanan yang masih sangat panas karena zat kimianya bisa larut ke makanan.',
    contoh: 'Botol minum plastik, kaleng minuman, dan wadah styrofoam.',
    question: {
      question: 'Mengapa kita tidak boleh menaruh makanan yang masih sangat panas ke dalam wadah styrofoam?',
      options: [
        { value: 'A', text: 'Makanan akan langsung berubah menjadi dingin' },
        { value: 'B', text: 'Makanan akan bertambah banyak sendiri' },
        { value: 'C', text: 'Styrofoam akan berubah menjadi batu keras' },
        { value: 'D', text: 'Zat kimia styrofoam bisa larut dan berpindah ke makanan' }
      ],
      correctAnswer: 'D',
      explanation: 'Suhu panas dapat melarutkan monomer styrene berbahaya dari wadah styrofoam ke dalam makanan.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 4,
    bagianId: 1,
    bagianTitle: 'Mengenal Sampah',
    title: 'Kuis Tantangan: Pilah Organik vs Anorganik',
    type: 'kuis',
    pilar: 'Kemampuan',
    konsepInti: 'Uji kecepatanmu memisahkan sampah! Tarik atau klik item sampah ke tong sampah yang benar (Organik vs Anorganik) sebelum waktu habis!',
    contoh: 'Botol plastik masuk Anorganik. Kulit pisang masuk Organik.',
    question: {
      question: 'Manakah kelompok sampah di bawah ini yang seluruhnya termasuk sampah organik?',
      options: [
        { value: 'A', text: 'Kulit jeruk, sisa apel, dan daun kering' },
        { value: 'B', text: 'Botol plastik, kantong kresek, dan kaleng' },
        { value: 'C', text: 'Baterai bekas, styrofoam, dan kaca' },
        { value: 'D', text: 'Sedotan plastik, kertas timah, dan paku' }
      ],
      correctAnswer: 'A',
      explanation: 'Kulit jeruk, sisa apel, dan daun kering berasal dari tumbuhan alami sehingga termasuk sampah organik.'
    },
    xpReward: 12,
    coinReward: 15
  },

  // ===== BAGIAN 2 — DAMPAK LINGKUNGAN =====
  {
    id: 5,
    bagianId: 2,
    bagianTitle: 'Dampak Lingkungan',
    title: 'Dampak Sampah & Gas Metana',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Di antara dampak sampah (tanah, air, udara, kesehatan, dan ekonomi), dampak udara memiliki satu detail penting: gas metana (CH4). Gas metana dihasilkan dari sampah organik yang membusuk di tumpukan terutama di TPA yang tertutup rapat tanpa oksigen. Metana bukan sekadar menimbulkan bau busuk, tetapi merupakan gas rumah kaca yang efek menahan panasnya di atmosfer puluhan kali lebih kuat dibanding CO2. Selain itu, rembesan cairan kotor dari tumpukan sampah (disebut air lindi) dapat meracuni air tanah dan sumur.',
    contoh: 'Satu tumpukan sisa makanan kantin yang dibiarkan menumpuk selama seminggu dalam kondisi tertutup rapat akan mulai menghasilkan gas metana. Jika sampah dipilah dan dikompos, pembentukan gas metana liar bisa dicegah.',
    question: {
      question: 'Cairan hasil rembesan sampah yang mencemari tanah dan air disebut apa?',
      options: [
        { value: 'A', text: 'Emisi' },
        { value: 'B', text: 'Lindi' },
        { value: 'C', text: 'Residu' },
        { value: 'D', text: 'Sedimen' }
      ],
      correctAnswer: 'B',
      explanation: 'Air lindi (leachate) adalah cairan hasil pembusukan dan rembesan sampah yang dapat mencemari tanah dan air tanah di sekitarnya.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 6,
    bagianId: 2,
    bagianTitle: 'Dampak Lingkungan',
    title: 'Kuis Tantangan: Dampak Sampah',
    type: 'kuis',
    pilar: 'Kemampuan',
    konsepInti: 'Uji pemahamanmu tentang bahaya lingkungan! Cocokkan dampak negatif dengan media lingkungan yang dicemarinya secara cepat!',
    contoh: 'Lindi merusak Tanah. Gas Metana mencemari Udara.',
    question: {
      question: 'Apa bahaya yang ditimbulkan jika kaleng dan botol bekas tergenang air hujan di halaman sekolah?',
      options: [
        { value: 'A', text: 'Menghasilkan mata air baru yang jernih' },
        { value: 'B', text: 'Membuat udara di sekitar menjadi sangat dingin' },
        { value: 'C', text: 'Menjadi tempat bersarang dan bertelurnya nyamuk DBD' },
        { value: 'D', text: 'Membuat tanaman di sekitar tumbuh lebih cepat' }
      ],
      correctAnswer: 'C',
      explanation: 'Genangan air bersih di sampah anorganik merupakan habitat ideal nyamuk Aedes aegypti berkembang biak.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 7,
    bagianId: 2,
    bagianTitle: 'Dampak Lingkungan',
    title: 'Bahaya Mikroplastik di Sekitar Kita',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Plastik yang terbuang ke laut tidak akan hilang, melainkan hancur menjadi serpihan-serpihan super kecil (kurang dari 5 milimeter) yang disebut mikroplastik. Ikan di laut mengira serpihan kecil itu adalah makanan lalu memakannya. Jika ikan tersebut kita makan, serpihan plastik itu bisa masuk ke dalam tubuh kita!',
    contoh: 'Ikan di laut menelan serpihan mikroplastik, lalu ikan itu ditangkap dan dimasak untuk manusia.',
    question: {
      question: 'Bagaimana pecahan plastik super kecil (mikroplastik) di laut bisa masuk ke tubuh manusia?',
      options: [
        { value: 'A', text: 'Lewat sinar matahari yang terik di siang hari' },
        { value: 'B', text: 'Melalui hembusan angin sejuk di pantai' },
        { value: 'C', text: 'Lewat suara ombak di pinggir laut' },
        { value: 'D', text: 'Melalui ikan laut yang memakan mikroplastik lalu kita santap' }
      ],
      correctAnswer: 'D',
      explanation: 'Mikroplastik termakan oleh ikan laut dan berpindah ke tubuh manusia melalui rantai makanan.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 8,
    bagianId: 2,
    bagianTitle: 'Dampak Lingkungan',
    title: 'Mengubah Sampah Menjadi Energi',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Sampah tidak selalu jadi musuh! Sampah sisa makanan dan kotoran bisa disimpan di tabung khusus tanpa udara untuk menghasilkan gas alami yang disebut biogas. Biogas ini bisa dipakai untuk menyalakan kompor memasak atau menghasilkan listrik yang ramah lingkungan.',
    contoh: 'Sisa makanan dari dapur diolah jadi biogas untuk memasak tanpa perlu membeli gas elpiji.',
    question: {
      question: 'Sampah sisa makanan dan organik dapat diolah menjadi gas alami yang disebut apa?',
      options: [
        { value: 'A', text: 'Oksigen murni' },
        { value: 'B', text: 'Biogas' },
        { value: 'C', text: 'Batu bara cair' },
        { value: 'D', text: 'Minyak goreng' }
      ],
      correctAnswer: 'B',
      explanation: 'Biogas dihasilkan dari proses fermentasi sampah organik tanpa udara yang kaya akan gas metana ramah lingkungan.'
    },
    xpReward: 12,
    coinReward: 15
  },

  // ===== BAGIAN 3 — SOLUSI & AKSI =====
  {
    id: 9,
    bagianId: 3,
    bagianTitle: 'Solusi & Aksi',
    title: 'Prinsip 3R (Refuse, Reduce, Reuse, Recycle)',
    type: 'bacaan',
    pilar: 'Kemampuan',
    konsepInti: 'Sebelum 3R (Reduce, Reuse, Recycle), ada satu prinsip yang sangat penting di awal: Refuse (Menolak) — menolak barang sekali pakai sebelum barang itu sampai ke tangan kita jika memang tidak dibutuhkan. Bedanya dengan Reduce: Refuse terjadi pada titik paling awal (saat ditawari/sebelum membeli), sedangkan Reduce terjadi setelah barang sudah menjadi kebiasaan dipakai tetapi jumlahnya dikurangi. Urutan lengkap aksi pencegahan sampah adalah: Refuse -> Reduce -> Reuse -> Recycle, di mana 3 prinsip pertama mencegah barang menjadi sampah, dan hanya Recycle yang mengolah barang yang sudah terlanjur jadi sampah.',
    contoh: 'Refuse: Menolak sedotan plastik atau kantong kresek saat jajan di kantin ("tanpa sedotan"). Reduce: Mengurangi pemakaian kertas tisu dengan saputangan. Reuse: Menggunakan botol minum berulang kali. Recycle: Menyerahkan kardus ke bank sampah untuk didaur ulang.',
    question: {
      question: 'Apa perbedaan utama antara prinsip Refuse dan Reduce?',
      options: [
        { value: 'A', text: 'Refuse membakar sampah, sedangkan Reduce menimbunnya di tanah' },
        { value: 'B', text: 'Refuse menolak barang sejak sebelum sampai ke tangan kita, sedangkan Reduce mengurangi jumlah barang yang digunakan' },
        { value: 'C', text: 'Refuse hanya untuk sampah organik, sedangkan Reduce hanya untuk anorganik' },
        { value: 'D', text: 'Refuse dan Reduce sama sekali tidak ada bedanya' }
      ],
      correctAnswer: 'B',
      explanation: 'Refuse menolak barang sekali pakai di awal sebelum menjadi konsumsi kita, sedangkan Reduce adalah upaya mengurangi kuantitas barang yang digunakan.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 10,
    bagianId: 3,
    bagianTitle: 'Solusi & Aksi',
    title: 'Kuis Tantangan: Praktik 3R',
    type: 'kuis',
    pilar: 'Kemampuan',
    konsepInti: 'Uji kemampuan memorimu! Klasifikasikan berbagai aksi ramah lingkungan sekolah ke dalam kategori Reduce, Reuse, atau Recycle secara tepat dan cepat!',
    contoh: 'Menolak sedotan = Reduce. Memakai tas kain berulang = Reuse.',
    question: {
      question: 'Tindakan membawa kotak bekal dan botol minum tumbler sendiri dari rumah ke sekolah termasuk contoh dari...',
      options: [
        { value: 'A', text: 'Recycle (melebur sampah plastik di pabrik)' },
        { value: 'B', text: 'Residu (membuang sampah ke tempat akhir)' },
        { value: 'C', text: 'Reboisasi (menanam kembali pohon di hutan)' },
        { value: 'D', text: 'Reduce (mengurangi timbulan sampah plastik sekali pakai)' }
      ],
      correctAnswer: 'D',
      explanation: 'Membawa wadah makan dan minum sendiri mencegah terciptanya sampah plastik sekali pakai (Reduce).'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 11,
    bagianId: 3,
    bagianTitle: 'Solusi & Aksi',
    title: 'Memilah Sampah dari Rumah dan Sekolah',
    type: 'bacaan',
    pilar: 'Kemampuan',
    konsepInti: 'Memilah sampah paling bagus dilakukan langsung saat kita membuangnya di rumah atau di sekolah. Kalau sampah sudah bercampur di Tempat Pembuangan Akhir (TPA), sampahnya akan kotor, bau, dan sangat sulit untuk didaur ulang kembali.',
    contoh: 'Memisahkan botol plastik bersih ke tempat terpisah dari sisa makanan basah.',
    question: {
      question: 'Mengapa kita harus memilah sampah langsung dari sumbernya (rumah atau sekolah)?',
      options: [
        { value: 'A', text: 'Agar sampah belum kotor/tercampur sehingga mudah didaur ulang' },
        { value: 'B', text: 'Agar sampah menjadi lebih cepat berbau busuk' },
        { value: 'C', text: 'Agar tempat sampah di rumah cepat penuh' },
        { value: 'D', text: 'Agar sampah bisa langsung dihanyutkan ke selokan' }
      ],
      correctAnswer: 'A',
      explanation: 'Memilah di sumber menjaga kebersihan material sehingga nilai daur ulangnya tinggi dan mudah diproses.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 12,
    bagianId: 3,
    bagianTitle: 'Solusi & Aksi',
    title: 'Kuis Tantangan: Pemilahan Sumber',
    type: 'kuis',
    pilar: 'Kemampuan',
    konsepInti: 'Latihan memilah sampah dengan benar! Salurkan sampah harian sekolah ke 3 tong khusus: Organik Basah, Organik Kering, atau Anorganik!',
    contoh: 'Daun gugur = Organik Kering. Sisa nasi = Organik Basah. Gelas plastik = Anorganik.',
    question: {
      question: 'Apa langkah yang benar sebelum membuang botol atau gelas plastik bekas minuman manis ke tong anorganik?',
      options: [
        { value: 'A', text: 'Membiarkan air manisnya tetap penuh di dalam botol' },
        { value: 'B', text: 'Mengosongkan sisa air minumannya terlebih dahulu agar bersih dan kering' },
        { value: 'C', text: 'Mencampurnya dengan sisa kuah bakso dan sambal' },
        { value: 'D', text: 'Membakar botol plastiknya di halaman kelas' }
      ],
      correctAnswer: 'B',
      explanation: 'Mengosongkan cairan dari wadah plastik mencegah kebusukan dan mempermudah proses daur ulang.'
    },
    xpReward: 12,
    coinReward: 15
  },

  // ===== BAGIAN 4 — GAYA HIDUP HIJAU =====
  {
    id: 13,
    bagianId: 4,
    bagianTitle: 'Gaya Hidup Hijau',
    title: 'Menabung di Bank Sampah & Reward ThinkBin',
    type: 'bacaan',
    pilar: 'Kemampuan',
    konsepInti: 'Bank Sampah adalah tempat di mana kita bisa menyetor sampah anorganik (seperti kardus, kertas, dan botol plastik). Sampah yang kita kumpulkan akan ditimbang dan dicatat. Hasil penjualannya digunakan untuk membiayai koin dan hadiah reward seru untuk siswa di ThinkBin!',
    contoh: 'Menabung botol plastik bekas kelas ke Bank Sampah sekolah untuk ditukar koin reward mingguan.',
    question: {
      question: 'Dari mana asal dana dan hadiah reward yang diperoleh siswa di ThinkBin?',
      options: [
        { value: 'A', text: 'Dari membeli kupon undian berbayar' },
        { value: 'B', text: 'Dari meminjam uang di bank keliling' },
        { value: 'C', text: 'Dari hasil penjualan sampah yang dikumpulkan di Bank Sampah' },
        { value: 'D', text: 'Dari menebang pohon di taman kota' }
      ],
      correctAnswer: 'C',
      explanation: 'Hasil penjualan sampah terpilah di Bank Sampah menjadi sumber sirkular pendanaan reward siswa.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 14,
    bagianId: 4,
    bagianTitle: 'Gaya Hidup Hijau',
    title: 'Nilai Jual Sampah yang Dipilah',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Tahukah kamu? Sampah yang sudah dipilah dan dibersihkan harganya jauh lebih mahal! Misalnya botol plastik bening yang bersih dan sudah dilepas tutup serta labelnya dihargai lebih tinggi di Bank Sampah dibanding botol yang kotor dan masih bercampur.',
    contoh: 'Botol plastik bersih tanpa label dihargai Rp5.000/kg, sedangkan botol kotor yang masih ada labelnya hanya Rp1.500/kg.',
    question: {
      question: 'Mengapa botol plastik yang bersih dan dilepas labelnya dihargai lebih mahal di Bank Sampah?',
      options: [
        { value: 'A', text: 'Karena botol bersih terasa jauh lebih berat daripada botol kotor' },
        { value: 'B', text: 'Karena warnanya bisa menyala sendiri dalam gelap' },
        { value: 'C', text: 'Karena botol bersih bisa langsung diminum airnya tanpa dicuci' },
        { value: 'D', text: 'Karena jenis plastiknya murni dan mudah langsung didaur ulang pabrik' }
      ],
      correctAnswer: 'D',
      explanation: 'Botol bersih tanpa label memiliki kemurnian bahan PET tinggi sehingga langsung siap dicacah oleh pabrik.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 15,
    bagianId: 4,
    bagianTitle: 'Gaya Hidup Hijau',
    title: 'Tiga Langkah Kebiasaan Hijau',
    type: 'bacaan',
    pilar: 'Kemauan',
    konsepInti: 'Agar bumi tetap bersih dan sehat, kita perlu 3 langkah kebiasaan: 1. Tahu: Memahami jenis sampah dan cara memilahnya dengan benar. 2. Mau: Memiliki niat dan semangat tulus menjaga kebersihan. 3. Mampu: Membiasakan diri melakukannya setiap hari secara rutin.',
    contoh: 'Selalu membawa botol minum sendiri dan membuang sampah sesuai tongnya setiap hari.',
    question: {
      question: 'Tiga kunci kebiasaan baik dalam menjaga lingkungan di ThinkBin adalah...',
      options: [
        { value: 'A', text: 'Tahu caranya, Mau melakukannya, dan Mampu membiasakannya' },
        { value: 'B', text: 'Malas memilah, Membakar sampah, dan Mengotori sungai' },
        { value: 'C', text: 'Membeli banyak plastik sekali pakai dan membuang sembarangan' },
        { value: 'D', text: 'Menunggu disuruh orang lain dan tidak peduli lingkungan' }
      ],
      correctAnswer: 'A',
      explanation: 'Tahu, Mau, dan Mampu adalah 3 pilar transformasi perilaku peduli lingkungan permanen.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 16,
    bagianId: 4,
    bagianTitle: 'Gaya Hidup Hijau',
    title: 'Komitmen Aksi Nyata untuk Bumi',
    type: 'bacaan',
    pilar: 'Kemauan',
    konsepInti: 'Hebat sekali! Kamu sudah mempelajari semua cara menjaga bumi dan memilah sampah. Sekarang, mari kuatkan satu janji aksi nyata yang akan kamu lakukan secara konsisten mulai hari ini di sekolah dan rumah!',
    contoh: '"Saya berkomitmen membawa kotak makan sendiri untuk jajan di kantin sekolah guna memangkas sampah wadah plastik."',
    question: {
      question: 'Setelah mempelajari materi dasar ThinkBin, apa langkah terpenting yang harus kita lakukan setiap hari?',
      options: [
        { value: 'A', text: 'Melupakan semua materi yang sudah dipelajari' },
        { value: 'B', text: 'Mempraktikkan kebiasaan memilah sampah secara konsisten di sekolah dan rumah' },
        { value: 'C', text: 'Membuang sampah di sembarang tempat jika tidak ada yang melihat' },
        { value: 'D', text: 'Menggunakan plastik sekali pakai sebanyak-banyaknya' }
      ],
      correctAnswer: 'B',
      explanation: 'Praktik konsisten setiap hari adalah wujud nyata komitmen seorang Guardian Lingkungan ThinkBin!'
    },
    xpReward: 12,
    coinReward: 15
  },

  // ===== BAGIAN 5 — PENGOLAHAN SAMPAH KREATIF =====
  {
    id: 17,
    bagianId: 5,
    bagianTitle: 'Pengolahan Sampah Kreatif',
    title: 'Pembuatan Kompos Takakura & Pupuk Cair',
    type: 'bacaan',
    pilar: 'Kemampuan',
    konsepInti: 'Metode Takakura adalah cara mudah membuat kompos di rumah atau kelas menggunakan keranjang berventilasi yang diisi bantal sekam dan starter mikroorganisme. Selain kompos padat, sampah kulit buah manis dapat difermentasi dengan air gula merah menjadi cairan pembersih alami serbaguna yang disebut Eco-Enzyme.',
    contoh: 'Sisa potongan sayur dan kulit apel difermentasi menjadi Eco-Enzyme untuk mengepel lantai kelas secara ramah lingkungan.',
    question: {
      question: 'Cairan fermentasi serbaguna dari sisa kulit buah, gula, dan air disebut...',
      options: [
        { value: 'A', text: 'Air lindi beracun' },
        { value: 'B', text: 'Minyak jelantah bekas' },
        { value: 'C', text: 'Eco-Enzyme' },
        { value: 'D', text: 'Pestisida sintetis' }
      ],
      correctAnswer: 'C',
      explanation: 'Eco-Enzyme adalah larutan hasil fermentasi sampah organik basah buah dan sayuran yang memiliki banyak manfaat pembersih.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 18,
    bagianId: 5,
    bagianTitle: 'Pengolahan Sampah Kreatif',
    title: 'Biokonversi Maggot BSF untuk Sampah Organik',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Maggot Black Soldier Fly (BSF) adalah larva lalat tentara hitam yang rakus memakan sisa makanan berlebih. Dalam 24 jam, maggot mampu menghabiskan sampah organik hingga 3 kali berat tubuhnya. Larva yang sudah besar kaya protein dan bisa menjadi pakan ternak/ikan, sementara kotorannya (kasgot) menjadi pupuk organik bermutu tinggi.',
    contoh: 'Sisa makanan kantin diberikan ke biopond maggot BSF di sekolah Adiwiyata agar habis tanpa menimbulkan bau busuk.',
    question: {
      question: 'Apa manfaat utama dari budidaya larva Maggot BSF dalam pengelolaan sampah sekolah?',
      options: [
        { value: 'A', text: 'Menghasilkan tumpukan limbah plastik baru' },
        { value: 'B', text: 'Menguraikan sampah sisa makanan organik dengan cepat dan bernilai ekonomi' },
        { value: 'C', text: 'Membuat sampah menjadi berbau busuk menyengat' },
        { value: 'D', text: 'Mencemari air tanah di sekitar sekolah' }
      ],
      correctAnswer: 'B',
      explanation: 'Maggot BSF merupakan pengurai alami tercepat untuk sampah organik yang menghasilkan pakan berprotein dan pupuk kasgot.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 19,
    bagianId: 5,
    bagianTitle: 'Pengolahan Sampah Kreatif',
    title: 'Upcycling & Kerajinan Ecobrick',
    type: 'bacaan',
    pilar: 'Kemampuan',
    konsepInti: 'Upcycling adalah mengubah barang bekas menjadi produk baru yang memiliki nilai estetika atau fungsi lebih tinggi tanpa meleburnya di pabrik. Salah satu contoh populer adalah Ecobrick: memadatkan sampah plastik kresek dan sachet bersih kering ke dalam botol PET hingga padat keras untuk dijadikan meja, kursi, atau pagar taman.',
    contoh: 'Membuat balok Ecobrick seberat 200 gram dari botol 600 ml yang dipadatkan dengan plastik bungkus snack.',
    question: {
      question: 'Apa syarat utama plastik kresek dan kemasan sachet yang akan dimasukkan ke dalam botol Ecobrick?',
      options: [
        { value: 'A', text: 'Harus basah dan berlendir' },
        { value: 'B', text: 'Harus dicampur dengan sisa kuah makanan' },
        { value: 'C', text: 'Harus dibakar terlebih dahulu' },
        { value: 'D', text: 'Harus bersih dan kering agar tidak membusuk atau berjamur' }
      ],
      correctAnswer: 'D',
      explanation: 'Plastik dalam Ecobrick wajib bersih dan kering sempurna agar tidak menimbulkan gas, bau, atau bakteri di dalam botol tertutup.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 20,
    bagianId: 5,
    bagianTitle: 'Pengolahan Sampah Kreatif',
    title: 'Kuis Tantangan: Master Daur Ulang Kreatif',
    type: 'kuis',
    pilar: 'Kemampuan',
    konsepInti: 'Uji ketangkasanmu menentukan metode pengolahan sampah organik dan anorganik kreatif secara tepat dan cepat!',
    contoh: 'Sisa buah manis = Eco-Enzyme. Plastik sachet = Ecobrick. Sisa nasi kantin = Maggot BSF.',
    question: {
      question: 'Manakah pasangan sampah dan metode daur ulang kreatif yang paling tepat?',
      options: [
        { value: 'A', text: 'Sisa makanan basah -> Ecobrick' },
        { value: 'B', text: 'Baterai bekas -> Pupuk Kompos' },
        { value: 'C', text: 'Sachet plastik bersih -> Ecobrick dan Upcycling' },
        { value: 'D', text: 'Lampu kaca pecah -> Pakan Maggot' }
      ],
      correctAnswer: 'C',
      explanation: 'Kemasan plastik sachet bersih sangat ideal untuk upcycling dan material padat Ecobrick.'
    },
    xpReward: 20,
    coinReward: 25
  },

  // ===== BAGIAN 6 — GERAKAN SEKOLAH ADIWIYATA =====
  {
    id: 21,
    bagianId: 6,
    bagianTitle: 'Gerakan Sekolah Adiwiyata',
    title: 'Kantin Sekolah Bebas Plastik Sekali Pakai',
    type: 'bacaan',
    pilar: 'Kemauan',
    konsepInti: 'Program Adiwiyata mendorong sekolah menciptakan Kantin Sehat Ramah Lingkungan. Pedagang kantin diimbau tidak lagi menyajikan makanan beralas plastik kresek atau styrofoam, melainkan memakai piring kaca, daun pisang, atau wadah yang dibawa siswa sendiri. Kebijakan ini secara drastis memangkas timbulan sampah harian sekolah.',
    contoh: 'Membeli soto atau siomay di kantin menggunakan wadah makan sendiri (misting).',
    question: {
      question: 'Apa tujuan utama gerakan kantin sehat bebas plastik sekali pakai di sekolah Adiwiyata?',
      options: [
        { value: 'A', text: 'Menaikkan harga makanan kantin' },
        { value: 'B', text: 'Mencegah timbulan sampah plastik langsung dari sumbernya di sekolah' },
        { value: 'C', text: 'Melarang siswa makan di jam istirahat' },
        { value: 'D', text: 'Menambah tumpukan sampah plastik di tong sampah' }
      ],
      correctAnswer: 'B',
      explanation: 'Menghilangkan plastik sekali pakai di kantin adalah strategi pencegahan timbulan sampah (Reduce/Refuse) paling efektif di lingkungan sekolah.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 22,
    bagianId: 6,
    bagianTitle: 'Gerakan Sekolah Adiwiyata',
    title: 'Audit Sampah & Peta Timbulan Kelas',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Audit sampah adalah kegiatan menimbang, mengukur, dan mencatat jenis sampah yang dihasilkan oleh setiap kelas selama satu minggu. Dengan audit ini, sekolah dapat mengetahui kelas mana yang paling hemat sampah dan jenis sampah apa yang paling banyak terbuang untuk dicarikan solusinya.',
    contoh: 'Piketan kelas menimbang ember sampah organik dan anorganik sebelum disetor ke penampungan sekolah.',
    question: {
      question: 'Apa fungsi utama dilakukannya audit timbulan sampah di setiap kelas?',
      options: [
        { value: 'A', text: 'Menghukum siswa yang menghasilkan sampah' },
        { value: 'B', text: 'Membeli tong sampah baru setiap hari' },
        { value: 'C', text: 'Membuang sampah ke sungai bersama-sama' },
        { value: 'D', text: 'Mengetahui volume dan jenis sampah yang dihasilkan untuk evaluasi pengurangan' }
      ],
      correctAnswer: 'D',
      explanation: 'Audit sampah memberikan data riil untuk mengevaluasi efektivitas program pemilahan dan pengurangan sampah kelas.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 23,
    bagianId: 6,
    bagianTitle: 'Gerakan Sekolah Adiwiyata',
    title: 'Peran Duta Lingkungan & Kader Hijau',
    type: 'bacaan',
    pilar: 'Kemampuan',
    konsepInti: 'Kader Lingkungan Sekolah bertugas menjadi teladan, mengedukasi teman sebaya, serta mengingatkan jika ada yang membuang sampah sembarangan atau salah memasukkan sampah ke tong. Menjadi duta lingkungan melatih kepemimpinan, kepedulian sosial, dan tanggung jawab terhadap kelestarian bumi.',
    contoh: 'Mengajak teman sekelas memilah botol PET dan melepas labelnya sebelum dimasukkan ke tong ThinkBin.',
    question: {
      question: 'Sikap apa yang harus ditunjukkan oleh seorang kader/duta lingkungan sekolah?',
      options: [
        { value: 'A', text: 'Memberikan contoh teladan memilah sampah dan mengajak teman dengan santun' },
        { value: 'B', text: 'Membiarkan teman membuang sampah sembarangan' },
        { value: 'C', text: 'Membuang sampah diam-diam di laci meja' },
        { value: 'D', text: 'Mengabaikan kebersihan lingkungan kelas' }
      ],
      correctAnswer: 'A',
      explanation: 'Duta lingkungan berperan sebagai *peer-educator* yang memberikan teladan nyata dan mengajak rekan sebaya peduli lingkungan.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 24,
    bagianId: 6,
    bagianTitle: 'Gerakan Sekolah Adiwiyata',
    title: 'Kuis Tantangan: Aksi Sekolah Hijau',
    type: 'kuis',
    pilar: 'Kemampuan',
    konsepInti: 'Uji wawasanmu tentang aksi kolaboratif sekolah hijau Adiwiyata dan pemilahan terintegrasi!',
    contoh: 'Kantin ramah lingkungan = Bawa tumbler. Audit sampah = Catat timbulan.',
    question: {
      question: 'Manakah tindakan siswa yang paling mencerminkan budaya sekolah Adiwiyata?',
      options: [
        { value: 'A', text: 'Menumpuk sampah plastik di kolong meja' },
        { value: 'B', text: 'Membeli minuman kemasan sachet sekali pakai setiap hari' },
        { value: 'C', text: 'Membawa botol minum dan wadah makan sendiri serta aktif memilah sampah di kelas' },
        { value: 'D', text: 'Mencampur sampah basah dengan kertas HVS' }
      ],
      correctAnswer: 'C',
      explanation: 'Membawa perlengkapan makan guna ulang dan aktif memilah sampah adalah wujud nyata budaya Adiwiyata.'
    },
    xpReward: 20,
    coinReward: 25
  },

  // ===== BAGIAN 7 — AKSI KOMUNITAS & MASA DEPAN =====
  {
    id: 25,
    bagianId: 7,
    bagianTitle: 'Aksi Komunitas & Masa Depan',
    title: 'Ekonomi Sirkular & Zero Waste Lifestyle',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Ekonomi linier tradisional menganut pola "ambil-buat-buang", sedangkan Ekonomi Sirkular merancang sistem agar tidak ada material yang terbuang sia-sia. Semua barang dirancang agar bisa dipakai lama, diperbaiki, atau didaur ulang kembali menjadi bahan baku baru (Zero Waste).',
    contoh: 'Sepatu atau tas dari serat daur ulang botol plastik plastik PET.',
    question: {
      question: 'Apa prinsip dasar dari model Ekonomi Sirkular dalam penanganan produk dan sampah?',
      options: [
        { value: 'A', text: 'Membeli barang sebanyak-banyaknya lalu langsung dibuang ke TPA' },
        { value: 'B', text: 'Menjaga material tetap bernilai guna selama mungkin dalam siklus tertutup tanpa limbah' },
        { value: 'C', text: 'Membakar semua jenis sampah agar langsung habis' },
        { value: 'D', text: 'Menimbun sampah di lubang tanah halaman' }
      ],
      correctAnswer: 'B',
      explanation: 'Ekonomi sirkular berorientasi pada regenerasi sumber daya dan siklus material tertutup sehingga meminimalkan limbah.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 26,
    bagianId: 7,
    bagianTitle: 'Aksi Komunitas & Masa Depan',
    title: 'Inovasi Teknologi & Smart Waste Bin',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Perkembangan teknologi modern kini menghadirkan tempat sampah pintar (Smart Waste Bin) berbasis sensor IoT dan gamifikasi seperti ThinkBin. Sistem ini mampu mendeteksi pemilahan sampah yang tepat, menghitung bobot tabungan bank sampah secara otomatis, serta memberikan reward instan bagi siswa yang berpartisipasi aktif.',
    contoh: 'ThinkBin yang secara otomatis mencatat poin reward siswa saat berhasil memilah sampah dengan benar.',
    question: {
      question: 'Bagaimana peran teknologi IoT dan gamifikasi pada ThinkBin dalam meningkatkan literasi sampah siswa?',
      options: [
        { value: 'A', text: 'Membuat proses pembuangan sampah menjadi lebih rumit dan membosankan' },
        { value: 'B', text: 'Mengurangi jumlah siswa yang ingin peduli kebersihan' },
        { value: 'C', text: 'Menghapus keberadaan bank sampah di sekolah' },
        { value: 'D', text: 'Memberikan umpan balik langsung dan motivasi positif melalui sistem reward & leaderboard' }
      ],
      correctAnswer: 'D',
      explanation: 'Gamifikasi dan umpan balik langsung ThinkBin memotivasi kebiasaan positif pemilahan sampah menjadi aktivitas seru dan bermakna.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 27,
    bagianId: 7,
    bagianTitle: 'Aksi Komunitas & Masa Depan',
    title: 'Gerakan Kolaborasi Bersih Lingkungan Komunitas',
    type: 'bacaan',
    pilar: 'Kemampuan',
    konsepInti: 'Menjaga lingkungan tidak bisa dilakukan sendirian. Gerakan World Cleanup Day, gotong royong warga RT/RW, dan kolaborasi bank sampah induk kota membuktikan bahwa aksi bersama jutaan orang mampu membersihkan puluhan ribu ton sampah dari sungai, laut, dan pemukiman.',
    contoh: 'Aksi bersih sungai dan pantai bersama komunitas peduli lingkungan di akhir pekan.',
    question: {
      question: 'Mengapa kolaborasi komunitas sangat penting dalam menyelesaikan masalah sampah nasional?',
      options: [
        { value: 'A', text: 'Karena hanya petugas kebersihan saja yang boleh memungut sampah' },
        { value: 'B', text: 'Karena volume timbulan sampah masif membutuhkan partisipasi aktif seluruh elemen masyarakat' },
        { value: 'C', text: 'Karena sampah akan hilang dengan sendirinya jika diabaikan bersama' },
        { value: 'D', text: 'Agar semua orang bisa membuang sampah sesuka hati' }
      ],
      correctAnswer: 'B',
      explanation: 'Masalah sampah adalah tanggung jawab bersama yang memerlukan aksi kolektif dari keluarga, sekolah, komunitas, dan pemerintah.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 28,
    bagianId: 7,
    bagianTitle: 'Aksi Komunitas & Masa Depan',
    title: 'Kuis Tantangan: Kolaborasi Lingkungan',
    type: 'kuis',
    pilar: 'Kemampuan',
    konsepInti: 'Uji wawasanmu seputar gerakan kolaborasi bersih lingkungan dan sistem ekonomi sirkular modern!',
    contoh: 'Ekonomi sirkular = Siklus tertutup. World Cleanup Day = Aksi komunitas.',
    question: {
      question: 'Aksi membersihkan sungai dan laut secara serentak bersama ribuan relawan di akhir pekan merupakan contoh dari...',
      options: [
        { value: 'A', text: 'Tindakan merusak ekosistem alam' },
        { value: 'B', text: 'Kegiatan membuang sampah sembarangan' },
        { value: 'C', text: 'Gerakan aksi bersih kolaborasi komunitas' },
        { value: 'D', text: 'Pencemaran air limbah kimia' }
      ],
      correctAnswer: 'C',
      explanation: 'Aksi bersih lingkungan bersama komunitas adalah wujud nyata gotong royong dan tanggung jawab kolektif terhadap kelestarian alam.'
    },
    xpReward: 20,
    coinReward: 25
  },

  // ===== BAGIAN 8 — PENGELOLAAN SAMPAH KHUSUS & B3 =====
  {
    id: 29,
    bagianId: 8,
    bagianTitle: 'Pengelolaan Sampah Khusus & B3',
    title: 'Mengenal Sampah B3 Rumah Tangga & Sekolah',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Sampah B3 (Bahan Berbahaya dan Beracun) adalah sampah yang mengandung zat beracun, mudah meledak, mudah terbakar, atau korosif. Di rumah dan sekolah, contohnya adalah sisa obat-obatan, botol pembasmi serangga (aerosol), pembersih porselen kimia, dan wadah sisa cat.',
    contoh: 'Kaleng semprot obat nyamuk dan botol cairan pembersih lantai yang berbahan kimia keras.',
    question: {
      question: 'Mengapa botol bekas pembasmi serangga (aerosol) tidak boleh dibakar atau dibuang ke tong biasa?',
      options: [
        { value: 'A', text: 'Karena bisa berubah menjadi air bersih' },
        { value: 'B', text: 'Dapat meledak dan melepaskan gas beracun yang berbahaya bagi pernapasan' },
        { value: 'C', text: 'Karena harganya sangat mahal jika dibakar' },
        { value: 'D', text: 'Agar baunya harum seperti bunga' }
      ],
      correctAnswer: 'B',
      explanation: 'Kaleng aerosol bertekanan tinggi dan mengandung residu kimia yang mudah meledak jika terkena panas.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 30,
    bagianId: 8,
    bagianTitle: 'Pengelolaan Sampah Khusus & B3',
    title: 'Bahaya Logam Berat dari E-Waste & Baterai',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Sampah elektronik (E-Waste) seperti charger rusak, earphone putus, dan baterai bekas mengandung logam berat berbahaya (seperti merkuri, timbal, dan kadmium). Jika tercecer di tanah, logam berat ini dapat meresap ke sumur air minum dan menyebabkan gangguan kesehatan serius pada ginjal dan saraf.',
    contoh: 'Baterai bekas remote atau jam dinding yang bocor dan mengeluarkan serbuk putih beracun.',
    question: {
      question: 'Zat berbahaya apa yang terkandung di dalam sampah elektronik dan baterai bekas?',
      options: [
        { value: 'A', text: 'Vitamin dan mineral alami' },
        { value: 'B', text: 'Minyak wangi murni' },
        { value: 'C', text: 'Logam berat seperti merkuri, timbal, dan kadmium' },
        { value: 'D', text: 'Oksigen murni' }
      ],
      correctAnswer: 'C',
      explanation: 'Baterai dan e-waste mengandung logam berat beracun yang dapat mencemari air tanah jika dibuang sembarangan.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 31,
    bagianId: 8,
    bagianTitle: 'Pengelolaan Sampah Khusus & B3',
    title: 'Sistem Drop-Box & Saluran Limbah Khusus',
    type: 'bacaan',
    pilar: 'Kemampuan',
    konsepInti: 'Sampah B3 dan E-Waste tidak boleh dicampur ke tong ThinkBin Organik atau Anorganik. Sekolah dan kota menyediakan Drop-Box Limbah B3 khusus (E-Waste Drop Point) yang nantinya akan diambil oleh instansi berizin resmi untuk dimurnikan atau dinetralkan secara aman.',
    contoh: 'Menaruh charger handphone bekas dan baterai AA ke kotak drop-box E-Waste di lobi sekolah.',
    question: {
      question: 'Ke mana kita harus menyalurkan sampah baterai bekas dan lampu LED yang pecah?',
      options: [
        { value: 'A', text: 'Dibuang ke selokan sekolah saat hujan lebat' },
        { value: 'B', text: 'Dicampur ke tong sampah organik sisa makanan' },
        { value: 'C', text: 'Dikubur di dekat pohon buah' },
        { value: 'D', text: 'Ke Drop-Box limbah B3 / E-waste khusus yang disediakan sekolah/dinas' }
      ],
      correctAnswer: 'D',
      explanation: 'Drop-Box B3/E-Waste memastikan sampah beracun ditangani oleh pihak profesional tanpa mencemari lingkungan.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 32,
    bagianId: 8,
    bagianTitle: 'Pengelolaan Sampah Khusus & B3',
    title: 'Kuis Tantangan: Identifikasi Limbah B3',
    type: 'kuis',
    pilar: 'Kemampuan',
    konsepInti: 'Uji ketelitianmu memisahkan sampah sehari-hari dari limbah B3 beracun sebelum terbuang sembarangan!',
    contoh: 'Baterai bekas = Drop-Box B3. Botol kaca sirup = Anorganik.',
    question: {
      question: 'Manakah benda berikut yang WAJIB dimasukkan ke dalam tempat sampah khusus limbah B3?',
      options: [
        { value: 'A', text: 'Baterai bekas, lampu neon pecah, dan termometer raksa' },
        { value: 'B', text: 'Daun mangga gugur dan kulit jeruk' },
        { value: 'C', text: 'Kardus biskuit dan kertas HVS' },
        { value: 'D', text: 'Botol plastik air mineral bersih' }
      ],
      correctAnswer: 'A',
      explanation: 'Baterai, neon, dan termometer raksa mengandung bahan berbahaya dan beracun (B3) yang wajib penanganan khusus.'
    },
    xpReward: 20,
    coinReward: 25
  },

  // ===== BAGIAN 9 — KONSERVASI ENERGI & JEJAK KARBON =====
  {
    id: 33,
    bagianId: 9,
    bagianTitle: 'Konservasi Energi & Jejak Karbon',
    title: 'Hubungan Sampah dengan Emisi Gas Rumah Kaca',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Setiap barang yang kita beli membutuhkan energi fosil dan bahan bakar saat diproduksi dan diangkut. Ketika barang tersebut cepat dibuang menjadi sampah, energi tersebut terbuang sia-sia dan sampah di TPA melepaskan emisi karbon serta metana yang memicu pemanasan global.',
    contoh: 'Membuat 1 botol plastik baru membutuhkan minyak bumi dan menghasilkan jejak karbon 3 kali lebih besar dibanding botol daur ulang.',
    question: {
      question: 'Bagaimana mengurangi sampah plastik sekali pakai dapat membantu mengerem perubahan iklim?',
      options: [
        { value: 'A', text: 'Membuat bumi berputar lebih lambat' },
        { value: 'B', text: 'Memangkas kebutuhan produksi plastik baru yang menguras minyak bumi dan menghemat emisi karbon pabrik' },
        { value: 'C', text: 'Mengurangi jumlah oksigen di atmosfer' },
        { value: 'D', text: 'Membuat matahari bersinar lebih redup' }
      ],
      correctAnswer: 'B',
      explanation: 'Pengurangan sampah menekan konsumsi bahan bakar fosil pada tahap manufaktur dan transportasi produk baru.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 34,
    bagianId: 9,
    bagianTitle: 'Konservasi Energi & Jejak Karbon',
    title: 'Hemat Energi & Efisiensi Sumber Daya',
    type: 'bacaan',
    pilar: 'Kemauan',
    konsepInti: 'Menjaga bumi bukan hanya tentang memilah sampah, tetapi juga mematikan lampu dan kipas angin kelas saat tidak digunakan, mematikan kran air yang menetes, serta memilih berjalan kaki atau bersepeda ke sekolah untuk menekan emisi gas buang kendaraan bermotor.',
    contoh: 'Mematikan LCD proyektor dan lampu kelas saat jam istirahat dan kegiatan di luar ruangan.',
    question: {
      question: 'Tindakan sederhana di kelas yang efektif menghemat energi dan menekan emisi karbon adalah...',
      options: [
        { value: 'A', text: 'Menyalakan semua pendingin ruangan dengan pintu terbuka lebar' },
        { value: 'B', text: 'Membiarkan air kran wastafel mengalir terus-menerus' },
        { value: 'C', text: 'Mematikan lampu, kipas angin, dan proyektor saat kelas kosong' },
        { value: 'D', text: 'Mengisi daya handphone seharian penuh tanpa dicabut' }
      ],
      correctAnswer: 'C',
      explanation: 'Mematikan perangkat elektronik yang tidak terpakai menghemat listrik dan mengurangi pembakaran batu bara di pembangkit listrik.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 35,
    bagianId: 9,
    bagianTitle: 'Konservasi Energi & Jejak Karbon',
    title: 'Food Waste: Stop Membuang Makanan!',
    type: 'bacaan',
    pilar: 'Kemauan',
    konsepInti: 'Food waste (sampah makanan) adalah makanan layak makan yang terbuang sia-sia karena kita mengambil porsi terlalu banyak lalu tidak menghabiskannya. Menghabiskan makanan yang kita ambil adalah wujud rasa syukur sekaligus tindakan nyata mencegah timbunan sampah organik di TPA.',
    contoh: 'Mengambil porsi makan siang secukupnya dan selalu menghabiskannya tanpa sisa di piring.',
    question: {
      question: 'Apa langkah paling bijak untuk mencegah terjadinya sampah makanan (food waste) di sekolah?',
      options: [
        { value: 'A', text: 'Memesan banyak menu lalu membuang setengahnya ke tong sampah' },
        { value: 'B', text: 'Menyembunyikan sisa makanan di bawah meja' },
        { value: 'C', text: 'Membuang sayuran karena tidak suka warnanya' },
        { value: 'D', text: 'Mengambil porsi makanan secukupnya sesuai kemampuan makan dan menghabiskannya' }
      ],
      correctAnswer: 'D',
      explanation: 'Mengambil porsi yang tepat dan menghabiskannya adalah pencegahan food waste paling efektif.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 36,
    bagianId: 9,
    bagianTitle: 'Konservasi Energi & Jejak Karbon',
    title: 'Kuis Tantangan: Jejak Karbon Hijau',
    type: 'kuis',
    pilar: 'Kemampuan',
    konsepInti: 'Uji pengetahuanmu tentang hubungan aksi pencegahan sampah, penghematan energi, dan penyelamatan iklim bumi!',
    contoh: 'Habiskan makanan = Nol Food Waste. Matikan lampu = Hemat Energi.',
    question: {
      question: 'Manakah kebiasaan siswa yang memberikan dampak penurunan jejak karbon paling besar bagi sekolah?',
      options: [
        { value: 'A', text: 'Membawa bekal dengan wadah guna ulang, menghabiskan makanan, dan mematikan alat listrik saat tidak digunakan' },
        { value: 'B', text: 'Membeli minuman kemasan plastik baru setiap jam istirahat' },
        { value: 'C', text: 'Membiarkan kran air wastafel bocor berhari-hari' },
        { value: 'D', text: 'Membakar sampah daun kering di halaman sekolah' }
      ],
      correctAnswer: 'A',
      explanation: 'Kombinasi 3R, pencegahan food waste, dan konservasi energi adalah pilar utama gaya hidup rendah karbon.'
    },
    xpReward: 20,
    coinReward: 25
  },

  // ===== BAGIAN 10 — DUTA & INOVATOR LINGKUNGAN GLOBAL =====
  {
    id: 37,
    bagianId: 10,
    bagianTitle: 'Duta & Inovator Lingkungan Global',
    title: 'Kepemimpinan Hijau & Aksi Teman Sebaya',
    type: 'bacaan',
    pilar: 'Kemampuan',
    konsepInti: 'Seorang pemimpin hijau (Green Leader) tidak hanya mempraktikkan kebiasaan baik sendiri, tetapi juga mampu menginspirasi dan mengajak teman sekelas untuk bersama-sama menjaga kebersihan tanpa perlu menggurui atau memarahi.',
    contoh: 'Mengajak piket kelas bergiliran membawa sampah botol ke Bank Sampah sekolah setiap Jumat bersih.',
    question: {
      question: 'Bagaimana cara terbaik seorang Green Leader mengajak teman-temannya memilah sampah?',
      options: [
        { value: 'A', text: 'Memarahi teman di depan umum' },
        { value: 'B', text: 'Memberikan contoh teladan nyata terlebih dahulu dan mengajak dengan ramah dan edukatif' },
        { value: 'C', text: 'Membiarkan saja teman yang membuang sampah sembarangan' },
        { value: 'D', text: 'Menghukum teman yang salah membuang sampah' }
      ],
      correctAnswer: 'B',
      explanation: 'Keteladanan dan ajakan persuasif adalah kunci utama kepemimpinan hijau yang efektif.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 38,
    bagianId: 10,
    bagianTitle: 'Duta & Inovator Lingkungan Global',
    title: 'Kampanye Digital & Edukasi Media Sosial',
    type: 'bacaan',
    pilar: 'Kemampuan',
    konsepInti: 'Di era digital, kita bisa memanfaatkan media sosial, poster digital, atau video pendek kreatif untuk menyebarkan edukasi pemilahan sampah ThinkBin ke ribuan siswa di sekolah lain di seluruh Indonesia.',
    contoh: 'Membuat video tutorial 30 detik cara melepas label botol plastik yang ditonton ratusan teman sekolah.',
    question: {
      question: 'Apa dampak positif membuat konten edukasi lingkungan kreatif di media sosial siswa?',
      options: [
        { value: 'A', text: 'Menghabiskan kuota internet tanpa manfaat' },
        { value: 'B', text: 'Membuat orang malas memilah sampah' },
        { value: 'C', text: 'Memperluas jangkauan kesadaran peduli lingkungan ke teman sebaya di luar sekolah' },
        { value: 'D', text: 'Mengurangi jumlah daur ulang plastik' }
      ],
      correctAnswer: 'C',
      explanation: 'Kampanye digital siswa terbukti sangat efektif menularkan kebiasaan positif pemilahan sampah secara viral.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 39,
    bagianId: 10,
    bagianTitle: 'Duta & Inovator Lingkungan Global',
    title: 'Inovasi Masa Depan: Bumi Tanpa Sampah',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Masa depan pengelolaan sampah akan dipenuhi inovasi hebat: plastik dari rumput laut yang bisa dimakan, kecerdasan buatan (AI) pemilah sampah otomatis, dan kota tanpa TPA. Kamu adalah generasi penerus yang akan mewujudkan masa depan bersih tersebut!',
    contoh: 'Kemasan makanan berbahan rumput laut yang larut dalam air panas tanpa meninggalkan residu mikroplastik.',
    question: {
      question: 'Inovasi bioplastik masa depan berbahan rumput laut memiliki keunggulan utama yaitu...',
      options: [
        { value: 'A', text: 'Tidak bisa didaur ulang sama sekali' },
        { value: 'B', text: 'Mencemari laut lebih parah dari plastik minyak bumi' },
        { value: 'C', text: 'Beracun bagi hewan laut' },
        { value: 'D', text: 'Dapat terurai alami 100% tanpa menghasilkan limbah mikroplastik berbahaya' }
      ],
      correctAnswer: 'D',
      explanation: 'Bioplastik alami mudah terdegradasi menjadi nutrisi tanah/air tanpa merusak ekosistem.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 40,
    bagianId: 10,
    bagianTitle: 'Duta & Inovator Lingkungan Global',
    title: 'Ikrar Agung Legenda Bumi ThinkBin',
    type: 'komitmen',
    pilar: 'Kemauan',
    konsepInti: 'LUAR BIASA! Kamu telah menyelesaikan seluruh 10 Bab Kurikulum ThinkBin (40 Learning Nodes)! Kamu kini resmi menyandang gelar kehormatan LEGENDA GUARDIAN BUMI THINKBIN. Mari ucapkan ikrar agung kelestarian bumi!',
    contoh: '"Saya berikrar seumur hidup untuk menjaga bumi, memilah sampah dari sumbernya, dan menginspirasi generasi masa depan demi kelestarian alam semesta."',
    question: {
      question: 'Setelah menamatkan seluruh 10 Bab Kurikulum ThinkBin (Node 1 - 40), apa misi sejatimu?',
      options: [
        { value: 'A', text: 'Melupakan semua ilmu yang telah dipelajari' },
        { value: 'B', text: 'Menjadi teladan konsisten penjaga bumi dan pelopor pemilahan sampah seumur hidup' },
        { value: 'C', text: 'Berhenti peduli lingkungan karena game sudah tamat' },
        { value: 'D', text: 'Kembali membuang sampah sembarangan' }
      ],
      correctAnswer: 'B',
      explanation: 'Gelar Legenda Guardian Bumi adalah awal dari komitmen nyata seumur hidup menjaga kelestarian lingkungan!'
    },
    xpReward: 50,
    coinReward: 100
  }
];
