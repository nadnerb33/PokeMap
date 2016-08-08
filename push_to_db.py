'''
pass a tab separated txt file to this script and it will push all data into the sqlite database. 
e.g push_to_db.py spawns0.txt 

This script is designed to work with the output from the PGO-mapscan-opt scanner, you can modify it to accept other formats
'''


import sqlite3
import csv
import sys

sqlite_file = 'Spawns.sqlite'
sqlite_encounter_table_name = 'Encounters'
sqlite_spawn_table_name = 'Spawn_Locations'
sqlite_encounter_columns = 'encounterid,spawnid,pokeid,spawntime,time,time2hidden'
sqlite_spawn_columns = "spawnid,lat,lng"



# Connecting to the database file
conn = sqlite3.connect(sqlite_file)
c = conn.cursor()


#spawn0.txt format
#Name    id  SpawnID lat lng spawnTime   Time    Time2Hidden encounterID

with open(sys.argv[1]) as csvfile:
    reader = csv.DictReader(csvfile, delimiter='\t')
    for row in reader:

        try:
            c.execute("INSERT INTO {tn} ({cols}) VALUES ({sid},{lat},{lng})".format(tn=sqlite_spawn_table_name, cols=sqlite_spawn_columns, sid=row['SpawnID'], lat=row['lat'],lng=row['lng']))
        except sqlite3.IntegrityError:
            print('Dupe spawn location - not inseting into db')

        try:
            c.execute("INSERT INTO {tn} ({cols}) VALUES ({eid},{sid},{pid},{stime},{time},{time2h})".format(tn=sqlite_encounter_table_name, cols=sqlite_encounter_columns, eid=row['encounterID'], sid=row['SpawnID'], pid=row['id'], stime=row['spawnTime'], time=row['Time'], time2h=row['Time2Hidden']))
        except sqlite3.IntegrityError:
            print('Dupe encounter - not inseting into db')
conn.commit()
conn.close()

'''

 try:
            c.execute("INSERT INTO {tn} ({cols}) VALUES ({id},{spawnid},{lat},{lng},{time})".\
            format(tn=sqlite_table_name, cols=sqlite_columns, id=row['id'], spawnid=row['SpawnID'], lat=row['lat'],lng=row['lng'],time=row['Time']))
        except sqlite3.IntegrityError:
            print('Dupe pokemon - not inseting into db')





def main():
    push_to_db("Encounters",[1,2,1,1,1,1])

def push_to_db(table,data):
    sqlite_file = 'res/Spawns.sqlite'

    data = ",".join(map(str, data))

    if (table=='Encounters'):
        columns = "EncounterID,SpawnID,PokeID,SpawnTime,Time,Time2Hidden"
    else:
        columns = "SpawnID,Lat,Lng"

    conn = sqlite3.connect(sqlite_file)
    c = conn.cursor()

    try:
        c.execute("INSERT INTO Encounters ({cols}) VALUES ({data})".format(cols=columns, data=data))
        #c.execute("INSERT INTO {tn} ({cols}) VALUES ({data})".format(tn=table, cols=columns, data=data))
    except sqlite3.IntegrityError:
        if LOGGING:
            if (table == 'Encounters'):
                print('Dupe encounter - not inserting into db')
            else:
                print('Dupe spawn location - not inserting into db')

    conn.commit()
    conn.close()

if __name__ == '__main__':
    main()
'''

print "done"