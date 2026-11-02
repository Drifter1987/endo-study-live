/*
 * Reading list for the "Learn" tab — one entry per topic area.
 * Each entry has: what the source is (about), what to read (read), roughly how
 * long it takes (effort), and which blueprint sections it covers.
 * Every URL was opened and checked. endocrine.org itself returned HTTP 503, so
 * Endocrine Society material is reached via the education portal and Endotext.
 */
window.LEARN_RESOURCES = [
  {
    id: "ada-standards",
    url: "https://professional.diabetes.org/standards-of-care",
    sections: ["diabetes", "lipids"],
    title: "Standards of Care in Diabetes 2026",
    org: "American Diabetes Association",
    about: "The ADA's annual, evidence-graded care guideline — the reference behind most diabetes questions on the paper. It is a long document (about 200 pages across 17 sections, free), written for clinicians rather than students, and updated every year.",
    read: "Sections 2 (Diagnosis and Classification), 3 (Prevention or Delay), 6 (Glycemic Goals and Hypoglycemia), 7 (Diabetes Technology), 8 (Obesity and Weight Management), 9 (Pharmacologic Approaches), 10 (Cardiovascular Disease and Risk Management), 11 (Chronic Kidney Disease), 15 (Management in Pregnancy), 16 (Diabetes Care in the Hospital).",
    effort: "≈ 6-8 h for those ten sections; an abridged version and slide deck are on the page if you want 2 h instead.",
    note: "Diabetes is 24% of the paper. Leave sections 1, 5, 12, 13, 14 and 17 unless you have spare time.",
    cost: "free"
  },
  {
    id: "ata",
    url: "https://www.thyroid.org/professionals/ata-professional-guidelines/",
    sections: ["thyroid"],
    title: "ATA Guidelines & Statements",
    org: "American Thyroid Association",
    about: "The American Thyroid Association's guideline library — full practice guidelines of 20 to 60 pages each, free to download. This is the thyroid equivalent of the ADA Standards: the primary source, not a revision text.",
    read: "(1) 2026 Guidelines for Thyroid Disease in Preconception, Pregnancy and Postpartum; (2) 2025 Management Guidelines for Adult Patients with Differentiated Thyroid Cancer; (3) 2016 Guidelines for Hyperthyroidism and Other Causes of Thyrotoxicosis; (4) 2014 Guidelines for the Treatment of Hypothyroidism; plus the 2015 nodule guideline for ultrasound and FNA size thresholds.",
    effort: "≈ 5-6 h for the four; the nodule guideline adds about 1 h.",
    note: "Thyroid is 15%. Skip the anaplastic, medullary and paediatric guidelines unless time is left.",
    cost: "free"
  },
  {
    id: "endotext",
    url: "https://www.endotext.org/",
    sections: ["bone", "adrenal", "pituitary", "female", "male"],
    title: "Endotext — free endocrinology textbook",
    org: "MDText.com",
    about: "A free, peer-reviewed endocrinology textbook of roughly 500 chapters, updated continuously and written for clinicians. Each chapter is a 20-40 minute exam-oriented review with references — the best single free resource for a topic you genuinely don't understand.",
    read: "One chapter per question you got wrong. Bone: Primary Hyperparathyroidism; Approach To Hypercalcemia; Osteoporosis: Clinical Evaluation; Osteoporosis: Prevention and Treatment; Hyperparathyroidism in Chronic Kidney Disease. Adrenal: Cushing's Syndrome; Adrenal Incidentalomas; Hyperaldosteronism; Pheochromocytoma and Paraganglioma. Pituitary: acromegaly, prolactinoma, hypopituitarism, pituitary incidentaloma. Female: Evaluation and Treatment of Polycystic Ovary Syndrome. Male: Primary Testicular Failure; Hypogonadotropic Hypogonadism (HH) and Gonadotropin Therapy.",
    effort: "≈ 45-60 min per chapter — read only the ones your missed questions point to.",
    note: "Free to read online, no login. Use the section grid on the home page or the search box.",
    cost: "free"
  },
  {
    id: "ese-directory",
    url: "https://www.ese-hormones.org/publications/directory/?Publication+Type=Guidelines",
    sections: ["adrenal", "pituitary", "female", "male", "bone"],
    title: "ESE guideline directory (full list)",
    org: "European Society of Endocrinology",
    about: "The European Society of Endocrinology's guideline list: 20 documents, free, each a full practice guideline. European practice often sets a different threshold from US guidance, which is exactly why it is useful — exam questions sometimes hinge on that difference.",
    read: "Glucocorticoid-induced Adrenal Insufficiency (ESE/ES 2024); Adrenal Incidentalomas (2023); Aggressive Pituitary Tumours and Pituitary Carcinomas (2025); International Evidence-based PCOS Guideline (2023); Menopause and Perimenopause (2025); Klinefelter Syndrome (EAA 2020); Functional Hypogonadism in Males (2020); Hyponatraemia (2014).",
    effort: "≈ 4-5 h for those eight.",
    note: "The short landing page only shows the four newest — this link opens the full directory.",
    cost: "free"
  },
  {
    id: "aace",
    url: "https://pro.aace.com/clinical-guidance",
    sections: ["lipids", "diabetes", "bone", "adrenal"],
    title: "AACE guidelines and algorithms",
    org: "American Association of Clinical Endocrinology",
    about: "AACE's algorithms and consensus statements: one-page flow diagrams that tell you what to do next in diabetes, lipids and obesity, plus shorter consensus documents on adrenal masses, osteoporosis and acromegaly. Much faster to read than a full guideline and closer to how a question is worded.",
    read: "Algorithm for Management of Adults with Type 2 Diabetes (2026 update); Diabetes Technology consensus (2026); Dyslipidemia algorithm (2025) and the 2025 lipid clinical practice guideline; Obesity/Adiposity-Based Chronic Disease algorithm (2025); Adrenal Incidental Masses consensus (2019); Postmenopausal Osteoporosis guideline (2020); Pre-operative Therapy in Acromegaly (2015).",
    effort: "≈ 2-3 h total — the algorithms are 10-20 minutes each.",
    note: "Lipids and obesity are 12% together.",
    cost: "free"
  },
  {
    id: "es-recordings",
    url: "https://education.endocrine.org/Public/Catalog/Details.aspx?id=bSSSXzagnXjcUsv2Y47VHg==",
    sections: ["adrenal", "pituitary", "bone", "female", "male", "diabetes", "thyroid"],
    title: "Clinical Practice Guidelines — free session library",
    org: "Endocrine Society (Center for Learning)",
    about: "27 free recorded sessions in which Endocrine Society faculty walk through a guideline: what changed, what matters, and how to apply it. Video and audio, 30-60 minutes each. This is the working route to Endocrine Society guideline teaching while the society's main website is down.",
    read: "Pick the sessions matching your weak sections: Congenital Adrenal Hyperplasia (21-hydroxylase deficiency), Hypercalcemia of Malignancy, Lipid Management in Endocrine Disorders, Overview of Testosterone Therapy for Hypogonadism, Pharmacological Management of Osteoporosis, Vitamin D for the Prevention of Disease, Glucocorticoid-Induced Adrenal Insufficiency, Primary Aldosteronism, Hypothalamic Amenorrhea.",
    effort: "≈ 30-45 min each; two or three is plenty.",
    note: "These are recordings, not the guideline PDFs.",
    cost: "free"
  },
  {
    id: "ztof",
    url: "https://zerotofinals.com/medicine/endocrinology/",
    sections: ["thyroid", "adrenal", "pituitary", "diabetes", "bone"],
    title: "Endocrinology notes (first pass)",
    org: "Zero To Finals",
    about: "Undergraduate-level revision notes: 1-2 pages per topic with simple diagrams and a short quiz at the end. Fast orientation when a topic is completely new, but deliberately shallow — no board-level detail.",
    read: "Fourteen notes: Hormone Axis Physiology, Thyroid Function Tests, Hyperthyroidism, Hypothyroidism, Cushing's Syndrome, Hyperaldosteronism, Adrenal Insufficiency, Type 1 Diabetes, Type 2 Diabetes, Acromegaly, Hyperparathyroidism, SIADH, Diabetes Insipidus, Phaeochromocytoma.",
    effort: "≈ 2 h for all fourteen.",
    note: "No nodules, no PCOS, no male hypogonadism, no osteoporosis — use Endotext for those.",
    cost: "free"
  },
  {
    id: "jcemcr",
    url: "https://academic.oup.com/jcemcr",
    sections: ["adrenal", "pituitary", "thyroid", "bone", "female", "male", "diabetes", "lipids"],
    title: "JCEM Case Reports",
    org: "Endocrine Society / Oxford Academic",
    about: "An open-access journal of short endocrine case reports: a 2-4 page vignette, one decision, and a discussion. It is the closest reading practice to the ESAP question format, and free.",
    read: "Open 'Issues' or 'Latest Published Articles' and read 2-3 cases a week, favouring adrenal, pituitary and thyroid.",
    effort: "≈ 15 min per case.",
    note: "A Cloudflare 'checking your browser' page may appear for a second before it loads.",
    cost: "free"
  },
  {
    id: "geeky-quiz",
    url: "https://geekymedics.com/endocrinology-quiz/",
    sections: ["pituitary", "adrenal", "diabetes", "thyroid"],
    title: "Endocrinology quiz (23 questions)",
    org: "Geeky Medics",
    about: "A single free 23-question single-best-answer quiz with explanations, written at UK undergraduate level. It is a warm-up to check recall, not a measure of exam readiness.",
    read: "The whole quiz: pituitary hormone control, Addisonian crisis, Leydig cells and testosterone, anterior pituitary hormones, diabetes insipidus, Cushing syndrome, diagnosing acromegaly (OGTT + GH), Graves disease, aldosterone, nephrogenic DI, Hashimoto thyroiditis, the most sensitive thyroid test, causes of hyperthyroidism, adrenal cortex products.",
    effort: "≈ 10 min.",
    note: "Accept the cookie banner to start.",
    cost: "free"
  },
  {
    id: "ebr",
    url: "https://education.endocrine.org/Public/Catalog/ChefView.aspx",
    sections: ["diabetes", "thyroid", "bone", "lipids", "adrenal", "pituitary", "female", "male"],
    title: "Endocrine Board Review 2026 (second question bank, paid)",
    org: "Endocrine Society (Center for Learning)",
    about: "The Endocrine Society's official board-review bank: 227 ABIM-style case questions, sectional mock exams and a printed book with rationale. Paid; the natural second bank once the 120 ESAP questions in this app are done.",
    read: "On the catalogue page (browsable without logging in) open 'Endocrine Board Review 2026 Bundle' — 227 questions, the printed 18th edition and a practice exam — or buy the cheaper 'Practice Exams' alone.",
    effort: "≈ 20 h to work through properly.",
    note: "Bundle $524-$889 (in-training member $524); practice exams $169-$259.",
    cost: "paid"
  }
];
