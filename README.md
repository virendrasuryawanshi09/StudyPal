
# StudyPal

StudyPal is a full-stack web application built to help students plan their studies, organize notes, and track learning progress in a simple and distraction-free way.  
The goal of this project is to make day-to-day studying more structured without adding unnecessary complexity.

This project was built as part of my learning journey in full-stack web development and focuses on clean architecture, real-world workflows, and practical usability.

---

## Features

- Create and manage structured study plans
- Break plans into topics with time estimates
- Track study sessions and completion progress
- Add notes, useful resources, and links for each topic
- Search and organize content using simple tags
- User authentication with JWT and protected routes
- Login and registration flow with proper loading and error states
- Reusable UI components (spinner, buttons, form inputs)
- Light and dark mode support with consistent styling
- Initial dashboard layout designed for future scalability
- Clean UI focused on productivity rather than clutter


---

## Screenshots

Screenshots will be added soon.
(Dashboard, study plan view, and session tracking screens)

---

## Tech Stack

- Frontend: React.js, javaScript, React router

- Backend: Node.js, Express.js

- Database: MongoDB

- Authentication: JSON Web Tokens (JWT)

- Tooling: npm, ESLint, Prettier
---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js (version 18 or higher)
- npm (comes with Node.js)
- MongoDB (local or cloud instance)

---

### Installation

1. Clone the repository:
  ```
   git clone https://github.com/virendrasuryawanshi09/StudyPal.git  
   cd StudyPal
  ```
2. Install dependencies:
  ```
   npm install
  ```
---

### Environment Variables

Create a `.env` file in the root directory and add the following values:
```
PORT=3000  
NODE_ENV=development  
MONGO_URI=your_mongodb_connection_string  
JWT_SECRET=your_secret_key  
```
---

### Running the Project Locally

Start the development server:
```
npm run dev
```
The application will be available at:
```
http://localhost:3000
```
---

## Usage

- Create a new study plan from the dashboard
- Break the plan into topics and estimate time for each
- Start a study session and track progress in real time
- Add notes or useful links while studying
- Mark topics as completed once finished

This workflow is designed to reflect real study habits, keeping the process flexible and focused rather than rigid.


---
## Authentication Flow

- Users create an account and log in before accessing any protected part of the application
- On successful login, a JWT token is generated and used to verify the user’s identity
- Authentication state is managed centrally so it remains consistent across the app
- If a user is not authenticated, they are automatically redirected to the login page
- Logging out safely clears authentication data and ends the user session


## Development

### Available Scripts

- `npm run dev` – starts the development server with hot reloading
- `npm run build` – creates an optimized production build
- `npm run start` – runs the production build locally
- `npm run lint` – checks code quality using ESLint
- `npm run format` – formats code consistently using Prettier
- `npm run test` – runs tests when available


### Code Quality

- Authentication logic is kept separate from UI components to maintain clear responsibilities
- Loading indicators are implemented as reusable components to ensure consistent feedback across the app
- Layout, pages, and UI primitives are clearly separated to keep the codebase organized and scalable
- Commit messages follow a consistent, conventional style to maintain a clean project history

---

## Deployment

The application can be deployed on common Node.js–compatible platforms, such as:

- Render
- Railway
- Vercel (frontend deployment)
- Any hosting service that supports Node.js applications

Environment variables must be configured correctly on the deployment platform to ensure secure and reliable operation.

---
## Dashboard (Current State)

- A basic dashboard page has been implemented as the main entry point after login
- Access to the dashboard is protected and available only to authenticated users
- The layout is structured to allow future widgets and analytics without major refactoring
- The current design focuses on clarity and scalability rather than visual complexity

## Roadmap

### Short Term
- Enhance the dashboard with basic statistics and recent activity
- Improve UI feedback using skeleton loaders
- Enable study plan creation directly from the dashboard

### Medium Term
- Add spaced repetition support to improve learning effectiveness
- Introduce analytics to help users understand their study habits
- Provide options to export and back up user data

### Long Term
- Improve mobile usability and responsiveness
- Add support for collaborative study groups
- Explore AI-assisted study plan suggestions

---


## License

This project is licensed under the MIT License.

---

## Contact

Maintainer: Virendra Suryawanshi  
GitHub: https://github.com/virendrasuryawanshi09  
Issues: https://github.com/virendrasuryawanshi09/StudyPal/issues  

---

## Final Notes

This project is actively evolving as part of my full-stack learning journey.  
Some features are intentionally kept simple to prioritize clarity, maintainability, and real-world development practices over unnecessary complexity.

---

## Copyright

© 2025 Virendra Suryawanshi.

This project is provided under the terms of the MIT License and is intended for educational and personal use.  
Refer to the license file for details regarding usage, modification, and distribution.


