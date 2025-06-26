import pandas as pd
import ast
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics import classification_report, accuracy_score

# Load the dataset
df = pd.read_csv("data.csv")

# --- Step 1: Preprocess Interests ---
def parse_interests(val):
    if isinstance(val, list):
        return val
    if isinstance(val, str):
        try:
            return ast.literal_eval(val)
        except:
            return [v.strip() for v in val.split(",")]
    return []

df["interests"] = df["interests"].apply(parse_interests)
df["interests_str"] = df["interests"].apply(lambda x: " ".join(x))

# --- Step 2: Make Predictions ---
predictions = []

for index, row in df.iterrows():
    user_interests = row["interests"]
    user_score = row["quiz_avg"]
    user_interest_str = " ".join(user_interests)

    # Copy and append user row to compute similarity
    temp_df = df.copy()
    temp_df.loc[len(temp_df.index)] = [999, user_interests, user_score, "", user_interest_str]
    
    # Vectorize
    vectorizer = CountVectorizer()
    interest_matrix = vectorizer.fit_transform(temp_df["interests_str"])

    # Cosine similarity
    similarity = cosine_similarity(interest_matrix)
    user_similarities = similarity[-1][:-1]  # exclude self

    best_match_index = user_similarities.argmax()
    recommended_course = temp_df.iloc[best_match_index]["recommended_course"]
    predictions.append(recommended_course)

# --- Step 3: Evaluation ---
true_labels = df["recommended_course"]
print("=== Classification Report ===")
print(classification_report(true_labels, predictions))

print("=== Accuracy ===")
print(f"{accuracy_score(true_labels, predictions):.2f}")
