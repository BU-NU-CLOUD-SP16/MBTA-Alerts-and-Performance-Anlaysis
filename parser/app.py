import urllib
import urllib2
import json
import sqlite3 as lite
import sys

"""
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
"""


# Database stuff starts here

con = None

try:
    con = lite.connect('mbta_subway.db')
    cur = con.cursor()
    lines = ['blue','red','orange','green-d','green-b','green-c','green-e']
    # opening json stops file:
    with open('./stops-all.json') as data_file:
        all_stops = json.load(data_file)
        for line in lines:
            table_line = str(line)
            for direction in all_stops[line]:
                table_direction = int(direction['direction_id'])
                for stop in direction['stop'] :
                    table_stop_id = int(stop['stop_id'])
                    table_stop_name = str(stop['stop_name'])
                    table_stop_lon = float(stop['stop_lon'])
                    table_stop_lat = float(stop['stop_lat'])
                    to_insert = (table_stop_id, table_stop_name, table_line, table_direction, table_stop_lon, table_stop_lat)
                    cur.execute('INSERT INTO Static (StopID , StopName , Line , Direction , Longitude , Latitude) VALUES (?, ?, ?, ?, ?, ?)', to_insert)
                    print(to_insert)

    con.commit()

except lite.Error, e:

    print "Error %s:" % e.args[0]
    sys.exit(1)

finally:

    if con:
        con.close()




