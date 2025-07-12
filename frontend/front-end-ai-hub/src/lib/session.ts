'use server'
import {cookies} from 'next/headers'
import * as jwt from 'jsonwebtoken'

interface UserPayload {
    userId: string;
    email: string;
}


export async function getCurrentUser(): Promise<UserPayload | null > {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    
    if(!token) {
        return null;
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
        return { userId: decoded.userId, email: decoded.email};
    }catch(error){
        console.error('Invalid token: ', error);
        return null;
    }
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete('access_token')
}