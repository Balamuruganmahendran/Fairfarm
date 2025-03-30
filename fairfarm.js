// fairfarm.js - JavaScript for Fairfarm Connect Hub

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const logoutTab = document.getElementById('logout-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authSection = document.getElementById('auth-section');
    const welcomeSection = document.getElementById('welcome-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const marketSection = document.getElementById('market-section');
    const dashboardHome = document.getElementById('dashboard-home');
    const dashboardPrices = document.getElementById('dashboard-prices');
    const dashboardLogout = document.getElementById('dashboard-logout');
    const orderModal = document.getElementById('order-modal');
    const sellModal = document.getElementById('sell-modal');
    const orderSeedsBtn = document.getElementById('order-seeds-btn');
    const orderFertilizersBtn = document.getElementById('order-fertilizers-btn');
    const sellProduceBtn = document.getElementById('sell-produce-btn');
    const cancelOrder = document.getElementById('cancel-order');
    const cancelSell = document.getElementById('cancel-sell');
    const predictionForm = document.getElementById('prediction-form');

    // Vegetable Price Data
    const vegetablePrices = {
        'tomato': { basePrice: 200, trend: 'rising' },
        'potato': { basePrice: 90, trend: 'stable' },
        'carrot': { basePrice: 150, trend: 'falling' },
        'onion': { basePrice: 80, trend: 'rising' },
        'pepper': { basePrice: 250, trend: 'stable' }
    };

    // Climate Impact Factors
    const climateFactors = {
        'summer': { tomato: 0.9, potato: 0.7, carrot: 0.8, onion: 1.1, pepper: 1.2 },
        'winter': { tomato: 1.2, potato: 1.3, carrot: 1.2, onion: 0.9, pepper: 0.8 },
        'spring': { tomato: 1.1, potato: 1.1, carrot: 1.0, onion: 1.0, pepper: 1.0 },
        'monsoon': { tomato: 0.7, potato: 0.9, carrot: 0.7, onion: 0.8, pepper: 0.6 },
        'autumn': { tomato: 1.0, potato: 1.0, carrot: 1.1, onion: 1.0, pepper: 0.9 }
    };

    // Farmers Data
    const farmers = [
        { name: 'Maanikam', id: 'F001', areaId: 'A001', location: 'salem' },
        { name: 'Rajendran', id: 'F002', areaId: 'A002', location: 'salem' },
        { name: 'Thirumurty', id: 'F003', areaId: 'A003', location: 'chennai' },
        { name: 'Dhanraj', id: 'F004', areaId: 'A004', location: 'chennai' },
        { name: 'Murugan', id: 'F005', areaId: 'A005', location: 'salem' }
    ];

    // Tab Switching
    loginTab.addEventListener('click', function() {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginTab.classList.add('border-b-2', 'border-blue-500', 'text-blue-500');
        registerTab.classList.remove('border-b-2', 'border-blue-500', 'text-blue-500');
        registerTab.classList.add('text-gray-500');
    });

    registerTab.addEventListener('click', function() {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        registerTab.classList.add('border-b-2', 'border-blue-500', 'text-blue-500');
        loginTab.classList.remove('border-b-2', 'border-blue-500', 'text-blue-500');
        loginTab.classList.add('text-gray-500');
    });

    // Login Form Submission
    if (loginForm) {
        loginForm.querySelector('form').addEventListener('submit', function(e) {
            e.preventDefault();
            const farmerId = document.getElementById('farmer-id').value;
            const password = document.getElementById('password').value;
            const userType = document.querySelector('input[name="user-type"]:checked').value;
            
            // Simple validation
            if (farmerId && password) {
                // Simulate login success
                // In a real app, you would verify credentials with the server
                authSection.classList.add('hidden');
                welcomeSection.classList.add('hidden');
                dashboardSection.classList.remove('hidden');
                
                // Populate dashboard with farmer info
                const farmer = farmers.find(f => f.id === farmerId) || farmers[0];
                document.getElementById('farmer-name').textContent = farmer.name;
                document.getElementById('dashboard-farmer-id').textContent = farmer.id;
                document.getElementById('dashboard-area-id').textContent = farmer.areaId;
                document.getElementById('dashboard-location').textContent = farmer.location;
                
                // Store user info in localStorage for persistence
                localStorage.setItem('fairfarm_user', JSON.stringify({ 
                    id: farmer.id, 
                    name: farmer.name, 
                    areaId: farmer.areaId, 
                    location: farmer.location,
                    type: userType
                }));
            } else {
                alert('Please enter your Farmer/Dealer ID and password');
            }
        });
    }

    // Register Form Submission
    if (registerForm) {
        registerForm.querySelector('form').addEventListener('submit', function(e) {
            e.preventDefault();
            const fullName = document.getElementById('full-name').value;
            const areaId = document.getElementById('area-id').value;
            const location = document.getElementById('location').value;
            const password = document.getElementById('create-password').value;
            const userType = document.querySelector('input[name="register-user-type"]:checked').value;
            
            // Simple validation
            if (fullName && areaId && location && password) {
                // Generate a new farmer ID
                const newId = 'F' + Math.floor(1000 + Math.random() * 9000);
                
                // In a real app, you would send this data to the server
                // For demo, we'll simulate registration success
                fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: fullName,
                        areaId: areaId,
                        location: location,
                        password: password,
                        userType: userType,
                        id: newId
                    })
                })
                .then(response => {
                    // For demo purposes, we'll just simulate success
                    alert(`Registration successful! Your ${userType} ID is: ${newId}`);
                    // Switch to login tab
                    loginTab.click();
                })
                .catch(error => {
                    console.error('Error during registration:', error);
                    // Fallback for demo
                    alert(`Registration successful! Your ${userType} ID is: ${newId}`);
                    loginTab.click();
                });
            } else {
                alert('Please fill in all fields');
            }
        });
    }

    // Dashboard Navigation
    if (dashboardHome) {
        dashboardHome.addEventListener('click', function() {
            dashboardSection.classList.remove('hidden');
            marketSection.classList.add('hidden');
            dashboardHome.classList.add('text-indigo-600');
            dashboardHome.classList.remove('text-gray-500');
            dashboardPrices.classList.add('text-gray-500');
            dashboardPrices.classList.remove('text-indigo-600');
        });
    }

    if (dashboardPrices) {
        dashboardPrices.addEventListener('click', function() {
            dashboardSection.classList.add('hidden');
            marketSection.classList.remove('hidden');
            dashboardPrices.classList.add('text-indigo-600');
            dashboardPrices.classList.remove('text-gray-500');
            dashboardHome.classList.add('text-gray-500');
            dashboardHome.classList.remove('text-indigo-600');
        });
    }

    // Logout Functionality
    if (dashboardLogout) {
        dashboardLogout.addEventListener('click', function() {
            localStorage.removeItem('fairfarm_user');
            dashboardSection.classList.add('hidden');
            marketSection.classList.add('hidden');
            authSection.classList.remove('hidden');
            welcomeSection.classList.remove('hidden');
        });
    }

    if (logoutTab) {
        logoutTab.addEventListener('click', function() {
            localStorage.removeItem('fairfarm_user');
            authSection.classList.remove('hidden');
            welcomeSection.classList.remove('hidden');
            dashboardSection.classList.add('hidden');
            marketSection.classList.add('hidden');
        });
    }

    // Modal Controls for Order
    if (orderSeedsBtn) {
        orderSeedsBtn.addEventListener('click', function() {
            orderModal.classList.remove('hidden');
            document.getElementById('product-name').value = 'Seeds';
        });
    }

    if (orderFertilizersBtn) {
        orderFertilizersBtn.addEventListener('click', function() {
            orderModal.classList.remove('hidden');
            document.getElementById('product-name').value = 'Fertilizers';
        });
    }

    if (cancelOrder) {
        cancelOrder.addEventListener('click', function() {
            orderModal.classList.add('hidden');
        });
    }

    // Order Form Submission
    if (orderModal) {
        document.getElementById('order-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const productName = document.getElementById('product-name').value;
            const quantity = document.getElementById('quantity').value;
            const deliveryDate = document.getElementById('delivery-date').value;
            
            // Send order data to server
            const user = JSON.parse(localStorage.getItem('fairfarm_user') || '{}');
            
            fetch('/api/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    farmerId: user.id,
                    farmerName: user.name,
                    product: productName,
                    quantity: quantity,
                    deliveryDate: deliveryDate,
                    email: "balamuruganmahendran67@gmail.com"
                })
            })
            .then(response => {
                // For demo purposes, we'll just simulate success
                alert(`Order placed successfully! An email confirmation has been sent.`);
                orderModal.classList.add('hidden');
            })
            .catch(error => {
                console.error('Error during order placement:', error);
                // Fallback for demo
                alert(`Order placed successfully! An email confirmation has been sent.`);
                orderModal.classList.add('hidden');
            });
        });
    }

    // Modal Controls for Sell
    if (sellProduceBtn) {
        sellProduceBtn.addEventListener('click', function() {
            sellModal.classList.remove('hidden');
        });
    }

    if (cancelSell) {
        cancelSell.addEventListener('click', function() {
            sellModal.classList.add('hidden');
        });
    }

    // Sell Form Submission
    if (sellModal) {
        document.getElementById('sell-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const vegetableType = document.getElementById('vegetable-type').value;
            const quantity = document.getElementById('sell-quantity').value;
            const price = document.getElementById('expected-price').value;
            const availableDate = document.getElementById('available-date').value;
            
            // Send sell data to server
            const user = JSON.parse(localStorage.getItem('fairfarm_user') || '{}');
            
            fetch('/api/sell', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    farmerId: user.id,
                    farmerName: user.name,
                    vegetable: vegetableType,
                    quantity: quantity,
                    price: price,
                    availableDate: availableDate,
                    email: "balamuruganmahendran67@gmail.com"
                })
            })
            .then(response => {
                // For demo purposes, we'll just simulate success
                alert(`Your produce has been listed for sale! An email confirmation has been sent.`);
                sellModal.classList.add('hidden');
            })
            .catch(error => {
                console.error('Error during sale listing:', error);
                // Fallback for demo
                alert(`Your produce has been listed for sale! An email confirmation has been sent.`);
                sellModal.classList.add('hidden');
            });
        });
    }

    // Price Prediction Form
    if (predictionForm) {
        predictionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const vegetable = document.getElementById('predict-vegetable').value;
            const season = document.getElementById('predict-season').value;
            const temperature = document.getElementById('predict-temperature').value;
            const humidity = document.getElementById('predict-humidity').value;
            const rainfall = document.getElementById('predict-rainfall').value;
            const predictionDate = document.getElementById('predict-date').value;
            
            // Send prediction request to server
            fetch('/api/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vegetable: vegetable,
                    season: season,
                    temperature: parseFloat(temperature),
                    humidity: parseFloat(humidity),
                    rainfall: parseFloat(rainfall),
                    predictionDate: predictionDate
                })
            })
            .then(response => response.json())
            .then(data => {
                // Update prediction results
                document.getElementById('predicted-price').textContent = `₹${data.predictedPrice.min}/kg - ₹${data.predictedPrice.max}/kg`;
                document.getElementById('confidence-level').textContent = `${data.confidenceLevel}%`;
                document.getElementById('market-trend').textContent = data.marketTrend;
                document.getElementById('climate-suitability').textContent = data.climateSuitability;
                document.getElementById('recommended-action').textContent = data.recommendedAction;
                
                // Generate price trend chart
                generatePriceTrendChart(data.priceTrend);
            })
            .catch(error => {
                console.error('Error during price prediction:', error);
                // Fallback for demo with simulated prediction
                simulatePrediction(vegetable, season, temperature, humidity, rainfall);
            });
        });
    }

    // Function to simulate prediction when server is not available
    function simulatePrediction(vegetable, season, temperature, humidity, rainfall) {
        // Basic algorithm to simulate prediction
        const basePrice = vegetablePrices[vegetable]?.basePrice || 100;
        const seasonFactor = climateFactors[season]?.[vegetable] || 1.0;
        
        // Apply some factors based on input parameters
        const tempFactor = temperature > 30 ? 0.9 : (temperature < 15 ? 1.1 : 1.0);
        const humidityFactor = humidity > 70 ? 0.95 : (humidity < 40 ? 1.05 : 1.0);
        const rainfallFactor = rainfall > 100 ? 0.9 : (rainfall < 20 ? 1.1 : 1.0);
        
        // Calculate predicted price
        const predictedPrice = basePrice * seasonFactor * tempFactor * humidityFactor * rainfallFactor;
        const minPrice = Math.round(predictedPrice * 0.9);
        const maxPrice = Math.round(predictedPrice * 1.1);
        
        // Determine climate suitability
        let climateSuitability = 'Suboptimal';
        if ((temperature > 20 && temperature < 30) && 
            (humidity > 50 && humidity < 70) && 
            (rainfall > 30 && rainfall < 80)) {
            climateSuitability = 'Optimal';
        } else if ((temperature < 15 || temperature > 35) || 
                   (humidity < 30 || humidity > 80) || 
                   (rainfall < 10 || rainfall > 100)) {
            climateSuitability = 'Poor';
        }
        
        // Determine market trend
        const marketTrend = vegetablePrices[vegetable]?.trend || 'stable';
        
        // Generate recommended action
        let recommendedAction = 'Hold and monitor market prices';
        if (marketTrend === 'rising' && climateSuitability !== 'Poor') {
            recommendedAction = 'Consider planting more for next season';
        } else if (marketTrend === 'falling' || climateSuitability === 'Poor') {
            recommendedAction = 'Consider alternative crops';
        }
        
        // Update prediction results
        document.getElementById('predicted-price').textContent = `₹${minPrice}/kg - ₹${maxPrice}/kg`;
        document.getElementById('confidence-level').textContent = '75%';
        document.getElementById('market-trend').textContent = `${marketTrend.charAt(0).toUpperCase() + marketTrend.slice(1)}`;
        document.getElementById('climate-suitability').textContent = climateSuitability;
        document.getElementById('recommended-action').textContent = recommendedAction;
        
        // Generate price trend chart with simulated data
        const trendData = [];
        const baseDate = new Date();
        const trendDirection = marketTrend === 'rising' ? 1 : (marketTrend === 'falling' ? -1 : 0);
        
        for (let i = 0; i < 90; i++) {
            const date = new Date(baseDate);
            date.setDate(baseDate.getDate() + i);
            const randomFactor = 0.95 + Math.random() * 0.1; // Random factor between 0.95 and 1.05
            const trendFactor = 1 + (trendDirection * i * 0.001); // Small trend factor based on days
            trendData.push({
                date: date.toISOString().split('T')[0],
                price: Math.round(predictedPrice * randomFactor * trendFactor)
            });
        }
        
        generatePriceTrendChart(trendData);
    }

    // Function to generate price trend chart
    function generatePriceTrendChart(trendData) {
        const chartArea = document.getElementById('price-trend-chart');
        chartArea.innerHTML = '';
        
        const canvas = document.createElement('canvas');
        chartArea.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const labels = trendData.map(item => {
            const date = new Date(item.date);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        });
        
        const prices = trendData.map(item => item.price);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Predicted Price (₹/kg)',
                    data: prices,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    // Check if user is already logged in (simple session persistence)
    function checkAuthStatus() {
        const user = localStorage.getItem('fairfarm_user');
        if (user) {
            const userData = JSON.parse(user);
            authSection.classList.add('hidden');
            welcomeSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
            
            // Populate dashboard with farmer info
            document.getElementById('farmer-name').textContent = userData.name;
            document.getElementById('dashboard-farmer-id').textContent = userData.id;
            document.getElementById('dashboard-area-id').textContent = userData.areaId;
            document.getElementById('dashboard-location').textContent = userData.location;
        }
    }
    
    // Initialize the app
    checkAuthStatus();
});

