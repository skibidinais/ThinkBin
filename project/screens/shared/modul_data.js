// ThinkBin - Modul Pembelajaran (16 Node, 5 Hari)
// Struktur: 4 Bagian x 4 Node. Node bertipe "kuis-tantangan" = minigame checkpoint (belum final, desain menyusul terpisah).
// Setiap node non-kuis punya: konsep inti (untuk halaman Bacaan) + soal cek pemahaman (untuk halaman Kuis).

var modulData = [
  // ===== BAGIAN 1 — MENGENAL SAMPAH =====
  {
    bagian: 1,
    bagianTitle: "Mengenal Sampah",
    nodeId: 1,
    type: "bacaan+kuis",
    title: "Apa itu Sampah & Klasifikasi UU",
    xp: 12,
    bacaan: {
      konsepInti: "UU No. 18/2008 membagi sampah menjadi 3 kelompok: 1. Sampah rumah tangga (dari kegiatan sehari-hari di rumah tangga). 2. Sampah sejenis rumah tangga (dari fasilitas komersial, industri, atau fasilitas umum seperti sekolah dan pasar). 3. Sampah spesifik (membutuhkan penanganan khusus karena sifat/konsentrasinya seperti baterai bekas, lampu neon/LED pecah, obat kadaluarsa, sisa cat/tinner, atau elektronik kecil rusak). ThinkBin secara fisik menangani sampah rumah tangga dan sejenis rumah tangga yang dipilah menjadi Organik dan Anorganik di tong sekolah. Sampah spesifik sengaja tidak masuk ke tong ThinkBin agar tidak mencemari sampah daur ulang dan membahayakan petugas kebersihan.",
      contoh: "Sisa makanan di kantin sekolah = sampah sejenis rumah tangga. Bungkus jajanan = sampah sejenis rumah tangga anorganik. Baterai jam tangan bekas yang menempel di kotak pensil siswa = sampah spesifik (harus dibawa pulang atau diserahkan ke drop-box limbah baterai khusus)."
    },
    kuis: {
      pertanyaan: "Sampah dari kantin sekolah termasuk kategori apa menurut UU No. 18/2008?",
      tipe: "pilihan_ganda",
      opsi: [
        { id: "a", text: "Rumah tangga" },
        { id: "b", text: "Sejenis rumah tangga" },
        { id: "c", text: "Spesifik" },
        { id: "d", text: "Bukan termasuk ketiganya" }
      ],
      jawabanBenar: "b"
    }
  },
  {
    bagian: 1,
    bagianTitle: "Mengenal Sampah",
    nodeId: 2,
    type: "bacaan+kuis",
    title: "Sampah Organik (Mudah Membusuk)",
    xp: 12,
    bacaan: {
      konsepInti: "Sampah organik adalah sampah alami yang berasal dari sisa tumbuhan atau hewan, sehingga bisa membusuk dan hancur sendiri menjadi tanah atau pupuk kompos. Ada dua macam: organik basah (berair dan cepat busuk seperti sisa nasi, sayur, dan buah) serta organik kering (kering dan lebih lama membusuk seperti daun gugur dan ranting pohon).",
      contoh: "Sisa sayuran dan kulit pisang = organik basah. Daun kering di halaman = organik kering."
    },
    kuis: {
      pertanyaan: "Sisa sayuran, potongan buah, dan sisa makanan yang berair termasuk jenis sampah apa?",
      tipe: "pilihan_ganda",
      opsi: [
        { id: "a", text: "Sampah organik basah" },
        { id: "b", text: "Sampah organik kering" },
        { id: "c", text: "Sampah plastik buatan" },
        { id: "d", text: "Sampah botol kaca" }
      ],
      jawabanBenar: "a"
    }
  },
  {
    bagian: 1,
    bagianTitle: "Mengenal Sampah",
    nodeId: 3,
    type: "bacaan+kuis",
    title: "Sampah Anorganik (Sulit Membusuk)",
    xp: 12,
    bacaan: {
      konsepInti: "Sampah anorganik adalah sampah buatan pabrik dari bahan non-alami yang sangat sulit membusuk di tanah. Contoh utamanya: botol plastik, kaca, kaleng logam, dan styrofoam. Ingat ya, wadah styrofoam tidak boleh dipakai untuk makanan yang masih sangat panas karena zat kimianya bisa larut ke makanan.",
      contoh: "Botol minum plastik, kaleng minuman, dan wadah styrofoam."
    },
    kuis: {
      pertanyaan: "Mengapa kita tidak boleh menaruh makanan yang masih sangat panas ke dalam wadah styrofoam?",
      tipe: "pilihan_ganda",
      opsi: [
        { id: "a", text: "Zat kimia styrofoam bisa larut dan berpindah ke makanan" },
        { id: "b", text: "Makanan akan langsung berubah menjadi dingin" },
        { id: "c", text: "Makanan akan bertambah banyak sendiri" },
        { id: "d", text: "Styrofoam akan berubah menjadi batu keras" }
      ],
      jawabanBenar: "a"
    }
  },
  {
    bagian: 1,
    bagianTitle: "Mengenal Sampah",
    nodeId: 4,
    type: "kuis-tantangan",
    title: "Kuis Tantangan: Pilah Organik vs Anorganik",
    xp: 12,
    deskripsi: "Checkpoint minigame bertimer (bukan node bacaan). Menguji kecepatan & ketepatan siswa menerapkan materi dari node-node sebelumnya di Bagian yang sama.",
    status: "belum_final",
    catatan: "Detail desain minigame menyusul terpisah."
  },

  // ===== BAGIAN 2 — DAMPAK LINGKUNGAN =====
  {
    bagian: 2,
    bagianTitle: "Dampak Lingkungan",
    nodeId: 5,
    type: "bacaan+kuis",
    title: "Dampak Sampah & Gas Metana",
    xp: 12,
    bacaan: {
      konsepInti: "Di antara dampak sampah (tanah, air, udara, kesehatan, dan ekonomi), dampak udara memiliki satu detail penting: gas metana (CH4). Gas metana dihasilkan dari sampah organik yang membusuk di tumpukan terutama di TPA yang tertutup rapat tanpa oksigen. Metana bukan sekadar menimbulkan bau busuk, tetapi merupakan gas rumah kaca yang efek menahan panasnya di atmosfer puluhan kali lebih kuat dibanding CO2. Selain itu, rembesan cairan kotor dari tumpukan sampah (disebut air lindi) dapat meracuni air tanah dan sumur.",
      contoh: "Satu tumpukan sisa makanan kantin yang dibiarkan menumpuk selama seminggu dalam kondisi tertutup rapat akan mulai menghasilkan gas metana. Jika sampah dipilah dan dikompos, pembentukan gas metana liar bisa dicegah."
    },
    kuis: {
      pertanyaan: "Cairan hasil rembesan sampah yang mencemari tanah dan air disebut apa?",
      tipe: "pilihan_ganda",
      opsi: [
        { id: "a", text: "Emisi" },
        { id: "b", text: "Lindi" },
        { id: "c", text: "Residu" },
        { id: "d", text: "Sedimen" }
      ],
      jawabanBenar: "b"
    }
  },
  {
    bagian: 2,
    bagianTitle: "Dampak Lingkungan",
    nodeId: 6,
    type: "kuis-tantangan",
    title: "Kuis Tantangan: Dampak Sampah",
    xp: 12,
    deskripsi: "Checkpoint minigame bertimer (bukan node bacaan). Menguji kecepatan & ketepatan siswa menerapkan materi dari node-node sebelumnya di Bagian yang sama.",
    status: "belum_final",
    catatan: "Detail desain minigame menyusul terpisah."
  },
  {
    bagian: 2,
    bagianTitle: "Dampak Lingkungan",
    nodeId: 7,
    type: "bacaan+kuis",
    title: "Bahaya Mikroplastik di Sekitar Kita",
    xp: 12,
    bacaan: {
      konsepInti: "Plastik yang terbuang ke laut tidak akan hilang, melainkan hancur menjadi serpihan-serpihan super kecil (kurang dari 5 milimeter) yang disebut mikroplastik. Ikan di laut mengira serpihan kecil itu adalah makanan lalu memakannya. Jika ikan tersebut kita makan, serpihan plastik itu bisa masuk ke dalam tubuh kita!",
      contoh: "Ikan di laut menelan serpihan mikroplastik, lalu ikan itu ditangkap dan dimasak untuk manusia."
    },
    kuis: {
      pertanyaan: "Bagaimana pecahan plastik super kecil (mikroplastik) di laut bisa masuk ke tubuh manusia?",
      tipe: "pilihan_ganda",
      opsi: [
        { id: "a", text: "Melalui ikan laut yang memakan mikroplastik lalu kita santap" },
        { id: "b", text: "Lewat sinar matahari yang terik di siang hari" },
        { id: "c", text: "Melalui hembusan angin sejuk di pantai" },
        { id: "d", text: "Lewat suara ombak di pinggir laut" }
      ],
      jawabanBenar: "a"
    }
  },
  {
    bagian: 2,
    bagianTitle: "Dampak Lingkungan",
    nodeId: 8,
    type: "bacaan+kuis",
    title: "Mengubah Sampah Menjadi Energi",
    xp: 12,
    bacaan: {
      konsepInti: "Sampah tidak selalu jadi musuh! Sampah sisa makanan dan kotoran bisa disimpan di tabung khusus tanpa udara untuk menghasilkan gas alami yang disebut biogas. Biogas ini bisa dipakai untuk menyalakan kompor memasak atau menghasilkan listrik yang ramah lingkungan.",
      contoh: "Sisa makanan dari dapur diolah jadi biogas untuk memasak tanpa perlu membeli gas elpiji."
    },
    kuis: {
      pertanyaan: "Sampah sisa makanan dan organik dapat diolah menjadi gas alami yang disebut apa?",
      tipe: "pilihan_ganda",
      opsi: [
        { id: "a", text: "Biogas" },
        { id: "b", text: "Oksigen murni" },
        { id: "c", text: "Batu bara cair" },
        { id: "d", text: "Minyak goreng" }
      ],
      jawabanBenar: "a"
    }
  },

  // ===== BAGIAN 3 — SOLUSI & AKSI =====
  {
    bagian: 3,
    bagianTitle: "Solusi & Aksi",
    nodeId: 9,
    type: "bacaan+kuis",
    title: "Prinsip 3R (Refuse, Reduce, Reuse, Recycle)",
    xp: 12,
    bacaan: {
      konsepInti: "Sebelum 3R (Reduce, Reuse, Recycle), ada satu prinsip yang sangat penting di awal: Refuse (Menolak) — menolak barang sekali pakai sebelum barang itu sampai ke tangan kita jika memang tidak dibutuhkan. Bedanya dengan Reduce: Refuse terjadi pada titik paling awal (saat ditawari/sebelum membeli), sedangkan Reduce terjadi setelah barang sudah menjadi kebiasaan dipakai tetapi jumlahnya dikurangi. Urutan lengkap aksi pencegahan sampah adalah: Refuse -> Reduce -> Reuse -> Recycle, di mana 3 prinsip pertama mencegah barang menjadi sampah, dan hanya Recycle yang mengolah barang yang sudah terlanjur jadi sampah.",
      contoh: "Refuse: Menolak sedotan plastik atau kantong kresek saat jajan di kantin (\"tanpa sedotan\"). Reduce: Mengurangi pemakaian kertas tisu dengan saputangan. Reuse: Menggunakan botol minum berulang kali. Recycle: Menyerahkan kardus ke bank sampah untuk didaur ulang."
    },
    kuis: {
      pertanyaan: "Apa perbedaan utama antara prinsip Refuse dan Reduce?",
      tipe: "pilihan_ganda",
      opsi: [
        { id: "a", text: "Refuse membakar sampah, sedangkan Reduce menimbunnya di tanah" },
        { id: "b", text: "Refuse menolak barang sejak sebelum sampai ke tangan kita, sedangkan Reduce mengurangi jumlah barang yang digunakan" },
        { id: "c", text: "Refuse hanya untuk sampah organik, sedangkan Reduce hanya untuk anorganik" },
        { id: "d", text: "Refuse dan Reduce sama sekali tidak ada bedanya" }
      ],
      jawabanBenar: "b"
    }
  },
  {
    bagian: 3,
    bagianTitle: "Solusi & Aksi",
    nodeId: 10,
    type: "kuis-tantangan",
    title: "Kuis Tantangan: Praktik 3R",
    xp: 12,
    deskripsi: "Checkpoint minigame bertimer (bukan node bacaan). Menguji kecepatan & ketepatan siswa menerapkan materi dari node-node sebelumnya di Bagian yang sama.",
    status: "belum_final",
    catatan: "Detail desain minigame menyusul terpisah."
  },
  {
    bagian: 3,
    bagianTitle: "Solusi & Aksi",
    nodeId: 11,
    type: "bacaan+kuis",
    title: "Memilah Sampah dari Rumah dan Sekolah",
    xp: 12,
    bacaan: {
      konsepInti: "Memilah sampah paling bagus dilakukan langsung saat kita membuangnya di rumah atau di sekolah. Kalau sampah sudah bercampur di Tempat Pembuangan Akhir (TPA), sampahnya akan kotor, bau, dan sangat sulit untuk didaur ulang kembali.",
      contoh: "Memisahkan botol plastik bersih ke tempat terpisah dari sisa makanan basah."
    },
    kuis: {
      pertanyaan: "Mengapa kita harus memilah sampah langsung dari sumbernya (rumah atau sekolah)?",
      tipe: "pilihan_ganda",
      opsi: [
        { id: "a", text: "Agar sampah belum kotor/tercampur sehingga mudah didaur ulang" },
        { id: "b", text: "Agar sampah menjadi lebih cepat berbau busuk" },
        { id: "c", text: "Agar tempat sampah di rumah cepat penuh" },
        { id: "d", text: "Agar sampah bisa langsung dihanyutkan ke selokan" }
      ],
      jawabanBenar: "a"
    }
  },
  {
    bagian: 3,
    bagianTitle: "Solusi & Aksi",
    nodeId: 12,
    type: "kuis-tantangan",
    title: "Kuis Tantangan: Pemilahan Sumber",
    xp: 12,
    deskripsi: "Checkpoint minigame bertimer (bukan node bacaan). Menguji kecepatan & ketepatan siswa menerapkan materi dari node-node sebelumnya di Bagian yang sama.",
    status: "belum_final",
    catatan: "Detail desain minigame menyusul terpisah."
  },

  // ===== BAGIAN 4 — GAYA HIDUP HIJAU =====
  {
    bagian: 4,
    bagianTitle: "Gaya Hidup Hijau",
    nodeId: 13,
    type: "bacaan+kuis",
    title: "Menabung di Bank Sampah & Reward ThinkBin",
    xp: 12,
    bacaan: {
      konsepInti: "Bank Sampah adalah tempat di mana kita bisa menyetor sampah anorganik (seperti kardus, kertas, dan botol plastik). Sampah yang kita kumpulkan akan ditimbang dan dicatat. Hasil penjualannya digunakan untuk membiayai koin dan hadiah reward seru untuk siswa di ThinkBin!",
      contoh: "Menabung botol plastik bekas kelas ke Bank Sampah sekolah untuk ditukar koin reward mingguan."
    },
    kuis: {
      pertanyaan: "Dari mana asal dana dan hadiah reward yang diperoleh siswa di ThinkBin?",
      tipe: "pilihan_ganda",
      opsi: [
        { id: "a", text: "Dari hasil penjualan sampah yang dikumpulkan di Bank Sampah" },
        { id: "b", text: "Dari membeli kupon undian berbayar" },
        { id: "c", text: "Dari meminjam uang di bank keliling" },
        { id: "d", text: "Dari menebang pohon di taman kota" }
      ],
      jawabanBenar: "a"
    }
  },
  {
    bagian: 4,
    bagianTitle: "Gaya Hidup Hijau",
    nodeId: 14,
    type: "bacaan+kuis",
    title: "Nilai Jual Sampah yang Dipilah",
    xp: 12,
    bacaan: {
      konsepInti: "Tahukah kamu? Sampah yang sudah dipilah dan dibersihkan harganya jauh lebih mahal! Misalnya botol plastik bening yang bersih dan sudah dilepas tutup serta labelnya dihargai lebih tinggi di Bank Sampah dibanding botol yang kotor dan masih bercampur.",
      contoh: "Botol plastik bersih tanpa label dihargai Rp5.000/kg, sedangkan botol kotor yang masih ada labelnya hanya Rp1.500/kg.",
      tabelReferensi: {
        data: [
          { jenis: "Botol PET bening (bersih, lepas label & tutup)", hargaAnggota: "4.500-5.000", hargaBSM: "5.000" },
          { jenis: "Botol PET warna", hargaAnggota: "500-1.000", hargaBSM: "1.000" },
          { jenis: "Botol PET kotor (label/tutup masih menempel)", hargaAnggota: "1.500-2.000", hargaBSM: "2.000" },
          { jenis: "Tutup botol (HDPE/PP), murni", hargaAnggota: "2.900-3.000", hargaBSM: "3.000" },
          { jenis: "Gelas plastik bening", hargaAnggota: "4.500", hargaBSM: "4.500" },
          { jenis: "Plastik kresek", hargaAnggota: "250-500", hargaBSM: "500" }
        ]
      }
    },
    kuis: {
      pertanyaan: "Mengapa botol plastik yang bersih dan dilepas labelnya dihargai lebih mahal di Bank Sampah?",
      tipe: "pilihan_ganda",
      opsi: [
        { id: "a", text: "Karena jenis plastiknya murni dan mudah langsung didaur ulang pabrik" },
        { id: "b", text: "Karena botol bersih terasa jauh lebih berat daripada botol kotor" },
        { id: "c", text: "Karena warnanya bisa menyala sendiri dalam gelap" },
        { id: "d", text: "Karena botol bersih bisa langsung diminum airnya tanpa dicuci" }
      ],
      jawabanBenar: "a"
    }
  },
  {
    bagian: 4,
    bagianTitle: "Gaya Hidup Hijau",
    nodeId: 15,
    type: "bacaan+kuis",
    title: "Tiga Langkah Kebiasaan Hijau",
    xp: 12,
    bacaan: {
      konsepInti: "Agar bumi tetap bersih dan sehat, kita perlu 3 langkah kebiasaan: 1. Tahu: Memahami jenis sampah dan cara memilahnya dengan benar. 2. Mau: Memiliki niat dan semangat tulus menjaga kebersihan. 3. Mampu: Membiasakan diri melakukannya setiap hari secara rutin.",
      contoh: "Selalu membawa botol minum sendiri dan membuang sampah sesuai tongnya setiap hari."
    },
    kuis: {
      pertanyaan: "Tiga kunci kebiasaan baik dalam menjaga lingkungan di ThinkBin adalah...",
      tipe: "pilihan_ganda",
      opsi: [
        { id: "a", text: "Tahu caranya, Mau melakukannya, dan Mampu membiasakannya" },
        { id: "b", text: "Malas memilah, Membakar sampah, dan Mengotori sungai" },
        { id: "c", text: "Membeli banyak plastik sekali pakai dan membuang sembarangan" },
        { id: "d", text: "Menunggu disuruh orang lain dan tidak peduli lingkungan" }
      ],
      jawabanBenar: "a"
    }
  },
  {
    bagian: 4,
    bagianTitle: "Gaya Hidup Hijau",
    nodeId: 16,
    type: "bacaan_reflektif",
    title: "Komitmen Aksi Nyata untuk Bumi",
    xp: 12,
    bacaan: {
      konsepInti: "Hebat sekali! Kamu sudah mempelajari semua cara menjaga bumi dan memilah sampah. Sekarang, mari tuliskan satu janji aksi nyata yang akan kamu lakukan mulai hari ini!"
    },
    kuis: null,
    reflektif: {
      catatan: "Node reflektif, tanpa soal cek pemahaman bertipe kuis.",
      formatIsian: "Aksi hijau yang akan aku lakukan mulai sekarang: ___"
    }
  }
];

