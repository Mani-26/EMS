## **🚀 Event Registration System**  

A full-stack event registration system built with **React (Frontend)** and **Node.js + Express + MongoDB (Backend)**. Users can register for events, and admins can create and manage events.  

---

## **📂 Project Structure**  

```
📦 Event-Registration
├─── client/          # Frontend (React)
│   ├── public/       # Static files (index.html, icons, etc.)
│   ├── src/          # React Components & Pages
│   ├── package.json  # Frontend dependencies
│   └── .gitignore    
│
├─── server/          # Backend (Node.js + Express)
│   ├── server.js     # Main API file
│   ├── .env          # Environment variables (ignored)
│   ├── package.json  # Backend dependencies
│   └── .gitignore    
│
└─── README.md        # Project documentation
```

---

## **⚡ Features**  

✅ Users can **register** for events  
✅ Users receive **QR-coded tickets via email**  
✅ Admins can **create, edit, and delete** events  
✅ **Seat limit enforcement** (prevents overbooking)  
✅ **Registration disabled if event date has passed**  

---

## **🛠️ Installation & Setup**  

### **1️⃣ Clone the Repository**  
```sh
git clone https://github.com/Mani-26/EMS.git
cd EMS
```

### **2️⃣ Install Dependencies**  

#### **Backend (Server)**
```sh
cd server
npm install
```

#### **Frontend (Client)**
```sh
cd client
npm install
```

---

## **🚀 Running the Project**  

### **Start Backend (Express Server)**
```sh
cd server
npm start
```

### **Start Frontend (React App)**
```sh
cd client
npm start
```

> Open **`http://localhost:3000`** in your browser to see the app in action!  

---

## **📌 API Endpoints**  

| Method | Endpoint             | Description                |
|--------|----------------------|----------------------------|
| GET    | `/api/events`        | Get all events            |
| GET    | `/api/events/:id`    | Get a specific event      |
| POST   | `/api/events`        | Create a new event (Admin) |
| PUT    | `/api/events/:id`    | Update an event (Admin)   |
| POST   | `/api/register`      | Register for an event     |

---

## **📜 Environment Variables**  

Create a `.env` file inside the `server/` folder and add:  

```env
MONGO_URI=your-mongodb-connection-string
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
PORT=5000
```

> 🚨 **DO NOT** share your `.env` file publicly!

---

## **📌 To-Do (Future Enhancements)**  

- [ ] Add user authentication (login/signup)  
- [ ] Implement admin dashboard  
- [ ] Improve UI/UX design  

---