"""
FarmMate Unified ONNX Runtime & Joblib Inference Engine
Serves Scikit-Learn, XGBoost, and DecisionTree models via ONNX Runtime when available,
falling back seamlessly to Joblib/Pickle.
"""
import os
import logging
import numpy as np
from typing import Any, Tuple, Optional

logger = logging.getLogger("farmmate.onnx")

class ONNXInferenceEngine:
    def __init__(self, model_basename: str, models_dir: str = "models"):
        self.model_basename = model_basename
        self.models_dir = models_dir
        
        self.onnx_path = os.path.join(models_dir, f"{model_basename}.onnx")
        self.pkl_path = os.path.join(models_dir, f"{model_basename}.pkl")
        if not os.path.exists(self.pkl_path):
            self.pkl_path = os.path.join(models_dir, f"{model_basename}.joblib")

        self._ort_session = None
        self._fallback_model = None
        self.use_onnx = False

        self._init_engine()

    def _init_engine(self):
        # Try ONNX Runtime first
        if os.path.exists(self.onnx_path):
            try:
                import onnxruntime as ort  # type: ignore
                self._ort_session = ort.InferenceSession(self.onnx_path, providers=['CPUExecutionProvider'])
                self.use_onnx = True
                logger.info(f"Loaded ONNX model successfully: {self.onnx_path}")
                return
            except Exception as e:
                logger.warning(f"Failed to load ONNX model {self.onnx_path}: {e}")

        # Fallback to Joblib/Pickle
        if os.path.exists(self.pkl_path):
            try:
                import joblib
                self._fallback_model = joblib.load(self.pkl_path)
                logger.info(f"Loaded Fallback Joblib model: {self.pkl_path}")
            except Exception as e:
                logger.error(f"Failed to load Joblib model {self.pkl_path}: {e}")

    def predict(self, input_features: np.ndarray) -> np.ndarray:
        """
        Run inference using ONNX Runtime or Fallback Joblib model.
        input_features must be a 2D numpy array with shape (n_samples, n_features).
        """
        input_features = np.asarray(input_features, dtype=np.float32)

        if self.use_onnx and self._ort_session:
            try:
                input_name = self._ort_session.get_inputs()[0].name
                outputs = self._ort_session.run(None, {input_name: input_features})
                return outputs[0]
            except Exception as e:
                logger.warning(f"ONNX inference failed ({e}), falling back to joblib.")

        if self._fallback_model:
            return self._fallback_model.predict(input_features)

        raise RuntimeError(f"No valid inference model loaded for {self.model_basename}")

    def predict_proba(self, input_features: np.ndarray) -> np.ndarray:
        """
        Run probability inference if model supports it.
        """
        input_features = np.asarray(input_features, dtype=np.float32)

        if self.use_onnx and self._ort_session:
            try:
                input_name = self._ort_session.get_inputs()[0].name
                outputs = self._ort_session.run(None, {input_name: input_features})
                # ONNX probabilities often come as second output or dictionary list
                if len(outputs) > 1:
                    proba_output = outputs[1]
                    if isinstance(proba_output, list) and isinstance(proba_output[0], dict):
                        # Convert dict probabilities to array
                        return np.array([[d[k] for k in sorted(d.keys())] for d in proba_output])
                    return np.asarray(proba_output)
            except Exception as e:
                logger.warning(f"ONNX predict_proba failed ({e}), using fallback.")

        if self._fallback_model and hasattr(self._fallback_model, "predict_proba"):
            return self._fallback_model.predict_proba(input_features)

        raise RuntimeError(f"predict_proba not available for {self.model_basename}")
