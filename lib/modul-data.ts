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
  { id: 4, title: 'Gaya Hidup Hijau', desc: 'Bank Sampah, ekonomi sirkular, dan komitmen pribadi' }
];

export const RANK_TIERS = [
  { name: 'Rookie', minXp: 0, maxXp: 39, color: 'text-slate-500 bg-slate-100 border-slate-300' },
  { name: 'Explorer', minXp: 40, maxXp: 79, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  { name: 'Guardian', minXp: 80, maxXp: 119, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { name: 'Warrior', minXp: 120, maxXp: 179, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { name: 'Champion', minXp: 180, maxXp: 239, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { name: 'Legend', minXp: 240, maxXp: 999, color: 'text-amber-600 bg-amber-50 border-amber-200 animate-pulse' }
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
    type: 'komitmen',
    pilar: 'Kemauan',
    konsepInti: 'Hebat sekali! Kamu sudah mempelajari semua cara menjaga bumi dan memilah sampah. Sekarang, mari tuliskan satu janji aksi nyata yang akan kamu lakukan mulai hari ini!',
    contoh: '"Saya berkomitmen membawa kotak makan sendiri untuk jajan di kantin sekolah guna memangkas sampah wadah plastik."',
    question: {
      question: 'Setelah mempelajari seluruh materi ThinkBin, apa langkah terpenting yang harus kita lakukan setiap hari?',
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
  }
];
