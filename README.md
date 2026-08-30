# FitForge

A modern full-stack fitness and fashion e-commerce platform built with the MERN stack, enhanced with AI-powered features for personalized shopping, visual search, virtual try-on, size recommendations, and intelligent assistance.

## Overview

FitForge is a full-stack e-commerce application designed to provide a personalized and interactive shopping experience. It combines a modern React frontend with a Node.js/Express backend and integrates multiple AI and machine-learning services.

The platform includes user authentication, product browsing, category management, shopping cart functionality, favorites, order management, secure payments, personalized size recommendations, AI-powered styling, visual product search, virtual try-on, and AI chatbot assistance.

## Key Features

### E-Commerce

- User registration and authentication
- Secure login and JWT-based authorization
- Product browsing and product details
- Product categories
- Product search and filtering
- Shopping cart
- Favorites / wishlist
- Product ratings and reviews
- Checkout and shipping workflow
- Order placement and order history
- Admin product management
- Admin category management
- Admin user management
- Admin order management

### AI-Powered Features

- AI-powered fashion assistant
- AI styling recommendations
- AI chatbot
- Personalized fashion suggestions
- Gemini-powered responses
- Intelligent product recommendations
- AI-based size recommendations

### Computer Vision and Machine Learning

- Visual product search
- Image similarity search
- Feature extraction
- Virtual try-on functionality
- Machine-learning powered image processing
- Separate ML service architecture

### User Experience

- Responsive React interface
- Dark/light theme support
- Loading states and skeleton screens
- Image upload and preview
- Voice input
- Personalized size profiles
- Modern product browsing experience

## Technology Stack

### Frontend

- React
- Vite
- Redux Toolkit
- React Router
- Tailwind CSS
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- REST APIs

### Artificial Intelligence

- Google Gemini API
- AI-powered recommendations
- AI chatbot
- AI styling
- Natural-language product assistance

### Machine Learning

- Python
- Flask
- PyTorch
- Computer Vision
- Image Feature Extraction
- Image Similarity Search
- Virtual Try-On

### Payment

- PayPal

## Project Architecture

FitForge follows a modular full-stack architecture with separate frontend, backend, AI, and machine-learning services.

    FITFORGE
        |
        +-------------------+-------------------+
        |                   |                   |
     Frontend            Backend            ML Services
        |                   |                   |
      React              Node.js             Python
      Vite               Express             Flask
      Redux              MongoDB             PyTorch
        |                   |                   |
        +-------------------+-------------------+
                            |
                    AI / External APIs
                            |
                     Google Gemini
                         PayPal

## Project Structure

    MERN-E-Commerce-Store/
    |
    +-- backend/
    |   +-- config/
    |   +-- constants/
    |   +-- controllers/
    |   +-- middlewares/
    |   +-- models/
    |   +-- routes/
    |   +-- services/
    |   +-- utils/
    |   +-- index.js
    |   +-- package.json
    |   +-- package-lock.json
    |
    +-- frontend/
    |   +-- src/
    |   |   +-- assets/
    |   |   +-- components/
    |   |   +-- context/
    |   |   +-- hooks/
    |   |   +-- images/
    |   |   +-- pages/
    |   |   +-- redux/
    |   |   +-- styles/
    |   |   +-- App.jsx
    |   |   +-- index.css
    |   |   +-- main.jsx
    |   +-- package.json
    |   +-- package-lock.json
    |   +-- tailwind.config.js
    |   +-- vite.config.js
    |
    +-- ml-api/
    |   +-- app.py
    |   +-- feature_extractor.py
    |   +-- similar_images.py
    |   +-- requirements.txt
    |
    +-- ml-server/
    |   +-- app.py
    |
    +-- sentiment-api/
    |   +-- app.py
    |   +-- requirements.txt
    |
    +-- list-models.js
    +-- test-gemini.js
    +-- package.json
    +-- package-lock.json
    +-- README.md
    +-- .gitignore

## Prerequisites

Before running FitForge, make sure the following software is installed:

- Node.js
- npm
- Python 3.x
- MongoDB
- Git

For the machine-learning services, a suitable Python environment with the required dependencies is also required.

## Installation

### 1. Clone the Repository

    git clone https://github.com/sanjay-techbuilds/fitforge.git
    cd fitforge

### 2. Install Root Dependencies

    npm install

### 3. Install Backend Dependencies

    cd backend
    npm install
    cd ..

### 4. Install Frontend Dependencies

    cd frontend
    npm install
    cd ..

### 5. Install ML API Dependencies

    cd ml-api
    pip install -r requirements.txt
    cd ..

### 6. Install Sentiment API Dependencies

    cd sentiment-api
    pip install -r requirements.txt
    cd ..

