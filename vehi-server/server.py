from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# --- Configuration ---
REGISTRATION_FILE = "/home/pi/technodrive_registration.json"
AUTHORIZED_VIN = "EE90-9073699"

# --- Registration Endpoints ---

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "online",
        "message": "TechnoDrive Registration Server",
        "version": "1.0"
    })

@app.route('/register', methods=['POST'])
def register_device():
    """
    Register a device with VIN and device ID
    
    Request body:
    {
        "vin": "EE90-9073699",
        "device_id": "unique-device-identifier"
    }
    
    Returns:
    - 200: Device registered successfully
    - 401: Invalid VIN
    - 409: VIN already registered to another device
    - 400: Missing required fields
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        vin = data.get('vin')
        device_id = data.get('device_id')
        
        # Validate required fields
        if not vin or not device_id:
            return jsonify({"error": "VIN and device_id are required"}), 400
        
        # Validate VIN matches authorized VIN
        if vin != AUTHORIZED_VIN:
            return jsonify({
                "error": "Invalid VIN/Chassis number",
                "message": "This VIN is not authorized for this system"
            }), 401
        
        # Check if VIN is already registered to a different device
        if os.path.exists(REGISTRATION_FILE):
            try:
                with open(REGISTRATION_FILE, 'r') as f:
                    existing = json.load(f)
                    
                if existing.get('device_id') != device_id:
                    return jsonify({
                        "error": "VIN already registered",
                        "message": "This VIN is already registered to another device"
                    }), 409
                else:
                    # Same device re-registering - update timestamp
                    registration = {
                        "vin": vin,
                        "device_id": device_id,
                        "registered_at": existing.get('registered_at'),
                        "last_verified": datetime.now().isoformat()
                    }
                    with open(REGISTRATION_FILE, 'w') as f:
                        json.dump(registration, f, indent=2)
                    
                    return jsonify({
                        "status": "registered",
                        "message": "Device re-registered successfully"
                    })
            except json.JSONDecodeError:
                # Corrupted file, will recreate below
                pass
        
        # Register new device
        registration = {
            "vin": vin,
            "device_id": device_id,
            "registered_at": datetime.now().isoformat(),
            "last_verified": datetime.now().isoformat()
        }
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(REGISTRATION_FILE), exist_ok=True)
        
        with open(REGISTRATION_FILE, 'w') as f:
            json.dump(registration, f, indent=2)
        
        print(f"[REGISTRATION] New device registered - VIN: {vin[:8]}..., Device: {device_id[:16]}...")
        
        return jsonify({
            "status": "registered",
            "message": "Device registered successfully"
        }), 200
        
    except Exception as e:
        print(f"[ERROR] Registration error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/verify', methods=['GET'])
def verify_device():
    """
    Verify if a device is authorized
    
    Query parameters:
    - device_id: The device identifier to verify
    
    Returns:
    - 200: Device is verified
    - 403: Device not authorized
    - 404: No registration found
    - 400: Missing device_id
    """
    try:
        device_id = request.args.get('device_id')
        
        if not device_id:
            return jsonify({"error": "device_id parameter is required"}), 400
        
        # Check if registration file exists
        if not os.path.exists(REGISTRATION_FILE):
            return jsonify({
                "verified": False,
                "reason": "No registration found",
                "message": "This vehicle has not been registered yet"
            }), 404
        
        # Read registration
        try:
            with open(REGISTRATION_FILE, 'r') as f:
                registration = json.load(f)
        except json.JSONDecodeError:
            return jsonify({
                "verified": False,
                "reason": "Invalid registration data"
            }), 500
        
        # Verify device ID matches
        if registration.get('device_id') == device_id:
            # Update last verified timestamp
            registration['last_verified'] = datetime.now().isoformat()
            with open(REGISTRATION_FILE, 'w') as f:
                json.dump(registration, f, indent=2)
            
            return jsonify({
                "verified": True,
                "vin": registration.get('vin'),
                "registered_at": registration.get('registered_at')
            }), 200
        else:
            return jsonify({
                "verified": False,
                "reason": "Device not authorized",
                "message": "This device is not registered to this vehicle"
            }), 403
            
    except Exception as e:
        print(f"[ERROR] Verification error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/status', methods=['GET'])
def registration_status():
    """
    Get current registration status (for debugging)
    Returns masked device ID for privacy
    """
    try:
        if not os.path.exists(REGISTRATION_FILE):
            return jsonify({
                "registered": False,
                "message": "No registration found"
            })
        
        with open(REGISTRATION_FILE, 'r') as f:
            registration = json.load(f)
        
        # Mask device ID for privacy (show first 8 chars + ...)
        device_id = registration.get('device_id', '')
        masked_device_id = device_id[:8] + '...' if len(device_id) > 8 else device_id
        
        return jsonify({
            "registered": True,
            "vin": registration.get('vin'),
            "device_id_masked": masked_device_id,
            "registered_at": registration.get('registered_at'),
            "last_verified": registration.get('last_verified')
        })
        
    except Exception as e:
        print(f"[ERROR] Status error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/reset', methods=['POST'])
def reset_registration():
    """
    Reset registration (for development/testing only)
    Should be protected with authentication in production
    """
    try:
        if os.path.exists(REGISTRATION_FILE):
            os.remove(REGISTRATION_FILE)
            print("[RESET] Registration file deleted")
            return jsonify({
                "status": "reset",
                "message": "Registration reset successfully"
            })
        else:
            return jsonify({
                "status": "no_action",
                "message": "No registration to reset"
            })
    except Exception as e:
        print(f"[ERROR] Reset error: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    try:
        print("=" * 60)
        print("TechnoDrive Registration Server")
        print("=" * 60)
        print(f"Authorized VIN: {AUTHORIZED_VIN}")
        print(f"Registration file: {REGISTRATION_FILE}")
        print(f"Starting server on 0.0.0.0:5000...")
        print("=" * 60)
        
        # Run on port 5000 (standard Flask port)
        # Use port 80 if you want, but requires sudo
        app.run(host='0.0.0.0', port=5000, debug=False)
        
    except PermissionError:
        print("Error: Permission denied.")
        print("Try running with sudo if using port 80: sudo python3 server.py")
    except Exception as e:
        print(f"Error starting server: {e}")
