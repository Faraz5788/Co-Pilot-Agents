// Learning content for Little Muslim Prayer Steps. Meanings are our own simple, child-friendly wording.
// Practices differ slightly between schools; the app says so and points families to their own teacher/masjid.

const WUDU = [
  { id: "niyyah", icon: "💭", title: "Intention & Bismillah", times: 1, action: "Say it",
    how: "In your heart, decide you are making wudu for Allah. Then say: Bismillah.",
    ar: "بِسْمِ اللَّهِ", tr: "Bismillah", mean: "In the name of Allah" },
  { id: "hands", icon: "🤲", title: "Wash your hands", times: 3, action: "Wash",
    how: "Wash both hands up to the wrists. Get water between your fingers too." },
  { id: "mouth", icon: "👄", title: "Rinse your mouth", times: 3, action: "Rinse",
    how: "Take water into your mouth with your right hand, swish it around and spit it out." },
  { id: "nose", icon: "👃", title: "Clean your nose", times: 3, action: "Sniff & blow",
    how: "Gently sniff a little water into your nose with your right hand, then blow it out with your left." },
  { id: "face", icon: "🙂", title: "Wash your face", times: 3, action: "Wash",
    how: "Wash your whole face: from your hairline to your chin, and from ear to ear." },
  { id: "arms", icon: "💪", title: "Wash your arms", times: 3, action: "Wash",
    how: "Wash your right arm from the fingertips up to and including the elbow. Then do the same with your left arm.", note: "Right side first!" },
  { id: "head", icon: "💆", title: "Wipe your head", times: 1, action: "Wipe",
    how: "With wet hands, wipe over your head from the front to the back, then bring your hands back to the front." },
  { id: "ears", icon: "👂", title: "Wipe your ears", times: 1, action: "Wipe",
    how: "Wipe the inside of your ears with your index fingers and the back of your ears with your thumbs." },
  { id: "feet", icon: "🦶", title: "Wash your feet", times: 3, action: "Wash",
    how: "Wash your right foot up to and including the ankle, and between the toes. Then do the same with your left foot.", note: "Right side first!" },
];
const WUDU_DUA = { ar: "أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
  tr: "Ash-hadu an la ilaha illallahu wahdahu la sharika lah, wa ash-hadu anna Muhammadan 'abduhu wa rasuluh.",
  mean: "I bear witness that there is no god but Allah, alone, with no partner, and I bear witness that Muhammad is His servant and messenger.",
  src: "Sahih Muslim 234" };

// Salah walkthrough: a 2 rak'ah prayer (like Fajr). pose = figure position drawn by <Figure>.
const SALAH = [
  { id: "stand", pose: "stand", title: "Stand & make your intention", say: null,
    how: "Stand on a clean place facing the qiblah (towards the Kaaba). In your heart, decide which prayer you are praying." },
  { id: "takbir", pose: "takbir", title: "Takbir", say: "takbir",
    how: "Raise your hands up to your ears (or shoulders) and say Allahu akbar. Now you are in salah!" },
  { id: "qiyam", pose: "qiyam", title: "Stand and recite", say: "fatiha",
    how: "Place your right hand over your left on your chest or stomach. Recite Surah Al-Fatihah, then a short surah like Al-Ikhlas.", extra: ["thana", "ikhlas"] },
  { id: "ruku", pose: "ruku", title: "Ruku (bow)", say: "ruku",
    how: "Say Allahu akbar and bow, with your hands on your knees and your back straight. Say the words 3 times." },
  { id: "itidal", pose: "stand", title: "Stand up again", say: "itidal",
    how: "Rise up straight while saying the first part, then say the second part while standing." },
  { id: "sujud1", pose: "sujud", title: "Sujud (prostration)", say: "sujud",
    how: "Say Allahu akbar and go down. Forehead and nose, both hands, both knees and toes touch the ground. Say the words 3 times." },
  { id: "jalsa", pose: "sit", title: "Sit between the two sujud", say: "jalsa",
    how: "Say Allahu akbar and sit up for a moment." },
  { id: "sujud2", pose: "sujud", title: "Second sujud", say: "sujud",
    how: "Say Allahu akbar and go down into sujud again, just like before. That is one rak'ah done! 🎉" },
  { id: "rakah2", pose: "qiyam", title: "Stand for the 2nd rak'ah", say: "fatiha",
    how: "Say Allahu akbar and stand up. Repeat the same steps: Al-Fatihah, a short surah, ruku, standing, and two sujud." },
  { id: "tashahhud", pose: "sit", title: "Sit for Tashahhud", say: "tashahhud",
    how: "After the second rak'ah, sit and recite At-Tahiyyat, then the Salawat on the Prophet ﷺ.", extra: ["salawat"] },
  { id: "salam", pose: "salamR", title: "Salam", say: "salam",
    how: "Turn your head to the right and say the salam, then turn to the left and say it again. Your salah is complete! 🌟" },
];

