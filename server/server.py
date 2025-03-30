from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
import os
from email.mime.text import MIMEText

app = Flask(__name__)
CORS(app)  # Permite peticiones desde React

EMAIL_ADDRESS = "ualendarizacion@gmail.com"
EMAIL_PASSWORD = "aegydpmppdqsmfhw"

@app.route('/send-email', methods=['POST'])
def send_email():
    data = request.get_json()
    to_email = data.get("to_email")
    subject = data.get("subject")
    message = data.get("message")

    if not to_email or not subject or not message:
        return jsonify({"error": "Faltan datos en la solicitud"}), 400

    try:
        msg = MIMEText(message, "plain", "utf-8")
        msg["Subject"] = subject
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = to_email

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.sendmail(EMAIL_ADDRESS, to_email, msg.as_string())

        return jsonify({"message": f"Correo enviado a {to_email}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5002, debug=True)