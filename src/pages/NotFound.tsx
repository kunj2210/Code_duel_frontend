import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">

      {/* Animated Background Section */}
      <div
        className="w-full max-w-3xl h-[350px] sm:h-[400px] bg-center bg-no-repeat bg-contain flex items-center justify-center"
        style={{
          backgroundImage:
            "url('https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif')",
        }}
      >
        <h1 className="text-7xl sm:text-8xl font-extrabold text-primary drop-shadow-md">
          
        </h1>
      </div>

      {/* Content Box */}
      <div className="mt-6 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-semibold">
          Looks like you're lost
        </h2>

        <p className="text-muted-foreground max-w-md mx-auto">
          The page you are looking for is not available or might have been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>

          <Button asChild className="gradient-primary gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Go To Home
            </Link>
          </Button>

        </div>
      </div>

    </section>
  );
};

export default NotFound;