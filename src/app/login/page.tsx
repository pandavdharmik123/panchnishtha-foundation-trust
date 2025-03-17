'use client';

import LoginForm from '@/components/LoginForm';

export default function LoginPage() {

    return (
        <div className='login-container'>
            <div className='background-image'></div>
            <div className='secondary-background'></div>
            <LoginForm />
            <footer className="footer-section">
                © 2025 Panchnishtha Foundation Trust. All rights reserved. | Privacy
            </footer>
        </div>
    );
}
