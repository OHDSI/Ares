-- seed.sql

DROP SCHEMA IF EXISTS app CASCADE;
CREATE SCHEMA app;

SELECT setseed(0.42);

--
-- DATABASE META DATA
--
CREATE TABLE app.database_meta_data (
    database_id VARCHAR(64) PRIMARY KEY,
    cdm_source_abbreviation VARCHAR(128) NOT NULL,
    cdm_source_name VARCHAR(512),
    cdm_holder VARCHAR(256),
    source_description TEXT,
    source_documentation_reference VARCHAR(512),
    cdm_etl_reference VARCHAR(512),
    source_release_date DATE,
    cdm_release_date DATE,
    cdm_version VARCHAR(32),
    cdm_version_concept_id INT,
    vocabulary_version VARCHAR(64),
    max_obs_period_end_date DATE
);

INSERT INTO app.database_meta_data VALUES
  ('db_alpha', 'Alpha Hospital', 'Alpha Hospital Network EHR Database', 'Alpha Health System', 'Large US-based academic medical center EHR covering inpatient and outpatient encounters since 2005. Includes over 3.2 million unique patients with longitudinal records averaging 8.5 years of follow-up.', 'https://example.com/alpha-docs', 'https://example.com/alpha-etl', '2024-06-15', '2024-07-01', '5.4', 32769, 'v5.0 30-AUG-24', '2024-05-31'),
  ('db_beta',  'Beta Clinic',   'Beta Multi-Specialty Clinic Claims Database', 'Beta Healthcare Group', 'Regional claims database from a multi-specialty clinic network covering approximately 500,000 patients across 14 outpatient facilities in the Midwest US.', 'https://example.com/beta-docs', NULL, '2024-03-20', '2024-04-10', '5.4', 32769, 'v5.0 30-AUG-24', '2024-03-15'),
  ('db_gamma', 'Gamma Network', 'Gamma Research Network Linked EHR-Claims Database', 'Gamma Institute for Health Research', 'Multi-site research network linking EHR and claims data across 12 institutions, covering 2.1 million patients.', NULL, 'https://example.com/gamma-etl', '2024-09-01', '2024-09-20', '5.3', 32769, 'v5.0 15-JUN-24', '2024-08-31'),
  ('db_delta', 'Delta Registry', 'Delta National Disease Registry', 'Delta Foundation for Medical Research', 'National specialty disease registry focused on cardiovascular and metabolic conditions. Contains detailed clinical assessments for 890,000 enrolled patients since 2010.', 'https://example.com/delta-docs', 'https://example.com/delta-etl', '2024-08-01', '2024-08-20', '5.4', 32769, 'v5.0 30-AUG-24', '2024-07-31'),
  ('db_epsilon','Epsilon Claims','Epsilon National Insurance Claims Database', 'Epsilon Insurance Corp', 'Large commercial insurance claims database covering 18 million lives across all 50 US states. Includes medical, pharmacy, and dental claims.', 'https://example.com/epsilon-docs', NULL, '2024-04-15', '2024-05-01', '5.4', 32769, 'v5.0 30-AUG-24', '2024-04-10'),
  ('db_zeta',  'Zeta VA',       'Zeta Veterans Health Administration EHR', 'Zeta VA Medical Center', 'Veterans Health Administration electronic health records from a single large VA medical center covering approximately 340,000 veterans.', NULL, NULL, '2024-01-10', '2024-02-15', '5.3', 32769, 'v5.0 15-JUN-24', '2023-12-31'),
  ('db_eta',   'Eta Pediatric', 'Eta Children''s Hospital Network EHR', 'Eta Pediatric Health Alliance', 'Pediatric-focused EHR database from a network of 6 children''s hospitals. Contains 1.4 million patients aged 0-21.', 'https://example.com/eta-docs', 'https://example.com/eta-etl', '2024-07-20', '2024-08-05', '5.4', 32769, 'v5.0 30-AUG-24', '2024-07-15'),
  ('db_theta', 'Theta GP',      'Theta General Practice Research Database', 'Theta Primary Care Trust', 'UK-based general practice database covering 4.5 million patients registered with 620 GP practices.', 'https://example.com/theta-docs', 'https://example.com/theta-etl', '2024-05-30', '2024-06-15', '5.4', 32769, 'v5.0 30-AUG-24', '2024-05-25'),
  ('db_iota',  'Iota Oncology', 'Iota Comprehensive Cancer Center Registry', 'Iota Cancer Institute', 'Specialty oncology registry from a comprehensive cancer center network. Contains 620,000 patients with detailed staging, treatment, and genomic data.', 'https://example.com/iota-docs', 'https://example.com/iota-etl', '2024-10-01', '2024-10-15', '5.4', 32769, 'v5.0 30-AUG-24', '2024-09-30'),
  ('db_kappa', 'Kappa Medicaid','Kappa State Medicaid Claims Database', 'Kappa State Health Department', 'State Medicaid claims database covering 2.8 million beneficiaries including enrollment, medical, pharmacy, and long-term care claims.', 'https://example.com/kappa-docs', NULL, '2024-07-01', '2024-07-20', '5.4', 32769, 'v5.0 30-AUG-24', '2024-06-30');

--
-- CG TABLES
--
CREATE TABLE app.cg_cohort_definition (
    cohort_definition_id INT PRIMARY KEY,
    cohort_name VARCHAR(256) NOT NULL,
    subset_parent INT,
    subset_definition_id INT,
    json TEXT,
    sql_command TEXT
);

INSERT INTO app.cg_cohort_definition (cohort_definition_id, cohort_name, subset_parent, subset_definition_id) VALUES
  (100,'Type 2 Diabetes',100,NULL),(200,'Hypertension',200,NULL),(300,'Heart Failure',300,NULL),
  (400,'Stroke',400,NULL),(500,'ACE Inhibitor Use',500,NULL),(600,'NSAID Use',600,NULL),
  (700,'GI Bleed',700,NULL),(800,'Renal Failure',800,NULL),(900,'Atrial Fibrillation',900,NULL),
  (1000,'COPD',1000,NULL),(1100,'Asthma',1100,NULL),(1200,'Rheumatoid Arthritis',1200,NULL),
  (1300,'Osteoarthritis',1300,NULL),(1400,'Major Depressive Disorder',1400,NULL),(1500,'Anxiety Disorder',1500,NULL),
  (1600,'Statin Use',1600,NULL),(1700,'Metformin Use',1700,NULL),(1800,'PPI Use',1800,NULL),
  (1900,'Beta Blocker Use',1900,NULL),(2000,'Warfarin Use',2000,NULL),(2100,'Pneumonia',2100,NULL),
  (2200,'Sepsis',2200,NULL),(2300,'Venous Thromboembolism',2300,NULL),(2400,'Acute Myocardial Infarction',2400,NULL),
  (2500,'Hip Fracture',2500,NULL),(2600,'Opioid Use',2600,NULL),(2700,'Benzodiazepine Use',2700,NULL),
  (2800,'Falls',2800,NULL),(2900,'Dementia',2900,NULL),(3000,'Chronic Kidney Disease',3000,NULL),
  (101,'Type 2 Diabetes Female',100,1),(102,'Type 2 Diabetes Over 65',100,2),
  (201,'Hypertension Over 65',200,2),(202,'Hypertension Male',200,3),(301,'Heart Failure Over 75',300,4),
  (501,'ACE Inhibitor Use Female',500,1),(601,'NSAID Use Over 65',600,2),
  (901,'Atrial Fibrillation Over 65',900,2),(1001,'COPD Over 55',1000,5),
  (1201,'Rheumatoid Arthritis Female',1200,1),(1401,'MDD Female',1400,1),
  (1601,'Statin Use Over 40',1600,6),(1701,'Metformin Use Type 2 DM',1700,7),
  (1901,'Beta Blocker HF Patients',1900,8),(2001,'Warfarin Use AF Patients',2000,9),
  (2401,'AMI Over 65',2400,2),(2601,'Opioid Use Chronic',2600,10),
  (2701,'Benzodiazepine Use Over 65',2700,2),(2901,'Dementia Over 75',2900,4),(3001,'CKD Stage 3+',3000,11);

UPDATE app.cg_cohort_definition SET
  json = $json${
  "ConceptSets": [
    {
      "id": 0,
      "name": "Type 2 Diabetes Mellitus",
      "expression": {
        "items": [
          {
            "concept": {
              "CONCEPT_ID": 201826, "CONCEPT_NAME": "Type 2 diabetes mellitus",
              "STANDARD_CONCEPT": "S", "INVALID_REASON": "V", "CONCEPT_CODE": "44054006",
              "DOMAIN_ID": "Condition", "VOCABULARY_ID": "SNOMED", "CONCEPT_CLASS_ID": "Clinical Finding"
            },
            "isExcluded": false, "includeDescendants": true, "includeMapped": false
          }
        ]
      }
    },
    {
      "id": 1,
      "name": "HbA1c Measurement",
      "expression": {
        "items": [
          {
            "concept": {
              "CONCEPT_ID": 3004410, "CONCEPT_NAME": "Hemoglobin A1c/Hemoglobin.total in Blood",
              "STANDARD_CONCEPT": "S", "INVALID_REASON": "V", "CONCEPT_CODE": "4548-4",
              "DOMAIN_ID": "Measurement", "VOCABULARY_ID": "LOINC", "CONCEPT_CLASS_ID": "Lab Test"
            },
            "isExcluded": false, "includeDescendants": false, "includeMapped": false
          }
        ]
      }
    },
    {
      "id": 2,
      "name": "Antidiabetic Medications",
      "expression": {
        "items": [
          {
            "concept": {
              "CONCEPT_ID": 21600712, "CONCEPT_NAME": "DRUGS USED IN DIABETES",
              "STANDARD_CONCEPT": "C", "INVALID_REASON": "V", "CONCEPT_CODE": "A10",
              "DOMAIN_ID": "Drug", "VOCABULARY_ID": "ATC", "CONCEPT_CLASS_ID": "ATC 2nd"
            },
            "isExcluded": false, "includeDescendants": true, "includeMapped": false
          }
        ]
      }
    }
  ],
  "PrimaryCriteria": {
    "CriteriaList": [
      {
        "ConditionOccurrence": {
          "CodesetId": 0,
          "ConditionStatus": {
            "CONCEPT_ID": 32902, "CONCEPT_NAME": "Primary Diagnosis",
            "STANDARD_CONCEPT": "S", "DOMAIN_ID": "Type Concept"
          }
        }
      }
    ],
    "ObservationWindow": { "PriorDays": 365, "PostDays": 0 },
    "PrimaryCriteriaLimit": { "Type": "First" }
  },
  "QualifiedLimit": { "Type": "First" },
  "ExpressionLimit": { "Type": "All" },
  "InclusionRules": [
    {
      "name": "Age at index >= 18",
      "expression": {
        "Type": "ALL",
        "CriteriaList": [],
        "DemographicCriteriaList": [ { "Age": { "Value": 18, "Op": "gte" } } ],
        "Groups": []
      }
    },
    {
      "name": "Has qualifying T2DM diagnosis (>=2 codes within 365 days)",
      "expression": {
        "Type": "ALL",
        "CriteriaList": [
          {
            "Criteria": { "ConditionOccurrence": { "CodesetId": 0 } },
            "StartWindow": { "Start": { "Days": 365, "Coeff": -1 }, "End": { "Days": 1, "Coeff": -1 } },
            "Occurrence": { "Type": 2, "Count": 2 }
          }
        ],
        "DemographicCriteriaList": [], "Groups": []
      }
    }
  ],
  "CollapseSettings": { "CollapseType": "ERA", "EraPad": 0 },
  "CensorWindow": {},
  "cdmVersionRange": ">=5.0.0"
}$json$,
  sql_command = $sql$
-- Cohort: Type 2 Diabetes (ID 100) - stored as text for display only
-- Generated by CirceR / ATLAS
SELECT 1;
$sql$
WHERE cohort_definition_id = 100;

CREATE TABLE app.cg_cohort_subset_definition (
    subset_definition_id INT PRIMARY KEY,
    json TEXT
);

