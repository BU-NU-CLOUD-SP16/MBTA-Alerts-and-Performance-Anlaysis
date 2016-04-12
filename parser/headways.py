import urllib
import urllib2
import json
import sqlite3 as lite
import sys
import time
'''
#load api and key from json file
with open('../auth/api.json') as data_file:
    auth = json.load(data_file)
    api_key = auth["key"]
    api = auth["api"]

#Minutes wanted for the interval
interval = 30
#Date from docs example
startTime = 1458464400
#Date from docs example
endTime = startTime - 30*60
#pick a station
stationID = 70076

params = {
 'api_key' : api_key,
 'format' : 'json',
 'from_datetime' : startTime,	
 'to_datetime' : endTime,
 'stop' : stationID,
}
encoded_params = urllib.urlencode(params)

url = api + encoded_params

# reads data from the API endpoint
# result = urllib2.urlopen(url).read()
'''


# Database stuff starts here

con = None
queryTime = time.time()
stop_id = int(raw_input()) #some stop ID that we pass in
print(queryTime)

try:
    con = lite.connect('mbta_subway')
    cur = con.cursor()
     # opening json stops file:
    with open('./headways.json') as data_file:
        all_stops = json.load(data_file)
        for headway in headways:
            table_time = int(queryTime) #
            table_stop_id = int(stop_id)
            #table_headway = int(head['headway_time_sec'])
            table_current_dep = int(current_dep['current_dep_dt'])

            to_insert = (table_current_dep, table_stop_id)
                    

            print(to_insert)

    con.commit()

except lite.Error, e:

    print "Error %s:" % e.args[0]
    sys.exit(1)

finally:

    if con:
        con.close()


