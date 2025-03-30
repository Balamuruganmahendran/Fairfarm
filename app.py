import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import datetime
import random
from flask_cors import CORS
import os
from flask import Flask, render_template, request, jsonify
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)  # Enable Cross-Origin Resource Sharing

@app.route("/")
def home():
    return render_template("dashboard.html")

@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.json
    # Process data and return response (dummy response for now)
    return jsonify({"message": "Prediction received", "data": data})

if __name__ == "__main__":
    app.run(debug=True, port=5000)

# Constants from the JavaScript code
VEGETABLE_PRICES = {
    'tomato': {'basePrice': 30, 'trend': 'rising'},
    'potato': {'basePrice': 60, 'trend': 'stable'},
    'carrot': {'basePrice': 50, 'trend': 'falling'},
    'onion': {'basePrice': 40, 'trend': 'rising'},
    'pepper': {'basePrice': 38, 'trend': 'stable'}
}

CLIMATE_FACTORS = {
    'summer': {'tomato': 0.9, 'potato': 0.7, 'carrot': 0.8, 'onion': 1.1, 'pepper': 1.2},
    'winter': {'tomato': 1.2, 'potato': 1.3, 'carrot': 1.2, 'onion': 0.9, 'pepper': 0.8},
    'spring': {'tomato': 1.1, 'potato': 1.1, 'carrot': 1.0, 'onion': 1.0, 'pepper': 1.0},
    'monsoon': {'tomato': 0.7, 'potato': 0.9, 'carrot': 0.7, 'onion': 0.8, 'pepper': 0.6},
    'autumn': {'tomato': 1.0, 'potato': 1.0, 'carrot': 1.1, 'onion': 1.0, 'pepper': 0.9}
}

