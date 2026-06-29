# Vivid Events CRM - Event Enquiry & Booking CRM

A complete, production-ready full-stack Event Enquiry & Booking CRM built using React (Vite, Tailwind CSS, React Router, Recharts, Lucide Icons) and Node.js (Express, MySQL, Sequelize ORM).

## 🚀 Quick Start Instructions

### Prerequisites
- Node.js (v16+)
- MySQL Server running locally (defaulting to port `3306`)

---

### Step 1: Configure Environment Variables

1. Open **`backend/.env`** and enter your MySQL root password:
   ```env
   DB_PASS=your_mysql_password
   ```
2. *(Optional)* If your MySQL server runs on a different port (e.g. `3307`), change `DB_PORT=3307`.

---

### Step 2: Install Dependencies & Start the Backend

1. Open a terminal, navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install the backend packages:
   ```bash
   npm install
   ```
3. Start the Express server in development mode:
   ```bash
   npm run dev
   ```
   *Note: The server will automatically connect to MySQL, create the `event_crm` database if it doesn't exist, synchronize all tables, and seed the default admin account.*

---

### Step 3: Install Dependencies & Start the Frontend

1. Open a second terminal, navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install the frontend packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to: **`http://localhost:5173`**

---

## 🔑 Default Administrator Credentials

Use these credentials to sign in for the first time:
- **Email**: `admin@eventcrm.com`
- **Password**: `adminpassword`

---

## 🛠️ Main Workflows to Verify

1. **Client & Lead Capture**: Go to **Enquiries**, click **Add Enquiry**, fill in a new client's details. Verify that a customer profile and a lead are created in the database.
2. **Lead Conversion**: On the Enquiries page, click **Convert** on your new lead. Set the venue name and total budget. Verify that the lead status updates to "converted".
3. **Calendar Verification**: Navigate to the **Calendar** page and verify that the booking is scheduled on the correct date.
4. **Contract and Payment Tracking**: On the **Bookings** page, open your booking details. Select a PDF/Word file to upload as the contract, and record a payment. Verify that the payment status shifts from "unpaid" to "partially_paid" or "fully_paid".
5. **Staff Allocation & Role Access**: Go to **Employees**, add a new planner, log out, and log in with their account. Verify that they only see leads and bookings assigned to them.
