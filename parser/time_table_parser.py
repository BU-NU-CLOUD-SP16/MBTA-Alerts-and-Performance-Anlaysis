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
with open('../auth/api.json') as data_file:
    auth = json.load(data_file)
    api_key = str(auth["key"])
    api = str(auth["api"])

con = lite.connect('mbta_subway.db')
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
#'CREATE TABLE time_table(time integer, line text, direction integer, stop_id integer, headway integer);')


#iterate through all stops and insert headway info into database
for stop in all_stops[0:5]:
    count = 0
    headwaySum = 0

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
                count += 1

            headwayAvg = headwaySum/count
            to_insert = (table_time, table_route_id, table_direction, table_stop_id, headwayAvg, dayOfWeek)
            cur.execute('INSERT INTO time_table(time , line , direction , stop_id , headway, dayOfWeek) VALUES (?, ?, ?, ?, ?, ?)', to_insert)      

            con.commit()

        except lite.Error, e:

            print "Error %s:" % e.args[0]
            sys.exit(1)


            if con:
                con.close()