const RECITE = {
  takbir: { name: "Takbir", ar: "اللَّهُ أَكْبَرُ", tr: "Allahu akbar", mean: "Allah is the Greatest" },
  thana: { name: "Opening dua (Thana)", ar: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَىٰ جَدُّكَ، وَلَا إِلَٰهَ غَيْرُكَ",
    tr: "Subhanakallahumma wa bihamdik, wa tabarakasmuk, wa ta'ala jadduk, wa la ilaha ghayruk.",
    mean: "Glory be to You, O Allah, and praise. Blessed is Your name, high is Your majesty, and there is no god but You.", src: "Sunan Abi Dawud 775", optional: true },
  fatiha: { name: "Surah Al-Fatihah", lines: [
      ["بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", "Bismillahir-Rahmanir-Rahim", "In the name of Allah, the Most Kind, the Most Merciful"],
      ["الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", "Al-hamdu lillahi Rabbil-'alamin", "All praise is for Allah, Lord of all the worlds"],
      ["الرَّحْمَٰنِ الرَّحِيمِ", "Ar-Rahmanir-Rahim", "The Most Kind, the Most Merciful"],
      ["مَالِكِ يَوْمِ الدِّينِ", "Maliki yawmid-din", "Master of the Day of Judgement"],
      ["إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", "Iyyaka na'budu wa iyyaka nasta'in", "You alone we worship, and You alone we ask for help"],
      ["اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", "Ihdinas-siratal-mustaqim", "Guide us to the straight path"],
      ["صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", "Siratal-ladhina an'amta 'alayhim, ghayril-maghdubi 'alayhim wa lad-dallin", "The path of those You have blessed, not of those who earned Your anger, nor of those who went astray"],
    ], after: "Then say: Ameen", src: "Qur'an 1:1–7" },
  ikhlas: { name: "Surah Al-Ikhlas", lines: [
      ["قُلْ هُوَ اللَّهُ أَحَدٌ", "Qul huwallahu ahad", "Say: He is Allah, the One"],
      ["اللَّهُ الصَّمَدُ", "Allahus-samad", "Allah, whom everyone needs"],
      ["لَمْ يَلِدْ وَلَمْ يُولَدْ", "Lam yalid wa lam yulad", "He has no children and was not born"],
      ["وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", "Wa lam yakun lahu kufuwan ahad", "And there is nothing like Him"],
    ], src: "Qur'an 112:1–4" },
  ruku: { name: "In ruku", ar: "سُبْحَانَ رَبِّيَ الْعَظِيمِ", tr: "Subhana Rabbiyal-'Adhim", mean: "Glory be to my Lord, the Most Great", times: 3, src: "Sahih Muslim 772" },
  itidal: { name: "Rising from ruku", ar: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ، رَبَّنَا وَلَكَ الْحَمْدُ", tr: "Sami'allahu liman hamidah. Rabbana wa lakal-hamd.", mean: "Allah hears the one who praises Him. Our Lord, all praise is for You.", src: "Sahih al-Bukhari 795" },
  sujud: { name: "In sujud", ar: "سُبْحَانَ رَبِّيَ الْأَعْلَىٰ", tr: "Subhana Rabbiyal-A'la", mean: "Glory be to my Lord, the Most High", times: 3, src: "Sahih Muslim 772" },
  jalsa: { name: "Between the two sujud", ar: "رَبِّ اغْفِرْ لِي", tr: "Rabbighfir li", mean: "My Lord, forgive me", src: "Sunan Ibn Majah 897" },
  tashahhud: { name: "At-Tahiyyat (Tashahhud)", ar: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    tr: "At-tahiyyatu lillahi was-salawatu wat-tayyibat. As-salamu 'alayka ayyuhan-Nabiyyu wa rahmatullahi wa barakatuh. As-salamu 'alayna wa 'ala 'ibadillahis-salihin. Ash-hadu an la ilaha illallah, wa ash-hadu anna Muhammadan 'abduhu wa rasuluh.",
    mean: "All greetings, prayers and good things are for Allah. Peace be on you, O Prophet, and Allah's mercy and blessings. Peace be on us and on Allah's good servants. I bear witness that there is no god but Allah, and that Muhammad is His servant and messenger.", src: "Sahih al-Bukhari 831" },
  salawat: { name: "Salawat (Durood Ibrahim)", ar: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
    tr: "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad, kama sallayta 'ala Ibrahima wa 'ala ali Ibrahim, innaka Hamidum Majid. Allahumma barik 'ala Muhammadin wa 'ala ali Muhammad, kama barakta 'ala Ibrahima wa 'ala ali Ibrahim, innaka Hamidum Majid.",
    mean: "O Allah, send Your blessings on Muhammad and his family, as You sent blessings on Ibrahim and his family. You are Praiseworthy, Glorious. O Allah, bless Muhammad and his family, as You blessed Ibrahim and his family. You are Praiseworthy, Glorious.", src: "Sahih al-Bukhari 3370" },
  salam: { name: "Salam", ar: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ", tr: "As-salamu 'alaykum wa rahmatullah", mean: "Peace and Allah's mercy be upon you", times: 2, src: "Sunan Abi Dawud 996" },
};
const RECITE_ORDER = ["fatiha", "ikhlas", "takbir", "ruku", "itidal", "sujud", "jalsa", "tashahhud", "salawat", "salam", "thana"];

const PRAYERS = [
  { id: "fajr", name: "Fajr", ar: "الفجر", rakah: 2, when: "Dawn, before sunrise", icon: "🌅" },
  { id: "dhuhr", name: "Dhuhr", ar: "الظهر", rakah: 4, when: "Just after midday", icon: "☀️" },
  { id: "asr", name: "Asr", ar: "العصر", rakah: 4, when: "Afternoon", icon: "🌤️" },
  { id: "maghrib", name: "Maghrib", ar: "المغرب", rakah: 3, when: "Just after sunset", icon: "🌇" },
  { id: "isha", name: "Isha", ar: "العشاء", rakah: 4, when: "Night", icon: "🌙" },
];

const QUIZ = [
  { q: "What do we say to begin wudu?", a: ["Bismillah", "Ameen", "Alhamdulillah"], c: 0 },
  { q: "How many times do we usually wash our face in wudu?", a: ["1 time", "3 times", "5 times"], c: 1 },
  { q: "Which arm do we wash first?", a: ["Left", "Right", "Both together"], c: 1 },
  { q: "How many rak'ahs are in Fajr?", a: ["2", "3", "4"], c: 0 },
  { q: "How many rak'ahs are in Maghrib?", a: ["2", "3", "4"], c: 1 },
  { q: "What do we say in ruku?", a: ["Subhana Rabbiyal-A'la", "Subhana Rabbiyal-'Adhim", "Rabbighfir li"], c: 1 },
  { q: "Which surah do we recite in every rak'ah?", a: ["Al-Ikhlas", "Al-Fatihah", "An-Nas"], c: 1 },
  { q: "How do we finish the salah?", a: ["Say salam to the right and left", "Clap our hands", "Say Allahu akbar"], c: 0 },
  { q: "Which direction do we face to pray?", a: ["The sunrise", "The qiblah (the Kaaba)", "Any way we like"], c: 1 },
  { q: "How many prayers do we pray every day?", a: ["3", "5", "7"], c: 1 },
];

const AVATARS = ["🦁", "🐼", "🦊", "🐨", "🐯", "🐰", "🦉", "🐢"];

const BADGES = [
  { id: "firstWudu", icon: "💧", name: "First Wudu", how: "Finish the wudu lesson once", test: s => s.wuduDone >= 1 },
  { id: "wuduPro", icon: "🌊", name: "Wudu Pro", how: "Finish the wudu lesson 5 times", test: s => s.wuduDone >= 5 },
  { id: "firstSalah", icon: "🕌", name: "First Salah", how: "Finish the salah lesson once", test: s => s.salahDone >= 1 },
  { id: "salahStar", icon: "⭐", name: "Salah Star", how: "Finish the salah lesson 5 times", test: s => s.salahDone >= 5 },
  { id: "fatiha", icon: "📖", name: "Al-Fatihah Hero", how: "Learn Surah Al-Fatihah", test: s => !!s.known.fatiha },
  { id: "reciter", icon: "🎙️", name: "Super Reciter", how: "Learn 6 recitations", test: s => Object.values(s.known).filter(Boolean).length >= 6 },
  { id: "quiz", icon: "🧠", name: "Quiz Whiz", how: "Get every quiz question right", test: s => s.bestQuiz >= QUIZ.length },
  { id: "order", icon: "🧩", name: "Step Master", how: "Put the wudu steps in order", test: s => s.orderWins >= 1 },
  { id: "five", icon: "🖐️", name: "All Five!", how: "Tick all 5 prayers in one day", test: s => Object.values(s.log).some(d => d.length >= 5) },
  { id: "streak", icon: "🔥", name: "7-Day Streak", how: "Pray at least once a day for 7 days", test: s => s.streak >= 7 },
];

export { WUDU, WUDU_DUA, SALAH, RECITE, RECITE_ORDER, PRAYERS, QUIZ, AVATARS, BADGES };
