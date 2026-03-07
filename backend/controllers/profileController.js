import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';

export const getProfileAnalytics = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // 1. Fetch raw data
        const documents = await Document.find({ userId }).select('createdAt lastAccessed title _id');
        const quizzes = await Quiz.find({ userId }).populate('documentId', 'title').select('createdAt completedAt title score');
        const flashcards = await Flashcard.find({ userId }).select('createdAt lastReviewed title _id cards');
        const user = await User.findById(userId).select('username email pointsLevel');

        // 2. Study Statistics
        const totalDocuments = documents.length;
        const totalQuizzes = quizzes.length;

        // Sum total individual flashcards inside decks
        let totalFlashcardsCreated = 0;
        flashcards.forEach(deck => {
            totalFlashcardsCreated += deck.cards.length;
        });

        // Realistic calculation based on activity weights
        const totalStudyTimeHours = Math.round((totalDocuments * 0.5) + (totalQuizzes * 0.25) + (flashcards.length * 0.1));

        // 3. Knowledge Mastery (Average score per subject)
        const knowledgeMastery = [];
        const completedQuizzes = quizzes.filter(q => q.completedAt);

        if (completedQuizzes.length > 0) {
            const topicScores = {};
            completedQuizzes.forEach(q => {
                const docName = q.documentId?.title || q.title || "General Subject";
                if (!topicScores[docName]) topicScores[docName] = { total: 0, count: 0 };
                topicScores[docName].total += q.score;
                topicScores[docName].count += 1;
            });

            Object.keys(topicScores).forEach(topic => {
                const avg = Math.round(topicScores[topic].total / topicScores[topic].count);
                knowledgeMastery.push({ subject: topic, mastery: avg }); // Named 'mastery' for percentage mapping
            });
            knowledgeMastery.sort((a, b) => b.mastery - a.mastery);
        }

        // 4. Daily Activity (LeetCode Heatmap - 365 days)
        // Group events by YYYY-MM-DD
        const dailyActivityMap = new Map();

        const processEventDate = (dateString, weight = 1) => {
            if (!dateString) return;
            const date = new Date(dateString);
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const formattedDate = `${yyyy}-${mm}-${dd}`;

            const currentCount = dailyActivityMap.get(formattedDate) || 0;
            dailyActivityMap.set(formattedDate, currentCount + weight);
        };

        // Add timestamps to heatmap map
        documents.forEach(doc => {
            processEventDate(doc.createdAt, 1);
            if (doc.lastAccessed) processEventDate(doc.lastAccessed, 1);
        });
        quizzes.forEach(quiz => {
            processEventDate(quiz.createdAt, 1);
            if (quiz.completedAt) processEventDate(quiz.completedAt, 2); // Taking a quiz is higher weight
        });
        flashcards.forEach(fc => {
            processEventDate(fc.createdAt, 1);
            if (fc.lastReviewed) processEventDate(fc.lastReviewed, 1);
        });

        const dailyActivity = Array.from(dailyActivityMap, ([date, count]) => ({
            date,
            count
        })).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort oldest to newest

        // 5. Weekly Activity (Recharts - Mon-Sun bar chart)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyActivityMap = new Map();
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            weeklyActivityMap.set(days[d.getDay()], { date: d.getTime(), count: 0 });
        }

        const tallyWeekly = (dateString) => {
            if (!dateString) return;
            const d = new Date(dateString);
            d.setHours(0, 0, 0, 0);
            const dayName = days[d.getDay()];
            if (weeklyActivityMap.has(dayName) && d.getTime() === weeklyActivityMap.get(dayName).date) {
                weeklyActivityMap.get(dayName).count += 1;
            }
        };

        // Only map recent items for weekly
        documents.forEach(doc => tallyWeekly(doc.lastAccessed || doc.createdAt));
        quizzes.forEach(quiz => tallyWeekly(quiz.completedAt || quiz.createdAt));
        flashcards.forEach(fc => tallyWeekly(fc.lastReviewed || fc.createdAt));

        const weeklyActivity = Array.from(weeklyActivityMap, ([day, data]) => ({
            day,
            activity: data.count
        }));

        // 6. Recent Activity Timeline
        // Combine all events, sort descending by date, slice top 5
        let allEvents = [];

        documents.forEach(doc => {
            allEvents.push({ type: 'document', title: `Uploaded Document: ${doc.title}`, timestamp: doc.createdAt });
        });
        quizzes.filter(q => q.completedAt).forEach(quiz => {
            allEvents.push({ type: 'quiz', title: `Completed Quiz: ${quiz.title || quiz.documentId?.title || 'Subject'}`, timestamp: quiz.completedAt });
        });
        flashcards.filter(fc => fc.lastReviewed).forEach(fc => {
            allEvents.push({ type: 'flashcard', title: `Reviewed Flashcards: ${fc.title}`, timestamp: fc.lastReviewed });
        });

        allEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const recentActivity = allEvents.slice(0, 5);

        // Send payload matching the exact frontend component requirements
        res.status(200).json({
            success: true,
            data: {
                profile: {
                    name: user?.username || 'Student',
                    level: user?.pointsLevel || 1
                },
                studyStats: {
                    documentsUploaded: totalDocuments,
                    flashcardsCreated: totalFlashcardsCreated,
                    quizzesCompleted: completedQuizzes.length,
                    totalStudyTime: totalStudyTimeHours
                },
                dailyActivity,
                weeklyActivity,
                knowledgeMastery,
                recentActivity
            }
        });

    } catch (error) {
        console.error("Profile Analytics Error:", error);
        next(error);
    }
};