// ===== KUISIONER (terpisah dari 16 node core path) =====
const kuisionerAwal = {
  judul: "Kuisioner Awal (Pre-Test)",
  waktuPengisian: "Saat Setup Profil, sebelum siswa mengakses node pembelajaran apapun",
  totalSoal: 8,
  reward: { xp: 20, coin: 30 },
  pengetahuan: [
    {
      no: 1,
      pertanyaan: "Sampah yang bisa terurai secara alami oleh mikroorganisme disebut sampah...",
      opsi: [
        { id: "a", text: "Organik" },
        { id: "b", text: "Anorganik" },
        { id: "c", text: "B3" },
        { id: "d", text: "Residu" }
      ],
      jawabanBenar: "a"
    },
    {
      no: 2,
      pertanyaan: "Manakah yang termasuk contoh sampah anorganik?",
      opsi: [
        { id: "a", text: "Kulit pisang" },
        { id: "b", text: "Botol plastik" },
        { id: "c", text: "Daun kering" },
        { id: "d", text: "Sisa nasi" }
      ],
      jawabanBenar: "b"
    },
    {
      no: 3,
      pertanyaan: "Apa kepanjangan dari prinsip 3R dalam pengelolaan sampah?",
      opsi: [
        { id: "a", text: "Reduce, Reuse, Recycle" },
        { id: "b", text: "Reduce, Repair, Return" },
        { id: "c", text: "Refill, Reuse, Return" },
        { id: "d", text: "Reduce, Reuse, Return" }
      ],
      jawabanBenar: "a"
    },
    {
      no: 4,
      pertanyaan: "Apa itu bank sampah?",
      opsi: [
        { id: "a", text: "Tempat menabung sampah yang bernilai jual" },
        { id: "b", text: "Tempat pembuangan akhir" },
        { id: "c", text: "Pabrik daur ulang" },
        { id: "d", text: "Toko barang bekas" }
      ],
      jawabanBenar: "a"
    },
    {
      no: 5,
      pertanyaan: "Sebutkan satu dampak sampah yang menumpuk terhadap lingkungan di sekitarmu.",
      tipe: "isian_terbuka",
      dinilai: "kualitatif"
    }
  ],
  kemauanKemampuan: {
    skala: "1-5, Sangat Tidak Setuju - Sangat Setuju",
    catatanMetodologi: "3 item skala (Kemauan & Kemampuan) di soal 6-8 dibuat IDENTIK dengan Kuisioner Akhir agar hasilnya bisa dibandingkan langsung (pre-post).",
    items: [
      { no: 6, pernyataan: "Saya berniat memilah sampah organik dan anorganik setiap hari di sekolah." },
      { no: 7, pernyataan: "Saya peduli terhadap dampak sampah bagi lingkungan di sekitar saya." },
      { no: 8, pernyataan: "Saya merasa mampu memilah sampah dengan benar sesuai kategorinya." }
    ]
  }
};

