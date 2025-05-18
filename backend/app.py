from flask import Flask, request, jsonify
import os
import easyocr
import requests
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

reader = easyocr.Reader(['en'])

HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/google/flan-t5-base'

HUGGINGFACE_API_KEY = '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'  # Replace with your actual key

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    question = request.form.get('question')
    if not question:
        return jsonify({'error': 'No question provided'}), 400

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if not (file and allowed_file(file.filename)):
        return jsonify({'error': 'Invalid file type'}), 400

    try:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        result = reader.readtext(file_path)
        extracted_text = ' '.join([text[1] for text in result])

        ai_response = check_answer_with_huggingface(question, extracted_text)

        return jsonify({
            'ai_response': ai_response,
            'extracted_text': extracted_text,
            'status': 'success',
            'filename': filename
        }), 200

    except Exception as e:
        app.logger.error(f'Error processing request: {str(e)}')
        return jsonify({'error': str(e)}), 500
    finally:
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)

def check_answer_with_huggingface(question, answer):
    headers = {
        'Authorization': f'Bearer {HUGGINGFACE_API_KEY}',
        'Content-Type': 'application/json'
    }

    prompt = f"""Analyze the following question and student answer:

    Question: {question}
    Answer: {answer}

    Provide a clear and detailed response:
    - Is the answer correct? Answer with 'Yes' or 'No'
    - If incorrect, provide the correct answer.
    - Give suggestions for improvement.
    - Rate the answer on a scale of 1-10.

    Format your response like this:
    Is Correct: [Yes/No]
    Correct Answer: [Correct Answer or 'N/A']
    Feedback: [Detailed feedback]
    Improvement Suggestions: [Suggestions]
    Rating: [Rating]/10
    """

    data = {
        'inputs': prompt
    }

    response = requests.post(
        HUGGINGFACE_API_URL + "?wait_for_model=true",
        headers=headers,
        json=data
    )
    response.raise_for_status()

    return response.json()[0]['generated_text']

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
