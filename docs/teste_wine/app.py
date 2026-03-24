from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import os

app = FastAPI(
    title="Wine Classification API",
    description="API for predicting wine types using a Decision Tree model",
)

# Load the model and feature names at startup
try:
    model = joblib.load("wine_decision_tree_model.joblib")
    feature_names = joblib.load("wine_feature_names.joblib")
    print("Model and feature names loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    raise e


# Define the input data model matching wine features
class WineFeatures(BaseModel):
    alcohol: float
    malic_acid: float
    ash: float
    alcalinity_of_ash: float
    magnesium: float
    total_phenols: float
    flavanoids: float
    nonflavanoid_phenols: float
    proanthocyanins: float
    color_intensity: float
    hue: float
    od280_od315_of_diluted_wines: float
    proline: float


# Define the prediction response
class PredictionResponse(BaseModel):
    prediction: int
    probability: list
    class_name: str


# Map class indices to wine class names (from wine dataset)
WINE_CLASSES = {0: "class_0", 1: "class_1", 2: "class_2"}


@app.post("/predict", response_model=PredictionResponse)
async def predict_wine(features: WineFeatures):
    try:
        # Convert input features to array in correct order
        input_data = np.array(
            [
                [
                    features.alcohol,
                    features.malic_acid,
                    features.ash,
                    features.alcalinity_of_ash,
                    features.magnesium,
                    features.total_phenols,
                    features.flavanoids,
                    features.nonflavanoid_phenols,
                    features.proanthocyanins,
                    features.color_intensity,
                    features.hue,
                    features.od280_od315_of_diluted_wines,
                    features.proline,
                ]
            ]
        )

        # Make prediction
        prediction = model.predict(input_data)[0]
        probabilities = model.predict_proba(input_data)[0].tolist()
        class_name = WINE_CLASSES.get(prediction, f"class_{prediction}")

        return PredictionResponse(
            prediction=int(prediction), probability=probabilities, class_name=class_name
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.get("/")
async def root():
    return {
        "message": "Wine Classification API is running. Use /predict endpoint for predictions."
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}