class FairfarmPricePredictor:
    def __init__(self):
        self.model = None
        self.train_synthetic_data()
        
    def generate_synthetic_data(self, num_samples=1000):
        """Generate synthetic data for training the model"""
        data = []
        vegetables = list(VEGETABLE_PRICES.keys())
        seasons = list(CLIMATE_FACTORS.keys())
        
        for _ in range(num_samples):
            vegetable = random.choice(vegetables)
            season = random.choice(seasons)
            
            # Generate random but realistic weather conditions
            temperature = random.uniform(10, 40)
            humidity = random.uniform(30, 90)
            rainfall = random.uniform(0, 150)
            
            # Calculate price based on factors (similar to JavaScript simulation)
            base_price = VEGETABLE_PRICES[vegetable]['basePrice']
            season_factor = CLIMATE_FACTORS[season][vegetable]
            
            # Apply climate factors
            temp_factor = 0.9 if temperature > 30 else (1.1 if temperature < 15 else 1.0)
            humidity_factor = 0.95 if humidity > 70 else (1.05 if humidity < 40 else 1.0)
            rainfall_factor = 0.9 if rainfall > 100 else (1.1 if rainfall < 20 else 1.0)
            
            # Add some randomness to simulate market fluctuations
            random_factor = random.uniform(0.9, 1.1)
            
            # Calculate final price
            price = base_price * season_factor * temp_factor * humidity_factor * rainfall_factor * random_factor
            
            # Add to dataset
            data.append({
                'vegetable': vegetable,
                'season': season,
                'temperature': temperature,
                'humidity': humidity,
                'rainfall': rainfall,
                'price': price
            })
        
        return pd.DataFrame(data)
    
    def train_synthetic_data(self):
        """Train the model on synthetic data"""
        # Generate synthetic data
        df = self.generate_synthetic_data()
        
        # Prepare features and target
        X = pd.get_dummies(df[['vegetable', 'season', 'temperature', 'humidity', 'rainfall']], 
                           columns=['vegetable', 'season'])
        y = df['price']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train Random Forest model
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        print(f"Model trained with MAE: {mae:.2f}, R²: {r2:.2f}")
        
        # Save feature columns for prediction
        self.feature_columns = X.columns
    
    def predict_price(self, vegetable, season, temperature, humidity, rainfall, prediction_date=None):
        """Predict price based on input parameters"""
        if self.model is None:
            raise ValueError("Model not trained. Call train_synthetic_data() first.")
        
        # Create input data
        input_data = pd.DataFrame({
            'temperature': [temperature],
            'humidity': [humidity],
            'rainfall': [rainfall]
        })
        
        # One-hot encode categorical variables
        for col in self.feature_columns:
            if col.startswith('vegetable_') or col.startswith('season_'):
                input_data[col] = 0
        
        # Set the specific vegetable and season to 1
        input_data[f'vegetable_{vegetable}'] = 1
        input_data[f'season_{season}'] = 1
        
        # Ensure all columns are present in the right order
        input_data = input_data.reindex(columns=self.feature_columns, fill_value=0)
        
        # Make prediction
        predicted_price = self.model.predict(input_data)[0]
        
        # Add some variability for min/max range
        min_price = round(predicted_price * 0.9)
        max_price = round(predicted_price * 1.1)
        
        # Calculate confidence level based on how optimal the conditions are
        confidence_level = self.calculate_confidence_level(vegetable, season, temperature, humidity, rainfall)
        
        # Get market trend
        market_trend = VEGETABLE_PRICES[vegetable]['trend'].capitalize()
        
        # Determine climate suitability
        climate_suitability = self.determine_climate_suitability(temperature, humidity, rainfall)
        
        # Generate recommended action
        recommended_action = self.generate_recommendation(market_trend, climate_suitability)
        
        # Generate price trend data
        price_trend = self.generate_price_trend(predicted_price, market_trend, prediction_date)
        
        # Return prediction results
        return {
            'predictedPrice': {'min': min_price, 'max': max_price},
            'confidenceLevel': confidence_level,
            'marketTrend': market_trend,
            'climateSuitability': climate_suitability,
            'recommendedAction': recommended_action,
            'priceTrend': price_trend
        }
    
    def calculate_confidence_level(self, vegetable, season, temperature, humidity, rainfall):
        """Calculate confidence level based on how optimal the conditions are"""
        # Base confidence
        confidence = 75
        
        # Check if season is optimal for the vegetable
        season_factor = CLIMATE_FACTORS[season][vegetable]
        if season_factor >= 1.1:
            confidence += 10
        elif season_factor <= 0.8:
            confidence -= 10
        
        # Check if climate conditions are optimal
        if self.determine_climate_suitability(temperature, humidity, rainfall) == 'Optimal':
            confidence += 10
        elif self.determine_climate_suitability(temperature, humidity, rainfall) == 'Poor':
            confidence -= 15
        
        # Ensure confidence is between 50 and 95
        return max(50, min(95, confidence))
    
    def determine_climate_suitability(self, temperature, humidity, rainfall):
        """Determine climate suitability based on weather conditions"""
        if ((20 < temperature < 30) and 
            (50 < humidity < 70) and 
            (30 < rainfall < 80)):
            return 'Optimal'
        elif ((temperature < 15 or temperature > 35) or 
              (humidity < 30 or humidity > 80) or 
              (rainfall < 10 or rainfall > 100)):
            return 'Poor'
        else:
            return 'Suboptimal'
    
    def generate_recommendation(self, market_trend, climate_suitability):
        """Generate recommendation based on market trend and climate suitability"""
        if market_trend == 'Rising' and climate_suitability != 'Poor':
            return 'Consider planting more for next season'
        elif market_trend == 'Falling' or climate_suitability == 'Poor':
            return 'Consider alternative crops'
        else:
            return 'Hold and monitor market prices'
    
    def generate_price_trend(self, base_price, market_trend, prediction_date=None):
        """Generate price trend data for the next 90 days"""
        trend_data = []
        
        # Set base date
        if prediction_date:
            base_date = datetime.datetime.strptime(prediction_date, '%Y-%m-%d')
        else:
            base_date = datetime.datetime.now()
        
        # Set trend direction
        trend_direction = 1 if market_trend == 'Rising' else (-1 if market_trend == 'Falling' else 0)
        
        # Generate data for 90 days
        for i in range(90):
            date = base_date + datetime.timedelta(days=i)
            random_factor = 0.95 + random.random() * 0.1  # Random factor between 0.95 and 1.05
            trend_factor = 1 + (trend_direction * i * 0.001)  # Small trend factor based on days
            
            trend_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'price': round(base_price * random_factor * trend_factor)
            })
        
        return trend_data