INSERT INTO app.cg_cohort_subset_definition VALUES
  (1,'{"subsetOperators":[{"subsetType":"DemographicSubsetOperator","gender":"Female"}]}'),
  (2,'{"subsetOperators":[{"subsetType":"DemographicSubsetOperator","ageMin":65}]}'),
  (3,'{"subsetOperators":[{"subsetType":"DemographicSubsetOperator","gender":"Male"}]}'),
  (4,'{"subsetOperators":[{"subsetType":"DemographicSubsetOperator","ageMin":75}]}'),
  (5,'{"subsetOperators":[{"subsetType":"DemographicSubsetOperator","ageMin":55}]}'),
  (6,'{"subsetOperators":[{"subsetType":"DemographicSubsetOperator","ageMin":40}]}'),
  (7,'{"subsetOperators":[{"subsetType":"CohortSubsetOperator","cohortIds":[100]}]}'),
  (8,'{"subsetOperators":[{"subsetType":"CohortSubsetOperator","cohortIds":[300]}]}'),
  (9,'{"subsetOperators":[{"subsetType":"CohortSubsetOperator","cohortIds":[900]}]}'),
  (10,'{"subsetOperators":[{"subsetType":"DurationSubsetOperator","minDays":90}]}'),
  (11,'{"subsetOperators":[{"subsetType":"CohortSubsetOperator","cohortIds":[3000],"stage":"3+"}]}');

CREATE TABLE app.cg_cohort_count (
    cohort_id INT NOT NULL,
    database_id VARCHAR(64) NOT NULL,
    cohort_subjects INT NOT NULL,
    cohort_entries INT NOT NULL,
    PRIMARY KEY (cohort_id, database_id)
);

INSERT INTO app.cg_cohort_count
SELECT cd.cohort_definition_id, d.database_id,
       (100 + (cd.cohort_definition_id * 7 + ascii(left(d.database_id,1))) % 900),
       (150 + (cd.cohort_definition_id * 11 + ascii(left(d.database_id,1))) % 1200)
FROM app.cg_cohort_definition cd
CROSS JOIN app.database_meta_data d;

CREATE TABLE app.cg_cohort_generation (
    cohort_definition_id INT NOT NULL,
    database_id VARCHAR(64) NOT NULL,
    generation_status VARCHAR(64),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    PRIMARY KEY (cohort_definition_id, database_id)
);

INSERT INTO app.cg_cohort_generation VALUES
  (100,'db_alpha','COMPLETE','2024-01-10 08:00:00','2024-01-10 08:12:34'),
  (100,'db_beta', 'COMPLETE','2024-01-10 08:00:00','2024-01-10 08:09:17'),
  (100,'db_gamma','COMPLETE','2024-01-10 08:00:00','2024-01-10 08:21:05'),
  (100,'db_delta','RUNNING', '2024-01-10 08:00:00',NULL),
  (200,'db_alpha','COMPLETE','2024-01-11 09:00:00','2024-01-11 09:05:22'),
  (200,'db_beta', 'FAILED',  '2024-01-11 09:00:00','2024-01-11 09:00:45'),
  (300,'db_alpha','COMPLETE','2024-01-12 10:00:00','2024-01-12 10:03:11'),
  (300,'db_beta', 'COMPLETE','2024-01-12 10:00:00','2024-01-12 10:04:58');

CREATE TABLE app.cg_cohort_inclusion (
    cohort_definition_id INT NOT NULL,
    rule_sequence INT NOT NULL,
    name VARCHAR(256) NOT NULL,
    PRIMARY KEY (cohort_definition_id, rule_sequence)
);

INSERT INTO app.cg_cohort_inclusion VALUES
  (100,0,'Age at index >= 18'),
  (100,1,'Has qualifying T2DM diagnosis (>=2 codes within 365 days)'),
  (100,2,'Prior HbA1c >= 6.5% within 180 days'),
  (100,3,'Initiated antidiabetic medication within 90 days post-index'),
  (200,0,'Age at index >= 18'),
  (200,1,'Active insurance coverage >= 365 days prior'),
  (200,2,'Essential hypertension diagnosis (>=2 codes in 365 days)'),
  (200,3,'No prior cardiovascular event'),
  (200,4,'Initiated antihypertensive medication'),
  (300,0,'Heart failure diagnosis confirmed (>=2 encounters)'),
  (300,1,'Prior inpatient or ER hospitalization'),
  (300,2,'Cardiology-related procedure within 365 days');

CREATE TABLE app.cg_cohort_inc_result (
    cohort_definition_id INT NOT NULL,
    database_id VARCHAR(64) NOT NULL,
    mode_id INT NOT NULL,
    inclusion_rule_mask INT NOT NULL,
    person_count INT NOT NULL
);

-- Cohort 100: 4 rules (masks 0-15), Cohort 200: 5 rules (masks 0-31), Cohort 300: 3 rules (masks 0-7)
INSERT INTO app.cg_cohort_inc_result
SELECT c.cohort_id, d.database_id, m.mode_id, g.mask,
  CASE WHEN g.mask = (1 << c.num_rules) - 1
    THEN (800  + floor(random() * 1500))::int
    ELSE (20   + floor(random() * 480))::int
  END
FROM (VALUES (100,4),(200,5),(300,3)) AS c(cohort_id, num_rules)
CROSS JOIN (VALUES ('db_alpha'),('db_beta'),('db_gamma')) AS d(database_id)
CROSS JOIN (VALUES (0),(1)) AS m(mode_id)
CROSS JOIN generate_series(0, 31) AS g(mask)
WHERE g.mask < (1 << c.num_rules)
  AND NOT (c.cohort_id = 200 AND d.database_id = 'db_gamma');

--
-- C_ SETTINGS
--
CREATE TABLE app.c_settings (
    setting_id INT NOT NULL,
    database_id VARCHAR(64) NOT NULL,
    min_prior_observation INT DEFAULT 365,
    outcome_washout_days INT DEFAULT 30,
    case_post_outcome_duration INT DEFAULT 30,
    case_pre_target_duration INT DEFAULT 365,
    risk_window_start INT DEFAULT 1,
    start_anchor VARCHAR(32) DEFAULT 'cohort start',
    risk_window_end INT DEFAULT 365,
    end_anchor VARCHAR(32) DEFAULT 'cohort start',
    PRIMARY KEY (setting_id, database_id)
);

INSERT INTO app.c_settings
SELECT s.sid, d.database_id, s.min_po, s.ow, s.cpod, s.cptd, s.rws, s.sa, s.rwe, s.ea
FROM (VALUES
  (1, 365, 30, 30, 365, 1, 'cohort start', 365,  'cohort start'),
  (2, 180, 60, 30, 365, 0, 'cohort start', 730,  'cohort end'),
  (3, 365, 30, 30, 365, 1, 'cohort start', 365,  'cohort start'),
  (4, 365, 90, 60, 730, 1, 'cohort start', 1095, 'cohort start'),
  (5, 180, 30, 30, 365, 0, 'cohort start', 365,  'cohort end'),
  (6, 365, 30, 30, 365, 1, 'cohort start', 730,  'cohort start')
) AS s(sid, min_po, ow, cpod, cptd, rws, sa, rwe, ea)
CROSS JOIN app.database_meta_data d
WHERE (s.sid = 1 AND d.database_id IN ('db_alpha','db_beta','db_gamma','db_delta','db_epsilon','db_zeta'))
   OR (s.sid = 2 AND d.database_id IN ('db_alpha','db_beta','db_gamma','db_delta'))
   OR (s.sid = 3 AND d.database_id IN ('db_alpha','db_beta','db_gamma','db_delta','db_epsilon'))
   OR (s.sid = 4 AND d.database_id IN ('db_alpha','db_beta','db_gamma'))
   OR (s.sid = 5 AND d.database_id IN ('db_alpha','db_beta','db_delta','db_epsilon'))
   OR (s.sid = 6 AND d.database_id IN ('db_alpha','db_beta','db_gamma','db_delta','db_epsilon','db_zeta','db_eta','db_theta'));

--
-- C_ COHORT DETAILS
--
CREATE TABLE app.c_cohort_details (
    setting_id INT NOT NULL,
    database_id VARCHAR(64) NOT NULL,
    target_cohort_id INT NOT NULL,
    outcome_cohort_id INT NOT NULL,
    cohort_type VARCHAR(32) NOT NULL
);

-- Same master pair list as c_cohort_counts so every pair with has_risk_factor_data=true
-- also has matching c_cohort_details rows (required by the INNER JOIN in getCaseBinaryFeatures).
INSERT INTO app.c_cohort_details
SELECT 1, d.database_id, p.tid, p.oid, t.cohort_type
FROM (VALUES ('db_alpha'),('db_beta'),('db_gamma'),('db_delta'),('db_epsilon'),('db_zeta')) AS d(database_id)
CROSS JOIN (VALUES
  (100,300),(100,400),(100,700),(100,800),
  (200,300),(200,400),(200,700),(200,2400),
  (300,700),(300,800),(500,700),(600,700),
  (900,300),(900,400),(1000,300),(1000,2100),
  (1200,700),(1400,2200),(1600,800),(1700,800),
  (1800,700),(1900,300),(2000,400),(2000,700),
  (2600,700),(2600,800),(2700,2800),(2900,2500)
) AS p(tid, oid)
CROSS JOIN (VALUES ('Cases'),('Target'),('Exclude'),('CasesBefore'),('CasesBetween'),('CasesAfter')) AS t(cohort_type);

--
-- C_ COVARIATE REF
--
CREATE TABLE app.c_covariate_ref (
    covariate_id BIGINT NOT NULL,
    covariate_name VARCHAR(512) NOT NULL,
    analysis_id INT NOT NULL,
    concept_id INT DEFAULT 0,
    setting_id INT NOT NULL,
    database_id VARCHAR(64) NOT NULL
);

INSERT INTO app.c_covariate_ref
SELECT c.covariate_id, c.covariate_name, c.analysis_id, c.concept_id, 1, d.database_id
FROM (VALUES
  (1001::bigint,'Age group: 18-29',3,0),
  (1002::bigint,'Age group: 30-39',3,0),
  (1005::bigint,'Age group: 60-69',3,0),
  (1006::bigint,'Age group: 70-79',3,0),
  (1007::bigint,'Age group: 80+',3,0),
  (1011::bigint,'Gender: Male',3,8507),
  (1020::bigint,'Race: White',4,8527),
  (1021::bigint,'Race: Black',4,8516),
  (1022::bigint,'Race: Asian',4,8515),
  (1100::bigint,'Condition: Diabetes',109,201820),
  (1102::bigint,'Condition: Hyperlipidemia',109,432867),
  (1103::bigint,'Condition: Obesity',109,433736),
  (1104::bigint,'Condition: CKD',109,46271022),
  (1105::bigint,'Condition: COPD',109,255573),
  (1106::bigint,'Condition: Depression',109,440383),
  (1107::bigint,'Condition: Anxiety',109,441542),
  (1108::bigint,'Condition: Coronary Artery Disease',109,317576),
  (1109::bigint,'Condition: Atrial Fibrillation',109,313217),
  (1110::bigint,'Condition: Osteoarthritis',109,80180),
  (1111::bigint,'Condition: Cancer',109,443392),
  (1200::bigint,'Drug: Metformin',217,1503297),
  (1201::bigint,'Drug: Lisinopril',217,1308216),
  (1202::bigint,'Drug: Atorvastatin',217,1545958),
  (1204::bigint,'Drug: Omeprazole',217,948078),
  (1205::bigint,'Drug: Aspirin',217,1112807),
  (1206::bigint,'Drug: Metoprolol',217,1307046),
  (1207::bigint,'Drug: Ibuprofen',217,1177480),
  (1208::bigint,'Drug: Warfarin',217,1310149),
  (1209::bigint,'Drug: Insulin',217,1567198)
) AS c(covariate_id, covariate_name, analysis_id, concept_id)
CROSS JOIN (VALUES ('db_alpha'),('db_beta'),('db_gamma'),('db_delta'),('db_epsilon'),('db_zeta')) AS d(database_id);

-- Continuous covariate refs
INSERT INTO app.c_covariate_ref
SELECT c.covariate_id, c.covariate_name, c.analysis_id, 0, 1, d.database_id
FROM (VALUES
  (1300::bigint,'Charlson Index',926),
  (1301::bigint,'Number of prior conditions',927),
  (1302::bigint,'Body Mass Index',926),
  (1303::bigint,'Systolic Blood Pressure',926),
  (1304::bigint,'Diastolic Blood Pressure',926),
  (1305::bigint,'HbA1c',926),
  (1306::bigint,'eGFR',926),
  (1307::bigint,'LDL Cholesterol',926)
) AS c(covariate_id, covariate_name, analysis_id)
CROSS JOIN (VALUES ('db_alpha'),('db_beta'),('db_gamma'),('db_delta'),('db_epsilon'),('db_zeta')) AS d(database_id);

