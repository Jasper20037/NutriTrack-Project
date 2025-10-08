# NutriTrack 🍽️

**A full-stack web application for intelligent meal planning and calorie tracking.**

NutriTrack helps users plan their meals, track daily calorie intake, and gain insight into their nutritional balance.
What makes NutriTrack unique is its integration of **AI technology** — allowing users to generate personalized recipes and recognize meals or macronutrients directly from photos. This creates a smart, time-saving experience that adapts to each user’s lifestyle.

---

## 🚀 Features

- Add, edit, and delete meals with nutritional information
- Real-time calorie tracking and daily goal progress
- **AI-powered meal recognition** from uploaded food photos
- **AI-generated recipe suggestions** based on calorie and macro goals
- SQL database integration for persistent data storage
- Responsive design built with React.js
- RESTful API built with Flask for clean separation between frontend and backend
- Modular, scalable architecture for future extensions

---

## 🧠 Tech Stack

**Frontend:** React.js, Chart.js, Tailwind CSS
**Backend:** Python (Flask), Flask-CORS, Flask-RESTful, Google AI And Groq API
**Database:** MySQL
**AI & Machine Learning:** Google AI and Groq (for meal recognition and recipe generation)
**Version Control:** Git / GitHub

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/nutritrack.git
cd nutritrack
```

### 2. Set up the backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 3. Configure environment variables

Create a `.env` file in the backend folder with your credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=nutritrack
OPENAI_API_KEY=your_openai_api_key
```

### 4. Set up the frontend

```bash
cd ../frontend
npm install
npm start
```

---

## 🗄️ Database Structure

NutriTrack uses a relational SQL schema containing:

- **users** → stores user profiles and goals
- **meals** → tracks individual meals with timestamps
- **food_items** → nutritional data (calories, proteins, carbs, fats)

Relationships between users and meals are managed via foreign keys to ensure data integrity.

---

## 📈 Future Improvements

- User authentication with JWT
- Advanced AI food classification and portion estimation
- Nutrient trend analytics
- Integration with wearable devices (e.g., Apple Health, Fitbit)

---

## 🧑‍💻 Author

**Jasper van den Heuvel**
Full-stack developer | Fontys University of Applied Sciences
[LinkedIn](https://www.linkedin.com/in/jasper-van-den-heuvel-00424a193/)

---

## 📄 License

This project is licensed under the MIT License.
