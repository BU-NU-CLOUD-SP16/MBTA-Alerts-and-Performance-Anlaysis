#!/usr/bin/env python

import urllib
import urllib2
import json
import sqlite3 as lite
import sys
import time
import datetime


queryTime = int(time.time())
dayOfWeek = datetime.datetime.today().weekday() #0 = Monday 6 = Sunday

#load api and key from json file
with open('/home/ec2-user/MBTA-Alerts-and-Performance-Anlaysis/auth/api.json') as data_file:
    auth = json.load(data_file)
    api_key = str(auth["key"])
    api = str(auth["api"])

con = lite.connect('/home/ec2-user/MBTA-Alerts-and-Performance-Anlaysis/parser/mbta_subway.db')
cur = con.cursor() #create cursor in object pointing to mbta_subway
cur.execute('SELECT StopID from Static')
all_stops = cur.fetchall() #comes as a list of tuples

#Minutes wanted for the interval
interval = 30
#Date from docs example
endTime = queryTime
#Date from docs example
startTime = endTime - 30*60

#create new table
#'CREATE TABLE time_table(time integer, line text, direction integer, stop_id integer, headway integer, dayOfWeek integer, stdDev integer);')

progress = 0
#iterate through all stops and insert headway info into database
for stop in all_stops:
    print(progress)
    count = 0 #used to find mean and stdDev
    headwaySum = 0
    headwayDiffSum = 0
    stdDev = 0
    headwayList = [] #create list to store each headway in a stop to determine stdDev

    params = {
     'api_key' : api_key,
     'format' : 'json',
     'from_datetime' : startTime,   
     'to_datetime' : endTime,
     'stop' : stop[0],
    }
    encoded_params = urllib.urlencode(params)

    url = api + encoded_params
    
    # reads data from the API endpoint
    result = urllib2.urlopen(url).read()
    
    # Database stuff starts here
    headways = json.loads(result)
    if headways['headways']:
        try:
            table_time = int(queryTime) #time based on query time
            table_stop_id = int(stop[0])
            table_direction = int(headways['headways'][0]['direction']) #direction from headway.json
            table_route_id = str(headways['headways'][0]['route_id'])
            for headway in headways['headways']: #headways_file['headways']: #dive into individual headways
                headwaySum += int(headway['headway_time_sec']) #headway interval from headway.json
                headwayList.append(int(headway['headway_time_sec']))
                count += 1

            headwayAvg = headwaySum/count
            for headway in headwayList:
                headway = (headway - headwayAvg)**2
                headwayDiffSum += headway
            stdDev = (headwayDiffSum/count)**(0.5)

            to_insert = (table_time, table_route_id, table_direction, table_stop_id, headwayAvg, dayOfWeek, stdDev)
            cur.execute('INSERT INTO time_table_new(time , line , direction , stop_id , headway, dayOfWeek, stdDev) VALUES (?, ?, ?, ?, ?, ?, ?)', to_insert)      

            con.commit()

        except lite.Error, e:

            print "Error %s:" % e.args[0]
            sys.exit(1)


            if con:
                con.close()
    progress += 1




