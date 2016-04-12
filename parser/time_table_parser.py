import urllib
import urllib2
import json
import sqlite3 as lite
import sys
import time


queryTime = int(time.time())
count = 0

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

#drop old table
try:
    cur.execute('DROP TABLE time_table')
except lite.Error as e:
    print("Error")

#create new table
cur.execute('CREATE TABLE time_table(time integer, line text, direction, integer, stop_id integer, headway integer);')


#iterate through all stops and insert headway info into database
for stop in all_stops[0:5]:

    params = {
     'api_key' : api_key,
     'format' : 'json',
     'from_datetime' : startTime,	
     'to_datetime' : endTime,
     'stop' : stop[0],
    }
    encoded_params = urllib.urlencode(params)

    url = api + encoded_params
    print(count)
    
    # reads data from the API endpoint
    result = urllib2.urlopen(url).read()
    
    # Database stuff starts here

    try:
        headways = json.loads(result)
        for headway in headways['headways']: #headways_file['headways']: #dive into individual headways
            table_time = int(queryTime) #time based on query time
            table_stop_id = int(stop[0])
            table_direction = int(headway['direction']) #direction from headway.json
            table_headway = int(headway['headway_time_sec']) #headway interval from headway.json
            #table_current_dep = int(current_dep['current_dep_dt'])
            table_route_id = str(headway['route_id'])

            to_insert = (table_time, table_route_id, table_direction, table_stop_id, table_headway)
            cur.execute('INSERT INTO time_table(time , line , direction , stop_id , headway) VALUES (?, ?, ?, ?, ?)', to_insert)      

        con.commit()

    except lite.Error, e:

        print "Error %s:" % e.args[0]
        sys.exit(1)


        if con:
            con.close()
    count = count + 1






