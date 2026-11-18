# -*- coding: utf-8 -*-
"""Everyday Arabic phrases (Saudi everyday speech where natural) with meanings in 7 languages."""
L7 = ["en","ur","hi","bn","tl","tr","id"]
PCATS = {
 "greet":{"en":"Greetings & courtesy","ur":"سلام و آداب","hi":"सलाम और अदब","bn":"সালাম ও সৌজন্য","tl":"Pagbati at paggalang","tr":"Selamlaşma ve nezaket","id":"Salam & sopan santun"},
 "around":{"en":"Getting around & taxis","ur":"راستہ اور ٹیکسی","hi":"रास्ता और टैक्सी","bn":"পথ ও ট্যাক্সি","tl":"Paglibot at taxi","tr":"Yol ve taksi","id":"Jalan & taksi"},
 "haram":{"en":"In the Haram & hotel","ur":"حرم اور ہوٹل میں","hi":"हरम और होटल में","bn":"হারাম ও হোটেলে","tl":"Sa Haram at hotel","tr":"Harem'de ve otelde","id":"Di Haram & hotel"},
 "shop":{"en":"Shopping & food","ur":"خریداری اور کھانا","hi":"ख़रीदारी और खाना","bn":"কেনাকাটা ও খাবার","tl":"Pamimili at pagkain","tr":"Alışveriş ve yemek","id":"Belanja & makanan"},
 "help":{"en":"Help & health","ur":"مدد اور صحت","hi":"मदद और सेहत","bn":"সাহায্য ও স্বাস্থ্য","tl":"Tulong at kalusugan","tr":"Yardım ve sağlık","id":"Bantuan & kesehatan"},
}
# (cat, arabic, transliteration, form used to a woman / by a woman or None, en, ur, hi, bn, tl, tr, id)
_P = [
 ("greet","السَّلَامُ عَلَيْكُمْ","As-salāmu ʿalaykum",None,"Peace be upon you (hello)","السلام علیکم (سلام)","अस्सलामु अलैकुम (सलाम)","আসসালামু আলাইকুম (সালাম)","Sumainyo ang kapayapaan (hello)","Selamün aleyküm (merhaba)","Assalamu'alaikum (salam)"),
 ("greet","وَعَلَيْكُمُ السَّلَامُ","Wa ʿalaykumus-salām",None,"And upon you be peace (reply)","وعلیکم السلام (جواب)","व अलैकुमुस्सलाम (जवाब)","ওয়া আলাইকুমুস সালাম (উত্তর)","At sumainyo rin ang kapayapaan (sagot)","Ve aleyküm selam (cevap)","Wa'alaikumussalam (jawaban)"),
 ("greet","شُكْرًا","Shukran",None,"Thank you","شکریہ","शुक्रिया","ধন্যবাদ","Salamat","Teşekkürler","Terima kasih"),
 ("greet","جَزَاكَ اللّٰهُ خَيْرًا","Jazāk Allāhu khayran","Jazāki Allāhu khayran","May Allah reward you with good","اللہ آپ کو بہترین بدلہ دے","अल्लाह आपको बेहतरीन बदला दे","আল্লাহ আপনাকে উত্তম প্রতিদান দিন","Gantimpalaan ka nawa ni Allah ng kabutihan","Allah seni hayırla mükâfatlandırsın","Semoga Allah membalasmu dengan kebaikan"),
 ("greet","عَفْوًا","ʿAfwan",None,"You're welcome / Excuse me","کوئی بات نہیں / معاف کیجیے","कोई बात नहीं / माफ़ कीजिए","স্বাগতম / মাফ করবেন","Walang anuman / Paumanhin","Rica ederim / Affedersiniz","Sama-sama / Permisi"),
 ("greet","مِنْ فَضْلِكَ","Min faḍlak","Min faḍlik","Please","براہِ کرم","कृपया","দয়া করে","Pakiusap","Lütfen","Tolong / Silakan"),
 ("greet","نَعَم / لَا","Naʿam / Lā",None,"Yes / No","ہاں / نہیں","हाँ / नहीं","হ্যাঁ / না","Oo / Hindi","Evet / Hayır","Ya / Tidak"),
 ("greet","كَيْفَ حَالَك؟","Kayf ḥālak?","Kayf ḥālik?","How are you?","آپ کیسے ہیں؟","आप कैसे हैं?","আপনি কেমন আছেন?","Kumusta ka?","Nasılsın?","Apa kabar?"),
 ("greet","الْحَمْدُ لِلّٰهِ، بِخَيْر","Al-ḥamdu lillāh, bikhayr",None,"Fine, praise be to Allah","الحمدللہ، ٹھیک ہوں","अल्हम्दुलिल्लाह, ठीक हूँ","আলহামদুলিল্লাহ, ভালো আছি","Mabuti, alhamdulillah","Elhamdülillah, iyiyim","Alhamdulillah, baik"),
 ("greet","أَنَا مِنْ …","Ana min …",None,"I am from …","میں … سے ہوں","मैं … से हूँ","আমি … থেকে এসেছি","Ako ay taga-…","Ben …'denim","Saya dari …"),
 ("greet","مَا أَفْهَم عَرَبِي","Mā afham ʿarabī",None,"I don't understand Arabic","مجھے عربی نہیں آتی","मुझे अरबी समझ नहीं आती","আমি আরবি বুঝি না","Hindi ako nakakaintindi ng Arabic","Arapça anlamıyorum","Saya tidak paham bahasa Arab"),
 ("greet","تِتْكَلَّم إِنْجِلِيزِي؟","Titkallam ingilīzī?","Titkallamī ingilīzī?","Do you speak English?","کیا آپ انگریزی بولتے ہیں؟","क्या आप अंग्रेज़ी बोलते हैं?","আপনি কি ইংরেজি বলেন?","Marunong ka bang mag-Ingles?","İngilizce konuşuyor musunuz?","Bisa bahasa Inggris?"),
 ("greet","مَعَ السَّلَامَة","Maʿa as-salāmah",None,"Goodbye","خدا حافظ","ख़ुदा हाफ़िज़","আল্লাহ হাফেজ","Paalam","Hoşça kal","Selamat tinggal"),
 ("around","وَيْن …؟","Wayn …?",None,"Where is …?","… کہاں ہے؟","… कहाँ है?","… কোথায়?","Nasaan ang …?","… nerede?","Di mana …?"),
 ("around","أَبْغَى أَرُوح الْحَرَم","Abghā arūḥ al-Ḥaram",None,"I want to go to the Haram","میں حرم جانا چاہتا ہوں","मैं हरम जाना चाहता हूँ","আমি হারামে যেতে চাই","Gusto kong pumunta sa Haram","Harem'e gitmek istiyorum","Saya mau ke Haram"),
 ("around","وَيْن الْفُنْدُق؟","Wayn al-funduq?",None,"Where is the hotel?","ہوٹل کہاں ہے؟","होटल कहाँ है?","হোটেল কোথায়?","Nasaan ang hotel?","Otel nerede?","Di mana hotelnya?"),
 ("around","كَم الْأُجْرَة؟","Kam al-ujrah?",None,"How much is the fare?","کرایہ کتنا ہے؟","किराया कितना है?","ভাড়া কত?","Magkano ang pamasahe?","Ücret ne kadar?","Berapa ongkosnya?"),
 ("around","عَلَى طُول","ʿAlā ṭūl",None,"Straight ahead","سیدھے","सीधे","সোজা","Diretso","Dümdüz","Lurus terus"),
 ("around","يَمِين / يَسَار","Yamīn / Yasār",None,"Right / Left","دائیں / بائیں","दाएँ / बाएँ","ডানে / বামে","Kanan / Kaliwa","Sağ / Sol","Kanan / Kiri"),
 ("around","وَقِّف هِنَا","Waqqif hinā","Waqqifī hinā","Stop here","یہاں روکیں","यहाँ रोकिए","এখানে থামুন","Dito na lang po","Burada durun","Berhenti di sini"),
 ("around","شْوَيّ شْوَيّ","Shway shway",None,"Slowly, please","آہستہ آہستہ","धीरे-धीरे","আস্তে আস্তে","Dahan-dahan po","Yavaş yavaş","Pelan-pelan"),
 ("around","قَرِيب؟ بَعِيد؟","Qarīb? Baʿīd?",None,"Is it near? Far?","قریب ہے؟ دور ہے؟","पास है? दूर है?","কাছে? দূরে?","Malapit ba? Malayo?","Yakın mı? Uzak mı?","Dekat? Jauh?"),
 ("haram","وَيْن بَاب رَقْم …؟","Wayn bāb raqm …?",None,"Where is gate number …?","گیٹ نمبر … کہاں ہے؟","गेट नंबर … कहाँ है?","গেট নম্বর … কোথায়?","Nasaan ang gate numero …?","… numaralı kapı nerede?","Di mana pintu nomor …?"),
 ("haram","وَيْن دَوْرَات الْمِيَاه؟","Wayn dawrāt al-miyāh?",None,"Where are the toilets?","بیت الخلا کہاں ہے؟","बाथरूम कहाँ है?","টয়লেট কোথায়?","Nasaan ang palikuran?","Tuvaletler nerede?","Di mana toiletnya?"),
 ("haram","وَيْن مَكَان الْوُضُوء؟","Wayn makān al-wuḍūʾ?",None,"Where is the wudu area?","وضو کی جگہ کہاں ہے؟","वुज़ू की जगह कहाँ है?","অজুর জায়গা কোথায়?","Nasaan ang lugar ng wudu?","Abdest yeri nerede?","Di mana tempat wudhu?"),
 ("haram","وَيْن مُصَلَّى النِّسَاء؟","Wayn muṣallā an-nisāʾ?",None,"Where is the women's prayer area?","خواتین کی نماز کی جگہ کہاں ہے؟","औरतों की नमाज़ की जगह कहाँ है?","মহিলাদের নামাজের জায়গা কোথায়?","Nasaan ang dasalan ng kababaihan?","Kadınlar namaz bölümü nerede?","Di mana tempat shalat wanita?"),
 ("haram","مَتَى الصَّلَاة؟","Matā aṣ-ṣalāh?",None,"When is the prayer?","نماز کب ہے؟","नमाज़ कब है?","নামাজ কখন?","Kailan ang dasal?","Namaz ne zaman?","Kapan shalatnya?"),
 ("haram","غُرْفَة رَقْم …","Ghurfah raqm …",None,"Room number …","کمرہ نمبر …","कमरा नंबर …","রুম নম্বর …","Kuwarto numero …","Oda numarası …","Kamar nomor …"),
 ("haram","الْمِفْتَاح، مِنْ فَضْلَك","Al-miftāḥ, min faḍlak",None,"The key, please","چابی، براہِ کرم","चाबी, कृपया","চাবিটা, দয়া করে","Ang susi, pakiusap","Anahtar, lütfen","Kuncinya, tolong"),
 ("shop","بِكَم هَذَا؟","Bikam hādhā?",None,"How much is this?","یہ کتنے کا ہے؟","यह कितने का है?","এটার দাম কত?","Magkano ito?","Bu ne kadar?","Ini berapa?"),
 ("shop","غَالِي!","Ghālī!",None,"That's expensive!","مہنگا ہے!","महँगा है!","অনেক দাম!","Ang mahal!","Pahalı!","Mahal!"),
 ("shop","فِي تَخْفِيض؟","Fī takhfīḍ?",None,"Is there a discount?","کوئی رعایت ہے؟","कोई छूट है?","কোনো ছাড় আছে?","May diskwento ba?","İndirim var mı?","Ada diskon?"),
 ("shop","أَبْغَى هَذَا","Abghā hādhā",None,"I want this one","مجھے یہ چاہیے","मुझे यह चाहिए","আমি এটা চাই","Gusto ko ito","Bunu istiyorum","Saya mau yang ini"),
 ("shop","مُوَيَة، مِنْ فَضْلَك","Moya, min faḍlak",None,"Water, please","پانی، براہِ کرم","पानी, कृपया","পানি, দয়া করে","Tubig, pakiusap","Su, lütfen","Air, tolong"),
 ("shop","بِدُون حَار","Bidūn ḥār",None,"Not spicy","مرچ کے بغیر","बिना मिर्च","ঝাল ছাড়া","Hindi maanghang","Acısız","Tidak pedas"),
 ("shop","مُمْكِن بِالْبِطَاقَة؟","Mumkin bil-biṭāqah?",None,"Can I pay by card?","کارڈ سے دے سکتا ہوں؟","कार्ड से दे सकता हूँ?","কার্ডে দিতে পারি?","Puwede bang magbayad gamit ang card?","Kartla ödeyebilir miyim?","Bisa bayar pakai kartu?"),
 ("shop","الْحِسَاب، مِنْ فَضْلَك","Al-ḥisāb, min faḍlak",None,"The bill, please","بل، براہِ کرم","बिल, कृपया","বিলটা, দয়া করে","Ang bill, pakiusap","Hesap, lütfen","Minta bonnya"),
 ("help","سَاعِدْنِي!","Sāʿidnī!","Sāʿidīnī!","Help me!","میری مدد کریں!","मेरी मदद करें!","আমাকে সাহায্য করুন!","Tulungan mo ako!","Yardım edin!","Tolong saya!"),
 ("help","أَنَا ضَايِع","Ana ḍāyiʿ","Ana ḍāyʿah","I am lost","میں راستہ بھول گیا ہوں","मैं रास्ता भूल गया हूँ","আমি পথ হারিয়েছি","Naliligaw ako","Kayboldum","Saya tersesat"),
 ("help","أَنَا مَرِيض","Ana marīḍ","Ana marīḍah","I am ill","میں بیمار ہوں","मैं बीमार हूँ","আমি অসুস্থ","May sakit ako","Hastayım","Saya sakit"),
 ("help","وَيْن الْمُسْتَشْفَى؟","Wayn al-mustashfā?",None,"Where is the hospital?","ہسپتال کہاں ہے؟","अस्पताल कहाँ है?","হাসপাতাল কোথায়?","Nasaan ang ospital?","Hastane nerede?","Di mana rumah sakit?"),
 ("help","وَيْن الصَّيْدَلِيَّة؟","Wayn aṣ-ṣaydaliyyah?",None,"Where is the pharmacy?","فارمیسی کہاں ہے؟","दवाखाना (फ़ार्मेसी) कहाँ है?","ফার্মেসি কোথায়?","Nasaan ang botika?","Eczane nerede?","Di mana apotek?"),
 ("help","ضَاع جَوَازِي","Ḍāʿ jawāzī",None,"I have lost my passport","میرا پاسپورٹ گم ہو گیا","मेरा पासपोर्ट खो गया","আমার পাসপোর্ট হারিয়ে গেছে","Nawala ang pasaporte ko","Pasaportumu kaybettim","Paspor saya hilang"),
 ("help","اتَّصِل بِالْإِسْعَاف","Ittaṣil bil-isʿāf","Ittaṣilī bil-isʿāf","Call an ambulance","ایمبولینس بلائیں","एम्बुलेंस बुलाइए","অ্যাম্বুলেন্স ডাকুন","Tumawag ng ambulansya","Ambulans çağırın","Panggil ambulans"),
]
PHRASES = [{"cat":p[0],"ar":p[1],"tr_":p[2],"f":p[3],"m":dict(zip(L7,p[4:11]))} for p in _P]
assert all(len(p) == 11 for p in _P)
NUMBERS = [("٠","صِفْر","ṣifr"),("١","وَاحِد","wāḥid"),("٢","اِثْنَيْن","ithnayn"),("٣","ثَلَاثَة","thalāthah"),("٤","أَرْبَعَة","arbaʿah"),("٥","خَمْسَة","khamsah"),("٦","سِتَّة","sittah"),("٧","سَبْعَة","sabʿah"),("٨","ثَمَانِيَة","thamāniyah"),("٩","تِسْعَة","tisʿah"),("١٠","عَشَرَة","ʿasharah")]
PUI = {
 "phrases":{"en":"Arabic Phrases","ur":"عربی جملے","hi":"अरबी वाक्य","bn":"আরবি বাক্য","tl":"Mga Pariralang Arabic","tr":"Arapça İfadeler","id":"Frasa Arab"},
 "phrases_sub":{"en":"Everyday Arabic for taxis, shops, the hotel and the Haram. Most are the way people actually speak in Saudi Arabia.","ur":"ٹیکسی، دکان، ہوٹل اور حرم کے لیے روزمرہ عربی۔ زیادہ تر وہی جو سعودی عرب میں لوگ واقعی بولتے ہیں۔","hi":"टैक्सी, दुकान, होटल और हरम के लिए रोज़मर्रा की अरबी। ज़्यादातर वही जो सऊदी अरब में लोग असल में बोलते हैं।","bn":"ট্যাক্সি, দোকান, হোটেল ও হারামের জন্য দৈনন্দিন আরবি। বেশিরভাগই সৌদি আরবে মানুষ যেভাবে আসলে বলে।","tl":"Pang-araw-araw na Arabic para sa taxi, tindahan, hotel at Haram. Karamihan ay kung paano talaga nagsasalita ang mga tao sa Saudi Arabia.","tr":"Taksi, dükkân, otel ve Harem için günlük Arapça. Çoğu Suudi Arabistan'da insanların gerçekten konuştuğu şekildedir.","id":"Bahasa Arab sehari-hari untuk taksi, toko, hotel, dan Haram. Kebanyakan sesuai cara orang Saudi benar-benar berbicara."},
 "to_woman":{"en":"Woman's form","ur":"خاتون کے لیے","hi":"महिला के लिए","bn":"নারীর ক্ষেত্রে","tl":"Anyong pambabae","tr":"Kadın için","id":"Bentuk perempuan"},
 "numbers":{"en":"Arabic numbers 0–10","ur":"عربی گنتی 0–10","hi":"अरबी गिनती 0–10","bn":"আরবি সংখ্যা ০–১০","tl":"Mga numerong Arabic 0–10","tr":"Arapça sayılar 0–10","id":"Angka Arab 0–10"},
 "numbers_note":{"en":"Signs, prices and gate numbers in Saudi Arabia often use these digits.","ur":"سعودی عرب میں سائن بورڈ، قیمتیں اور گیٹ نمبر اکثر انہی ہندسوں میں ہوتے ہیں۔","hi":"सऊदी अरब में साइनबोर्ड, क़ीमतें और गेट नंबर अक्सर इन्हीं अंकों में होते हैं।","bn":"সৌদি আরবে সাইনবোর্ড, দাম ও গেট নম্বর প্রায়ই এই অঙ্কে লেখা থাকে।","tl":"Madalas gamitin ang mga numerong ito sa mga karatula, presyo at numero ng gate sa Saudi Arabia.","tr":"Suudi Arabistan'da tabelalar, fiyatlar ve kapı numaraları çoğu zaman bu rakamlarla yazılır.","id":"Papan petunjuk, harga, dan nomor pintu di Arab Saudi sering memakai angka ini."},
 "emergency":{"en":"Emergency in Saudi Arabia: call 911","ur":"سعودی عرب میں ایمرجنسی: 911 پر کال کریں","hi":"सऊदी अरब में इमरजेंसी: 911 पर कॉल करें","bn":"সৌদি আরবে জরুরি: ৯১১ নম্বরে কল করুন","tl":"Emerhensiya sa Saudi Arabia: tumawag sa 911","tr":"Suudi Arabistan'da acil durum: 911'i arayın","id":"Darurat di Arab Saudi: hubungi 911"},
}