--
-- C_ COVARIATES (binary)
--
CREATE TABLE app.c_covariates (
    setting_id INT NOT NULL,
    database_id VARCHAR(64) NOT NULL,
    covariate_id BIGINT NOT NULL,
    target_cohort_id INT NOT NULL,
    outcome_cohort_id INT DEFAULT 0,
    cohort_type VARCHAR(32) NOT NULL,
    sum_value NUMERIC DEFAULT 0,
    average_value NUMERIC DEFAULT 0
);

INSERT INTO app.c_covariates
SELECT 1, d.database_id, r.covariate_id, p.tid, p.oid, t.cohort_type,
       (floor(random() * 300 + 1))::int,
       round(random()::numeric, 2)
FROM (SELECT DISTINCT covariate_id FROM app.c_covariate_ref WHERE setting_id = 1 AND analysis_id != 926 AND analysis_id != 927) r
CROSS JOIN (VALUES ('db_alpha'),('db_beta'),('db_gamma'),('db_delta'),('db_epsilon'),('db_zeta')) AS d(database_id)
CROSS JOIN (VALUES
  (100,300),(100,400),(100,700),(100,800),
  (200,300),(200,400),(200,700),(200,2400),
  (300,700),(300,800),(500,700),(600,700),
  (900,300),(900,400),(1000,300),(1000,2100),
  (1200,700),(1400,2200),(1600,800),(1700,800),
  (1800,700),(1900,300),(2000,400),(2000,700),
  (2600,700),(2600,800),(2700,2800),(2900,2500)
) AS p(tid, oid)
CROSS JOIN (VALUES ('Target'),('Cases'),('CasesBefore'),('CasesBetween'),('CasesAfter')) AS t(cohort_type);

--
-- C_ COVARIATES CONTINUOUS
--
CREATE TABLE app.c_covariates_continuous (
    setting_id INT NOT NULL,
    database_id VARCHAR(64) NOT NULL,
    covariate_id BIGINT NOT NULL,
    target_cohort_id INT NOT NULL,
    outcome_cohort_id INT DEFAULT 0,
    cohort_type VARCHAR(32) NOT NULL,
    count_value INT DEFAULT 0,
    min_value NUMERIC DEFAULT 0,
    max_value NUMERIC DEFAULT 0,
    average_value NUMERIC DEFAULT 0,
    standard_deviation NUMERIC DEFAULT 0,
    median_value NUMERIC DEFAULT 0,
    p_10_value NUMERIC DEFAULT 0,
    p_25_value NUMERIC DEFAULT 0,
    p_75_value NUMERIC DEFAULT 0,
    p_90_value NUMERIC DEFAULT 0
);

INSERT INTO app.c_covariates_continuous
SELECT
  1, d.database_id, c.covariate_id, p.tid, p.oid, t.cohort_type,
  (c.avg_v * (4 + random() * 2))::int,
  c.min_v, c.max_v,
  round((c.avg_v + (random() - 0.5) * c.sd_v)::numeric, 1),
  round((c.sd_v  * (0.8 + random() * 0.4))::numeric, 1),
  round((c.avg_v + (random() - 0.5) * c.sd_v * 0.7)::numeric, 1),
  round((c.min_v + (c.avg_v - c.min_v) * 0.25)::numeric, 1),
  round((c.min_v + (c.avg_v - c.min_v) * 0.55)::numeric, 1),
  round((c.avg_v + (c.max_v - c.avg_v) * 0.35)::numeric, 1),
  round((c.avg_v + (c.max_v - c.avg_v) * 0.65)::numeric, 1)
FROM (VALUES
  (1300::bigint,  0,  15,   3.0,  1.2),
  (1301::bigint,  0,  30,   5.0,  3.0),
  (1302::bigint, 15,  60,  28.0,  6.0),
  (1303::bigint, 80, 220, 130.0, 20.0),
  (1304::bigint, 50, 130,  79.0, 12.0),
  (1305::bigint,  4,  14,   7.5,  2.0),
  (1306::bigint,  5, 150,  72.0, 25.0),
  (1307::bigint, 20, 300, 110.0, 38.0)
) AS c(covariate_id, min_v, max_v, avg_v, sd_v)
CROSS JOIN (VALUES ('db_alpha'),('db_beta'),('db_gamma'),('db_delta'),('db_epsilon'),('db_zeta')) AS d(database_id)
CROSS JOIN (VALUES
  (100,300),(100,400),(100,700),(100,800),
  (200,300),(200,400),(200,700),(200,2400),
  (300,700),(300,800),(500,700),(600,700),
  (900,300),(900,400),(1000,300),(1000,2100),
  (1200,700),(1400,2200),(1600,800),(1700,800),
  (1800,700),(1900,300),(2000,400),(2000,700),
  (2600,700),(2600,800),(2700,2800),(2900,2500)
) AS p(tid, oid)
CROSS JOIN (VALUES ('Target'),('Cases'),('CasesBefore'),('CasesBetween'),('CasesAfter')) AS t(cohort_type);

--
-- C_ COHORT COUNTS
--
CREATE TABLE app.c_cohort_counts (
    setting_id INT,
    database_id VARCHAR(64) NOT NULL,
    target_cohort_id INT NOT NULL,
    outcome_cohort_id INT DEFAULT 0,
    cohort_type VARCHAR(32) NOT NULL,
    row_count INT DEFAULT 0,
    person_count INT DEFAULT 0,
    min_prior_observation INT DEFAULT 365,
    outcome_washout_days INT DEFAULT 30,
    risk_window_start INT DEFAULT 1,
    risk_window_end INT DEFAULT 365,
    start_anchor VARCHAR(32) DEFAULT 'cohort start',
    end_anchor VARCHAR(32) DEFAULT 'cohort start'
);

INSERT INTO app.c_cohort_counts
SELECT NULL, s.database_id, p.tid, p.oid, t.cohort_type,
       (floor(random() * 500 + 50))::int,
       (floor(random() * 500 + 50))::int,
       s.min_prior_observation, s.outcome_washout_days,
       s.risk_window_start, s.risk_window_end,
       s.start_anchor, s.end_anchor
FROM app.c_settings s
CROSS JOIN (VALUES
  (100,300),(100,400),(100,700),(100,800),
  (200,300),(200,400),(200,700),(200,2400),
  (300,700),(300,800),(500,700),(600,700),
  (900,300),(900,400),(1000,300),(1000,2100),
  (1200,700),(1400,2200),(1600,800),(1700,800),
  (1800,700),(1900,300),(2000,400),(2000,700),
  (2600,700),(2600,800),(2700,2800),(2900,2500)
) AS p(tid, oid)
CROSS JOIN (VALUES ('Target'),('Cases')) AS t(cohort_type);

--
-- C_ DECHALLENGE / RECHALLENGE
--
CREATE TABLE app.c_dechallenge_rechallenge (
    database_id VARCHAR(64) NOT NULL,
    target_cohort_definition_id INT NOT NULL,
    outcome_cohort_definition_id INT NOT NULL,
    dechallenge_stop_interval INT DEFAULT 30,
    dechallenge_evaluation_window INT DEFAULT 30,
    num_exposure_eras INT DEFAULT 0,
    num_persons_exposed INT DEFAULT 0,
    num_cases INT DEFAULT 0,
    dechallenge_attempt INT DEFAULT 0,
    dechallenge_fail INT DEFAULT 0,
    dechallenge_success INT DEFAULT 0,
    rechallenge_attempt INT DEFAULT 0,
    rechallenge_fail INT DEFAULT 0,
    rechallenge_success INT DEFAULT 0,
    pct_dechallenge_attempt NUMERIC DEFAULT 0,
    pct_dechallenge_fail NUMERIC DEFAULT 0,
    pct_dechallenge_success NUMERIC DEFAULT 0,
    pct_rechallenge_attempt NUMERIC DEFAULT 0,
    pct_rechallenge_fail NUMERIC DEFAULT 0,
    pct_rechallenge_success NUMERIC DEFAULT 0
);

INSERT INTO app.c_dechallenge_rechallenge VALUES
  ('db_alpha',500,700,30,30,1190,473,96,70,24,46,15,3,12,0.73,0.34,0.66,0.33,0.20,0.80),
  ('db_beta', 500,700,30,30,1253,793,221,196,35,161,66,15,51,0.89,0.18,0.82,0.41,0.23,0.77),
  ('db_gamma',500,700,30,30, 984,394,228,180,50,130,32,8,24,0.79,0.28,0.72,0.25,0.25,0.75),
  ('db_delta',500,700,30,30, 575,825,87,66,20,46,14,4,10,0.76,0.30,0.70,0.30,0.29,0.71),
  ('db_epsilon',500,700,30,30,1083,529,102,71,17,54,13,4,9,0.70,0.24,0.76,0.24,0.31,0.69),
  ('db_alpha',600,700,30,30, 920,761,85,64,14,50,15,4,11,0.75,0.22,0.78,0.30,0.27,0.73),
  ('db_beta', 600,700,30,30,1061,636,100,82,12,70,29,7,22,0.82,0.15,0.85,0.41,0.24,0.76),
  ('db_gamma',600,700,30,30, 685,634,125,106,29,77,19,5,14,0.85,0.27,0.73,0.25,0.26,0.74),
  ('db_delta',600,700,30,30,1343,772,243,223,53,170,42,13,29,0.92,0.24,0.76,0.25,0.31,0.69),
  ('db_epsilon',600,700,30,30,1135,733,93,71,14,57,24,4,20,0.76,0.20,0.80,0.42,0.17,0.83),
  ('db_alpha',1800,700,30,30, 606,381,143,102,24,78,22,5,17,0.71,0.24,0.76,0.28,0.23,0.77),
  ('db_beta', 1800,700,30,30,1445,701,92,80,18,62,17,5,12,0.87,0.23,0.78,0.27,0.29,0.71),
  ('db_gamma',1800,700,30,30,1254,670,155,122,35,87,27,4,23,0.79,0.29,0.71,0.31,0.15,0.85),
  ('db_delta',1800,700,30,30,1338,758,76,67,15,52,18,3,15,0.88,0.22,0.78,0.35,0.17,0.83),
  ('db_epsilon',1800,700,30,30,673,792,233,200,66,134,33,9,24,0.86,0.33,0.67,0.25,0.27,0.73),
  ('db_alpha',2000,700,30,30,1198,757,221,165,41,124,42,7,35,0.75,0.25,0.75,0.34,0.17,0.83),
  ('db_beta', 2000,700,30,30, 861,485,101,87,20,67,20,5,15,0.86,0.23,0.77,0.30,0.25,0.75),
  ('db_gamma',2000,700,30,30, 998,726,245,191,45,146,36,5,31,0.78,0.24,0.76,0.25,0.14,0.86),
  ('db_delta',2000,700,30,30, 753,438,233,209,54,155,54,15,39,0.90,0.26,0.74,0.35,0.28,0.72),
  ('db_epsilon',2000,700,30,30,624,743,131,98,22,76,34,9,25,0.75,0.22,0.78,0.45,0.26,0.74),
  ('db_alpha',2600,700,30,30, 701,338,250,175,59,116,40,8,32,0.70,0.34,0.66,0.34,0.20,0.80),
  ('db_beta', 2600,700,30,30, 734,764,194,176,31,145,43,10,33,0.91,0.18,0.82,0.30,0.23,0.77),
  ('db_gamma',2600,700,30,30,1247,542,96,89,14,75,29,8,21,0.93,0.16,0.84,0.39,0.28,0.72),
  ('db_delta',2600,700,30,30, 752,790,204,187,43,144,36,10,26,0.92,0.23,0.77,0.25,0.28,0.72),
  ('db_epsilon',2600,700,30,30,1157,814,228,198,33,165,64,20,44,0.87,0.17,0.83,0.39,0.31,0.69),
  ('db_alpha',1900,300,30,30, 682,497,209,150,28,122,48,10,38,0.72,0.19,0.81,0.39,0.21,0.79),
  ('db_beta', 1900,300,30,30, 931,802,61,47,14,33,14,2,12,0.77,0.30,0.70,0.42,0.14,0.86),
  ('db_gamma',1900,300,30,30, 887,835,136,114,31,83,31,8,23,0.84,0.27,0.73,0.37,0.26,0.74),
  ('db_delta',1900,300,30,30, 982,655,123,111,25,86,32,9,23,0.90,0.23,0.77,0.37,0.28,0.72),
  ('db_epsilon',1900,300,30,30,524,819,132,109,19,90,37,8,29,0.83,0.17,0.83,0.41,0.22,0.78);

