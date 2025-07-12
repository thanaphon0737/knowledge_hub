'use client';

 import { logoutAction } from '@/app/actions';
import { Button } from "@mui/material"
 export default function LogoutButton() {
     return (
         <form action={logoutAction}>
             <Button type="submit" variant='outlined'>Logout</Button>
         </form>
     );
 }