import csv
import json

# csvfile = open('./data/stops_subway.txt','r')
# jsonfile = open('./data/stops_subway.json','w')

csvfile = open('./headway_distributions.csv', 'r')
jsonfile = open('./headway_distributions.json', 'w')


# fieldnames = ("stop_id","stop_code","stop_name","stop_desc","stop_lat","stop_lon","zone_id","stop_url","location_type","parent_station","wheelchair_boarding")

fieldnames = ("StationID","day_of_week","time_of_day","meanHeadway","SDHeadway","Flow_rate");
reader = csv.DictReader( csvfile, fieldnames)
jsonfile.write('{data:[')
for rows in reader:
    json.dump(rows,jsonfile)
    jsonfile.write(',\n')
jsonfile.write(']}')
