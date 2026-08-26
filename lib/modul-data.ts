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
  { name: 'Rookie', minXp: 0, maxXp: 49, color: 'text-slate-500 bg-slate-100 border-slate-300' },
  { name: 'Explorer', minXp: 50, maxXp: 99, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  { name: 'Guardian', minXp: 100, maxXp: 159, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { name: 'Warrior', minXp: 160, maxXp: 249, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { name: 'Champion', minXp: 250, maxXp: 319, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { name: 'Legend', minXp: 320, maxXp: 999, color: 'text-amber-600 bg-amber-50 border-amber-200 animate-pulse' }
];

export function getRankTier(xp: number) {
  return RANK_TIERS.find(t => xp >= t.minXp && xp <= t.maxXp) || RANK_TIERS[0];
}

export const MODUL_DATA: ModulNode[] = [
  // ===== BAGIAN 1 — MENGENAL SAMPAH =====
  {
    id: 1,
    bagianId: 1,
    bagianTitle: 'Mengenal Sampah',
    title: 'Apa itu Sampah & Jenis-Jenisnya',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Sampah adalah barang atau sisa makanan yang sudah tidak kita pakai lagi. Menurut aturan, sampah dibagi menjadi 3 jenis: sampah dari rumah, sampah dari tempat umum (seperti sekolah atau pasar), dan sampah khusus (seperti baterai bekas yang butuh penanganan khusus).',
    contoh: 'Sisa makanan di rumah = sampah rumah tangga. Bungkus jajanan di kantin sekolah = sampah sejenis rumah tangga. Baterai bekas = sampah khusus.',
    question: {
      question: 'Sampah sisa makanan dan bungkus jajanan dari kantin sekolah termasuk jenis sampah apa?',
      options: [
        { value: 'A', text: 'Sampah sejenis rumah tangga' },
        { value: 'B', text: 'Sampah luar angkasa' },
        { value: 'C', text: 'Sampah pabrik kimia' },
        { value: 'D', text: 'Sampah tanaman hutan' }
      ],
      correctAnswer: 'A',
      explanation: 'Sampah dari fasilitas umum seperti kantin sekolah dikategorikan sebagai sampah sejenis rumah tangga.'
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
        { value: 'A', text: 'Sampah organik basah' },
        { value: 'B', text: 'Sampah organik kering' },
        { value: 'C', text: 'Sampah plastik buatan' },
        { value: 'D', text: 'Sampah botol kaca' }
      ],
      correctAnswer: 'A',
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
        { value: 'A', text: 'Zat kimia styrofoam bisa larut dan berpindah ke makanan' },
        { value: 'B', text: 'Makanan akan langsung berubah menjadi dingin' },
        { value: 'C', text: 'Makanan akan bertambah banyak sendiri' },
        { value: 'D', text: 'Styrofoam akan berubah menjadi batu keras' }
      ],
      correctAnswer: 'A',
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
    title: 'Dampak Sampah Dibuang Sembarangan',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Jika kita membuang sampah sembarangan, lingkungan kita akan tercemar. Air kotor yang merembes dari tumpukan sampah basah (disebut air lindi) bisa meracuni tanah dan air sumur. Selain itu, sampah yang menumpuk bisa menyumbat selokan hingga banjir dan menjadi sarang nyamuk demam berdarah.',
    contoh: 'Genangan air di kaleng atau plastik bekas menjadi tempat nyamuk DBD bertelur.',
    question: {
      question: 'Cairan kotor dan bau yang merembes dari tumpukan sampah basah disebut apa?',
      options: [
        { value: 'A', text: 'Air lindi (leachate)' },
        { value: 'B', text: 'Air mineral pegunungan' },
        { value: 'C', text: 'Air hujan bersih' },
        { value: 'D', text: 'Air embun pagi' }
      ],
      correctAnswer: 'A',
      explanation: 'Air lindi adalah cairan kotor beracun yang keluar merembes dari tumpukan sampah basah.'
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
        { value: 'A', text: 'Menjadi tempat bersarang dan bertelurnya nyamuk DBD' },
        { value: 'B', text: 'Menghasilkan mata air baru yang jernih' },
        { value: 'C', text: 'Membuat udara di sekitar menjadi sangat dingin' },
        { value: 'D', text: 'Membuat tanaman di sekitar tumbuh lebih cepat' }
      ],
      correctAnswer: 'A',
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
        { value: 'A', text: 'Melalui ikan laut yang memakan mikroplastik lalu kita santap' },
        { value: 'B', text: 'Lewat sinar matahari yang terik di siang hari' },
        { value: 'C', text: 'Melalui hembusan angin sejuk di pantai' },
        { value: 'D', text: 'Lewat suara ombak di pinggir laut' }
      ],
      correctAnswer: 'A',
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
        { value: 'A', text: 'Biogas' },
        { value: 'B', text: 'Oksigen murni' },
        { value: 'C', text: 'Batu bara cair' },
        { value: 'D', text: 'Minyak goreng' }
      ],
      correctAnswer: 'A',
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
    title: 'Mengenal Gerakan 3R (Reduce, Reuse, Recycle)',
    type: 'bacaan',
    pilar: 'Kemampuan',
    konsepInti: '3R adalah langkah hebat untuk menyelamatkan bumi: 1. Reduce (Kurangi): Mengurangi sampah sejak awal, misalnya membawa botol minum sendiri. 2. Reuse (Gunakan Ulang): Memakai kembali barang yang masih bagus, misalnya kaleng bekas jadi tempat pensil. 3. Recycle (Daur Ulang): Mengolah sampah bekas di pabrik menjadi barang atau bahan baru.',
    contoh: 'Bawa tas belanja kain = Reduce. Botol bekas jadi pot tanaman = Reuse. Botol plastik dilebur jadi serat pakaian = Recycle.',
    question: {
      question: 'Apa yang membedakan Reuse dengan Recycle?',
      options: [
        { value: 'A', text: 'Reuse memakai kembali barang apa adanya, Recycle mengolahnya di pabrik jadi barang baru' },
        { value: 'B', text: 'Reuse harus membakar sampah, Recycle membuang sampah ke sungai' },
        { value: 'C', text: 'Reuse hanya untuk sisa nasi, Recycle hanya untuk daun kering' },
        { value: 'D', text: 'Keduanya sama persis dan tidak ada bedanya sama sekali' }
      ],
      correctAnswer: 'A',
      explanation: 'Reuse menggunakan barang kembali secara langsung, sedangkan Recycle melibatkan pemrosesan ulang/peleburan bahan di pabrik.'
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
        { value: 'A', text: 'Reduce (mengurangi timbulan sampah plastik sekali pakai)' },
        { value: 'B', text: 'Recycle (melebur sampah plastik di pabrik)' },
        { value: 'C', text: 'Residu (membuang sampah ke tempat akhir)' },
        { value: 'D', text: 'Reboisasi (menanam kembali pohon di hutan)' }
      ],
      correctAnswer: 'A',
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
        { value: 'A', text: 'Mengosongkan sisa air minumannya terlebih dahulu agar bersih dan kering' },
        { value: 'B', text: 'Membiarkan air manisnya tetap penuh di dalam botol' },
        { value: 'C', text: 'Mencampurnya dengan sisa kuah bakso dan sambal' },
        { value: 'D', text: 'Membakar botol plastiknya di halaman kelas' }
      ],
      correctAnswer: 'A',
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
        { value: 'A', text: 'Dari hasil penjualan sampah yang dikumpulkan di Bank Sampah' },
        { value: 'B', text: 'Dari membeli kupon undian berbayar' },
        { value: 'C', text: 'Dari meminjam uang di bank keliling' },
        { value: 'D', text: 'Dari menebang pohon di taman kota' }
      ],
      correctAnswer: 'A',
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
        { value: 'A', text: 'Karena jenis plastiknya murni dan mudah langsung didaur ulang pabrik' },
        { value: 'B', text: 'Karena botol bersih terasa jauh lebih berat daripada botol kotor' },
        { value: 'C', text: 'Karena warnanya bisa menyala sendiri dalam gelap' },
        { value: 'D', text: 'Karena botol bersih bisa langsung diminum airnya tanpa dicuci' }
      ],
      correctAnswer: 'A',
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
        { value: 'A', text: 'Mempraktikkan kebiasaan memilah sampah secara konsisten di sekolah dan rumah' },
        { value: 'B', text: 'Melupakan semua materi yang sudah dipelajari' },
        { value: 'C', text: 'Membuang sampah di sembarang tempat jika tidak ada yang melihat' },
        { value: 'D', text: 'Menggunakan plastik sekali pakai sebanyak-banyaknya' }
      ],
      correctAnswer: 'A',
      explanation: 'Praktik konsisten setiap hari adalah wujud nyata komitmen seorang Guardian Lingkungan ThinkBin!'
    },
    xpReward: 12,
    coinReward: 15
  }
];
