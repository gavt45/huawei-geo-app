from flask import Flask, request, g, send_file
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


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


def export_csv(_id=None, sensors=None):
	if sensors is not None:
		sensors = re.findall('[A-Za-z]+', sensors)
		sensors = [''.join(['"', sensor, '"']) for sensor in sensors]
	if _id is not None:
		_id = re.findall('[A-Za-z0-9]+', _id)
		_id = [''.join(['"', i, '"']) for i in _id]
	select = 'timestamp, deviceId, x, y, z, measurement' if sensors else '*'
	where = ''.join([
			' WHERE ', 
			''.join(['deviceId IN (', ', '.join([i for i in _id]), ')']) if _id else '',
			' AND ' if _id and sensors else '',
			''.join(['type IN (', ', '.join([sensor for sensor in sensors]), ')']) if sensors else ''
		]) if _id or sensors else ''
	query = f"SELECT {select} FROM MEASUREMENTS{where};"
	app.logger.debug(f'Generated query: {query}')
	cur = get_db().cursor()
	cur.execute(query)
	with open(csv_file:='results/latest_output.csv', 'w') as out_csv_file:
		csv_out = csv.writer(out_csv_file)
		csv_out.writerow([d[0] for d in cur.description])
		for result in cur:
			csv_out.writerow(result)
	cur.close()
	return csv_file


@app.route('/', methods=['GET', 'POST'])
def index():
    # print("data: ", request.data)
    jdata = json.loads(request.data)
    for blob in jdata['measurements']:
        # print("Pushing ", [blob['timestamp'], 0, 'test', blob['x'], blob['y'], blob['z']])
        query_db("INSERT INTO MEASUREMENTS (timestamp, type, deviceId, x, y, z, measurement) VALUES (?, ?, ?, ?, ?, ?, ?);", 
            args=[blob['timestamp'], 
            jdata['type'], 
            jdata['deviceId'], 
            blob['x'] if 'x' in blob else None, 
            blob['y'] if 'y' in blob else None, 
            blob['z'] if 'z' in blob else None, 
            blob['measurement']])
        get_db().commit()
    return 'OK'


@app.route('/secret', methods=['GET'])
def secret():
    query_result = query_db("SELECT * FROM MEASUREMENTS;")
    return f'{"".join([f"<h4><p>{q}</p></h4>" for q in query_result])}'


@app.route('/download', methods=['GET'])
def download():
	sensors = request.args.get('sensors')
	_id = request.args.get('id')
	try:
		csv_file = export_csv(_id, sensors)
		return send_file(csv_file, as_attachment=True)
	except sqlite3.OperationalError as e:
		app.logger.warning(f'Exception {e} during creation query!')
		return f'<h1><p>An error occured while creating the csv file!<p></h1><h4><p>Exception: {e}!</p></h4>'


if __name__ == '__main__':
	app.logger.setLevel(logging.DEBUG)
	app.run(debug=True)