CREATE TABLE app.c_rechallenge_fail_case_series (
    database_id VARCHAR(64) NOT NULL,
    target_cohort_definition_id INT NOT NULL,
    outcome_cohort_definition_id INT NOT NULL,
    dechallenge_stop_interval INT DEFAULT 30,
    dechallenge_evaluation_window INT DEFAULT 30,
    person_key INT,
    subject_id INT,
    dechallenge_exposure_number INT DEFAULT 1,
    dechallenge_exposure_start_date_offset INT DEFAULT 0,
    dechallenge_exposure_end_date_offset INT DEFAULT 0,
    dechallenge_outcome_number INT DEFAULT 1,
    dechallenge_outcome_start_date_offset INT DEFAULT 0,
    rechallenge_exposure_number INT DEFAULT 0,
    rechallenge_exposure_start_date_offset INT DEFAULT 0,
    rechallenge_exposure_end_date_offset INT DEFAULT 0,
    rechallenge_outcome_number INT DEFAULT 0,
    rechallenge_outcome_start_date_offset INT DEFAULT 0
);

INSERT INTO app.c_rechallenge_fail_case_series
SELECT
  database_id, tid, oid, 30, 30,
  rn::int,
  (db_num * 1000 + i)::int,
  1, 0, exp_end::int, 1, out_start::int,
  rech_flag::int,
  CASE WHEN rech_flag = 1 THEN (200 + floor(random() * 80))::int ELSE 0 END,
  CASE WHEN rech_flag = 1 THEN (310 + floor(random() * 100))::int ELSE 0 END,
  rech_flag::int,
  CASE WHEN rech_flag = 1 THEN (260 + floor(random() * 100))::int ELSE 0 END
FROM (
  SELECT
    d.database_id, e.tid, e.oid, d.db_num, n.i,
    row_number() OVER () AS rn,
    120 + floor(random() * 80)   AS exp_end,
    90  + floor(random() * 60)   AS out_start,
    CASE WHEN random() > 0.3 THEN 1 ELSE 0 END AS rech_flag
  FROM (VALUES (500,700),(600,700),(1800,700),(2000,700),(2600,700),(1900,300)) AS e(tid,oid)
  CROSS JOIN (VALUES ('db_alpha',1),('db_beta',2),('db_gamma',3)) AS d(database_id,db_num)
  CROSS JOIN generate_series(1,6) AS n(i)
) sub;

--
-- C_ TIME TO EVENT
--
CREATE TABLE app.c_time_to_event (
    database_id VARCHAR(64) NOT NULL,
    target_cohort_definition_id INT NOT NULL,
    outcome_cohort_definition_id INT NOT NULL,
    outcome_type VARCHAR(64),
    target_outcome_type VARCHAR(64),
    time_to_event INT,
    num_events INT,
    time_scale VARCHAR(32) DEFAULT 'per 1000 person years'
);

INSERT INTO app.c_time_to_event
SELECT d.database_id, t.tid, o.oid, ot.outcome_type, tot.target_outcome_type,
       (g.v * 30 - 180),
       GREATEST(1, (5 + g.v * 3
           + (ascii(left(d.database_id,4)) % 7)
           - (abs(g.v * 30 - 180) / 30)
           + (t.tid % 5) + (o.oid % 3))),
       'per 1000 person years'
FROM app.database_meta_data d
CROSS JOIN (VALUES (100),(200),(300),(500),(600),(900),(1000),(1200),(1600),(1800),(2000),(2600)) AS t(tid)
CROSS JOIN (VALUES (300),(400),(700),(800),(2100),(2200),(2400),(2500),(2800)) AS o(oid)
CROSS JOIN (VALUES ('first'),('all')) AS ot(outcome_type)
CROSS JOIN (VALUES ('before'),('during'),('after')) AS tot(target_outcome_type)
CROSS JOIN (VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12)) AS g(v);

DROP TABLE IF EXISTS app.c_time_to_event_targets;
CREATE TABLE app.c_time_to_event_targets AS
SELECT DISTINCT target_cohort_definition_id FROM app.c_time_to_event;

--
-- CI TABLES
--
CREATE TABLE app.ci_target_def (ref_id INT NOT NULL, target_cohort_definition_id INT NOT NULL);
INSERT INTO app.ci_target_def VALUES
  (1,100),(1,200),(1,300),(2,100),(2,500),(3,200),(3,900),(4,1000),(4,1200),(5,2600),(5,2700);

CREATE TABLE app.ci_outcome_def (
    ref_id INT NOT NULL, outcome_id INT NOT NULL,
    outcome_cohort_definition_id INT NOT NULL, clean_window INT DEFAULT 365
);
INSERT INTO app.ci_outcome_def VALUES
  (1,1,300,365),(1,2,400,365),(1,3,700,180),(1,4,800,365),
  (2,1,300,365),(2,2,700,180),
  (3,1,400,365),(3,2,2400,365),(3,3,300,365),
  (4,1,2100,180),(4,2,2200,365),(4,3,700,180),
  (5,1,800,365),(5,2,2800,180),(5,3,2200,365);

CREATE TABLE app.ci_tar_def (
    ref_id INT NOT NULL, tar_id INT NOT NULL,
    tar_start_with VARCHAR(32) DEFAULT 'start', tar_start_offset INT DEFAULT 1,
    tar_end_with VARCHAR(32) DEFAULT 'end', tar_end_offset INT DEFAULT 0
);
INSERT INTO app.ci_tar_def VALUES
  (1,1,'start',1,'end',0),(1,2,'start',0,'start',365),
  (2,1,'start',1,'end',0),(2,2,'start',0,'start',730),
  (3,1,'start',1,'end',0),
  (4,1,'start',1,'end',0),(4,2,'start',0,'start',365),
  (5,1,'start',1,'end',0);

CREATE TABLE app.ci_subgroup_def (ref_id INT NOT NULL, subgroup_id INT NOT NULL, subgroup_name VARCHAR(128) DEFAULT 'All');
INSERT INTO app.ci_subgroup_def VALUES
  (1,0,'All'),(1,1,'Male'),(1,2,'Female'),(1,3,'Age >= 65'),(1,4,'Age < 65'),
  (2,0,'All'),(2,1,'Male'),(2,2,'Female'),
  (3,0,'All'),(3,1,'Male'),(3,2,'Female'),
  (4,0,'All'),(4,1,'Male'),(4,2,'Female'),
  (5,0,'All');

CREATE TABLE app.ci_age_group_def (ref_id INT NOT NULL, age_group_id INT NOT NULL, age_group_name VARCHAR(64));
INSERT INTO app.ci_age_group_def VALUES
  (1,0,NULL),(1,1,'18-34'),(1,2,'35-54'),(1,3,'55-74'),(1,4,'75+'),
  (2,0,NULL),(2,1,'18-44'),(2,2,'45-64'),(2,3,'65+'),
  (3,0,NULL),(3,1,'18-44'),(3,2,'45-64'),(3,3,'65+'),
  (4,0,NULL),(4,1,'18-54'),(4,2,'55+'),
  (5,0,NULL);

CREATE TABLE app.ci_incidence_summary (
    ref_id INT NOT NULL, database_id VARCHAR(64) NOT NULL,
    target_cohort_definition_id INT NOT NULL, outcome_id INT NOT NULL,
    tar_id INT NOT NULL, subgroup_id INT NOT NULL, age_group_id INT DEFAULT 0,
    gender_name VARCHAR(32), start_year INT,
    persons_at_risk_pe INT DEFAULT 0, persons_at_risk INT DEFAULT 0,
    person_days_pe INT DEFAULT 0, person_days INT DEFAULT 0,
    person_outcomes_pe INT DEFAULT 0, person_outcomes INT DEFAULT 0,
    outcomes_pe INT DEFAULT 0, outcomes INT DEFAULT 0,
    incidence_proportion_p100p NUMERIC, incidence_rate_p100py NUMERIC
);

INSERT INTO app.ci_incidence_summary
SELECT
    td.ref_id, d.database_id, td.target_cohort_definition_id, od.outcome_id,
    trd.tar_id, sd.subgroup_id, agd.age_group_id,
    CASE WHEN g.gv = 1 THEN 'Male' WHEN g.gv = 2 THEN 'Female' ELSE NULL END,
    CASE WHEN y.yv = 0 THEN NULL ELSE 2015 + y.yv END,
    (300 + (od.outcome_id*7 + ascii(left(d.database_id,4)) + agd.age_group_id*50 + g.gv*30 + y.yv*20) % 400),
    (280 + (od.outcome_id*7 + ascii(left(d.database_id,4)) + agd.age_group_id*50 + g.gv*30 + y.yv*20) % 380),
    (100000 + (od.outcome_id*11 + ascii(left(d.database_id,4))*3 + agd.age_group_id*20000 + g.gv*10000 + y.yv*8000) % 100000),
    (95000  + (od.outcome_id*11 + ascii(left(d.database_id,4))*3 + agd.age_group_id*20000 + g.gv*10000 + y.yv*8000) % 95000),
    (10 + (od.outcome_id*3 + ascii(left(d.database_id,4)) + agd.age_group_id*5 + g.gv*3) % 30),
    (9  + (od.outcome_id*3 + ascii(left(d.database_id,4)) + agd.age_group_id*5 + g.gv*3) % 28),
    (12 + (od.outcome_id*3 + ascii(left(d.database_id,4)) + agd.age_group_id*5 + g.gv*3 + y.yv*2) % 35),
    (11 + (od.outcome_id*3 + ascii(left(d.database_id,4)) + agd.age_group_id*5 + g.gv*3 + y.yv*2) % 33),
    ROUND((100.0 * (11 + (od.outcome_id*3 + ascii(left(d.database_id,4)) + agd.age_group_id*5 + g.gv*3 + y.yv*2) % 33))
        / GREATEST(1, (280 + (od.outcome_id*7 + ascii(left(d.database_id,4)) + agd.age_group_id*50 + g.gv*30 + y.yv*20) % 380)), 2),
    ROUND((365.0 * 100.0 * (11 + (od.outcome_id*3 + ascii(left(d.database_id,4)) + agd.age_group_id*5 + g.gv*3 + y.yv*2) % 33))
        / GREATEST(1, (95000 + (od.outcome_id*11 + ascii(left(d.database_id,4))*3 + agd.age_group_id*20000 + g.gv*10000 + y.yv*8000) % 95000)), 2)
FROM app.ci_target_def td
JOIN app.ci_outcome_def od  ON od.ref_id  = td.ref_id
JOIN app.ci_tar_def     trd ON trd.ref_id = td.ref_id
JOIN app.ci_subgroup_def sd ON sd.ref_id  = td.ref_id
JOIN app.ci_age_group_def agd ON agd.ref_id = td.ref_id
CROSS JOIN app.database_meta_data d
CROSS JOIN (VALUES (0),(1),(2)) AS g(gv)
CROSS JOIN (VALUES (0),(1),(2),(3),(4),(5),(6)) AS y(yv)
WHERE NOT (agd.age_group_id > 0 AND g.gv > 0)
  AND NOT (agd.age_group_id > 0 AND y.yv > 0)
  AND NOT (g.gv > 0 AND y.yv > 0);

--
-- CM TABLES
--
CREATE TABLE app.cm_target_comparator_outcome (
    target_id INT NOT NULL, comparator_id INT NOT NULL,
    outcome_id INT NOT NULL, outcome_of_interest INT DEFAULT 1
);

INSERT INTO app.cm_target_comparator_outcome VALUES
  (500,600,700,1),(500,600,800,1),(500,600,300,0),(500,600,2400,1),
  (1600,1200,2400,1),(1600,1200,300,1),(1600,1200,800,0),
  (1700,1800,700,1),(1700,1800,800,1),(1700,1800,300,0),
  (1900,500,300,1),(1900,500,400,1),(1900,500,800,0),
  (2000,1900,700,1),(2000,1900,400,1),(2000,1900,2400,1),
  (2600,2700,800,1),(2600,2700,2800,1),(2600,2700,700,0);

CREATE TABLE app.cm_result (
    target_id INT NOT NULL, comparator_id INT NOT NULL, outcome_id INT NOT NULL,
    database_id VARCHAR(64) NOT NULL, analysis_id INT NOT NULL,
    rr NUMERIC, ci_95_lb NUMERIC, ci_95_ub NUMERIC,
    p NUMERIC, log_rr NUMERIC, se_log_rr NUMERIC
);

