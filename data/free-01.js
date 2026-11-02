/*
 * Second question set — 24 questions written to the ITE (ESAP) format and
 * blueprint, using only free guidelines as the source. They are original
 * teaching items, not ESAP questions, and not ABIM board trivia: each is a
 * case vignette with five options and one best answer, weighted to the ITE
 * blueprint ONLY (Diabetes 24%, Thyroid 15%, Bone 15%, Lipids 12%,
 * Adrenal 10%, Pituitary 10%, female 7%, male 7%).
 *
 * Every "ref" points to the free source a reader can open (see the Learn tab).
 */
window.FREE_QUESTIONS = [
  /* ---------------- diabetes (6) ---------------- */
  {
    n: 1,
    section: "diabetes",
    vignette: "A 61-year-old man with type 2 diabetes for 8 years and a previous myocardial infarction takes metformin 1000 mg twice daily. HbA1c 7.9%. eGFR 55 mL/min/1.73 m2, UACR 20 mg/g, blood pressure 128/76 mm Hg on lisinopril. No heart failure. BMI 30 kg/m2.\n\nWhat is the best next step?",
    options: [
      "Add glimepiride 2 mg daily",
      "Add semaglutide, titrated to 1 mg weekly",
      "Add pioglitazone 30 mg daily",
      "Start basal insulin 10 units at bedtime",
      "Switch metformin to insulin"
    ],
    answer: "B",
    why: "In type 2 diabetes with established atherosclerotic cardiovascular disease, the ADA prefers an agent with proven cardiovascular benefit — a GLP-1 receptor agonist or an SGLT-2 inhibitor — regardless of HbA1c. Semaglutide also lowers weight and progresses less than a sulfonylurea or insulin. A sulfonylurea adds hypoglycaemia and weight gain with no cardiovascular benefit, and pioglitazone adds fluid retention.",
    ref: "ADA Standards of Care 2026, sections 9 (Pharmacologic Approaches) and 10 (Cardiovascular Disease)."
  },
  {
    n: 2,
    section: "diabetes",
    vignette: "A 68-year-old woman with type 2 diabetes and heart failure with reduced ejection fraction (35%) takes metformin and furosemide. HbA1c 7.4%, eGFR 62, blood pressure 118/70 mm Hg.\n\nWhich addition is most likely to reduce her heart-failure hospitalisations?",
    options: [
      "Dapagliflozin 10 mg daily",
      "Sitagliptin 100 mg daily",
      "Glipizide 5 mg daily",
      "Pioglitazone 15 mg daily",
      "Basal insulin"
    ],
    answer: "A",
    why: "SGLT-2 inhibitors reduce heart-failure hospitalisation and cardiovascular death in both reduced and preserved ejection fraction, and they slow kidney disease progression. Sitagliptin is cardiovascular-neutral, sulfonylureas and insulin add weight and hypoglycaemia, and pioglitazone causes fluid retention and worsens heart failure.",
    ref: "ADA Standards of Care 2026, section 10 (Cardiovascular Disease and Risk Management)."
  },
  {
    n: 3,
    section: "diabetes",
    vignette: "A 24-year-old woman with type 1 diabetes presents with vomiting. Glucose 28 mmol/L, pH 7.12, bicarbonate 9 mmol/L, beta-hydroxybutyrate 5.4 mmol/L, potassium 5.6 mEq/L, sodium 131 mEq/L.\n\nWhich is the best immediate management?",
    options: [
      "Start intravenous fluids and an insulin infusion, give no potassium, and recheck potassium hourly",
      "Give 20-40 mmol/h potassium chloride with the insulin infusion",
      "Delay insulin until potassium falls below 5.0 mEq/L",
      "Give intravenous sodium bicarbonate now",
      "Give a 50% dextrose bolus before insulin"
    ],
    answer: "A",
    why: "In diabetic ketoacidosis, total-body potassium is always depleted but the serum value can be normal or high; with potassium above about 5.2 mEq/L you withhold potassium while giving insulin and fluids, then recheck hourly and add potassium as it falls. Insulin must never be delayed, and bicarbonate is reserved for pH below 6.9.",
    ref: "ADA Standards of Care 2026, section 16 (Diabetes Care in the Hospital); 2024 hyperglycaemic crises consensus."
  },
  {
    n: 4,
    section: "diabetes",
    vignette: "A 63-year-old woman with type 2 diabetes and chronic kidney disease takes metformin 500 mg twice daily and ramipril 10 mg daily. eGFR 42 mL/min/1.73 m2, UACR 310 mg/g, potassium 4.4 mEq/L, blood pressure 128/76 mm Hg, HbA1c 7.6%.\n\nWhat should be added first?",
    options: [
      "Dapagliflozin 10 mg daily",
      "Finerenone 10 mg daily",
      "Increase ramipril to 20 mg daily",
      "Furosemide 40 mg daily",
      "Basal insulin"
    ],
    answer: "A",
    why: "Albuminuric chronic kidney disease in type 2 diabetes is treated with an SGLT-2 inhibitor on top of a renin-angiotensin blocker — it slows eGFR decline and reduces heart-failure risk, and it is started down to an eGFR of 20. Finerenone is an add-on after that, not instead of it, and is not started when potassium is above 5.0.",
    ref: "ADA Standards of Care 2026, section 11 (Chronic Kidney Disease and Risk Management)."
  },
  {
    n: 5,
    section: "diabetes",
    vignette: "A 34-year-old woman with type 2 diabetes is 8 weeks pregnant. Her regimen is metformin 1000 mg twice daily and gliclazide 80 mg daily; HbA1c is 7.4%.\n\nWhat is the best change to her treatment?",
    options: [
      "Continue both drugs unchanged",
      "Stop gliclazide and start insulin, continuing metformin",
      "Stop metformin and start insulin",
      "Add pioglitazone",
      "Add empagliflozin"
    ],
    answer: "B",
    why: "Insulin is the preferred treatment for pre-existing diabetes in pregnancy, and sulfonylureas are not recommended because of neonatal hypoglycaemia. Metformin may be continued in many protocols, but it alone will not achieve the tighter pregnancy targets. Thiazolidinediones and SGLT-2 inhibitors are not used in pregnancy.",
    ref: "ADA Standards of Care 2026, section 15 (Management of Diabetes in Pregnancy)."
  },
  {
    n: 6,
    section: "diabetes",
    vignette: "A 70-year-old man with type 2 diabetes takes insulin glargine 22 units at bedtime and insulin aspart 6 units with meals. He is admitted for a procedure and will be nil by mouth for about 8 hours. His glucose is 7.8 mmol/L and he is well.\n\nWhat is the best approach to his insulin?",
    options: [
      "Continue the basal insulin and omit the mealtime insulin",
      "Stop all insulin until he eats again",
      "Use a correction-only sliding scale",
      "Start an intravenous insulin infusion",
      "Give the mealtime insulin but omit the basal insulin"
    ],
    answer: "A",
    why: "Basal insulin is continued through a short period without food — it covers the constant metabolic requirement — while prandial doses are omitted. Stopping basal insulin risks hyperglycaemia and ketosis in a patient with little reserve, correction-only regimens undershoot, and an intravenous infusion is reserved for prolonged fasting, critical illness or very poor control.",
    ref: "ADA Standards of Care 2026, section 16 (Diabetes Care in the Hospital)."
  },

  /* ---------------- thyroid (4) ---------------- */
  {
    n: 7,
    section: "thyroid",
    vignette: "A 29-year-old woman with Graves disease is taking methimazole 10 mg daily and is 6 weeks pregnant. Her free T4 is at the upper limit of normal and TSH is suppressed.\n\nWhat is the best management?",
    options: [
      "Continue methimazole 10 mg daily",
      "Switch to propylthiouracil for the first trimester",
      "Stop all antithyroid drug treatment",
      "Refer for radioiodine",
      "Refer for thyroidectomy now"
    ],
    answer: "B",
    why: "Methimazole in the first trimester is associated with aplasia cutis and methimazole embryopathy; propylthiouracil is preferred until the end of the first trimester, after which either drug may be used (many switch back to methimazole). Stopping treatment in a woman who is still thyrotoxic risks miscarriage and preterm birth, and radioiodine is absolutely contraindicated in pregnancy.",
    ref: "ATA Guidelines for Thyroid Disease in Preconception, Pregnancy and Postpartum (2026)."
  },
  {
    n: 8,
    section: "thyroid",
    vignette: "A 45-year-old woman has an incidental 1.8-cm thyroid nodule. Ultrasonography shows a solid hypoechoic nodule with irregular margins and microcalcifications (TI-RADS 5). TSH is normal.\n\nWhat is the best next step?",
    options: [
      "Fine-needle aspiration biopsy",
      "Repeat ultrasonography in 12 months",
      "Radioiodine scan",
      "Thyroid lobectomy without biopsy",
      "Suppressive levothyroxine"
    ],
    answer: "A",
    why: "A solid hypoechoic nodule with irregular margins and microcalcifications is highly suspicious, and FNA is indicated once it reaches 1 cm. Surveillance is for low-suspicion nodules, a radioiodine scan is only for a nodule with suppressed TSH, and surgery is planned on cytology rather than on ultrasound alone.",
    ref: "ATA Management Guidelines for Adult Patients with Thyroid Nodules and Differentiated Thyroid Cancer (2015); 2025 DTC guideline."
  },
  {
    n: 9,
    section: "thyroid",
    vignette: "A 39-year-old woman had a total thyroidectomy and radioiodine for a low-risk papillary thyroid carcinoma 2 years ago. She feels well, thyroglobulin is undetectable, thyroglobulin antibodies are negative and neck ultrasound is normal. Current TSH is 0.15 mIU/L on levothyroxine 137 mcg.\n\nWhat is the best adjustment?",
    options: [
      "Keep TSH between 0.1 and 0.5 mIU/L for life",
      "Reduce levothyroxine so that TSH sits in the normal reference range",
      "Increase levothyroxine to suppress TSH below 0.1 mIU/L",
      "Stop levothyroxine entirely",
      "Give another course of radioiodine"
    ],
    answer: "B",
    why: "In low-risk disease with an undetectable thyroglobulin and negative antibodies there is no evidence that TSH suppression improves outcome, while it does increase the risk of atrial fibrillation and bone loss. Current guidance is to keep TSH within the normal reference range; earlier aggressive suppression targets are no longer routine.",
    ref: "ATA Management Guidelines for Adult Patients with Differentiated Thyroid Cancer (2025)."
  },
  {
    n: 10,
    section: "thyroid",
    vignette: "A 52-year-old woman with hypothyroidism takes levothyroxine 100 mcg each morning. She has just been started on ferrous sulfate and calcium carbonate after a fracture. Her TSH rises from 2.1 to 8.4 mIU/L over 3 months.\n\nWhat is the best explanation and fix?",
    options: [
      "Iron and calcium bind levothyroxine in the gut — separate them by at least 4 hours",
      "Levothyroxine has become ineffective — increase the dose to 150 mcg",
      "The fracture increased her requirement — check free T3",
      "She needs liothyronine instead",
      "The rise is due to non-thyroidal illness — repeat in 6 months without change"
    ],
    answer: "A",
    why: "Iron salts, calcium carbonate, aluminium antacids, proton-pump inhibitors and coffee all reduce levothyroxine absorption when taken together. Taking levothyroxine on an empty stomach and separating these by at least four hours usually restores the previous TSH without changing the dose.",
    ref: "ATA Guidelines for the Treatment of Hypothyroidism (2014); Endotext: Hypothyroidism."
  },

  /* ---------------- bone and calcium (4) ---------------- */
  {
    n: 11,
    section: "bone",
    vignette: "A 56-year-old woman has asymptomatic primary hyperparathyroidism: calcium 11.1 mg/dL (2.78 mmol/L), PTH 88 pg/mL, eGFR 78 mL/min/1.73 m2, 25-hydroxyvitamin D 38 ng/mL, 24-hour urine calcium 470 mg. DXA: femoral neck T-score -1.7. No fractures or stones.\n\nWhat is the best management?",
    options: [
      "Parathyroidectomy",
      "Observation with annual calcium",
      "Alendronate",
      "Cinacalcet",
      "Restrict dietary calcium"
    ],
    answer: "A",
    why: "A 24-hour urinary calcium above 400 mg/day is one of the accepted criteria for parathyroidectomy, as are calcium more than 1 mg/dL above the upper limit, age below 50, T-score at or below -2.5, eGFR below 60 and nephrolithiasis. Bisphosphonates do not correct hypercalcaemia, cinacalcet does not cure the disease and calcium restriction is not treatment.",
    ref: "Fifth International Workshop on Primary Hyperparathyroidism (J Bone Miner Res 2022); Endotext: Primary Hyperparathyroidism."
  },
  {
    n: 12,
    section: "bone",
    vignette: "A 71-year-old woman has taken alendronate for 5 years. She now has a new vertebral compression fracture, femoral neck T-score -2.9, eGFR 68, calcium and vitamin D normal, no previous teriparatide or denosumab.\n\nWhat is the best next treatment?",
    options: [
      "Teriparatide 20 mcg daily for up to 2 years",
      "Continue alendronate and add calcium",
      "Switch to denosumab",
      "Add raloxifene",
      "Stop all bone treatment"
    ],
    answer: "A",
    why: "A fragility fracture on established bisphosphonate therapy means the antiresorptive approach has failed; an anabolic agent is the right step, and teriparatide or abaloparatide are the standard options (romosozumab is an alternative if cardiovascular risk is acceptable). Continuing or switching to another antiresorptive does not rebuild bone, and stopping all treatment loses what density remains.",
    ref: "AACE Clinical Practice Guideline: Postmenopausal Osteoporosis (2020); Endotext: Osteoporosis: Prevention and Treatment."
  },
  {
    n: 13,
    section: "bone",
    vignette: "Twelve hours after total thyroidectomy a 44-year-old woman has perioral tingling, carpopedal spasm and a positive Trousseau sign. Corrected calcium is 1.71 mmol/L (6.8 mg/dL), magnesium 0.62 mmol/L.\n\nWhat is the best immediate treatment?",
    options: [
      "Intravenous calcium gluconate, then oral calcium and activated vitamin D, correcting magnesium",
      "Oral calcium carbonate alone",
      "High-dose oral cholecalciferol alone",
      "Intravenous magnesium alone",
      "Observation with repeat calcium in 24 hours"
    ],
    answer: "A",
    why: "Symptomatic post-surgical hypocalcaemia needs intravenous calcium gluconate, followed by oral calcium with activated vitamin D (calcitriol) because the parathyroids are temporarily stunned. Magnesium must be corrected too, since hypomagnesaemia impairs PTH secretion and action. Oral therapy alone is too slow for tetany.",
    ref: "ATA statement on postoperative hypoparathyroidism (2018); Endotext: Hypocalcemia."
  },
  {
    n: 14,
    section: "bone",
    vignette: "A 66-year-old man with stage 3b chronic kidney disease has 25-hydroxyvitamin D 11 ng/mL, calcium 2.24 mmol/L, phosphate 1.5 mmol/L and PTH 110 pg/mL.\n\nWhat is the best treatment for the vitamin D deficiency?",
    options: [
      "Cholecalciferol, repleting to a normal 25-hydroxyvitamin D",
      "Calcitriol from the start",
      "Alfacalcidol from the start",
      "No treatment, because he has CKD",
      "Calcium carbonate alone"
    ],
    answer: "A",
    why: "Vitamin D deficiency is treated with native vitamin D (cholecalciferol or ergocalciferol) whatever the eGFR; active vitamin D analogues are added only if PTH remains high after 25-hydroxyvitamin D is replete, and they risk hypercalcaemia and adynamic bone. Correcting the deficiency usually lowers PTH on its own.",
    ref: "KDIGO CKD-MBD guideline; Endotext: Vitamin D."
  },

  /* ---------------- lipids (3) ---------------- */
  {
    n: 15,
    section: "lipids",
    vignette: "A 59-year-old woman had a myocardial infarction 4 months ago. She takes atorvastatin 80 mg daily and is adherent. LDL cholesterol is 1.9 mmol/L (73 mg/dL), triglycerides 1.4 mmol/L, and she is euglycaemic.\n\nWhat is the best next step?",
    options: [
      "Add ezetimibe 10 mg daily",
      "Increase atorvastatin to 120 mg daily",
      "Add fenofibrate",
      "Add nicotinic acid",
      "No change — LDL is below 2.6 mmol/L"
    ],
    answer: "A",
    why: "For very-high-risk secondary prevention the LDL goal is below 1.4 mmol/L (55 mg/dL) with at least a 50% reduction; 1.9 mmol/L is not at goal. Ezetimibe gives a further 20-25% fall and improves outcomes after acute coronary syndrome; a PCSK9 inhibitor follows if that is not enough. Fibrates and niacin do not lower LDL usefully on top of a statin.",
    ref: "AACE Clinical Practice Guideline on Pharmacologic Management of Adults with Dyslipidemia (2025); AACE Dyslipidemia Algorithm (2025)."
  },
  {
    n: 16,
    section: "lipids",
    vignette: "A 41-year-old man with type 2 diabetes has fasting triglycerides 12.0 mmol/L (1060 mg/dL), total cholesterol 9 mmol/L, and one previous episode of pancreatitis. He drinks 20 units of alcohol a week.\n\nWhich treatment should come first?",
    options: [
      "A fibrate, with alcohol reduction and a low-fat diet",
      "A statin alone",
      "Ezetimibe",
      "Niacin",
      "Bile acid sequestrant"
    ],
    answer: "A",
    why: "With triglycerides above 10 mmol/L the immediate risk is pancreatitis, and fibrates are the most effective agents for severe hypertriglyceridaemia, alongside stopping alcohol, reducing fat and treating the diabetes. A statin lowers LDL and cardiovascular risk but has little effect on triglycerides; it is added once triglycerides are controlled.",
    ref: "AACE Dyslipidemia Algorithm (2025); Endotext: Lipid Management."
  },
  {
    n: 17,
    section: "lipids",
    vignette: "A 54-year-old man develops bilateral thigh myalgia 6 weeks after starting atorvastatin 40 mg. CK is 320 U/L (normal <200), TSH is normal and renal function is normal. Symptoms resolve within 3 weeks of stopping.\n\nWhat is the best next step for his lipids?",
    options: [
      "Restart a lower dose of atorvastatin, or a different statin such as rosuvastatin at a low dose, and monitor",
      "Avoid all statins permanently",
      "Start a fibrate as replacement",
      "Start ezetimibe alone",
      "Reassure without lipid-lowering therapy"
    ],
    answer: "A",
    why: "Most statin-associated muscle symptoms are not rhabdomyolysis, and a re-challenge with a lower dose or a different statin (for example rosuvastatin, or alternate-day dosing) succeeds in the majority. Only after two statins — at least one at the lowest dose — fail should statin intolerance be diagnosed and non-statin therapy used.",
    ref: "AACE Lipid Guideline (2025); ADA Standards 2026, section 10."
  },

  /* ---------------- adrenal (3) ---------------- */
  {
    n: 18,
    section: "adrenal",
    vignette: "A 58-year-old woman has a 3.0-cm left adrenal incidentaloma with unenhanced attenuation 8 Hounsfield units. She has hypertension and type 2 diabetes, no cushingoid features. Plasma metanephrines normal; 1-mg dexamethasone-suppression cortisol 2.6 mcg/dL (72 nmol/L); potassium and aldosterone-to-renin ratio normal.\n\nWhat is the best management?",
    options: [
      "No adrenalectomy; repeat imaging and the 1-mg dexamethasone test, and review bone health and glycaemia",
      "Laparoscopic adrenalectomy",
      "Adrenal biopsy",
      "Repeat imaging only if symptoms develop",
      "Start ketoconazole"
    ],
    answer: "A",
    why: "This is mild autonomous cortisol secretion — the dexamethasone-suppressed cortisol is above 1.8 mcg/dL (50 nmol/L) but there is no clinical Cushing syndrome. Surgery is not indicated; the risk is progression of hypertension, diabetes and bone loss, so repeat imaging and hormonal testing and treat those comorbidities. Biopsy is reserved for suspected metastasis after hormone excess is excluded.",
    ref: "ESE Clinical Practice Guideline on Adrenal Incidentalomas (2023); AACE Consensus on Incidentally Discovered Adrenal Masses (2019)."
  },
  {
    n: 19,
    section: "adrenal",
    vignette: "A 34-year-old man with known primary adrenal insufficiency on hydrocortisone 15 mg and 5 mg daily presents with vomiting, fever and confusion. Blood pressure 88/55 mm Hg, sodium 128 mEq/L, potassium 5.6 mEq/L, glucose 3.1 mmol/L.\n\nWhat is the best immediate treatment?",
    options: [
      "Intravenous hydrocortisone 100 mg, intravenous saline and glucose, and treatment of the precipitant",
      "Double his oral hydrocortisone and send home",
      "Intravenous saline alone",
      "Intravenous fludrocortisone",
      "Oral prednisolone 20 mg"
    ],
    answer: "A",
    why: "This is an adrenal crisis: an immediate parenteral stress dose of hydrocortisone (100 mg, then 50 mg every 6 hours), rapid isotonic saline and dextrose for the hypoglycaemia, plus treatment of infection. Oral steroids are not absorbed reliably in a vomiting patient, saline alone does not replace cortisol, and fludrocortisone is not the acute treatment — cortisol at stress doses provides the mineralocorticoid effect.",
    ref: "ESE/Endocrine Society Joint Guideline: Glucocorticoid-induced Adrenal Insufficiency (2024); Endotext: Adrenal Insufficiency."
  },
  {
    n: 20,
    section: "adrenal",
    vignette: "A 49-year-old man has primary aldosteronism confirmed biochemically. Adrenal CT shows a 1.3-cm left nodule and a normal right gland. Adrenal vein sampling is bilaterally successful after cosyntropin and shows lateralisation to the left with contralateral suppression. He is fit for surgery and has three antihypertensives.\n\nWhat is the best treatment?",
    options: [
      "Laparoscopic left adrenalectomy",
      "Lifelong spironolactone",
      "Right adrenalectomy",
      "Radiofrequency ablation of the left nodule",
      "Repeat adrenal vein sampling"
    ],
    answer: "A",
    why: "With bilateral successful catheterisation showing an aldosterone-to-cortisol lateralisation index of 4 or more to the left, plus contralateral suppression, unilateral left adrenalectomy is the treatment of choice in a surgical candidate and can cure or greatly improve the hypertension. Medical therapy is for those unfit for surgery or with bilateral disease.",
    ref: "Endocrine Society Clinical Practice Guideline: Primary Aldosteronism (CPG); ESE guidelines on adrenal disease."
  },

  /* ---------------- pituitary (2) ---------------- */
  {
    n: 21,
    section: "pituitary",
    vignette: "A 30-year-old woman with a macroprolactinoma on cabergoline 0.5 mg twice weekly has a positive pregnancy test at 5 weeks. She feels well, has no headache and her visual fields are full.\n\nWhat is the best management?",
    options: [
      "Stop cabergoline and monitor symptoms, visual fields and prolactin each trimester",
      "Continue cabergoline unchanged through pregnancy",
      "Switch to bromocriptine at a higher dose",
      "Refer for transsphenoidal surgery in the first trimester",
      "Arrange pituitary radiotherapy"
    ],
    answer: "A",
    why: "Dopamine agonists are usually stopped once pregnancy is confirmed, because tumour growth in pregnancy is uncommon (especially for microadenomas) and symptoms and visual fields can be monitored. Bromocriptine is restarted only if symptomatic growth occurs. Surgery and radiotherapy are not first-line in pregnancy.",
    ref: "Pituitary Society International Consensus Statement on Prolactinomas (2023); Endotext: Pituitary Disease."
  },
  {
    n: 22,
    section: "pituitary",
    vignette: "Three days after transsphenoidal surgery for a non-functioning macroadenoma, a 47-year-old man passes 6 litres of dilute urine a day and is very thirsty. Serum sodium 150 mEq/L, urine osmolality 90 mOsm/kg, serum osmolality 305 mOsm/kg.\n\nWhat is the best treatment?",
    options: [
      "Desmopressin, with free access to water and monitoring of sodium",
      "Fluid restriction",
      "Hypertonic saline",
      "Hydrocortisone",
      "Democlocycline"
    ],
    answer: "A",
    why: "This is central diabetes insipidus from damage to the posterior pituitary or stalk: dilute urine with a rising sodium. Desmopressin replaces the missing vasopressin while allowing thirst to guide water intake; fluid restriction and hypertonic saline would worsen the hypernatraemia, and demeclocycline is used for SIADH.",
    ref: "Endotext: Pituitary Disease (postoperative diabetes insipidus); ESE guideline on pituitary tumours."
  },

  /* ---------------- reproduction (2) ---------------- */
  {
    n: 23,
    section: "female",
    vignette: "A 27-year-old woman with PCOS has had no menses for 7 months. She is not using any contraception and does not want to conceive for 3 years. BMI 34 kg/m2, blood pressure 124/78 mm Hg, HbA1c 5.6%.\n\nWhich treatment best protects her endometrium?",
    options: [
      "A cyclic progestin (or a combined oral contraceptive)",
      "Metformin alone",
      "Observation until she wants to conceive",
      "Metformin plus metformin-only follow-up",
      "GnRH agonist"
    ],
    answer: "A",
    why: "Chronic anovulation gives unopposed oestrogen and a raised risk of endometrial hyperplasia and cancer. Cyclic progestin for 10-14 days a month, or a combined oral contraceptive, protects the endometrium; metformin improves ovulation and metabolic profile but does not reliably protect the endometrium, and observation leaves the risk untreated.",
    ref: "International Evidence-based Guideline for the Assessment and Management of PCOS (2023); Endotext: PCOS."
  },
  {
    n: 24,
    section: "male",
    vignette: "A 62-year-old man with primary hypogonadism has been on testosterone cypionate 200 mg every 2 weeks for a year. He feels well. Haematocrit is 55%, blood pressure 138/84 mm Hg, PSA 1.3 ng/mL, and he snores heavily.\n\nWhat is the best next step?",
    options: [
      "Hold testosterone, evaluate for sleep apnoea, and restart at a lower dose once haematocrit falls",
      "Continue the same dose and recheck in 12 months",
      "Increase the dose to improve symptoms",
      "Add phlebotomy and continue unchanged",
      "Switch to a higher-dose transdermal preparation"
    ],
    answer: "A",
    why: "Haematocrit above 54% is the threshold to stop or reduce testosterone. The two commonest causes are an excessive dose and untreated obstructive sleep apnoea, so both are addressed before restarting at a lower dose; continuing the same dose risks thrombosis.",
    ref: "Endocrine Society Testosterone Therapy Guideline; Endotext: Androgen Physiology, Pharmacology, Use and Misuse."
  }
];
