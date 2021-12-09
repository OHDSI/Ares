# ARES HELP

::: warning
<div class="show-content"><h2>Table of contents</h2></div>

[toc]
:::

## Background
ARES is A Research Exploration System designed for use in the study of patient level observational data that has been converted into the Observational Medical Outcomes Partnership (OMOP) Common Data Model (CDM).  ARES was developed by Frank DeFalco, a member of the Observational Health Data Sciences & Informatics (OHDSI) community.

### OHDSI
The Observational Health Data Sciences and Informatics (or OHDSI, pronounced "Odyssey") program is a multi-stakeholder, interdisciplinary collaborative to bring out the value of health data through large-scale analytics. All our solutions are open-source.  [Learn more about OHDSI](https://www.ohdsi.org).

## Visualizations
Visualizations are used throughout ARES to assist in the interpretation of information.  In this section sample visualizations are presented with descriptions to ensure they are well understood.

### Preattentive Processing

[Visualization Techniques Cheat Sheet](https://policyviz.com/2018/08/07/dataviz-cheatsheet/)

### Interpreting Box-Whisker Diagrams and Inter-Quartile Range (IQR)
Box-whisker diagrams present a simple picture representing the distribution of a set of data which include the values for the minimum, maximum, and quartiles of the distribution.  They are also known as boxplots.

![IQR](img/sample-iqr.png)
- A - Lowest value
- B - Lower Quartile (25%)
- C - Median (50%)
- D - Upper Quartile (75%)
- E - Highest Value

## Data Network reports

### Overview
### Quality Assessment 
### Population Overview
### Data Strand Report

## Data Source reports

### Data Quality History
### Domain Continuity

## Data Source Release reports

### Data Quality
### Person
### Data Density
### Observation Period
### Conditions
### Condition Eras
### Drugs
### Drug Eras
### Visit Occurrence
### Visit Detail
### Measurements
### Observations
### Procedures
### Device Exposures
### Death
### Unmapped Source Codes
### Performance
### Metadata
### Visit Detail

## Data generation using AresIndexer

### Prerequisites:

* RStudio – please install only the x86-64 version of the IDE (you can choose that in the installer). Otherwise you may run into rJava issues. 

* RTools (windows only): https://cran.r-project.org/bin/windows/Rtools/ (please do not create the .renviron file as the as the guide sugests) 

* R: v4.1.1 tested 

* Postgresql – v14 tested 

* OpenJDK – v11 tested (please make sure JAVA_HOME is configured properly, and the binaries’ architecture is the same as R’s (for example, if you run the x86-64 version of R please install the x86-64 version of OpenJDK, otherwise the rJava package might throw an error.)) 

* libxml2-dev for Linux 

* A bit of luck and patience 

### Data Generation

#### Step 1

1. Download the 2.7.0 release of Synthea: https://github.com/synthetichealth/synthea/releases/tag/v2.7.0  

2. Open a Java IDE (I used IntelijIdea) and wait until all the dependencies are installed, then run the following command in your console:  **./run_synthea -p 1000 --exporter.csv.export true**. You can find the resulting output data in **output/csv** located in the project folder. 

3. For the generated files to be accepted by the script (ETL-Synthea to be precise) you need to modify each of the UDI column cell’s values in **csv/devices.csv** to be <= 50 in length, otherwise you will receive an error halfway through the process. 

#### Step 2

1. Obtain the Vocabulary files and unpack them in the desired folder. 

2. Download the script and open it in RStudio. 

3. Install the required R packages (copy and paste that into the R console): **install.packages(c("DatabaseConnector", "devtools", "SqlRender"))**

4. Download and unpack the JDBC driver (paste into the R console): **DatabaseConnector::downloadJdbcDrivers(“postgresql”, “/indicate any folder you want))**

5. Install the OHDSI packages (copy and paste the following into the R console): 

   * **devtools::install_github("OHDSI/ETL-Synthea")**, 
    
   * **devtools::install_github("OHDSI/Achilles")**, 
    
   * **devtools::install_github("OHDSI/DataQualityDashboard")**, 
    
   * **devtools::install_github("OHDSI/AresIndexer")** 



6. Create a new Postgresql database **“synthea10”**, add three schemas to it: **cdm_synthea10**, **native** and **results** (well, you can call them anything you like, but do not forget to indicate their names in the script).

7. Specify your server address, username, database user password and the path to JDBC driver that you downloaded. 

8. Set the **SyntheaFileLoc** (the files you generated on step 1) and **vocabFileLoc** (the vocabulary files) variables, leave everything else as is. 

9. Specify the directory for the **/ares1** folder (you can change its name however you wish, but leave the **Synthea** folder intact).

10. Run the script.

## Roadmap
The roadmap for ARES is maintained on the github repository.

## OHDSI Libraries
ARES presents research generated through the suite of OHDSI related packages.
- Achilles
- Data Quality Dashboard
- Database Connector
- Sql Render
- Castor

## Open Source Ecosystem
ARES leverages many open source libraries and tools to achieve its goals without which the task would be entirely insurmountable.
- Vue
- Vuetify
- axios
- Vega
- Vega-lite
- vega-embed
- codemirror
- d3
- markdown-it
- markdown-it-vue
- npm
- lodash
- Material Design

## Acknowledgements
Many people have provided valuable feedback in the development of ARES.

- Clair Blacketer
- Alan Andryc
- Patrick Ryan
