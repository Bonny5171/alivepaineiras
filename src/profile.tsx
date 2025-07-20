import Profile from '@/components/Profile'
import { getLogout } from '@/providers/AuthProvider'
import React from 'react'

export default function profile() {
    const logout = getLogout()
    return (
        <Profile
            onLogout={() => { logout() }}
        ></Profile>
    )
}