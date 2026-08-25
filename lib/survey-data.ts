export type QuestionType = "knowledge" | "attitude";

export interface SurveyOption {
  key: "A" | "B" | "C" | "D";
  text: string;
}

export interface SurveyQuestion {
  id: number;
  nodeRef?: number;
  type: QuestionType;
  question: string;
  options: SurveyOption[];
  correctAnswer?: "A" | "B" | "C" | "D"; // Hanya untuk type "knowledge"
}

export interface SurveyConfig {
  type: "awal" | "akhir";
  title: string;
  subtitle: string;
  stepLabel: string;
  reward: {
    xp: number;
    coins: number;
  };
  questions: SurveyQuestion[];
}

/**
 * KUISIONER AWAL (PRE-TEST) - Tepat 8 Soal
 * 5 Soal Pengetahuan + 3 Soal Skala Sikap
 * Reward: +20 XP, +30 Coin
 */
export const PRE_TEST_SURVEY: SurveyConfig = {
  type: "awal",
  title: "Kuisioner Pengetahuan Awal 📝",
  subtitle: "Jawab 8 pertanyaan singkat berikut sebelum memulai petualangan belajarmu.",
  stepLabel: "Langkah 2 dari 2: Kuisioner Awal",
  reward: {
    xp: 20,
    coins: 30,
  },
  questions: [
    // Bagian Pengetahuan (Soal 1 - 5)
    {
      id: 1,
      type: "knowledge",
      question: "Sampah yang bisa terurai secara alami oleh mikroorganisme disebut sampah…",
      correctAnswer: "A",
      options: [
        { key: "A", text: "Organik" },
        { key: "B", text: "Anorganik" },
        { key: "C", text: "B3" },
        { key: "D", text: "Residu" },
      ],
    },
    {
      id: 2,
      type: "knowledge",
      question: "Manakah di bawah ini yang termasuk contoh sampah anorganik?",
      correctAnswer: "B",
      options: [
        { key: "A", text: "Kulit pisang" },
        { key: "B", text: "Botol plastik" },
        { key: "C", text: "Daun kering" },
        { key: "D", text: "Sisa nasi" },
      ],
    },
    {
      id: 3,
      type: "knowledge",
      question: "Apa kepanjangan dari prinsip 3R dalam pengelolaan sampah?",
      correctAnswer: "A",
      options: [
        { key: "A", text: "Reduce, Reuse, Recycle" },
        { key: "B", text: "Reduce, Repair, Return" },
        { key: "C", text: "Refill, Reuse, Return" },
        { key: "D", text: "Reduce, Reuse, Return" },
      ],
    },
    {
      id: 4,
      type: "knowledge",
      question: "Apa yang dimaksud dengan bank sampah?",
      correctAnswer: "A",
      options: [
        { key: "A", text: "Tempat menabung sampah yang bernilai jual" },
        { key: "B", text: "Tempat pembuangan akhir" },
        { key: "C", text: "Pabrik daur ulang" },
        { key: "D", text: "Toko barang bekas" },
      ],
    },
    {
      id: 5,
      type: "knowledge",
      question: "Cairan hasil rembesan sampah yang dapat mencemari tanah dan air di sekitar tumpukan sampah disebut...",
      correctAnswer: "B",
      options: [
        { key: "A", text: "Residu" },
        { key: "B", text: "Lindi (leachate)" },
        { key: "C", text: "Biogas" },
        { key: "D", text: "Kompos" },
      ],
    },
    // Bagian Kemauan & Kemampuan (Skala Sikap Likert - Soal 6 - 8)
    {
      id: 6,
      type: "attitude",
      question: '"Saya berniat memilah sampah organik dan anorganik setiap hari di sekolah."',
      options: [
        { key: "A", text: "Sangat Tidak Setuju (Skor 1)" },
        { key: "B", text: "Tidak Setuju (Skor 2)" },
        { key: "C", text: "Setuju (Skor 3)" },
        { key: "D", text: "Sangat Setuju (Skor 4)" },
      ],
    },
    {
      id: 7,
      type: "attitude",
      question: '"Saya peduli terhadap dampak sampah bagi lingkungan di sekitar saya."',
      options: [
        { key: "A", text: "Sangat Tidak Setuju (Skor 1)" },
        { key: "B", text: "Tidak Setuju (Skor 2)" },
        { key: "C", text: "Setuju (Skor 3)" },
        { key: "D", text: "Sangat Setuju (Skor 4)" },
      ],
    },
    {
      id: 8,
      type: "attitude",
      question: '"Saya merasa mampu memilah sampah dengan benar sesuai kategorinya."',
      options: [
        { key: "A", text: "Sangat Tidak Setuju (Skor 1)" },
        { key: "B", text: "Tidak Setuju (Skor 2)" },
        { key: "C", text: "Setuju (Skor 3)" },
        { key: "D", text: "Sangat Setuju (Skor 4)" },
      ],
    },
  ],
};

/**
 * KUISIONER AKHIR (POST-TEST) - Tepat 10 Soal
 * 7 Soal Pengetahuan (16 Node) + 3 Soal Skala Sikap
 * Reward: +40 XP, +50 Coin
 */
