import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ErrorMessage } from '@/components/ui/error-message';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ValidatedInput } from '@/components/common/ValidatedInput';
import { useDelayedNavigate } from '@/hooks/use-delayed-navigate';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');

  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({});

  const { register: registerUser, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { register, isLoading } = useAuth();

  const navigate = useNavigate();
  const { toast } = useToast();
  const [showErrors, setShowErrors] = useState(false);
  const delayedNavigate = useDelayedNavigate();

  const validate = () => {

    const newErrors: typeof errors = {};
    if (!username) newErrors.username = 'Username is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!leetcodeUsername.trim()) {
      newErrors.leetcodeUsername = 'LeetCode username is required';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    e.stopPropagation();
    if (!validate()) return;

    const result = await registerUser(username, email, password, leetcodeUsername);

    if (result.success) {
      toast({ title: 'Account created!', description: 'Successfully registered.' });
      navigate('/dashboard');
    } else {
      toast({ title: 'Registration failed', description: result.message, variant: 'destructive' });


    if (!validate()) {
      setShowErrors(true);
      return;
    }

    setShowErrors(false);

    try {
      await register(name, email, password, leetcodeUsername);
      toast({
        title: 'Account created!',
        description: 'Welcome to LeetCode Tracker.',
        variant: 'success',
      });
      delayedNavigate('/');
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 font-semibold text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary shadow-glow">
              <Code2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <span>LeetCode Tracker</span>
          </Link>
        </div>

        <Card className="border-2">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>Start your coding journey now</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">

                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className={errors.username ? 'border-destructive' : ''} />
                {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}

                <Label htmlFor="name">Full Name</Label>
                <ValidatedInput
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (showErrors) {
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.name;
                        return next;
                      });
                    }
                  }}
                  error={errors.name}
                  showError={showErrors && !!errors.name}
                />

              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>

                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={errors.email ? 'border-destructive' : ''} />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={errors.password ? 'border-destructive' : ''} />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="leetcodeUsername">LeetCode Username</Label>
                <Input id="leetcodeUsername" value={leetcodeUsername} onChange={(e) => setLeetcodeUsername(e.target.value)} />

                <ValidatedInput
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (showErrors) {
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.email;
                        return next;
                      });
                    }
                  }}
                  error={errors.email}
                  showError={showErrors && !!errors.email}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leetcodeUsername">LeetCode Username</Label>
                <ValidatedInput
                  id="leetcodeUsername"
                  type="text"
                  placeholder="your_leetcode_username"
                  value={leetcodeUsername}
                  onChange={(e) => {
                    setLeetcodeUsername(e.target.value);
                    if (showErrors) {
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.leetcodeUsername;
                        return next;
                      });
                    }
                  }}
                  error={errors.leetcodeUsername}
                  showError={showErrors && !!errors.leetcodeUsername}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <ValidatedInput
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (showErrors) {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.password;
                          return next;
                        });
                      }
                    }}
                    error={errors.password}
                    showError={showErrors && !!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

              </div>

              <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Sign Up'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;