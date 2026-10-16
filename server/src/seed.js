import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as M from './models/index.js';

const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) { console.error('Set MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD in server/.env'); process.exit(1); }
await mongoose.connect(MONGO_URI);
await Promise.all([M.Profile, M.Skill, M.Project, M.Experience, M.Education, M.Certification, M.Achievement, M.BlogPost, M.SocialLink, M.SiteSettings].map((m) => m.deleteMany()));
await M.User.findOneAndUpdate({ email: ADMIN_EMAIL.toLowerCase() }, { password: await bcrypt.hash(ADMIN_PASSWORD, 12), role: 'admin' }, { upsert: true });

await M.Profile.create({
  name: 'Raja Mikrani', heroHeadline: "Hi, I'm Raja Mikrani", title: 'AI / Machine Learning Engineer',
  roles: ['AI Engineer', 'Machine Learning Engineer', 'NLP Engineer', 'Data Science Enthusiast', 'Generative AI Developer'],
  heroDescription: 'I build intelligent applications using Machine Learning, Deep Learning, NLP and Generative AI.',
  heroPath: ['BCA Student', 'AI/ML', 'Projects', 'AI Engineer'], location: 'Nepal', status: 'Final-year (8th semester) BCA student',
  objective: 'I am an aspiring AI Engineer focused on Machine Learning, Deep Learning, NLP and Generative AI. I enjoy turning real-world problems into practical AI-powered applications and continuously improving my skills through projects and experimentation.',
  bio: 'I am a final-year BCA student from Nepal building my career in Artificial Intelligence and Machine Learning. My learning journey has taken me from software development into Machine Learning, Deep Learning, Natural Language Processing and Generative AI.\n\nI enjoy learning by building practical projects rather than studying theory alone. My goal is to become a strong AI Engineer capable of developing, deploying and maintaining real-world intelligent systems.',
});
const skills = {
  Programming: ['Python', 'JavaScript', 'SQL', 'Java'],
  'Machine Learning': ['Scikit-learn', 'Regression', 'Classification', 'Clustering', 'Feature Engineering', 'Model Evaluation', 'XGBoost', 'CatBoost'],
  'Deep Learning': ['TensorFlow', 'Keras', 'ANN', 'CNN', 'RNN', 'LSTM', 'Deep Learning'],
  NLP: ['NLP', 'Word2Vec', 'Text Classification', 'Sentiment Analysis', 'RNN/LSTM', 'Transformers', 'Attention Mechanism'],
  'Generative AI': ['LLMs', 'Generative AI', 'RAG', 'LangChain', 'Vector Databases', 'Prompt Engineering', 'AI Agents'],
  Development: ['MERN Stack', 'Flask', 'Streamlit', 'REST APIs', 'Git', 'GitHub', 'Docker'],
  Databases: ['MongoDB', 'PostgreSQL', 'MySQL'],
};
await M.Skill.insertMany(Object.entries(skills).flatMap(([category, names]) => names.map((name, i) => ({ name, category, order: i }))));
const P = (title, summary, tech, features = []) => ({ title, summary, tech, features });
await Promise.all([
  P('Student Performance Indicator', 'Machine learning application that predicts student performance based on academic and demographic features.', ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'CatBoost', 'XGBoost', 'Flask', 'Render'], ['Data preprocessing', 'EDA', 'ML model training', 'Prediction API', 'Web interface', 'Deployment']),
  P('Customer Churn Prediction', 'Deep learning based customer churn prediction system using an Artificial Neural Network.', ['Python', 'TensorFlow', 'Keras', 'ANN', 'Pandas', 'Scikit-learn', 'Streamlit']),
  P('Game of Thrones Personality Matcher', 'NLP-based personality matching application using Word2Vec and semantic similarity.', ['Python', 'NLP', 'Word2Vec', 'Streamlit', 'APIs']),
  P('RNN Sentiment Analysis', 'Sentiment analysis system using recurrent neural networks for text classification.', ['Python', 'TensorFlow', 'Keras', 'RNN', 'NLP']),
  P('Next Word Predictor', 'Deep learning based next-word prediction system using sequence modelling and LSTM.', ['Python', 'TensorFlow', 'Keras', 'NLP', 'LSTM', 'Deep Learning']),
  P('Meetra', 'A video conferencing platform built with modern full-stack technologies.', ['React', 'Node.js', 'Express', 'PostgreSQL', 'Prisma', 'WebRTC', 'WebSockets']),
].map((p, order) => M.Project.create({ ...p, order, published: true })));
await M.Education.create({ institution: '', degree: 'Bachelor of Computer Application (BCA)', field: 'Computer Application', status: 'Final Semester', country: 'Nepal', description: '' });
await M.SocialLink.insertMany(['GitHub', 'LinkedIn', 'Email', 'Kaggle'].map((platform, order) => ({ platform, url: '', order })));
await M.SiteSettings.create({});
console.log(`Seed complete. Admin: ${ADMIN_EMAIL}. Add social/resume URLs, images and project links in /admin.`);
await mongoose.disconnect();
