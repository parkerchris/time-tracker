import { NextAuthOptions } from "next-auth";
import NextAuth from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from "@/lib/prisma";

const authOption: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
        })
    ],
    callbacks: {
        async signIn({ account, profile }) {

            if (!profile?.email) {
                throw new Error('No profile')
            }

            const user = await prisma.user.upsert({
                where: {
                    email: profile.email
                },
                create: {
                    email: profile.email,
                    name: profile.name,
                    avatar: ( profile as any ).picture,
                    tenant: {
                        create: {}
                    }
                },
                update: {
                    name: profile.name,
                    avatar: ( profile as any ).picture,
                },
            })

            console.log('user', user)

            return true
        }
    }
}

const handler = NextAuth(authOption)
export { handler as GET, handler as POST }