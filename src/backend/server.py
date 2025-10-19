from flask import Flask, request, Response
from flask_cors import CORS
from networktables import NetworkTables as nt

sim = True

nt.initialize(server="127.0.0.1" if sim else "10.14.77.2")

app = Flask(__name__)
CORS(app)

TABLE = "Dashboard"

@app.route('/webhook', methods=['POST'])
def update_dashboard():
    data = request.json
    if data:
        table = nt.getTable(TABLE)

        for pair, sides in data.items():
            for side_idx, side in enumerate(['l','r']):
                for level_idx, level in enumerate(['l2','l3','l4']):
                    key = f"{pair}-{side}-{level}"
                    value = sides[side_idx][level_idx]
                    table.putBoolean(key, value)

        print("Updated Dashboard/Toggles:", data)

    return Response(status=200)

@app.route('/algae-webhook', methods=['POST'])
def update_algae_dashboard():
    data = request.json
    if data:
        table = nt.getTable(TABLE)

        for side, value in data.items():
            table.putBoolean(f"algae-{side}", value)

        print("Updated Dashboard/Algae:", data)

    return Response(status=200)

if __name__ == '__main__':
    app.run(debug=True, port=1477, host='0.0.0.0')
