from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import threading
from qwen import QwenChatbot
import os
import time
import random
import pandas as pd
import sqlite3
from werkzeug.utils import secure_filename
import uuid

app = Flask(__name__)
app.config["STATIC_FOLDER"] = os.path.join(os.path.dirname(__file__), "static")
app.config["UPLOAD_FOLDER"] = os.path.join(os.path.dirname(__file__), "uploads")
app.config["DATABASE_FOLDER"] = os.path.join(os.path.dirname(__file__), "databases")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024


# Tạo các thư mục nếu chưa tồn tại
for folder in [
    app.config["STATIC_FOLDER"],
    app.config["UPLOAD_FOLDER"],
    app.config["DATABASE_FOLDER"],
]:
    if not os.path.exists(folder):
        os.makedirs(folder, exist_ok=True)

CORS(app)

chatbot = QwenChatbot()


@app.route("/upload-excel", methods=["POST"])
def upload_excel():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        try:
            # Tạo tên file duy nhất
            filename = secure_filename(file.filename)
            unique_id = uuid.uuid4().hex
            excel_filename = f"{unique_id}_{filename}"
            db_filename = f"{unique_id}.db"

            excel_path = os.path.join(app.config["UPLOAD_FOLDER"], excel_filename)
            db_path = os.path.join(app.config["DATABASE_FOLDER"], db_filename)

            # Lưu file Excel
            file.save(excel_path)

            # Chuyển đổi sang SQLite
            if excel_to_sqlite(excel_path, db_path):
                return jsonify(
                    {
                        "message": "File converted successfully",
                        "db_filename": db_filename,
                    }
                )
            else:
                return jsonify({"error": "Conversion failed"}), 500
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "Invalid file type"}), 400


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ["xlsx", "xls"]


def excel_to_sqlite(excel_path, db_path):
    try:
        xls = pd.ExcelFile(excel_path)
        conn = sqlite3.connect(db_path)

        for sheet_name in xls.sheet_names:
            df = pd.read_excel(excel_path, sheet_name=sheet_name)
            df.to_sql(sheet_name, conn, if_exists="replace", index=False)

        conn.close()
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False


@app.route("/download-db/<filename>", methods=["GET"])
def download_db(filename):
    return send_from_directory(
        app.config["DATABASE_FOLDER"],
        filename,
        as_attachment=True,
        mimetype="application/vnd.sqlite3",
    )


@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message")
    response = chatbot.generate_response(user_input)

    return jsonify(
        {
            "response": response,
            "history": chatbot.history,
        }
    )


if __name__ == "__main__":
    app.run(port=5000, debug=True)