INSERT INTO app.cm_result
SELECT tco.target_id, tco.comparator_id, tco.outcome_id, d.database_id, a.analysis_id,
  round((0.5 + random() * 2.0)::numeric, 2)                            AS rr,
  round((0.3 + random() * 1.2)::numeric, 2)                            AS ci_95_lb,
  round((1.2 + random() * 2.5)::numeric, 2)                            AS ci_95_ub,
  round(random()::numeric, 2)                                           AS p,
  round((ln(0.5 + random() * 2.0))::numeric, 3)                        AS log_rr,
  round((0.08 + random() * 0.22)::numeric, 2)                          AS se_log_rr
FROM app.cm_target_comparator_outcome tco
CROSS JOIN (VALUES ('db_alpha'),('db_beta'),('db_gamma'),('db_delta'),('db_epsilon')) AS d(database_id)
CROSS JOIN (VALUES (1),(2),(3)) AS a(analysis_id);

--
-- SCCS TABLES
--
CREATE TABLE app.sccs_exposures_outcome_set (
    exposures_outcome_set_id INT PRIMARY KEY,
    outcome_id INT NOT NULL
);

INSERT INTO app.sccs_exposures_outcome_set VALUES
  (1,700),(2,800),(3,300),(4,400),(5,2400),(6,2100),(7,2200),(8,2800),(9,2500);

CREATE TABLE app.sccs_covariate (
    exposures_outcome_set_id INT NOT NULL, database_id VARCHAR(64) NOT NULL,
    analysis_id INT NOT NULL, covariate_id INT NOT NULL,
    covariate_name VARCHAR(256), era_id INT NOT NULL
);

INSERT INTO app.sccs_covariate VALUES
  (1,'db_alpha',1,10,'Exposure window: ACE Inhibitor',500),(1,'db_alpha',2,10,'Exposure window: ACE Inhibitor',500),
  (1,'db_beta', 1,10,'Exposure window: ACE Inhibitor',500),(1,'db_beta', 2,10,'Exposure window: ACE Inhibitor',500),
  (1,'db_alpha',1,11,'Exposure window: NSAID',600),        (1,'db_alpha',2,11,'Exposure window: NSAID',600),
  (1,'db_beta', 1,11,'Exposure window: NSAID',600),        (1,'db_beta', 2,11,'Exposure window: NSAID',600),
  (1,'db_gamma',1,11,'Exposure window: NSAID',600),        (1,'db_gamma',2,11,'Exposure window: NSAID',600),
  (1,'db_alpha',1,12,'Exposure window: PPI',1800),         (1,'db_alpha',2,12,'Exposure window: PPI',1800),
  (1,'db_beta', 1,12,'Exposure window: PPI',1800),         (1,'db_beta', 2,12,'Exposure window: PPI',1800),
  (1,'db_gamma',1,12,'Exposure window: PPI',1800),         (1,'db_gamma',2,12,'Exposure window: PPI',1800),
  (2,'db_alpha',1,10,'Exposure window: ACE Inhibitor',500),(2,'db_alpha',2,10,'Exposure window: ACE Inhibitor',500),
  (2,'db_beta', 1,10,'Exposure window: ACE Inhibitor',500),(2,'db_beta', 2,10,'Exposure window: ACE Inhibitor',500),
  (2,'db_gamma',1,10,'Exposure window: ACE Inhibitor',500),(2,'db_gamma',2,10,'Exposure window: ACE Inhibitor',500),
  (2,'db_alpha',1,13,'Exposure window: Metformin',1700),   (2,'db_alpha',2,13,'Exposure window: Metformin',1700),
  (2,'db_beta', 1,13,'Exposure window: Metformin',1700),   (2,'db_beta', 2,13,'Exposure window: Metformin',1700),
  (3,'db_alpha',1,11,'Exposure window: NSAID',600),        (3,'db_alpha',2,11,'Exposure window: NSAID',600),
  (3,'db_beta', 1,11,'Exposure window: NSAID',600),        (3,'db_beta', 2,11,'Exposure window: NSAID',600),
  (3,'db_gamma',1,11,'Exposure window: NSAID',600),        (3,'db_gamma',2,11,'Exposure window: NSAID',600),
  (3,'db_delta',1,11,'Exposure window: NSAID',600),        (3,'db_delta',2,11,'Exposure window: NSAID',600),
  (3,'db_alpha',1,14,'Exposure window: Statin',1600),      (3,'db_alpha',2,14,'Exposure window: Statin',1600),
  (3,'db_beta', 1,14,'Exposure window: Statin',1600),      (3,'db_beta', 2,14,'Exposure window: Statin',1600),
  (3,'db_gamma',1,14,'Exposure window: Statin',1600),      (3,'db_gamma',2,14,'Exposure window: Statin',1600),
  (3,'db_delta',1,14,'Exposure window: Statin',1600),      (3,'db_delta',2,14,'Exposure window: Statin',1600),
  (4,'db_alpha',1,15,'Exposure window: Beta Blocker',1900),(4,'db_alpha',2,15,'Exposure window: Beta Blocker',1900),
  (4,'db_beta', 1,15,'Exposure window: Beta Blocker',1900),(4,'db_beta', 2,15,'Exposure window: Beta Blocker',1900),
  (4,'db_gamma',1,15,'Exposure window: Beta Blocker',1900),(4,'db_gamma',2,15,'Exposure window: Beta Blocker',1900),
  (4,'db_alpha',1,16,'Exposure window: Warfarin',2000),    (4,'db_alpha',2,16,'Exposure window: Warfarin',2000),
  (4,'db_beta', 1,16,'Exposure window: Warfarin',2000),    (4,'db_beta', 2,16,'Exposure window: Warfarin',2000),
  (4,'db_gamma',1,16,'Exposure window: Warfarin',2000),    (4,'db_gamma',2,16,'Exposure window: Warfarin',2000),
  (4,'db_delta',1,16,'Exposure window: Warfarin',2000),    (4,'db_delta',2,16,'Exposure window: Warfarin',2000),
  (5,'db_alpha',1,10,'Exposure window: ACE Inhibitor',500),(5,'db_alpha',2,10,'Exposure window: ACE Inhibitor',500),
  (5,'db_beta', 1,10,'Exposure window: ACE Inhibitor',500),(5,'db_beta', 2,10,'Exposure window: ACE Inhibitor',500),
  (5,'db_gamma',1,10,'Exposure window: ACE Inhibitor',500),(5,'db_gamma',2,10,'Exposure window: ACE Inhibitor',500),
  (5,'db_delta',1,10,'Exposure window: ACE Inhibitor',500),(5,'db_delta',2,10,'Exposure window: ACE Inhibitor',500),
  (5,'db_alpha',1,15,'Exposure window: Beta Blocker',1900),(5,'db_alpha',2,15,'Exposure window: Beta Blocker',1900),
  (5,'db_beta', 1,15,'Exposure window: Beta Blocker',1900),(5,'db_beta', 2,15,'Exposure window: Beta Blocker',1900),
  (5,'db_gamma',1,15,'Exposure window: Beta Blocker',1900),(5,'db_gamma',2,15,'Exposure window: Beta Blocker',1900),
  (5,'db_delta',1,15,'Exposure window: Beta Blocker',1900),(5,'db_delta',2,15,'Exposure window: Beta Blocker',1900),
  (5,'db_alpha',1,16,'Exposure window: Warfarin',2000),    (5,'db_alpha',2,16,'Exposure window: Warfarin',2000),
  (5,'db_beta', 1,16,'Exposure window: Warfarin',2000),    (5,'db_beta', 2,16,'Exposure window: Warfarin',2000),
  (5,'db_gamma',1,16,'Exposure window: Warfarin',2000),    (5,'db_gamma',2,16,'Exposure window: Warfarin',2000),
  (5,'db_delta',1,16,'Exposure window: Warfarin',2000),    (5,'db_delta',2,16,'Exposure window: Warfarin',2000),
  (6,'db_alpha',1,17,'Exposure window: Opioid',2600),      (6,'db_alpha',2,17,'Exposure window: Opioid',2600),
  (6,'db_beta', 1,17,'Exposure window: Opioid',2600),      (6,'db_beta', 2,17,'Exposure window: Opioid',2600),
  (6,'db_gamma',1,17,'Exposure window: Opioid',2600),      (6,'db_gamma',2,17,'Exposure window: Opioid',2600),
  (7,'db_alpha',1,17,'Exposure window: Opioid',2600),      (7,'db_alpha',2,17,'Exposure window: Opioid',2600),
  (7,'db_beta', 1,17,'Exposure window: Opioid',2600),      (7,'db_beta', 2,17,'Exposure window: Opioid',2600),
  (7,'db_gamma',1,17,'Exposure window: Opioid',2600),      (7,'db_gamma',2,17,'Exposure window: Opioid',2600),
  (7,'db_alpha',1,18,'Exposure window: Benzodiazepine',2700),(7,'db_alpha',2,18,'Exposure window: Benzodiazepine',2700),
  (7,'db_beta', 1,18,'Exposure window: Benzodiazepine',2700),(7,'db_beta', 2,18,'Exposure window: Benzodiazepine',2700),
  (7,'db_gamma',1,18,'Exposure window: Benzodiazepine',2700),(7,'db_gamma',2,18,'Exposure window: Benzodiazepine',2700),
  (8,'db_alpha',1,17,'Exposure window: Opioid',2600),      (8,'db_alpha',2,17,'Exposure window: Opioid',2600),
  (8,'db_beta', 1,17,'Exposure window: Opioid',2600),      (8,'db_beta', 2,17,'Exposure window: Opioid',2600),
  (8,'db_gamma',1,17,'Exposure window: Opioid',2600),      (8,'db_gamma',2,17,'Exposure window: Opioid',2600),
  (8,'db_delta',1,17,'Exposure window: Opioid',2600),      (8,'db_delta',2,17,'Exposure window: Opioid',2600),
  (8,'db_alpha',1,18,'Exposure window: Benzodiazepine',2700),(8,'db_alpha',2,18,'Exposure window: Benzodiazepine',2700),
  (8,'db_beta', 1,18,'Exposure window: Benzodiazepine',2700),(8,'db_beta', 2,18,'Exposure window: Benzodiazepine',2700),
  (9,'db_alpha',1,17,'Exposure window: Opioid',2600),      (9,'db_alpha',2,17,'Exposure window: Opioid',2600),
  (9,'db_beta', 1,17,'Exposure window: Opioid',2600),      (9,'db_beta', 2,17,'Exposure window: Opioid',2600),
  (9,'db_alpha',1,18,'Exposure window: Benzodiazepine',2700),(9,'db_alpha',2,18,'Exposure window: Benzodiazepine',2700),
  (9,'db_beta', 1,18,'Exposure window: Benzodiazepine',2700),(9,'db_beta', 2,18,'Exposure window: Benzodiazepine',2700),
  (9,'db_gamma',1,18,'Exposure window: Benzodiazepine',2700),(9,'db_gamma',2,18,'Exposure window: Benzodiazepine',2700);

CREATE TABLE app.sccs_exposure (
    exposures_outcome_set_id INT NOT NULL, era_id INT NOT NULL, true_effect_size NUMERIC
);

INSERT INTO app.sccs_exposure VALUES
  (1,500,NULL),(1,500,1.0),(1,600,NULL),(1,1800,NULL),(1,1800,1.0),
  (2,500,NULL),(2,1700,NULL),
  (3,600,NULL),(3,600,1.0),(3,1600,NULL),
  (4,1900,NULL),(4,1900,1.0),(4,2000,NULL),
  (5,500,NULL),(5,1900,NULL),(5,1900,1.0),(5,2000,NULL),
  (6,2600,NULL),
  (7,2600,NULL),(7,2700,NULL),
  (8,2600,NULL),(8,2600,1.0),(8,2700,NULL),
  (9,2600,NULL),(9,2700,NULL);

CREATE TABLE app.sccs_result (
    exposures_outcome_set_id INT NOT NULL, database_id VARCHAR(64) NOT NULL,
    analysis_id INT NOT NULL, covariate_id INT NOT NULL,
    rr NUMERIC, ci_95_lb NUMERIC, ci_95_ub NUMERIC,
    p NUMERIC, log_rr NUMERIC, se_log_rr NUMERIC
);

