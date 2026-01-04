"use client";

import React, { useState } from "react";
import { Loader2, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PrimaryCtaButton } from "@/components/ui/primary-cta-button";
import { Button } from "@/components/ui/button";

interface LoginFormProps {
    onSubmit: (e: React.FormEvent, type: 'magic' | 'password', data: any) => Promise<void>;
    loading: boolean;
    loginMethod: 'email' | 'password';
    setLoginMethod: (m: 'email' | 'password' | 'qr') => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading, loginMethod, setLoginMethod }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const type = loginMethod === 'email' ? 'magic' : 'password';
        onSubmit(e, type, { email, password });
    };

    if (loginMethod === 'email') {
        return (
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                    <Label htmlFor="email-magic" className="sr-only">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="email"
                            id="email-magic"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10 h-11"
                            disabled={loading}
                        />
                    </div>
                </div>
                <PrimaryCtaButton type="submit" disabled={loading} className="w-full h-12">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Magic Link"}
                </PrimaryCtaButton>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
                <Label htmlFor="email-pass" className="sr-only">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="email"
                        id="email-pass"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 h-11"
                        disabled={loading}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="password" className="sr-only">Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="password"
                        id="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 h-11"
                        disabled={loading}
                    />
                </div>
            </div>
            <PrimaryCtaButton type="submit" disabled={loading} className="w-full h-12">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log In"}
            </PrimaryCtaButton>
            <div className="text-center">
                <Button type="button" variant="link" size="sm" onClick={() => setLoginMethod('email')}>
                    Forgot Password? Use Magic Link
                </Button>
            </div>
        </form>
    );
};