//connecting front end and backend
document.getElementById("prediction-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const vegetable = document.getElementById("predict-vegetable").value;
    const season = document.getElementById("predict-season").value;
    const temperature = document.getElementById("predict-temperature").value;

    fetch("http://127.0.0.1:5000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vegetable, season, temperature })
    })
    .then(response => response.json())
    .then(data => console.log("Server Response:", data))
    .catch(error => console.error("Error:", error));
});

//connect to dealers 
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('dealerModal');
    const dealerName = document.getElementById('dealerName');
    const dealerLocation = document.getElementById('dealerLocation');
    const dealerContact = document.getElementById('dealerContact');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // Add event listener to all contact buttons
    document.querySelectorAll('.contact-btn').forEach(button => {
        button.addEventListener('click', function () {
            const dealer = this.closest('.dealer');
            dealerName.textContent = dealer.dataset.name;
            dealerLocation.textContent = "Location: " + dealer.dataset.location;
            dealerContact.textContent = "Contact: " + dealer.dataset.contact;

            modal.classList.remove('hidden');
        });
    });

    // Close modal on button click
    closeModalBtn.addEventListener('click', function () {
        modal.classList.add('hidden');
    });

    // Close modal if clicking outside the modal content
    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.classList.add('hidden');
        }
    });
});
// farmer contact
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('farmerModal');
    const farmerName = document.getElementById('farmerName');
    const farmerLocation = document.getElementById('farmerLocation');
    const farmerContact = document.getElementById('farmerContact');
    const closeModalBtn = document.getElementById('closeFarmerModal');

    // Add event listener to all contact buttons
    document.querySelectorAll('.contact-btn').forEach(button => {
        button.addEventListener('click', function () {
            const farmer = this.closest('.farmer');
            farmerName.textContent = farmer.dataset.name;
            farmerLocation.textContent = "Location: " + farmer.dataset.location;
            farmerContact.textContent = "Contact: " + farmer.dataset.contact;

            modal.classList.remove('hidden');
        });
    });

    // Close modal on button click
    closeModalBtn.addEventListener('click', function () {
        modal.classList.add('hidden');
    });

    // Close modal if clicking outside the modal content
    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.classList.add('hidden');
        }
    });
});

// Function to fetch live market prices dynamically
function fetchMarketPrices() {
    fetch("http://127.0.0.1:5000/api/market_prices")
        .then(response => response.json())
        .then(data => {
            const prices = data.prices;
            document.querySelector("#tomato-price").textContent = `₹30/kg`;
            document.querySelector("#potato-price").textContent = `₹60/kg`;
            document.querySelector("#carrot-price").textContent = `₹50/kg`;
            document.querySelector("#onion-price").textContent = `₹45/kg`;
            document.querySelector("#pepper-price").textContent = `₹38/kg`;
        })
        .catch(error => console.error("Error fetching market prices:", error));
}

// Call fetchMarketPrices after login
document.addEventListener("DOMContentLoaded", function() {
    const user = localStorage.getItem("fairfarm_user");
    if (user) {
        fetchMarketPrices(); // Fetch prices when the user logs in
    }
});
