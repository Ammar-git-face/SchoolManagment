'use client';
import Link from 'next/link';

const Logout = () => {
    return ( 
        <div>
            {/* Wrap the path in quotes so it's a string, and use href */}
            <Link href="/component/login">logout</Link>
        </div>
    );
}

export default Logout;