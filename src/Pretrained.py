import os
import numpy as np
from transformers import DistilBertTokenizer, TFDistilBertForSequenceClassification
import tensorflow as tf
import pandas as pd
from sklearn.preprocessing import LabelEncoder

# Load the tokenizer and model from the pretrained model saved in model.py
tokenizer = DistilBertTokenizer.from_pretrained('./saved_model')
model = TFDistilBertForSequenceClassification.from_pretrained('./saved_model')

# Load label encoder from the saved file
label_classes = np.load('label_classes.npy', allow_pickle=True)
label_encoder = LabelEncoder()
label_encoder.classes_ = label_classes

# Function to encode text
def encode_text(text, max_len=60):
    encoded_text = tokenizer(text, add_special_tokens=True, max_length=max_len, truncation=True, padding='max_length')
    return encoded_text['input_ids'], encoded_text['attention_mask']


def predict_category(text):
    ids, mask = encode_text(text)
    ids = np.expand_dims(ids, axis=0)
    mask = np.expand_dims(mask, axis=0)
    pred = model.predict([ids, mask])[0]
    predicted_label = np.argmax(pred)
    return label_encoder.inverse_transform([predicted_label])[0]

# new_text = "subscribed colab premium"
# predicted_category = predict_category(new_text)
# print(f"Predicted Category for '{new_text}': {predicted_category}")