import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { 
  HelpCircle, Award, ArrowRight, 
  Terminal, ShieldCheck 
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import { clientAnalyzePassword } from '../services/mockApi';

export const LearningPage: React.FC = () => {
  const { user } = useAuth();
  
  // Learning hub navigation
  const [activeTab, setActiveTab] = useState<'articles' | 'challenge' | 'quiz'>('articles');

  // Daily Challenge state
  const [challengePass, setChallengePass] = useState('');
  const [challengePassed, setChallengePassed] = useState(false);
  const [challengeAnalysis, setChallengeAnalysis] = useState<any>(null);

  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [awardedBadge, setAwardedBadge] = useState<string | null>(null);

  // Security Articles Data
  const articles = [
    {
      title: "Passphrases vs Complex Passwords",
      cat: "Hygiene",
      desc: "For decades, users were taught to create short passwords with random characters like 'P@$$w0rd!'. Today, security agencies recommend 'Passphrases' – long sequences of simple, unrelated words like 'correct-horse-battery-staple'. Length contributes exponentially to key space entropy, making passphrases much harder to brute-force while remaining significantly easier to recall.",
      tip: "Aim for 4 or more random words combined with simple dividers."
    },
    {
      title: "Multi-Factor Authentication (MFA) Posture",
      cat: "Defense",
      desc: "MFA provides secondary validation layers. However, not all MFA is equal. SMS-based OTPs are vulnerable to SIM-swapping and intercept scripts. Mobile Authenticator apps (like Google Authenticator) are safer. The absolute gold standard is FIDO2/WebAuthn hardware keys (like YubiKeys) which resist network phishing exploits completely.",
      tip: "Avoid SMS MFA where possible; prioritize authenticator apps or security keys."
    },
    {
      title: "Credential Stuffing Rigs",
      cat: "Threats",
      desc: "Hackers do not manually guess passwords. In a credential stuffing attack, botnets take lists of emails and passwords leaked in previous breaches (e.g. from Adobe or LinkedIn leaks) and automatically try them across thousands of other sites. If you reuse credentials, a single breach on a minor site compromises your banking and primary email keys.",
      tip: "Use unique passwords for every service, managed via a vault."
    },
    {
      title: "Phishing & Social Engineering",
      cat: "Threats",
      desc: "Phishing is the act of mimicking legitimate portals (like a fake banking page) to capture user credentials. Sophisticated attacks use lookalike domains (homograph attacks, like replacing 'm' with 'rn'). Always verify the browser SSL certificate address bar before typing master credentials.",
      tip: "Bookmark primary login pages instead of clicking search result links."
    }
  ];

  // Quiz Questions Data
  const quizQuestions = [
    {
      question: "Which of the following contributes the MOST to a password's strength against brute-force attacks?",
      options: [
        "Replacing letters with lookalike numbers (e.g., 'a' with '4')",
        "Increasing the character length of the password",
        "Including at least one uppercase letter",
        "Changing the password every 30 days"
      ],
      answer: 1, // Index of correct option
      explanation: "Length is the single most important security factor. Because entropy grows exponentially with length, adding characters creates a vastly larger keyspace than adding complexity to a short password."
    },
    {
      question: "What makes SMS-based Multi-Factor Authentication vulnerable?",
      options: [
        "SIM-swapping and cellular network interception",
        "SMS messages take too long to arrive",
        "Smartphones do not encrypt incoming messages",
        "Users frequently write down their OTP codes"
      ],
      answer: 0,
      explanation: "SMS verification is vulnerable to SIM-swap social engineering and SS7 network redirects, meaning hackers can clone your number and receive verification codes."
    },
    {
      question: "What is a 'credential stuffing' exploit?",
      options: [
        "Flooding a login form with junk characters to crash the server",
        "Guessing common dictionary terms like '123456'",
        "Automating the testing of stolen username/password lists across multiple websites",
        "Installing keyloggers via phishing emails"
      ],
      answer: 2,
      explanation: "Credential stuffing exploits password reuse. Automated botnets take leaks from one breached website and automatically test them on hundreds of other platforms."
    },
    {
      question: "Why are passphrases (e.g., 'cactus-piano-guitar-coffee') highly recommended?",
      options: [
        "They are shorter than typical passwords",
        "They are difficult for computers to brute-force but easy for humans to remember",
        "They do not require special characters to be secure",
        "They confuse phishing sites"
      ],
      answer: 1,
      explanation: "Passphrases utilize long strings of simple words. Their length yields huge cryptographic entropy, but they remain highly memorable phonetically."
    },
    {
      question: "Which of the following represents the most secure Multi-Factor Authentication method?",
      options: [
        "Email verification codes",
        "Hardware security keys (FIDO2 / WebAuthn)",
        "Mobile push notifications",
        "Authenticator mobile apps (TOTP)"
      ],
      answer: 1,
      explanation: "Hardware security keys (like YubiKeys) use cryptography tied directly to the browser URL domain, making them completely immune to credential phishing redirections."
    }
  ];

  // Daily Challenge Checker
  const handleChallengeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setChallengePass(val);
    if (!val) {
      setChallengeAnalysis(null);
      setChallengePassed(false);
      return;
    }

    const res = await clientAnalyzePassword(val);
    setChallengeAnalysis(res);

    // Criteria:
    // 1. Length >= 14
    // 2. Score >= 85
    // 3. Must contain numbers
    // 4. Must contain symbols
    // 5. Must not be pwned
    const passes = 
      res.characterCount >= 14 && 
      res.score >= 85 && 
      res.numbersCount > 0 && 
      res.specialCount > 0 && 
      !res.pwned;
    
    setChallengePassed(passes);
  };

  const resetChallenge = () => {
    setChallengePass('');
    setChallengeAnalysis(null);
    setChallengePassed(false);
  };

  // Quiz logic
  const handleQuizAnswer = (idx: number) => {
    setSelectedAnswer(idx);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === quizQuestions[currentQuestion].answer) {
      setQuizScore(prev => prev + 1);
    }

    setSelectedAnswer(null);
    
    if (currentQuestion + 1 < quizQuestions.length) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setQuizFinished(true);
    
    const finalScore = selectedAnswer === quizQuestions[currentQuestion].answer ? quizScore + 1 : quizScore;
    const finalScoreValue = finalScore;

    // Calculate badge
    const pct = finalScoreValue / quizQuestions.length;
    let badge = "";
    if (pct >= 1.0) badge = "RootMaster";
    else if (pct >= 0.8) badge = "CyberSentry";
    else if (pct >= 0.6) badge = "PassShield";
    else badge = "CryptoNovice";
    
    setAwardedBadge(badge);

    // Sync score if user logged in
    if (user) {
      try {
        await apiService.submitQuizScore({
          score: finalScoreValue,
          totalQuestions: quizQuestions.length,
          badgeEarned: badge
        });
      } catch (e) {
        console.error("Score sync failed:", e);
      }
    }
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);
    setAwardedBadge(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Header */}
      <div className="border-b border-slate-900 pb-4">
        <h1 className="text-3xl font-extrabold tracking-wider font-cyber bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
          SECURITY ACADEMY
        </h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-cyber mt-1">
          Gamified Safety Training & Challenge Core
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-900 text-sm font-cyber max-w-md">
        <button
          onClick={() => setActiveTab('articles')}
          className={`flex-1 pb-3 text-center border-b-2 font-bold transition ${
            activeTab === 'articles' ? 'border-emerald-500 text-cyber-green' : 'border-transparent text-slate-500'
          }`}
        >
          Learning Hub
        </button>
        <button
          onClick={() => setActiveTab('challenge')}
          className={`flex-1 pb-3 text-center border-b-2 font-bold transition ${
            activeTab === 'challenge' ? 'border-emerald-500 text-cyber-green' : 'border-transparent text-slate-500'
          }`}
        >
          Daily Challenge
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 pb-3 text-center border-b-2 font-bold transition ${
            activeTab === 'quiz' ? 'border-emerald-500 text-cyber-green' : 'border-transparent text-slate-500'
          }`}
        >
          Safety Quiz
        </button>
      </div>

      {/* Articles View */}
      {activeTab === 'articles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {articles.map((art, i) => (
            <GlassCard key={i} hoverable className="hover-glow flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-cyber uppercase font-bold tracking-widest px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-emerald-400 inline-block mb-3">
                  {art.cat}
                </span>
                <h3 className="text-lg font-bold font-cyber text-slate-200">{art.title}</h3>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">{art.desc}</p>
              </div>
              <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[10px] font-cyber text-emerald-400/90 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span><span className="font-bold">AUDIT TIP:</span> {art.tip}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Daily Challenge View */}
      {activeTab === 'challenge' && (
        <div className="max-w-2xl mx-auto animate-fadeIn">
          <GlassCard variant="cyber" className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-900">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-cyber-green animate-pulse" />
                <span className="text-xs font-bold font-cyber text-slate-300">SYSTEM CHALLENGE PROTOCOL</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-cyber rounded">
                XP: +150
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold font-cyber text-slate-200">The Daily Posture Sandbox</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Create and submit a password that meets the following defensive criteria to bypass the firewall:
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-500 font-cyber">
                <li className="flex items-center"><span className="text-emerald-400 mr-2">✔</span> Minimum length of 14 characters</li>
                <li className="flex items-center"><span className="text-emerald-400 mr-2">✔</span> High strength score (&ge; 85)</li>
                <li className="flex items-center"><span className="text-emerald-400 mr-2">✔</span> Contains at least 1 number and 1 symbol</li>
                <li className="flex items-center"><span className="text-emerald-400 mr-2">✔</span> Zero occurrences in breached leak databases (HIBP check)</li>
              </ul>
            </div>

            {challengePassed ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-4 animate-scaleUp">
                <ShieldCheck className="w-12 h-12 text-cyber-green mx-auto" />
                <div>
                  <h4 className="text-md font-bold font-cyber text-cyber-green">Firewall Bypassed!</h4>
                  <p className="text-xs text-slate-400 mt-1">Excellent posture. This credential conforms to enterprise isolation policies.</p>
                </div>
                <button
                  onClick={resetChallenge}
                  className="px-4 py-2 border border-slate-800 bg-slate-900 rounded-xl text-xs font-cyber hover:bg-slate-850"
                >
                  Try Another Challenge
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-cyber mb-1.5">Draft Password</label>
                  <input
                    type="text"
                    value={challengePass}
                    onChange={handleChallengeChange}
                    placeholder="Input test string here..."
                    className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-700 focus:outline-none font-mono"
                  />
                </div>

                {challengeAnalysis && (
                  <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl grid grid-cols-2 gap-4 text-xs font-cyber text-slate-400">
                    <div>
                      <span>Score: <span className={`font-bold ${challengeAnalysis.score >= 85 ? 'text-emerald-400' : 'text-red-400'}`}>{challengeAnalysis.score}/100</span></span>
                    </div>
                    <div>
                      <span>Length: <span className={`font-bold ${challengeAnalysis.characterCount >= 14 ? 'text-emerald-400' : 'text-red-400'}`}>{challengeAnalysis.characterCount}</span></span>
                    </div>
                    <div>
                      <span>Composition: <span className={`font-bold ${(challengeAnalysis.numbersCount > 0 && challengeAnalysis.specialCount > 0) ? 'text-emerald-400' : 'text-red-400'}`}>N:{challengeAnalysis.numbersCount} S:{challengeAnalysis.specialCount}</span></span>
                    </div>
                    <div>
                      <span>Data Leak: <span className={`font-bold ${!challengeAnalysis.pwned ? 'text-emerald-400' : 'text-red-400'}`}>{challengeAnalysis.pwned ? 'Breached' : 'Clean'}</span></span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* Safety Quiz View */}
      {activeTab === 'quiz' && (
        <div className="max-w-xl mx-auto animate-fadeIn">
          {!quizStarted ? (
            <GlassCard className="text-center space-y-6">
              <HelpCircle className="w-12 h-12 text-cyber-green mx-auto animate-pulse" />
              <div>
                <h3 className="text-lg font-bold font-cyber text-slate-200">Defensive Competence Audit</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Test your knowledge on modern password hygiene, MFA threats, and zero-trust guidelines. Score 80% or better to secure professional safety badges.
                </p>
              </div>
              <button
                onClick={() => setQuizStarted(true)}
                className="w-full flex items-center justify-center py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 shadow-[0_0_15px_rgba(0,255,102,0.2)] font-cyber text-sm"
              >
                Begin Audit
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </GlassCard>
          ) : quizFinished ? (
            <GlassCard variant="cyber" className="text-center space-y-6 animate-scaleUp">
              <Award className="w-16 h-16 text-cyber-green mx-auto" />
              <div>
                <h3 className="text-xl font-bold font-cyber text-slate-100">Audit Completed</h3>
                <p className="text-xs text-slate-400 mt-1">You answered {quizScore} out of {quizQuestions.length} items correctly.</p>
              </div>

              {awardedBadge && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl max-w-xs mx-auto">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-cyber block">Awarded Certification:</span>
                  <span className="text-lg font-extrabold font-cyber text-cyber-green block mt-1 uppercase">{awardedBadge}</span>
                </div>
              )}

              {!user && (
                <p className="text-[10px] text-slate-500 font-cyber">
                  Tip: Register or log in to sync these certifications permanently to your metrics profile.
                </p>
              )}

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={restartQuiz}
                  className="flex-1 py-2.5 border border-slate-800 bg-slate-900 hover:bg-slate-850 text-xs font-cyber rounded-xl"
                >
                  Retake Quiz
                </button>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="space-y-6">
              {/* Progress bar */}
              <div className="flex justify-between items-center text-xs font-cyber text-slate-400">
                <span>QUESTION {currentQuestion + 1} OF {quizQuestions.length}</span>
                <span>SCORE: {quizScore}</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${((currentQuestion) / quizQuestions.length) * 100}%` }}
                ></div>
              </div>

              <div>
                <h4 className="text-md font-bold font-cyber text-slate-200">
                  {quizQuestions[currentQuestion].question}
                </h4>
              </div>

              <div className="space-y-3">
                {quizQuestions[currentQuestion].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuizAnswer(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-cyber transition ${
                      selectedAnswer === idx 
                        ? 'border-emerald-500 bg-emerald-500/10 text-slate-200' 
                        : 'border-slate-900 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null}
                className="w-full py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition font-cyber text-xs uppercase tracking-wider"
              >
                {currentQuestion + 1 === quizQuestions.length ? 'Finish Audit' : 'Next Question'}
              </button>
            </GlassCard>
          )}
        </div>
      )}

    </div>
  );
};
export default LearningPage;
