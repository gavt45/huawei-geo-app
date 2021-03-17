from flask import Flask,request,g
import json
import sqlite3

DATABASE = 'measurements.db'

app = Flask(__name__)

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

@app.route('/', methods=['GET', 'POST'])
def hello_world():
    # print("data: ", request.data)
    jdata = json.loads(request.data)
    for blob in jdata['measurements']:
        # print("Pushing ", [blob['timestamp'], 0, 'test', blob['x'], blob['y'], blob['z']])
        query_db("INSERT INTO MEASUREMENTS (timestamp, type, deviceId, x, y, z) VALUES (?, ?, ?, ?, ?, ?);", 
            args=[blob['timestamp'], 0 if jdata['type'] == 'accelerometer' else -1, 'test', blob['x'], blob['y'], blob['z']])
        get_db().commit()
    return 'OK'

@app.route('/secret', methods=['GET'])
def hello_world1():
    query_result = query_db("SELECT timestamp,x,y,z FROM MEASUREMENTS;")
    return f'{query_result}'
