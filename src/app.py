from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from Pretrained import predict_category
import mysql.connector
import os
import pandas as pd
from werkzeug.utils import secure_filename
from docx import Document
import PyPDF2
import datetime
import bcrypt

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'SapTeam8'  # Change this to a random secret key
jwt = JWTManager(app)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'xlsx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def get_db_connection():
    connection = mysql.connector.connect(
        host='localhost',  # Replace with your MySQL host
        user='root',       # Replace with your MySQL username
        password='pavi',   # Replace with your MySQL password
        database='sap'     # Replace with your MySQL database name
    )
    return connection

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed_password))
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({"message": "User registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT id, password FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    cursor.close()
    connection.close()

    if user and bcrypt.checkpw(password.encode('utf-8'), user[1].encode('utf-8')):
        access_token = create_access_token(identity=user[0])
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401

@app.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    user_id = get_jwt_identity()
    print("inside")
    expenses =[]
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        if filename.endswith('.xlsx'):
            expenses = process_excel(file_path)
        elif filename.endswith('.docx'):
            expenses = process_word(file_path)
        elif filename.endswith('.pdf'):
            expenses = process_pdf(file_path)
        else:
            return jsonify({"error": "Unsupported file type"}), 400

        print(expenses)
        os.remove(file_path)

    return jsonify(expenses)

def process_excel(file_path):
    df = pd.read_excel(file_path)
    df.columns = df.columns.str.lower()
    expenses = df.to_dict('records')
    return expenses

def process_word(file_path):
    doc = Document(file_path)
    expenses = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if text:
            parts = text.split()
            description = " ".join(parts[:-1])
            price = parts[-1]
            expenses.append({"description": description, "price": price})
    return expenses

def process_pdf(file_path):
    pdf_file = open(file_path, 'rb')
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    expenses = []
    for page in pdf_reader.pages:
        text = page.extract_text().strip().split('\n')
        for line in text:
            parts = line.split()
            description = " ".join(parts[:-1])
            price = parts[-1]
            expenses.append({"description": description, "price": price})
    pdf_file.close()
    return expenses

@app.route('/categorize', methods=['POST'])
@jwt_required()
def categorize_expenses():
    user_id = get_jwt_identity()
    current_datetime = datetime.datetime.now()
    year = current_datetime.year
    month = current_datetime.month
    day = current_datetime.day

    data = request.json
    expenses = data.get('expenses', [])
    print("Received expenses:", expenses)

    connection = get_db_connection()
    cursor = connection.cursor()

    categorized_expenses = []

    for expense in expenses:
        description = expense['description']
        price = expense['price']

        # Predict category
        category = predict_category(description)
        print(f"Predicted Category of the expense '{description}': {category}")

        # Insert into table
        cursor.execute("INSERT INTO categorized_expenses (user_id, description, price, category, day, month, year) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                       (user_id, description, price, category, day, month, year))
        connection.commit()
        cursor.execute("INSERT INTO categorized_expenses_present(user_id, description, price, category, day, month, year) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                       (user_id, description, price, category, day, month, year))
        connection.commit()
        
        categorized_expenses.append({'description': description, 'price': price, 'category': category})

    cursor.close()
    connection.close()
    return jsonify({"message": "Expenses categorized and stored in database", "categorizedExpenses": categorized_expenses})

@app.route('/delete', methods=['POST'])
@jwt_required()
def delete_expenses():
    user_id = get_jwt_identity()
    data = request.json
    description = data.get('description')
    price = data.get('price')

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("DELETE FROM categorized_expenses_present WHERE user_id = %s AND description=%s AND price=%s", (user_id, description, price))
    connection.commit()

    cursor.close()
    connection.close()
    return jsonify({"message": "Expense deleted from database"})

@app.route('/delete_all', methods=['POST'])
# @jwt_required()
def delete_all_expenses():
    # user_id = get_jwt_identity()
    # print(user_id)
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM categorized_expenses_present")
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({"message": "Expense deleted from database"})


@app.route('/get_all_expenses', methods=['GET'])
@jwt_required()
def get_all_expenses():
    user_id = get_jwt_identity()
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT description, price, category FROM categorized_expenses WHERE user_id = %s", (user_id,))
    expenses = cursor.fetchall()

    categorized_expenses = [{'description': row[0], 'price': row[1], 'category': row[2]} for row in expenses]

    cursor.close()
    connection.close()
    return jsonify({"categorizedExpenses": categorized_expenses})

@app.route('/get_all_expenses_present', methods=['GET'])
@jwt_required()
def get_all_expenses_present():
    user_id = get_jwt_identity()
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT description, price, category FROM categorized_expenses_present WHERE user_id = %s", (user_id,))
    expenses = cursor.fetchall()

    categorized_expenses = [{'description': row[0], 'price': row[1], 'category': row[2]} for row in expenses]

    cursor.close()
    connection.close()
    return jsonify({"categorizedExpenses": categorized_expenses})


@app.route('/get_pie_data', methods=['GET'])
@jwt_required()
def pie_expenses():
    user_id = get_jwt_identity()
    connection =get_db_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT description, price, category, day, month, year FROM categorized_expenses WHERE user_id = %s", (user_id,))
    expenses = cursor.fetchall()
    cursor.close()
    connection.close()

    return jsonify(expenses)
# def delete_all():
#     connection = get_db_connection()
#     cursor = connection.cursor()
#     cursor.execute("DELETE FROM categorized_expenses_present")
#     connection.commit()
#     cursor.close()
#     connection.close()
# delete_all()
if __name__ == '__main__':
    app.run(debug=True)
