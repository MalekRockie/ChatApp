'use client'

import AuthForm from "../AuthForm";
import supabase from "@/lib/supabase";

export default function RegisterPage() {
    const handleRegister = async (email, password) => {
        const {error} = await supabase.auth.signUp({
            email, 
            password,
        });
        if (error) alert(error.message);
        else alert('Should be good to login now!')
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