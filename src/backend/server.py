import sys
from flask import Flask, request, Response
from flask_cors import CORS
from networktables import NetworkTables as nt

# Use '-d' to connect to localhost
localhost = '-d' in sys.argv
# nt.initialize(server="localhost" if localhost else "10.14.77.2")
nt.initialize(server="127.0.0.1")

app = Flask(__name__)
CORS(app)

TABLE = "Dashboard"  # Table for toggles

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

if __name__ == '__main__':
    app.run(debug=True, port=1477, host='0.0.0.0')