INSERT INTO app.sccs_result
SELECT c.exposures_outcome_set_id, c.database_id, c.analysis_id, c.covariate_id,
  round((0.5 + random() * 2.5)::numeric, 2),
  round((0.35 + random() * 1.5)::numeric, 2),
  round((1.1  + random() * 3.0)::numeric, 2),
  round(random()::numeric, 2),
  round((ln(0.5 + random() * 2.5))::numeric, 3),
  round((0.08 + random() * 0.22)::numeric, 2)
FROM app.sccs_covariate c;

--
-- PLP TABLES
--
CREATE TABLE app.plp_cohorts (
    cohort_id INT PRIMARY KEY, cohort_definition_id INT NOT NULL, cohort_name VARCHAR(256) NOT NULL
);

INSERT INTO app.plp_cohorts VALUES
  (1,100,'Type 2 Diabetes'),(2,200,'Hypertension'),(3,300,'Heart Failure'),
  (4,400,'Stroke'),(5,700,'GI Bleed'),(6,800,'Renal Failure'),
  (7,900,'Atrial Fibrillation'),(8,1000,'COPD'),(9,1200,'Rheumatoid Arthritis'),
  (10,1400,'Major Depressive Disorder'),(11,2100,'Pneumonia'),(12,2200,'Sepsis'),
  (13,2400,'Acute Myocardial Infarction'),(14,2500,'Hip Fracture'),
  (15,2800,'Falls'),(16,2900,'Dementia'),(17,3000,'Chronic Kidney Disease');

CREATE TABLE app.plp_model_designs (
    model_design_id INT PRIMARY KEY, target_id INT NOT NULL,
    outcome_id INT NOT NULL, model_type VARCHAR(128)
);

INSERT INTO app.plp_model_designs VALUES
  (1,1,3,'Lasso Logistic Regression'),(2,1,4,'Gradient Boosted Machine'),
  (3,2,4,'Lasso Logistic Regression'),(4,1,5,'Random Forest'),
  (5,2,6,'Gradient Boosted Machine'),(6,1,13,'Deep Learning'),
  (7,2,13,'Lasso Logistic Regression'),(8,3,4,'Gradient Boosted Machine'),
  (9,3,6,'Random Forest'),(10,7,4,'Lasso Logistic Regression'),
  (11,7,13,'Gradient Boosted Machine'),(12,8,11,'Lasso Logistic Regression'),
  (13,8,12,'Random Forest'),(14,9,5,'Gradient Boosted Machine'),
  (15,10,4,'Deep Learning'),(16,1,17,'Lasso Logistic Regression'),
  (17,2,17,'Gradient Boosted Machine'),(18,1,16,'Random Forest'),
  (19,7,3,'Lasso Logistic Regression'),(20,16,15,'Gradient Boosted Machine');

--
-- VERIFICATION
--
DO $$
DECLARE t RECORD; cnt BIGINT;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'app' ORDER BY table_name LOOP
    EXECUTE format('SELECT count(*) FROM app.%I', t.table_name) INTO cnt;
    RAISE NOTICE '% : % rows', t.table_name, cnt;
  END LOOP;
END $$;

--
-- SCHEMA: app2 (updated characterization schema - v2)
--
DROP SCHEMA IF EXISTS app2 CASCADE;
CREATE SCHEMA app2;

-- Unchanged tables (same structure as app)
CREATE TABLE app2.database_meta_data          (LIKE app.database_meta_data);
CREATE TABLE app2.cg_cohort_definition        (LIKE app.cg_cohort_definition);
CREATE TABLE app2.cg_cohort_subset_definition (LIKE app.cg_cohort_subset_definition);
CREATE TABLE app2.cg_cohort_count             (LIKE app.cg_cohort_count);
CREATE TABLE app2.cg_cohort_generation        (LIKE app.cg_cohort_generation);
CREATE TABLE app2.cg_cohort_inclusion         (LIKE app.cg_cohort_inclusion);
CREATE TABLE app2.cg_cohort_inc_result        (LIKE app.cg_cohort_inc_result);
CREATE TABLE app2.c_covariate_ref (
    database_id           VARCHAR(100) NOT NULL,
    setting_id            VARCHAR(50)  NOT NULL,
    covariate_id          BIGINT       NOT NULL,
    covariate_name        VARCHAR,
    analysis_id           INT,
    concept_id            BIGINT,
    value_as_concept_id   INT,
    collisions            INT,
    PRIMARY KEY (database_id, setting_id, covariate_id)
);
CREATE TABLE app2.c_dechallenge_rechallenge   (LIKE app.c_dechallenge_rechallenge);
CREATE TABLE app2.c_rechallenge_fail_case_series (LIKE app.c_rechallenge_fail_case_series);
CREATE TABLE app2.c_time_to_event             (LIKE app.c_time_to_event);
CREATE TABLE app2.c_time_to_event_targets     (LIKE app.c_time_to_event_targets);
CREATE TABLE app2.ci_target_def               (LIKE app.ci_target_def);
CREATE TABLE app2.ci_outcome_def              (LIKE app.ci_outcome_def);
CREATE TABLE app2.ci_tar_def                  (LIKE app.ci_tar_def);
CREATE TABLE app2.ci_subgroup_def             (LIKE app.ci_subgroup_def);
CREATE TABLE app2.ci_age_group_def            (LIKE app.ci_age_group_def);
CREATE TABLE app2.ci_incidence_summary        (LIKE app.ci_incidence_summary);
CREATE TABLE app2.sccs_exposures_outcome_set  (LIKE app.sccs_exposures_outcome_set);
CREATE TABLE app2.sccs_covariate              (LIKE app.sccs_covariate);
CREATE TABLE app2.sccs_exposure               (LIKE app.sccs_exposure);
CREATE TABLE app2.sccs_result                 (LIKE app.sccs_result);
CREATE TABLE app2.plp_cohorts                 (LIKE app.plp_cohorts);
CREATE TABLE app2.plp_model_designs           (LIKE app.plp_model_designs);

-- New characterization settings tables
CREATE TABLE app2.c_execution_settings (
    setting_id                VARCHAR(50)  NOT NULL,
    database_id               VARCHAR(100) NOT NULL,
    database_hash             VARCHAR(50),
    mode                      VARCHAR(25),
    min_characterization_mean FLOAT,
    min_covariate_count       INT,
    min_smd                   FLOAT,
    PRIMARY KEY (setting_id, database_id)
);

CREATE TABLE app2.c_target_settings (
    setting_id                 VARCHAR(50)  NOT NULL,
    database_id                VARCHAR(100) NOT NULL,
    characterization_target_id BIGINT       NOT NULL,
    target_id                  BIGINT,
    limit_to_first_in_n_days   INT,
    min_prior_observation      INT,
    PRIMARY KEY (setting_id, database_id, characterization_target_id)
);

CREATE TABLE app2.c_case_settings (
    setting_id                 VARCHAR(50)  NOT NULL,
    database_id                VARCHAR(100) NOT NULL,
    characterization_case_id   BIGINT       NOT NULL,
    characterization_target_id BIGINT,
    outcome_id                 BIGINT,
    outcome_washout_days       INT,
    start_anchor               VARCHAR(15),
    end_anchor                 VARCHAR(15),
    risk_window_start          INT,
    risk_window_end            INT,
    runtype                    VARCHAR(50),
    PRIMARY KEY (setting_id, database_id, characterization_case_id)
);

CREATE TABLE app2.c_case_series_settings (
    setting_id                 VARCHAR(50) NOT NULL,
    case_pre_target_duration   INT,
    case_post_outcome_duration INT,
    PRIMARY KEY (setting_id)
);

CREATE TABLE app2.c_analysis_ref (
    database_id        VARCHAR(100) NOT NULL,
    setting_id         VARCHAR(50)  NOT NULL,
    analysis_id        INT          NOT NULL,
    analysis_name      VARCHAR,
    domain_id          VARCHAR,
    start_day          INT,
    end_day            INT,
    is_binary          VARCHAR(1),
    missing_means_zero VARCHAR(1),
    PRIMARY KEY (database_id, setting_id, analysis_id)
);

CREATE TABLE app2.c_attrition (
    cohort_definition_id BIGINT       NOT NULL,
    attr_reason          VARCHAR(100) NOT NULL,
    n                    BIGINT,
    database_id          VARCHAR(100) NOT NULL,
    setting_id           VARCHAR(50)  NOT NULL,
    PRIMARY KEY (cohort_definition_id, attr_reason, database_id, setting_id)
);

-- New characterization covariate tables
CREATE TABLE app2.c_target_covariates (
    database_id                VARCHAR(100) NOT NULL,
    setting_id                 VARCHAR(50)  NOT NULL,
    characterization_target_id INT          NOT NULL,
    covariate_id               BIGINT       NOT NULL,
    sum_value                  INT,
    average_value              FLOAT,
    PRIMARY KEY (database_id, setting_id, characterization_target_id, covariate_id)
);

CREATE TABLE app2.c_target_covariates_continuous (
    database_id                VARCHAR(100) NOT NULL,
    setting_id                 VARCHAR(50)  NOT NULL,
    characterization_target_id INT          NOT NULL,
    covariate_id               BIGINT       NOT NULL,
    count_value                INT,
    min_value                  FLOAT,
    max_value                  FLOAT,
    average_value              FLOAT,
    standard_deviation         FLOAT,
    median_value               FLOAT,
    p_10_value                 FLOAT,
    p_25_value                 FLOAT,
    p_75_value                 FLOAT,
    p_90_value                 FLOAT,
    PRIMARY KEY (database_id, setting_id, characterization_target_id, covariate_id)
);

CREATE TABLE app2.c_risk_factor_covariates (
    database_id                  VARCHAR(100) NOT NULL,
    setting_id                   VARCHAR(50)  NOT NULL,
    characterization_case_id     BIGINT       NOT NULL,
    covariate_id                 BIGINT       NOT NULL,
    non_case_sum_value           INT,
    non_case_average_value       FLOAT,
    case_sum_value               INT,
    case_average_value           FLOAT,
    standardized_mean_difference FLOAT,
    PRIMARY KEY (database_id, setting_id, characterization_case_id, covariate_id)
);

CREATE TABLE app2.c_risk_factor_covariates_continuous (
    database_id                 VARCHAR(100) NOT NULL,
    setting_id                  VARCHAR(50)  NOT NULL,
    characterization_case_id    BIGINT       NOT NULL,
    covariate_id                BIGINT       NOT NULL,
    case_count_value            INT,
    case_min_value              FLOAT,
    case_max_value              FLOAT,
    case_average_value          FLOAT,
    case_standard_deviation     FLOAT,
    case_median_value           FLOAT,
    case_p_10_value             FLOAT,
    case_p_25_value             FLOAT,
    case_p_75_value             FLOAT,
    case_p_90_value             FLOAT,
    non_case_count_value        INT,
    non_case_min_value          FLOAT,
    non_case_max_value          FLOAT,
    non_case_average_value      FLOAT,
    non_case_standard_deviation FLOAT,
    non_case_median_value       FLOAT,
    non_case_p_10_value         FLOAT,
    non_case_p_25_value         FLOAT,
    non_case_p_75_value         FLOAT,
    non_case_p_90_value         FLOAT,
    standardized_mean_difference FLOAT,
    PRIMARY KEY (database_id, setting_id, characterization_case_id, covariate_id)
);

CREATE TABLE app2.c_case_series_covariates (
    database_id              VARCHAR(100) NOT NULL,
    setting_id               VARCHAR(50)  NOT NULL,
    characterization_case_id BIGINT       NOT NULL,
    covariate_id             BIGINT       NOT NULL,
    before_sum_value         INT,
    before_average_value     FLOAT,
    during_sum_value         INT,
    during_average_value     FLOAT,
    after_sum_value          INT,
    after_average_value      FLOAT,
    PRIMARY KEY (database_id, setting_id, characterization_case_id, covariate_id)
);

