/*
 * Starter question bank.
 *
 * These are ORIGINAL practice items written to demonstrate the app and to
 * exercise every blueprint section. They are NOT ESAP questions.
 *
 * Add your own ESAP/ITE questions with the "Add" form or the bulk importer
 * (More -> Import). See README.md for the paste format.
 *
 * Each item: { section, vignette, options[], answer, why, ref }
 * Use \n inside vignette / why for line breaks (lab blocks, bullets).
 */
window.SEED_QUESTIONS = [
  {
    section: "diabetes",
    vignette:
      "A 58-year-old woman with type 2 diabetes of 9 years' duration attends for review. Her HbA1c is 8.4% (68 mmol/mol).\n\neGFR 46 mL/min/1.73 m2; urine albumin-to-creatinine ratio 45 mg/g; BMI 32 kg/m2; blood pressure 132/80 mm Hg on lisinopril 20 mg daily.\n\nCurrent therapy: metformin 1000 mg twice daily, atorvastatin 40 mg daily. No hypoglycaemia. No history of heart failure or peripheral artery disease. She is not planning pregnancy.",
    options: [
      "Increase metformin to 850 mg three times daily",
      "Add empagliflozin 10 mg daily",
      "Add glipizide 5 mg daily",
      "Add pioglitazone 15 mg daily",
      "Start basal insulin 10 units at bedtime"
    ],
    answer: "B",
    why:
      "HbA1c is above goal with albuminuria and an eGFR that still permits an SGLT-2 inhibitor (initiate down to eGFR 20, continue until dialysis). An SGLT-2 inhibitor lowers HbA1c by roughly 0.5-0.8%, produces modest weight loss and, most importantly, slows progression of albuminuric kidney disease and reduces heart-failure hospitalisation.\n\nMetformin is already at an effective dose. Sulfonylureas cause hypoglycaemia and weight gain and have no cardiorenal benefit. Pioglitazone causes fluid retention and weight gain. Basal insulin does not address cardiorenal risk and is a later step.\n\nMetformin can be continued above eGFR 30; reduce the dose below 30 and stop below 20.",
    ref: "ADA Standards of Care in Diabetes, section 9 (pharmacologic approaches to glycaemic treatment)."
  },
  {
    section: "thyroid",
    vignette:
      "A 31-year-old woman at 9 weeks' gestation in her first pregnancy has no thyroid symptoms and no goitre.\n\nTSH 4.8 mIU/L on two occasions 3 weeks apart; free T4 1.1 ng/dL (within the pregnancy-adjusted reference range); TPO antibodies 220 IU/mL (<9).",
    options: [
      "Repeat TSH at 20 weeks' gestation",
      "Start levothyroxine 50 mcg daily and recheck TSH in 4 weeks",
      "Start levothyroxine 150 mcg daily",
      "Start propylthiouracil 50 mg twice daily",
      "Thyroid ultrasonography"
    ],
    answer: "B",
    why:
      "TSH above the pregnancy-specific upper limit (~4.0 mIU/L) with positive TPO antibodies is an indication to treat. Start a weight-based dose of about 1 mcg/kg (50 mcg is typical) and titrate to a first-trimester target of roughly 2.5-3.0 mIU/L (assay-dependent; many use the local pregnancy range).\n\nRecheck every 4 weeks through mid-gestation: levothyroxine requirements rise by 20-50% because of increased thyroid-binding globulin and placental transfer. Starting at a high dose risks iatrogenic thyrotoxicosis. Antibody positivity predicts progression, so monitoring without treatment is not correct.",
    ref: "ATA guidelines for the diagnosis and management of thyroid disease during pregnancy (2017)."
  },
  {
    section: "bone",
    vignette:
      "A 62-year-old woman has had calcium 11.4 mg/dL (8.2-10.2) confirmed on three occasions over 18 months. She has no fatigue, bone pain, kidney stones, or fractures.\n\nPTH 96 pg/mL (10-65); 25-hydroxyvitamin D 34 ng/mL; creatinine 1.2 mg/dL; eGFR 52 mL/min/1.73 m2; 24-hour urinary calcium 320 mg (100-300).\n\nDXA: femoral neck T-score -1.6, lumbar spine -1.4.",
    options: [
      "Cinacalcet 30 mg twice daily",
      "Refer for parathyroidectomy",
      "Observation with annual serum calcium",
      "Alendronate 70 mg weekly",
      "Restrict dietary calcium and vitamin D"
    ],
    answer: "B",
    why:
      "This is asymptomatic primary hyperparathyroidism that meets surgical criteria: serum calcium more than 1 mg/dL above the upper limit of normal (11.4 vs 10.2), and an eGFR below 60 mL/min/1.73 m2.\n\nThe Fifth International Workshop criteria for surgery are: age <50; calcium >1 mg/dL above ULN; T-score <= -2.5 at any site; eGFR <60; nephrolithiasis or nephrocalcinosis; urinary calcium >400 mg/day; or an inability to monitor reliably. Observation applies only when none is present.\n\nCinacalcet lowers calcium but does not cure disease or reduce bone loss. Bisphosphonates do not correct the hypercalcaemia and are not first-line here. Restricting calcium does not treat primary hyperparathyroidism.",
    ref: "Bilezikian JP et al. Evaluation and management of primary hyperparathyroidism: Fifth International Workshop. J Bone Miner Res 2022."
  },
  {
    section: "adrenal",
    vignette:
      "A 44-year-old man reports 6 months of episodic headaches, palpitations and drenching sweats. Blood pressure 186/112 mm Hg.\n\nPlasma free normetanephrine is more than 3 times the upper limit of normal; metanephrine is normal. CT shows a 4.5-cm right adrenal mass with inconsistent enhancement. Laparoscopic adrenalectomy is scheduled.",
    options: [
      "Doxazosin (or phenoxybenzamine) with a high-salt, high-fluid intake",
      "Propranolol alone",
      "Labetalol alone",
      "Spironolactone",
      "No pre-operative preparation is needed"
    ],
    answer: "A",
    why:
      "Alpha-adrenergic blockade for 10-14 days before surgery, together with generous salt and fluid intake, prevents intra-operative hypertensive crisis and post-resection hypotension from the contracted plasma volume.\n\nBeta-blockade must never precede alpha-blockade: unopposed alpha activity can precipitate a crisis. A beta-blocker is added only after adequate alpha-blockade if reflex tachycardia persists.\n\nLabetalol has proportionally more beta activity and is avoided for preparation. Calcium channel blockers are second-line alternatives. Spironolactone and alpha-blockade are unrelated.",
    ref: "Lenders JWM et al. Pheochromocytoma and paraganglioma: an Endocrine Society clinical practice guideline. J Clin Endocrinol Metab 2014."
  },
  {
    section: "pituitary",
    vignette:
      "A 34-year-old man presents with 6 months of headache, reduced libido and a bitemporal visual field defect.\n\nMRI: 2.4-cm pituitary macroadenoma with suprasellar extension compressing the chiasm.\n\nProlactin 380 ng/mL; free T4 0.62 ng/dL with TSH 1.1 mIU/L; 8 AM cortisol 6 mcg/dL; total testosterone 180 ng/dL.",
    options: [
      "Transsphenoidal surgery",
      "Cabergoline",
      "Pituitary radiotherapy",
      "Levothyroxine alone",
      "Observation with repeat MRI in 12 months"
    ],
    answer: "B",
    why:
      "A dopamine agonist is first-line for a prolactinoma of any size, including invasive macroadenomas: cabergoline normalises prolactin and shrinks tumour volume in the large majority, often restoring the gonadal and thyroid axes and relieving chiasmal compression.\n\nSurgery is reserved for dopamine-agonist resistance or intolerance, apoplexy, or an unclear diagnosis. Radiotherapy is a third-line option. Observation is inappropriate with visual field loss.\n\nTwo safety points: assess and replace cortisol before starting levothyroxine in central hypothyroidism (levothyroxine can precipitate an adrenal crisis), and monitor visual fields during treatment.",
    ref: "Petersenn S et al. Diagnosis and management of prolactin-secreting pituitary adenomas: a Pituitary Society international consensus statement. Nat Rev Endocrinol 2023."
  },
  {
    section: "lipids",
    vignette:
      "A 58-year-old man is reviewed 3 months after a non-ST-elevation myocardial infarction treated with percutaneous coronary intervention. He is adherent to atorvastatin 80 mg daily, tolerates it well, and has no muscle symptoms. ALT is normal.\n\nLDL cholesterol 96 mg/dL; triglycerides 180 mg/dL; HDL cholesterol 44 mg/dL. He takes dual antiplatelet therapy and a beta-blocker.",
    options: [
      "Switch to rosuvastatin 40 mg daily",
      "Add ezetimibe 10 mg daily",
      "Add fenofibrate 145 mg daily",
      "Add extended-release niacin",
      "No change in lipid therapy"
    ],
    answer: "B",
    why:
      "Very-high-risk secondary prevention targets an LDL cholesterol below 55 mg/dL (with at least a 50% reduction); 96 mg/dL is above goal. Adding ezetimibe gives a further 20-25% LDL reduction, is cheap and well tolerated, and improves outcomes when added to a statin after acute coronary syndrome.\n\nIf LDL remains above goal on maximal statin plus ezetimibe, a PCSK9 inhibitor or bempedoic acid is the next step. Fibrates and niacin address triglycerides or HDL, do not lower LDL meaningfully, and have not reduced events when added to statin therapy.",
    ref: "2023 ESC/EAS guidelines for the management of dyslipidaemias; 2022 ACC/AHA cholesterol guideline."
  },
  {
    section: "female",
    vignette:
      "A 29-year-old woman with a BMI of 31 kg/m2 has cycles every 45-60 days, clinical hirsutism and 14 months of unprotected intercourse without conception.\n\nTSH, prolactin and 17-hydroxyprogesterone are normal; her partner's semen analysis is normal; hysterosalpingography is normal.",
    options: [
      "Clomiphene citrate",
      "Letrozole",
      "Metformin alone",
      "Gonadotropins",
      "In vitro fertilisation"
    ],
    answer: "B",
    why:
      "Letrozole is the first-line ovulation-induction agent in polycystic ovary syndrome: it produces higher live-birth rates than clomiphene, with the largest advantage in women with obesity, and fewer multiple pregnancies.\n\nMetformin is an adjunct (most useful with insulin resistance or when ovulation induction is not available), not monotherapy for infertility. Gonadotropins and IVF follow failure of oral agents, and are not first-line with patent tubes and normal semen. Weight loss and lifestyle support should run alongside.",
    ref: "Teede HJ et al. International evidence-based guideline for the assessment and management of PCOS (2023)."
  },
  {
    section: "male",
    vignette:
      "A 61-year-old man reports 2 years of reduced libido and low energy. He has no snoring or daytime somnolence, and BMI is 29 kg/m2.\n\nFasting 8 AM total testosterone 180 and 195 ng/dL on separate mornings; LH 8.5 mIU/mL (1.0-9.0); FSH 12 mIU/mL (1.0-7.0); haematocrit 44%; PSA 1.1 ng/mL; no history of prostate or breast cancer.",
    options: [
      "No treatment; repeat testosterone in 12 months",
      "Start testosterone therapy with monitoring of haematocrit and PSA",
      "Start clomiphene citrate",
      "Start anastrozole",
      "Pituitary MRI"
    ],
    answer: "B",
    why:
      "Two confirmed low morning testosterone values with symptoms, and gonadotropins that are inappropriately high, define primary hypogonadism. Testosterone therapy is indicated and improves libido, sexual function, energy, bone density and anaemia.\n\nMonitor haematocrit at 3-6 months (hold or reduce if it exceeds 54%) and PSA per local guidance. Clomiphene stimulates the axis and does not work in primary hypogonadism. Aromatase inhibitors are not indicated. Elevated gonadotropins argue against pituitary disease, so MRI is not needed.",
    ref: "Bhasin S et al. Testosterone therapy in men with hypogonadism: an Endocrine Society clinical practice guideline; TRAVERSE trial (2023)."
  },
  {
    section: "diabetes",
    vignette:
      "A 23-year-old woman with type 1 diabetes presents with 2 days of vomiting and abdominal pain.\n\nGlucose 486 mg/dL; pH 7.16; bicarbonate 11 mEq/L; beta-hydroxybutyrate 4.8 mmol/L; sodium 132 mEq/L; potassium 3.1 mEq/L; creatinine 0.9 mg/dL.",
    options: [
      "Start an intravenous insulin infusion without potassium replacement",
      "Give intravenous potassium chloride and start the insulin infusion",
      "Give intravenous sodium bicarbonate",
      "Give oral potassium only and observe",
      "Delay insulin until glucose falls below 250 mg/dL"
    ],
    answer: "B",
    why:
      "In diabetic ketoacidosis, total-body potassium is depleted even when the serum value looks normal. Insulin drives potassium into cells and can precipitate a life-threatening arrhythmia, so with potassium below 5.2 mEq/L, replace it (about 20-40 mEq/L of fluid) and give insulin concurrently.\n\nBicarbonate is reserved for pH <6.9. Oral potassium is inadequate in a vomiting patient. Insulin must never be delayed on the basis of the glucose concentration.",
    ref: "Umpierrez GE et al. Hyperglycaemic crises in adults with diabetes: a consensus report. Diabetes Care 2024."
  },
  {
    section: "bone",
    vignette:
      "A 74-year-old woman with a femoral neck T-score of -2.9 has an eGFR of 26 mL/min/1.73 m2. She has had no fragility fracture.\n\nCorrected calcium 9.4 mg/dL; 25-hydroxyvitamin D 38 ng/mL; PTH 48 pg/mL.",
    options: [
      "Zoledronic acid 5 mg intravenously once yearly",
      "Denosumab 60 mg subcutaneously every 6 months",
      "Alendronate 70 mg weekly",
      "Romosozumab monthly",
      "Calcium and vitamin D alone"
    ],
    answer: "B",
    why:
      "With an eGFR below 30-35, bisphosphonates are best avoided: zoledronic acid risks acute kidney injury and alendronate is not recommended in advanced CKD. Denosumab is not renally cleared and can be used, with three caveats: repletion of vitamin D and calcium must come first, calcium must be monitored for severe hypocalcaemia (the 2024 boxed warning), and a planned sequential therapy is needed because stopping denosumab causes rebound vertebral fractures.\n\nRomosozumab carries a cardiovascular caution, and calcium and vitamin D alone do not treat established osteoporosis.",
    ref: "KDIGO 2017 CKD-MBD guideline; Endocrine Society pharmacologic management of osteoporosis (2019)."
  }
];