const kuisionerAkhir = {
  judul: "Kuisioner Akhir (Post-Test)",
  waktuPengisian: "Terbuka mulai Hari ke-3 (bersamaan dengan streak milestone Day 3)",
  totalSoal: 9,
  reward: { xp: 40, coin: 50, catatan: "Tanpa badge — badge sudah didapat dari streak Day 5" },
  pengetahuan: [
    {
      no: 1,
      pertanyaan: "Sampah dari kantin sekolah termasuk kategori sampah apa menurut UU No. 18 Tahun 2008?",
      opsi: [
        { id: "a", text: "Rumah tangga" },
        { id: "b", text: "Sejenis rumah tangga" },
        { id: "c", text: "Spesifik" },
        { id: "d", text: "B3" }
      ],
      jawabanBenar: "b"
    },
    {
      no: 2,
      pertanyaan: "Jelaskan perbedaan utama sampah organik basah dan organik kering!",
      tipe: "isian_terbuka",
      jawabanReferensi: "basah = kadar air tinggi, cepat membusuk; kering = kadar air rendah, terurai lebih lambat"
    },
    {
      no: 3,
      pertanyaan: "Zat kimia apa yang perlu diwaspadai pada styrofoam, terutama untuk mewadahi makanan panas?",
      opsi: [
        { id: "a", text: "BPA" },
        { id: "b", text: "Styrene" },
        { id: "c", text: "Merkuri" },
        { id: "d", text: "CFC" }
      ],
      jawabanBenar: "b"
    },
    {
      no: 4,
      pertanyaan: "Cairan hasil rembesan sampah yang mencemari tanah dan air disebut apa?",
      tipe: "isian_singkat",
      jawabanBenar: "lindi (leachate)"
    },
    {
      no: 5,
      pertanyaan: "Jelaskan secara singkat bagaimana mikroplastik dapat terbentuk di lingkungan!",
      tipe: "isian_terbuka"
    },
    {
      no: 6,
      pertanyaan: "Sebutkan urutan langkah yang perlu dilakukan pada sampah sebelum didaur ulang (Recycle)!",
      tipe: "isian_singkat",
      jawabanBenar: "dipilah, dikosongkan isinya, dibersihkan, dikeringkan"
    },
    {
      no: 7,
      pertanyaan: "Sebutkan dan jelaskan singkat 3 pilar perubahan perilaku dalam program ThinkBin!",
      tipe: "isian_terbuka",
      jawabanReferensi: "Pengetahuan (tahu caranya), Kemauan (mau melakukannya), Kemampuan (mampu melakukannya secara konsisten)"
    }
  ],
  kemauanKemampuan: {
    skala: "1-5, Sangat Tidak Setuju - Sangat Setuju",
    catatan: "Identik dengan Kuisioner Awal untuk perbandingan pre-post",
    items: [
      { no: 8, pernyataan: "Saya berniat memilah sampah organik dan anorganik setiap hari di sekolah." },
      { no: "8b", pernyataan: "Saya peduli terhadap dampak sampah bagi lingkungan di sekitar saya." },
      { no: 9, pernyataan: "Saya merasa mampu memilah sampah dengan benar sesuai kategorinya." }
    ]
  },
  reflektifTerbuka: {
    pertanyaan: "Sebutkan satu aksi nyata yang akan kamu lakukan mulai sekarang setelah mengikuti ThinkBin."
  }
};

