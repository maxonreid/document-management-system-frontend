'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold text-primary-blue">
              {t('common.appName')}
            </CardTitle>
            <CardDescription className="text-text-secondary">
              {t('auth.createAccount')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-text-secondary">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link 
                href="/login" 
                className="font-medium text-primary-blue hover:underline"
              >
                {t('auth.signInHere')}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
