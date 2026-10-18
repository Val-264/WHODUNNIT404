# WHODUNNIT404

This project is developed with Node.js, Express, and TypeScript to manage a murder mystery game.

---

## Development Team

- **Valeria Martín** - [@Val-264](https://github.com/Val-264)
- **José Gibrán** - [@fvsjxsee](https://github.com/fvsjxsee)

---

## Technologies Used

- **Execution Environment:** Node.js
- **Frontend:** HTML, CSS
- **Backend:** TypeScript
- **Web Framework:** Express
- **Database:** MongoDB (Mongoose)
- **Version Control:** Git / GitHub (Gitflow)

---

## Project Structure

```text
WHODUNNIT404/
├── backend/
│   ├── src/
│   │   ├── config/       # Variables and environment configuration
│   │   ├── controllers/  # Request handlers (HTTP)
│   │   ├── dtos/         # Data Transfer Objects for validation
│   │   ├── middlewares/  # Custom Express middlewares
│   │   ├── models/       # Mongoose schemas and models
│   │   ├── routes/       # API endpoint definitions
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript custom definitions and interfaces
│   │   ├── app.ts        # Entry point application setup
│   │   └── server.ts     # Express server class configuration
│   └── tsconfig.json     # TypeScript compiler configuration
├── db/                   # Database scripts and seeders
└── frontend/             # Frontend source code