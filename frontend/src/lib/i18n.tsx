"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "hi" | "bn";

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

const translations = {
  en: {
    analyzedText: "Analyzed Text",
    verdict: "Verdict",
    trustScore: "Trust Score (0–100)",
    redFlags: "Red Flags Detected",
    noRedFlags: "No strong red flags detected.",
    nextSteps: "Next Steps",
    report: "Report on cybercrime.gov.in",
    copyComplaint: "Copy Complaint",
    disclaimer: "Pakka shows risk signals, not proof. Verify with the company through its official website.",
    checking: "Checking signals...",
    notFound: "Report not found.",
    showInText: "Show in text",
    insufficientInfo: "Insufficient Information",
    insufficientInfoDesc: "The provided text doesn't contain enough meaningful offer details to analyze. Please provide a complete job offer, email, or message.",
    nav: {
      home: "Home",
      about: "About",
      community: "Community"
    },
    communityStats: {
      title: "Community Safety",
      subtitle: "Every report helps protect the next student. Here's what we've found so far.",
      offersChecked: "Offers Checked",
      scamsFlagged: "Scams Flagged",
      recentPatterns: "Recent Reported Patterns",
      noData: "Community data is not yet available for recent patterns.",
      commonFlag: "Commonly reported red flag"
    },
    aboutUs: {
      title: "About Pakka",
      subtitle: "Empowering India's job seekers to make safe decisions.",
      missionTitle: "Our Mission",
      missionDesc: "Pakka uses AI to analyze job offers and protect students from recruitment scams.",
      howItWorksTitle: "How It Works",
      howItWorksDesc: "Paste the text of any job offer, and our AI system will check for multiple risk signals like language, sender domain, and known fraud patterns."
    },
    verdicts: {
      "looks_pakka": "Looks Pakka",
      "be_careful": "Be Careful",
      "likely_scam": "Likely Scam",
      "insufficient_information": "Insufficient Information"
    },
    flags: {
      "fee_request": { title: "Fee Request", reason: "The offer asks for an upfront payment or fee." },
      "free_mail_sender": { title: "Free Mail Sender", reason: "The email was sent from a free email service, which is uncommon for legitimate corporate offers." },
      "lookalike_domain": { title: "Lookalike Domain", reason: "The sender's domain looks suspiciously similar to a legitimate company's domain." },
      "new_domain": { title: "New Domain", reason: "The sender's domain was recently registered." },
      "no_interview": { title: "No Interview", reason: "The offer guarantees a job without an interview process." },
      "urgency": { title: "Urgency", reason: "The message creates a false sense of urgency." },
      "offchat_only": { title: "Offchat Only", reason: "The communication is restricted to unofficial chat platforms." },
      "money_forwarding": { title: "Money Forwarding", reason: "The offer involves receiving and forwarding money." },
      "unrealistic_pay": { title: "Unrealistic Pay", reason: "The promised compensation is unrealistically high." },
      "certificate_social_demand": { title: "Certificate Social Demand", reason: "The offer requires you to pay for a certificate or post it on social media." },
      "vague_company": { title: "Vague Company", reason: "The company name or description is vague or missing." },
      "community_reported": { title: "Community Reported", reason: "This sender has been reported by the community." },
      "llm_tone": { title: "Unprofessional Tone", reason: "The email uses unprofessional language and lacks corporate formatting." }
    },
    defaultNextSteps: [
      "Verify the sender's identity through official channels.",
      "Do not click on any suspicious links."
    ]
  },
  hi: {
    analyzedText: "विश्लेषित पाठ",
    verdict: "निर्णय",
    trustScore: "विश्वास स्कोर (0-100)",
    redFlags: "खतरे के संकेत मिले",
    noRedFlags: "कोई मजबूत खतरे के संकेत नहीं मिले।",
    nextSteps: "अगले कदम",
    report: "cybercrime.gov.in पर रिपोर्ट करें",
    copyComplaint: "शिकायत कॉपी करें",
    disclaimer: "पक्का जोखिम संकेत दिखाता है, सबूत नहीं। आधिकारिक वेबसाइट के माध्यम से कंपनी के साथ सत्यापित करें।",
    checking: "सिग्नल की जाँच हो रही है...",
    notFound: "रिपोर्ट नहीं मिली।",
    showInText: "टेक्स्ट में दिखाएं",
    insufficientInfo: "अपर्याप्त जानकारी",
    insufficientInfoDesc: "प्रदान किए गए पाठ में विश्लेषण करने के लिए पर्याप्त विवरण नहीं हैं। कृपया एक पूरा जॉब ऑफर या संदेश प्रदान करें।",
    nav: {
      home: "मुख्य पृष्ठ",
      about: "हमारे बारे में",
      community: "समुदाय"
    },
    communityStats: {
      title: "सामुदायिक सुरक्षा",
      subtitle: "प्रत्येक रिपोर्ट अगले छात्र की रक्षा करने में मदद करती है। यहाँ अब तक हमें क्या मिला है।",
      offersChecked: "ऑफर जाँचे गए",
      scamsFlagged: "घोटाले पकड़े गए",
      recentPatterns: "हाल के रिपोर्ट किए गए पैटर्न",
      noData: "हाल के पैटर्न के लिए सामुदायिक डेटा अभी उपलब्ध नहीं है।",
      commonFlag: "आमतौर पर रिपोर्ट किया गया खतरे का संकेत"
    },
    aboutUs: {
      title: "पाक्का के बारे में",
      subtitle: "भारत के नौकरी चाहने वालों को सुरक्षित निर्णय लेने के लिए सशक्त बनाना।",
      missionTitle: "हमारा मिशन",
      missionDesc: "पाक्का एआई का उपयोग करके नौकरी के प्रस्तावों का विश्लेषण करता है और छात्रों को भर्ती घोटालों से बचाता है।",
      howItWorksTitle: "यह कैसे काम करता है",
      howItWorksDesc: "किसी भी नौकरी के प्रस्ताव के पाठ को पेस्ट करें, और हमारा एआई सिस्टम भाषा, प्रेषक डोमेन और ज्ञात धोखाधड़ी पैटर्न जैसे कई जोखिम संकेतों की जांच करेगा।"
    },
    verdicts: {
      "looks_pakka": "सही लगता है",
      "be_careful": "सावधान रहें",
      "likely_scam": "संभावित घोटाला",
      "insufficient_information": "अपर्याप्त जानकारी"
    },
    flags: {
      "fee_request": { title: "शुल्क का अनुरोध", reason: "ऑफर में अग्रिम भुगतान या शुल्क मांगा गया है।" },
      "free_mail_sender": { title: "मुफ्त ईमेल प्रेषक", reason: "ईमेल मुफ्त सेवा से भेजा गया था, जो कॉर्पोरेट में असामान्य है।" },
      "lookalike_domain": { title: "मिलता-जुलता डोमेन", reason: "प्रेषक का डोमेन किसी वास्तविक कंपनी के डोमेन जैसा दिखता है।" },
      "new_domain": { title: "नया डोमेन", reason: "प्रेषक का डोमेन हाल ही में पंजीकृत हुआ है।" },
      "no_interview": { title: "कोई इंटरव्यू नहीं", reason: "ऑफर में बिना इंटरव्यू के नौकरी की गारंटी दी गई है।" },
      "urgency": { title: "तत्काल", reason: "संदेश जल्दबाजी की झूठी भावना पैदा करता है।" },
      "offchat_only": { title: "केवल बाहरी चैट", reason: "संचार अनौपचारिक चैट प्लेटफॉर्म तक सीमित है।" },
      "money_forwarding": { title: "पैसे भेजना", reason: "ऑफर में पैसे प्राप्त करना और आगे भेजना शामिल है।" },
      "unrealistic_pay": { title: "अवास्तविक वेतन", reason: "वादा किया गया वेतन अवास्तविक रूप से अधिक है।" },
      "certificate_social_demand": { title: "प्रमाणपत्र / सामाजिक मांग", reason: "ऑफर में प्रमाणपत्र के लिए भुगतान या सोशल मीडिया पर पोस्ट करने को कहा गया है।" },
      "vague_company": { title: "अस्पष्ट कंपनी", reason: "कंपनी का नाम या विवरण अस्पष्ट या गायब है।" },
      "community_reported": { title: "समुदाय द्वारा रिपोर्ट किया गया", reason: "समुदाय द्वारा इस प्रेषक की रिपोर्ट की गई है।" },
      "llm_tone": { title: "अव्यावसायिक लहजा", reason: "ईमेल अव्यावसायिक भाषा का उपयोग करता है।" }
    },
    defaultNextSteps: [
      "आधिकारिक चैनलों के माध्यम से प्रेषक की पहचान सत्यापित करें।",
      "किसी भी संदिग्ध लिंक पर क्लिक न करें।"
    ]
  },
  bn: {
    analyzedText: "বিশ্লেষিত টেক্সট",
    verdict: "রায়",
    trustScore: "ট্রাস্ট স্কোর (০-১০০)",
    redFlags: "বিপদ সংকেত সনাক্ত হয়েছে",
    noRedFlags: "কোনো শক্তিশালী বিপদ সংকেত পাওয়া যায়নি।",
    nextSteps: "পরবর্তী পদক্ষেপ",
    report: "cybercrime.gov.in এ রিপোর্ট করুন",
    copyComplaint: "অভিযোগ কপি করুন",
    disclaimer: "পাক্কা ঝুঁকির সংকেত দেখায়, প্রমাণ নয়। কোম্পানির অফিসিয়াল ওয়েবসাইটের মাধ্যমে যাচাই করুন।",
    checking: "সিগন্যাল চেক করা হচ্ছে...",
    notFound: "রিপোর্ট পাওয়া যায়নি।",
    showInText: "টেক্সটে দেখান",
    insufficientInfo: "অপর্যাপ্ত তথ্য",
    insufficientInfoDesc: "প্রদত্ত পাঠ্যে বিশ্লেষণ করার জন্য পর্যাপ্ত অফারের বিবরণ নেই। অনুগ্রহ করে একটি সম্পূর্ণ চাকরির অফার, ইমেল বা বার্তা প্রদান করুন।",
    nav: {
      home: "হোম",
      about: "আমাদের সম্পর্কে",
      community: "সম্প্রদায়"
    },
    communityStats: {
      title: "সম্প্রদায় সুরক্ষা",
      subtitle: "প্রতিটি রিপোর্ট পরবর্তী ছাত্রকে রক্ষা করতে সাহায্য করে। এখানে আমরা এ পর্যন্ত যা পেয়েছি।",
      offersChecked: "অফার চেক করা হয়েছে",
      scamsFlagged: "স্ক্যাম চিহ্নিত করা হয়েছে",
      recentPatterns: "সাম্প্রতিক রিপোর্ট করা প্যাটার্ন",
      noData: "সাম্প্রতিক প্যাটার্নের জন্য সম্প্রদায়ের ডেটা এখনও উপলব্ধ নয়।",
      commonFlag: "সাধারণত রিপোর্ট করা বিপদ সংকেত"
    },
    aboutUs: {
      title: "পাক্কা সম্পর্কে",
      subtitle: "ভারতের চাকরি প্রার্থীদের নিরাপদ সিদ্ধান্ত নিতে ক্ষমতায়ন।",
      missionTitle: "আমাদের মিশন",
      missionDesc: "পাক্কা এআই ব্যবহার করে চাকরির অফার বিশ্লেষণ করে এবং ছাত্রদের নিয়োগ কেলেঙ্কারি থেকে রক্ষা করে।",
      howItWorksTitle: "এটি কীভাবে কাজ করে",
      howItWorksDesc: "যেকোনো চাকরির অফারের টেক্সট পেস্ট করুন, এবং আমাদের এআই সিস্টেম ভাষা, প্রেরক ডোমেইন এবং পরিচিত প্রতারণার প্যাটার্নগুলির মতো একাধিক ঝুঁকির সংকেত পরীক্ষা করবে।"
    },
    verdicts: {
      "looks_pakka": "সঠিক মনে হচ্ছে",
      "be_careful": "সতর্ক থাকুন",
      "likely_scam": "সম্ভাব্য প্রতারণা",
      "insufficient_information": "অপর্যাপ্ত তথ্য"
    },
    flags: {
      "fee_request": { title: "ফি অনুরোধ", reason: "অফারে অগ্রিম পেমেন্ট বা ফি চাওয়া হয়েছে।" },
      "free_mail_sender": { title: "ফ্রি মেইল প্রেরক", reason: "ইমেলটি একটি ফ্রি পরিষেবা থেকে পাঠানো হয়েছে, যা কর্পোরেট ক্ষেত্রে অস্বাভাবিক।" },
      "lookalike_domain": { title: "সদৃশ ডোমেইন", reason: "প্রেরকের ডোমেইনটি আসল কোম্পানির ডোমেইনের মতো দেখতে।" },
      "new_domain": { title: "নতুন ডোমেইন", reason: "প্রেরকের ডোমেইনটি সম্প্রতি নিবন্ধিত হয়েছে।" },
      "no_interview": { title: "ইন্টারভিউ নেই", reason: "অফারে ইন্টারভিউ ছাড়াই চাকরির নিশ্চয়তা দেওয়া হয়েছে।" },
      "urgency": { title: "জরুরি", reason: "বার্তাটি তাড়াহুড়োর একটি মিথ্যা অনুভূতি তৈরি করে।" },
      "offchat_only": { title: "কেবলমাত্র চ্যাট", reason: "যোগাযোগটি অনানুষ্ঠানিক চ্যাট প্ল্যাটফর্মে সীমাবদ্ধ।" },
      "money_forwarding": { title: "অর্থ স্থানান্তর", reason: "অফারে অর্থ গ্রহণ এবং স্থানান্তর জড়িত।" },
      "unrealistic_pay": { title: "অবাস্তব বেতন", reason: "প্রতিশ্রুত বেতন অবাস্তবভাবে বেশি।" },
      "certificate_social_demand": { title: "সার্টিফিকেট / সামাজিক চাহিদা", reason: "অফারে সার্টিফিকেটের জন্য অর্থ প্রদান বা সোশ্যাল মিডিয়ায় পোস্ট করতে বলা হয়েছে।" },
      "vague_company": { title: "অস্পষ্ট কোম্পানি", reason: "কোম্পানির নাম বা বিবরণ অস্পষ্ট বা অনুপস্থিত।" },
      "community_reported": { title: "সম্প্রদায় দ্বারা রিপোর্ট করা হয়েছে", reason: "এই প্রেরক সম্প্রদায় দ্বারা রিপোর্ট করা হয়েছে।" },
      "llm_tone": { title: "অপেশাদার সুর", reason: "ইমেলটি অপেশাদার ভাষা ব্যবহার করে।" }
    },
    defaultNextSteps: [
      "অফিসিয়াল চ্যানেলের মাধ্যমে প্রেরকের পরিচয় যাচাই করুন।",
      "কোনো সন্দেহজনক লিঙ্কে ক্লিক করবেন না।"
    ]
  }
};

export function useTranslation() {
  const { lang } = useI18n();
  return {
    t: translations[lang] || translations.en,
    lang
  };
}
