import { cn } from "../lib/utils";
import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, Mail, Gem, Lock, Eye, EyeOff, ArrowLeft, X, AlertCircle, PartyPopper, Loader, User, Phone, Car } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Confetti, TextLoop, BlurFade, GlassButton, GradientBackground } from "../components/ui/GlassEffects";

// --- LOCAL UTILS ---
const modalSteps = [
  { message: "Creating your account...", icon: <Loader className="w-12 h-12 text-primary animate-spin" /> },
  { message: "Setting up profile...", icon: <Loader className="w-12 h-12 text-primary animate-spin" /> },
  { message: "Finalizing...", icon: <Loader className="w-12 h-12 text-primary animate-spin" /> },
  { message: "Welcome Aboard!", icon: <PartyPopper className="w-12 h-12 text-green-500" /> }
];
const TEXT_LOOP_INTERVAL = 1.5;

const DefaultLogo = () => (<div className="bg-primary text-primary-foreground rounded-md p-1.5"> <Gem className="h-4 w-4" /> </div>);

// --- MAIN COMPONENT ---
const Register = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authStep, setAuthStep] = useState("details"); // Started with details
  const [modalStatus, setModalStatus] = useState('closed');
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  const confettiRef = useRef(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const isDetailsValid = name.trim().length > 0 && phone.trim().length >= 10;
  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const isPasswordValid = password.length >= 6;
  const isConfirmPasswordValid = confirmPassword.length >= 6;

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  const fireSideCanons = () => {
    const fire = confettiRef.current?.fire;
    if (fire) {
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
      const particleCount = 50;
      fire({ ...defaults, particleCount, origin: { x: 0, y: 1 }, angle: 60 });
      fire({ ...defaults, particleCount, origin: { x: 1, y: 1 }, angle: 120 });
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (modalStatus !== 'closed' || authStep !== 'confirmPassword') return;

    if (password !== confirmPassword) {
      setModalErrorMessage("Passwords do not match!");
      setModalStatus('error');
    } else {
      setModalStatus('loading');

      // Attempt Registration
      try {
        const result = await register({ name, email, phone, vehicleNumber, password, role: 'customer', referralCode });
        if (result.success) {
          fireSideCanons();
          setModalStatus('success');
          setTimeout(() => {
            navigate('/app/dashboard');
          }, 3000);
        } else {
          setModalErrorMessage(result.message || "Registration failed");
          setModalStatus('error');
        }
      } catch (error) {
        setModalErrorMessage("An unexpected error occurred");
        setModalStatus('error');
      }
    }
  };

  const handleProgressStep = () => {
    if (authStep === 'details') {
      if (isDetailsValid) setAuthStep("email");
    } else if (authStep === 'email') {
      if (isEmailValid) setAuthStep("password");
    } else if (authStep === 'password') {
      if (isPasswordValid) setAuthStep("confirmPassword");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleProgressStep();
    }
  };

  const handleGoBack = () => {
    if (authStep === 'confirmPassword') {
      setAuthStep('password');
      setConfirmPassword('');
    }
    else if (authStep === 'password') setAuthStep('email');
    else if (authStep === 'email') setAuthStep('details');
  };

  const closeModal = () => {
    setModalStatus('closed');
    setModalErrorMessage('');
  };

  useEffect(() => {
    if (authStep === 'email') setTimeout(() => emailInputRef.current?.focus(), 500);
    else if (authStep === 'password') setTimeout(() => passwordInputRef.current?.focus(), 500);
    else if (authStep === 'confirmPassword') setTimeout(() => confirmPasswordInputRef.current?.focus(), 500);
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
      <Confetti ref={confettiRef} manualstart className="fixed top-0 left-0 w-full h-full pointer-events-none z-[999]" />
      <Modal />

      <div className={cn("fixed top-4 left-4 z-20 flex items-center gap-2", "md:left-1/2 md:-translate-x-1/2")}>
        <DefaultLogo />
        <h1 className="text-base font-bold text-foreground">FuelSync</h1>
      </div>

      <div className={cn("flex w-full flex-1 h-full items-center justify-center bg-card", "relative overflow-hidden")}>
        <div className="absolute inset-0 z-0"><GradientBackground /></div>
        <fieldset disabled={modalStatus !== 'closed'} className="relative z-10 flex flex-col items-center gap-8 w-[280px] mx-auto p-4">
          <AnimatePresence mode="wait">
            {/* DETAILS STEP */}
            {authStep === "details" && <motion.div key="details-content" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center gap-4">
              <BlurFade delay={0.25 * 1} className="w-full"><div className="text-center"><p className="font-serif font-light text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground whitespace-nowrap">Join FuelSync</p></div></BlurFade>
              <BlurFade delay={0.25 * 2}><p className="text-sm font-medium text-muted-foreground">Enter your details to get started</p></BlurFade>
            </motion.div>}

            {/* EMAIL STEP */}
            {authStep === "email" && <motion.div key="email-content" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center gap-4">
              <BlurFade delay={0.25 * 1} className="w-full"><div className="text-center"><p className="font-serif font-light text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground whitespace-nowrap">Your Contact</p></div></BlurFade>
              <BlurFade delay={0.25 * 2}><p className="text-sm font-medium text-muted-foreground">We'll use this to verify it's you</p></BlurFade>
            </motion.div>}

            {/* PASSWORD STEP */}
            {authStep === "password" && <motion.div key="password-title" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center text-center gap-4">
              <BlurFade delay={0} className="w-full"><div className="text-center"><p className="font-serif font-light text-4xl sm:text-5xl tracking-tight text-foreground whitespace-nowrap">Create password</p></div></BlurFade>
              <BlurFade delay={0.25 * 1}><p className="text-sm font-medium text-muted-foreground">Must be at least 6 characters.</p></BlurFade>
            </motion.div>}

            {/* CONFIRM STEP */}
            {authStep === "confirmPassword" && <motion.div key="confirm-title" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center text-center gap-4">
              <BlurFade delay={0} className="w-full"><div className="text-center"><p className="font-serif font-light text-4xl sm:text-5xl tracking-tight text-foreground whitespace-nowrap">One Last Step</p></div></BlurFade>
              <BlurFade delay={0.25 * 1}><p className="text-sm font-medium text-muted-foreground">Confirm your password to continue</p></BlurFade>
            </motion.div>}
          </AnimatePresence>

          <form onSubmit={handleFinalSubmit} className="w-[300px] space-y-6">
            <AnimatePresence>
              {authStep !== 'confirmPassword' && <motion.div key="form-fields" exit={{ opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full space-y-6">

                {/* DETAILS FIELDS */}
                {authStep === 'details' && (
                  <BlurFade key="details-fields" inView={true} className="w-full space-y-4">
                    <div className="relative w-full">
                      <AnimatePresence>
                        {name.length > 0 && <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute -top-6 left-4 z-10"><label className="text-xs text-muted-foreground font-semibold">Full Name</label></motion.div>}
                      </AnimatePresence>
                      <div className="glass-input-wrap w-full"><div className="glass-input">
                        <span className="glass-input-text-area"></span>
                        <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2"><User className="h-5 w-5 text-foreground/80" /></div>
                        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKeyDown} className="relative z-10 h-full w-0 flex-grow bg-transparent text-foreground placeholder:text-foreground/60 focus:outline-none" />
                      </div></div>
                    </div>
                    <div className="relative w-full">
                      <AnimatePresence>
                        {phone.length > 0 && <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute -top-6 left-4 z-10"><label className="text-xs text-muted-foreground font-semibold">Phone Number</label></motion.div>}
                      </AnimatePresence>
                      <div className="glass-input-wrap w-full"><div className="glass-input">
                        <span className="glass-input-text-area"></span>
                        <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2"><Phone className="h-5 w-5 text-foreground/80" /></div>
                        <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={handleKeyDown} className="relative z-10 h-full w-0 flex-grow bg-transparent text-foreground placeholder:text-foreground/60 focus:outline-none" />
                      </div></div>
                    </div>
                    <div className="relative w-full">
                      <AnimatePresence>
                        {vehicleNumber.length > 0 && <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute -top-6 left-4 z-10"><label className="text-xs text-muted-foreground font-semibold">Vehicle (Optional)</label></motion.div>}
                      </AnimatePresence>
                      <div className="glass-input-wrap w-full"><div className="glass-input">
                        <span className="glass-input-text-area"></span>
                        <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2"><Car className="h-5 w-5 text-foreground/80" /></div>
                        <input type="text" placeholder="Vehicle Number" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} onKeyDown={handleKeyDown} className="relative z-10 h-full w-0 flex-grow bg-transparent text-foreground placeholder:text-foreground/60 focus:outline-none" />
                      </div></div>
                    </div>

                    <div className="relative w-full">
                      <AnimatePresence>
                        {referralCode.length > 0 && <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute -top-6 left-4 z-10"><label className="text-xs text-muted-foreground font-semibold">Referral Code (Optional)</label></motion.div>}
                      </AnimatePresence>
                      <div className="glass-input-wrap w-full"><div className="glass-input">
                        <span className="glass-input-text-area"></span>
                        <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2"><PartyPopper className="h-5 w-5 text-foreground/80" /></div>
                        <input type="text" placeholder="Referral Code (Optional)" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} onKeyDown={handleKeyDown} className="relative z-10 h-full w-0 flex-grow bg-transparent text-foreground placeholder:text-foreground/60 focus:outline-none" />
                        <div className={cn("relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out", isDetailsValid ? "w-10 pr-1" : "w-0")}><GlassButton type="button" onClick={handleProgressStep} size="icon" contentClassName="text-foreground/80 hover:text-foreground"><ArrowRight className="w-5 h-5" /></GlassButton></div>
                      </div></div>
                    </div>

                    <div className="text-center mt-4">
                      <Link to="/login" className="text-sm text-foreground/70 hover:text-foreground">Already have an account? Sign in</Link>
                    </div>
                  </BlurFade>
                )}

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
                    <BlurFade inView delay={0.2}><button type="button" onClick={handleGoBack} className="mt-4 flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /> Go back</button></BlurFade>
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
                      <div className={cn("relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out", isPasswordValid ? "w-10 pr-1" : "w-0")}><GlassButton type="button" onClick={handleProgressStep} size="icon" contentClassName="text-foreground/80 hover:text-foreground"><ArrowRight className="w-5 h-5" /></GlassButton></div>
                    </div></div>
                  </div>
                  <BlurFade inView delay={0.2}><button type="button" onClick={handleGoBack} className="mt-4 flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /> Go back</button></BlurFade>
                </BlurFade>}
              </motion.div>}
            </AnimatePresence>

            <AnimatePresence>
              {authStep === 'confirmPassword' && <BlurFade key="confirm-password-field" className="w-full">
                <div className="relative w-full">
                  <AnimatePresence>
                    {confirmPassword.length > 0 && <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute -top-6 left-4 z-10"><label className="text-xs text-muted-foreground font-semibold">Confirm Password</label></motion.div>}
                  </AnimatePresence>
                  <div className="glass-input-wrap w-[300px]"><div className="glass-input">
                    <span className="glass-input-text-area"></span>
                    <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                      {isConfirmPasswordValid ? <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-foreground/80 hover:text-foreground transition-colors p-2 rounded-full">{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button> : <Lock className="h-5 w-5 text-foreground/80 flex-shrink-0" />}
                    </div>
                    <input ref={confirmPasswordInputRef} type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="relative z-10 h-full w-0 flex-grow bg-transparent text-foreground placeholder:text-foreground/60 focus:outline-none" />
                    <div className={cn("relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out", isConfirmPasswordValid ? "w-10 pr-1" : "w-0")}><GlassButton type="submit" size="icon" contentClassName="text-foreground/80 hover:text-foreground"><ArrowRight className="w-5 h-5" /></GlassButton></div>
                  </div></div>
                </div>
                <BlurFade inView delay={0.2}><button type="button" onClick={handleGoBack} className="mt-4 flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /> Go back</button></BlurFade>
              </BlurFade>}
            </AnimatePresence>
          </form>
        </fieldset>
      </div>
    </div>
  );
};

export default Register;