// ===== SISTEM STREAK (Milestone Hari 1, 3, 5) =====
const streakMilestone = [
  { milestone: "Kuisioner Awal", hari: "Setup Profil (sebelum Hari 1)", reward: { xp: 20, coin: 30 } },
  { milestone: "Streak Day 1", hari: "Hari ke-1", reward: { xp: 15 } },
  { milestone: "Streak Day 3", hari: "Hari ke-3", reward: { xp: 25, coin: 30 }, catatan: "Kuisioner Akhir terbuka mulai hari ini" },
  { milestone: "Kuisioner Akhir", hari: "Mulai Hari ke-3", reward: { xp: 40, coin: 50 } },
  { milestone: "Streak Day 5", hari: "Hari ke-5 (closing)", reward: { xp: 50, badge: "ThinkBin Pioneer 2026" } }
];

const streakFreezeGratis = {
  deskripsi: "Setiap siswa otomatis mendapat 1x Streak Freeze GRATIS saat Setup Profil (sebelum Hari 1) — terpisah dari Streak Freeze berbayar di Reward Shop (100 Coin). Kalau siswa skip 1 hari, Freeze gratis ini otomatis terpakai dan streak TIDAK reset ke 0. Hanya berlaku 1x selama program 5 hari (bukan freeze berulang)."
};

