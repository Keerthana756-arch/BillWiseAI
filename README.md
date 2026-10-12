# BillWiseAI — Smart AI-Powered Utility Bill Management Website

BillWiseAI is a modern, full-stack utility bill management web application built for students and individuals to understand their utility bills, track expenses, identify unusual increases, predict next month's spending, and discover ways to save money.

---

## 1. What BillWiseAI Does

- **Multi-Utility Bill Tracking**: Manage recurring bills for Electricity, Water, Gas, Internet, and Mobile.
- **Automated Document Extraction (OCR & PDF)**: Upload PDF statements or bill images (JPG, PNG) to automatically extract provider names, dates, amounts, and units consumed.
- **Unusual Bill Spike Detection**: Detects whenever a bill jumps significantly above your historical category average (e.g., >20%) and alerts you with actionable suggestions.
- **Statistical Bill Predictions**: Projects your next month's utility spending along with expected prediction ranges based on historical moving averages.
- **Intelligent Spending Analytics**: Visualizes monthly expense trends and category breakdowns with interactive charts powered by Recharts.
- **Ask BillWiseAI AI Chat**: Ask questions in natural language like *"Why did my electricity bill increase?"* or *"Which utility costs me the most?"*. Grounded strictly in your actual database records!
- **Notifications & Due Date Tracking**: In-app alerts warn you of upcoming due dates and unusual bill spikes.

---

## 2. Technologies Used

### Frontend
- **React.js (with Vite)**: Fast modern single-page application framework.
- **React Router**: Client-side page navigation and protected route layout.
- **Axios**: Centralized HTTP client with JWT Authorization headers.
- **Recharts**: Beautiful, responsive Area charts and Pie/Donut charts.
- **Lucide React**: Modern icons for utility categories and navigation.
- **Vanilla CSS**: Clean, custom design system (`index.css`) with light theme, deep navy text, and blue/teal accents.

### Backend
- **Java 17**: LTS version of Java.
- **Spring Boot 3.2.5**: REST API backend with Spring Web, Spring Data JPA, and Spring Validation.
- **Spring Security 6 with JWT**: Stateless authentication with BCrypt password hashing.
- **Apache PDFBox**: High-fidelity text extraction from PDF bills.
- **MySQL 8.0**: Relational database for persistent storage.
- **AI Intelligence**: Gemini LLM API integration with a built-in rule-based analysis engine fallback.

---

## 3. Project Structure

```
BillWiseAI/
├── backend/
│   ├── src/main/java/com/billwiseai/
│   │   ├── config/              # SecurityConfig, JwtUtil, JwtAuthenticationFilter, CorsConfig
│   │   ├── controller/          # REST Controllers (Auth, Bills, Dashboard, Analytics, Predictions, AI, Notifications)
│   │   ├── dto/                 # Essential DTOs (AuthRequest, RegisterRequest, AuthResponse)
│   │   ├── model/               # JPA Entities (User, Bill, Notification, ChatMessage)
│   │   ├── repository/          # Spring Data Repositories
│   │   └── service/             # Business Logic (Auth, Bills, PDF/OCR Extraction, Analysis, AI, Notifications)
│   ├── src/main/resources/
│   │   └── application.properties # MySQL, JWT, file upload, and Gemini AI configuration
│   ├── .env.example             # Backend environment variable template
│   └── pom.xml                  # Maven build configuration
│
└── frontend/
    ├── src/
    │   ├── components/          # Reusable components (Navbar, Sidebar, StatCard, CategoryBadge, StatusBadge, Modals)
    │   ├── context/             # AuthContext (login, register, token persistence)
    │   ├── pages/               # 12 Web Pages (Landing, Login, Register, Dashboard, Bills, BillDetails, UploadBill, Analytics, Insights, AskAI, Notifications, Settings)
    │   ├── services/            # Axios API client (api.js)
    │   ├── App.jsx              # Main router & protected layout
    │   ├── index.css            # Complete CSS styling system
    │   └── main.jsx             # React entry point
    ├── .env.example             # Frontend environment variable template
    └── package.json             # NPM dependencies
```

---

## 4. Required Software

Before running BillWiseAI, ensure you have:
1. **Java JDK 17** installed (run `java -version` to verify).
2. **Node.js 18+ or 20+** installed (run `node -v` to verify).
3. **MySQL Server 8.0** installed and running on port 3306 (default).

---

## 5. How to Set Up MySQL Database

