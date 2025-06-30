'use client';

import { useState } from 'react';

export default function AuthForm({ type, onSubmit }) {
    const [email, setEmail ] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div className='w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow'>
            <h1 className='text-2xl font-bold'>
                {type === 'login' ? 'Login' : 'Register'}
            </h1>
            <input
                type="email"
                placeholder='Email'
                className='w-full p-2 mb-4 border rounded'
                value={email}
                required
            />
            <input
                type="password"
                placeholder='Passwrod'
                className='w-full p-2 mb-4 border rounded'
                value={password}
                required
            />
            <button
                type='submit'
                className='w-full p-2 bg-blue-600 text-white rounded hovr:bg-blue-700'>
                {type === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
        </div>
    )
}