// ===== RANK TIER =====
const rankTier = [
  { tier: "Rookie", xpMin: 0, xpMax: 49 },
  { tier: "Explorer", xpMin: 50, xpMax: 99 },
  { tier: "Guardian", xpMin: 100, xpMax: 159 },
  { tier: "Warrior", xpMin: 160, xpMax: 249 },
  { tier: "Champion", xpMin: 250, xpMax: 319 },
  { tier: "Legend", xpMin: 320, xpMax: null }
];

const totalXPMaksimal = {
  xpDariNode: 192, // 16 node x 12 XP
  xpFixedNonBelajar: 150,
  total: 342
};

// Data kuis tantangan (checkpoint minigame bertimer) — ThinkBin Core Path 16 Node
var kuisTantangan = {
  node4: {
    id: "node4",
    judul: "Kuis Tantangan: Pilah Organik vs Anorganik",
    bagian: "Bagian 1 — Mengenal Sampah",
    setelahNode: ["node1", "node2", "node3"],
    tipe: "minigame_timer",
    soal: [
      {
        id: "n4s1",
        pertanyaan: "Baterai bekas termasuk kategori sampah…",
        opsi: {
          a: "Rumah tangga",
          b: "Sejenis rumah tangga",
          c: "Spesifik",
          d: "Organik",
        },
        jawaban: "c",
      },
      {
        id: "n4s2",
        pertanyaan: "Daun kering dan ranting termasuk sampah organik…",
        opsi: {
          a: "Basah",
          b: "Kering",
          c: "Anorganik",
          d: "Spesifik",
        },
        jawaban: "b",
      },
      {
        id: "n4s3",
        pertanyaan:
          "Manakah dari berikut yang TIDAK termasuk lima jenis utama sampah anorganik?",
        opsi: {
          a: "Kaca",
          b: "Logam",
          c: "Kulit buah",
          d: "Styrofoam",
        },
        jawaban: "c",
      },
      {
        id: "n4s4",
        pertanyaan: "Sisa sayur di dapur termasuk sampah organik…",
        opsi: {
          a: "Kering",
          b: "Basah",
          c: "Spesifik",
          d: "B3",
        },
        jawaban: "b",
      },
      {
        id: "n4s5",
        pertanyaan:
          "Zat kimia yang berisiko berpindah dari styrofoam ke makanan panas adalah…",
        opsi: {
          a: "BPA",
          b: "Merkuri",
          c: "Styrene",
          d: "CFC",
        },
        jawaban: "c",
      },
    ],
  },

  node6: {
    id: "node6",
    judul: "Kuis Tantangan: Dampak Sampah",
    bagian: "Bagian 2 — Dampak Lingkungan",
    setelahNode: ["node5", "node7", "node8"],
    tipe: "minigame_timer",
    soal: [
      {
        id: "n6s1",
        pertanyaan:
          "Cairan hasil rembesan sampah yang mencemari tanah dan air disebut…",
        opsi: {
          a: "Lindi",
          b: "Metana",
          c: "Kompos",
          d: "Biogas",
        },
        jawaban: "a",
      },
      {
        id: "n6s2",
        pertanyaan:
          "Genangan air di tumpukan sampah anorganik berisiko jadi sarang…",
        opsi: {
          a: "Lalat",
          b: "Nyamuk DBD",
          c: "Tikus",
          d: "Kecoa",
        },
        jawaban: "b",
      },
      {
        id: "n6s3",
        pertanyaan: "Partikel plastik berukuran di bawah 5 mm disebut…",
        opsi: {
          a: "Nanoplastik",
          b: "Mikroplastik",
          c: "Serpihan plastik",
          d: "Residu plastik",
        },
        jawaban: "b",
      },
      {
        id: "n6s4",
        pertanyaan: "Mikroplastik bisa sampai ke tubuh manusia lewat…",
        opsi: {
          a: "Udara langsung",
          b: "Air hujan",
          c: "Ikan/makanan laut tercemar",
          d: "Sinar matahari",
        },
        jawaban: "c",
      },
      {
        id: "n6s5",
        pertanyaan:
          "Proses yang mengubah sampah organik jadi biogas disebut…",
        opsi: {
          a: "Fotosintesis",
          b: "Digesti anaerob",
          c: "Fermentasi aerob",
          d: "Pirolisis",
        },
        jawaban: "b",
      },
    ],
  },

  node10: {
    id: "node10",
    judul: "Kuis Tantangan: Praktik 3R",
    bagian: "Bagian 3 — Solusi & Aksi",
    setelahNode: ["node9"],
    tipe: "minigame_timer",
    soal: [
      {
        id: "n10s1",
        pertanyaan: "Membawa botol minum sendiri adalah contoh praktik…",
        opsi: {
          a: "Reduce",
          b: "Reuse",
          c: "Recycle",
          d: "Refill",
        },
        jawaban: "a",
      },
      {
        id: "n10s2",
        pertanyaan:
          "Botol plastik bekas yang diubah jadi pot tanaman adalah contoh…",
        opsi: {
          a: "Reduce",
          b: "Reuse",
          c: "Recycle",
          d: "Residu",
        },
        jawaban: "b",
      },
      {
        id: "n10s3",
        pertanyaan: "Mengolah botol plastik jadi serat baru adalah contoh praktik…",
        opsi: {
          a: "Reduce",
          b: "Reuse",
          c: "Recycle",
          d: "Reduce & Reuse",
        },
        jawaban: "c",
      },
      {
        id: "n10s4",
        pertanyaan: "Perbedaan utama Reuse dan Recycle adalah…",
        opsi: {
          a: "Reuse mengolah jadi barang baru, Recycle memakai ulang apa adanya",
          b: "Reuse memakai ulang apa adanya, Recycle mengolah jadi bahan/barang baru",
          c: "Keduanya sama saja",
          d: "Reuse hanya untuk sampah organik",
        },
        jawaban: "b",
      },
      {
        id: "n10s5",
        pertanyaan:
          "Prinsip yang paling awal mencegah sampah terbentuk adalah…",
        opsi: {
          a: "Reduce",
          b: "Reuse",
          c: "Recycle",
          d: "Residu",
        },
        jawaban: "a",
      },
    ],
  },

  node12: {
    id: "node12",
    judul: "Kuis Tantangan: Pemilahan Sumber",
    bagian: "Bagian 3 — Solusi & Aksi",
    setelahNode: ["node11"],
    tipe: "minigame_timer",
    soal: [
      {
        id: "n12s1",
        pertanyaan: "Pemilahan sampah paling ideal dilakukan di…",
        opsi: {
          a: "TPA",
          b: "Sumber (rumah/sekolah)",
          c: "Bank sampah",
          d: "Pabrik daur ulang",
        },
        jawaban: "b",
      },
      {
        id: "n12s2",
        pertanyaan:
          "Alasan utama pemilahan di sumber lebih efektif daripada di TPA adalah…",
        opsi: {
          a: "Lebih cepat",
          b: "Sampah belum tercampur/terkontaminasi",
          c: "Lebih murah",
          d: "Wajib menurut undang-undang",
        },
        jawaban: "b",
      },
      {
        id: "n12s3",
        pertanyaan: "Contoh tindakan pemilahan di sumber adalah…",
        opsi: {
          a: "Membakar sampah campuran",
          b: "Memisahkan sisa makanan dari botol plastik sebelum dibuang",
          c: "Menimbun semua sampah jadi satu",
          d: "Menjual sampah tanpa dipilah",
        },
        jawaban: "b",
      },
      {
        id: "n12s4",
        pertanyaan: "Sampah yang tercampur sejak awal akan berdampak pada…",
        opsi: {
          a: "Nilai jual naik",
          b: "Kualitas material daur ulang menurun",
          c: "Tidak ada pengaruh",
          d: "Proses daur ulang jadi lebih cepat",
        },
        jawaban: "b",
      },
      {
        id: "n12s5",
        pertanyaan:
          "Manfaat langsung dari pemilahan sejak sumber bagi bank sampah adalah…",
        opsi: {
          a: "Material lebih bersih dan bernilai jual lebih tinggi",
          b: "Mengurangi jumlah siswa yang ikut program",
          c: "Menambah waktu penimbangan",
          d: "Tidak ada manfaat khusus",
        },
        jawaban: "a",
      },
    ],
  },
};

// Konfigurasi umum minigame
var konfigMinigame = {
  waktuPerSoalDetik: 12,
  bonusSkorJawabanCepat: true,
  gagalTidakMenggugurkanSesi: true,
};

// Universal export (Browser window + ES module)
if (typeof window !== "undefined") {
  window.modulData = modulData;
  window.kuisTantangan = kuisTantangan;
  window.konfigMinigame = konfigMinigame;
  window.kuisionerAwal = kuisionerAwal;
  window.kuisionerAkhir = kuisionerAkhir;
  window.streakMilestone = streakMilestone;
  window.streakFreezeGratis = streakFreezeGratis;
  window.rankTier = rankTier;
  window.totalXPMaksimal = totalXPMaksimal;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    modulData,
    kuisTantangan,
    konfigMinigame,
    kuisionerAwal,
    kuisionerAkhir,
    streakMilestone,
    streakFreezeGratis,
    rankTier,
    totalXPMaksimal
  };
}
