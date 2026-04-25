import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Le Choc de la Retraite — Simulateur',
  description:
    'Découvrez le véritable impact financier de votre retraite. Données officielles CNAV et COR.',
  openGraph: {
    title: 'Le Choc de la Retraite',
    description: 'Votre pension va vous surprendre — et pas dans le bon sens.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
