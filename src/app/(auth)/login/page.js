'use client'

import AuthForm from '../AuthForm';
import supabase from '../../../lib/supabase';


export default function LoginPage() {
    const handleLogin = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        console.log("Login clicked");
        if (error) alert(error.message);
        else window.location.href = "/";
    };

    return (
        <main className="min-h-screen grid place-items-center">
            <AuthForm
                type="login"
                onSubmit={handleLogin}
            />
        </main>
    );
}