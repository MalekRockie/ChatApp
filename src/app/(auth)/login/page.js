import AuthForm from '../AuthForm';

export default function LoginPage(){

    const handleLogin = ()=>{
        console.log("Login clicked");
    };

    return (
        <main className="min-h-screen grid place-items-center">
            <AuthForm
                type="login"
                // onSubmit={handleLogin}
                />
        </main>
    )
}