from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import threading
from qwen import QwenChatbot
import os
import time
import random


app = Flask(__name__)
app.config["STATIC_FOLDER"] = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(app.config["STATIC_FOLDER"]):
    os.makedirs(app.config["STATIC_FOLDER"])

CORS(app)

chatbot = QwenChatbot()


@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message")
    response = chatbot.generate_response(user_input)

    return jsonify(
        {
            "response": response,  # Trả về trực tiếp phản hồi
            "history": chatbot.history,
        }
    )


# @app.route("/static/<path:filename>")
# def serve_static(filename):
#     return send_from_directory(app.config["STATIC_FOLDER"], filename)


if __name__ == "__main__":
    app.run(port=5000)
