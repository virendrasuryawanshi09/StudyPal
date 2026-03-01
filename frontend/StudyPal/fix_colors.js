import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToFix = [
    'src/components/quizzes/QuizManager.jsx',
    'src/pages/Quizzes/QuizTakePage.jsx',
    'src/pages/Quizzes/QuizResultPage.jsx',
    'src/pages/Flashcards/FlashcardsListPage.jsx',
    'src/pages/Profile/ProfilePage.jsx'
];

filesToFix.forEach(relativePath => {
    const fullPath = path.join(__dirname, relativePath);
    if (!fs.existsSync(fullPath)) return;

    let content = fs.readFileSync(fullPath, 'utf8');

    // Replace the indigo/purple gradients and specific text colors
    // This shifts the whole palette to the brand's orange/amber scheme
    content = content.replace(/from-indigo-/g, 'from-orange-');
    content = content.replace(/via-purple-/g, 'via-amber-');
    content = content.replace(/to-pink-/g, 'to-yellow-');
    content = content.replace(/to-purple-/g, 'to-amber-');
    content = content.replace(/to-indigo-/g, 'to-orange-');

    content = content.replace(/text-indigo-/g, 'text-orange-');
    content = content.replace(/bg-indigo-/g, 'bg-orange-');
    content = content.replace(/border-indigo-/g, 'border-orange-');
    content = content.replace(/ring-indigo-/g, 'ring-orange-');
    content = content.replace(/shadow-indigo-/g, 'shadow-orange-');

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Fixed colors in', relativePath);
});