export const POST_TEST_SURVEY: SurveyConfig = {
  type: "akhir",
  title: "Kuisioner Evaluasi Akhir 🌟",
  subtitle: "Uji pemahaman dan pengalaman belajarmu setelah menyelesaikan modul ThinkBin.",
  stepLabel: "Evaluasi Akhir Pembelajaran",
  reward: {
    xp: 40,
    coins: 50,
  },
  questions: [
    // Bagian Pengetahuan (Soal 1 - 7)
    {
      id: 1,
      nodeRef: 1,
      type: "knowledge",
      question: "Sampah sisa makanan dari kantin sekolah kita masuk ke dalam kategori...",
      correctAnswer: "B",
      options: [
        { key: "A", text: "Sampah rumah tangga" },
        { key: "B", text: "Sampah sejenis rumah tangga" },
        { key: "C", text: "Sampah berbahaya (B3)" },
        { key: "D", text: "Sampah plastik" },
      ],
    },
    {
      id: 2,
      nodeRef: 2,
      type: "knowledge",
      question: "Di bawah ini, mana yang merupakan contoh sampah organik kering?",
      correctAnswer: "A",
      options: [
        { key: "A", text: "Daun kering dan ranting pohon" },
        { key: "B", text: "Sisa kuah bakso" },
        { key: "C", text: "Kulit pisang" },
        { key: "D", text: "Botol kaca bekas" },
      ],
    },
    {
      id: 3,
      nodeRef: 3,
      type: "knowledge",
      question: "Zat kimia berbahaya di dalam styrofoam yang bisa ikut termakan jika wadahnya terkena panas adalah...",
      correctAnswer: "C",
      options: [
        { key: "A", text: "Oksigen" },
        { key: "B", text: "Air" },
        { key: "C", text: "Styrene" },
        { key: "D", text: "Kompos" },
      ],
    },
    {
      id: 4,
      nodeRef: 5,
      type: "knowledge",
      question: "Cairan kotor dan berbau yang keluar dari tumpukan sampah dan bisa merusak air tanah disebut...",
      correctAnswer: "A",
      options: [
        { key: "A", text: "Lindi (leachate)" },
        { key: "B", text: "Biogas" },
        { key: "C", text: "Kompos cair" },
        { key: "D", text: "Residu" },
      ],
    },
    {
      id: 5,
      nodeRef: 7,
      type: "knowledge",
      question: "Mikroplastik adalah serpihan plastik sangat kecil yang terbentuk karena...",
      correctAnswer: "B",
      options: [
        { key: "A", text: "Sengaja dipotong-potong oleh pabrik" },
        { key: "B", text: "Plastik besar yang pecah akibat panas matahari dan gesekan" },
        { key: "C", text: "Sampah kertas yang hancur karena air" },
        { key: "D", text: "Sisa makanan yang membusuk di tanah" },
      ],
    },
    {
      id: 6,
      nodeRef: 11,
      type: "knowledge",
      question: "Sebelum botol plastik bekas ditabung ke bank sampah, langkah apa yang paling benar kita lakukan?",
      correctAnswer: "C",
      options: [
        { key: "A", text: "Langsung dibakar saja" },
        { key: "B", text: "Dibiarkan kotor dan penuh sisa air" },
        { key: "C", text: "Dipilah, dikosongkan isinya, dicuci, lalu dikeringkan" },
        { key: "D", text: "Dipotong-potong menggunakan gunting sampai hancur" },
      ],
    },
    {
      id: 7,
      nodeRef: 15,
      type: "knowledge",
      question: "Tiga pilar utama dalam program ThinkBin untuk mengubah kebiasaan kita adalah...",
      correctAnswer: "B",
      options: [
        { key: "A", text: "Pintar, Cepat, dan Kuat" },
        { key: "B", text: "Pengetahuan, Kemauan, dan Kemampuan" },
        { key: "C", text: "Uang, Poin, dan Hadiah" },
        { key: "D", text: "Aplikasi, Website, dan Handphone" },
      ],
    },
    // Bagian Kemauan & Kemampuan (Skala Sikap Likert - Soal 8 - 10)
    {
      id: 8,
      type: "attitude",
      question: '"Saya berniat memilah sampah organik dan anorganik setiap hari di sekolah."',
      options: [
        { key: "A", text: "Sangat Tidak Setuju (Skor 1)" },
        { key: "B", text: "Tidak Setuju (Skor 2)" },
        { key: "C", text: "Setuju (Skor 3)" },
        { key: "D", text: "Sangat Setuju (Skor 4)" },
      ],
    },
    {
      id: 9,
      type: "attitude",
      question: '"Saya peduli terhadap dampak sampah bagi lingkungan di sekitar saya."',
      options: [
        { key: "A", text: "Sangat Tidak Setuju (Skor 1)" },
        { key: "B", text: "Tidak Setuju (Skor 2)" },
        { key: "C", text: "Setuju (Skor 3)" },
        { key: "D", text: "Sangat Setuju (Skor 4)" },
      ],
    },
    {
      id: 10,
      type: "attitude",
      question: '"Saya merasa mampu memilah sampah dengan benar sesuai kategorinya."',
      options: [
        { key: "A", text: "Sangat Tidak Setuju (Skor 1)" },
        { key: "B", text: "Tidak Setuju (Skor 2)" },
        { key: "C", text: "Setuju (Skor 3)" },
        { key: "D", text: "Sangat Setuju (Skor 4)" },
      ],
    },
  ],
};

export const LIKERT_SCORE_MAP: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
};

export function getSurveyConfig(type: "awal" | "akhir"): SurveyConfig {
  return type === "akhir" ? POST_TEST_SURVEY : PRE_TEST_SURVEY;
}
