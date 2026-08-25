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
  // BAGIAN 1 — MENGENAL SAMPAH
  {
    id: 1,
    bagianId: 1,
    bagianTitle: 'Mengenal Sampah',
    title: 'Apa itu Sampah & Klasifikasi UU',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Sampah adalah sisa kegiatan manusia atau proses alam yang berbentuk padat (UU No. 18/2008). Nilai sampah itu relatif; bagi satu orang tidak berguna, bagi bank sampah itu bahan baku berharga. UU No. 18/2008 membagi sampah menjadi: sampah rumah tangga, sampah sejenis rumah tangga (kantor, kantin, dll), dan sampah spesifik (berbahaya).',
    contoh: 'Sisa kuah bakso di rumah adalah sampah rumah tangga. Botol plastik bekas dari kantin sekolah termasuk kategori sampah sejenis rumah tangga. Baterai bekas yang mengandung zat kimia berbahaya dikelompokkan sebagai sampah spesifik.',
    question: {
      question: 'Sampah dari kantin sekolah kita masuk ke dalam kategori sampah apa menurut UU No. 18/2008?',
      options: [
        { value: 'A', text: 'Sampah rumah tangga' },
        { value: 'B', text: 'Sampah sejenis rumah tangga' },
        { value: 'C', text: 'Sampah spesifik' },
        { value: 'D', text: 'Sampah B3' }
      ],
      correctAnswer: 'B',
      explanation: 'Sampah sejenis rumah tangga adalah sampah rumah tangga yang berasal dari kawasan komersial, industri, sosial, dan fasilitas umum lainnya, termasuk kantin sekolah.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 2,
    bagianId: 1,
    bagianTitle: 'Mengenal Sampah',
    title: 'Sampah Organik: Pengertian, Basah & Kering',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Sampah organik berasal dari makhluk hidup dan bisa diuraikan oleh bakteri secara alami. Terbagi dua: Organik Basah (kadar air tinggi, cepat membusuk, berbau, e.g. sisa sayur, buah, nasi) dan Organik Kering (kadar air rendah, lambat membusuk, e.g. daun kering, ranting, sabut kelapa).',
    contoh: 'Sisa sayuran kantin adalah organik basah yang harus segera diolah agar tidak menimbulkan bau lindi. Daun-daun kering yang berguguran di halaman sekolah adalah organik kering yang cocok dijadikan kompos pelan.',
    question: {
      question: 'Tulang ayam sisa makan siangmu termasuk kategori sampah organik basah atau kering?',
      options: [
        { value: 'A', text: 'Basah (karena berasal dari sisa makanan dan memiliki kadar air yang cepat membusuk)' },
        { value: 'B', text: 'Kering (karena teksturnya keras seperti kayu)' },
        { value: 'C', text: 'Anorganik (karena bukan tumbuhan)' },
        { value: 'D', text: 'Residu (tidak bisa diolah)' }
      ],
      correctAnswer: 'A',
      explanation: 'Tulang ayam mengandung sisa sumsum, daging basah, dan air yang cepat membusuk dan mengundang lalat, sehingga digolongkan sebagai sampah organik basah.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 3,
    bagianId: 1,
    bagianTitle: 'Mengenal Sampah',
    title: 'Sampah Anorganik: Jenis & Bahaya Kimia',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Sampah anorganik berasal dari bahan non-hayati atau sintetis (buatan pabrik/minyak bumi) yang sangat sulit terurai bakteri alami. 5 jenis utama: plastik, kaca, logam, styrofoam, dan limbah elektronik. Beberapa bahan anorganik mengandung zat kimia berbahaya seperti BPA pada plastik polikarbonat, styrene pada styrofoam, serta merkuri/timbal pada baterai bekas.',
    contoh: 'Styrofoam yang dipakai mewadahi kuah bakso panas berisiko melepas zat kimia styrene ke makanan, yang berbahaya bagi kesehatan jika menumpuk di tubuh.',
    question: {
      question: 'Zat kimia apa yang perlu diwaspadai pada wadah styrofoam karena berisiko berpindah ke makanan saat terkena panas?',
      options: [
        { value: 'A', text: 'BPA' },
        { value: 'B', text: 'Mercury' },
        { value: 'C', text: 'Styrene' },
        { value: 'D', text: 'Chlorofluorocarbon (CFC)' }
      ],
      correctAnswer: 'C',
      explanation: 'Styrofoam dibuat dari polistirena. Saat terkena suhu panas atau lemak dari makanan, monomer styrene yang bersifat karsinogenik dapat lepas dan larut ke makanan.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 4,
    bagianId: 1,
    bagianTitle: 'Mengenal Sampah',
    title: '🎮 Kuis Tantangan: Pilah Organik vs Anorganik',
    type: 'kuis',
    pilar: 'Kemampuan',
    konsepInti: 'Uji kecepatanmu memisahkan sampah! Tarik atau klik item sampah ke tong sampah yang benar (Organik vs Anorganik) sebelum waktu habis!',
    contoh: 'Botol plastik masuk Anorganik. Kulit pisang masuk Organik.',
    xpReward: 12,
    coinReward: 15
  },

  // BAGIAN 2 — DAMPAK LINGKUNGAN
  {
    id: 5,
    bagianId: 2,
    bagianTitle: 'Dampak Lingkungan',
    title: 'Dampak Sampah: Tanah, Air, Udara & Kesehatan',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Sampah tidak terkelola berdampak buruk di berbagai media: Tanah tercemar cairan lindi (leachate - cairan kotor berbau dari tumpukan sampah); Air tersumbat hingga banjir dan melukai hewan air; Udara tercemar gas metana (pemicu pemanasan global 28x lebih kuat dari CO2); Kesehatan terancam karena tumpukan sampah menjadi sarang vektor penyakit (lalat, nyamuk DBD, tikus).',
    contoh: 'Kaleng bekas yang tergenang air hujan di sudut halaman sekolah menjadi sarang nyamuk Aedes aegypti penyebar demam berdarah dengue (DBD).',
    question: {
      question: 'Cairan kotor dan berbau yang keluar merembes dari tumpukan sampah dan merusak kualitas air tanah disebut...',
      options: [
        { value: 'A', text: 'Cairan biogas' },
        { value: 'B', text: 'Lindi (leachate)' },
        { value: 'C', text: 'Pupuk cair alami' },
        { value: 'D', text: 'Residu lindi' }
      ],
      correctAnswer: 'B',
      explanation: 'Lindi adalah cairan kotor yang terbentuk akibat air hujan yang merembes melewati tumpukan sampah, melarutkan zat kimia dan bakteri merugikan langsung ke tanah.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 6,
    bagianId: 2,
    bagianTitle: 'Dampak Lingkungan',
    title: '🎮 Kuis Tantangan: Dampak Sampah',
    type: 'kuis',
    pilar: 'Kemampuan',
    konsepInti: 'Uji pemahamanmu tentang bahaya lingkungan! Cocokkan dampak negatif dengan media lingkungan yang dicemarinya secara cepat!',
    contoh: 'Lindi merusak Tanah. Gas Metana mencemari Udara.',
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 7,
    bagianId: 2,
    bagianTitle: 'Dampak Lingkungan',
    title: 'Mikroplastik: Asal & Rantai Makanan',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Mikroplastik adalah partikel plastik super kecil berukuran kurang dari 5 milimeter. Terbentuk dari sampah plastik besar yang retak dan hancur akibat paparan sinar matahari, panas, air laut, dan gesekan fisik bertahun-tahun. Mikroplastik terapung di air, termakan oleh plankton atau ikan kecil, lalu naik ke rantai makanan hingga termakan oleh manusia.',
    contoh: 'Ikan tongkol di laut tidak sengaja menelan serpihan mikroplastik karena mengiranya makanan. Ketika ikan itu ditangkap dan dimakan manusia, mikroplastik ikut masuk ke tubuh manusia.',
    question: {
      question: 'Bagaimana serpihan partikel mikroplastik (ukuran kurang dari 5 mm) bisa terbentuk di lingkungan?',
      options: [
        { value: 'A', text: 'Sengaja dipotong kecil oleh pabrik sedotan' },
        { value: 'B', text: 'Sampah plastik besar pecah bertahap akibat matahari, panas, dan gesekan fisik' },
        { value: 'C', text: 'Hasil pembakaran sampah anorganik di sekolah' },
        { value: 'D', text: 'Bakteri mengunyah plastik menjadi butiran kecil' }
      ],
      correctAnswer: 'B',
      explanation: 'Plastik tidak hancur secara biologis, melainkan pecah secara mekanis (degradasi fisik) akibat panas matahari (sinar UV) dan gesekan air/angin menjadi serpihan renik.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 8,
    bagianId: 2,
    bagianTitle: 'Dampak Lingkungan',
    title: 'Waste-to-Energy: Sampah Jadi Energi',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Sampah organik basah bisa diolah menjadi biogas sebagai energi alternatif ramah lingkungan melalui proses pencernaan tanpa oksigen (digesti anaerob) oleh bakteri. Gas metana yang dihasilkan ditangkap untuk bahan bakar kompor atau generator listrik, sehingga tidak lepas bebas mencemari atmosfer.',
    contoh: 'Instalasi biogas mini di kantin SMPN 20 Malang memanfaatkan sisa makanan kuah dan nasi basi untuk menghasilkan gas masak gratis bagi ibu kantin.',
    question: {
      question: 'Proses biologis tanpa oksigen yang mengubah tumpukan sampah organik basah menjadi bahan bakar biogas disebut...',
      options: [
        { value: 'A', text: 'Dehidrasi termal' },
        { value: 'B', text: 'Komposting aerob' },
        { value: 'C', text: 'Digesti anaerob' },
        { value: 'D', text: 'Insenerasi kimia' }
      ],
      correctAnswer: 'C',
      explanation: 'Digesti anaerob adalah penguraian bahan organik oleh mikroorganisme dalam kondisi tanpa oksigen bebas, menghasilkan gas metana (CH4) dan karbon dioksida (CO2).'
    },
    xpReward: 12,
    coinReward: 15
  },

  // BAGIAN 3 — SOLUSI & AKSI
  {
    id: 9,
    bagianId: 3,
    bagianTitle: 'Solusi & Aksi',
    title: '3R: Reduce, Reuse, Recycle',
    type: 'bacaan',
    pilar: 'Kemampuan',
    konsepInti: 'Prinsip utama pengelolaan sampah berkelanjutan: Reduce (mengurangi konsumsi barang sekali pakai sebelum menjadi sampah); Reuse (menggunakan kembali barang layak pakai secara langsung tanpa proses industri); Recycle (mengolah kembali sampah melalui daur ulang industri menjadi produk baru yang berbeda).',
    contoh: 'Reduce: membawa tumbler minum sendiri ke sekolah. Reuse: menggunakan toples sosis bekas untuk wadah pensil di meja. Recycle: menyetorkan botol plastik kotor ke pabrik untuk dihancurkan menjadi serat dacron/baju.',
    question: {
      question: 'Manakah contoh perilaku nyata yang mencerminkan tindakan REUSE di lingkungan sekolah?',
      options: [
        { value: 'A', text: 'Mengumpulkan kertas bekas ujian untuk dilebur kembali di pabrik kertas' },
        { value: 'B', text: 'Membeli air minum kemasan gelas plastik setiap hari karena harganya murah' },
        { value: 'C', text: 'Menggunakan botol plastik bekas air mineral menjadi pot tanaman hias kelas' },
        { value: 'D', text: 'Menolak kantong kresek saat belanja di koperasi sekolah' }
      ],
      correctAnswer: 'C',
      explanation: 'Mengubah botol plastik langsung menjadi pot tanpa mengubah struktur fisik bahannya melalui proses peleburan pabrik adalah tindakan memakai kembali (Reuse).'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 10,
    bagianId: 3,
    bagianTitle: 'Solusi & Aksi',
    title: '🎮 Kuis Tantangan: Praktik 3R',
    type: 'kuis',
    pilar: 'Kemampuan',
    konsepInti: 'Uji kemampuan memorimu! Klasifikasikan berbagai aksi ramah lingkungan sekolah ke dalam kategori Reduce, Reuse, atau Recycle secara tepat dan cepat!',
    contoh: 'Menolak sedotan = Reduce. Memakai tas kain berulang = Reuse.',
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 11,
    bagianId: 3,
    bagianTitle: 'Solusi & Aksi',
    title: 'Pemilahan Sampah di Sumber: Kategori & Alasannya',
    type: 'bacaan',
    pilar: 'Kemampuan',
    konsepInti: 'Pemilahan sampah paling sukses wajib dilakukan langsung sejak dari sumbernya (di ruang kelas/rumah oleh dirimu sendiri) sebelum masuk ke tempat pembuangan. Jika sampah terlanjur bercampur dan basah terkena sisa kuah makanan, kualitas material anorganik (seperti kertas/plastik) akan hancur dan tercemar, sehingga harganya jatuh atau ditolak oleh industri daur ulang.',
    contoh: 'Membuang sisa sedotan kering langsung ke tong anorganik, dan membuang kuah bakso terlebih dahulu ke wastafel sebelum meletakkan mangkuk kertas di tempat sampah residu.',
    question: {
      question: 'Kenapa pemilahan sampah di sumber (seperti di kelas oleh murid langsung) jauh lebih baik daripada memilah sampah di TPA?',
      options: [
        { value: 'A', text: 'Karena di TPA tidak ada petugas kebersihan yang mau memilah' },
        { value: 'B', text: 'Karena sampah belum tercampur kotoran/lindi sehingga kualitas material daur ulangnya sangat tinggi' },
        { value: 'C', text: 'Karena aturan sekolah mewajibkan guru saja yang memilah' },
        { value: 'D', text: 'Karena memilah di TPA bisa memicu ledakan gas metana' }
      ],
      correctAnswer: 'B',
      explanation: 'Pemilahan di sumber mencegah kontaminasi silang. Plastik atau kertas yang bersih dari sisa makanan basah memiliki nilai sirkular dan daur ulang yang jauh lebih tinggi.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 12,
    bagianId: 3,
    bagianTitle: 'Solusi & Aksi',
    title: '🎮 Kuis Tantangan: Pemilahan Sumber',
    type: 'kuis',
    pilar: 'Kemampuan',
    konsepInti: 'Latihan memilah sampah dengan benar! Salurkan sampah harian sekolah ke 3 tong khusus: Organik Basah, Organik Kering, atau Anorganik!',
    contoh: 'Daun gugur = Organik Kering. Sisa nasi = Organik Basah. Gelas plastik = Anorganik.',
    xpReward: 12,
    coinReward: 15
  },

  // BAGIAN 4 — GAYA HIDUP HIJAU
  {
    id: 13,
    bagianId: 4,
    bagianTitle: 'Gaya Hidup Hijau',
    title: 'Bank Sampah: Cara Kerja & Siklus Reward ThinkBin',
    type: 'bacaan',
    pilar: 'Kemampuan',
    konsepInti: 'Bank Sampah sekolah adalah ekosistem menabung sampah terpilah. Alurnya: Siswa memilah sampah di kelas -> ditimbang berkala -> dicatat beratnya (tonase) -> dijual ke pengepul/BSM (Bank Sampah Malang) -> uang hasil penjualan disalurkan kembali sebagai pendanaan program reward digital (XP/Coin) ThinkBin Anda. Data digital (jumlah scan) dan fisik (berat timbangan) dicocokkan untuk mendeteksi kecurangan siswa.',
    contoh: 'Siswa kelas 9C rutin mengumpulkan botol PET bersih. Setiap minggu terkumpul 5 kg botol. Saat disetor ke Bank Sampah sekolah, tabungan kas kelas bertambah, sekaligus memicu rilis Coin bagi siswa teraktif.',
    question: {
      question: 'Sistem web ThinkBin mencocokkan data scan digital dengan berat fisik timbangan sampah harian. Tujuannya adalah...',
      options: [
        { value: 'A', text: 'Agar server database web tidak kelebihan beban penyimpanan data' },
        { value: 'B', text: 'Mendeteksi kecurangan siswa yang melakukan scan QR tanpa membuang sampah fisik' },
        { value: 'C', text: 'Menghitung sisa kuota internet gratis dari sekolah' },
        { value: 'D', text: 'Membagikan koin secara acak tanpa melihat kebenaran pemilahan' }
      ],
      correctAnswer: 'B',
      explanation: 'Mekanisme pencocokan silang data scan dengan tonase timbangan fisik memastikan integritas data penelitian. Jika scan tinggi tapi timbangan nol, terindikasi adanya manipulasi data.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 14,
    bagianId: 4,
    bagianTitle: 'Gaya Hidup Hijau',
    title: 'Literasi Ekonomi: Nilai Jual Sampah Anorganik',
    type: 'bacaan',
    pilar: 'Pengetahuan',
    konsepInti: 'Ekonomi Sirkular mengajarkan bahwa sampah adalah aset. Nilai jual sampah berbeda tergantung kebersihannya. Bahkan satu botol plastik memiliki 4 bagian dengan jenis resin berbeda: tutup (PP/HDPE), ring segel, label, dan badan botol (PET). Memilah komponen ini menaikkan harga jualnya! Data riil BSM (Bank Sampah Malang) menunjukkan: Botol PET bening bersih lepas label & tutup dihargai Rp4.500-Rp5.000/kg, sedangkan botol PET kotor bercampur dihargai jatuh hanya Rp1.500-Rp2.000/kg. Tutup botol murni dihargai Rp3.000/kg.',
    contoh: 'Radit memilah 2 kg botol PET di kelas: melepaskan labelnya, memisahkan tutupnya ke wadah khusus, lalu melipat badan botolnya agar ringkas. Tindakan memisahkan komponen ini meningkatkan nilai jual sampah kelas di mata Bank Sampah.',
    question: {
      question: 'Kenapa botol plastik PET bening yang sudah bersih dan dipisahkan dari label serta tutupnya dihargai jauh lebih mahal dibanding botol yang masih kotor?',
      options: [
        { value: 'A', text: 'Karena botol bersih memiliki ukuran fisik yang lebih besar saat ditimbang' },
        { value: 'B', text: 'Karena setiap komponen dibuat dari jenis resin plastik yang berbeda, sehingga pemisahan di awal memangkas biaya pilah ulang pabrik' },
        { value: 'C', text: 'Karena botol bersih tidak lagi mengandung mikroplastik berbahaya' },
        { value: 'D', text: 'Karena tutup botol bersifat korosif dan merusak lingkungan daur ulang' }
      ],
      correctAnswer: 'B',
      explanation: 'Badan botol adalah plastik PET, sedangkan tutupnya adalah plastik PP/HDPE yang memiliki rantai polimer berbeda. Jika bercampur, pabrik harus mendanai proses sortir ulang secara manual.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 15,
    bagianId: 4,
    bagianTitle: 'Gaya Hidup Hijau',
    title: 'Kebiasaan Hijau & Dari Tahu → Mau → Mampu',
    type: 'bacaan',
    pilar: 'Kemauan',
    konsepInti: 'Transformasi perilaku berkelanjutan membutuhkan 3 pilar utama: 1) Pengetahuan (tahu cara memilah dan dampaknya), 2) Kemauan (memiliki motivasi internal untuk bertindak), dan 3) Kemampuan (mampu berpraktik secara konsisten didukung sarana tong sampah). Perubahan perilaku permanen membutuhkan konsistensi intervensi selama minimal 3 bulan.',
    contoh: 'Setelah memahami teori dampak (Tahu) dan terdorong menjaga kebersihan kelas (Mau), Asyraf selalu konsisten menyortir sampahnya sendiri ke tong kelas yang sesuai tanpa perlu diperingatkan guru lagi (Mampu).',
    question: {
      question: 'Urutan transformasi perilaku yang paling direkomendasikan para praktisi untuk menumbuhkan kebiasaan hijau permanen adalah...',
      options: [
        { value: 'A', text: 'Pemberian uang -> Pembelian tong -> Pembacaan buku teori' },
        { value: 'B', text: 'Pengetahuan (sebagai pondasi dasar) -> Pelaksanaan Aksi Nyata -> Penumbuhan Motivasi Jangka Panjang' },
        { value: 'C', text: 'Penggunaan handphone -> Pembuatan aplikasi -> Pembagian hadiah gratis' },
        { value: 'D', text: 'Pemberian hukuman keras -> Pengawasan ketat -> Penguncian tong sampah' }
      ],
      correctAnswer: 'B',
      explanation: 'Pengetahuan adalah pondasi dasar utama. Pengetahuan memandu aksi yang benar secara logis, dan kepuasan dari aksi nyata tersebut memicu motivasi ekologis jangka panjang.'
    },
    xpReward: 12,
    coinReward: 15
  },
  {
    id: 16,
    bagianId: 4,
    bagianTitle: 'Gaya Hidup Hijau',
    title: 'Komitmen Hijau: Rencana Aksi Pribadi',
    type: 'komitmen',
    pilar: 'Kemauan',
    konsepInti: 'Selamat! Kamu telah menyelesaikan seluruh 16 Node Peta Belajar ThinkBin! Sebagai penutup petualangan belajarmu, tuliskan satu komitmen aksi hijau nyata yang akan kamu laksanakan secara konsisten di sekolah maupun di rumah!',
    contoh: '"Saya berkomitmen membawa kotak makan sendiri untuk jajan di kantin sekolah guna memangkas sampah wadah plastik."',
    xpReward: 12,
    coinReward: 15
  }
];
