from flask import Flask, request, jsonify
from flask_cors import CORS
import RPi.GPIO as GPIO
import sys

app = Flask(__name__)
# Enable CORS to allow your React app to communicate with this server
CORS(app)

# --- Configuration ---
# Use BCM pin numbering
IGNITION_PIN = 17     # Physical Pin 11
STARTER_PIN = 23      # Physical Pin 16 (NEW - Starter)
COMPRESSOR_PIN = 27   # Physical Pin 13 (AC Compressor)
FAN_PIN = 22          # Physical Pin 15 (AC Fan)

# --- GPIO Setup ---
try:
    GPIO.setmode(GPIO.BCM)
    GPIO.setwarnings(False)
    
    # Initialize pins
    pins = [IGNITION_PIN, STARTER_PIN, COMPRESSOR_PIN, FAN_PIN]
    
    for pin in pins:
        GPIO.setup(pin, GPIO.OUT)
        # ACTIVE LOW: Set to HIGH initially to keep relays OFF
        GPIO.output(pin, GPIO.HIGH) 
        
    print(f"GPIO Initialized (Active Low): Ignition={IGNITION_PIN}, Starter={STARTER_PIN}, Compressor={COMPRESSOR_PIN}, Fan={FAN_PIN}")

except Exception as e:
    print(f"Error initializing GPIO: {e}")
    sys.exit(1)

@app.route('/control', methods=['GET'])
def control_vehicle():
    """
    Handles requests like:
    GET /control?starter=1   -> Sets Starter Relay ON (GPIO LOW)
    GET /control?ignition=1  -> Sets Ignition Relay ON (GPIO LOW)
    GET /control?ac=1        -> Sets AC Relays ON (GPIO LOW)
    """
    response_data = {"status": "success"}
    
    # 1. Handle Starter Command (NEW)
    starter_cmd = request.args.get('starter')
    if starter_cmd is not None:
        try:
            state = int(starter_cmd)
            if state in [0, 1]:
                # ACTIVE LOW LOGIC: 1 -> LOW (ON), 0 -> HIGH (OFF)
                gpio_state = GPIO.LOW if state == 1 else GPIO.HIGH
                GPIO.output(STARTER_PIN, gpio_state)
                
                response_data['starter'] = "ON" if state else "OFF"
                print(f"Starter set to: {response_data['starter']} (GPIO level: {gpio_state})")
            else:
                return jsonify({"error": "Invalid starter value. Use 0 or 1"}), 400
        except ValueError:
            return jsonify({"error": "Starter value must be an integer"}), 400

    # 2. Handle Ignition Command
    ignition_cmd = request.args.get('ignition')
    if ignition_cmd is not None:
        try:
            state = int(ignition_cmd)
            if state in [0, 1]:
                # ACTIVE LOW LOGIC: 1 -> LOW (ON), 0 -> HIGH (OFF)
                gpio_state = GPIO.LOW if state == 1 else GPIO.HIGH
                GPIO.output(IGNITION_PIN, gpio_state)
                
                response_data['ignition'] = "ON" if state else "OFF"
                print(f"Ignition set to: {response_data['ignition']} (GPIO level: {gpio_state})")
            else:
                return jsonify({"error": "Invalid ignition value. Use 0 or 1"}), 400
        except ValueError:
            return jsonify({"error": "Ignition value must be an integer"}), 400

    # 3. Handle AC Command (Controls both Compressor and Fan)
    ac_cmd = request.args.get('ac')
    if ac_cmd is not None:
        try:
            state = int(ac_cmd)
            if state in [0, 1]:
                # ACTIVE LOW LOGIC: 1 -> LOW (ON), 0 -> HIGH (OFF)
                gpio_state = GPIO.LOW if state == 1 else GPIO.HIGH
                
                # Control BOTH GPIOs simultaneously
                GPIO.output(COMPRESSOR_PIN, gpio_state)
                GPIO.output(FAN_PIN, gpio_state)
                
                status_text = "ON" if state else "OFF"
                response_data['ac_compressor'] = status_text
                response_data['ac_fan'] = status_text
                print(f"AC System set to: {status_text} (GPIO level: {gpio_state})")
            else:
                return jsonify({"error": "Invalid AC value. Use 0 or 1"}), 400
        except ValueError:
            return jsonify({"error": "AC value must be an integer"}), 400

    return jsonify(response_data)

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "message": "VehiCtrl Raspberry Pi Server is running (Active Low Config)",
        "config": {
            "ignition_pin": IGNITION_PIN,
            "starter_pin": STARTER_PIN,
            "compressor_pin": COMPRESSOR_PIN,
            "fan_pin": FAN_PIN,
            "logic": "Active Low (0=ON, 1=OFF)"
        }
    })

if __name__ == '__main__':
    try:
        print("Starting server on 0.0.0.0:80...")
        # debug=False is recommended for production-like environment on Pi
        app.run(host='0.0.0.0', port=80, debug=False)
    except PermissionError:
        print("Error: Binding to port 80 requires root privileges.")
        print("Try running with sudo: sudo ./venv/bin/python server.py")
    finally:
        GPIO.cleanup()
        print("GPIO Cleaned up.")