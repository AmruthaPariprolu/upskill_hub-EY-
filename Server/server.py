import json
import pickle
import numpy as np
import pandas as pd
import PyPDF2
import os
from flask import Flask, request, jsonify
from sklearn.metrics.pairwise import cosine_similarity
from flask_cors import CORS
from groq import Groq
from functools import lru_cache
import warnings
from scipy.sparse import csr_matrix, load_npz, save_npz
import gc

warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

class ResourceLoader:
    _vectorizer = None
    _model = None
    _skills = None
    _df = None
    _skills_columns = None

    @classmethod
    def vectorizer(cls):
        if cls._vectorizer is None:
            with open("./artifacts/vectorizer_pickle.pickle", "rb") as f:
                cls._vectorizer = pickle.load(f)
        return cls._vectorizer

    @classmethod
    def model(cls):
        if cls._model is None:
            with open("./artifacts/model_pickle.pickle", "rb") as f:
                cls._model = pickle.load(f)
            gc.collect()
        return cls._model

    @classmethod
    def skills(cls):
        if cls._skills is None:
            with open("./artifacts/skill_columns.json", "r") as f:
                cls._skills = list(json.load(f).values())
        return cls._skills

    @classmethod
    def courses_data(cls):
        if cls._df is None:
            if os.path.exists("./artifacts/skills_vectors.npz"):
                skills_vectors = load_npz("./artifacts/skills_vectors.npz")
                cls._df = pd.read_csv("./artifacts/Online_Courses.csv", usecols=["Title", "URL"])
                cls._df['Skills_Vector'] = [skills_vectors[i] for i in range(skills_vectors.shape[0])]
            else:
                df = pd.read_csv("./artifacts/Online_Courses.csv", usecols=["Title", "URL", "Skills"])
                df['Skills'] = df['Skills'].fillna('')
                skills_vectors = cls.vectorizer().transform(df['Skills'])
                save_npz("./artifacts/skills_vectors.npz", skills_vectors)
                cls._df = df[['Title', 'URL']]
                cls._df['Skills_Vector'] = [skills_vectors[i] for i in range(skills_vectors.shape[0])]
        return cls._df

    @classmethod
    def skills_columns(cls):
        if cls._skills_columns is None:
            with open("./artifacts/skills.pkl", "rb") as f:
                cls._skills_columns = pickle.load(f)
        return cls._skills_columns

def get_suggestions(skills):
    vectorizer = ResourceLoader.vectorizer()
    df = ResourceLoader.courses_data()
    skills_vector = vectorizer.transform([skills])
    cosine_sim = cosine_similarity(skills_vector, np.vstack([x.toarray() for x in df['Skills_Vector'].values]))
    top_indexes = cosine_sim[0].argsort()[-5:][::-1]
    return df.iloc[top_indexes][['Title', 'URL']]

@app.route('/')
def home():
    return "Server running"

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    if not data or 'input' not in data:
        return jsonify({'error': 'Invalid input'}), 400
    try:
        suggestions = get_suggestions(data['input'])
        return jsonify(suggestions.to_dict(orient='records'))
    except MemoryError:
        gc.collect()
        return jsonify({'error': 'Server busy, try again'}), 503
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_skills', methods=['GET'])
def skills():
    try:
        return jsonify({'skills': ResourceLoader.skills()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def extract_text_from_pdf(pdf_file):
    try:
        text = ""
        reader = PyPDF2.PdfReader(pdf_file.stream)
        for page in reader.pages[:2]:
            text += (page.extract_text() or "") + " "
        return text
    except Exception:
        return ""

def extract_matching_skills(text, skills_list):
    text_lower = text.lower()
    return [skill for skill in skills_list if skill.lower() in text_lower]

@app.route("/compare_skills", methods=["POST"])
def compare_skills():
    if "resume" not in request.files:
        return jsonify({"error": "No resume file"}), 400
    
    resume = request.files["resume"]
    job_desc = request.form.get("job_description", "").strip()
    
    if not resume.filename or not job_desc:
        return jsonify({"error": "Missing file or description"}), 400
    
    resume_text = extract_text_from_pdf(resume)
    skills = ResourceLoader.skills_columns()
    
    resume_skills = set(extract_matching_skills(resume_text, skills))
    job_skills = set(extract_matching_skills(job_desc, skills))
    
    return jsonify({
        "matched_skills": list(resume_skills),
        "missing_skills": list(job_skills - resume_skills)
    })

@lru_cache(maxsize=8)
def get_groq_client():
    return Groq(api_key="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")

@app.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    try:
        data = request.get_json()
        topic = data.get('topic', '')
        if not topic:
            return jsonify({'error': 'Topic required'}), 400
        
        client = get_groq_client()
        response = client.chat.completions.create(
            messages=[{
                "role": "user",
                "content": f"Generate 5 MCQs about {topic} in JSON format"
            }],
            model="mixtral-8x7b-32768",
            temperature=0.7,
            max_tokens=1000
        )
        
        content = response.choices[0].message.content
        if '```json' in content:
            content = content.split('```json')[1].split('```')[0]
        return jsonify(json.loads(content))
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8000)), threaded=True)