CREATE TABLE app2.c_case_series_covariates_continuous (
    database_id               VARCHAR(100) NOT NULL,
    setting_id                VARCHAR(50)  NOT NULL,
    characterization_case_id  BIGINT       NOT NULL,
    covariate_id              BIGINT       NOT NULL,
    before_count_value        INT,
    before_min_value          FLOAT,
    before_max_value          FLOAT,
    before_average_value      FLOAT,
    before_standard_deviation FLOAT,
    before_median_value       FLOAT,
    before_p_10_value         FLOAT,
    before_p_25_value         FLOAT,
    before_p_75_value         FLOAT,
    before_p_90_value         FLOAT,
    during_min_value          FLOAT,
    during_max_value          FLOAT,
    during_average_value      FLOAT,
    during_standard_deviation FLOAT,
    during_median_value       FLOAT,
    during_p_10_value         FLOAT,
    during_p_25_value         FLOAT,
    during_p_75_value         FLOAT,
    during_p_90_value         FLOAT,
    after_count_value         INT,
    after_min_value           FLOAT,
    after_max_value           FLOAT,
    after_average_value       FLOAT,
    after_standard_deviation  FLOAT,
    after_median_value        FLOAT,
    after_p_10_value          FLOAT,
    after_p_25_value          FLOAT,
    after_p_75_value          FLOAT,
    after_p_90_value          FLOAT,
    PRIMARY KEY (database_id, setting_id, characterization_case_id, covariate_id)
);

-- New CohortMethod tables (target_id/comparator_id moved to cm_target_comparator)
CREATE TABLE app2.cm_target_comparator (
    target_comparator_id BIGINT NOT NULL,
    target_id            BIGINT,
    comparator_id        BIGINT,
    nesting_cohort_id    BIGINT,
    PRIMARY KEY (target_comparator_id)
);

CREATE TABLE app2.cm_target_comparator_outcome (
    outcome_id           BIGINT NOT NULL,
    outcome_of_interest  INT,
    true_effect_size     FLOAT,
    target_comparator_id BIGINT NOT NULL,
    PRIMARY KEY (outcome_id, target_comparator_id)
);

CREATE TABLE app2.cm_result (
    analysis_id          INT         NOT NULL,
    target_comparator_id BIGINT      NOT NULL,
    outcome_id           BIGINT      NOT NULL,
    rr                   NUMERIC,
    ci_95_lb             NUMERIC,
    ci_95_ub             NUMERIC,
    p                    NUMERIC,
    log_rr               NUMERIC,
    se_log_rr            NUMERIC,
    database_id          VARCHAR(64) NOT NULL,
    PRIMARY KEY (analysis_id, target_comparator_id, outcome_id, database_id)
);

-- Populate unchanged tables
INSERT INTO app2.database_meta_data           SELECT * FROM app.database_meta_data;
INSERT INTO app2.cg_cohort_definition         SELECT * FROM app.cg_cohort_definition;
INSERT INTO app2.cg_cohort_subset_definition  SELECT * FROM app.cg_cohort_subset_definition;
INSERT INTO app2.cg_cohort_count              SELECT * FROM app.cg_cohort_count;
INSERT INTO app2.cg_cohort_generation         SELECT * FROM app.cg_cohort_generation;
INSERT INTO app2.cg_cohort_inclusion          SELECT * FROM app.cg_cohort_inclusion;
INSERT INTO app2.cg_cohort_inc_result         SELECT * FROM app.cg_cohort_inc_result;
INSERT INTO app2.c_covariate_ref (database_id, setting_id, covariate_id, covariate_name, analysis_id, concept_id)
SELECT database_id, setting_id::varchar(50), covariate_id, covariate_name, analysis_id, concept_id
FROM app.c_covariate_ref;
INSERT INTO app2.c_dechallenge_rechallenge    SELECT * FROM app.c_dechallenge_rechallenge;
INSERT INTO app2.c_rechallenge_fail_case_series SELECT * FROM app.c_rechallenge_fail_case_series;
INSERT INTO app2.c_time_to_event              SELECT * FROM app.c_time_to_event;
INSERT INTO app2.c_time_to_event_targets      SELECT * FROM app.c_time_to_event_targets;
INSERT INTO app2.ci_target_def                SELECT * FROM app.ci_target_def;
INSERT INTO app2.ci_outcome_def               SELECT * FROM app.ci_outcome_def;
INSERT INTO app2.ci_tar_def                   SELECT * FROM app.ci_tar_def;
INSERT INTO app2.ci_subgroup_def              SELECT * FROM app.ci_subgroup_def;
INSERT INTO app2.ci_age_group_def             SELECT * FROM app.ci_age_group_def;
INSERT INTO app2.ci_incidence_summary         SELECT * FROM app.ci_incidence_summary;
INSERT INTO app2.sccs_exposures_outcome_set   SELECT * FROM app.sccs_exposures_outcome_set;
INSERT INTO app2.sccs_covariate               SELECT * FROM app.sccs_covariate;
INSERT INTO app2.sccs_exposure                SELECT * FROM app.sccs_exposure;
INSERT INTO app2.sccs_result                  SELECT * FROM app.sccs_result;
INSERT INTO app2.plp_cohorts                  SELECT * FROM app.plp_cohorts;
INSERT INTO app2.plp_model_designs            SELECT * FROM app.plp_model_designs;

UPDATE app2.database_meta_data SET cdm_source_name = cdm_source_name || ' [v2]';

-- c_execution_settings
INSERT INTO app2.c_execution_settings
SELECT s.sid, d.database_id, md5(d.database_id || s.sid), s.mode, s.min_cm, s.min_cc, s.min_smd
FROM (VALUES
  ('1', 'binary', 0.01,  5, 0.1),
  ('2', 'both',   0.01,  5, 0.1),
  ('3', 'binary', 0.01,  5, 0.1),
  ('4', 'both',   0.005, 3, 0.1),
  ('5', 'binary', 0.01,  5, 0.1),
  ('6', 'both',   0.01,  5, 0.1)
) AS s(sid, mode, min_cm, min_cc, min_smd)
CROSS JOIN app2.database_meta_data d
WHERE (s.sid = '1' AND d.database_id IN ('db_alpha','db_beta','db_gamma','db_delta','db_epsilon','db_zeta'))
   OR (s.sid = '2' AND d.database_id IN ('db_alpha','db_beta','db_gamma','db_delta'))
   OR (s.sid = '3' AND d.database_id IN ('db_alpha','db_beta','db_gamma','db_delta','db_epsilon'))
   OR (s.sid = '4' AND d.database_id IN ('db_alpha','db_beta','db_gamma'))
   OR (s.sid = '5' AND d.database_id IN ('db_alpha','db_beta','db_delta','db_epsilon'))
   OR (s.sid = '6' AND d.database_id IN ('db_alpha','db_beta','db_gamma','db_delta','db_epsilon','db_zeta','db_eta','db_theta'));

-- c_target_settings: one row per setting × database × target cohort
INSERT INTO app2.c_target_settings
SELECT '1', d.database_id, t.ct_id, t.target_id, NULL, 365
FROM (VALUES
  (1::bigint, 100::bigint),(2,200),(3,300),(4,500),(5,600),(6,900),(7,1000),
  (8,1200),(9,1400),(10,1600),(11,1700),(12,1800),(13,1900),(14,2000),
  (15,2600),(16,2700),(17,2900)
) AS t(ct_id, target_id)
CROSS JOIN (SELECT database_id FROM app2.database_meta_data
            WHERE database_id IN ('db_alpha','db_beta','db_gamma','db_delta','db_epsilon','db_zeta')) d;

-- c_case_settings: one row per setting × database × (target, outcome) pair
-- characterization_target_id matches c_target_settings.characterization_target_id
INSERT INTO app2.c_case_settings
SELECT '1', d.database_id, p.cc_id, p.ct_id, p.outcome_id, 30, 'cohort start', 'cohort start', 1, 365, 'Cases'
FROM (VALUES
  (1::bigint,  1::bigint, 300::bigint),(2,  1, 400),(3,  1, 700),(4,  1,  800),
  (5,          2,         300),        (6,  2, 400),(7,  2, 700),(8,  2, 2400),
  (9,          3,         700),        (10, 3, 800),(11, 4, 700),(12, 5,  700),
  (13,         6,         300),        (14, 6, 400),(15, 7, 300),(16, 7, 2100),
  (17,         8,         700),        (18, 9,2200),(19,10, 800),(20,11,  800),
  (21,        12,         700),        (22,13, 300),(23,14, 400),(24,14,  700),
  (25,        15,         700),        (26,15, 800),(27,16,2800),(28,17, 2500)
) AS p(cc_id, ct_id, outcome_id)
CROSS JOIN (SELECT database_id FROM app2.database_meta_data
            WHERE database_id IN ('db_alpha','db_beta','db_gamma','db_delta','db_epsilon','db_zeta')) d;

-- c_case_series_settings
INSERT INTO app2.c_case_series_settings VALUES ('1', 365, 30);

-- c_analysis_ref
INSERT INTO app2.c_analysis_ref
SELECT d.database_id, '1', a.analysis_id, a.analysis_name, a.domain_id, a.start_day, a.end_day, a.is_binary, a.missing_means_zero
FROM (VALUES
  (3,   'Demographics',             'Demographics', NULL, NULL, 'Y', 'Y'),
  (4,   'Race',                     'Demographics', NULL, NULL, 'Y', 'Y'),
  (109, 'Condition occurrence',     'Condition',    -365,   -1, 'Y', 'N'),
  (217, 'Drug exposure',            'Drug',         -365,   -1, 'Y', 'N'),
  (926, 'Measurement value',        'Measurement',  -365,   -1, 'N', 'N'),
  (927, 'Distinct condition count', 'Observation',  -365,   -1, 'N', 'Y')
) AS a(analysis_id, analysis_name, domain_id, start_day, end_day, is_binary, missing_means_zero)
CROSS JOIN (SELECT database_id FROM app2.database_meta_data
            WHERE database_id IN ('db_alpha','db_beta','db_gamma','db_delta','db_epsilon','db_zeta')) d;

-- c_attrition
INSERT INTO app2.c_attrition
SELECT t.target_id, r.attr_reason,
       GREATEST(0, r.base - (r.step_num * 47 + ascii(left(d.database_id, 1)) % 23))::bigint,
       d.database_id, '1'
FROM (VALUES
  (100::bigint),(200),(300),(500),(600),(900),(1000),(1200),(1400),
  (1600),(1700),(1800),(1900),(2000),(2600),(2700),(2900)
) AS t(target_id)
CROSS JOIN (VALUES
  (1, 'Initial qualifying events',   1800),
  (2, 'Aged 18 or older',            1750),
  (3, '365+ days prior observation', 1600),
  (4, 'No prior outcome in washout', 1500)
) AS r(step_num, attr_reason, base)
CROSS JOIN (SELECT database_id FROM app2.database_meta_data
            WHERE database_id IN ('db_alpha','db_beta','db_gamma','db_delta','db_epsilon','db_zeta')) d;

-- c_target_covariates (binary, replaces c_covariates WHERE cohort_type='Target')
INSERT INTO app2.c_target_covariates
SELECT d.database_id, '1', t.ct_id, r.covariate_id,
       (floor(random() * 300 + 1))::int,
       round(random()::numeric, 2)::float
FROM (SELECT DISTINCT covariate_id FROM app2.c_covariate_ref
      WHERE setting_id = '1' AND analysis_id NOT IN (926, 927)) r
CROSS JOIN (SELECT database_id FROM app2.database_meta_data
            WHERE database_id IN ('db_alpha','db_beta','db_gamma','db_delta','db_epsilon','db_zeta')) d
CROSS JOIN (VALUES
  (1,100),(2,200),(3,300),(4,500),(5,600),(6,900),(7,1000),
  (8,1200),(9,1400),(10,1600),(11,1700),(12,1800),(13,1900),(14,2000),
  (15,2600),(16,2700),(17,2900)
) AS t(ct_id, target_id);

-- c_target_covariates_continuous (replaces c_covariates_continuous WHERE cohort_type='Target')
INSERT INTO app2.c_target_covariates_continuous
SELECT d.database_id, '1', t.ct_id, c.covariate_id,
  (c.avg_v * (4 + random() * 2))::int,
  c.min_v, c.max_v,
  round((c.avg_v + (random() - 0.5) * c.sd_v)::numeric, 1)::float,
  round((c.sd_v  * (0.8 + random() * 0.4))::numeric, 1)::float,
  round((c.avg_v + (random() - 0.5) * c.sd_v * 0.7)::numeric, 1)::float,
  round((c.min_v + (c.avg_v - c.min_v) * 0.25)::numeric, 1)::float,
  round((c.min_v + (c.avg_v - c.min_v) * 0.55)::numeric, 1)::float,
  round((c.avg_v + (c.max_v - c.avg_v) * 0.35)::numeric, 1)::float,
  round((c.avg_v + (c.max_v - c.avg_v) * 0.65)::numeric, 1)::float
