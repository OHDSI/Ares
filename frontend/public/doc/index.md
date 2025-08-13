# ARES Documentation

<div class="show-content"><h2>Table of contents</h2></div>

[toc]

## Background

ARES is A Research Exploration System designed for use in the study of patient level observational data that has been converted into the Observational Medical Outcomes Partnership (OMOP) Common Data Model (CDM). ARES was developed by Frank DeFalco, a member of the Observational Health Data Sciences & Informatics (OHDSI) community.

### OHDSI

The Observational Health Data Sciences and Informatics (or OHDSI, pronounced "Odyssey") program is a multi-stakeholder, interdisciplinary collaborative to bring out the value of health data through large-scale analytics. All our solutions are open-source. [Learn more about OHDSI](https://www.ohdsi.org).

## Installation

#### Requirements

- git client ([Github Desktop](https://desktop.github.com/) recommended)
- npm [Installation Instructions](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

#### Installation Steps

Begin by downloading the source code for the ARES web application, which can be obtained by cloning the repository found on [Github](https://github.com/ohdsi/ares). Once the repository is cloned locally the application can be built by using npm. These steps should be run from a bash shell or command prompt and are as follows:

```bash
   git clone https://github.com/ohdsi/ares
   cd ares
   npm install
   npm run build
```

The npm build process will create an output directory named /dist which will contain all files required for the ARES web application. These files should be placed in a directory that is served by any web server, typically deployed in an /ares subdirectory.

After completing the deployment of the web application the data files for ARES must be placed in the /data subfolder within the /ares directory. The ARES data files are generated from your existing OMOP CDM database and require both [Achilles](https://github.com/ohdsi/achilles) and [DataQualityDashboard](https://github.com/ohdsi/dataqualitydashboard). The following steps can be executed in R to generate the necessary ARES data files.

```R
   # configuration
   aresDataRoot <- "/webserver_root/ares/data"
   cdmVersion <- "5.3"
   cdmDatabaseSchema <- "cdm_schema"
   resultsDatabaseSchema <- "result_schema"
   cdmSourceName <- "source_name"

   # retrieve environment settings
   dbms <- Sys.getenv("dbms")
   server  <- Sys.getenv("server")
   user <- Sys.getenv("user")
   password <- Sys.getenv("password")
   pathToDriver <- Sys.getenv("path_to_driver")

   # configure connection
   connectionDetails <- DatabaseConnector::createConnectionDetails(
      dbms     = dbms,
      server   = server,
      user     = user,
      password = password,
      pathToDriver = pathToDriver
   )

   # run achilles
   Achilles::achilles(
      cdmVersion = cdmVersion,
      connectionDetails = connectionDetails,
      cdmDatabaseSchema = cdmDatabaseSchema,
      resultsDatabaseSchema = resultsDatabaseSchema
   )

   # obtain the data source release key (naming convention for folder structures)
   releaseKey <- AresIndexer::getSourceReleaseKey(connectionDetails, cdmDatabaseSchema)
   datasourceReleaseOutputFolder <- file.path(aresDataRoot, releaseKey)

   # run data quality dashboard and output results to data source release folder in ares data folder
   dqResults <- DataQualityDashboard::executeDqChecks(
      connectionDetails = connectionDetails,
      cdmDatabaseSchema = cdmDatabaseSchema,
      resultsDatabaseSchema = resultsDatabaseSchema,
      vocabDatabaseSchema = cdmDatabaseSchema,
      cdmVersion = cdmVersion,
      cdmSourceName = cdmSourceName,
      outputFile = "dq-result.json",
      outputFolder = datasourceReleaseOutputFolder
   )

   # export the achilles results to the ares folder
   Achilles::exportAO(
      connectionDetails = connectionDetails,
      cdmDatabaseSchema = cdmDatabaseSchema,
      resultsDatabaseSchema = resultsDatabaseSchema,
      vocabDatabaseSchema = vocabDatabaseSchema,
      outputPath = aresDataRoot
   )

   # perform temporal characterization
   outputFile <- file.path(datasourceReleaseOutputFolder, "temporal-characterization.csv")
   Achilles::performTemporalCharacterization(
      connectionDetails = connectionDetails,
      cdmDatabaseSchema = cdmDatabaseSchema,
      resultsDatabaseSchema = resultsDatabaseSchema,
      outputFile = outputFile
   )

   # augment concept files with temporal characterization data
   AresIndexer::augmentConceptFiles(releaseFolder = file.path(aresDataRoot, releaseKey))

   # build network level index for all existing sources
   sourceFolders <- list.dirs(aresDataRoot,recursive=F)
   AresIndexer::buildNetworkIndex(sourceFolders = sourceFolders, outputFolder = aresDataRoot)
   AresIndexer::buildDataQualityIndex(sourceFolders = sourceFolders, outputFolder = aresDataRoot)
   AresIndexer::buildNetworkUnmappedSourceCodeIndex(sourceFolders = sourceFolders, outputFolder = aresDataRoot)

```

Visiting the ARES web site will now show the data results for your current network. Each individual CDM needs to be processed in order for it to be available in ARES. CDM data sources with the same source name will be versioned using the release key allowing analysis across multiple versions of the same data source. An example of generating a complete network of different data sources and loading them into ARES can be found [here](https://gist.github.com/fdefalco/35b7844626a9d8808d99bf5990e46ed2).

## Visualizations

Visualizations are used throughout ARES to assist in the interpretation of information. In this section sample visualizations are presented with descriptions to ensure they are well understood.

### Preattentive Processing

[Visualization Techniques Cheat Sheet](https://policyviz.com/2018/08/07/dataviz-cheatsheet/)

### Interpreting Box-Whisker Diagrams and Inter-Quartile Range (IQR)

Box-whisker diagrams present a simple picture representing the distribution of a set of data which include the values for the minimum, maximum, and quartiles of the distribution. They are also known as boxplots.

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
- PrimeVue
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
