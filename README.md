### **MBTA Alerts and Performance Analysis**
**EC500 Cloud Computing Project, Spring 2016**
- [Live Demo](ec2-52-34-3-119.us-west-2.compute.amazonaws.com)
- [Video Presentation](https://youtu.be/LLjoNVFAMVY)

##### Contributors:

- Ben Snyder ( [johnbensnyder](https://github.com/johnbensnyder) )
- Daniel Gorelick ( [dqgorelick](https://github.com/dqgorelick) )
- Eddy Luo ( [edluo1](https://github.com/edluo1) )
- EJ Fitzpatrick ( [ejfitz](https://github.com/ejfitz) )


#### Final deliverables:
1. **Data Collection**: Explanation of R code and methods used to create statistical models.
2. **Parser**: Python scripts which query MBTA API and store results into a Sqlite database.
2. **Web Application**: Displays live results of statistical models, linked to the sqlite database created by the parser.
3. **GTFS Realtime**: Node.js script which gathers most recent MBTA train positions, alerts, or perforamcne notifications.

#### Running the application:
Requirements:
- Node.js version 0.12.2+
- Python version 2.7+
- Sqlite3

**Creating database**: The current sqlite database mbta_subway.db contains only the last data collected for the project. It is recommended to run the `time_table_parser.py` script on a cron job to have the most up-to-date results. A developer required to make the API calls, these can be attained [here](http://realtime.mbta.com/portal). The file which is not on the github will need to be created:  *auth>api.json*. This file contains the following JSON object:
```
{
    "api": "http://realtime.mbta.com/developer/api/v2.1/headways?",
    "key": "YOUR KEY HERE"
}
```

**Launching web application**: The Node application acts as the front-end server, reading the data from the database. Navigate to the *webapp* directory and run `npm install` to install all of the node packages dependencies. For development, it is recommended to use gulp, by running `npm install -g gulp` and then `gulp` to start the task runner.

Once all of the dependencies are installed, run `node server.js` and navigate to `localhost:8080` to see the demo.

#### Data Collection and Analysis
The link below contains all R files and data discussed above, as well as output graphs. The files are not included directly on github due to their size.

[R data Google Drive](https://drive.google.com/open?id=0Bzoq-ToJ4HURcGNiZGp3M1BUSEU)

Our initial analysis focused on determining the how well alerts predict actually subway performance. We first extract all alert data for January 2016 from a file provided directly from the MBTA. The zip file Alerts-2016-02-13.zip contains these alerts in JSON format. The JSON files should be extracted a single directory. In the alerts.R file, set this as the working directory. The alerts.R script will extract all alert data, and parse out alerts involving unexpected delays (the type of alert we are interested in for our analysis) and outputs the file subwayAlertsCleaned.csv.

Once the alerts file has been created, it can be combined with the performance metrics included in the JanData.csv file. The wait_times.R file will combine these two datasets, and generate fixed effect models of subway performance. The results show that on average minor delays predict trains arriving 36 seconds later, moderate 61 seconds, and severe 99 seconds. We then examine how delays propogate through a subway line from the time they are issued. For this, you will need the stop orders for each subway line. The stop_orders.R collects all stop data from the MBTA api, and produces the stopsList.csv file. This file contains information on stop orders by line. The propogation.R file uses the stopList.csv, janData.csv, and subwayAlertsCleaned.csv to generate plots of wait times at different intervals along the subway line following the issuance of an alert.

The exploratory analysis also examined the degree to which performance metrics predict alerts being issued, and what performance metrics are good predictors of both alert issuance and performance. To do this, we examined both dwell times and headways. Dwell times are the amount of time a train is sitting in a station. Headways are the times between trains. Rather than simply using these values directly to predict performance, we found that taking the standard deviation of headways and dwells over a 15 to 30 minute period was a better predictor of alert issuance.

The allDwells.R file loads dwell data from the allDwells.csv file, and combines it with the subwayAlertsCleaned.csv file to create models of how well dwells predict alert issuance. Similarly, the allHeadways.R file will load the allHeadways.csv file and create the same predictive models. Note that the APIDwells.R and APIHeadways.R files are used to pull dwell and headway data from the MBTA api. These API calls are not currently open to the public, and their specification have changed several times recently. To avoid these issues with replication, the full datasets are included in this file.

We found headway timing and variance to be the best predictor of alert issuance. Based on this, the MBTA asked us create a system to monitor headways, to better determine when alerts should be issued. Therefore, we first determine distribution for all stations by time of day and day of the week. For example, we have the distribution of historical headways for the period from 6:30-7:00 pm for Park Street on weekdays. An R script to produce this distributions is contained in the headway_distributions.R file. These data give us a baseline of comparison for what headways are within the normal range, and what is beyond what we would expect. Additionally, these distributions give of the ability to examine current variability versus past variability for a comparable time. Our final product tracks where current headways sit compared to these historic distributions, as well as compared to what the MBTA considers to be an acceptable threshold of performance.