FROM (VALUES
  (1300::bigint,  0.0,  15.0,   3.0,  1.2),
  (1301::bigint,  0.0,  30.0,   5.0,  3.0),
  (1302::bigint, 15.0,  60.0,  28.0,  6.0),
  (1303::bigint, 80.0, 220.0, 130.0, 20.0),
  (1304::bigint, 50.0, 130.0,  79.0, 12.0),
  (1305::bigint,  4.0,  14.0,   7.5,  2.0),
  (1306::bigint,  5.0, 150.0,  72.0, 25.0),
  (1307::bigint, 20.0, 300.0, 110.0, 38.0)
) AS c(covariate_id, min_v, max_v, avg_v, sd_v)
CROSS JOIN (SELECT database_id FROM app2.database_meta_data
            WHERE database_id IN ('db_alpha','db_beta','db_gamma','db_delta','db_epsilon','db_zeta')) d
CROSS JOIN (VALUES
  (1,100),(2,200),(3,300),(4,500),(5,600),(6,900),(7,1000),
  (8,1200),(9,1400),(10,1600),(11,1700),(12,1800),(13,1900),(14,2000),
  (15,2600),(16,2700),(17,2900)
) AS t(ct_id, target_id);

-- c_risk_factor_covariates (binary, pre-computed case vs non-case with SMD)
INSERT INTO app2.c_risk_factor_covariates
SELECT d.database_id, '1', p.cc_id, r.covariate_id,
       (floor(random() * 300 + 50))::int,
       round(random()::numeric, 2)::float,
       (floor(random() * 200 + 30))::int,
       round(random()::numeric, 2)::float,
       round(((random() * 0.8) - 0.2)::numeric, 3)::float
FROM (SELECT DISTINCT covariate_id FROM app2.c_covariate_ref
      WHERE setting_id = '1' AND analysis_id NOT IN (926, 927)) r
CROSS JOIN (SELECT database_id FROM app2.database_meta_data
            WHERE database_id IN ('db_alpha','db_beta','db_gamma','db_delta','db_epsilon','db_zeta')) d
CROSS JOIN (VALUES
  (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),
  (15),(16),(17),(18),(19),(20),(21),(22),(23),(24),(25),(26),(27),(28)
) AS p(cc_id);

-- c_risk_factor_covariates_continuous
INSERT INTO app2.c_risk_factor_covariates_continuous
SELECT d.database_id, '1', p.cc_id, c.covariate_id,
  -- case
  (c.avg_v * (3 + random() * 2))::int,
  c.min_v, c.max_v,
  round((c.avg_v + (random() - 0.5) * c.sd_v)::numeric, 1)::float,
  round((c.sd_v  * (0.8 + random() * 0.4))::numeric, 1)::float,
  round((c.avg_v + (random() - 0.5) * c.sd_v * 0.7)::numeric, 1)::float,
  round((c.min_v + (c.avg_v - c.min_v) * 0.25)::numeric, 1)::float,
  round((c.min_v + (c.avg_v - c.min_v) * 0.55)::numeric, 1)::float,
  round((c.avg_v + (c.max_v - c.avg_v) * 0.35)::numeric, 1)::float,
  round((c.avg_v + (c.max_v - c.avg_v) * 0.65)::numeric, 1)::float,
  -- non-case
  (c.avg_v * (4 + random() * 2))::int,
  c.min_v, c.max_v,
  round((c.avg_v + (random() - 0.5) * c.sd_v)::numeric, 1)::float,
  round((c.sd_v  * (0.8 + random() * 0.4))::numeric, 1)::float,
  round((c.avg_v + (random() - 0.5) * c.sd_v * 0.7)::numeric, 1)::float,
  round((c.min_v + (c.avg_v - c.min_v) * 0.25)::numeric, 1)::float,
  round((c.min_v + (c.avg_v - c.min_v) * 0.55)::numeric, 1)::float,
  round((c.avg_v + (c.max_v - c.avg_v) * 0.35)::numeric, 1)::float,
  round((c.avg_v + (c.max_v - c.avg_v) * 0.65)::numeric, 1)::float,
  round(((random() * 0.8) - 0.2)::numeric, 3)::float
FROM (VALUES
  (1300::bigint,  0.0,  15.0,   3.0,  1.2),
  (1301::bigint,  0.0,  30.0,   5.0,  3.0),
  (1302::bigint, 15.0,  60.0,  28.0,  6.0),
  (1303::bigint, 80.0, 220.0, 130.0, 20.0),
  (1304::bigint, 50.0, 130.0,  79.0, 12.0),
  (1305::bigint,  4.0,  14.0,   7.5,  2.0),
  (1306::bigint,  5.0, 150.0,  72.0, 25.0),
  (1307::bigint, 20.0, 300.0, 110.0, 38.0)
) AS c(covariate_id, min_v, max_v, avg_v, sd_v)
CROSS JOIN (SELECT database_id FROM app2.database_meta_data
            WHERE database_id IN ('db_alpha','db_beta','db_gamma','db_delta','db_epsilon','db_zeta')) d
CROSS JOIN (VALUES
  (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),
  (15),(16),(17),(18),(19),(20),(21),(22),(23),(24),(25),(26),(27),(28)
) AS p(cc_id);

-- c_case_series_covariates (binary, pre-computed before/during/after in one row)
INSERT INTO app2.c_case_series_covariates
SELECT d.database_id, '1', p.cc_id, r.covariate_id,
       (floor(random() * 300 + 1))::int, round(random()::numeric, 2)::float,
       (floor(random() * 250 + 1))::int, round(random()::numeric, 2)::float,
       (floor(random() * 200 + 1))::int, round(random()::numeric, 2)::float
FROM (SELECT DISTINCT covariate_id FROM app2.c_covariate_ref
      WHERE setting_id = '1' AND analysis_id NOT IN (926, 927)) r
CROSS JOIN (SELECT database_id FROM app2.database_meta_data
            WHERE database_id IN ('db_alpha','db_beta','db_gamma','db_delta','db_epsilon','db_zeta')) d
CROSS JOIN (VALUES
  (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),
  (15),(16),(17),(18),(19),(20),(21),(22),(23),(24),(25),(26),(27),(28)
) AS p(cc_id);

-- c_case_series_covariates_continuous (during has no count_value)
INSERT INTO app2.c_case_series_covariates_continuous
SELECT d.database_id, '1', p.cc_id, c.covariate_id,
  -- before (10 cols: count + min/max/avg/sd/median/p10/p25/p75/p90)
  (c.avg_v * (4 + random() * 2))::int,
  c.min_v, c.max_v,
  round((c.avg_v + (random() - 0.5) * c.sd_v)::numeric, 1)::float,
  round((c.sd_v  * (0.8 + random() * 0.4))::numeric, 1)::float,
  round((c.avg_v + (random() - 0.5) * c.sd_v * 0.7)::numeric, 1)::float,
  round((c.min_v + (c.avg_v - c.min_v) * 0.25)::numeric, 1)::float,
  round((c.min_v + (c.avg_v - c.min_v) * 0.55)::numeric, 1)::float,
  round((c.avg_v + (c.max_v - c.avg_v) * 0.35)::numeric, 1)::float,
  round((c.avg_v + (c.max_v - c.avg_v) * 0.65)::numeric, 1)::float,
  -- during (9 cols: no count_value)
  c.min_v, c.max_v,
  round((c.avg_v + (random() - 0.5) * c.sd_v)::numeric, 1)::float,
  round((c.sd_v  * (0.8 + random() * 0.4))::numeric, 1)::float,
  round((c.avg_v + (random() - 0.5) * c.sd_v * 0.7)::numeric, 1)::float,
  round((c.min_v + (c.avg_v - c.min_v) * 0.25)::numeric, 1)::float,
  round((c.min_v + (c.avg_v - c.min_v) * 0.55)::numeric, 1)::float,
  round((c.avg_v + (c.max_v - c.avg_v) * 0.35)::numeric, 1)::float,
  round((c.avg_v + (c.max_v - c.avg_v) * 0.65)::numeric, 1)::float,
  -- after (10 cols: count + min/max/avg/sd/median/p10/p25/p75/p90)
  (c.avg_v * (3 + random() * 2))::int,
  c.min_v, c.max_v,
  round((c.avg_v + (random() - 0.5) * c.sd_v)::numeric, 1)::float,
  round((c.sd_v  * (0.8 + random() * 0.4))::numeric, 1)::float,
  round((c.avg_v + (random() - 0.5) * c.sd_v * 0.7)::numeric, 1)::float,
  round((c.min_v + (c.avg_v - c.min_v) * 0.25)::numeric, 1)::float,
  round((c.min_v + (c.avg_v - c.min_v) * 0.55)::numeric, 1)::float,
  round((c.avg_v + (c.max_v - c.avg_v) * 0.35)::numeric, 1)::float,
  round((c.avg_v + (c.max_v - c.avg_v) * 0.65)::numeric, 1)::float
FROM (VALUES
  (1300::bigint,  0.0,  15.0,   3.0,  1.2),
  (1301::bigint,  0.0,  30.0,   5.0,  3.0),
  (1302::bigint, 15.0,  60.0,  28.0,  6.0),
  (1303::bigint, 80.0, 220.0, 130.0, 20.0),
  (1304::bigint, 50.0, 130.0,  79.0, 12.0),
  (1305::bigint,  4.0,  14.0,   7.5,  2.0),
  (1306::bigint,  5.0, 150.0,  72.0, 25.0),
  (1307::bigint, 20.0, 300.0, 110.0, 38.0)
) AS c(covariate_id, min_v, max_v, avg_v, sd_v)
CROSS JOIN (SELECT database_id FROM app2.database_meta_data
            WHERE database_id IN ('db_alpha','db_beta','db_gamma','db_delta','db_epsilon','db_zeta')) d
CROSS JOIN (VALUES
  (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),
  (15),(16),(17),(18),(19),(20),(21),(22),(23),(24),(25),(26),(27),(28)
) AS p(cc_id);

-- cm_target_comparator (new lookup table — target_id/comparator_id moved here)
INSERT INTO app2.cm_target_comparator VALUES
  (1,  500, 600,  NULL),
  (2, 1600, 1200, NULL),
  (3, 1700, 1800, NULL),
  (4, 1900, 500,  NULL),
  (5, 2000, 1900, NULL),
  (6, 2600, 2700, NULL);

-- cm_target_comparator_outcome (uses target_comparator_id FK)
INSERT INTO app2.cm_target_comparator_outcome VALUES
  (700,  1, NULL, 1),(800,  1, NULL, 1),(300,  0, 1.0, 1),(2400, 1, NULL, 1),
  (2400, 1, NULL, 2),(300,  1, NULL, 2),(800,  0, 1.0, 2),
  (700,  1, NULL, 3),(800,  1, NULL, 3),(300,  0, 1.0, 3),
  (300,  1, NULL, 4),(400,  1, NULL, 4),(800,  0, 1.0, 4),
  (700,  1, NULL, 5),(400,  1, NULL, 5),(2400, 1, NULL, 5),
  (800,  1, NULL, 6),(2800, 1, NULL, 6),(700,  0, 1.0, 6);

-- cm_result (uses target_comparator_id instead of target_id + comparator_id)
INSERT INTO app2.cm_result
SELECT a.analysis_id, tco.target_comparator_id, tco.outcome_id,
  round((0.5 + random() * 2.0)::numeric, 2),
  round((0.3 + random() * 1.2)::numeric, 2),
  round((1.2 + random() * 2.5)::numeric, 2),
  round(random()::numeric, 2),
  round((ln(0.5 + random() * 2.0))::numeric, 3),
  round((0.08 + random() * 0.22)::numeric, 2),
  d.database_id
FROM app2.cm_target_comparator_outcome tco
CROSS JOIN (VALUES ('db_alpha'),('db_beta'),('db_gamma'),('db_delta'),('db_epsilon')) AS d(database_id)
CROSS JOIN (VALUES (1),(2),(3)) AS a(analysis_id);

--
-- SCHEMA: db_catalog
--
DROP SCHEMA IF EXISTS db_catalog CASCADE;
CREATE SCHEMA db_catalog;

CREATE TABLE db_catalog.db_list (
    db_name     VARCHAR(256) NOT NULL,
    schema_name VARCHAR(128) NOT NULL,
    release_date DATE        NOT NULL
);

INSERT INTO db_catalog.db_list VALUES
  ('Study v1 (2024 Q2)', 'app',  '2024-06-01'),
  ('Study v2 (2024 Q4)', 'app2', '2024-12-01');