# Example usage
if __name__ == "__main__":
    predictor = FairfarmPricePredictor()
    
    # Example prediction
    prediction = predictor.predict_price(
        vegetable='tomato',
        season='summer',
        temperature=32,
        humidity=65,
        rainfall=40,
        prediction_date='2025-04-01'
    )
    
    print("\nPrice Prediction Results:")
    print(f"Predicted Price: ₹{prediction['predictedPrice']['min']}/kg - ₹{prediction['predictedPrice']['max']}/kg")
    print(f"Confidence Level: {prediction['confidenceLevel']}%")
    print(f"Market Trend: {prediction['marketTrend']}")
    print(f"Climate Suitability: {prediction['climateSuitability']}")
    print(f"Recommended Action: {prediction['recommendedAction']}")
    print(f"Price Trend Data Points: {len(prediction['priceTrend'])}")
    
    # Example API endpoint function
    def predict_api(request_data):
        """Example API endpoint function for price prediction"""
        vegetable = request_data.get('vegetable', 'tomato')
        season = request_data.get('season', 'summer')
        temperature = float(request_data.get('temperature', 30))
        humidity = float(request_data.get('humidity', 60))
        rainfall = float(request_data.get('rainfall', 50))
        prediction_date = request_data.get('predictionDate')
        
        predictor = FairfarmPricePredictor()
        prediction = predictor.predict_price(
            vegetable=vegetable,
            season=season,
            temperature=temperature,
            humidity=humidity,
            rainfall=rainfall,
            prediction_date=prediction_date
        )
        
        return prediction


#email sending 
class EmailSender:
    def __init__(self, smtp_server="smtp.gmail.com", smtp_port=587, 
                 sender_email="balamuruganmahendran67@gmail.com", sender_password="bala123454321"):
        """Initialize email sender with SMTP server details"""
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.sender_email = sender_email
        self.sender_password = sender_password

    def send_email(self, recipient_email, subject, message_body):
        """Send an email notification"""
        try:
            # Create message
            message = MIMEMultipart()
            message["From"] = self.sender_email
            message["To"] = recipient_email
            message["Subject"] = subject
            message.attach(MIMEText(message_body, "plain"))

            # Connect to the server
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()  # Secure connection
            server.login(self.sender_email, self.sender_password)
            server.sendmail(self.sender_email, recipient_email, message.as_string())
            server.quit()

            return True, "Email sent successfully"
        except Exception as e:
            return False, f"Failed to send email: {str(e)}"

#email generating process

app = Flask(__name__)

@app.route("/api/order", methods=["POST"])
def order():
    """Handles buying a product and sends an email confirmation."""
    data = request.json  # Get data from the frontend

    # Extract order details
    farmer_name = data.get("farmerName")
    product = data.get("product")
    quantity = data.get("quantity")
    delivery_date = data.get("deliveryDate")
    email = data.get("email")  # The email entered in the frontend

    # If email is not provided, return an error
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400

    # Email content
    subject = "Order Confirmation - FairFarm Connect"
    message = f"""
    Dear {farmer_name},

    Your order for {quantity} units of {product} has been placed.
    Expected delivery date: {delivery_date}.

    Thank you for using FairFarm Connect!

    Best regards,
    FairFarm Team
    """

    # Send email
    email_sender = EmailSender()
    sent, msg = email_sender.send_email(email, subject, message)

    return jsonify({"success": sent, "message": msg})

# Base Prices
VEGETABLE_PRICES = {
    'tomato': 30,
    'potato': 60,
    'carrot': 50,
    'onion': 45,
    'pepper': 38
}

@app.route("/api/market_prices", methods=["GET"])
def get_market_prices():
    """Dynamically generate today's market prices"""
    today = datetime.datetime.now().strftime("%Y-%m-%d")

    dynamic_prices = {}
    for vegetable, base_price in VEGETABLE_PRICES.items():
        # Apply a small daily fluctuation (±5%)
        fluctuation = random.uniform(-0.05, 0.05)  # Between -5% and +5%
        new_price = round(base_price * (1 + fluctuation), 2)
        dynamic_prices[vegetable] = new_price

    return jsonify({
        "date": today,
        "prices": dynamic_prices
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)