// Créer un nouveau fichier : frontend/src/components/pages/UserSettings.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from './Layout';
import Card from './Card';
import Button from './Button';
import YearTypeSelector from './YearTypeSelector';

const UserSettings = () => {
  const navigate = useNavigate();

  return (
    <Layout 
      title="Paramètres utilisateur"
      breadcrumbs={[
        { label: 'Tableau de bord', href: '/dashboard' },
        { label: 'Paramètres' }
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>

        {/* Section Type d'année */}
        <Card title="Préférences de calendrier" className="mb-6">
          <YearTypeSelector />
        </Card>

        {/* Autres paramètres futurs */}
        <Card title="Paramètres généraux" className="mb-6">
          <div className="text-sm text-gray-500">
            Autres paramètres à venir...
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default UserSettings;