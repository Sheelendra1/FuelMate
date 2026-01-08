import { cn } from "../lib/utils";
import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, Mail, Gem, Lock, Eye, EyeOff, ArrowLeft, X, AlertCircle, Loader } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { TextLoop, BlurFade, GlassButton, GradientBackground } from "../components/ui/GlassEffects";

const modalSteps = [
  { message: "Verifying credentials...", icon: <Loader className="w-12 h-12 text-primary animate-spin" /> },
  { message: "Logging in...", icon: <Loader className="w-12 h-12 text-primary animate-spin" /> },
  { message: "Welcome Back!", icon: <Gem className="w-12 h-12 text-primary" /> }
];
const TEXT_LOOP_INTERVAL = 1.0;

const DefaultLogo = () => (<div className="bg-primary text-primary-foreground rounded-md p-1.5"> <Gem className="h-4 w-4" /> </div>);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authStep, setAuthStep] = useState("email");
  const [modalStatus, setModalStatus] = useState('closed');
  const [modalErrorMessage, setModalErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const isPasswordValid = password.length > 0;

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (modalStatus !== 'closed' || authStep !== 'password') return;

    setModalStatus('loading');

    try {
      const result = await login(email, password);
      if (result.success) {
        setModalStatus('success');
        setTimeout(() => {
          navigate('/app/dashboard');
        }, 2000);
      } else {
        setModalErrorMessage(result.message || "Login failed");
        setModalStatus('error');
      }
    } catch (error) {
      setModalErrorMessage("An unexpected error occurred");
      setModalStatus('error');
    }
  };

  const handleProgressStep = () => {
    if (authStep === 'email') {
      if (isEmailValid) setAuthStep("password");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (authStep === 'email') handleProgressStep();
      else if (authStep === 'password') handleFinalSubmit(e);
    }
  };

  const handleGoBack = () => {
    if (authStep === 'password') setAuthStep('email');
  };

  const closeModal = () => {
    setModalStatus('closed');
    setModalErrorMessage('');
  };

  useEffect(() => {
    if (authStep === 'email') setTimeout(() => emailInputRef.current?.focus(), 500);
    else if (authStep === 'password') setTimeout(() => passwordInputRef.current?.focus(), 500);
  }, [authStep]);

  const Modal = () => (
    <AnimatePresence>
      {modalStatus !== 'closed' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-card/80 border-4 border-border rounded-2xl p-8 w-full max-w-sm flex flex-col items-center gap-4 mx-2">
            {(modalStatus === 'error') && <button onClick={closeModal} className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>}
            {modalStatus === 'error' && <>
              <AlertCircle className="w-12 h-12 text-destructive" />
              <p className="text-lg font-medium text-foreground text-center">{modalErrorMessage}</p>
              <GlassButton onClick={closeModal} size="sm" className="mt-4">Try Again</GlassButton>
            </>}
            {modalStatus === 'loading' &&
              <TextLoop interval={TEXT_LOOP_INTERVAL} stopOnEnd={true}>
                {modalSteps.slice(0, -1).map((step, i) =>
                  <div key={i} className="flex flex-col items-center gap-4">
                    {step.icon}
                    <p className="text-lg font-medium text-foreground">{step.message}</p>
                  </div>
                )}
              </TextLoop>
            }
            {modalStatus === 'success' &&
              <div className="flex flex-col items-center gap-4">
                {modalSteps[modalSteps.length - 1].icon}
                <p className="text-lg font-medium text-foreground">{modalSteps[modalSteps.length - 1].message}</p>
              </div>
            }
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="bg-background min-h-screen w-screen flex flex-col">
      <Modal />

      <div className={cn("fixed top-4 left-4 z-20 flex items-center gap-2", "md:left-1/2 md:-translate-x-1/2")}>
        <DefaultLogo />
        <h1 className="text-base font-bold text-foreground">FuelSync</h1>
      </div>

      <div className={cn("flex w-full flex-1 h-full items-center justify-center bg-card", "relative overflow-hidden")}>
        <div className="absolute inset-0 z-0"><GradientBackground /></div>
        <fieldset disabled={modalStatus !== 'closed'} className="relative z-10 flex flex-col items-center gap-8 w-[280px] mx-auto p-4">
          <AnimatePresence mode="wait">
            {/* EMAIL STEP */}
            {authStep === "email" && <motion.div key="email-content" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center gap-4">
              <BlurFade delay={0.25 * 1} className="w-full"><div className="text-center"><p className="font-serif font-light text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground whitespace-nowrap">Welcome Back</p></div></BlurFade>
              <BlurFade delay={0.25 * 2}><p className="text-sm font-medium text-muted-foreground">Sign in to your account</p></BlurFade>
            </motion.div>}

            {/* PASSWORD STEP */}
            {authStep === "password" && <motion.div key="password-title" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center text-center gap-4">
              <BlurFade delay={0} className="w-full"><div className="text-center"><p className="font-serif font-light text-4xl sm:text-5xl tracking-tight text-foreground whitespace-nowrap">Password</p></div></BlurFade>
              <BlurFade delay={0.25 * 1}><p className="text-sm font-medium text-muted-foreground">Enter your password to continue</p></BlurFade>
            </motion.div>}
          </AnimatePresence>

          <form onSubmit={handleFinalSubmit} className="w-[300px] space-y-6">
            <AnimatePresence>
              <motion.div key="form-fields" exit={{ opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full space-y-6">

                {/* EMAIL FIELDS */}
                {authStep === 'email' && (
                  <BlurFade key="email-field" inView={true} className="w-full">
                    <div className="relative w-full">
                      <AnimatePresence>
                        {email.length > 0 && <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute -top-6 left-4 z-10"><label className="text-xs text-muted-foreground font-semibold">Email</label></motion.div>}
                      </AnimatePresence>
                      <div className="glass-input-wrap w-full"><div className="glass-input">
                        <span className="glass-input-text-area"></span>
                        <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2"><Mail className="h-5 w-5 text-foreground/80" /></div>
                        <input ref={emailInputRef} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} className="relative z-10 h-full w-0 flex-grow bg-transparent text-foreground placeholder:text-foreground/60 focus:outline-none" />
                        <div className={cn("relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out", isEmailValid ? "w-10 pr-1" : "w-0")}><GlassButton type="button" onClick={handleProgressStep} size="icon" contentClassName="text-foreground/80 hover:text-foreground"><ArrowRight className="w-5 h-5" /></GlassButton></div>
                      </div></div>
                    </div>
                    <div className="text-center mt-4 space-y-2">
                      <Link to="/register" className="block text-sm text-foreground/70 hover:text-foreground">Don't have an account? Sign up</Link>

                    </div>
                  </BlurFade>
                )}

                {authStep === "password" && <BlurFade key="password-field" className="w-full">
                  <div className="relative w-full">
                    <AnimatePresence>
                      {password.length > 0 && <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute -top-6 left-4 z-10"><label className="text-xs text-muted-foreground font-semibold">Password</label></motion.div>}
                    </AnimatePresence>
                    <div className="glass-input-wrap w-full"><div className="glass-input">
                      <span className="glass-input-text-area"></span>
                      <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                        {isPasswordValid ? <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-foreground/80 hover:text-foreground transition-colors p-2 rounded-full">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button> : <Lock className="h-5 w-5 text-foreground/80 flex-shrink-0" />}
                      </div>
                      <input ref={passwordInputRef} type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} className="relative z-10 h-full w-0 flex-grow bg-transparent text-foreground placeholder:text-foreground/60 focus:outline-none" />
                      <div className={cn("relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out", isPasswordValid ? "w-10 pr-1" : "w-0")}><GlassButton type="submit" size="icon" contentClassName="text-foreground/80 hover:text-foreground"><ArrowRight className="w-5 h-5" /></GlassButton></div>
                    </div></div>
                  </div>
                  <BlurFade inView delay={0.2}><button type="button" onClick={handleGoBack} className="mt-4 flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /> Go back</button></BlurFade>
                </BlurFade>}
              </motion.div>
            </AnimatePresence>
          </form>
        </fieldset>
      </div>
    </div>
  );
};

export default Login;