## Environment Variables

Create the required environment files locally.

Do not commit environment files or API keys to GitHub.

Example backend environment configuration:

    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    GEMINI_API_KEY=your_gemini_api_key
    OPENAI_API_KEY=your_openai_api_key
    PAYPAL_CLIENT_ID=your_paypal_client_id

Use your own credentials and configuration values.

The exact environment variables required may depend on the features and services you enable.

## Running the Application

FitForge consists of multiple services. Run each service in a separate terminal.

### Start the Backend

    cd backend
    npm start

### Start the Frontend

    cd frontend
    npm run dev

### Start the ML API

    cd ml-api
    python app.py

### Start the ML Server

    cd ml-server
    python app.py

### Start the Sentiment API

    cd sentiment-api
    python app.py

After starting the frontend, open the Vite development URL shown in the terminal.

## API Architecture

The backend exposes REST APIs for different application modules.

    /api/users
    /api/products
    /api/categories
    /api/orders
    /api/size-profiles
    /api/ai
    /api/ml
    /api/try-on
    /api/upload
    /api/visual-search

The exact routes and endpoints are implemented inside the backend routes directory.

## Authentication

FitForge uses JWT-based authentication.

Authentication is used to protect user-specific and administrative functionality, including:

- User profiles
- Orders
- Favorites
- Size profiles
- Administrative operations

Passwords and authentication credentials should never be committed to the repository.

## AI Integration

FitForge integrates Google Gemini for AI-powered functionality.

AI functionality is used for features such as:

- Fashion assistance
- AI styling
- Product-related conversations
- Personalized recommendations
- Intelligent shopping assistance

API keys are loaded through environment variables rather than being stored directly in the source code.

## Visual Search

The visual search system allows users to upload an image and search for visually similar products.

The workflow includes:

    User Image
        |
        v
    Image Upload
        |
        v
    Feature Extraction
        |
        v
    Image Embedding
        |
        v
    Similarity Comparison
        |
        v
    Matching Products

## Virtual Try-On

FitForge includes a machine-learning powered virtual try-on service.

The system processes uploaded images and clothing/product information through the ML service to generate a try-on result.

    User Image + Product
              |
              v
         ML Processing
              |
              v
        Virtual Try-On
              |
              v
          Result Image

## Size Recommendation

Users can create personalized size profiles and receive size recommendations based on their profile information and product size charts.

This helps provide a more personalized shopping experience.

## Admin Features

The application includes an administrative section for managing the e-commerce platform.

Administrators can manage:

- Products
- Categories
- Users
- Orders
- Product information
- Inventory-related information

Administrative routes are protected through authentication and authorization middleware.

## Database

FitForge uses MongoDB as its primary database.

Mongoose is used as the Object Data Modeling library for MongoDB.

The backend contains models for major application entities including:

- Users
- Products
- Orders
- Categories
- Size Profiles

## Security

Security considerations implemented in the project include:

- JWT-based authentication
- Protected API routes
- Environment-based secrets
- Password hashing
- Authentication middleware
- Separate configuration for sensitive credentials
- Git ignore rules for secrets and generated files

Never expose API keys, database credentials, JWT secrets, or payment credentials publicly.

## Git and Repository

The project repository is available on GitHub:

https://github.com/sanjay-techbuilds/fitforge

The repository is configured to exclude sensitive and generated files such as:

    .env
    *.env
    node_modules/
    venv/
    .venv/
    backend/config/google-credentials.json
    ml-server/static/results/
    frontend/src/assets/hero-video.mp4

Large generated files, local virtual environments, credentials, and environment configuration should remain outside version control.

## Development

For development, it is recommended to run the frontend, backend, and required Python services separately.

Before committing changes:

    git status
    git add .
    git commit -m "Describe your changes"
    git push

## Future Improvements

Potential future improvements include:

- Improved recommendation algorithms
- More advanced computer-vision models
- Enhanced virtual try-on accuracy
- Improved product personalization
- More AI-powered shopping features
- Production deployment
- Automated testing
- CI/CD integration
- Performance optimization
- Enhanced analytics and reporting

## Contributing

Contributions are welcome.

To contribute:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Test the changes locally.
5. Commit your changes.
6. Push the branch.
7. Create a pull request.

Example:

    git checkout -b feature/new-feature
    git add .
    git commit -m "Add new feature"
    git push origin feature/new-feature

## License

This project is licensed under the MIT License.

See the LICENSE file for more information.

## Author

Sanjay S

GitHub: https://github.com/sanjay-techbuilds

## Acknowledgements

This project was developed as a full-stack e-commerce application integrating modern web development, artificial intelligence, and machine-learning technologies.

---

If you find this project useful, consider giving the repository a star on GitHub.
