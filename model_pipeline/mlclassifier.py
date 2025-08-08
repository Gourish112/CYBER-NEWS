import json
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sentence_transformers import SentenceTransformer

# Load dataset
with open(r'C:\Users\Gourish\Downloads\project-bolt-sb1-gb6bspbh\project\model\cyber_platforms_label.json', 'r') as f:
    data = json.load(f)

df = pd.DataFrame(data)
df['text'] = df['title']  # You can also add 'url' if needed

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(df['text'], df['label'], test_size=0.2, random_state=42)

# Load sentence transformer
model = SentenceTransformer('all-MiniLM-L6-v2')

# Encode texts
X_train_embed = model.encode(X_train.tolist(), show_progress_bar=True)
X_test_embed = model.encode(X_test.tolist(), show_progress_bar=True)

# Train classifier
clf = LogisticRegression()
clf.fit(X_train_embed, y_train)

# Predict and evaluate
y_pred = clf.predict(X_test_embed)
print("\n📊 Classification Report:\n")
print(classification_report(y_test, y_pred))
import joblib
joblib.dump(clf, 'cyber_platform_classifier.pkl')
joblib.dump(model, 'cyber_sbert_encoder.pkl')