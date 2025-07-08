'use client'

import AuthForm from "../../components/auth/AuthForm";
import supabase from "@/lib/supabase";

export default function RegisterPage() {
    const handleRegister = async (email, password) => {
        const {error} = await supabase.auth.signUp({
            email, 
            password,
        });
        if (error) alert(error.message);
        else
        { 
            alert('Should be good to login now!')
            window.location.href = "/login";
        }
    };

    return (
        <main className="min-h-screen grid place-items-center">
            <AuthForm
                type="Register"
                onSubmit={handleRegister}
            />
        </main>
    )
}