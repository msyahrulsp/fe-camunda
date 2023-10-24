from flask import Flask
from flask import request
from pyzeebe import create_insecure_channel, ZeebeClient
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

order_data = []
oid = 0
CUSTOMER_PROCESS_ID = 'CustomerProcess'
CHECK_VALID_MSG = 'CheckOrderMessage'
CHECK_SUPPLY_MSG = 'CheckSupplyMessage'
VALID_KEY = 'is_valid'
SUPPLY_KEY = 'is_supply_ok'


class Zeebe:
    async def __aenter__(self):
        self._channel = create_insecure_channel(hostname="localhost", port=26500)  # Create grpc channel
        self.client = ZeebeClient(self._channel)
        return self

    async def __aexit__(self, *exc):
        await self._channel.close()


@app.route('/', methods=['GET'])
async def root():
    return 'Hello World!', 200

@app.route('/order', methods=['GET', 'POST'])
async def create_order():
    global oid
    if request.method == 'GET':
        return {'order': order_data}
    elif request.method == 'POST':
        new_order = request.get_json()
        new_order['id'] = oid
        order_data.append(new_order)
        oid += 1
        async with Zeebe() as zeebe:
            await zeebe.client.run_process(CUSTOMER_PROCESS_ID, variables={'order': new_order})
        return 'Order created', 201

@app.route('/order/<int:order_id>', methods=['GET', 'PUT', 'DELETE'])
def order(order_id):
    if request.method == 'GET':
        return {'order': order_data[order_id]}
    elif request.method == 'PUT':
        order_data[order_id] = request.get_json()
        return 'Order updated', 200
    elif request.method == 'DELETE':
        order_data.pop(order_id)
        return 'Order deleted', 200
    
@app.route('/order/<int:order_id>/valid', methods=['POST'])
async def validate_order(order_id):
    if order_id >= len(order_data):
        return 'Order not found', 404

    if request.method == 'POST':
        if VALID_KEY in order_data[order_id]:
            return 'Order already validated', 200
        is_valid = request.get_json()[VALID_KEY]
        order_data[order_id][VALID_KEY] = is_valid
        async with Zeebe() as zeebe:
            await zeebe.client.publish_message(CHECK_VALID_MSG, str(order_id), {VALID_KEY: is_valid})
        return 'Order validated', 200

@app.route('/order/<int:order_id>/supply-ok', methods=['POST'])
async def check_order_supply(order_id):
    if order_id >= len(order_data):
        return 'Order not found', 404

    if request.method == 'POST':
        if SUPPLY_KEY in order_data[order_id]:
            return 'Order already supply ok', 200
        is_supply_ok = request.get_json()[SUPPLY_KEY]
        order_data[order_id][SUPPLY_KEY] = is_supply_ok
        async with Zeebe() as zeebe:
            await zeebe.client.publish_message(CHECK_SUPPLY_MSG, str(order_id), {SUPPLY_KEY: is_supply_ok})
        return 'Order supply ok', 200