1. Open your MySQL client (Command Prompt or MySQL Workbench):
```sql
CREATE DATABASE IF NOT EXISTS billwiseai;
```

2. Verify that your MySQL credentials match `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/billwiseai?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root
```
*(If your MySQL password is not `root`, simply change it in `application.properties` or set the `DB_PASSWORD` environment variable).*

---

## 6. How to Start the Backend (Spring Boot)

Open a terminal in the `backend` directory and run:

### Windows (PowerShell / CMD):
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The Spring Boot backend will start on **`http://localhost:8080`**.
You can verify it is running by opening:
`http://localhost:8080/api/health` — it will return `{"status":"Backend is running"}`.

---

## 7. How to Start the Frontend (React + Vite)

Open a second terminal in the `frontend` directory and run:

```powershell
cd frontend
npm install
npm run dev
```

The frontend will start on **`http://localhost:5173`**.
Open your browser and visit:
👉 **`http://localhost:5173`**

---

## 8. Quick Feature Walkthrough & Testing

1. **Landing Page (`/`)**:
   - View the hero section, feature cards, and dashboard preview.
   - Click **"Get Started"** or **"Sign In"**.

2. **Register & Login (`/register`, `/login`)**:
   - Create your user account with your Name, Email, and Password.
   - On the Login page, you can also click **"Fill Demo"** for instant credentials testing.

3. **Dashboard (`/dashboard`)**:
   - If you have no bills yet, you will see a clean empty state inviting you to upload your first bill.
   - Once bills are added, you will see your total spending this month, month-over-month trend, outstanding bills, predictions, and interactive Recharts graphs.

4. **Upload a Bill (`/upload-bill`)**:
   - Drag and drop any utility bill PDF, JPG, or PNG statement.
   - The automated text extraction engine will parse the provider, amount, billing date, due date, and consumption units.
   - Review or edit any field before saving to the database.
   - You can also switch to the **"Manual Entry"** tab to add a bill by hand.

5. **My Bills (`/bills`)**:
   - Search bills by provider name or filter by utility category (Electricity, Water, Gas, Internet, Mobile) and payment status (Paid, Unpaid).
   - Click the status badge to quickly toggle between Paid and Unpaid.
   - Click **View**, **Edit**, or **Delete** (with confirmation dialog).

6. **Bill Details & Comparison (`/bills/:id`)**:
   - Inspect single bill details.
   - View the automated **month-over-month comparison** calculating the exact dollar and percentage difference against previous bills in the same utility category.

7. **Analytics (`/analytics`)**:
   - Interactive monthly spending area chart and category breakdown donut chart.
   - Category table showing total spending, percentages, bill counts, and average bill amount.

8. **Predictions & Insights (`/insights`)**:
   - Next month's statistical bill forecast with high/moderate confidence rating.
   - Anomaly detection section flagging any bill that spiked more than 20% above historical category averages.

9. **Ask BillWiseAI Chat (`/ask-ai`)**:
   - Chat with the AI assistant about your actual utility expenses.
   - Click suggested chips like *"Which utility costs me the most?"* or *"Why did my electricity bill increase?"*.

10. **Notifications (`/notifications`)**:
    - View alerts for upcoming due dates, newly uploaded bills, and detected anomalies.
    - Click **"Mark as Read"** or **"Mark All as Read"**.

---

## 9. Configuring OCR and AI API (Optional)

BillWiseAI works **100% out of the box** even without external API keys:
- **PDF Extraction**: Uses the built-in Apache PDFBox library to parse statements locally.
- **AI Chat & Insights**: Includes a built-in rule-based analytical intelligence engine that computes genuine statistics from your database bills.

### To enable Google Gemini AI:
1. Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Add your key to `backend/src/main/resources/application.properties` or set it in your environment:
```properties
gemini.api.key=YOUR_GEMINI_API_KEY
```
3. Restart Spring Boot. The chat and insights will automatically utilize Gemini with your real bills context!

---

## 10. Common Beginner Troubleshooting Tips

- **Backend port 8080 already in use**:
  If port 8080 is in use by another application, you can change `server.port=8081` in `application.properties` and update `VITE_API_URL=http://localhost:8081/api` in frontend.
- **MySQL Access Denied**:
  Ensure the password in `application.properties` matches your local MySQL `root` password.
- **CORS Errors**:
  The backend includes `CorsConfig.java` allowing `localhost:5173`. Make sure the frontend is running on Vite's default port.
