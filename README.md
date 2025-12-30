
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
- Secure user authentication and protected routes
- Clean UI focused on productivity rather than clutter

---

## Screenshots

Screenshots will be added soon.
(Dashboard, study plan view, and session tracking screens)

---

## Tech Stack

- Frontend: JavaScript, React.js, CSS  
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
- Add topics and estimate time for each one
- Start a study session and track progress
- Add notes or useful links while studying
- Mark topics as completed once finished

This workflow is designed to match how students actually study, rather than forcing a rigid system.

---

## Development

### Available Scripts

- npm run dev – start development server
- npm run build – build the project for production
- npm run start – run the production build
- npm run lint – run ESLint checks
- npm run format – format code using Prettier
- npm run test – run tests (when available)

---

### Code Quality

- ESLint is used to maintain consistent coding standards
- Prettier is used for formatting
- Folder structure follows a modular and readable approach
- Environment variables are used for sensitive data

---

## Deployment

The project can be deployed on platforms like:

- Render
- Railway
- Vercel (frontend)
- Any Node.js-supported hosting service

Make sure environment variables are properly configured in the deployment platform.

---

## Roadmap

### Short Term
- Improve UI and user experience
- Add better progress visualization
- Add calendar-based study scheduling

### Medium Term
- Spaced repetition support
- Analytics dashboard for study habits
- Data export and backup options

### Long Term
- Mobile version of the app
- Collaborative study groups
- AI-assisted study plan suggestions

---

## Contributing

This project is currently maintained as a personal learning project.  
Suggestions, issues, and pull requests are welcome.

Basic contribution flow:
1. Fork the repository
2. Create a new branch
3. Make changes with clear commit messages
4. Open a pull request explaining your changes

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

This project is actively evolving.  
Some features are intentionally simple to keep the focus on learning, clarity, and maintainability rather than over-engineering.

---

## Copyright

© 2025 Virendra Suryawanshi. All rights reserved.

This project and its source code are provided for educational and personal use.  
Unauthorized copying, modification, distribution, or commercial use of this project, or any part of it, without explicit permission from the author is prohibited, except as permitted under the terms of the MIT License.

