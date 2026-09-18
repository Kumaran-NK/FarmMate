"""
FarmMate ONNX Model Converter Utility
Converts trained Scikit-Learn/XGBoost models (.pkl/.joblib) into ONNX format (.onnx).
"""
import os
import glob
import joblib
import numpy as np
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("convert_to_onnx")

def convert_all_models(models_dir: str = "models"):
    try:
        from skl2onnx import convert_sklearn  # type: ignore
        from skl2onnx.common.data_types import FloatTensorType  # type: ignore
    except ImportError:
        logger.warning("skl2onnx package not installed. Skipping ONNX conversion. Run 'pip install skl2onnx onnx' to enable.")
        return

    pkl_files = glob.glob(os.path.join(models_dir, "*.pkl"))
    for pkl_path in pkl_files:
        basename = os.path.basename(pkl_path).replace(".pkl", "")
        onnx_path = os.path.join(models_dir, f"{basename}.onnx")
        
        # Skip if already converted or if it's an encoder/dict
        if os.path.exists(onnx_path) or "encoder" in basename or "dict" in basename or "columns" in basename:
            continue

        try:
            model = joblib.load(pkl_path)
            # Estimate number of features from model if possible
            n_features = getattr(model, "n_features_in_", 7)
            initial_type = [('float_input', FloatTensorType([None, n_features]))]
            
            onnx_model = convert_sklearn(model, initial_types=initial_type)
            with open(onnx_path, "wb") as f:
                f.write(onnx_model.SerializeToString())
            logger.info(f"Successfully converted {pkl_path} -> {onnx_path}")
        except Exception as e:
            logger.warning(f"Could not convert {basename} to ONNX: {e}")

if __name__ == "__main__":
    convert_all_models()
