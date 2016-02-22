import csv
import json

csvfile = open('./data/stops_subway.txt','r')
jsonfile = open('./data/stops_subway.json','w')

fieldnames = ("stop_id","stop_code","stop_name","stop_desc","stop_lat","stop_lon","zone_id","stop_url","location_type","parent_station","wheelchair_boarding")
reader = csv.DictReader( csvfile, fieldnames)
jsonfile.write('{stops:[')
for rows in reader:
    json.dump(rows,jsonfile)
    jsonfile.write(',\n')
jsonfile.write(']}')
