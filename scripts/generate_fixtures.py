import os
import json

fixtures_dir = "backend/tests/fixtures/offers"

fixtures = [
    {
        "id": "scam_fee_1",
        "text": "Congratulations! You have been selected for the internship at TechCorp. Please pay a refundable security deposit of Rs 2000 to our UPI ID hr@techcorp to confirm your seat.",
        "expected_verdict": "likely_scam",
        "must_flag": ["fee_request"],
        "must_not_flag": []
    },
    {
        "id": "scam_free_email",
        "text": "We are hiring freshers for Software Engineer at GlobalTech. Send your resume to globaltech.hr123@gmail.com.",
        "expected_verdict": "likely_scam",
        "must_flag": ["free_mail_sender", "vague_company"],
        "must_not_flag": []
    },
    {
        "id": "scam_lookalike",
        "text": "You are selected for Google. Click here to claim your offer: http://g00gle.com/offer",
        "expected_verdict": "likely_scam",
        "must_flag": ["lookalike_domain"],
        "must_not_flag": []
    },
    {
        "id": "scam_no_interview",
        "text": "You are selected without an interview based on your profile. Reply immediately to claim the offer.",
        "expected_verdict": "likely_scam",
        "must_flag": ["no_interview", "urgency"],
        "must_not_flag": []
    },
    {
        "id": "scam_telegram",
        "text": "Hello, I am HR from Amazon. We have a part-time job for you. Contact me on Telegram: @amazon_hr_bot",
        "expected_verdict": "be_careful",
        "must_flag": ["offchat_only"],
        "must_not_flag": []
    },
    {
        "id": "scam_money_forwarding",
        "text": "Your job is to receive payments into your bank account and forward them to our suppliers. You keep 10% commission.",
        "expected_verdict": "likely_scam",
        "must_flag": ["money_forwarding"],
        "must_not_flag": []
    },
    {
        "id": "scam_unrealistic",
        "text": "Data Entry Operator required. Fresher CTC: 45 LPA. Work from home. No interview required.",
        "expected_verdict": "likely_scam",
        "must_flag": ["unrealistic_pay", "no_interview"],
        "must_not_flag": []
    },
    {
        "id": "scam_cert_fee",
        "text": "To get your completion certificate, you must pay Rs 500 for printing charges.",
        "expected_verdict": "likely_scam",
        "must_flag": ["fee_request"],
        "must_not_flag": []
    },
    {
        "id": "scam_hindi",
        "text": "Aapki naukri pakki ho gayi hai. 5000 rupaye registration fee jama karein.",
        "expected_verdict": "likely_scam",
        "must_flag": ["fee_request"],
        "must_not_flag": []
    },
    {
        "id": "scam_bengali",
        "text": "Apnar chakri confirm. Training er jonno 1000 taka jama din.",
        "expected_verdict": "likely_scam",
        "must_flag": ["fee_request"],
        "must_not_flag": []
    },
    {
        "id": "scam_new_domain",
        "text": "Welcome to FutureTech Innovations. Visit our website at futuretech-innovations-2026.com",
        "expected_verdict": "be_careful",
        "must_flag": ["new_domain"],
        "must_not_flag": []
    },
    {
        "id": "scam_community",
        "text": "Join our network scheme and earn 10,000 per day. Email us at scammer123@scam.com",
        "expected_verdict": "likely_scam",
        "must_flag": ["community_reported"],
        "must_not_flag": []
    },
    {
        "id": "genuine_1",
        "text": "Dear candidate, we are pleased to offer you the role of SDE at Microsoft. Please review the attached offer letter and sign. Contact hr@microsoft.com for queries.",
        "expected_verdict": "looks_pakka",
        "must_flag": [],
        "must_not_flag": ["free_mail_sender", "lookalike_domain", "fee_request", "no_interview"]
    },
    {
        "id": "genuine_2",
        "text": "TCS Off-Campus Drive: Your interview is scheduled for tomorrow at 10 AM. Please join via the official WebEx link.",
        "expected_verdict": "looks_pakka",
        "must_flag": [],
        "must_not_flag": ["fee_request", "no_interview"]
    },
    {
        "id": "genuine_3",
        "text": "Congratulations on your selection for the Infosys internship program. Your stipend will be Rs 25,000 per month.",
        "expected_verdict": "looks_pakka",
        "must_flag": [],
        "must_not_flag": ["unrealistic_pay", "fee_request"]
    },
    {
        "id": "genuine_4",
        "text": "Wipro HR: Please complete your background verification documents and upload them to our portal.",
        "expected_verdict": "looks_pakka",
        "must_flag": [],
        "must_not_flag": ["vague_company"]
    },
    {
        "id": "genuine_5",
        "text": "Your interview for the Data Scientist role at Amazon is confirmed.",
        "expected_verdict": "looks_pakka",
        "must_flag": [],
        "must_not_flag": ["no_interview"]
    },
    {
        "id": "genuine_6",
        "text": "IBM recruitment team. We are offering you a position after clearing the 3 rounds of technical interviews.",
        "expected_verdict": "looks_pakka",
        "must_flag": [],
        "must_not_flag": ["no_interview"]
    },
    {
        "id": "genuine_7",
        "text": "Accenture onboarding process. You will receive your laptop next week.",
        "expected_verdict": "looks_pakka",
        "must_flag": [],
        "must_not_flag": []
    },
    {
        "id": "genuine_8",
        "text": "Google hiring team. Please fill out the relocation form.",
        "expected_verdict": "looks_pakka",
        "must_flag": [],
        "must_not_flag": []
    },
    {
        "id": "ambiguous_1",
        "text": "We are a startup looking for interns. Send your CV to my personal email john.doe@gmail.com.",
        "expected_verdict": "be_careful",
        "must_flag": ["free_mail_sender"],
        "must_not_flag": ["fee_request"]
    },
    {
        "id": "ambiguous_2",
        "text": "Startup internship. Stipend 15k. Apply now, limited slots.",
        "expected_verdict": "be_careful",
        "must_flag": ["urgency"],
        "must_not_flag": []
    },
    {
        "id": "ambiguous_3",
        "text": "Are you looking for an internship? DM me on WhatsApp.",
        "expected_verdict": "be_careful",
        "must_flag": ["offchat_only"],
        "must_not_flag": []
    },
    {
        "id": "ambiguous_4",
        "text": "New agency hiring for entry-level tasks.",
        "expected_verdict": "be_careful",
        "must_flag": ["vague_company"],
        "must_not_flag": []
    },
    {
        "id": "ambiguous_5",
        "text": "Opportunity for freshers in a leading firm. Immediate joining.",
        "expected_verdict": "be_careful",
        "must_flag": ["vague_company", "urgency"],
        "must_not_flag": []
    }
]

for f in fixtures:
    with open(os.path.join(fixtures_dir, f"{f['id']}.json"), "w", encoding="utf-8") as file:
        json.dump(f, file, indent=2, ensure_ascii=False)
    print(f"Created {f['id']}.json")

