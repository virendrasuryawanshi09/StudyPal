import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
export const getDashboard = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Get counts
        const totalDocuments = await Document.countDocuments({ userId });
        const totalFlashcardsSets = await Flashcard.countDocuments({ userId });
        const totalQuizzes = await Quiz.countDocuments({ userId });
        const completedQuizzes = await Quiz.countDocuments({
            userId,
            completedAt: { $ne: null }
        });

        // Get flashcard statistics
        const flashcardSets = await Flashcard.find({ userId });
        let totalFlashcards = 0;
        let reviewedFlashcards = 0;
        let starredFlashcards = 0;

        flashcardSets.forEach(set => {
            totalFlashcards += set.cards.length;
            reviewedFlashcards += set.cards.filter(c => c.reviewCount > 0).length;
            starredFlashcards += set.cards.filter(c => c.isStarred).length;
        });

        const quizzes = await Quiz.find({ userId, completedAt: { $ne: null } });
        const averageScore = quizzes.length > 0
            ? Math.round(quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length)
            : 0;

        // Recent activity
        const recentDocuments = await Document.find({ userId })
            .sort({ lastAccessed: -1 })
            .limit(5)
            .select('title fileName lastAccessed status');

        const recentQuizzes = await Quiz.find({ userId })
            .sort({ createdAt: -1 })
            .populate('documentId', 'title')
            .select('title score totalQuestions completedAt createdAt');

        const user = await User.findById(userId);
        const points = user?.points || 0;
        const pointsLevel = user?.pointsLevel || 1;

        // --- NEW CALCULATIONS FOR PREMIUM MERN DASHBOARD ---

        // 1. Progress Overview Extras
        const totalStudyTimeHours = Math.round((totalDocuments * 0.5) + (completedQuizzes * 0.25) + (totalFlashcardsSets * 0.1)); // Conservative activity-based formula
        const topicsCompleted = new Set(quizzes.map(q => q.documentId?.toString())).size;

        // 2. Today's Focus (Actionable Next Steps)
        const todaysFocus = [];
        const pendingQuizzes = await Quiz.find({ userId, completedAt: null }).sort({ createdAt: -1 }).limit(2).select('title _id');
        pendingQuizzes.forEach(pq => {
            todaysFocus.push({
                type: 'quiz',
                title: `Complete Quiz: ${pq.title}`,
                actionUrl: `/quizzes/${pq._id}`,
                priority: 'High'
            });
        });

        if (recentDocuments.length > 0 && todaysFocus.length < 3) {
            todaysFocus.push({
                type: 'review',
                title: `Review Document: ${recentDocuments[0].title}`,
                actionUrl: `/documents/${recentDocuments[0]._id}`,
                priority: 'Medium'
            });
        }

        const recentFlashcards = await Flashcard.find({ userId }).sort({ lastReviewed: 1 }).limit(1).select('title _id');
        if (recentFlashcards.length > 0 && todaysFocus.length < 3) {
            todaysFocus.push({
                type: 'flashcard',
                title: `Review Flashcards: ${recentFlashcards[0].title}`,
                actionUrl: `/flashcards/${recentFlashcards[0]._id}`,
                priority: 'Medium'
            });
        }

        // Fallbacks if user has no data
        if (todaysFocus.length < 3) {
            todaysFocus.push({
                type: 'pomodoro',
                title: 'Start 25m Focus Session',
                actionUrl: '/dashboard',
                priority: 'Low'
            });
        }
        if (todaysFocus.length < 3) {
            todaysFocus.push({
                type: 'upload',
                title: 'Upload new study materials',
                actionUrl: '/documents',
                priority: 'Low'
            });
        }

        // 3. Learning Insights & Knowledge Mastery (Best/Weakest based on quiz performance)
        let learningInsights = {
            bestSubject: "Complete quizzes to unlock analytics.",
            weakestSubject: "Take quizzes to identify your weaknesses.",
            recommendation: "Take more quizzes to identify your strengths and weaknesses."
        };

        const knowledgeMastery = [];

        if (completedQuizzes > 0) {
            // Calculate avg score per document/topic
            const topicScores = {};
            quizzes.forEach(q => {
                const docName = q.documentId?.title || q.title || "General Subject";
                if (!topicScores[docName]) {
                    topicScores[docName] = { total: 0, count: 0 };
                }
                topicScores[docName].total += q.score;
                topicScores[docName].count += 1;
            });

            let best = { name: null, score: -1 };
            let weakest = { name: null, score: 101 };

            Object.keys(topicScores).forEach(topic => {
                const avg = Math.round(topicScores[topic].total / topicScores[topic].count);
                knowledgeMastery.push({ subject: topic, accuracy: avg });

                if (avg > best.score) best = { name: topic, score: avg };
                if (avg < weakest.score) weakest = { name: topic, score: avg };
            });

            // Sort mastery descending
            knowledgeMastery.sort((a, b) => b.accuracy - a.accuracy);

            if (best.name) {
                learningInsights = {
                    bestSubject: best.name,
                    weakestSubject: weakest.name,
                    recommendation: weakest.name !== best.name
                        ? `Focus your next study session on reviewing material related to "${weakest.name}" to improve your overall average.`
                        : `You are performing consistently well in "${best.name}". Challenge yourself with new material!`
                };
            }
        }

        // 4. Weekly Heatmap Data (Map recent activity to Mon-Sun)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Initialize last 7 days ending today
        const weeklyActivityMap = new Map();
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            weeklyActivityMap.set(days[d.getDay()], { date: d.getTime(), count: 0 });
        }

        // Tally Documents
        recentDocuments.forEach(doc => {
            const docDate = new Date(doc.lastAccessed || doc.createdAt);
            docDate.setHours(0, 0, 0, 0);
            const dayName = days[docDate.getDay()];

            if (weeklyActivityMap.has(dayName) && docDate.getTime() === weeklyActivityMap.get(dayName).date) {
                weeklyActivityMap.get(dayName).count += 1;
            }
        });

        // Tally Quizzes
        recentQuizzes.forEach(quiz => {
            const quizDate = new Date(quiz.completedAt || quiz.createdAt);
            quizDate.setHours(0, 0, 0, 0);
            const dayName = days[quizDate.getDay()];

            if (weeklyActivityMap.has(dayName) && quizDate.getTime() === weeklyActivityMap.get(dayName).date) {
                weeklyActivityMap.get(dayName).count += 1;
            }
        });

        // Convert Map to Array format for Recharts
        const weeklyActivity = Array.from(weeklyActivityMap, ([day, data]) => ({
            day,
            activity: data.count
        }));

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalDocuments,
                    totalFlashcardsSets,
                    totalFlashcards,
                    reviewedFlashcards,
                    starredFlashcards,
                    totalQuizzes,
                    completedQuizzes,
                    averageScore,
                    points,
                    pointsLevel,
                    totalStudyTimeHours,
                    topicsCompleted
                },
                recentActivity: {
                    documents: recentDocuments,
                    quizzes: recentQuizzes.slice(0, 5) // return top 5 for timeline
                },
                analytics: {
                    todaysFocus,
                    learningInsights,
                    knowledgeMastery,
                    weeklyActivity,
                    recentPerformanceData: recentQuizzes.filter(q => q.completedAt).map(q => ({
                        id: q._id,
                        title: q.title || q.documentId?.title || 'Quiz',
                        score: q.score,
                        completedAt: q.completedAt
                    })).slice(0, 10).reverse() // Reverse so chronological order (oldest to newest) shows left-to-right on chart
                }
            }
        })
    } catch (error) {
        next(error);
    }
}

