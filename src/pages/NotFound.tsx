import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-surface to-surface-muted">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <Logo size="xl" className="mx-auto mb-8" />
        <h1 className="text-6xl font-bold mb-4 gradient-text">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Oops! Page not found</p>
        <Button asChild>
          <a href="/">Return to Dashboard</a>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
