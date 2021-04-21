from flask import Flask,request,g, send_file
import json
import sqlite3
import csv
from datetime import datetime
import re
import logging
DATABASE = 'measurements.db'

app = Flask(__name__)


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db


def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv


def export_csv(_id=None, sensors=None):
	if sensors is not None:
		sensors = re.findall('[A-Za-z]+', request.args.get('sensors'))
	if _id is not None:
		_id = ''.join(['\'', _id.replace('\'', ''), '\''])
	query = f"SELECT {', '.join(['timestamp', 'x', 'y', 'z', ', '.join(sensors)]) if sensors else '*'} FROM MEASUREMENTS{f' WHERE deviceId = {_id}' if _id else ''};"
	app.logger.debug(f'Generated query: {query}')
	cur = get_db().cursor()
	cur.execute(query)
	with open(csv_file:='results/latest_output.csv', 'w') as out_csv_file:
		csv_out = csv.writer(out_csv_file)
		csv_out.writerow([d[0] for d in cur.description])
		for result in cursor:
			csv_out.writerow(result)
	cursor.close()
	return csv_file


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


@app.route('/', methods=['GET', 'POST'])
def index():
    # print("data: ", request.data)
    jdata = json.loads(request.data)
    for blob in jdata['measurements']:
        # print("Pushing ", [blob['timestamp'], 0, 'test', blob['x'], blob['y'], blob['z']])
        query_db("INSERT INTO MEASUREMENTS (timestamp, type, deviceId, x, y, z) VALUES (?, ?, ?, ?, ?, ?);", 
            args=[blob['timestamp'], 0 if jdata['type'] == 'accelerometer' else -1, 'test', blob['x'], blob['y'], blob['z']])
        get_db().commit()
    return 'OK'


@app.route('/secret', methods=['GET'])
def secret():
    query_result = query_db("SELECT timestamp,x,y,z FROM MEASUREMENTS;")
    return f'{"".join([f"<p>{q}</p>" for q in query_result])}'


@app.route('/download', methods=['GET'])
def download():
	sensors = request.args.get('sensors')
	_id = request.args.get('id')
	try:
		csv_file = export_csv(_id, sensors)
		return send_file(csv_file, as_attachment=True)
	except sqlite3.OperationalError as e:
		app.logger.warning(f'Exception {e}!')
		return f'<h1><p>An error occured while creating the csv file<p></h1>{e}'


if __name__ == '__main__':
	app.logger.setLevel(logging.DEBUG)
	app.logger.warning('Starting as app!')
	app.run(debug=True)