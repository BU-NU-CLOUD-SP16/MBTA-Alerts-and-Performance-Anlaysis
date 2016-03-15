import urllib
import urllib2
import json

#load api and key from json file
with open('../auth/api.json') as data_file:
    auth = json.load(data_file)
    api_key = auth["key"]
    api = auth["api"]

#Date from docs example
startTime = 1455274800
#Date from docs example
endTime = 1455287820
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

# result = urllib2.urlopen(url).read()
print(url)

