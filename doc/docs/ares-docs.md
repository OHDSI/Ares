# ARES Documentation

## Background

ARES is A Research Exploration System designed for use in the study of patient level observational data that has been
converted into the Observational Medical Outcomes Partnership (OMOP) Common Data Model (CDM). ARES was developed by
Frank DeFalco, a member of the Observational Health Data Sciences & Informatics (OHDSI) community.

### OHDSI

The Observational Health Data Sciences and Informatics (or OHDSI, pronounced "Odyssey") program is a multi-stakeholder,
interdisciplinary collaborative to bring out the value of health data through large-scale analytics. All our solutions
are open-source. [Learn more about OHDSI](https://www.ohdsi.org).

## Installation

### Requirements

- git client ([GitHub Desktop](https://desktop.github.com/) recommended). On macOS git comes preinstalled and can be
  accessed via the Terminal app. On linux systems might require installation using the appropriate package manager.
- Node.js v18 or higher is required. [Download link](https://nodejs.org/en/download/package-manager)
- NPM (node package manager) - installed by default with Node.js

### Installation Steps

#### Using pre-built files

Open the [Ares releases](https://github.com/OHDSI/Ares/releases) page and download the latest available release
(Ares.x.x-beta.zip), unpack the zip archive and serve using your favourite web server.

Here's an example running Ares using the "http-server" web server:

```bash
    npm install -g http-server #download and install the http-server web server
    
    http-server aresFolder #replace with the name of the folder containing Ares files
```

The link to the app will be available within the terminal once the http-server is launched.

#### Building manually

Begin by downloading the source code for the ARES web application, which can be obtained by cloning the repository found
on [Github](https://github.com/ohdsi/ares).

```bash
   git clone https://github.com/ohdsi/ares
```

Once the repository is cloned locally the application can be built by using
npm. These steps should be run from a bash shell or command prompt and are as follows:

```bash
   cd aresDirectory #navigate to the directory Ares was cloned into
   npm install #install Ares dependencies
   npm run build -- --base=/ # Build the app. Replace "/" if you wish to run Ares within a subdirectory
```

The <span style="color:#81A1C1">"--base"</span>
option is used to specify the base public path of the app. The default value is <span style="color:#3DD68C">"
/ares/"</span> in case this option is not indicated.

The npm build process will create an output directory named <span style="color:#3DD68C">"/dist"</span> which will
contain all files required for the ARES web
application. These files should be placed in a directory that is served by any web server (like http-server), typically deployed in an
<span style="color:#3DD68C">"/ares"</span> subdirectory (you can override that with the <span style="color:#81A1C1">"
--base"</span> option as shown above.

#### Running in dev mode

The app could also be launched in dev mode and served by the built-in web server instantly. Run the following after
cloning the repo and running <span style="color:#88C0D0">"npm install"</span>

```bash
   npm run serve
```

Once the server is running, the app will be available at http://localhost:8080/ares (port 8080 is the default value and
might be different if it's already being used by another app).

After completing the deployment of the web application the data files for ARES must be placed in
the <span style="color:#3DD68C">"/data"</span> subfolder
within the <span style="color:#3DD68C">"/yourAresDirectory/public/"</span> directory. The ARES data files are generated
from your
existing OMOP CDM database and require
both [Achilles](https://github.com/ohdsi/achilles)
and [DataQualityDashboard](https://github.com/ohdsi/dataqualitydashboard).

Here's an example script to generate Ares files based on a sample dataset (replace connectionDetails to generate results
for your database).

```r
# DatabaseConnector::downloadJdbcDrivers("postgresql","D:/OHDSI/Drivers") - use it to download the JDBC driver
options(connectionObserver = NULL)

cdmDatabaseSchema = "main" #indicate the name of the cdm schema you created
resultsDatabaseSchema = "main" #indicate the name of the results schema you created
vocabDatabaseSchema = "main" #vocab should be located in the cdm schema
numThreads = 1 #i only managed to get till the end in single-threaded mode, had problems utilizing 2 or more
cdmSourceName = 'synthea'
cdmVersion = "5.4" #do not change

aresDataDirectory = "./data" #output directory
sourceReleaseKey = AresIndexer::getSourceReleaseKey(connectionDetails, cdmDatabaseSchema)
sourceFolders = "./data" #source files folder for indexers.

connectionDetails <- Eunomia::getEunomiaConnectionDetails() #Provides a sample dataset

# Example connection details 
#connectionDetails <- DatabaseConnector::createConnectionDetails(
#  dbms     = dbms, #your database management system
#  server   = server, #server address
#  user     = user,
#  password = password,
#  pathToDriver = pathToDriver #location of the JDBC driver
#)


# Run Achilles
Achilles::achilles(
  connectionDetails,
  cdmDatabaseSchema = cdmDatabaseSchema ,
  resultsDatabaseSchema= resultsDatabaseSchema,
  vocabDatabaseSchema = vocabDatabaseSchema,
  numThreads = 1,
  cdmVersion = "5.4.0",
  createIndices = F,
  createTable = T,
  smallCellCount = 0,
)
# Export statistics generated by Achilles
Achilles::exportToAres(
  connectionDetails = connectionDetails,
  cdmDatabaseSchema = cdmDatabaseSchema,
  resultsDatabaseSchema = resultsDatabaseSchema,
  vocabDatabaseSchema = vocabDatabaseSchema,
  outputPath = sourceFolders,
)

datasourceReleaseOutputFolder <- file.path(aresDataDirectory, releaseKey)

# Run Data Quality Dashboard
DataQualityDashboard::executeDqChecks(
  connectionDetails = connectionDetails,
  cdmDatabaseSchema = cdmDatabaseSchema,
  resultsDatabaseSchema = resultsDatabaseSchema,
  vocabDatabaseSchema = vocabDatabaseSchema,
  cdmSourceName = cdmSourceName,
  numThreads = numThreads,
  outputFolder = datasourceReleaseOutputFolder,
  outputFile = "dq-result.json",
  verboseMode = T,
  writeToTable = F
)


list <- list.dirs(sourceFolders, recursive = FALSE)
AresIndexer::augmentConceptFiles(sourceFolders = list)
AresIndexer::buildExportQueryIndex(aresDataDirectory)
AresIndexer::buildNetworkIndex(list, outputFolder = aresDataDirectory)
AresIndexer::buildDataQualityIndex(list, outputFolder = aresDataDirectory)
AresIndexer::buildNetworkUnmappedSourceCodeIndex(list, outputFolder = aresDataDirectory)
```

Visiting the ARES website will now show the data results for your current network. Each individual CDM needs to be
processed in order for it to be available in ARES. CDM data sources with the same source name will be versioned using
the release key allowing analysis across multiple versions of the same data source. An example of generating a complete
network of different data sources and loading them into ARES can be
found [here](https://gist.github.com/fdefalco/35b7844626a9d8808d99bf5990e46ed2).

## Visualizations

Visualizations are used throughout ARES to assist in the interpretation of information. In this section sample
visualizations are presented with descriptions to ensure they are well understood.

### Preattentive Processing

[Visualization Techniques Cheat Sheet](https://policyviz.com/2018/08/07/dataviz-cheatsheet/)

### Interpreting Box-Whisker Diagrams and Inter-Quartile Range (IQR)

![IQR](sample-iqr.png)

Box-whisker diagrams present a simple picture representing the distribution of a set of data which include the values
for the minimum, maximum, and quartiles of the distribution. They are also known as boxplots.

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

The roadmap for ARES is maintained on the GitHub repository.

## OHDSI Libraries

ARES presents research generated through the suite of OHDSI related packages.

- Achilles
- Data Quality Dashboard
- Database Connector
- Sql Render
- Castor

## Open Source Ecosystem

ARES leverages many open source libraries and tools to achieve its goals without which the task would be entirely
insurmountable.

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
