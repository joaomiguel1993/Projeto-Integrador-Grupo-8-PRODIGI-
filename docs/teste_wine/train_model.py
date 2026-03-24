import pandas as pd
import numpy as np
from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score
import joblib

# Load the wine dataset (matching your notebook)
data = load_wine()
df = pd.DataFrame(data.data, columns=data.feature_names)
df["target"] = data.target

# Split features and target (matching your notebook)
X = df.drop(columns=["target"])
y = df["target"]

# Split into train and test sets (matching your notebook approach)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Create and train the decision tree model (matching your notebook)
model = DecisionTreeClassifier(random_state=42)
model.fit(X_train, y_train)

# Make predictions and calculate accuracy
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model accuracy: {accuracy:.4f}")

# Save the model using joblib
joblib.dump(model, "wine_decision_tree_model.joblib")
print("Model saved to wine_decision_tree_model.joblib")

# Also save the feature names for reference in the API
feature_names = list(X.columns)
joblib.dump(feature_names, "wine_feature_names.joblib")
print("Feature names saved to wine_feature_names.joblib")
